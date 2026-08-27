import {buildTicketOpportunityScanner198} from './ticketOpportunityModel198.js';
import {ticketPortfolioCapital200} from './ticketPresaleExecutionModel200.js';
import {buildTicketExposure201,ticketExposureGuard201} from './ticketExposureModel201.js';

export const TICKET_RISK_BUDGET_VERSION_202=202;
const n=v=>Number(v||0)||0;
const text=v=>String(v??'').trim();

export function ticketRiskBudgetCandidate202(candidate={},exposure={},capitalCzk=0,opts={}){
 const capital=n(capitalCzk);
 const price=n(candidate.officialPrice??candidate.officialPriceCzk??candidate.official_price_czk??candidate.buyEachCzk??candidate.buy_each_czk);
 const maxBuy=n(candidate.netSafeMaxBuyPrice??candidate.maxBuyPrice);
 const buyPrice=price>0&&maxBuy>0?Math.min(price,maxBuy):maxBuy||0;
 const hardQtyCap=Math.max(1,Math.floor(n(opts.hardQtyCap)||8));
 const guard=ticketExposureGuard201(candidate,exposure,opts);
 const eventCapPct=Math.max(5,Math.min(35,n(opts.eventCapPct)||20));
 const baseBudget=capital>0?Math.floor((capital*eventCapPct/100)/10)*10:0;
 const allowedBudget=guard.ok?Math.min(baseBudget,guard.remainingBudget):baseBudget;
 const maxQty=buyPrice>0&&allowedBudget>0?Math.min(hardQtyCap,Math.floor(allowedBudget/buyPrice)):0;
 let verdict='WATCH';
 if(text(candidate.action).toUpperCase()!=='BUY')verdict='NO BUY';
 else if(!capital)verdict='SET CAPITAL';
 else if(!maxBuy||!buyPrice)verdict='DATA NEEDED';
 else if(guard.ok&&guard.reason==='CONCENTRATED')verdict='CONCENTRATED';
 else if(maxQty<1)verdict='TOO LARGE';
 else verdict='BUY';
 return {...candidate,riskBudget:{version:TICKET_RISK_BUDGET_VERSION_202,verdict,buyPrice:buyPrice||null,maxBuyPrice:maxBuy||null,netSafeMaxBuyPrice:maxBuy||null,maxQty,baseBudget:baseBudget||null,allowedBudget:allowedBudget||null,deployCapital:maxQty&&buyPrice?Math.round(maxQty*buyPrice):null,binding:guard.binding||null,guard,eventCapPct}};
}

export function buildTicketRiskBudget202({inventory=[],latest=new Map(),watchlist=[],ticketBook={}}={},now=Date.now(),opts={}){
 const capital=ticketPortfolioCapital200(inventory,ticketBook);
 const exposure=buildTicketExposure201(inventory,capital.total||0);
 const scanner=buildTicketOpportunityScanner198({inventory,latest,watchlist},now);
 const rows=scanner.rows.map(c=>ticketRiskBudgetCandidate202(c,exposure,capital.total||0,opts)).sort((a,b)=>{
  const va=a.riskBudget.verdict==='BUY'?1:0,vb=b.riskBudget.verdict==='BUY'?1:0;
  return vb-va||(b.score||0)-(a.score||0);
 });
 return {version:TICKET_RISK_BUDGET_VERSION_202,capital,exposure,scanner,rows,buy:rows.filter(x=>x.riskBudget.verdict==='BUY'),blocked:rows.filter(x=>['CONCENTRATED','TOO LARGE'].includes(x.riskBudget.verdict)),summary:{candidates:rows.length,buy:rows.filter(x=>x.riskBudget.verdict==='BUY').length,blocked:rows.filter(x=>['CONCENTRATED','TOO LARGE'].includes(x.riskBudget.verdict)).length,setCapital:rows.filter(x=>x.riskBudget.verdict==='SET CAPITAL').length,dataNeeded:rows.filter(x=>x.riskBudget.verdict==='DATA NEEDED').length}};
}
