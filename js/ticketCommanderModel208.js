import {buildTicketRiskAdjustedRanking207} from './ticketRiskAdjustedRankingModel207.js';
import {buildTicketRepricingGuardDesk194} from './ticketRepricingGuardModel194.js';

export const TICKET_COMMANDER_VERSION_208=208;
const n=v=>Number(v||0)||0;
const defined=(...v)=>v.find(x=>x!==undefined&&x!==null);
const marketPrice=source=>n(source?.market_price_czk??source?.consensus?.market_price_czk??source?.viagogo_price_czk??source?.consensus?.viagogo_price_czk??source?.stubhub_price_czk??source?.consensus?.stubhub_price_czk)||null;

function safetyState208(inventoryRow={},source={}){
 const resale=defined(inventoryRow?.resaleAllowed,inventoryRow?.resale_allowed,source?.resaleAllowed,source?.resale_allowed);
 const transfer=defined(inventoryRow?.transferCompatible,inventoryRow?.transfer_compatible,source?.transferCompatible,source?.transfer_compatible);
 if(resale===false||transfer===false)return {state:'BLOCKED',resale,transfer};
 if(resale!==true||transfer!==true)return {state:'UNKNOWN',resale,transfer};
 return {state:'VERIFIED',resale,transfer};
}

export function ticketCommanderNextMove208(row={},guard={},source={},inventoryRow={}){
 const safety=safetyState208(inventoryRow,source);
 if(safety.state==='BLOCKED')return {type:'DO NOT LIST',label:'DO NOT LIST',price:null,priority:120,reason:'Resale nebo transfer je explicitně nepovolený.',safety};
 if(['RAISE TO','DROP TO','LIST AT'].includes(guard?.action)&&guard?.recommendedAsk){
  return {type:guard.action,label:`${guard.action} ${Math.round(guard.recommendedAsk)} Kč`,price:Math.round(guard.recommendedAsk),priority:100,reason:guard.reason||'Cenový krok z OS194 repricing guardu.',safety};
 }
 if(guard?.action==='PAYOUT DATA NEEDED')return {type:'CHECK PAYOUT DATA',label:'CHECK PAYOUT DATA',price:null,priority:90,reason:'Chybí dost payout historie pro bezpečný net-profit floor.',safety};
 if(safety.state==='UNKNOWN')return {type:'VERIFY RULES',label:'VERIFY RULES',price:null,priority:80,reason:'Ověř resale pravidla a kompatibilitu transferu před dalším obchodem.',safety};
 if(!marketPrice(source)||guard?.marketEach==null)return {type:'REFRESH MARKET',label:'REFRESH MARKET',price:null,priority:70,reason:'Chybí čerstvá sekundární market cena.',safety};
 return {type:'HOLD / MONITOR',label:'HOLD / MONITOR',price:null,priority:40,reason:guard?.reason||'Cena je uvnitř guardu; dál monitoruj trh.',safety};
}

export function buildTicketCommanderFromPlans208(ranking={},repricing={},input={}){
 const inventory=Array.isArray(input.inventory)?input.inventory:[];
 const latest=input.latest||new Map();
 const invById=new Map(inventory.map(r=>[String(r.id??''),r]));
 const guards=new Map((repricing.rows||[]).map(r=>[String(r.id??''),r]));
 const ranked=ranking?.balanced?.riskAdjustedRanking?.ranked||[];
 const rows=ranked.map(r=>{
  const id=String(r.id??'');
  const guard=guards.get(id)||{};
  const source=latest?.get?.(r.id)||latest?.get?.(id)||{};
  const inventoryRow=invById.get(id)||{};
  const nextMove=ticketCommanderNextMove208(r,guard,source,inventoryRow);
  return {...r,guard,nextMove,currentAsk:guard.askEach??inventoryRow.ask_each_czk??inventoryRow.askEachCzk??null,marketEach:guard.marketEach??marketPrice(source)};
 });
 const rankedIds=new Set(rows.map(r=>String(r.id??'')));
 const blockers=(repricing.rows||[]).filter(g=>!rankedIds.has(String(g.id??''))&&g.action==='PAYOUT DATA NEEDED').map(g=>{
  const id=String(g.id??''),inventoryRow=invById.get(id)||{},source=latest?.get?.(g.id)||latest?.get?.(id)||{};
  return {id:g.id,name:g.name,guard:g,riskAdjusted:{ok:false,rank:null,riskAdjustedProfit:null,rankScore:null},nextMove:ticketCommanderNextMove208({},g,source,inventoryRow),currentAsk:g.askEach??null,marketEach:g.marketEach??marketPrice(source)};
 });
 return {version:TICKET_COMMANDER_VERSION_208,rows:[...rows,...blockers],ranking,repricing,summary:{ranked:rows.length,blockers:blockers.length,priceActions:rows.filter(r=>['RAISE TO','DROP TO','LIST AT'].includes(r.nextMove.type)).length,verify:rows.filter(r=>r.nextMove.type==='VERIFY RULES').length,topMove:rows[0]?.nextMove?.label||blockers[0]?.nextMove?.label||null}};
}

export function buildTicketCommander208(input={},now=Date.now(),opts={}){
 const ranking=buildTicketRiskAdjustedRanking207(input,now,opts);
 const repricing=buildTicketRepricingGuardDesk194(input.inventory||[],input.latest||new Map(),now);
 return buildTicketCommanderFromPlans208(ranking,repricing,input);
}
