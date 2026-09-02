import {loadTicketCloud660} from './ticketCloud660.js';

const VERSION='509.0.1';
let bound=false;
let cloud=null;
let loading=null;
let wrap=null;

const n=v=>{const x=Number(v);return Number.isFinite(x)?x:0};
const qty=r=>Math.max(1,n(r?.qty)||1);
const money=v=>`${Math.round(Math.abs(n(v))).toLocaleString('cs-CZ')} Kč`;
const signed=v=>`${n(v)>=0?'+':'−'}${money(v)}`;
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const status=r=>String(r?.market_status||r?.marketStatus||'').trim().toUpperCase();
const ACTIVE=new Set(['LISTED','NOT_LISTED']);
const SOLD=new Set(['SOLD_UNDELIVERED','SOLD_WAITING_PAYMENT','PAYOUT_RECEIVED','PAID']);

function platform(row){
  const raw=[row?.source_name,row?.source_sheet,row?.viagogo_url,row?.stubhub_url,row?.official_url].filter(Boolean).join(' ').toLowerCase();
  if(raw.includes('viagogo'))return'Viagogo';
  if(raw.includes('stubhub'))return'StubHub';
  if(raw.includes('ticketportal'))return'Ticketportal';
  if(raw.includes('ticketmaster'))return'Ticketmaster';
  if(raw.includes('goout'))return'GoOut';
  const clean=String(row?.source_name||'Evidence').trim();
  return clean&&clean!=='Excel import'?clean:'Evidence';
}
function latest(row){return cloud?.latest?.get?.(row.id)||cloud?.latest?.get?.(String(row.id))||null}
function targetEach(row){const s=latest(row);return n(s?.recommended_ask_czk)||n(row?.ask_each_czk)||n(s?.market_price_czk)||n(s?.stubhub_price_czk)||0}
function eventDate(row){return row?.event_date??row?.eventDate??''}
function fmtDate(raw){const t=Date.parse(raw||'');return Number.isFinite(t)?new Date(t).toLocaleDateString('cs-CZ',{day:'numeric',month:'numeric',year:'numeric'}):'—'}
function memberText(el,selector,fallback='—'){const x=el?.querySelector(selector);return String(x?.textContent||'').trim()||fallback}
function decision(el){const text=memberText(el,'[data-decision507]','D—');const m=text.match(/D(\d+)/i);return{score:m?Number(m[1]):null,label:text}}
function aggregate(rows){
  const q=rows.reduce((s,r)=>s+qty(r),0);
  const buy=rows.reduce((s,r)=>s+(n(r?.buy_total_czk)||n(r?.buy_each_czk)*qty(r)),0);
  let target=0,targetKnown=0;
  for(const r of rows){const each=targetEach(r);if(each>0){targetKnown++;target+=each*qty(r)}}
  const payoutRows=rows.filter(r=>n(r?.payout_received_czk)>0);
  const payout=payoutRows.reduce((s,r)=>s+n(r.payout_received_czk),0);
  const payoutBuy=payoutRows.reduce((s,r)=>s+(n(r?.buy_total_czk)||n(r?.buy_each_czk)*qty(r)),0);
  const net=payoutRows.length?payout-payoutBuy:null;
  const active=rows.filter(r=>ACTIVE.has(status(r))).length,sold=rows.filter(r=>SOLD.has(status(r))).length;
  const dates=rows.map(r=>Date.parse(eventDate(r))).filter(Number.isFinite).sort((a,b)=>a-b);
  const dateLabel=dates.length?(dates[0]===dates.at(-1)?fmtDate(dates[0]):`${fmtDate(dates[0])} – ${fmtDate(dates.at(-1))}`):'—';
  const platforms=[...new Set(rows.map(platform))];
  return{q,buy,target,targetKnown,grossPotential:targetKnown===rows.length&&rows.length?target-buy:null,payoutRows:payoutRows.length,payout,net,active,sold,dateLabel,platforms};
}
function ensure(){
  if(wrap?.isConnected)return wrap;
  wrap=document.createElement('div');
  wrap.className='td509-wrap';
  wrap.dataset.eventDetail509='1';
  wrap.hidden=true;
  wrap.innerHTML='<div class="td509-backdrop" data-td509-close></div><aside class="td509-panel" role="dialog" aria-modal="true" aria-labelledby="td509-title"><header class="td509-head"><div><small>EVENT DASHBOARD · OS509</small><h2 id="td509-title">Event</h2><p data-td509-sub></p></div><button type="button" class="td509-close" data-td509-close aria-label="Zavřít">×</button></header><div class="td509-body" data-td509-body></div></aside>';
  document.body.appendChild(wrap);
  wrap.addEventListener('click',event=>{
    if(event.target.closest('[data-td509-close]')){close();return}
    const rowButton=event.target.closest('[data-td509-row-open]');
    if(rowButton){
      const id=String(rowButton.dataset.td509RowOpen||'');
      close();
      const target=[...document.querySelectorAll('[data-ticket-detail]')].find(x=>String(x.dataset.ticketDetail)===id);
      target?.click();
    }
  });
  return wrap;
}
function close(){if(wrap)wrap.hidden=true;delete document.documentElement.dataset.ticketDetail509}
function rowMarkup(row,el){
  const d=decision(el),q=qty(row),buy=n(row?.buy_total_czk)||n(row?.buy_each_czk)*q,buyEach=n(row?.buy_each_czk)||(q?buy/q:0),target=targetEach(row),targetTotal=target*q,payout=n(row?.payout_received_czk),actualNet=payout>0?payout-buy:null;
  const seat=[row?.section,row?.row_label?`řada ${row.row_label}`:''].filter(Boolean).join(' · ')||'bez sektoru';
  const sellLine=memberText(el,'[data-col="sell"] small',target?`${money(target)} / ks`:'bez cíle');
  const profitLine=actualNet!==null?`NET ${signed(actualNet)}`:memberText(el,'[data-col="profit"] small','NET čeká na payout');
  const statusLabel=memberText(el,'[data-col="status"] .td331-badge',status(row)||'—');
  return `<tr>
    <td><button type="button" class="td509-row-link" data-td509-row-open="${esc(row.id)}"><b>${esc(seat)}</b><small>${esc(fmtDate(eventDate(row)))} · ${esc(platform(row))}</small></button></td>
    <td class="num"><b>${q}</b></td>
    <td class="num"><b>${money(buy)}</b><small>${buyEach>0?`${money(buyEach)} / ks`:'—'}</small></td>
    <td class="num"><b>${targetTotal?money(targetTotal):'—'}</b><small>${esc(sellLine)}</small></td>
    <td class="num ${actualNet!==null?(actualNet>=0?'good':'bad'):''}"><b>${actualNet!==null?signed(actualNet):memberText(el,'[data-col="profit"] b','—')}</b><small>${esc(profitLine)}</small></td>
    <td><span class="td509-score ${d.score!==null&&d.score>=65?'strong':''}">${d.score===null?'D—':`D${d.score}`}</span><small>${esc(d.label.split('·').slice(1).join('·').trim()||statusLabel)}</small></td>
  </tr>`;
}
function render(title,rows,memberEls){
  const ui=ensure(),a=aggregate(rows),body=ui.querySelector('[data-td509-body]');
  ui.querySelector('#td509-title').textContent=title||'Event';
  ui.querySelector('[data-td509-sub]').textContent=`${a.dateLabel} · ${a.platforms.join(' + ')||'Evidence'} · ${rows.length} pozic`;
  const targetLabel=a.targetKnown?money(a.target):'—',potential=a.grossPotential===null?'—':signed(a.grossPotential),net=a.net===null?'—':signed(a.net);
  body.innerHTML=`
    <section class="td509-kpis">
      <article><small>Vstupenek</small><b>${a.q}</b><span>${rows.length} pozic</span></article>
      <article><small>Vložený kapitál</small><b>${money(a.buy)}</b><span>${a.active} aktivní · ${a.sold} prodané</span></article>
      <article><small>Cílová hodnota</small><b>${targetLabel}</b><span>${a.targetKnown}/${rows.length} pozic s cenou</span></article>
      <article class="${a.grossPotential!==null&&a.grossPotential>=0?'good':a.grossPotential!==null?'bad':''}"><small>Hrubý potenciál</small><b>${potential}</b><span>před payout fee</span></article>
      <article class="${a.net!==null&&a.net>=0?'good':a.net!==null?'bad':''}"><small>Skutečný NET</small><b>${net}</b><span>${a.payoutRows}/${a.sold} payoutů známo</span></article>
      <article><small>Platformy</small><b>${a.platforms.length}</b><span>${esc(a.platforms.join(' · ')||'Evidence')}</span></article>
    </section>
    <section class="td509-positions"><div class="td509-section-head"><div><small>POZICE V EVENTU</small><h3>Sektory, ceny a rozhodnutí</h3></div><span>Klikni na sektor pro původní detail</span></div>
      <div class="td509-table-wrap"><table><thead><tr><th>Pozice</th><th>Ks</th><th>Nákup</th><th>Cíl / prodej</th><th>Výsledek</th><th>Decision</th></tr></thead><tbody>${rows.map((r,i)=>rowMarkup(r,memberEls[i])).join('')}</tbody></table></div>
    </section>
    <footer class="td509-note">OS509 pouze agreguje už evidovaná data. Hrubý potenciál není čistý zisk; skutečný NET se ukazuje jen u reálně přijatých payoutů.</footer>`;
  ui.hidden=false;
  document.documentElement.dataset.ticketDetail509='open';
  window.__KAMIL_TICKET_EVENT_DETAIL509__={version:VERSION,healthy:true,title,positions:rows.length,qty:a.q,buy:a.buy,target:a.target,grossPotential:a.grossPotential,actualNet:a.net,at:Date.now()};
}
async function load(force=false){
  if(cloud?.ok&&!force)return cloud;
  if(loading&&!force)return loading;
  loading=(async()=>{try{const next=await loadTicketCloud660();if(next?.ok)cloud=next;return next}catch(error){console.warn('[ticketEventDetail509]',error);return null}finally{loading=null}})();
  return loading;
}
async function openFromSummary(summary){
  const next=await load();if(!next?.ok)return;
  const key=String(summary?.dataset.group508Summary||'');if(!key)return;
  const grid=summary.parentElement,memberEls=[...grid.querySelectorAll(`:scope > .td500-ticket-row[data-group508="${CSS.escape(key)}"]`)];
  const ids=new Set(memberEls.map(el=>String(el.dataset.ticketId)));
  const rows=(next.inventory||[]).filter(r=>ids.has(String(r.id)));
  if(!rows.length)return;
  const title=summary.querySelector('.td508-event-main b')?.textContent?.trim()||rows[0]?.event_name||rows[0]?.eventName||'Event';
  render(title,rows,memberEls);
}
export function installTicketEventDetail509(){
  ensure();
  if(bound)return;
  bound=true;
  const root=document.querySelector('#ticketIntelView');
  root?.addEventListener('click',event=>{
    const main=event.target.closest('.td508-event-main');
    if(!main||event.target.closest('.td508-folder'))return;
    const summary=main.closest('[data-group508-summary]');
    if(!summary)return;
    event.preventDefault();event.stopImmediatePropagation();openFromSummary(summary);
  },true);
  window.addEventListener('kamil:ticket-refresh397-done',()=>load(true));
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&wrap&&!wrap.hidden)close()});
}
