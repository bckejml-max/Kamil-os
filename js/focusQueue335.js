import {store} from './state.js';
import {buildDomainOS328} from './domainOS328.js';
import {openFinanceCommand258} from './financeCommand258.js';
import {openTicketCommander660} from './ticketCommander660.js';

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=x=>Number.isFinite(Number(x))?Number(x):0;
const money=x=>`${Math.round(num(x)).toLocaleString('cs-CZ')} Kč`;
const done=x=>['DONE','CLOSED','ARCHIVED','PAID'].includes(String(x?.status||'').toUpperCase());
const title=x=>x?.title||x?.name||x?.event||x?.symbol||'Položka';

function injectCss(){if(document.querySelector('link[data-focus-queue335]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href='./focusQueue335.css';l.dataset.focusQueue335='1';document.head.appendChild(l)}
function drawer(name,html){window.dispatchEvent(new CustomEvent('kamil:detail-drawer',{detail:{title:name,html}}))}
function dueScore(x){const d=Date.parse(x?.due||x?.followUpAt||0);if(!d)return 0;const days=(d-Date.now())/86400000;return days<0?35:days<1?24:days<3?12:0}
function model(){
 const s=store.get(),d=buildDomainOS328(s),rows=[],taskIds=new Set((s.tasks||[]).map(x=>x.id));
 (d.manager?.overdue||[]).slice(0,4).forEach(x=>rows.push({key:'manager',label:'Práce',title:title(x),reason:'Po termínu · zavřít, delegovat nebo posunout.',score:120+dueScore(x),refType:taskIds.has(x.id)?'task':'delegation',refId:x.id||null}));
 (d.tickets?.signals||[]).filter(x=>['BUY','SELL/REPRICE','REVIEW'].includes(String(x.signal||''))).slice(0,4).forEach(x=>rows.push({key:'tickets',label:'Vstupenky',title:title(x),reason:`${x.signal} · ${x.reason||x.sellTiming||'zkontrolovat cenu'}`,score:x.signal==='SELL/REPRICE'?112:x.signal==='BUY'?106:96,refType:'ticket',refId:x.id||null}));
 (d.property?.urgent||[]).slice(0,3).forEach(x=>rows.push({key:'property',label:'Nemovitosti',title:title(x),reason:'Důležitý otevřený krok kolem nemovitosti.',score:92+dueScore(x),refType:'property',refId:x.id||null}));
 (d.investments?.rows||[]).filter(x=>x.action&&x.action!=='HOLD').slice(0,3).forEach(x=>rows.push({key:'money',label:'Peníze',title:title(x),reason:`${x.action} · ${x.reason||'zkontrolovat pozici'}`,score:x.action==='REDUCE'?88:82,refType:'investment',refId:x.id||x.symbol||null}));
 (s.tasks||[]).filter(x=>!done(x)).filter(x=>!/faktur|zakáz|dodavat|pks|cpi|zbroj|práce|pracovn/i.test(`${x.title||''} ${x.area||''} ${x.category||''}`)).slice(0,4).forEach(x=>rows.push({key:'personal',label:'Osobní',title:title(x),reason:x.due?'Osobní úkol s termínem.':'Otevřený osobní úkol.',score:60+dueScore(x),refType:'task',refId:x.id||null}));
 if(!rows.length&&num(d.money?.freeCapital)>0)rows.push({key:'money',label:'Peníze',title:`${money(d.money.freeCapital)} volného kapitálu`,reason:'Zkontroluj, jestli kapitál nemá lepší využití.',score:55,refType:'money',refId:null});
 const queue=rows.sort((a,b)=>b.score-a.score).slice(0,5).map((x,i)=>({...x,rank:i+1}));
 return{version:335,queue,now:queue[0]||null,next:queue.slice(1,4),at:new Date().toISOString()};
}
function open(key,m=window.__KAMIL_FOCUS_QUEUE335__?.model||model()){
 if(key==='money')return openFinanceCommand258();
 if(key==='tickets')return openTicketCommander660();
 if(key==='manager')return window.__KAMIL_FOCUS_RADAR334__?.open?.('manager');
 if(key==='property')return window.__KAMIL_FOCUS_RADAR334__?.open?.('property');
 if(key==='personal')return drawer('Osobní Focus',`<div class="os303-list">${m.queue.filter(x=>x.key==='personal').map(x=>`<div class="os303-row"><span><b>${esc(x.title)}</b><small>${esc(x.reason)}</small></span></div>`).join('')||'<div class="os335-empty">Nic urgentního.</div>'}</div>`);
}
function html(m){
 if(!m.now)return `<section class="os335-queue" data-focus-queue335><div class="os335-head"><div><small>KAMIL OS · 335</small><h2>Focus Queue</h2></div><span>Čisto</span></div><div class="os335-empty">Teď není žádná silná další akce.</div></section>`;
 const next=m.next.map(x=>`<button type="button" class="os335-next" data-focus335-open="${x.key}"><b>${x.rank}</b><span><strong>${esc(x.title)}</strong><small>${esc(x.label)} · ${esc(x.reason)}</small></span></button>`).join('');
 return `<section class="os335-queue" data-focus-queue335><div class="os335-head"><div><small>KAMIL OS · 335</small><h2>Focus Queue</h2></div><span>${m.queue.length} kroků</span></div><div class="os335-now" data-focus335-current data-ref-type="${esc(m.now.refType||'')}" data-ref-id="${esc(m.now.refId||'')}"><div class="os335-rank">1</div><div><small>TEĎ · ${esc(m.now.label).toUpperCase()}</small><h3>${esc(m.now.title)}</h3><p>${esc(m.now.reason)}</p></div><button type="button" data-focus335-open="${m.now.key}">Řešit</button></div>${next?`<div class="os335-next-list">${next}</div>`:''}</section>`;
}
function anchor(){const section=document.querySelector('#view-today'),radar=section?.querySelector('[data-focus-anchor334]');if(!section)return null;let host=section.querySelector('[data-focus-anchor335]');if(!host){host=document.createElement('div');host.dataset.focusAnchor335='1';if(radar?.nextSibling)section.insertBefore(host,radar.nextSibling);else section.prepend(host)}return host}
function render(){const host=anchor();if(!host)return false;const m=model();host.innerHTML=html(m);window.__KAMIL_FOCUS_QUEUE335__={version:335,model:m,healthy:true,mounted:!!host.querySelector('[data-focus-queue335]'),refresh:renderSafe,open,at:Date.now()};return true}
function renderSafe(){try{return render()}catch(error){console.error('[focusQueue335]',error);window.__KAMIL_FOCUS_QUEUE335__={version:335,healthy:false,error:String(error?.message||error),refresh:renderSafe,open,at:Date.now()};return false}}
let timer=0,bound=false;const schedule=(delay=100)=>{clearTimeout(timer);timer=setTimeout(renderSafe,delay)};
export function installFocusQueue335(){injectCss();document.documentElement.dataset.focusQueue335='1';if(!bound){bound=true;document.addEventListener('click',e=>{const b=e.target.closest?.('[data-focus335-open]');if(!b)return;e.preventDefault();open(b.dataset.focus335Open)});window.addEventListener('kamil:view-change',e=>{if(!e.detail||e.detail==='today')schedule(40)});store.subscribe?.(()=>schedule())}schedule(30);setTimeout(()=>schedule(20),600);setTimeout(()=>schedule(20),1700)}