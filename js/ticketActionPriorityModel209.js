import {buildTicketCommander208} from './ticketCommanderModel208.js';

export const TICKET_ACTION_PRIORITY_VERSION_209=209;
const n=v=>Number(v||0)||0;
const ACTION_TIER_209={
 'DO NOT LIST':600,
 'CHECK PAYOUT DATA':500,
 'RAISE TO':400,
 'DROP TO':400,
 'LIST AT':400,
 'VERIFY RULES':300,
 'REFRESH MARKET':200,
 'HOLD / MONITOR':100
};

export function ticketActionPriorityScore209(row={}){
 const type=row?.nextMove?.type||'HOLD / MONITOR';
 const tier=ACTION_TIER_209[type]||50;
 const riskProfit=Math.max(0,n(row?.riskAdjusted?.riskAdjustedProfit));
 const riskScore=Math.max(0,n(row?.riskAdjusted?.rankScore));
 const rank=n(row?.riskAdjusted?.rank);
 const rankBonus=rank>0?Math.max(0,40-rank*4):0;
 const moneyBonus=Math.min(90,Math.round(riskProfit/250));
 const qualityBonus=Math.min(60,Math.round(riskScore*.6));
 return tier*1000+moneyBonus*10+qualityBonus+rankBonus;
}

export function prioritizeTicketCommander209(commander={}){
 const rows=(commander.rows||[]).map(row=>({...row,actionPriorityScore:ticketActionPriorityScore209(row)}));
 const queue=[...rows].sort((a,b)=>b.actionPriorityScore-a.actionPriorityScore||(a.riskAdjusted?.rank||999)-(b.riskAdjusted?.rank||999)||String(a.name||'').localeCompare(String(b.name||'')));
 const primary=queue[0]||null;
 return {
  version:TICKET_ACTION_PRIORITY_VERSION_209,
  commander,
  primary,
  queue,
  summary:{
   total:queue.length,
   blockers:queue.filter(r=>r.nextMove?.type==='DO NOT LIST').length,
   payoutChecks:queue.filter(r=>r.nextMove?.type==='CHECK PAYOUT DATA').length,
   priceActions:queue.filter(r=>['RAISE TO','DROP TO','LIST AT'].includes(r.nextMove?.type)).length,
   primaryAction:primary?.nextMove?.label||null,
   primaryEvent:primary?.name||null
  }
 };
}

export function buildTicketActionPriority209(input={},now=Date.now(),opts={}){
 return prioritizeTicketCommander209(buildTicketCommander208(input,now,opts));
}
