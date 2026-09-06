import {store} from './state.js';
import {modal,h} from './utils.js';
import {loadTicketCloud660} from './ticketCloud660.js';

const n=v=>Number(v||0);
const has=v=>v!==null&&v!==undefined&&v!=='';
const missing=(x,fields)=>fields.filter(k=>!has(x?.[k]));
const row=(label,value,state='ok')=>`<div class="row"><span>${h(label)}</span><b data-audit-state="${state}">${h(String(value))}</b></div>`;
const item=(title,detail)=>`<div class="row"><div><b>${h(title)}</b><div class="muted">${h(detail)}</div></div></div>`;

function localTicketAudit(s){
 const rows=s.ticketBook?.items||[];
 const active=rows.filter(x=>['HOLD','LISTED','NOT_LISTED'].includes(String(x.workflow||x.marketStatus||'').toUpperCase()));
 const incomplete=rows.filter(x=>missing(x,['qty']).length||(!has(x.buy)&&!has(x.buyTotalCzk))||(!has(x.sell)&&!has(x.sellTotalCzk)&&String(x.workflow||'').toUpperCase().includes('PAYOUT')));
 return{source:'LOCAL FALLBACK',rows,active,incomplete};
}
function propertyAudit(s){
 const rows=s.propertyBook?.candidates||s.propertyBook?.items||[];
 const incomplete=rows.filter(x=>{
  const price=has(x.priceCzk)||has(x.price)||has(x.purchasePriceCzk);
  const rent=has(x.rentCzk)||has(x.rent)||has(x.monthlyRentCzk);
  return !price||!rent;
 });
 return{rows,incomplete};
}
function moneyAudit(s){
 const cash=n(s.financePlan?.cashNow),reserve=n(s.financePlan?.reserveFloor),xtb=n(s.xtbReport?.czkValue),debts=(s.debtBook?.items||[]).reduce((a,x)=>a+n(x.balanceCzk||x.balance||x.amount),0);
 const stale=[];
 if(!s.financePlan?.asOf&&!s.financePlan?.updatedAt)stale.push('Hotovost nemá datum aktualizace');
 if(!s.xtbReport?.asOf&&xtb)stale.push('XTB nemá datum aktualizace');
 return{cash,reserve,xtb,debts,stale};
}
export async function buildDataTruthAudit738(){
 const s=store.get(),localTickets=localTicketAudit(s),property=propertyAudit(s),money=moneyAudit(s);
 let ticketSource='LOCAL FALLBACK',tickets=localTickets.rows,ticketCloudError=null;
 try{const cloud=await loadTicketCloud660();if(cloud?.ok){ticketSource='LIVE CLOUD';tickets=cloud.inventory||[]}else ticketCloudError=cloud?.reason||cloud?.error||'Cloud není dostupný'}catch(e){ticketCloudError=e?.message||String(e)}
 const ticketIncomplete=tickets.filter(x=>{
  const buy=has(x.buy_total_czk)||has(x.buy)||has(x.buyTotalCzk);
  const qty=has(x.qty);
  const status=has(x.market_status)||has(x.marketStatus)||has(x.workflow);
  return !buy||!qty||!status;
 });
 const issues=[
  ...ticketIncomplete.slice(0,8).map(x=>({area:'Vstupenky',title:x.event_name||x.eventName||x.name||x.id||'Vstupenka',detail:'Chybí nákupní cena, množství nebo stav'})),
  ...property.incomplete.slice(0,8).map(x=>({area:'Reality',title:x.name||x.title||x.location||'Kandidát',detail:'Chybí kupní cena nebo očekávaný nájem'})),
  ...money.stale.map(x=>({area:'Peníze',title:'Aktualizovat data',detail:x}))
 ];
 const score=Math.max(0,100-Math.min(70,issues.length*8)-(ticketSource!=='LIVE CLOUD'?15:0));
 return{version:738,ticketSource,ticketCloudError,tickets,ticketIncomplete,property,money,issues,score,generatedAt:new Date().toISOString()};
}
export async function openDataTruthAudit738(){
 const a=await buildDataTruthAudit738();
 const body=`<div class="card"><div class="eyebrow">OS738 · DATA TRUTH AUDIT</div><h2>${a.score}% důvěra v aktuální data</h2>${row('Vstupenky zdroj',a.ticketSource,a.ticketSource==='LIVE CLOUD'?'ok':'warn')}${row('Vstupenky',a.tickets.length)}${row('Vstupenky s chybějícími poli',a.ticketIncomplete.length,a.ticketIncomplete.length?'warn':'ok')}${row('Reality kandidáti',a.property.rows.length)}${row('Reality nekompletní',a.property.incomplete.length,a.property.incomplete.length?'warn':'ok')}${row('Hotovost',`${Math.round(a.money.cash).toLocaleString('cs-CZ')} Kč`)}${row('XTB',`${Math.round(a.money.xtb).toLocaleString('cs-CZ')} Kč`)}${row('Dluhy',`${Math.round(a.money.debts).toLocaleString('cs-CZ')} Kč`)}${a.ticketCloudError?`<div class="muted">Cloud ticket zdroj: ${h(String(a.ticketCloudError))}</div>`:''}</div><div class="card"><div class="eyebrow">CO DOPLNIT</div>${a.issues.length?a.issues.map(x=>item(`${x.area} · ${x.title}`,x.detail)).join(''):'<div class="empty success-empty">Hlavní zdroje jsou kompletní.</div>'}</div>`;
 return modal('Data Truth Audit',body,[{label:'Zavřít',value:null,primary:true}]);
}
