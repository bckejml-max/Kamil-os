import {dayDiff} from './utils.js';
import {ticketDecision} from './live24.js';

const n=v=>Number(v||0);
const flow=x=>String(x.workflow||'HOLD').toUpperCase();
const activeFlow=x=>['HOLD','LISTED'].includes(flow(x));
const soldFlow=x=>['SOLD','PAYOUT WAIT','PAYOUT RECEIVED'].includes(flow(x));

export function ticketEventName(x){
 if(x.eventName)return String(x.eventName).trim();
 const raw=String(x.name||'Vstupenková akce').trim();
 const parts=raw.split(/\s+-\s+/);
 if(parts.length<2)return raw;
 const tail=parts[parts.length-1].trim();
 const seatLike=/^(?:[A-Z]{1,4}\d{0,3}|\d{2,4})(?:[-/, ](?:[A-Z]?\d+))*$/i.test(tail)||/^(?:sector|sektor|block|blok|row|řada|standing|stání|gc|golden circle)\b/i.test(tail);
 return seatLike?parts.slice(0,-1).join(' - '):raw;
}

export function ticketEventKey(x){
 if(x.eventKey)return String(x.eventKey);
 if(x.eventId)return `id:${x.eventId}`;
 const date=String(x.date||'bez-data').slice(0,10);
 return `${date}|${ticketEventName(x).toLocaleLowerCase('cs-CZ')}`;
}

export function ticketEventGroups(s){
 const map=new Map();
 for(const x of s.ticketBook?.items||[]){
  const key=ticketEventKey(x),name=ticketEventName(x);
  if(!map.has(key))map.set(key,{key,name,date:x.date||null,items:[]});
  const g=map.get(key);g.items.push(x);if(!g.date&&x.date)g.date=x.date;
 }
 return [...map.values()].map(g=>summarizeGroup(g,s)).sort((a,b)=>{
  const aa=a.date?new Date(a.date).getTime():Infinity,bb=b.date?new Date(b.date).getTime():Infinity;
  const aPast=aa<Date.now(),bPast=bb<Date.now();
  if(aPast!==bPast)return aPast?1:-1;
  return aPast?bb-aa:aa-bb;
 });
}

function summarizeGroup(g,s){
 const active=g.items.filter(activeFlow),sold=g.items.filter(soldFlow),done=g.items.filter(x=>flow(x)==='PAYOUT RECEIVED');
 const totalQty=g.items.reduce((z,x)=>z+Math.max(1,n(x.qty)||1),0);
 const activeQty=active.reduce((z,x)=>z+Math.max(1,n(x.qty)||1),0);
 const soldQty=sold.reduce((z,x)=>z+Math.max(1,n(x.qty)||1),0);
 const invested=g.items.reduce((z,x)=>z+n(x.buy),0),capitalAtRisk=active.reduce((z,x)=>z+n(x.buy),0);
 const realizedRevenue=sold.reduce((z,x)=>z+n(x.sell),0),fees=sold.reduce((z,x)=>z+n(x.fees),0);
 const realizedProfit=sold.reduce((z,x)=>z+n(x.sell)-n(x.buy)-n(x.fees),0);
 const priced=active.filter(x=>n(x.listPrice)>0),projectedRevenue=priced.reduce((z,x)=>z+n(x.listPrice)*Math.max(1,n(x.qty)||1),0);
 const projectedCost=priced.reduce((z,x)=>z+n(x.buy),0),projectedProfit=priced.length?projectedRevenue-projectedCost:null;
 const decisions=active.map(x=>({x,d:ticketDecision(x,s)})).sort((a,b)=>n(b.d.priority)-n(a.d.priority));
 const topDecision=decisions[0]?.d||null;
 const days=g.date?dayDiff(g.date):null;
 return {...g,totalQty,activeQty,soldQty,payoutQty:done.reduce((z,x)=>z+Math.max(1,n(x.qty)||1),0),invested,capitalAtRisk,realizedRevenue,realizedProfit,fees,pricedQty:priced.reduce((z,x)=>z+Math.max(1,n(x.qty)||1),0),projectedRevenue:priced.length?projectedRevenue:null,projectedProfit,decisions,topDecision,days};
}

export function ticketEventStats(groups){
 const upcoming=groups.filter(g=>g.days===null||g.days>=0),active=groups.filter(g=>g.activeQty>0);
 return {
  events:groups.length,
  activeEvents:active.length,
  activeQty:active.reduce((z,g)=>z+g.activeQty,0),
  capitalAtRisk:active.reduce((z,g)=>z+g.capitalAtRisk,0),
  urgentEvents:active.filter(g=>Number(g.topDecision?.priority||0)>=80).length,
  nextEvent:upcoming[0]||null
 };
}
