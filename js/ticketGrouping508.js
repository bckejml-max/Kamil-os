import {loadTicketCloud660} from './ticketCloud660.js';

const VERSION='508.0.0';
const EXPANDED_KEY='kamil.ticket.grouping508.expanded';
const ENABLED_KEY='kamil.ticket.grouping508.enabled';
let bound=false;
let timer=0;
let loading=null;
let cloud=null;
let observer=null;
let painting=false;

const n=v=>{const x=Number(v);return Number.isFinite(x)?x:0};
const qty=r=>Math.max(1,n(r?.qty)||1);
const money=v=>`${Math.round(Math.abs(n(v))).toLocaleString('cs-CZ')} Kč`;
const signed=v=>`${n(v)>=0?'+':'−'}${money(v)}`;
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[c]));

function enabled(){try{return localStorage.getItem(ENABLED_KEY)!=='0'}catch{return true}}
function setEnabled(value){try{localStorage.setItem(ENABLED_KEY,value?'1':'0')}catch{}}
function expandedSet(){try{return new Set(JSON.parse(localStorage.getItem(EXPANDED_KEY)||'[]'))}catch{return new Set()}}
function saveExpanded(set){try{localStorage.setItem(EXPANDED_KEY,JSON.stringify([...set].slice(-120)))}catch{}}
function hash(text){let h=2166136261;for(const ch of String(text||'')){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return(h>>>0).toString(36)}
function baseName(row){
  const original=String(row?.event_name??row?.eventName??row?.name??'Událost').trim().replace(/\s+/g,' ');
  let name=original;
  const section=String(row?.section||'').trim().replace(/\s+/g,' '),candidates=[];
  if(section){candidates.push(section);const first=section.split(/\s[-–—]\s|\s+/)[0];if(first&&first!==section)candidates.push(first)}
  for(const token of candidates){
    if(!token||token.length<2)continue;
    const lower=name.toLocaleLowerCase('cs-CZ'),needle=String(token).toLocaleLowerCase('cs-CZ');
    let cut=-1;
    for(const sep of [' - ',' – ',' — ']){const idx=lower.lastIndexOf(sep+needle);if(idx>=0&&idx>=Math.max(2,name.length-70))cut=cut<0?idx:Math.min(cut,idx)}
    if(cut>2)name=name.slice(0,cut).trim();
  }
  return name.length>=3?name:original;
}
function groupKey(row){return`g${hash(baseName(row).toLocaleLowerCase('cs-CZ'))}`}
function platform(row){
  const raw=[row?.source_name,row?.source_sheet,row?.viagogo_url,row?.stubhub_url,row?.official_url].filter(Boolean).join(' ').toLowerCase();
  if(raw.includes('viagogo'))return'Viagogo';if(raw.includes('stubhub'))return'StubHub';if(raw.includes('ticketportal'))return'Ticketportal';if(raw.includes('ticketmaster'))return'Ticketmaster';if(raw.includes('goout'))return'GoOut';
  const clean=String(row?.source_name||'Evidence').trim();return clean&&clean!=='Excel import'?clean:'Evidence';
}
function latest(row){return cloud?.latest?.get?.(row.id)||cloud?.latest?.get?.(String(row.id))||null}
function targetEach(row){const s=latest(row);return n(row?.ask_each_czk)||n(s?.recommended_ask_czk)||n(s?.market_price_czk)||n(s?.stubhub_price_czk)||0}
function status(row){return String(row?.market_status||row?.marketStatus||'').trim().toUpperCase()}
function dateParts(rows){
  const dates=rows.map(r=>Date.parse(r?.event_date??r?.eventDate??'')).filter(Number.isFinite).sort((a,b)=>a-b);
  if(!dates.length)return{main:'—',sub:'termín neznámý'};
  const a=new Date(dates[0]),b=new Date(dates.at(-1)),fmt=d=>d.toLocaleDateString('cs-CZ',{day:'numeric',month:'numeric'}),same=a.toDateString()===b.toDateString(),main=same?fmt(a):`${fmt(a)}–${fmt(b)}`;
  const now=new Date(),today=new Date(now.getFullYear(),now.getMonth(),now.getDate()).getTime(),first=new Date(a.getFullYear(),a.getMonth(),a.getDate()).getTime(),days=Math.round((first-today)/86400000);
  return{main,sub:days<0?'event proběhl':days===0?'dnes':days===1?'zítra':days>1?`za ${days} dní`:'—'};
}
function statusSummary(rows){
  const counts=new Map();for(const r of rows)counts.set(status(r),(counts.get(status(r))||0)+1);
  const listed=counts.get('LISTED')||0,held=counts.get('NOT_LISTED')||0,sold=(counts.get('SOLD_UNDELIVERED')||0)+(counts.get('SOLD_WAITING_PAYMENT')||0)+(counts.get('PAYOUT_RECEIVED')||0)+(counts.get('PAID')||0),bits=[];
  if(listed)bits.push(`${listed} nabídnuto`);if(held)bits.push(`${held} koupeno`);if(sold)bits.push(`${sold} prodáno`);return bits.join(' · ')||`${rows.length} pozic`;
}
function bestDecision(memberEls){
  let best=null;
  for(const el of memberEls){const line=el.querySelector('[data-decision507]');if(!line)continue;const m=(line.textContent||'').match(/D(\d+)/i);if(!m)continue;const score=Number(m[1]);if(!Number.isFinite(score))continue;const action=String(line.textContent||'').split('·').slice(1).join('·').trim();if(!best||score>best.score)best={score,action}}
  return best;
}
function aggregate(rows,memberEls){
  const q=rows.reduce((s,r)=>s+qty(r),0),buy=rows.reduce((s,r)=>s+(n(r?.buy_total_czk)||n(r?.buy_each_czk)*qty(r)),0);let target=0,known=0;
  for(const r of rows){const each=targetEach(r);if(each>0){known++;target+=each*qty(r)}}
  const potential=known===rows.length&&known>0?target-buy:null,platforms=[...new Set(rows.map(platform))],platformLabel=platforms.length<=2?platforms.join(' + '):`${platforms[0]} +${platforms.length-1}`,decision=bestDecision(memberEls);
  return{q,buy,target,known,potential,platformLabel,decision,date:dateParts(rows),status:statusSummary(rows)};
}
function cleanupGrid(grid){
  grid.querySelectorAll(':scope > [data-group508-summary]').forEach(x=>x.remove());
  grid.querySelectorAll(':scope > .td500-ticket-row[data-ticket-id]').forEach(row=>{row.classList.remove('td508-group-member','td508-collapsed-member');delete row.dataset.group508});
}
function summaryMarkup(key,name,rows,memberEls,isExpanded){
  const a=aggregate(rows,memberEls),targetLabel=a.known?money(a.target):'—',targetSub=a.known===rows.length?'součet cílových cen':`${a.known}/${rows.length} pozic s cenou`,profit=a.potential===null?'—':signed(a.potential),profitSub=a.potential===null?'čeká na ceny':'hrubý potenciál',d=a.decision?`D${a.decision.score}`:'D—',action=a.decision?.action||'bez modelu';
  return `<article class="td508-event-group ${isExpanded?'is-expanded':'is-collapsed'}" data-group508-summary="${esc(key)}" role="row">
    <button type="button" class="td508-event-main" data-group508-toggle="${esc(key)}" role="cell" data-col="event" aria-expanded="${isExpanded?'true':'false'}"><span class="td508-folder" aria-hidden="true">${isExpanded?'▾':'▸'}</span><span><b>${esc(name)}</b><small>${rows.length} pozic · ${a.q} vstupenek</small></span></button>
    <div class="td508-cell" role="cell" data-col="date"><b>${esc(a.date.main)}</b><small>${esc(a.date.sub)}</small></div>
    <div class="td508-cell" role="cell" data-col="platform"><b>${esc(a.platformLabel||'Evidence')}</b><small>${new Set(rows.map(platform)).size} zdrojů</small></div>
    <div class="td508-cell td508-center" role="cell" data-col="qty"><b>${a.q}</b><small>ks</small></div>
    <div class="td508-cell" role="cell" data-col="buy"><b>${money(a.buy)}</b><small>vložený kapitál</small></div>
    <div class="td508-cell" role="cell" data-col="sell"><b>${targetLabel}</b><small>${esc(targetSub)}</small></div>
    <div class="td508-cell ${a.potential!==null?(a.potential>=0?'td508-good':'td508-bad'):''}" role="cell" data-col="profit"><b>${profit}</b><small>${profitSub}</small></div>
    <div class="td508-cell" role="cell" data-col="status"><span class="td508-decision" data-tone="${a.decision&&a.decision.score>=65?'strong':'neutral'}">${d}</span><small>${esc(action)} · ${esc(a.status)}</small></div>
    <button type="button" class="td508-toggle" data-group508-toggle="${esc(key)}" role="cell" data-col="actions" aria-label="${isExpanded?'Sbalit':'Rozbalit'} ${esc(name)}">${isExpanded?'⌃':'⌄'}</button>
  </article>`;
}
function installToolbar(host){
  const modes=host.querySelector(':scope > .td331-modes'),tools=modes?.querySelector('.td500-view-tools');if(!tools)return;
  let btn=tools.querySelector('[data-group508-all]');
  if(!btn){btn=document.createElement('button');btn.type='button';btn.className='td500-icon-btn td508-toolbar';btn.dataset.group508All='1';btn.addEventListener('click',()=>{setEnabled(!enabled());paint()});tools.prepend(btn)}
  btn.textContent=enabled()?'Eventy ✓':'Eventy';btn.title=enabled()?'Seskupování podle eventu je zapnuté':'Zapnout seskupování podle eventu';btn.setAttribute('aria-pressed',enabled()?'true':'false');
}
function groupGrid(grid,rowsById,expanded){
  cleanupGrid(grid);
  const all=[...grid.querySelectorAll(':scope > .td500-ticket-row[data-ticket-id]')],groups=new Map(),order=[];
  for(const el of all){const row=rowsById.get(String(el.dataset.ticketId));if(!row)continue;const key=groupKey(row),name=baseName(row);if(!groups.has(key)){groups.set(key,{key,name,items:[]});order.push(key)}groups.get(key).items.push({el,row})}
  let grouped=0;
  for(const key of order){
    const group=groups.get(key);if(!group||group.items.length<2)continue;grouped++;
    const isExpanded=expanded.has(key),first=group.items[0].el,wrap=document.createElement('div');wrap.innerHTML=summaryMarkup(key,group.name,group.items.map(x=>x.row),group.items.map(x=>x.el),isExpanded);const summary=wrap.firstElementChild;grid.insertBefore(summary,first);
    let ref=summary.nextSibling;
    for(const item of group.items){item.el.dataset.group508=key;item.el.classList.add('td508-group-member');item.el.classList.toggle('td508-collapsed-member',!isExpanded);grid.insertBefore(item.el,ref);ref=item.el.nextSibling}
    summary.hidden=group.items.every(({el})=>el.classList.contains('hidden'));
  }
  return grouped;
}
function toggleGroup(key){const expanded=expandedSet();if(expanded.has(key))expanded.delete(key);else expanded.add(key);saveExpanded(expanded);paint()}
function paint(){
  if(painting)return false;const host=document.querySelector('#ticketIntelView .td331');if(!host||!cloud?.ok)return false;painting=true;
  try{
    installToolbar(host);const grids=[...host.querySelectorAll('.td331-grid')],rowsById=new Map((cloud.inventory||[]).map(r=>[String(r.id),r]));
    if(!enabled()){grids.forEach(cleanupGrid);document.documentElement.dataset.ticketGrouping508='off';window.__KAMIL_TICKET_GROUPING508__={version:VERSION,healthy:true,enabled:false,groups:0,at:Date.now()};return true}
    const expanded=expandedSet();let groups=0;for(const grid of grids)groups+=groupGrid(grid,rowsById,expanded);
    document.documentElement.dataset.ticketGrouping508='1';window.__KAMIL_TICKET_GROUPING508__={version:VERSION,healthy:true,enabled:true,groups,expanded:[...expanded],at:Date.now()};window.dispatchEvent(new CustomEvent('kamil:ticket-grouping508-updated',{detail:window.__KAMIL_TICKET_GROUPING508__}));return true;
  }finally{painting=false}
}
async function refresh(force=false){
  if(loading&&!force)return loading;loading=(async()=>{try{const next=await loadTicketCloud660();if(!next?.ok)return false;cloud=next;return paint()}catch(error){console.warn('[ticketGrouping508]',error);return false}finally{loading=null}})();return loading;
}
function schedule(ms=100,{reload=false}={}){clearTimeout(timer);timer=setTimeout(()=>{timer=0;reload?refresh(true):paint()},ms)}
export function installTicketGrouping508(){
  refresh();setTimeout(()=>paint(),450);setTimeout(()=>paint(),1200);if(bound)return;bound=true;const root=document.querySelector('#ticketIntelView');
  root?.addEventListener('click',event=>{const toggle=event.target.closest('[data-group508-toggle]');if(toggle){event.preventDefault();event.stopPropagation();toggleGroup(toggle.dataset.group508Toggle);return}if(event.target.closest('[data-td-filter],[data-td-mode],[data-ticket-layout]'))schedule(40)});
  for(const event of ['kamil:view-change','kamil:ticket-desk331-updated','kamil:ticket-economics506-updated'])window.addEventListener(event,()=>schedule(130));
  for(const event of ['kamil:ticket-refresh397-done','kamil:ticket-payout154-updated'])window.addEventListener(event,()=>schedule(90,{reload:true}));
  if(root){observer=new MutationObserver(records=>{if(painting)return;const external=records.some(r=>r.type==='childList'&&[...r.addedNodes,...r.removedNodes].some(node=>node.nodeType===1&&!node.matches?.('[data-group508-summary]')));if(external)schedule(110)});observer.observe(root,{childList:true,subtree:true})}
}
