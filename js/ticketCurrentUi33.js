import {store} from './state.js';
import {h,money,qs} from './utils.js';

const SNAPSHOT='tickets-2026-08-21';
const active=x=>['HOLD','LISTED'].includes(String(x.workflow||'HOLD').toUpperCase());
const listed=x=>String(x.workflow||'').toUpperCase()==='LISTED'&&Number(x.listPrice||0)>0;

function listingRow(x){
 const owned=Math.max(1,Number(x.qty||1));
 const offered=Math.max(1,Number(x.listedQty||owned));
 const asking=Number(x.listPrice||0);
 const total=asking*offered;
 const buy=Number(x.buy||0);
 const qtyMismatch=offered!==owned;
 const gross=qtyMismatch?null:total-buy;
 const seat=[x.section?`sektor ${x.section}`:'',x.row?`řada ${x.row}`:''].filter(Boolean).join(' · ');
 const recommended=Number(x.viagogoRecommended||0);
 const warning=x.inventoryWarning||'';
 return `<div class="intel-row current-listing33">
  <div class="intel-main"><b>${h(x.eventName||x.name)}</b><span>${h(seat||x.name)} · evidence ${owned} ks · Viagogo nabízí ${offered} ks</span>${warning?`<span class="live-headline">⚠ ${h(warning)}</span>`:''}</div>
  <div class="row-actions"><span class="decision-action">${money(asking)}/ks</span><span class="status">celkem ${money(total)}</span>${recommended?`<span class="status">doporučeno ${money(recommended)}/ks</span>`:''}${gross===null?`<span class="status warn">nesoulad počtu ks</span>`:`<span class="status ${gross>=0?'good':'bad'}">hrubě ${gross>=0?'+':''}${money(gross)}</span>`}</div>
 </div>`;
}

function render(){
 const host=qs('#ticketsView');
 if(!host||!host.children.length||host.querySelector('#currentTicketSnapshot33'))return;
 const anchor=host.querySelector('.ticket-metrics');
 if(!anchor)return;
 const items=(store.get().ticketBook?.items||[]).filter(x=>x.snapshotTag===SNAPSHOT);
 const open=items.filter(active);
 const listings=open.filter(listed);
 if(!open.length)return;
 const qty=open.reduce((n,x)=>n+Math.max(1,Number(x.qty||1)),0);
 const capital=open.reduce((n,x)=>n+Number(x.buy||0),0);
 const offerValue=listings.reduce((n,x)=>n+Number(x.listPrice||0)*Math.max(1,Number(x.listedQty||x.qty||1)),0);
 const warnings=listings.filter(x=>x.inventoryWarning).length;
 const card=document.createElement('div');
 card.id='currentTicketSnapshot33';
 card.className='card';
 card.innerHTML=`<div class="card-head"><div><div class="eyebrow">AKTUÁLNÍ VSTUPENKY · 21. 8. 2026</div><h2>Co právě držíš a za kolik nabízíš</h2></div><span class="status ${warnings?'warn':'good'}">${open.length} pozic · ${qty} ks</span></div>
 <div class="metric-strip"><div class="metric"><span>Aktivní nabídky</span><b>${listings.length}</b></div><div class="metric"><span>Hodnota nabídek</span><b>${money(offerValue)}</b></div><div class="metric"><span>Kapitál v otevřených pozicích</span><b>${money(capital)}</b></div><div class="metric"><span>Kontrola evidence</span><b class="${warnings?'warn':'good'}">${warnings?warnings+' nesoulady':'OK'}</b></div></div>
 <div class="intel-list">${listings.map(listingRow).join('')}</div>
 <div class="decision-note ${warnings?'warn':''}">Nákupy a počty ks jsou z Excelu „Flipování 2026“. Nabídkové a doporučené ceny jsou snapshot aktivních nabídek na Viagogo z 21. 8. 2026. Hrubý rozdíl je před poplatky; při nesouladu počtu kusů ho záměrně nepočítám.</div>`;
 anchor.insertAdjacentElement('afterend',card);
}

const host=qs('#ticketsView');
if(host)new MutationObserver(()=>queueMicrotask(render)).observe(host,{childList:true,subtree:true});
store.subscribe(()=>queueMicrotask(render));
queueMicrotask(render);
