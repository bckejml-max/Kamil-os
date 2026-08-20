import {ticketDecision} from './live24.js';

const n=v=>Number(v||0);
const flow=x=>String(x.workflow||'HOLD').toUpperCase();
const active=x=>['HOLD','LISTED'].includes(flow(x));
const daysTo=raw=>{if(!raw)return null;const d=new Date(raw);if(Number.isNaN(d.getTime()))return null;const a=new Date(),b=new Date(d);a.setHours(0,0,0,0);b.setHours(0,0,0,0);return Math.round((b-a)/86400000)};
const exitPrice=(x,d)=>n(d.recommendedListPricePerTicket)||n(x.listPrice)||n(d.marketPricePerTicket)||n(x.marketPrice)||0;

export function ticketSellCockpit(s){
 const items=(s.ticketBook?.items||[]).filter(active),rows=items.map(x=>({x,d:ticketDecision(x,s)}));
 const openQty=items.reduce((sum,x)=>sum+Math.max(1,n(x.qty)||1),0),capitalAtRisk=items.reduce((sum,x)=>sum+n(x.buy),0);
 const priced=rows.filter(({x,d})=>exitPrice(x,d)>0),coveredCapital=priced.reduce((sum,{x})=>sum+n(x.buy),0),projectedExit=priced.reduce((sum,{x,d})=>sum+exitPrice(x,d)*Math.max(1,n(x.qty)||1),0);
 const urgent=rows.filter(({d})=>n(d.priority)>=80),sellNow=rows.filter(({d})=>['SELL','REPRICE','LIST'].includes(String(d.action||'').toUpperCase()));
 const eventDays=items.map(x=>daysTo(x.date)).filter(v=>v!==null&&v>=0).sort((a,b)=>a-b),nextEventDays=eventDays.length?eventDays[0]:null;
 const pricingCoverage=items.length?Math.round(priced.length/items.length*100):100;
 const projectedProfit=priced.length?projectedExit-coveredCapital:null;
 const actionCounts={};for(const {d} of rows){const k=String(d.action||'HOLD').toUpperCase();actionCounts[k]=(actionCounts[k]||0)+1}
 const top=rows.sort((a,b)=>n(b.d.priority)-n(a.d.priority)).slice(0,3).map(({x,d})=>({id:x.id,name:x.name,qty:Math.max(1,n(x.qty)||1),action:d.action,priority:n(d.priority),confidence:d.confidence??null,when:d.when,reason:d.reason,pricePerTicket:exitPrice(x,d)||null,source:d.source||'AUTO'}));
 return {positions:items.length,openQty,capitalAtRisk,urgent:urgent.length,actionable:sellNow.length,pricingCoverage,pricedPositions:priced.length,nextEventDays,projectedExit:priced.length?projectedExit:null,projectedProfit,actionCounts,top};
}
