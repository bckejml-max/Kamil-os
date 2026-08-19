import {store} from './state.js';
import {h,money,date,dayDiff,uid,qs,qsa,modal} from './utils.js';
import {ticketStatus} from './intelligence.js';
import {ticketDecision,ticketOpportunityDecision,actionLabel} from './decision24.js';

let ticketFilter='active';
const flowLabel=x=>({HOLD:'Držím',LISTED:'V prodeji',SOLD:'Prodáno','PAYOUT WAIT':'Čekám na výplatu','PAYOUT RECEIVED':'Vyplaceno'}[x.workflow||'HOLD']||x.workflow||'Držím');
const statusClass=st=>st.score>=85?'bad':st.score>=65?'warn':'good';
const workflow=x=>x.workflow||'HOLD';
const expectedProfit=x=>(Number(x.listPrice||0)*Number(x.qty||1))-Number(x.buy||0);
const actualProfit=x=>Number(x.sell||0)-Number(x.buy||0)-Number(x.fees||0);
const matchesFilter=x=>ticketFilter==='all'||(ticketFilter==='active'&&['HOLD','LISTED'].includes(workflow(x)))||(ticketFilter==='payout'&&['SOLD','PAYOUT WAIT'].includes(workflow(x)))||(ticketFilter==='done'&&workflow(x)==='PAYOUT RECEIVED');

export function renderTickets(){
 const s=store.get(),items=[...(s.ticketBook?.items||[])].sort((a,b)=>new Date(a.date||'9999')-new Date(b.date||'9999')),watch=[...(s.ticketBook?.watchlist||[])];
 const active=items.filter(x=>['HOLD','LISTED'].includes(workflow(x))),decisions=active.map(x=>({x,d:ticketDecision(x)})).sort((a,b)=>b.d.priority-a.d.priority);
 const listed=items.filter(x=>workflow(x)==='LISTED').length,waiting=items.filter(x=>['SOLD','PAYOUT WAIT'].includes(workflow(x))).length,done=items.filter(x=>workflow(x)==='PAYOUT RECEIVED').length;
 const capital=active.reduce((n,x)=>n+Number(x.buy||0),0),urgency=decisions.filter(x=>x.d.priority>=80).length;
 const expected=active.reduce((n,x)=>n+(Number(x.listPrice||0)>0?expectedProfit(x):0),0),realized=items.filter(x=>Number(x.sell||0)>0).reduce((n,x)=>n+actualProfit(x),0),shown=items.filter(matchesFilter);
 const buyNow=watch.map(x=>({x,d:ticketOpportunityDecision(x)})).filter(y=>y.d.action==='BUY').length;
 qs('#ticketsView').innerHTML=`
  <div class="view-head"><div><div class="eyebrow">VSTUPENKY / INTELLIGENCE</div><h1>Kdy koupit a kdy prodat</h1><p>Portfolio, sell timing, cenová pravidla a radar oficiálních nákupních příležitostí.</p></div><div class="view-head-stat"><b>${money(capital)}</b><span>kapitál v aktivních pozicích</span></div></div>
  <div class="metric-strip ticket-metrics">
   <div class="metric"><span>Aktivní pozice</span><b>${active.length}</b></div><div class="metric"><span>K řešení teď</span><b class="${urgency?'warn':'good'}">${urgency}</b></div><div class="metric"><span>Nákupní radar</span><b class="${buyNow?'good':''}">${buyNow}</b></div><div class="metric"><span>Realizovaný P/L</span><b class="${realized>=0?'good':'bad'}">${money(realized)}</b></div>
  </div>

  <div class="ticket-intel-grid">
   <div class="card"><div class="card-head"><div><div class="eyebrow">SELL / HOLD RADAR</div><h2>Co udělat s pozicemi</h2></div><span class="status">${active.length} aktivních</span></div>
    <div class="intel-list">${decisions.slice(0,8).map(({x,d})=>intelRow(x,d)).join('')||'<div class="empty">Žádná aktivní pozice.</div>'}</div>
    <div class="decision-note">Tržní cenu, floor a max nákup můžeš uložit přes „Strategie“. Jakmile jsou vyplněné, doporučení je používá.</div>
   </div>
   <div class="card"><div class="card-head"><div><div class="eyebrow">BUY RADAR</div><h2>Co koupit oficiálně</h2></div><button class="btn" id="addTicketOpportunity">＋ Příležitost</button></div>
    ${watch.sort((a,b)=>new Date(a.saleAt||'9999')-new Date(b.saleAt||'9999')).map(opportunityRow).join('')||'<div class="empty">Přidej akci, presale/on-sale termín a maximální nákupní cenu. Kamil OS pak řekne, kdy nakoupit.</div>'}
   </div>
  </div>

  <div class="card ticket-table-card">
   <div class="card-head ticket-card-head"><div><div class="eyebrow">POZICE</div><h2>${filterTitle()}</h2></div><div class="row-actions"><span class="status">${shown.length} z ${items.length}</span><button class="btn" data-capture-tickets>＋ Přidat</button></div></div>
   <div class="ticket-filters" role="tablist" aria-label="Filtr vstupenek">${filterBtn('active',`Aktivní · ${active.length}`)}${filterBtn('payout',`Čekám na peníze · ${waiting}`)}${filterBtn('done',`Vyplaceno · ${done}`)}${filterBtn('all',`Vše · ${items.length}`)}</div>
   <div class="ticket-table"><div class="ticket-head"><span>Akce</span><span>Stav</span><span>Datum</span><span>Nákup</span><span>Listing / prodej</span><span>P/L</span><span></span></div>${shown.map(row).join('')||'<div class="empty">V tomto filtru nejsou žádné vstupenky.</div>'}</div>
  </div>`;
 qsa('[data-ticket-filter]',qs('#ticketsView')).forEach(b=>b.onclick=()=>{ticketFilter=b.dataset.ticketFilter;renderTickets()});
 qsa('[data-capture-tickets]',qs('#ticketsView')).forEach(b=>b.onclick=()=>window.dispatchEvent(new CustomEvent('kamil:capture',{detail:'ticket'})));
 qsa('[data-ticket-edit24]',qs('#ticketsView')).forEach(b=>b.onclick=()=>editTicket(b.dataset.ticketEdit24));
 qsa('[data-ticket-strategy]',qs('#ticketsView')).forEach(b=>b.onclick=()=>editTicket(b.dataset.ticketStrategy));
 qsa('[data-ticket-sell24]',qs('#ticketsView')).forEach(b=>b.onclick=()=>sellTicket(b.dataset.ticketSell24));
 qsa('[data-ticket-state24]',qs('#ticketsView')).forEach(b=>b.onclick=()=>store.mutate(`Vstupenka → ${b.dataset.ticketState24}`,s=>{const x=s.ticketBook.items.find(y=>y.id===b.dataset.ticketId24);if(x){x.workflow=b.dataset.ticketState24;if(x.workflow==='PAYOUT RECEIVED')x.payoutAt=new Date().toISOString()}}));
 qs('#addTicketOpportunity')?.addEventListener('click',addOpportunity);
 qsa('[data-opportunity-done]',qs('#ticketsView')).forEach(b=>b.onclick=()=>store.mutate('Nákupní příležitost uzavřena',s=>{const x=s.ticketBook.watchlist.find(y=>y.id===b.dataset.opportunityDone);if(x)x.status='BOUGHT'}));
}

const filterBtn=(id,label)=>`<button class="ticket-filter ${ticketFilter===id?'on':''}" data-ticket-filter="${id}" role="tab" aria-selected="${ticketFilter===id}">${label}</button>`;
const filterTitle=()=>({active:'Aktivní prodej',payout:'Prodané / čekám na výplatu',done:'Vyplacené obchody',all:'Všechny vstupenky'})[ticketFilter]||'Všechny vstupenky';
const intelRow=(x,d)=>`<div class="intel-row"><div class="intel-main"><b>${h(x.name)}</b><span>${h(d.reason)}</span><div class="intel-rules"><div class="intel-rule"><span>Kdy koupit</span><b>${h(d.buyRule)}</b></div><div class="intel-rule"><span>Kdy prodat</span><b>${h(d.sellRule)}</b></div></div></div><div class="row-actions"><span class="decision-action ${d.tone||''}">${h(actionLabel(d.action))}</span><button class="btn" data-ticket-strategy="${x.id}">Strategie</button></div></div>`;
function opportunityRow(x){const d=ticketOpportunityDecision(x);return `<div class="opportunity-row"><div class="opportunity-top"><div><b>${h(x.name||'Akce')}</b><span>${x.saleAt?'prodej '+date(x.saleAt):'termín prodeje chybí'}${x.platform?' · '+h(x.platform):''}</span></div><span class="decision-action ${d.tone||''}">${h(actionLabel(d.action))}</span></div><div class="opportunity-rule">${h(d.when)} · ${h(d.reason)}</div><div class="row-actions" style="margin-top:7px"><span class="status">max ${money(x.maxBuyPrice||0)}/ks</span><span class="status">cíl ${money(x.targetResale||0)}/ks</span>${x.status!=='BOUGHT'?`<button class="btn" data-opportunity-done="${x.id}">Nakoupeno</button>`:''}</div></div>`}

function row(x){
 const st=ticketStatus(x),qty=Number(x.qty||1),days=x.date?dayDiff(x.date):null,expected=expectedProfit(x),actual=actualProfit(x),hasActual=Number(x.sell||0)>0,pl=hasActual?actual:expected,roi=Number(x.buy||0)>0?pl/Number(x.buy||0)*100:0;
 return `<div class="ticket-tr ${st.score>=85?'urgent-row':''}"><div class="ticket-event"><b>${h(x.name)}</b><span>${qty} ks · ${h(x.platform||'platforma neuvedena')}</span></div><div><span class="status ${statusClass(st)}">${h(flowLabel(x))}</span><small>${h(st.label)}</small></div><div><b>${date(x.date)}</b><small>${days===null?'':days<0?`${Math.abs(days)} d po akci`:days===0?'dnes':`za ${days} d`}</small></div><div><b>${money(x.buy)}</b><small>${qty} ks</small></div><div><b>${hasActual?money(x.sell):money(Number(x.listPrice||0)*qty)}</b><small>${hasActual?'prodej celkem':'listing celkem'}</small></div><div><b class="${pl>=0?'good':'bad'}">${money(pl)}</b><small>${Number.isFinite(roi)?roi.toFixed(1):'0.0'} %</small></div><div class="ticket-actions"><button class="btn" data-ticket-edit24="${x.id}">Upravit</button>${buttons(x)}</div></div>`;
}
function buttons(x){if(workflow(x)==='HOLD')return `<button class="btn primary" data-ticket-state24="LISTED" data-ticket-id24="${x.id}">Do prodeje</button>`;if(workflow(x)==='LISTED')return `<button class="btn primary" data-ticket-sell24="${x.id}">Prodáno</button>`;if(workflow(x)==='SOLD')return `<button class="btn" data-ticket-state24="PAYOUT WAIT" data-ticket-id24="${x.id}">Čekám na výplatu</button>`;if(workflow(x)==='PAYOUT WAIT')return `<button class="btn primary" data-ticket-state24="PAYOUT RECEIVED" data-ticket-id24="${x.id}">Vyplaceno</button>`;return ''}

async function editTicket(id){
 const x=store.get().ticketBook.items.find(y=>y.id===id);if(!x)return;
 const body=`<div class="form-grid"><label>Platforma<input id="t24platform" autofocus value="${h(x.platform||'')}"></label><label>Počet ks<input id="t24qty" type="number" value="${Number(x.qty)||1}"></label><label>Nákup celkem<input id="t24buy" type="number" value="${Number(x.buy)||0}"></label><label>Datum akce<input id="t24date" type="date" value="${x.date?String(x.date).slice(0,10):''}"></label><label>Listing / cílová cena za kus<input id="t24list" type="number" value="${Number(x.listPrice)||0}"></label><label>Tržní cena za kus<input id="t24market" type="number" value="${Number(x.marketPrice)||0}"></label><label>Floor cena za kus<input id="t24floor" type="number" value="${Number(x.floorPrice)||0}"></label><label>Max cena pro další nákup / ks<input id="t24maxbuy" type="number" value="${Number(x.maxBuyPrice)||0}"></label><label>Chci prodat nejpozději<input id="t24sellby" type="date" value="${x.sellBy?String(x.sellBy).slice(0,10):''}"></label><label>Prodej celkem<input id="t24sell" type="number" value="${Number(x.sell)||0}"></label><label>Poplatky<input id="t24fees" type="number" value="${Number(x.fees)||0}"></label></div>`;
 const ok=await modal('Upravit vstupenku a strategii',body,[{label:'Zrušit',value:false},{label:'Uložit',value:true,primary:true}]);if(!ok)return;
 store.mutate('Upravena vstupenka',s=>{const t=s.ticketBook.items.find(y=>y.id===id);if(!t)return;t.platform=qs('#t24platform')?.value||'';t.qty=Number(qs('#t24qty')?.value||1);t.buy=Number(qs('#t24buy')?.value||0);t.date=qs('#t24date')?.value||t.date;t.listPrice=Number(qs('#t24list')?.value||0);t.marketPrice=Number(qs('#t24market')?.value||0);t.floorPrice=Number(qs('#t24floor')?.value||0);t.maxBuyPrice=Number(qs('#t24maxbuy')?.value||0);t.sellBy=qs('#t24sellby')?.value||null;t.sell=Number(qs('#t24sell')?.value||0);t.fees=Number(qs('#t24fees')?.value||0);t.strategyUpdatedAt=new Date().toISOString()});
}
async function sellTicket(id){
 const x=store.get().ticketBook.items.find(y=>y.id===id);if(!x)return;const suggested=Number(x.listPrice||0)*Number(x.qty||1);
 const body=`<div class="form-grid"><label>Prodej celkem<input id="t24sale" autofocus type="number" value="${suggested||Number(x.sell)||0}"></label><label>Poplatky<input id="t24saleFees" type="number" value="${Number(x.fees)||0}"></label></div>`;
 const ok=await modal('Vstupenka prodána',body,[{label:'Zrušit',value:false},{label:'Uložit prodej',value:true,primary:true}]);if(!ok)return;
 const sell=Number(qs('#t24sale')?.value||0),fees=Number(qs('#t24saleFees')?.value||0);
 store.mutate('Vstupenka prodána',s=>{const t=s.ticketBook.items.find(y=>y.id===id);if(!t||t.workflow==='SOLD')return;t.workflow='SOLD';t.sell=sell;t.fees=fees;t.soldAt=new Date().toISOString()});
}
async function addOpportunity(){
 const body=`<div class="form-grid capture-form"><label class="wide-field">Akce<input id="oppName" autofocus placeholder="Např. Sparta – Real Madrid"></label><label>Oficiální prodej / presale<input id="oppSale" type="datetime-local"></label><label>Datum akce<input id="oppDate" type="date"></label><label>Platforma<input id="oppPlatform" placeholder="Ticketmaster / klub…"></label><label>Max nákup / ks<input id="oppMaxBuy" type="number" min="0"></label><label>Cílový resale / ks<input id="oppTarget" type="number" min="0"></label></div>`;
 const ok=await modal('Nákupní příležitost',body,[{label:'Zrušit',value:false},{label:'Přidat do radaru',value:true,primary:true}]);if(!ok)return;
 const name=qs('#oppName')?.value?.trim();if(!name)return;
 const sale=qs('#oppSale')?.value||'',event=qs('#oppDate')?.value||'';
 store.mutate(`Ticket radar: ${name}`,s=>{s.ticketBook=s.ticketBook||{items:[],watchlist:[]};s.ticketBook.watchlist=s.ticketBook.watchlist||[];s.ticketBook.watchlist.unshift({id:uid('ticket-watch'),name,saleAt:sale?new Date(sale).toISOString():null,date:event||null,platform:qs('#oppPlatform')?.value?.trim()||'',maxBuyPrice:Number(qs('#oppMaxBuy')?.value||0),targetResale:Number(qs('#oppTarget')?.value||0),status:'WATCH',createdAt:new Date().toISOString()})});
}
