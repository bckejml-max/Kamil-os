import {buildTicketRiskBudget202} from './ticketRiskBudgetModel202.js';

export const TICKET_CAPITAL_ALLOCATOR_VERSION_203=203;
const n=v=>Number(v||0)||0;
const text=v=>String(v??'').trim();

const weightFor=row=>{
 const score=Math.max(0,n(row.score));
 const upside=Math.max(0,n(row.upsidePct));
 const confidence=Math.max(0,n(row.confidenceScore??row.confidence));
 return Math.max(1,score*(1+Math.min(2,upside/100))*(1+Math.min(.5,confidence/200)));
};

export function allocateTicketCapital203(riskDesk={},opts={}){
 const capital=n(riskDesk?.capital?.total);
 const invested=n(riskDesk?.capital?.invested);
 const reservePct=Math.max(0,Math.min(50,n(opts.reservePct)||10));
 const reserve=capital>0?Math.floor(capital*reservePct/100):0;
 const available=Math.max(0,capital-invested-reserve);
 const candidates=(riskDesk?.buy||[]).map(row=>{
  const price=n(row.riskBudget?.buyPrice);
  const maxQty=Math.max(0,Math.floor(n(row.riskBudget?.maxQty)));
  const maxBudget=n(row.riskBudget?.allowedBudget);
  return {...row,allocation:{weight:weightFor(row),price,maxQty,maxBudget,qty:0,capital:0}};
 }).filter(r=>r.allocation.price>0&&r.allocation.maxQty>0);
 let remaining=available;
 const totalWeight=candidates.reduce((s,r)=>s+r.allocation.weight,0)||1;
 for(const row of candidates){
  const share=Math.floor(available*(row.allocation.weight/totalWeight));
  const qty=Math.min(row.allocation.maxQty,Math.floor(Math.min(share,row.allocation.maxBudget||share)/row.allocation.price));
  row.allocation.qty=qty;row.allocation.capital=qty*row.allocation.price;remaining-=row.allocation.capital;
 }
 let guard=0;
 while(remaining>0&&guard++<1000){
  const eligible=candidates.filter(r=>r.allocation.qty<r.allocation.maxQty&&r.allocation.capital+r.allocation.price<=r.allocation.maxBudget&&r.allocation.price<=remaining).sort((a,b)=>b.allocation.weight-a.allocation.weight);
  if(!eligible.length)break;
  const row=eligible[0];row.allocation.qty++;row.allocation.capital+=row.allocation.price;remaining-=row.allocation.price;
 }
 const rows=candidates.sort((a,b)=>b.allocation.capital-a.allocation.capital||b.allocation.weight-a.allocation.weight);
 return {version:TICKET_CAPITAL_ALLOCATOR_VERSION_203,capital,invested,reservePct,reserve,available,allocated:rows.reduce((s,r)=>s+r.allocation.capital,0),remaining,rows,summary:{candidates:rows.length,funded:rows.filter(r=>r.allocation.qty>0).length,unfunded:rows.filter(r=>r.allocation.qty===0).length}};
}

export function buildTicketCapitalAllocator203(input={},now=Date.now(),opts={}){
 const riskDesk=buildTicketRiskBudget202(input,now,opts);
 const allocation=allocateTicketCapital203(riskDesk,opts);
 return {...allocation,riskDesk};
}
