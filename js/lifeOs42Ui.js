import {store} from './state.js';
import {h} from './utils.js';
import {APP_VERSION} from './releaseMeta.js';
import {universalInbox42,kamilBrain42,changeFeed42,directorHealth42,moneyAutopilot42,ticketCockpit42,relationshipMemory42,meetingPrep42,shutdown42,searchLife42} from './lifeOs42Engine.js';

const fmtDate=v=>{if(!v)return'—';const d=new Date(v);return Number.isFinite(d.getTime())?d.toLocaleDateString('cs-CZ',{day:'numeric',month:'short'}):'—'};
const money=v=>`${Math.round(Number(v||0)).toLocaleString('cs-CZ')} Kč`;
const safe=x=>h(String(x??''));
let searchQuery='';

function findItem(s,source,id){
 const pick=a=>(a||[]).find(x=>String(x.id||x.uid||'')===String(id||''));
 if(source==='tasks')return pick(s.tasks);
 if(source==='inbox')return pick(s.inbox);
 if(source==='personalInbox')return pick(s.personalInbox?.items);
 if(source==='directorWaiting')return pick(s.directorBook?.waiting);
 if(source==='delegations')return pick(s.delegations);
 if(source==='personalAdmin')return pick(s.personalAdmin?.items);
 if(source==='tickets')return pick(s.ticketBook?.items);
 return null;
}
function mutateItem(source,id,action){
 store.mutate(`Life OS: ${action}`,s=>{
  const x=findItem(s,source,id);if(!x)return;
  if(action==='done'){if(source==='tickets')x.workflow='SOLD';else x.status='DONE';x.completedAt=new Date().toISOString();}
  if(action==='snooze'){const d=new Date();d.setDate(d.getDate()+1);x.due=d.toISOString().slice(0,10);x.dueAt=x.dueAt?d.toISOString():x.dueAt;x.snoozedAt=new Date().toISOString();}
  if(action==='waiting'){x.status='WAITING';x.waitingSince=new Date().toISOString();}
 },{undo:true,cloud:true,audit:true});
}

function inboxRow(x){
 const urgency=x.days===null?'':x.days<0?`${Math.abs(x.days)} d po termínu`:x.days===0?'dnes':`za ${x.days} d`;
 return `<div class="life42-row"><div class="life42-main"><b>${safe(x.title)}</b><span>${safe(x.kind)}${urgency?` · ${safe(urgency)}`:''}${x.owner?` · ${safe(x.owner)}`:''}</span></div><div class="life42-actions">${x.source!=='tickets'?`<button class="btn mini" data-life42-action="done" data-source="${safe(x.source)}" data-id="${safe(x.id)}">Vyřešit</button><button class="btn mini" data-life42-action="waiting" data-source="${safe(x.source)}" data-id="${safe(x.id)}">Waiting</button><button class="btn mini" data-life42-action="snooze" data-source="${safe(x.source)}" data-id="${safe(x.id)}">Zítra</button>`:`<button class="btn mini" data-life42-nav="tickets">Otevřít</button>`}<span class="life42-score">${Math.round(x.score)}</span></div></div>`;
}
function brainCard(brain){return `<section class="card life42-hero"><div class="card-head"><div><div class="eyebrow">KAMIL BRAIN · ${safe(APP_VERSION)}</div><h2>Co má smysl řešit teď</h2></div><span class="status ${brain.overdue?'warn':'good'}">${brain.overdue?brain.overdue+' po termínu':'bez požáru'}</span></div><p class="life42-summary">${safe(brain.summary)}</p><div class="life42-top">${brain.top.map((x,i)=>`<div class="life42-priority"><strong>${i+1}</strong><div><b>${safe(x.title)}</b><span>${safe(x.kind)}${x.days!==null?` · ${x.days<0?Math.abs(x.days)+' d po termínu':x.days===0?' dnes':' za '+x.days+' d'}`:''}</span></div></div>`).join('')||'<div class="empty">Fronta je čistá.</div>'}</div></section>`}

export function renderLifeOs42(){
 const host=document.querySelector('#todayView');if(!host||!host.children.length)return;
 let root=host.querySelector('#lifeOs42');if(root)root.remove();
 const s=store.get(),brain=kamilBrain42(s),feed=changeFeed42(s),inbox=universalInbox42(s),director=directorHealth42(s),moneyA=moneyAutopilot42(s),tickets=ticketCockpit42(s),people=relationshipMemory42(s),meeting=meetingPrep42(s),shutdown=shutdown42(s);
 root=document.createElement('div');root.id='lifeOs42';root.className='life42-shell';
 root.innerHTML=`${brainCard(brain)}
 <section class="card"><div class="card-head"><div><div class="eyebrow">CHANGE FEED</div><h2>Co se změnilo od minula</h2></div><span class="status">${feed.changes.length} změn</span></div><div class="life42-chips">${feed.changes.map(x=>`<span class="life42-chip ${x.delta>0?'warn':'good'}">${safe(x.text)}</span>`).join('')||'<span class="life42-chip good">Žádná změna v hlavních frontách</span>'}</div></section>
 <section class="card"><div class="card-head"><div><div class="eyebrow">UNIVERSAL INBOX</div><h2>Jedna fronta pro rozhodnutí</h2></div><span class="status ${inbox.filter(x=>x.score>=75).length?'warn':'good'}">${inbox.length} otevřených</span></div><div class="life42-list">${inbox.slice(0,10).map(inboxRow).join('')||'<div class="empty">Inbox je čistý.</div>'}</div></section>
 <div class="grid two life42-grid"><section class="card"><div class="card-head"><div><div class="eyebrow">DIRECTOR MODE 2.0</div><h2>Pobočka ${director.score}/100</h2></div><span class="status ${director.tone}">${director.score}</span></div><p>${safe(director.text)}</p><div class="metric-strip"><div class="metric"><span>Po termínu</span><b>${director.overdue}</b></div><div class="metric"><span>Urgentní</span><b>${director.urgent}</b></div><div class="metric"><span>Waiting</span><b>${director.waiting}</b></div></div></section>
 <section class="card"><div class="card-head"><div><div class="eyebrow">MEETING PREP</div><h2>${safe(meeting.title)}</h2></div><span class="status">${safe(fmtDate(meeting.when))}</span></div><div class="life42-list">${meeting.points.map((x,i)=>`<div class="life42-note"><b>${i+1}.</b> ${safe(x)}</div>`).join('')||'<div class="empty">Nemám podklady k poradě.</div>'}</div></section></div>
 <div class="grid two life42-grid"><section class="card"><div class="card-head"><div><div class="eyebrow">MONEY AUTOPILOT</div><h2>Co s volným kapitálem</h2></div><span class="status ${moneyA.free>0?'good':'warn'}">${money(moneyA.free)}</span></div><p>${safe(moneyA.text)}</p><div class="metric-strip"><div class="metric"><span>Cash</span><b>${money(moneyA.cash)}</b></div><div class="metric"><span>Rezerva</span><b>${money(moneyA.reserve)}</b></div><div class="metric"><span>Plán investic</span><b>${money(moneyA.planned)}</b></div></div><button class="btn" data-life42-nav="money">Otevřít Peníze</button></section>
 <section class="card"><div class="card-head"><div><div class="eyebrow">TICKET TRADING COCKPIT</div><h2>${tickets.urgent} akcí chce pozornost</h2></div><span class="status ${tickets.urgent?'warn':'good'}">riziko ${money(tickets.risk)}</span></div><div class="life42-list">${tickets.rows.slice(0,5).map(x=>`<div class="life42-row"><div class="life42-main"><b>${safe(x.title)}</b><span>${x.days===null?'bez data':x.days<0?'po akci':x.days===0?'dnes':`za ${x.days} d`} · odhad prodeje ${x.prob}%</span></div><span class="decision-action">${safe(x.action)}</span></div>`).join('')||'<div class="empty">Žádné otevřené vstupenky.</div>'}</div><button class="btn" data-life42-nav="tickets">Otevřít Vstupenky</button></section></div>
 <section class="card"><div class="card-head"><div><div class="eyebrow">RELATIONSHIP MEMORY</div><h2>Kdo komu co dluží</h2></div><span class="status">${people.length} lidí</span></div><div class="life42-people">${people.map(p=>`<div class="life42-person"><b>${safe(p.name)}</b><span>čekám: ${p.oweMe} · já dlužím: ${p.iOwe}</span><small>${safe(p.items.slice(0,2).join(' · '))}</small></div>`).join('')||'<div class="empty">Zatím nemám dost vazeb v datech.</div>'}</div></section>
 <section class="card"><div class="card-head"><div><div class="eyebrow">UNIVERSAL SEARCH</div><h2>Najdi cokoliv v Kamil OS</h2></div><span class="status">Ctrl+K ready</span></div><input class="life42-search" id="life42Search" placeholder="Sparta, PKS, fakturace, Workday…" value="${safe(searchQuery)}"><div id="life42SearchResults" class="life42-list"></div></section>
 <section class="card"><div class="card-head"><div><div class="eyebrow">DAILY SHUTDOWN</div><h2>${shutdown.ready?'Den můžeš zavřít':'Ještě něco hoří'}</h2></div><span class="status ${shutdown.ready?'good':'warn'}">${shutdown.urgent.length} urgentních</span></div><p>${safe(shutdown.text)}</p><div class="life42-actions"><button class="btn primary" id="life42Shutdown">Uzavřít den</button><button class="btn" data-life42-nav="more">Otevřít systém</button></div></section>`;
 const anchor=host.querySelector('.metric-strip')||host.firstElementChild;anchor?.insertAdjacentElement('afterend',root);
 bindLife42(root);
}

function bindLife42(root){
 root.querySelectorAll('[data-life42-action]').forEach(btn=>btn.addEventListener('click',()=>mutateItem(btn.dataset.source,btn.dataset.id,btn.dataset.life42Action)));
 root.querySelectorAll('[data-life42-nav]').forEach(btn=>btn.addEventListener('click',()=>window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:btn.dataset.life42Nav}))));
 const input=root.querySelector('#life42Search'),results=root.querySelector('#life42SearchResults');
 const paint=()=>{searchQuery=input?.value||'';const rows=searchLife42(store.get(),searchQuery);if(results)results.innerHTML=rows.map(x=>`<div class="life42-row"><div class="life42-main"><b>${safe(x.title)}</b><span>${safe(x.kind)}</span></div></div>`).join('')||(searchQuery?'<div class="empty">Nic jsem nenašel.</div>':'');};
 input?.addEventListener('input',paint);paint();
 root.querySelector('#life42Shutdown')?.addEventListener('click',()=>store.mutate('Uzavřen den',s=>{s.meta=s.meta||{};s.meta.lastShutdownAt=new Date().toISOString();s.meta.shutdownSummary=shutdown42(s).text;},{undo:false,cloud:true,audit:true}));
}

let timer=null;const schedule=()=>{clearTimeout(timer);timer=setTimeout(()=>{if(document.querySelector('#view-today')?.classList.contains('on'))renderLifeOs42()},120)};
store.subscribe(()=>schedule());
window.addEventListener('kamil:view-change',e=>{if(e.detail==='today')schedule()});
window.addEventListener('kamil:today-full-ready',schedule);
schedule();
