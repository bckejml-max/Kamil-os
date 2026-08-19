import {store} from './state.js';
import {h,money,date,dayDiff,qs,qsa,modal} from './utils.js';
import {ticketStatus} from './intelligence.js';

const flowLabel=x=>({HOLD:'Držím',LISTED:'V prodeji',SOLD:'Prodáno','PAYOUT WAIT':'Čekám na výplatu','PAYOUT RECEIVED':'Vyplaceno'}[x.workflow||'HOLD']||x.workflow||'Držím');
const statusClass=st=>st.score>=85?'bad':st.score>=65?'warn':'good';

export function renderTickets(){
 const s=store.get(),items=[...(s.ticketBook?.items||[])].sort((a,b)=>new Date(a.date||'9999')-new Date(b.date||'9999'));
 const active=items.filter(x=>!['PAYOUT RECEIVED'].includes(x.workflow));
 const listed=items.filter(x=>x.workflow==='LISTED').length;
 const waiting=items.filter(x=>['SOLD','PAYOUT WAIT'].includes(x.workflow)).length;
 const capital=active.filter(x=>!['SOLD','PAYOUT WAIT'].includes(x.workflow)).reduce((n,x)=>n+Number(x.buy||0),0);
 const urgency=items.filter(x=>ticketStatus(x).score>=68).length;
 qs('#ticketsView').innerHTML=`
  <div class="view-head"><div><div class="eyebrow">VSTUPENKY / PORTFOLIO</div><h1>Prodejní portfolio</h1><p>Stav pozic, kapitál, očekávaný zisk a další akce.</p></div><div class="view-head-stat"><b>${money(capital)}</b><span>kapitál v aktivních pozicích</span></div></div>
  <div class="metric-strip">
   <div class="metric"><span>Pozic</span><b>${items.length}</b></div>
   <div class="metric"><span>V prodeji</span><b>${listed}</b></div>
   <div class="metric"><span>Čeká na peníze</span><b>${waiting}</b></div>
   <div class="metric"><span>Brzy řešit</span><b class="${urgency?'warn':'good'}">${urgency}</b></div>
  </div>
  <div class="card ticket-table-card">
   <div class="card-head"><div><div class="eyebrow">POZICE</div><h2>Všechny vstupenky</h2></div><span class="status">${items.length} pozic</span></div>
   <div class="ticket-table">
    <div class="ticket-head"><span>Akce</span><span>Stav</span><span>Datum</span><span>Nákup</span><span>Listing / prodej</span><span>P/L</span><span></span></div>
    ${items.map(row).join('')||'<div class="empty">Žádné vstupenky.</div>'}
   </div>
  </div>`;
 qsa('[data-ticket-edit24]',qs('#ticketsView')).forEach(b=>b.onclick=()=>editTicket(b.dataset.ticketEdit24));
 qsa('[data-ticket-sell24]',qs('#ticketsView')).forEach(b=>b.onclick=()=>sellTicket(b.dataset.ticketSell24));
 qsa('[data-ticket-state24]',qs('#ticketsView')).forEach(b=>b.onclick=()=>store.mutate(`Vstupenka → ${b.dataset.ticketState24}`,s=>{const x=s.ticketBook.items.find(y=>y.id===b.dataset.ticketId24);if(x){x.workflow=b.dataset.ticketState24;if(x.workflow==='PAYOUT RECEIVED')x.payoutAt=new Date().toISOString()}}));
}

function row(x){
 const st=ticketStatus(x),qty=Number(x.qty||1),days=x.date?dayDiff(x.date):null;
 const expected=(Number(x.listPrice||0)*qty)-Number(x.buy||0);
 const actual=Number(x.sell||0)-Number(x.buy||0)-Number(x.fees||0);
 const hasActual=Number(x.sell||0)>0,pl=hasActual?actual:expected;
 const roi=Number(x.buy||0)>0?pl/Number(x.buy||0)*100:0;
 return `<div class="ticket-tr ${st.score>=85?'urgent-row':''}">
  <div class="ticket-event"><b>${h(x.name)}</b><span>${qty} ks · ${h(x.platform||'platforma neuvedena')}</span></div>
  <div><span class="status ${statusClass(st)}">${h(flowLabel(x))}</span><small>${h(st.label)}</small></div>
  <div><b>${date(x.date)}</b><small>${days===null?'':days<0?`${Math.abs(days)} d po akci`:days===0?'dnes':`za ${days} d`}</small></div>
  <div><b>${money(x.buy)}</b><small>${qty} ks</small></div>
  <div><b>${hasActual?money(x.sell):money(Number(x.listPrice||0)*qty)}</b><small>${hasActual?'prodej celkem':'listing celkem'}</small></div>
  <div><b class="${pl>=0?'good':'bad'}">${money(pl)}</b><small>${Number.isFinite(roi)?roi.toFixed(1):'0.0'} %</small></div>
  <div class="ticket-actions"><button class="btn" data-ticket-edit24="${x.id}">Upravit</button>${buttons(x)}</div>
 </div>`;
}
function buttons(x){
 if((x.workflow||'HOLD')==='HOLD')return `<button class="btn primary" data-ticket-state24="LISTED" data-ticket-id24="${x.id}">Do prodeje</button>`;
 if(x.workflow==='LISTED')return `<button class="btn primary" data-ticket-sell24="${x.id}">Prodáno</button>`;
 if(x.workflow==='SOLD')return `<button class="btn" data-ticket-state24="PAYOUT WAIT" data-ticket-id24="${x.id}">Čekám na výplatu</button>`;
 if(x.workflow==='PAYOUT WAIT')return `<button class="btn primary" data-ticket-state24="PAYOUT RECEIVED" data-ticket-id24="${x.id}">Vyplaceno</button>`;
 return '';
}

async function editTicket(id){
 const x=store.get().ticketBook.items.find(y=>y.id===id);if(!x)return;
 const body=`<div class="form-grid"><label>Platforma<input id="t24platform" value="${h(x.platform||'')}"></label><label>Počet ks<input id="t24qty" type="number" value="${Number(x.qty)||1}"></label><label>Nákup celkem<input id="t24buy" type="number" value="${Number(x.buy)||0}"></label><label>Datum akce<input id="t24date" type="date" value="${x.date?String(x.date).slice(0,10):''}"></label><label>Listing cena za kus<input id="t24list" type="number" value="${Number(x.listPrice)||0}"></label><label>Prodej celkem<input id="t24sell" type="number" value="${Number(x.sell)||0}"></label><label>Poplatky<input id="t24fees" type="number" value="${Number(x.fees)||0}"></label></div>`;
 const ok=await modal('Upravit vstupenku',body,[{label:'Zrušit',value:false},{label:'Uložit',value:true,primary:true}]);if(!ok)return;
 store.mutate('Upravena vstupenka',s=>{const t=s.ticketBook.items.find(y=>y.id===id);if(!t)return;t.platform=qs('#t24platform')?.value||'';t.qty=Number(qs('#t24qty')?.value||1);t.buy=Number(qs('#t24buy')?.value||0);t.date=qs('#t24date')?.value||t.date;t.listPrice=Number(qs('#t24list')?.value||0);t.sell=Number(qs('#t24sell')?.value||0);t.fees=Number(qs('#t24fees')?.value||0)});
}
async function sellTicket(id){
 const x=store.get().ticketBook.items.find(y=>y.id===id);if(!x)return;
 const suggested=Number(x.listPrice||0)*Number(x.qty||1);
 const body=`<div class="form-grid"><label>Prodej celkem<input id="t24sale" type="number" value="${suggested||Number(x.sell)||0}"></label><label>Poplatky<input id="t24saleFees" type="number" value="${Number(x.fees)||0}"></label></div>`;
 const ok=await modal('Vstupenka prodána',body,[{label:'Zrušit',value:false},{label:'Uložit prodej',value:true,primary:true}]);if(!ok)return;
 const sell=Number(qs('#t24sale')?.value||0),fees=Number(qs('#t24saleFees')?.value||0);
 store.mutate('Vstupenka prodána',s=>{const t=s.ticketBook.items.find(y=>y.id===id);if(!t||t.workflow==='SOLD')return;t.workflow='SOLD';t.sell=sell;t.fees=fees;t.soldAt=new Date().toISOString()});
}
