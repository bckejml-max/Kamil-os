import {buildTicketPayoutLearning192} from './ticketPayoutLearningModel192.js';
import {buildTicketMarketDeskRow190} from './ticketMarketDeskModel190.js';
import {ticketRepricingGuard194} from './ticketRepricingGuardModel194.js';
import {ticketSellLadder195} from './ticketSellLadderModel195.js';

export const TICKET_COMMANDER_VERSION_196=196;
const arr=v=>Array.isArray(v)?v:[];
const status=r=>String(r?.market_status||r?.marketStatus||'').toUpperCase();

export function ticketCommanderRow196(row={},learning,source={},now=Date.now()){
 const market=buildTicketMarketDeskRow190(row,source);
 const guard=ticketRepricingGuard194(row,learning,source,now);
 const ladder=ticketSellLadder195(row,learning,source,now);
 const safe=ladder.ladder.filter(x=>x.safety?.code==='SAFE +50%').sort((a,b)=>a.price-b.price);
 const fast=safe.at(0)||null;
 const ideal=ladder.best||null;
 const current=Number(row.ask_each_czk??row.askEachCzk)||null;
 let action=guard.action;
 if(action==='PAYOUT DATA NEEDED')action='CHECK DATA';
 const headline=action==='HOLD'&&current?`HOLD ${Math.round(current)} Kč`:guard.recommendedAsk?`${action} ${Math.round(guard.recommendedAsk)} Kč`:action;
 return {
  id:row.id||'',name:market.name,section:market.section,qty:market.qty,status:market.status,
  headline,currentAsk:current,targetAsk:guard.recommendedAsk||ideal?.price||null,
  idealPrice:ideal?.price||null,fastPrice:fast?.price||null,neverBelow:guard.neverBelow||null,
  sellScore:ideal?.score??null,sellBand:ideal?.band||'NEZNÁMÁ',
  marketAction:market.recommendation,marketReason:market.reason,
  viagogo:market.markets?.[0]||null,stubhub:market.markets?.[1]||null,ticketSwap:market.markets?.[2]||null,
  guard,ladder,
  priority: action==='RAISE TO'||action==='DROP TO'||action==='LIST AT'?100:market.recommendation.includes('CHECK')||market.recommendation.includes('CROSS')?70:40
 };
}

export function buildTicketCommander196(inventory=[],latest=new Map(),now=Date.now()){
 const learning=buildTicketPayoutLearning192(inventory);
 const rows=arr(inventory).filter(r=>['LISTED','NOT_LISTED'].includes(status(r))).map(r=>ticketCommanderRow196(r,learning,latest?.get?.(r.id)||{},now)).sort((a,b)=>b.priority-a.priority);
 return {version:TICKET_COMMANDER_VERSION_196,learning,rows,summary:{active:rows.length,priceActions:rows.filter(r=>['RAISE TO','DROP TO','LIST AT'].includes(r.guard.action)).length,holds:rows.filter(r=>r.guard.action==='HOLD').length,marketChecks:rows.filter(r=>r.marketAction.includes('CHECK')||r.marketAction.includes('CROSS')).length}};
}
