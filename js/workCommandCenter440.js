import {store} from './state.js';
import {h,money,modal} from './utils.js';

const A=v=>Array.isArray(v)?v:[];
const N=v=>Number(v||0);
const U=v=>String(v||'').toUpperCase();
const CLOSED=/HOTOV|ARCHIV|DONE|CLOSED|RESOLVED|PAID|SOLD/;
const open=x=>!CLOSED.test(U(x?.status||x?.workflow));
const has=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v));
const num=v=>has(v)?Math.max(0,Number(v)):null;
const dateMs=v=>{const t=Date.parse(v||'');return Number.isFinite(t)?t:null};
const dayDiff=v=>{const t=dateMs(v);if(t===null)return null;const a=new Date();a.setHours(0,0,0,0);const b=new Date(t);b.setHours(0,0,0,0);return Math.round((b-a)/86400000)};
const measure=fn=>{const t=performance.now(),value=fn(),elapsed=Math.round((performance.now()-t)*10)/10;window.__KAMIL_WORK_440_LAST__={ms:elapsed,at:Date.now()};return{value,ms:elapsed}};

function monthlyDuties(s={}){
 const now=new Date(),day=now.getDate(),last=new Date(now.getFullYear(),now.getMonth()+1,0).getDate(),ym=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`,done=s.recurringDuties?.done||{};
 return [
  {key:'issued-invoice-concepts',title:'Koncepty faktur vydaných',dueDay:1},
  {key:'project-card',title:'Aktualizace karty zakázky',dueDay:20},
  {key:'supplier-invoicing',title:'Fakturace na dodavatele',dueDay:25},
  {key:'travel-attendance',title:'Cesták + docházka',dueDay:last}
 ].map(x=>{const isDone=!!(done[`${ym}:${x.key}`]||done[x.key]);const delta=x.dueDay-day;return{...x,done:isDone,delta,status:isDone?'HOTOVO':delta<0?'PO TERMÍNU':delta===0?'DNES':delta<=3?'BRZY':'ČEKÁ'}});
}

function projectRows(s={}){
 const tasks=A(s.tasks).filter(open);
 return A(s.projects).filter(open).map(p=>{
  const linked=tasks.filter(t=>t.projectId===p.id),overdue=linked.filter(t=>{const d=dayDiff(t.due||t.dueAt);return d!==null&&d<0}).length,due=dayDiff(p.deadline||p.due),risk=U(p.risk||'LOW'),m=p.money&&typeof p.money==='object'?p.money:{};
  const contract=num(m.contractValue),approved=num(m.approvedChanges),pending=num(m.pendingClaims),invoiced=num(m.invoiced),paid=num(m.paid),secured=contract===null&&approved===null?null:N(contract)+N(approved),receivable=invoiced===null||paid===null?null:Math.max(0,invoiced-paid),unbilled=secured===null||invoiced===null?null:Math.max(0,secured-invoiced);
  let score=100;const reasons=[];
  if(risk==='HIGH'){score-=30;reasons.push('vysoké riziko')}else if(risk==='MEDIUM'){score-=12;reasons.push('střední riziko')}
  if(due!==null&&due<0){score-=30;reasons.push(`deadline ${Math.abs(due)} d po termínu`)}else if(due!==null&&due<=7){score-=15;reasons.push(`deadline za ${due} d`)}
  if(overdue){score-=Math.min(30,overdue*8);reasons.push(`${overdue} úkolů po termínu`)}
  if(!String(p.next||'').trim()){score-=18;reasons.push('chybí další krok')}
  if(!String(p.owner||'').trim()){score-=8;reasons.push('chybí owner')}
  if(N(pending)>0){score-=Math.min(12,Math.ceil(N(pending)/250000));reasons.push('otevřené ZL / claimy')}
  if(N(receivable)>0){score-=Math.min(10,Math.ceil(N(receivable)/250000));reasons.push('nevybraná fakturace')}
  score=Math.max(0,Math.min(100,score));
  return{id:p.id,name:p.name||'Zakázka',owner:p.owner||null,score,status:score<50?'ZÁSAH':score<70?'RIZIKO':score<85?'SLEDOVAT':'OK',due,overdue,openTasks:linked.length,pending:N(pending),receivable:N(receivable),unbilled:N(unbilled),reasons,financialCoverage:[contract,approved,pending,invoiced,paid].filter(x=>x!==null).length};
 }).sort((a,b)=>a.score-b.score||b.pending-a.pending||b.receivable-a.receivable);
}

function changeRows(s={}){
 const src=A(s.changeOrders).length?A(s.changeOrders):A(s.zl);
 return src.filter(open).map(x=>{
  const quoted=num(x.quoted??x.quotedAmount??x.amount??x.value??x.price),approved=num(x.approved??x.approvedAmount),invoiced=num(x.invoiced??x.invoicedAmount),status=U(x.status||'OPEN');
  const approvalOpen=quoted===null?0:Math.max(0,quoted-N(approved)),billingOpen=approved===null?0:Math.max(0,approved-N(invoiced));
  return{name:x.name||x.title||x.number||x.code||'ZL',project:x.projectName||x.project||null,quoted:N(quoted),approved:N(approved),invoiced:N(invoiced),approvalOpen,billingOpen,status,exposure:approvalOpen+billingOpen};
 }).sort((a,b)=>b.exposure-a.exposure);
}

function waitingRows(s={}){
 return [...A(s.directorBook?.waiting),...A(s.delegations)].filter(open).map(x=>{const due=dayDiff(x.due||x.nextFollowUpAt);const at=dateMs(x.lastContactAt||x.updatedAt||x.createdAt),age=at===null?null:Math.max(0,Math.floor((Date.now()-at)/86400000));return{title:x.title||x.person||x.name||'Waiting For',person:x.person||x.owner||'',due,age,urgent:due!==null?due<=1:(age!==null&&age>=5)}}).sort((a,b)=>Number(b.urgent)-Number(a.urgent)||(a.due??999)-(b.due??999)||(b.age??0)-(a.age??0));
}

export function workCommandCenter440(s=store.get()){
 const projects=projectRows(s),changes=changeRows(s),waiting=waitingRows(s),duties=monthlyDuties(s),tasks=A(s.tasks).filter(open),overdue=tasks.filter(x=>{const d=dayDiff(x.due||x.dueAt);return d!==null&&d<0}).length;
 const changeQuoted=changes.reduce((a,x)=>a+x.quoted,0),changeApproved=changes.reduce((a,x)=>a+x.approved,0),changeInvoiced=changes.reduce((a,x)=>a+x.invoiced,0),changeExposure=changes.reduce((a,x)=>a+x.exposure,0),projectPending=projects.reduce((a,x)=>a+x.pending,0),receivable=projects.reduce((a,x)=>a+x.receivable,0),unbilled=projects.reduce((a,x)=>a+x.unbilled,0);
 const risks=[];
 projects.filter(x=>x.score<85).slice(0,4).forEach(x=>risks.push({kind:'Zakázka',title:x.name,score:110-x.score,detail:x.reasons.slice(0,3).join(' · ')||x.status}));
 duties.filter(x=>['PO TERMÍNU','DNES','BRZY'].includes(x.status)).forEach(x=>risks.push({kind:'Termín',title:x.title,score:x.status==='PO TERMÍNU'?100:x.status==='DNES'?95:82,detail:x.status}));
 waiting.filter(x=>x.urgent).slice(0,3).forEach(x=>risks.push({kind:'Waiting For',title:x.title,score:88+(x.due!==null&&x.due<0?5:0),detail:x.due!==null?(x.due<0?`${Math.abs(x.due)} d po follow-up termínu`:x.due===0?'follow-up dnes':`follow-up za ${x.due} d`):`${x.age||0} d bez pohybu`}));
 if(changeExposure>0)risks.push({kind:'ZL',title:'Otevřená finanční expozice ZL',score:90,detail:`${money(changeExposure)} čeká na schválení nebo fakturaci`});
 if(receivable>0)risks.push({kind:'Fakturace',title:'Nevybraná fakturace',score:87,detail:`${money(receivable)} vyfakturováno, ale podle uložených dat nezaplaceno`});
 if(unbilled>0)risks.push({kind:'Fakturace',title:'Schválená hodnota bez fakturace',score:85,detail:`${money(unbilled)} podle uložených projektových dat`});
 const topRisks=risks.sort((a,b)=>b.score-a.score).slice(0,6),status=topRisks.some(x=>x.score>=95)||projects.some(x=>x.score<50)?'ZÁSAH':topRisks.length?'SLEDOVAT':'KLID';
 return{status,projects,changes,waiting,duties,overdue,topRisks,finance:{changeQuoted,changeApproved,changeInvoiced,changeExposure,projectPending,receivable,unbilled},coverage:{projects:projects.length,projectsWithMoney:projects.filter(x=>x.financialCoverage>0).length,changes:changes.length}};
}

const riskRow=x=>`<div class="row"><div><b>${h(x.title)}</b><div class="muted">${h(x.kind)} · ${h(x.detail)}</div></div><span class="status ${x.score>=95?'bad':x.score>=85?'warn':'good'}">${x.score}</span></div>`;
const projectRow=x=>`<div class="row"><div><b>${h(x.name)}</b><div class="muted">${x.owner?h(x.owner)+' · ':''}${x.reasons.slice(0,3).map(h).join(' · ')||'bez zjevného rizika'}${x.pending?` · ZL ${money(x.pending)}`:''}${x.receivable?` · pohledávka ${money(x.receivable)}`:''}</div></div><b class="${x.score<50?'bad':x.score<70?'warn':''}">${x.score}/100</b></div>`;
const changeRow=x=>`<div class="row"><div><b>${h(x.name)}</b><div class="muted">${x.project?h(x.project)+' · ':''}naceněno ${money(x.quoted)} · schváleno ${money(x.approved)} · fakturováno ${money(x.invoiced)}</div></div><b class="${x.exposure?'warn':''}">${x.exposure?money(x.exposure):'OK'}</b></div>`;
const waitingRow=x=>`<div class="row"><div><b>${h(x.title)}</b><div class="muted">${x.person?h(x.person)+' · ':''}${x.due!==null?(x.due<0?`${Math.abs(x.due)} d po termínu`:x.due===0?'follow-up dnes':`follow-up za ${x.due} d`):x.age!==null?`${x.age} d čekání`:'bez termínu'}</div></div>${x.urgent?'<b class="warn">FOLLOW-UP</b>':''}</div>`;

export async function openWorkCommandCenter440(){
 const {value:x,ms}=measure(()=>workCommandCenter440());
 const body=`<div class="metric-strip"><div class="metric"><span>Režim</span><b>${h(x.status)}</b></div><div class="metric"><span>Zakázky</span><b>${x.projects.length}</b></div><div class="metric"><span>Úkoly po termínu</span><b>${x.overdue}</b></div><div class="metric"><span>Waiting For</span><b>${x.waiting.length}</b></div></div><div class="card"><div class="eyebrow">TOP RIZIKA / KDE HOŘÍ PENÍZE NEBO TERMÍN</div>${x.topRisks.map(riskRow).join('')||'<div class="empty">Podle uložených dat nic akutně nehoří.</div>'}</div><div class="card"><div class="eyebrow">ZAKÁZKY / HEALTH</div>${x.projects.slice(0,6).map(projectRow).join('')||'<div class="empty">Nejsou uložené aktivní zakázky.</div>'}</div><div class="card"><div class="eyebrow">ZL / FINANČNÍ EXPOZICE</div><div class="row"><span>Naceněno</span><b>${money(x.finance.changeQuoted)}</b></div><div class="row"><span>Schváleno</span><b>${money(x.finance.changeApproved)}</b></div><div class="row"><span>Vyfakturováno</span><b>${money(x.finance.changeInvoiced)}</b></div><div class="row"><span>Otevřená expozice</span><b class="${x.finance.changeExposure?'warn':''}">${money(x.finance.changeExposure)}</b></div>${x.changes.slice(0,5).map(changeRow).join('')||'<div class="empty">Samostatné ZL nejsou uložené.</div>'}</div><div class="card"><div class="eyebrow">FAKTURACE / CASH RISK</div><div class="row"><span>Project pending claims</span><b>${money(x.finance.projectPending)}</b></div><div class="row"><span>Nevybraná fakturace</span><b>${money(x.finance.receivable)}</b></div><div class="row"><span>Schváleno, nefakturováno</span><b>${money(x.finance.unbilled)}</b></div><div class="muted">Finanční pokrytí: ${x.coverage.projectsWithMoney}/${x.coverage.projects} aktivních zakázek má uložená money data.</div></div><div class="card"><div class="eyebrow">WAITING FOR / FOLLOW-UP</div>${x.waiting.filter(w=>w.urgent).slice(0,6).map(waitingRow).join('')||'<div class="empty">Žádný akutní follow-up.</div>'}</div><div class="card"><div class="eyebrow">PRAVIDELNÉ TERMÍNY ŘEDITELE</div>${x.duties.map(d=>`<div class="row"><span>${h(d.title)} · ${d.dueDay}. den</span><b class="${d.status==='PO TERMÍNU'?'bad':d.status==='DNES'||d.status==='BRZY'?'warn':''}">${h(d.status)}</b></div>`).join('')}</div><div class="decision-note">Výpočet ${ms} ms pouze po kliknutí. Přehled používá jen uložená data; chybějící schválení, fakturaci ani náklady si nedomýšlí. Nic neposílá ani nemění.</div>`;
 const choice=await modal('Work Command Center 44.0',body,[{label:'Otevřít Dnes',value:'today'},{label:'Zavřít',value:null,primary:true}]);
 if(choice)window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:choice}));
}
