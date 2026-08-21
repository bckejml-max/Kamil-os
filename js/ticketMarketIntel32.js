import {ticketPricingPlan32,ticketDataQuality32} from './ticketTuning32.js';
import {ticketLearningAdvice} from './ticketLearning25.js';
import {ticketEventKey32,ticketEventName32} from './ticketPortfolio32.js';

const n=v=>Number(v||0),upper=v=>String(v||'').trim().toUpperCase();
const active=x=>!['SOLD','PAYOUT WAIT','PAYOUT RECEIVED'].includes(upper(x?.workflow||'HOLD'));
const iso=ms=>new Date(ms).toISOString();
const dayDiff=(raw,now=new Date())=>{const t=Date.parse(raw||0);if(!Number.isFinite(t))return null;const a=new Date(now);a.setHours(0,0,0,0);const b=new Date(t);b.setHours(0,0,0,0);return Math.round((b-a)/86400000)};
const round=v=>Math.round(n(v));
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const ACTION_PRIORITY={SELL_WINDOW:99,SET_LIST:96,REPRICE:93,CHECK_MARKET:91,TRANSFER_REVIEW:90,LIST:86,HOLD_LISTING:60,WAIT:45};

function nextPriceStep(current,target,floor,stepPct,urgent=false){
 if(!(target>0))return null;
 if(!(current>0))return round(Math.max(floor,target));
 if(urgent)return round(Math.max(floor,target));
 const stepped=current*(1-Math.max(0,stepPct)/100);
 return round(Math.max(floor,target,stepped));
}
function priceLadder(current,target,floor,stepPct,now){
 if(!(target>0))return [];
 const hours=[0,24,48],out=[];let price=current>0?current:target;
 for(let i=0;i<3;i++){
  if(i===0)price=nextPriceStep(price,target,floor,stepPct,false);
  else price=round(Math.max(floor,target,price*(1-Math.max(1,stepPct)/100)));
  out.push({step:i+1,at:iso(new Date(now).getTime()+hours[i]*3600000),price});
  if(price<=Math.max(floor,target))break;
 }
 return out;
}

export function ticketMarketPlan32(ticket={},state={},now=new Date()){
 const pricing=ticketPricingPlan32(ticket),quality=ticketDataQuality32(ticket),learning=ticketLearningAdvice(ticket,state),flow=upper(ticket.workflow||'HOLD'),list=n(ticket.listPrice),floor=n(pricing.floor),fresh=!!pricing.marketFresh,target=fresh?n(pricing.recommendedListPricePerTicket):0,sellBy=ticket.sellBy||pricing.suggestedSellBy,sellByDays=dayDiff(sellBy,now),eventDays=pricing.phase.days,transferMissing=quality.criticalMissing.some(x=>x.key==='transferStatus');
 let action='WAIT',reason='Zatím držet plán a kontrolovat podle časové fáze.',suggestedPrice=null;
 if(transferMissing&&eventDays!==null&&eventDays<=14){action='TRANSFER_REVIEW';reason='Akce je do 14 dnů a převod vstupenek není potvrzený.'}
 if(!fresh){action='CHECK_MARKET';reason=n(ticket.marketPrice)>0?'Uložený market je pro tuto fázi už starý. Před repricingem zkontroluj aktuální relevantní nabídky.':'Chybí čerstvá market cena. Než určím prodejní cenu, potřebuji novou kontrolu trhu.'}
 else if(sellByDays!==null&&sellByDays<=0){action='SELL_WINDOW';suggestedPrice=round(Math.max(floor,target));reason='Sell-by je dnes nebo už proběhl. Priorita je likvidita, ale cenu pořád opírám jen o čerstvý market a floor.'}
 else if(flow==='LISTED'&&list<=0){action='SET_LIST';suggestedPrice=round(Math.max(floor,target));reason='Pozice je LISTED bez skutečné list ceny. Čerstvý market dovoluje navrhnout výchozí cenu.'}
 else if(flow==='LISTED'&&list>0&&target>0&&list>target*1.05){action='REPRICE';suggestedPrice=nextPriceStep(list,target,floor,pricing.repriceStepPct,eventDays!==null&&eventDays<=7);reason=`Aktuální listing je více než 5 % nad čerstvým market targetem pro fázi ${pricing.phase.label}.`}
 else if(flow==='LISTED'){action='HOLD_LISTING';suggestedPrice=list||round(Math.max(floor,target));reason='Listing je v toleranci vůči čerstvému market targetu; není důvod vyrábět změnu ceny.'}
 else if(fresh&&eventDays!==null&&eventDays<=45){action='LIST';suggestedPrice=round(Math.max(floor,target));reason=`Fáze ${pricing.phase.label} už dovoluje aktivní test/prodej trhu.`}
 const priority=clamp((ACTION_PRIORITY[action]||50)+(learning.categoryReady&&learning.risk==='high'?3:0),0,100),nextCheckAt=iso(new Date(now).getTime()+Math.max(1,n(pricing.nextCheckHours)||24)*3600000),ladder=fresh&&['REPRICE','SELL_WINDOW','SET_LIST','LIST'].includes(action)?priceLadder(list||suggestedPrice,target,floor,pricing.repriceStepPct,now):[];
 return {ticketId:ticket.id,eventKey:ticketEventKey32(ticket),eventName:ticketEventName32(ticket),date:ticket.date||null,workflow:flow,qty:Math.max(1,n(ticket.qty)||1),action,priority,reason,suggestedPricePerTicket:suggestedPrice||null,currentListPrice:list||null,marketPrice:pricing.marketPrice||null,marketFresh:fresh,marketSourced:!!pricing.marketSourced,marketStatus:pricing.marketStatus,floorPrice:floor||null,breakEven:pricing.breakEven||null,sellBy:sellBy||null,sellByDays,eventDays,nextCheckHours:pricing.nextCheckHours,nextCheckAt,phase:pricing.phase,ladder,learning:{category:learning.category,ready:learning.categoryReady,risk:learning.risk,evidence:learning.evidence,note:learning.note},qualityScore:quality.score,missing:quality.missing.map(x=>x.key),contract:'PROPOSAL_ONLY'};
}

export function ticketEventMarketIntel32(state={},now=new Date()){
 const items=(state.ticketBook?.items||[]).filter(active),rows=items.map(x=>ticketMarketPlan32(x,state,now)),groups=new Map();
 for(const r of rows){let g=groups.get(r.eventKey);if(!g){g={key:r.eventKey,name:r.eventName,date:r.date,rows:[],qty:0,capitalAtRisk:0};groups.set(r.eventKey,g)}g.rows.push(r);g.qty+=r.qty;const original=items.find(x=>String(x.id)===String(r.ticketId));g.capitalAtRisk+=n(original?.buy)}
 const events=[...groups.values()].map(g=>{const ranked=[...g.rows].sort((a,b)=>b.priority-a.priority),top=ranked[0],fresh=g.rows.filter(x=>x.marketFresh).length,sourced=g.rows.filter(x=>x.marketFresh&&x.marketSourced).length,prices=g.rows.map(x=>x.suggestedPricePerTicket).filter(x=>x>0),sellByDays=g.rows.map(x=>x.sellByDays).filter(x=>x!==null);return {...g,topAction:top?.action||'WAIT',priority:top?.priority||0,nextAction:top?.reason||'',nextCheckAt:ranked.map(x=>x.nextCheckAt).sort()[0]||null,marketFreshPct:g.rows.length?Math.round(fresh/g.rows.length*100):0,marketSourcedPct:g.rows.length?Math.round(sourced/g.rows.length*100):0,suggestedPriceRange:prices.length?{min:Math.min(...prices),max:Math.max(...prices)}:null,sellByDays:sellByDays.length?Math.min(...sellByDays):null,learningReady:g.rows.some(x=>x.learning.ready)}}).sort((a,b)=>b.priority-a.priority||String(a.date||'').localeCompare(String(b.date||'')));
 return {events,rows,totalEvents:events.length,needsMarket:rows.filter(x=>x.action==='CHECK_MARKET').length,needsReprice:rows.filter(x=>x.action==='REPRICE').length,sellWindow:rows.filter(x=>x.action==='SELL_WINDOW').length,top:events[0]||null,generatedAt:new Date(now).toISOString()};
}

export const ticketMarketIntel32Contract={autoPrice:false,autoSell:false,requiresFreshMarketForPrice:true,staleMarketCanDrivePrice:false,learningMinEvidence:true,output:'PROPOSAL_ONLY'};
