import {store} from './state.js';
import {h,money,modal} from './utils.js';

const A=v=>Array.isArray(v)?v:[];
const U=v=>String(v||'').toUpperCase();
const N=v=>Number(v||0);
const CLOSED=new Set(['DONE','CLOSED','ARCHIVED','RESOLVED','PAID','SOLD','PAYOUT RECEIVED']);
const open=x=>!CLOSED.has(U(x?.status||x?.workflow));
const ms=v=>{const t=Date.parse(v||'');return Number.isFinite(t)?t:null};
const days=v=>{const t=ms(v);return t===null?null:Math.ceil((t-Date.now())/86400000)};
const hoursOld=v=>{const t=ms(v);return t===null?null:Math.max(0,Math.round((Date.now()-t)/3600000))};
const WORK_RE=/zak[aá]zk|faktur|dodavat|cest[aá]k|doch[aá]zk|ředitel|reditel|pks|cpi|zbrojov|\bzl\b|projektov[aá] karta|pracovn/i;
const personal=x=>!WORK_RE.test(`${x?.title||''} ${x?.name||''} ${x?.area||''} ${x?.category||''} ${x?.project||''}`);
const measure=(name,fn)=>{const t=performance.now(),value=fn(),elapsed=Math.round((performance.now()-t)*10)/10;window.__KAMIL_PERSONAL_441_LAST__={name,ms:elapsed,at:Date.now()};return{value,ms:elapsed}};

function taskRows(s){return A(s.tasks).filter(open).filter(personal).map(x=>({kind:'Úkol',title:x.title||x.name||'Úkol',due:x.due||x.dueAt||x.date||null,days:days(x.due||x.dueAt||x.date),priority:N(x.priority),id:x.id||null}));}
function waitingRows(s){return A(s.delegations).filter(open).filter(personal).map(x=>({kind:'Čekám',title:x.title||x.person||x.name||'Waiting for',due:x.due||x.nextFollowUpAt||null,days:days(x.due||x.nextFollowUpAt),priority:N(x.priority||60)}));}
function inboxRows(s){return A(s.inbox).filter(open).filter(personal).map(x=>({kind:'Inbox',title:x.subject||x.title||'Zpráva',priority:U(x.priority)==='HIGH'||x.important===true?88:62}));}
function ticketRows(s){return A(s.ticketBook?.items).filter(x=>['HOLD','LISTED'].includes(U(x.workflow||'HOLD'))).map(x=>{const qty=Math.max(1,N(x.qty||1)),buy=N(x.buy||x.cost||0),list=N(x.listPrice||0),market=N(x.marketPrice||0),checked=x.marketCheckedAt||x.marketAsOf||null,sellBy=x.sellBy||x.sellByAt||x.date||null,marketAge=hoursOld(checked),profit=list*qty-buy;let action='DRŽET';if(!list)action='NACENIT';else if(market&&marketAge!==null&&marketAge<=36&&list>market*1.12)action='PROVĚŘIT CENU';else if(days(sellBy)!==null&&days(sellBy)<=7)action='PRODAT BRZY';return{kind:'Vstupenka',title:x.event||x.name||x.title||'Vstupenka',sellDays:days(sellBy),buy,qty,list,market,marketAge,profit,action};});}
function xtbMeta(s){const positions=A(s.xtbReport?.positions).length?A(s.xtbReport?.positions):A(s.xtbHub?.positions),value=N(s.xtbReport?.czkValue||s.xtbHub?.valueCzk||positions.reduce((a,x)=>a+N(x.valueCzk||x.marketValueCzk||x.value),0)),asOf=s.xtbReport?.asOf||s.xtbHub?.asOf||null,ageHours=hoursOld(asOf);return{positions:positions.slice(0,6),value,ageHours,stale:ageHours===null||ageHours>36};}

export function personalMission441(s=store.get()){
 const tasks=taskRows(s),waiting=waitingRows(s),inbox=inboxRows(s),tickets=ticketRows(s),xtb=xtbMeta(s),c=[];
 tasks.filter(x=>x.days!==null&&x.days<=0).forEach(x=>c.push({...x,score:x.days<0?105+Math.min(15,Math.abs(x.days)):102,why:x.days<0?'Osobní úkol je po termínu.':'Osobní úkol patří na dnešek.'}));
 waiting.filter(x=>x.days!==null&&x.days<=1).forEach(x=>c.push({...x,score:94,why:'Je čas na osobní follow-up.'}));
 tickets.filter(x=>x.action!=='DRŽET').forEach(x=>c.push({...x,score:x.action==='PRODAT BRZY'?98:x.action==='PROVĚŘIT CENU'?90:86,why:'Vstupenka vyžaduje cenové nebo časové rozhodnutí.'}));
 inbox.filter(x=>x.priority>=80).slice(0,3).forEach(x=>c.push({...x,score:x.priority,why:'Důležitá osobní zpráva čeká na rozhodnutí.'}));
 if(xtb.stale)c.push({kind:'XTB',title:'Obnovit XTB data',score:96,why:'Investiční rozhodnutí bez čerstvých dat je zbytečné riziko.'});
 const ranked=c.sort((a,b)=>b.score-a.score),top=ranked.slice(0,3),later=ranked.slice(3,6);
 return{top,later,tasks,waiting,inbox,tickets,xtb,status:top.some(x=>x.score>=105)?'ZÁSAH':top.length?'ŘÍDIT':'KLID'};
}

const row=x=>`<div class="card"><div class="eyebrow">${h(x.kind)}</div><h3>${h(x.title)}</h3><p class="muted"><b>Proč teď:</b> ${h(x.why||'Vyžaduje pozornost.')}</p>${x.action?`<div class="decision-note"><b>${h(x.action)}</b></div>`:''}</div>`;
const later=x=>`<div class="row"><div><b>${h(x.title)}</b><div class="muted">${h(x.kind)} · může počkat</div></div></div>`;

export async function openPersonalMission441(){
 const {value:x,ms}=measure('personalMission441',()=>personalMission441());
 const body=`<div class="metric-strip"><div class="metric"><span>Režim</span><b>${h(x.status)}</b></div><div class="metric"><span>Osobní úkoly</span><b>${x.tasks.length}</b></div><div class="metric"><span>Čekám na</span><b>${x.waiting.length}</b></div><div class="metric"><span>Vstupenky</span><b>${x.tickets.length}</b></div></div><div class="card"><div class="eyebrow">TOP 3 TEĎ / SOUKROMĚ</div>${x.top.map(row).join('')||'<div class="empty">Nic zásadního teď nemusíš řešit.</div>'}</div><div class="card"><div class="eyebrow">CO MŮŽE POČKAT</div>${x.later.map(later).join('')||'<div class="empty">Žádná další výrazná osobní priorita.</div>'}</div><div class="card"><div class="eyebrow">PENÍZE</div><div class="row"><span>XTB hodnota</span><b>${money(x.xtb.value)}</b></div><div class="row"><span>Stáří XTB dat</span><b>${x.xtb.ageHours===null?'—':`${x.xtb.ageHours} h`}</b></div></div><div class="decision-note">Kamil OS 44.1 Personal: práce, zakázky, ZL, fakturace a ředitelské termíny jsou z tohoto přehledu záměrně vyloučené. Výpočet ${ms} ms pouze po kliknutí.</div>`;
 const choice=await modal('Kamil OS / Osobní Mission Control',body,[{label:'Otevřít Peníze',value:'money'},{label:'Otevřít Vstupenky',value:'tickets'},{label:'Zavřít',value:null,primary:true}]);
 if(choice)window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:choice}));
}

export async function openPersonalFinance441(){
 const {value:x,ms}=measure('personalFinance441',()=>personalMission441());
 const body=`<div class="metric-strip"><div class="metric"><span>XTB</span><b>${money(x.xtb.value)}</b></div><div class="metric"><span>Aktivní vstupenky</span><b>${x.tickets.length}</b></div></div><div class="card"><div class="eyebrow">VSTUPENKY / CO PROVĚŘIT</div>${x.tickets.filter(t=>t.action!=='DRŽET').map(t=>`<div class="row"><div><b>${h(t.title)}</b><div class="muted">${t.qty} ks${t.list?` · list ${money(t.list)}`:''}${t.market?` · market ${money(t.market)}`:''}</div></div><b>${h(t.action)}</b></div>`).join('')||'<div class="empty">Nic urgentního.</div>'}</div><div class="decision-note">Pouze osobní finance a vstupenky. ${ms} ms.</div>`;
 const choice=await modal('Peníze + vstupenky / Personal 44.1',body,[{label:'Peníze',value:'money'},{label:'Vstupenky',value:'tickets'},{label:'Zavřít',value:null,primary:true}]);if(choice)window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:choice}));
}
