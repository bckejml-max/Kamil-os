import {store} from './state.js';

const VERSION=600;
const SNAPSHOT_KEY='kamil-os-personal-upgrade600-snapshot';
const SESSION_KEY='kamil-os-personal-upgrade600-session';
const CLOSED=new Set(['DONE','CLOSED','ARCHIVED','RESOLVED','PAID','SOLD','PAYOUT_RECEIVED']);
const N=v=>Number.isFinite(Number(v))?Number(v):0;
const A=v=>Array.isArray(v)?v:[];
const U=v=>String(v||'').toUpperCase();
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=v=>`${Math.round(N(v)).toLocaleString('cs-CZ')} Kč`;
const open=x=>!CLOSED.has(U(x?.status||x?.workflow));
const now=()=>Date.now();
let previousSnapshot=null;
let lastModel=null;
let timer=0;
let bound=false;

function ensureCss(){
  if(document.querySelector('link[data-personal-upgrade600-css]'))return;
  const l=document.createElement('link');
  l.rel='stylesheet';l.href='./personalUpgrade600.css';l.dataset.personalUpgrade600Css='1';
  document.head.appendChild(l);
}
function api(name){return window[name]?.model||null}
function state(){return store.get?.()||{}}
function dueDate(x){const raw=x?.due||x?.dueAt||x?.deadline||x?.date;const t=raw?Date.parse(raw):NaN;return Number.isFinite(t)?t:null}
function priorityScore(x){
  const t=dueDate(x),days=t===null?99:Math.ceil((t-now())/86400000),p=U(x?.priority||x?.importance);
  return (t!==null&&days<0?160:t!==null&&days===0?145:t!==null&&days<=2?120:0)+(p==='HIGH'?35:p==='MEDIUM'?15:0)+N(x?.score||0);
}
function sourceModels(){return{
  command:api('__KAMIL_COMMAND_CENTER467__'),
  morning:api('__KAMIL_MORNING_DIRECTOR483__'),
  execution:api('__KAMIL_EXECUTION_STATE364__'),
  tickets:api('__KAMIL_TICKET_DECISION369__'),
  property:api('__KAMIL_PROPERTY_DECISION472__'),
  investment:api('__KAMIL_INVESTMENT_BATTLE480__')
}}
function taskActions(s){
  return [...A(s.tasks),...A(s.personalAdmin?.items),...A(s.personalInbox?.items)]
    .filter(open)
    .map(x=>({key:x.id||x.title,title:x.title||x.name||'Úkol',kind:'TASK',label:'ÚKOL',reason:x.due?`Termín ${new Date(x.due).toLocaleDateString('cs-CZ')}`:(x.reason||x.category||'Otevřená položka'),score:priorityScore(x),view:'today'}))
    .sort((a,b)=>b.score-a.score).slice(0,4)
}
function ticketActions(m){
  return A(m?.rows).filter(x=>!['HOLD','SKIP'].includes(U(x.verdict))).slice(0,4).map(x=>({
    key:x.id,title:x.name,kind:'TICKET',label:x.label||x.verdict,reason:x.reason||`${x.verdict} · confidence ${N(x.confidence)} %`,score:105+N(x.priority),view:'tickets',tone:['SELL','LOWER'].includes(U(x.verdict))?'warn':'good'
  }))
}
function propertyAction(m){
  const x=m?.best;if(!x||!['BUY','NEGOTIATE'].includes(U(x.decision?.code)))return [];
  return [{key:x.id||x.name,title:x.name,kind:'PROPERTY',label:x.decision.action,reason:`Deal Score ${N(x.score)}/100 · net ${(N(x.netYield)*100).toFixed(2).replace('.',',')} %`,score:90+N(x.score),view:'money',tone:U(x.decision.code)==='BUY'?'good':'warn'}]
}
function executionActions(m){
  return A(m?.dueFollowups).slice(0,3).map(x=>({key:x.key||x.executionId||x.title,title:x.title||'Follow-up',kind:'FOLLOWUP',label:'FOLLOW-UP',reason:x.waitingFor?`Čekáš na ${x.waitingFor}`:(x.reason||'Je čas se připomenout.'),score:180+N(x.waitingAgeDays),view:'today',tone:'warn'}))
}
function commandAction(m){
  const x=m?.best;if(!x)return [];
  return [{key:x.key||x.title,title:x.title||'Priorita',kind:'FOCUS',label:'TOP PRIORITA',reason:x.why||x.reason||'Nejlepší další krok podle OS.',score:200+N(x.score),view:'today',tone:'hot'}]
}
function dedupe(rows){const seen=new Set();return rows.filter(x=>{const k=`${x.kind}:${String(x.key||x.title).toLowerCase()}`;if(seen.has(k))return false;seen.add(k);return true})}
function buildActions(s,m){return dedupe([...executionActions(m.execution),...commandAction(m.command),...ticketActions(m.tickets),...propertyAction(m.property),...taskActions(s)]).sort((a,b)=>b.score-a.score).slice(0,7)}
function metrics(s,m){
  const tasks=[...A(s.tasks),...A(s.personalAdmin?.items),...A(s.personalInbox?.items)].filter(open),today=Date.now();
  const overdue=tasks.filter(x=>{const t=dueDate(x);return t!==null&&t<today}).length;
  const ticketRows=A(m.tickets?.rows),ticketActionable=ticketRows.filter(x=>!['HOLD','SKIP'].includes(U(x.verdict))).length;
  return{
    openTasks:tasks.length,overdueTasks:overdue,ticketActionable,waiting:N(m.execution?.counts?.WAITING),bestProperty:N(m.property?.best?.score),netWorth:N(m.command?.finance?.netWorth),deployable:N(m.command?.finance?.deployable)
  }
}
function loadPrevious(){try{return JSON.parse(localStorage.getItem(SNAPSHOT_KEY)||'null')}catch{return null}}
function deltaText(cur,prev){
  if(!prev)return [{tone:'info',text:'První snapshot je připravený. Při další návštěvě uvidíš konkrétní změny.'}];
  const out=[];
  const push=(tone,text)=>out.push({tone,text});
  const d=(k)=>N(cur[k])-N(prev[k]);
  if(d('overdueTasks'))push(d('overdueTasks')>0?'bad':'good',`${d('overdueTasks')>0?'+':''}${d('overdueTasks')} úkolů po termínu`);
  if(d('ticketActionable'))push(d('ticketActionable')>0?'warn':'good',`${d('ticketActionable')>0?'+':''}${d('ticketActionable')} akčních ticket rozhodnutí`);
  if(d('waiting'))push(d('waiting')>0?'warn':'good',`${d('waiting')>0?'+':''}${d('waiting')} čekajících věcí`);
  if(d('bestProperty'))push(d('bestProperty')>0?'good':'warn',`Deal Score nejlepšího bytu ${d('bestProperty')>0?'+':''}${d('bestProperty')} bodů`);
  if(Math.abs(d('netWorth'))>=100)push(d('netWorth')>0?'good':'warn',`Čisté jmění ${d('netWorth')>0?'+':''}${money(d('netWorth'))}`);
  if(!out.length)push('calm','Od minulé návštěvy se v hlavních metrikách nic zásadního nezměnilo.');
  return out.slice(0,4)
}
function ticketSummary(m){
  const c=m?.counts||{},top=m?.top;
  return {buy:N(c.BUY),sell:N(c.SELL),lower:N(c.LOWER),hold:N(c.HOLD),top:top?`${top.label||top.verdict}: ${top.name}`:'Bez akčního signálu'}
}
function propertySummary(m){const x=m?.best;return x?{score:N(x.score),name:x.name,action:x.decision?.action||'—',yield:N(x.netYield)}:{score:0,name:'Žádný kandidát',action:'PŘIDAT DATA',yield:0}}
function buildModel(){
  const s=state(),m=sourceModels(),actions=buildActions(s,m),metric=metrics(s,m),changes=deltaText(metric,previousSnapshot),tickets=ticketSummary(m.tickets),property=propertySummary(m.property),morning=m.morning?.firstBlock||null;
  return{version:VERSION,actions,metric,changes,tickets,property,morning,people:A(m.execution?.waitingPeople),generatedAt:new Date().toISOString()}
}
function actionHtml(x,i){return `<button type="button" class="os600-action ${esc(x.tone||'')}" data-os600-action="${esc(x.key||'')}" data-os600-kind="${esc(x.kind)}" data-os600-view="${esc(x.view||'today')}"><span class="os600-rank">${i+1}</span><span class="os600-action-copy"><small>${esc(x.label)}</small><b>${esc(x.title)}</b><em>${esc(x.reason)}</em></span><span class="os600-go">→</span></button>`}
function changesHtml(rows){return rows.map(x=>`<li class="${esc(x.tone)}"><i></i><span>${esc(x.text)}</span></li>`).join('')}
function html(m){
  const first=m.morning;
  return `<section class="os600" data-personal-upgrade600-root>
    <header class="os600-head"><div><small>KAMIL OS · PERSONAL COCKPIT 600</small><h2>Co řešit</h2><p>Jedno místo pro dnešní priority, změny, vstupenky, reality a rychlé otázky.</p></div><span class="os600-live"><i></i> Živá data OS</span></header>
    ${first?`<div class="os600-brief"><div><small>DENNÍ BRIEFING · ${esc(first.action||'PRVNÍ KROK')}</small><b>${esc(first.title||'Dnešní priorita')}</b><span>${esc(first.reason||'')}</span></div><button type="button" data-os600-view="today">Otevřít dnešek</button></div>`:''}
    <div class="os600-layout">
      <article class="os600-panel os600-priority"><div class="os600-panel-head"><div><small>ACTION CENTER</small><h3>Co řešit teď</h3></div><b>${m.actions.length}</b></div><div class="os600-actions">${m.actions.length?m.actions.map(actionHtml).join(''):'<div class="os600-empty">Nic urgentního. OS nemá žádnou silnou akční položku.</div>'}</div></article>
      <div class="os600-side">
        <article class="os600-panel"><div class="os600-panel-head"><div><small>OD POSLEDNĚ</small><h3>Co se změnilo</h3></div></div><ul class="os600-changes">${changesHtml(m.changes)}</ul></article>
        <article class="os600-panel os600-signals"><div class="os600-panel-head"><div><small>ROZHODOVACÍ ENGINY</small><h3>Silné signály</h3></div></div><button data-os600-view="tickets"><span>Vstupenky</span><b>${m.tickets.buy} BUY · ${m.tickets.sell} SELL · ${m.tickets.lower} SLEVIT</b><small>${esc(m.tickets.top)}</small></button><button data-os600-view="money"><span>Reality</span><b>Deal Score ${m.property.score}/100 · ${esc(m.property.action)}</b><small>${esc(m.property.name)}${m.property.yield?` · net ${(m.property.yield*100).toFixed(2).replace('.',',')} %`:''}</small></button></article>
      </div>
    </div>
    <article class="os600-ai"><div class="os600-ai-head"><div class="os600-ai-mark">K</div><div><small>KAMIL ASSISTANT</small><h3>Zeptej se svého OS</h3></div></div><div class="os600-ai-chips"><button data-os600-query="co dnes řešit">Co dnes řešit?</button><button data-os600-query="vstupenky">Vstupenky</button><button data-os600-query="reality">Nejlepší byt</button><button data-os600-query="peníze">Volný kapitál</button><button data-os600-query="co se změnilo">Co se změnilo?</button></div><form data-os600-form><input data-os600-input autocomplete="off" placeholder="Např. Co dnes hoří? Na koho čekám? Jak vypadají vstupenky?"><button>Zeptat se</button></form><div class="os600-answer" data-os600-answer><span>Umím odpovídat z aktuálních dat Kamil OS. Nic si nevymýšlím mimo uložená data.</span></div></article>
  </section>`
}
function host(){
  const root=document.querySelector('[data-command-center467-root]');if(!root)return null;
  let h=root.querySelector('[data-personal-upgrade600-host]');
  if(!h){h=document.createElement('div');h.dataset.personalUpgrade600Host='1';const morning=root.querySelector('[data-morning-director483-root]');morning?morning.after(h):root.prepend(h)}
  return h
}
function render(){
  const h=host();if(!h)return false;
  const m=buildModel();lastModel=m;
  const current=h.querySelector('[data-personal-upgrade600-root]'),wrap=document.createElement('div');wrap.innerHTML=html(m);const next=wrap.firstElementChild;
  if(!current)h.appendChild(next);else if(current.innerHTML!==next.innerHTML)current.replaceWith(next);
  window.__KAMIL_PERSONAL_UPGRADE600__={version:VERSION,healthy:true,model:m,refresh:renderSafe,ask,at:Date.now()};
  document.documentElement.dataset.personalUpgrade600='1';
  return true
}
function renderSafe(){try{return render()}catch(error){console.error('[personalUpgrade600]',error);window.__KAMIL_PERSONAL_UPGRADE600__={version:VERSION,healthy:false,error:String(error?.message||error),refresh:renderSafe,at:Date.now()};return false}}
function navigate(view){window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:view}));window.dispatchEvent(new CustomEvent('kamil:view-change',{detail:{view,source:'personal-upgrade600'}}))}
function answerNode(){return document.querySelector('[data-personal-upgrade600-root] [data-os600-answer]')}
function reply(title,body,links=[]){const node=answerNode();if(!node)return;node.innerHTML=`<b>${esc(title)}</b><span>${esc(body)}</span>${links.length?`<div>${links.map(x=>`<button type="button" data-os600-view="${esc(x.view)}">${esc(x.label)}</button>`).join('')}</div>`:''}`}
function ask(raw){
  const q=String(raw||'').trim().toLocaleLowerCase('cs-CZ');const m=lastModel||buildModel();
  if(!q){reply('Napiš otázku','Zkus třeba „co dnes řešit“, „vstupenky“, „reality“ nebo „na koho čekám“.');return}
  if(/změn|zmen|nov[eé]ho|od posled/.test(q)){reply('Co se změnilo',m.changes.map(x=>x.text).join(' · '));return}
  if(/ticket|vstupenk|viagogo|prodat|koupit/.test(q)){reply('Vstupenky',`${m.tickets.buy} BUY, ${m.tickets.sell} SELL, ${m.tickets.lower} SLEVIT a ${m.tickets.hold} HOLD. Top signál: ${m.tickets.top}.`,[{view:'tickets',label:'Otevřít vstupenky'}]);return}
  if(/byt|realit|nemovit|deal score/.test(q)){reply('Reality',`${m.property.name}: Deal Score ${m.property.score}/100, verdikt ${m.property.action}${m.property.yield?`, net yield ${(m.property.yield*100).toFixed(2).replace('.',',')} %`:''}.`,[{view:'money',label:'Otevřít Peníze'}]);return}
  if(/pen[ií]z|kapit[aá]l|cash|jm[eě]n[ií]|finance/.test(q)){reply('Peníze',`Čisté jmění ${money(m.metric.netWorth)}. Bezpečně volný kapitál podle současného finančního modelu ${money(m.metric.deployable)}.`,[{view:'money',label:'Otevřít Peníze'}]);return}
  if(/ček|cek|follow|urg/.test(q)){const rows=m.people.slice(0,5);reply('Na koho čekáš',rows.length?rows.map(x=>`${x.name}: ${N(x.count)} věcí`).join(' · '):'OS teď neeviduje žádnou osobu, na kterou čekáš.');return}
  if(/dnes|řešit|resit|hoří|hori|priorit|co teď|co ted/.test(q)){const rows=m.actions.slice(0,4);reply('Co řešit teď',rows.length?rows.map((x,i)=>`${i+1}. ${x.title} — ${x.label}`).join(' · '):'Nic urgentního.');return}
  reply('Kamil Assistant','K téhle formulaci zatím nemám spolehlivý lokální dotaz. Umím: dnešní priority, vstupenky, reality, peníze, změny a čekající osoby.')
}
function saveSnapshotOnce(){
  try{
    if(sessionStorage.getItem(SESSION_KEY))return;
    const m=lastModel||buildModel();localStorage.setItem(SNAPSHOT_KEY,JSON.stringify({...m.metric,at:Date.now()}));sessionStorage.setItem(SESSION_KEY,'1')
  }catch{}
}
function openAction(el){
  const kind=U(el.dataset.os600Kind),key=el.dataset.os600Action,view=el.dataset.os600View||'today';
  if(['FOCUS','FOLLOWUP','TASK'].includes(kind)&&key&&window.__KAMIL_COMMAND_CENTER467__?.openAction?.(key))return;
  navigate(view)
}
function bind(){
  if(bound)return;bound=true;
  document.addEventListener('click',e=>{
    const action=e.target.closest?.('[data-personal-upgrade600-root] [data-os600-action]');if(action){e.preventDefault();openAction(action);return}
    const view=e.target.closest?.('[data-personal-upgrade600-root] [data-os600-view]');if(view){e.preventDefault();navigate(view.dataset.os600View);return}
    const q=e.target.closest?.('[data-personal-upgrade600-root] [data-os600-query]');if(q){e.preventDefault();ask(q.dataset.os600Query);return}
  });
  document.addEventListener('submit',e=>{const f=e.target.closest?.('[data-personal-upgrade600-root] [data-os600-form]');if(!f)return;e.preventDefault();const input=f.querySelector('[data-os600-input]');ask(input?.value);if(input)input.value=''});
  for(const name of ['kamil:command-center467-updated','kamil:morning-director483-updated','kamil:execution-state364-updated','kamil:ticket-decision369-updated','kamil:property-decision472-updated','kamil:investment-battle480-updated'])window.addEventListener(name,()=>schedule(45));
  window.addEventListener('kamil:view-change',e=>{const d=e.detail;if(!d||d==='today'||d?.view==='today')schedule(35)});
  window.addEventListener('focus',()=>schedule(60));
  store.subscribe?.(()=>schedule(90));
}
function schedule(delay=60){clearTimeout(timer);timer=setTimeout(renderSafe,delay)}
export function installPersonalUpgrade600(){
  ensureCss();previousSnapshot=loadPrevious();bind();renderSafe();setTimeout(()=>schedule(20),700);setTimeout(saveSnapshotOnce,2200)
}
