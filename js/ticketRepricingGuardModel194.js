import {buildTicketPayoutLearning192} from './ticketPayoutLearningModel192.js';
import {ticketProfitFloor193} from './ticketProfitFloorModel193.js';

export const TICKET_REPRICING_GUARD_VERSION_194=194;
const n=v=>Number(v||0)||0;
const arr=v=>Array.isArray(v)?v:[];
const status=row=>String(row?.market_status||row?.marketStatus||'').toUpperCase();
const qty=row=>Math.max(1,n(row?.qty)||1);
const askEach=row=>n(row?.ask_each_czk??row?.askEachCzk??row?.listPrice)||null;
const name=row=>String(row?.event_name||row?.eventName||row?.name||row?.id||'Vstupenka');
const daysTo=(date,now=Date.now())=>{const t=Date.parse(date||'');return Number.isFinite(t)?Math.ceil((t-now)/86400000):null};
const round10=v=>Math.max(1,Math.round(Number(v||0)/10)*10);
const ceil10=v=>Math.max(1,Math.ceil(Number(v||0)/10)*10);

export function repricingMarketPrice194(source={}){
 return n(source?.market_price_czk??source?.consensus?.market_price_czk??source?.viagogo_price_czk??source?.consensus?.viagogo_price_czk??source?.viagogo?.market_price_czk??source?.stubhub_price_czk??source?.consensus?.stubhub_price_czk)||null;
}

export function timeMarketFactor194(days){
 if(days==null)return 1;
 if(days>21)return 1.06;
 if(days>14)return 1.04;
 if(days>7)return 1.02;
 if(days>3)return 1.00;
 if(days>1)return .98;
 return .96;
}

export function ticketRepricingGuard194(row={},learning,source={},now=Date.now()){
 const ask=askEach(row),q=qty(row),days=daysTo(row?.event_date??row?.eventDate,now),market=repricingMarketPrice194(source);
 const breakEven=ticketProfitFloor193(row,learning,'Viagogo',0);
 const roi20=ticketProfitFloor193(row,learning,'Viagogo',.2);
 const roi50=ticketProfitFloor193(row,learning,'Viagogo',.5);
 const hardFloor=roi50.ok?roi50.askEachFloor:null;
 const guardedFloor=hardFloor?ceil10(hardFloor):null;
 const emergencyFloor=breakEven.ok?breakEven.askEachFloor:null;
 if(!hardFloor)return{id:row?.id||'',name:name(row),section:String(row?.section||'—'),qty:q,askEach:ask,marketEach:market,days,action:'PAYOUT DATA NEEDED',recommendedAsk:null,neverBelow:null,emergencyFloor,hardFloor:null,marketFactor:null,reason:'Bez payout historie nelze bezpečně řídit repricing.',floors:{breakEven,roi20,roi50}};
 if(!market){
  const rec=ask&&ask>=guardedFloor?ask:guardedFloor;
  return{id:row?.id||'',name:name(row),section:String(row?.section||'—'),qty:q,askEach:ask,marketEach:null,days,action:ask?'HOLD':'LIST AT',recommendedAsk:Math.max(guardedFloor,round10(rec)),neverBelow:guardedFloor,emergencyFloor,hardFloor,marketFactor:null,reason:ask?'Chybí čerstvá market cena; držím současný ask nad +50 % ROI floorem.':'Chybí market cena; první bezpečný listing dávám na +50 % ROI floor.',floors:{breakEven,roi20,roi50}};
 }
 const factor=timeMarketFactor194(days);
 const marketTarget=round10(market*factor);
 const target=Math.max(guardedFloor,marketTarget);
 let action='HOLD',recommendedAsk=target,reason='Aktuální ask je blízko dynamickému cíli a nad profit floorem.';
 if(!ask){action='LIST AT';reason='Ticket není oceněný; doporučení vychází z trhu, času do eventu a +50 % ROI guardu.';}
 else if(ask<guardedFloor){action='RAISE TO';recommendedAsk=guardedFloor;reason='Aktuální ask je pod normálním +50 % ROI floorem; cena se musí vrátit nad guard.';}
 else {
  const delta=(target-ask)/ask;
  if(delta>=.06){action='RAISE TO';reason='Trh dovoluje vyšší cenu; navyšuji jen k dynamickému cíli.';}
  else if(delta<=-.06){action='DROP TO';reason=target===guardedFloor?'Market je níž, ale guard blokuje pokles pod +50 % ROI floor.':'Ask je nad časově upraveným market cílem; snižuji, ale nikdy pod +50 % ROI floor.';}
  else recommendedAsk=ask;
 }
 recommendedAsk=Math.max(guardedFloor,round10(recommendedAsk));
 return{id:row?.id||'',name:name(row),section:String(row?.section||'—'),qty:q,askEach:ask,marketEach:market,days,action,recommendedAsk,neverBelow:guardedFloor,emergencyFloor,hardFloor,marketFactor:factor,reason,floors:{breakEven,roi20,roi50}};
}

export function buildTicketRepricingGuardDesk194(inventory=[],latest=new Map(),now=Date.now()){
 const learning=buildTicketPayoutLearning192(inventory);
 const rows=arr(inventory).filter(row=>['LISTED','NOT_LISTED'].includes(status(row))).map(row=>ticketRepricingGuard194(row,learning,latest?.get?.(row.id)||{},now));
 const actionable=rows.filter(r=>['DROP TO','RAISE TO','LIST AT'].includes(r.action));
 return{version:TICKET_REPRICING_GUARD_VERSION_194,learning,rows,coverage:{active:rows.length,actionable:actionable.length,holds:rows.filter(r=>r.action==='HOLD').length,guarded:rows.filter(r=>r.neverBelow).length,dataNeeded:rows.filter(r=>r.action==='PAYOUT DATA NEEDED').length}};
}
