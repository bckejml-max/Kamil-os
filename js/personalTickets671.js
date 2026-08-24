import {qs,h} from './utils.js';
import {loadTicketCloud660,scanTicketsNow660} from './ticketCloud660.js';
import {openTicketCommander660} from './ticketCommander660.js';
import {ticketDecisionSummaryHtml671,ticketDecisionRowHtml671} from './ticketDecisionUi671.js';

let renderToken=0;

const active=row=>['LISTED','NOT_LISTED'].includes(row?.market_status);
const statusText=cloud=>{
 const activeRows=cloud.inventory.filter(active);
 const latest=[...cloud.snapshots].sort((a,b)=>String(b.checked_at||'').localeCompare(String(a.checked_at||'')))[0];
 const checked=latest?.checked_at?new Date(latest.checked_at).toLocaleString('cs-CZ'):'čekám na první snapshot';
 return `${activeRows.length} aktivních pozic · poslední monitoring ${checked}`;
};

function loadingHtml(){return `<div class="ux64-page"><div class="view-head"><div><div class="eyebrow">VSTUPENKY 67.1</div><h1>Ticket Decision Center</h1><p>Načítám portfolio a poslední tržní snapshoty…</p></div></div><section class="card"><div class="empty">Načítám Ticket Intelligence…</div></section></div>`}

function errorHtml(reason='Ticket cloud není dostupný.'){
 return `<div class="ux64-page"><div class="view-head"><div><div class="eyebrow">VSTUPENKY 67.1</div><h1>Ticket Decision Center</h1><p>${h(reason)}</p></div><div class="row-actions"><button class="btn primary" id="ticketOpenCommander671">Otevřít Ticket Commander</button></div></div><section class="card"><div class="empty">Pro Decision Engine potřebuji připojený ticket cloud. Původní Ticket Commander zůstává dostupný.</div></section></div>`;
}

function viewHtml(cloud){
 const rows=cloud.inventory.filter(active).sort((a,b)=>String(a.event_date||'').localeCompare(String(b.event_date||'')));
 const decisions=rows.slice(0,8).map(row=>{
  const snap=cloud.latest?.get(row.id)||null;
  return `<section class="card ti67-position"><div class="row"><div><b>${h(row.event_name||'Vstupenka')}</b><div class="muted">${h(row.section||'bez sekce')} · ${Number(row.qty||1)} ks${row.event_date?` · ${h(new Date(`${String(row.event_date).slice(0,10)}T12:00:00`).toLocaleDateString('cs-CZ'))}`:''}</div></div><button class="btn" data-ticket-detail="1">Detail</button></div>${ticketDecisionRowHtml671(cloud,row,snap)}</section>`;
 }).join('');
 return `<div class="ux64-page"><div class="view-head"><div><div class="eyebrow">VSTUPENKY 67.1</div><h1>Ticket Decision Center</h1><p>${h(statusText(cloud))}</p></div><div class="row-actions"><button class="btn primary" id="ticketRefresh671">Obnovit trh</button><button class="btn" id="ticketOpenCommander671">Detailní Commander</button></div></div>${ticketDecisionSummaryHtml671(cloud)}<div class="view-head compact"><div><div class="eyebrow">PORTFOLIO</div><h2>Rozhodnutí podle pozic</h2></div></div>${decisions||'<section class="card"><div class="empty success-empty">Žádná aktivní ticketová pozice.</div></section>'}${rows.length>8?`<section class="card"><div class="muted">Zobrazuji 8 prioritních pozic. Kompletní portfolio otevři v Detailním Commanderu.</div></section>`:''}</div>`;
}

function bind(host){
 host.querySelector('#ticketOpenCommander671')?.addEventListener('click',()=>openTicketCommander660());
 host.querySelectorAll('[data-ticket-detail]').forEach(b=>b.addEventListener('click',()=>openTicketCommander660()));
 host.querySelector('#ticketRefresh671')?.addEventListener('click',async()=>{
  const button=host.querySelector('#ticketRefresh671');if(button){button.disabled=true;button.textContent='Obnovuji…'}
  try{
   const cloud=await loadTicketCloud660();
   if(!cloud.ok)throw cloud.error||new Error('Ticket cloud není dostupný');
   await scanTicketsNow660(cloud.inventory);
   await hydrate(host,++renderToken);
  }catch(error){
   if(button){button.disabled=false;button.textContent='Obnovit trh'}
   const note=document.createElement('div');note.className='card';note.innerHTML=`<div class="empty">Obnova trhu selhala: ${h(error?.message||error)}</div>`;host.prepend(note);
  }
 });
}

async function hydrate(host,token){
 const cloud=await loadTicketCloud660();
 if(token!==renderToken||!host.isConnected)return;
 if(!cloud.ok){host.innerHTML=errorHtml(cloud.error?.message||cloud.reason||'Ticket cloud není dostupný.');bind(host);return}
 host.innerHTML=viewHtml(cloud);bind(host);
 if(typeof window!=='undefined')window.__KAMIL_TICKETS_671_LAST__={at:Date.now(),active:cloud.inventory.filter(active).length,snapshots:cloud.snapshots.length,alerts:cloud.alerts.length};
}

export function renderPersonalTickets671(){
 const host=qs('#ticketsView');if(!host)return;
 const token=++renderToken;host.innerHTML=loadingHtml();hydrate(host,token).catch(error=>{if(token!==renderToken)return;host.innerHTML=errorHtml(error?.message||error);bind(host)});
}
