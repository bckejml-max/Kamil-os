import {store} from './state.js';
import {buildFinanceCommand258,openFinanceCommand258} from './financeCommand258.js';

const VERSION=467;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=x=>Number.isFinite(Number(x))?Number(x):0;
const money=x=>`${Math.round(num(x)).toLocaleString('cs-CZ')} Kč`;
const focusApi=()=>window.__KAMIL_FOCUS_QUEUE335__||null;
const execApi=()=>window.__KAMIL_EXECUTION_STATE364__||null;
const oppApi=()=>window.__KAMIL_OPPORTUNITY370__||null;
const isTodayEvent=e=>{const d=e?.detail;return !d||d==='today'||d?.view==='today'};

function ensureCss(){
  if(document.querySelector('link[data-command-center467-css]'))return;
  const l=document.createElement('link');l.rel='stylesheet';l.href='./commandCenter467.css';l.dataset.commandCenter467Css='1';document.head.appendChild(l);
}
function priority(queue,execution){
  const due=execution?.dueFollowups?.[0]||null;
  const now=execution?.groups?.NOW?.[0]||execution?.now||queue?.[0]||null;
  const x=due||now;
  if(!x)return null;
  const why=due?`Follow-up je připravený k akci${x.waitingFor?` · čekáš na ${x.waitingFor}`:''}.`:Number(x.score)>=120?'Nejvyšší urgentní položka napříč OS.':Number(x.score)>=95?'Silná dnešní priorita podle termínu a dopadu.':x.reason||'Nejlepší další krok z aktuální fronty.';
  return{...x,why,kind:due?'FOLLOW_UP':'NEXT_ACTION'};
}
function greeting(){const h=new Date().getHours();return h<11?'Ranní briefing':h<18?'Dnešní briefing':'Večerní přehled'}
function buildModel(){
  if(!focusApi()?.model)focusApi()?.refresh?.();
  if(!execApi()?.model)execApi()?.refresh?.();
  const queue=focusApi()?.model?.queue||[];
  const execution=execApi()?.model||null;
  const finance=buildFinanceCommand258(store.get());
  const opportunity=oppApi()?.model||oppApi()?.refresh?.()||null;
  const people=execution?.waitingPeople||[];
  const best=priority(queue,execution);
  const due=execution?.dueFollowups||[];
  const counts=execution?.counts||{NOW:0,WAITING:0,RECHECK:0,IGNORE:0};
  const forecast30=finance.forecast?.find(x=>x.days===30)?.balance??finance.cash;
  const forecast90=finance.forecast?.find(x=>x.days===90)?.balance??finance.cash;
  return{version:VERSION,greeting:greeting(),best,queue,execution,due,people,finance,opportunity,counts,forecast30,forecast90,generatedAt:new Date().toISOString()};
}
function anchor(){
  const section=document.querySelector('#view-today');if(!section)return null;
  let host=section.querySelector('[data-command-center-anchor467]');
  if(!host){host=document.createElement('div');host.dataset.commandCenterAnchor467='1';const cockpit=section.querySelector('[data-today-cockpit-anchor363]');cockpit?section.insertBefore(host,cockpit):section.prepend(host)}
  return host;
}
function priorityHtml(m){
  const x=m.best;
  if(!x)return `<div class="os467-primary calm"><div><small>CO UDĚLAT TEĎ?</small><h2>Nic urgentního.</h2><p>OS nenašel silnou okamžitou akci. Můžeš pracovat podle běžného plánu.</p></div></div>`;
  return `<div class="os467-primary ${x.kind==='FOLLOW_UP'?'follow':''}"><div class="os467-rank">1</div><div><small>${x.kind==='FOLLOW_UP'?'FOLLOW-UP TEĎ':'CO UDĚLAT TEĎ?'} · ${esc(x.label||'Priorita')}</small><h2>${esc(x.title)}</h2><p>${esc(x.why)}</p><span>${esc(x.reason||'')}</span></div><button type="button" data-os467-open="${esc(x.key||'')}">Řešit</button></div>`;
}
function briefingHtml(m){
  const top=m.queue.slice(0,3),opp=m.opportunity?.best;
  return `<article class="os467-card os467-brief"><header><div><small>BRIEFING</small><h3>${esc(m.greeting)}</h3></div><b>${m.counts.NOW||0} teď</b></header><div class="os467-metrics"><span><b>${m.due.length}</b><small>follow-up</small></span><span><b>${m.counts.WAITING||0}</b><small>čekám</small></span><span><b>${top.length}</b><small>top kroky</small></span></div>${opp?`<p><strong>Nejlepší kapitálová příležitost:</strong> ${esc(opp.domain)} · ${esc(opp.name||opp.label)} · score ${num(opp.score)}/100</p>`:'<p>Žádný mimořádně silný kapitálový signál.</p>'}</article>`;
}
function followupHtml(m){
  const rows=m.due.slice(0,3);
  return `<article class="os467-card"><header><div><small>AUTOMAT</small><h3>Follow-upy</h3></div><b>${m.due.length} k řešení</b></header>${rows.length?`<div class="os467-list">${rows.map(x=>`<div class="os467-row"><span><strong>${esc(x.title)}</strong><small>${x.waitingFor?`Čekáš na ${esc(x.waitingFor)} · `:''}${num(x.waitingAgeDays)} d od kontaktu</small></span>${x.executionId&&x.waitingFor?`<button type="button" data-os467-contact="${esc(x.executionId)}">Kontakt proběhl</button>`:''}</div>`).join('')}</div>`:'<p class="os467-ok">Žádný follow-up není po termínu.</p>'}</article>`;
}
function financeHtml(m){
  const f=m.finance,risk=f.concentration?.length||0;
  return `<article class="os467-card"><header><div><small>FINANCIAL COCKPIT</small><h3>Peníze</h3></div><button type="button" data-os467-finance>Detail</button></header><div class="os467-money"><div><small>Čisté jmění</small><b>${money(f.netWorth)}</b></div><div><small>Volný kapitál</small><b>${money(f.deployable)}</b></div></div><div class="os467-metrics"><span><b>${money(f.cash)}</b><small>hotovost</small></span><span><b>${money(m.forecast30)}</b><small>za 30 dní</small></span><span><b>${money(m.forecast90)}</b><small>za 90 dní</small></span></div><p>${risk?`${risk} koncentrační ${risk===1?'riziko':'rizika'} k review.`:'Bez výrazné koncentrace portfolia.'}</p></article>`;
}
function peopleHtml(m){
  const rows=m.people.slice(0,5);
  return `<article class="os467-card"><header><div><small>360° OSOBY</small><h3>Na koho čekám</h3></div><b>${m.people.length} lidí</b></header>${rows.length?`<div class="os467-people">${rows.map(p=>`<button type="button" data-os467-person="${esc(p.name)}"><span><strong>${esc(p.name)}</strong><small>${p.count} ${p.count===1?'věc':'věci'} · nejdéle ${num(p.oldestDays)} d</small></span><b>${p.due?`${p.due} k urgenci`:'Detail'}</b></button>`).join('')}</div>`:'<p class="os467-ok">Na nikoho teď evidovaně nečekáš.</p>'}</article>`;
}
function topHtml(m){return `<div class="os467-core-top" data-os467-core-top><div class="os467-head"><div><small>KAMIL OS · 467</small><h1>Command Center</h1><p>Jedno rozhodnutí, briefing, follow-upy, finance a lidé.</p></div><span>${new Date().toLocaleDateString('cs-CZ',{day:'numeric',month:'numeric'})}</span></div>${priorityHtml(m)}</div>`}
function coreGridHtml(m){return `<div class="os467-core-grid" data-os467-core-grid>${briefingHtml(m)}${followupHtml(m)}${financeHtml(m)}${peopleHtml(m)}</div>`}
function html(m){return `<section class="os467" data-command-center467-root>${topHtml(m)}<div class="os467-grid">${coreGridHtml(m)}</div></section>`}
function openAction(key){return focusApi()?.open?.(key,focusApi()?.model)||false}
function openPerson(name){
  const needle=String(name||'').trim().toLocaleLowerCase('cs-CZ');
  const items=(execApi()?.model?.groups?.WAITING||[]).filter(x=>String(x.waitingFor||'').trim().toLocaleLowerCase('cs-CZ')===needle);
  const body=items.map(x=>`<div class="os303-row"><span><b>${esc(x.title)}</b><small>${esc(x.reason||'')} · ${num(x.waitingAgeDays)} d bez kontaktu</small></span>${x.followupDue?'<strong>K URGENCI</strong>':''}</div>`).join('')||'<div class="os467-ok">Žádná otevřená čekající věc.</div>';
  window.dispatchEvent(new CustomEvent('kamil:detail-drawer',{detail:{title:`360° · ${name}`,html:`<div class="os303-list">${body}</div>`}}));
  return items;
}
function syncOwned(root,selector,nextHtml){
  const current=root.querySelector(selector);
  const holder=document.createElement('div');holder.innerHTML=nextHtml;const next=holder.firstElementChild;
  if(!current){selector==='[data-os467-core-top]'?root.prepend(next):root.querySelector('.os467-grid')?.prepend(next);return true}
  if(current.outerHTML===next.outerHTML)return false;
  current.replaceWith(next);return true;
}
function render(){
  const host=anchor();if(!host)return false;
  const m=buildModel(),first=!window.__KAMIL_COMMAND_CENTER467__;
  let root=host.querySelector('[data-command-center467-root]'),changed=false;
  if(!root){host.innerHTML=html(m);root=host.querySelector('[data-command-center467-root]');changed=true}
  else{
    changed=syncOwned(root,'[data-os467-core-top]',topHtml(m))||changed;
    changed=syncOwned(root,'[data-os467-core-grid]',coreGridHtml(m))||changed;
  }
  window.__KAMIL_COMMAND_CENTER467__={version:VERSION,healthy:true,mounted:!!root,model:m,refresh:renderSafe,openAction,openPerson,at:Date.now()};
  document.documentElement.dataset.commandCenter467='1';
  if(first||changed)window.dispatchEvent(new CustomEvent('kamil:command-center467-updated',{detail:{version:VERSION,changed}}));
  return true;
}
function renderSafe(){try{return render()}catch(error){console.error('[commandCenter467]',error);window.__KAMIL_COMMAND_CENTER467__={version:VERSION,healthy:false,error:String(error?.message||error),refresh:renderSafe,at:Date.now()};return false}}
let timer=0,bound=false;
const schedule=(delay=80)=>{clearTimeout(timer);timer=setTimeout(renderSafe,delay)};
export function installCommandCenter467(){
  ensureCss();document.documentElement.dataset.commandCenter467='1';
  if(!bound){
    bound=true;
    document.addEventListener('click',e=>{
      const action=e.target.closest?.('[data-os467-open]');if(action){e.preventDefault();openAction(action.dataset.os467Open);return}
      const contact=e.target.closest?.('[data-os467-contact]');if(contact){e.preventDefault();execApi()?.markContact?.(contact.dataset.os467Contact);schedule(20);return}
      const finance=e.target.closest?.('[data-os467-finance]');if(finance){e.preventDefault();openFinanceCommand258();return}
      const person=e.target.closest?.('[data-os467-person]');if(person){e.preventDefault();openPerson(person.dataset.os467Person);return}
    });
    for(const event of ['kamil:execution-state364-updated','kamil:manager341-updated','kamil:opportunity370-updated','kamil:xtb-decision368-updated','kamil:ticket-decision369-updated'])window.addEventListener(event,()=>schedule(30));
    window.addEventListener('kamil:view-change',e=>{if(isTodayEvent(e))schedule(30)});
    window.addEventListener('focus',()=>schedule(40));
    store.subscribe?.(()=>schedule());
  }
  renderSafe();
  setTimeout(()=>schedule(20),700);
  setTimeout(()=>schedule(20),1700);
}
