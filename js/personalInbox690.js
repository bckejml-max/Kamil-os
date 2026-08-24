import {store} from './state.js';
import {h,qs} from './utils.js';
import {personalWaitingCenter650,personalDailyAssistant650} from './personalAssistant650.js';
import {loadTicketCloud660} from './ticketCloud660.js';

const READ_KEY='kamil-os-inbox-read-at';
const ts=x=>Date.parse(x||'')||0;
const fmt=x=>x?new Date(x).toLocaleString('cs-CZ',{day:'numeric',month:'numeric',hour:'2-digit',minute:'2-digit'}):'—';
const readAt=()=>{try{return Number(localStorage.getItem(READ_KEY)||0)}catch{return 0}};
const markRead=()=>{try{localStorage.setItem(READ_KEY,String(Date.now()))}catch{}};
const routeFor=text=>{const t=String(text||'').toLowerCase();if(/ticket|vstupenk|viagogo/.test(t))return'tickets';if(/hypot|peněz|platb|faktur|finance|bank|invest/.test(t))return'money';if(/rodin|dítě|dcera|manžel|víkend/.test(t))return'family';if(/domov|dům|energie|servis|údržb|reviz/.test(t))return'home';if(/smlouv|dokument|pojist|doklad|protokol/.test(t))return'more';return'today'};
const clean=x=>String(x||'').trim();
function localInbox(s){
 const since=readAt(),rows=[],seen=new Set(),push=x=>{const key=`${x.kind}:${x.title}`;if(seen.has(key))return;seen.add(key);rows.push(x)};
 const waiting=personalWaitingCenter650(s);for(const x of waiting.rows||[]){push({kind:'waiting',title:clean(x.title||x.name||'Čekám na odpověď'),detail:x.when||'Čekám na reakci',at:ts(x.followUpAt||x.due||x.updatedAt)||Date.now(),route:'today',actionable:x.days!==null&&x.days<=0})}
 const daily=personalDailyAssistant650(s);for(const x of daily.top||[]){push({kind:'action',title:clean(x.title||'Úkol'),detail:clean(x.why||x.next||''),at:ts(x.due||x.at||x.updatedAt)||Date.now(),route:x.route||routeFor(x.title),actionable:true})}
 for(const x of (s.audit||[]).slice().reverse()){const at=ts(x.at||x.createdAt||x.time);if(!at||at<=since)continue;const title=clean(x.label||x.title||x.action||x.reason||'Změna');if(!title)continue;push({kind:'info',title,detail:'Nová změna od poslední kontroly',at,route:routeFor(title),actionable:false});if(rows.length>30)break}
 return rows;
}
async function ticketInbox(){try{const c=await loadTicketCloud660();if(!c.ok)return[];return (c.alerts||[]).map(x=>({kind:'ticket',title:clean(x.title||x.message||'Změna u vstupenky'),detail:clean(x.message||x.reason||'Trh se změnil'),at:ts(x.created_at)||Date.now(),route:'tickets',actionable:true}))}catch{return[]}}
const bucket=x=>x.kind==='waiting'?'waiting':x.actionable?'action':'info';
const badge=x=>bucket(x)==='action'?'ŘEŠIT':bucket(x)==='waiting'?'ČEKÁM':'INFO';
const tone=x=>bucket(x)==='action'?'critical':bucket(x)==='waiting'?'warning':'neutral';
function row(x){return `<button class="inbox69-row" data-inbox-route="${h(x.route||'today')}" data-inbox-kind="${h(bucket(x))}"><span class="inbox69-main"><b>${h(x.title)}</b><small>${h(x.detail||'')}</small></span><span class="inbox69-side"><em class="tmw-rec ${tone(x)}">${badge(x)}</em><small>${fmt(x.at)}</small></span></button>`}
function apply(host,filter){host.querySelectorAll('[data-inbox-filter]').forEach(b=>b.classList.toggle('primary',b.dataset.inboxFilter===filter));host.querySelectorAll('[data-inbox-kind]').forEach(r=>r.classList.toggle('hidden',filter!=='all'&&r.dataset.inboxKind!==filter))}
export async function renderPersonalInbox690(){
 const host=qs('#inboxView');if(!host)return;host.innerHTML='<div class="card"><b>Načítám Inbox OS…</b></div>';
 const rows=[...localInbox(store.get()),...(await ticketInbox())].sort((a,b)=>Number(b.actionable)-Number(a.actionable)||b.at-a.at),counts={action:0,waiting:0,info:0};rows.forEach(x=>counts[bucket(x)]++);
 host.innerHTML=`<div class="ux64-page inbox69-page"><div class="view-head"><div><div class="eyebrow">INBOX OS</div><h1>Jedno místo pro nové věci.</h1><p>Řešit, čekám, informace. Nic nemusíš lovit po jednotlivých sekcích.</p></div><button class="btn" data-inbox-read>Označit přečtené</button></div><section class="metric-strip"><div class="metric inbox69-action"><span>Řešit</span><b>${counts.action}</b></div><div class="metric inbox69-wait"><span>Čekám</span><b>${counts.waiting}</b></div><div class="metric inbox69-info"><span>Informace</span><b>${counts.info}</b></div><div class="metric"><span>Celkem</span><b>${rows.length}</b></div></section><section class="card inbox69-filter"><div><b>Co chceš vidět</b><div class="muted">Nejdůležitější je nahoře.</div></div><div class="row-actions"><button class="btn primary" data-inbox-filter="all">Vše</button><button class="btn" data-inbox-filter="action">Řešit</button><button class="btn" data-inbox-filter="waiting">Čekám</button><button class="btn" data-inbox-filter="info">Info</button></div></section><section class="inbox69-list">${rows.map(row).join('')||'<div class="card"><b>Inbox je čistý.</b><p class="muted">Nic nového teď nevyžaduje pozornost.</p></div>'}</section></div>`;
 host.querySelectorAll('[data-inbox-filter]').forEach(b=>b.addEventListener('click',()=>apply(host,b.dataset.inboxFilter)));
 host.querySelectorAll('[data-inbox-route]').forEach(b=>b.addEventListener('click',()=>window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:b.dataset.inboxRoute}))));
 host.querySelector('[data-inbox-read]')?.addEventListener('click',()=>{markRead();renderPersonalInbox690()});
 if(typeof window!=='undefined')window.__KAMIL_INBOX_690__={at:Date.now(),counts,total:rows.length};
}
