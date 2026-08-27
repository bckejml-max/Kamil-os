import {buildTicketPayoutLearning192,estimateTicketNet192} from './ticketPayoutLearningModel192.js';
import {ticketProfitFloor193} from './ticketProfitFloorModel193.js';
import {repricingMarketPrice194} from './ticketRepricingGuardModel194.js';

export const TICKET_SELL_LADDER_VERSION_195=195;
const n=v=>Number(v||0)||0;
const arr=v=>Array.isArray(v)?v:[];
const status=row=>String(row?.market_status||row?.marketStatus||'').toUpperCase();
const qty=row=>Math.max(1,n(row?.qty)||1);
const askEach=row=>n(row?.ask_each_czk??row?.askEachCzk??row?.listPrice)||null;
const name=row=>String(row?.event_name||row?.eventName||row?.name||row?.id||'Vstupenka');
const daysTo=(date,now=Date.now())=>{const t=Date.parse(date||'');return Number.isFinite(t)?Math.ceil((t-now)/86400000):null};
const round10=v=>Math.max(10,Math.round(Number(v||0)/10)*10);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

export function sellProbabilityScore195(price,market,days){
 if(!(price>0)||!(market>0))return null;
 const ratio=price/market;
 let p=55;
 if(ratio<=.90)p+=30;else if(ratio<=.97)p+=22;else if(ratio<=1.02)p+=12;else if(ratio<=1.08)p+=2;else if(ratio<=1.15)p-=12;else if(ratio<=1.30)p-=27;else p-=38;
 if(days!=null){if(days<=1)p+=15;else if(days<=3)p+=10;else if(days<=7)p+=6;else if(days>21)p-=5;}
 return Math.round(clamp(p,5,95));
}

export function probabilityBand195(score){
 if(score==null)return'NEZNÁMÁ';
 if(score>=75)return'VYSOKÁ';
 if(score>=50)return'STŘEDNÍ';
 return'NÍZKÁ';
}

function safety195(price,floors){
 if(!floors.breakEven.ok)return{code:'PAYOUT DATA NEEDED',safe:false};
 if(price<floors.breakEven.askEachFloor)return{code:'BELOW BREAK-EVEN',safe:false};
 if(price<floors.roi20.askEachFloor)return{code:'LOW MARGIN',safe:true};
 if(price<floors.roi50.askEachFloor)return{code:'SAFE +20%',safe:true};
 return{code:'SAFE +50%',safe:true};
}

function netAtPrice195(row,learning,price){
 const clone={...row,ask_each_czk:price};
 return estimateTicketNet192(clone,learning,'Viagogo');
}

export function ticketSellLadder195(row={},learning,source={},now=Date.now()){
 const q=qty(row),ask=askEach(row),market=repricingMarketPrice194(source),days=daysTo(row?.event_date??row?.eventDate,now);
 const floors={breakEven:ticketProfitFloor193(row,learning,'Viagogo',0),roi20:ticketProfitFloor193(row,learning,'Viagogo',.2),roi50:ticketProfitFloor193(row,learning,'Viagogo',.5)};
 if(!(market>0))return{id:row?.id||'',name:name(row),section:String(row?.section||'—'),qty:q,askEach:ask,marketEach:null,days,floors,ladder:[],best:null,reason:'Chybí čerstvá market cena; sell probability ladder se nevymýšlí.'};
 const candidates=[
  {key:'PREMIUM',price:round10(market*1.15)},
  {key:'MARKET+',price:round10(market*1.05)},
  {key:'MARKET',price:round10(market)},
  {key:'FAST',price:round10(market*.95)},
  {key:'URGENT',price:round10(market*.90)}
 ];
 if(ask>0)candidates.push({key:'CURRENT',price:round10(ask)});
 const dedup=[];const seen=new Set();
 for(const c of candidates){if(seen.has(c.price))continue;seen.add(c.price);const score=sellProbabilityScore195(c.price,market,days),net=netAtPrice195(row,learning,c.price),safety=safety195(c.price,floors);dedup.push({...c,score,band:probabilityBand195(score),net,safety});}
 dedup.sort((a,b)=>b.price-a.price);
 const safe=dedup.filter(x=>x.safety.code==='SAFE +50%');
 const best=(safe.length?safe:dedup.filter(x=>x.safety.safe)).sort((a,b)=>(b.score-a.score)||((b.net?.net||0)-(a.net?.net||0)))[0]||null;
 return{id:row?.id||'',name:name(row),section:String(row?.section||'—'),qty:q,askEach:ask,marketEach:market,days,floors,ladder:dedup,best,reason:best?`Nejvyšší odhad prodejnosti při zachování ${best.safety.code}.`:'Chybí bezpečný cenový bod podle dostupných payout dat.'};
}

export function buildTicketSellLadderDesk195(inventory=[],latest=new Map(),now=Date.now()){
 const learning=buildTicketPayoutLearning192(inventory);
 const rows=arr(inventory).filter(row=>['LISTED','NOT_LISTED'].includes(status(row))).map(row=>ticketSellLadder195(row,learning,latest?.get?.(row.id)||{},now));
 return{version:TICKET_SELL_LADDER_VERSION_195,learning,rows,coverage:{active:rows.length,withMarket:rows.filter(r=>r.marketEach).length,withLadder:rows.filter(r=>r.ladder.length).length,withSafeBest:rows.filter(r=>r.best?.safety?.safe).length}};
}
