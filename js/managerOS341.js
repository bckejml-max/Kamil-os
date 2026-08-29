import {store} from './state.js';
import {buildManagerOS324} from './domainOS328.js';

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const closed=x=>['DONE','CLOSED','ARCHIVED','PAID'].includes(String(x?.status||'').toUpperCase());
const dueOf=x=>x?.due||x?.followUpAt||x?.deadline||null;
const titleOf=x=>x?.title||x?.name||'Pracovní úkol';
const pad=n=>String(n).padStart(2,'0');
function localDay(d=new Date()){return new Date(d.getFullYear(),d.getMonth(),d.getDate())}
function monthKey(d=new Date()){return `${d.getFullYear()}-${pad(d.getMonth()+1)}`}
function fmt(d){return new Intl.DateTimeFormat('cs-CZ',{day:'numeric',month:'short'}).format(d)}
function daysBetween(a,b){return Math.round((localDay(b)-localDay(a))/86400000)}
function monthlyDuties(now=new Date()){
 const y=now.getFullYear(),m=now.getMonth(),last=new Date(y,m+1,0).getDate();
 return [
  {id:'invoice-concepts',label:'Koncepty faktur vydaných',day:1,detail:'Vyplnit koncepty faktur vydaných za pobočku.'},
  {id:'job-card',label:'Aktualizace karty zakázky',day:20,detail:'Aktualizovat karty všech aktivních zakázek.'},
  {id:'supplier-invoicing',label:'Fakturace na dodavatele',day:25,detail:'Odeslat dodavatelskou fakturaci nejpozději do 25.'},
  {id:'month-close',label:'Cestovní příkaz + docházka',day:last,detail:'Uzavřít cestovní příkaz a docházku poslední den měsíce.'}
 ].map(x=>({...x,due:new Date(y,m,x.day)}))
}
function dutyState(d,doneMap,now){const key=`${monthKey(now)}:${d.id}`,isDone=!!doneMap[key],diff=daysBetween(now,d.due);let state='upcoming';if(isDone)state='done';else if(diff<0)state='overdue';else if(diff===0)state='today';else if(diff<=3)state='soon';return{...d,key,isDone,diff,state}}
function workRows(s,now){return (buildManagerOS324(s).rows||[]).filter(x=>!closed(x)).map(x=>{const raw=dueOf(x),due=raw?new Date(raw):null,valid=due&&!Number.isNaN(+due),diff=valid?daysBetween(now,due):null;return{...x,_title:titleOf(x),_due:valid?due:null,_diff:diff,_state:diff===null?'open':diff<0?'overdue':diff===0?'today':diff<=3?'soon':'open'}}).sort((a,b)=>{const rank={overdue:0,today:1,soon:2,open:3};return rank[a._state]-rank[b._state]||(a._diff??9999)-(b._diff??9999)})}
export function buildManagerOS341(s=store.get(),now=new Date()){
 const doneMap=s.ui?.manager341Done||{},duties=monthlyDuties(now).map(x=>dutyState(x,doneMap,now)),work=workRows(s,now),overdue=[...duties.filter(x=>x.state==='overdue'),...work.filter(x=>x._state==='overdue')],today=[...duties.filter(x=>x.state==='today'),...work.filter(x=>x._state==='today')],soon=[...duties.filter(x=>x.state==='soon'),...work.filter(x=>x._state==='soon')];
 let next=null;if(overdue.length)next=overdue[0];else if(today.length)next=today[0];else if(soon.length)next=soon[0];else next=work[0]||duties.find(x=>!x.isDone)||null;
 return{version:341,month:monthKey(now),duties,work,overdue,today,soon,next,done:duties.filter(x=>x.isDone).length,generatedAt:new Date().toISOString()}
}
function injectCss(){if(document.querySelector('link[data-manager341]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href='./managerOS341.css';l.dataset.manager341='1';document.head.appendChild(l)}
function anchor(){const section=document.querySelector('#view-today');if(!section)return null;let host=section.querySelector('[data-manager-anchor341]');if(!host){host=document.createElement('div');host.dataset.managerAnchor341='1';const queue=section.querySelector('[data-focus-anchor335]');if(queue?.nextSibling)section.insertBefore(host,queue.nextSibling);else section.appendChild(host)}return host}
function badge(x){return x.state==='done'?'Hotovo':x.state==='overdue'?`${Math.abs(x.diff)} d po termínu`:x.state==='today'?'Dnes':x.state==='soon'?`Za ${x.diff} d`:fmt(x.due)}
function dutyHtml(x){return `<article class="mgr341-duty ${x.state}" data-manager-duty="${esc(x.id)}"><div><small>${esc(badge(x))}</small><h3>${esc(x.label)}</h3><p>${esc(x.detail)}</p></div>${x.isDone?'<span class="mgr341-check">✓</span>':`<button type="button" data-manager341-done="${esc(x.id)}">Hotovo</button>`}</article>`}
function workHtml(x){return `<button type="button" class="mgr341-work ${x._state}" data-manager341-work="${esc(x.id||'')}"><span><small>${x._due?`${esc(x._state==='overdue'?`${Math.abs(x._diff)} d po termínu`:x._state==='today'?'Dnes':fmt(x._due))}`:'Bez termínu'}</small><strong>${esc(x._title)}</strong></span><b>›</b></button>`}
function nextLabel(x){if(!x)return'Nic urgentního';return x.label||x._title||titleOf(x)}
function html(m){return `<section class="mgr341" data-manager-os341><header class="mgr341-head"><div><small>KAMIL OS · 341</small><h2>Manager OS</h2><p>Měsíční povinnosti a pracovní termíny bez hlídání v hlavě.</p></div><div class="mgr341-score"><b>${m.overdue.length}</b><span>po termínu</span></div></header><div class="mgr341-now"><div><small>UDĚLEJ TEĎ</small><strong>${esc(nextLabel(m.next))}</strong><span>${m.overdue.length?`${m.overdue.length} věcí je po termínu.`:m.today.length?`${m.today.length} věcí je dnes.`:m.soon.length?`${m.soon.length} věcí se blíží.`:'Měsíc je pod kontrolou.'}</span></div><button type="button" data-manager341-open>Otevřít práci</button></div><div class="mgr341-duties">${m.duties.map(dutyHtml).join('')}</div><div class="mgr341-worklist"><div class="mgr341-subhead"><strong>Pracovní fronta</strong><span>${m.work.length} otevřených</span></div>${m.work.slice(0,5).map(workHtml).join('')||'<div class="mgr341-empty">Žádné další pracovní úkoly.</div>'}</div></section>`}
function markDone(id){const now=new Date(),key=`${monthKey(now)}:${id}`;store.mutate('Manager OS: splněno',s=>{s.ui=s.ui||{};s.ui.manager341Done=s.ui.manager341Done||{};s.ui.manager341Done[key]=new Date().toISOString()},{cloud:false});renderSafe()}
function openWork(){window.__KAMIL_FOCUS_RADAR334__?.open?.('manager')}
function openTask(id){const m=window.__KAMIL_MANAGER_OS341__?.model||buildManagerOS341(),x=m.work.find(r=>String(r.id)===String(id));if(!x)return openWork();window.dispatchEvent(new CustomEvent('kamil:detail-drawer',{detail:{title:'Pracovní úkol',html:`<div class="os303-list"><div class="os303-row"><span><b>${esc(x._title)}</b><small>${x._due?`Termín ${esc(fmt(x._due))}`:'Bez termínu'}</small></span></div></div>`}}))}
function render(){const host=anchor();if(!host)return false;const m=buildManagerOS341();host.innerHTML=html(m);window.__KAMIL_MANAGER_OS341__={version:341,model:m,healthy:true,mounted:!!host.querySelector('[data-manager-os341]'),refresh:renderSafe,markDone,open:openWork,at:Date.now()};window.dispatchEvent(new CustomEvent('kamil:manager341-updated',{detail:{month:m.month,overdue:m.overdue.length,today:m.today.length,soon:m.soon.length}}));return true}
function renderSafe(){try{return render()}catch(error){console.error('[managerOS341]',error);window.__KAMIL_MANAGER_OS341__={version:341,healthy:false,error:String(error?.message||error),refresh:renderSafe,at:Date.now()};return false}}
let timer=0,bound=false;const schedule=(delay=100)=>{clearTimeout(timer);timer=setTimeout(renderSafe,delay)};
export function installManagerOS341(){injectCss();document.documentElement.dataset.managerOs341='1';if(!bound){bound=true;document.addEventListener('click',e=>{const done=e.target.closest?.('[data-manager341-done]');if(done){e.preventDefault();return markDone(done.dataset.manager341Done)}const open=e.target.closest?.('[data-manager341-open]');if(open){e.preventDefault();return openWork()}const row=e.target.closest?.('[data-manager341-work]');if(row){e.preventDefault();return openTask(row.dataset.manager341Work)}});window.addEventListener('kamil:view-change',e=>{if(!e.detail||e.detail==='today')schedule(40)});store.subscribe?.(()=>schedule())}schedule(30)}
