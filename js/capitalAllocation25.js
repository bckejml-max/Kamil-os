import {cashflow90} from './cashflow25.js';
import {xtbPortfolioAudit} from './xtbAudit24.js';
import {ticketSellCockpit} from './ticketCockpit24.js';
import {xtbDataAge,xtbIntelligenceAge,ticketIntelligenceAge,ticketOpportunityDecision} from './live24.js';

const n=v=>Number(v||0);
const clamp0=v=>Math.max(0,n(v));
const round=v=>Math.round(v);
const TICKET_CAP_PCT=0.15;

function ticketOpportunity(s,ticketLive,deployable){
 if(!ticketLive.fresh||deployable<=0)return null;
 const rows=(s.ticketBook?.watchlist||[]).map(x=>({x,d:ticketOpportunityDecision(x,s)}))
  .filter(({x,d})=>String(d.action||'').toUpperCase()==='BUY'&&d.live===true&&clamp0(x.maxBuyPrice)>0)
  .sort((a,b)=>n(b.d.priority)-n(a.d.priority));
 const best=rows[0];if(!best)return null;
 const qty=Math.max(1,Math.floor(n(best.d.recommendedQty)||1));
 const requested=clamp0(best.x.maxBuyPrice)*qty;
 const policyCap=deployable*TICKET_CAP_PCT;
 const budget=Math.min(deployable,requested,policyCap);
 if(budget<=0)return null;
 return {id:best.x.id,name:best.x.name||'Ticket opportunity',budget:round(budget),requested:round(requested),qty,maxBuyPrice:clamp0(best.x.maxBuyPrice),priority:n(best.d.priority),confidence:best.d.confidence??null,source:'ŽIVĚ',reason:best.d.reason||'Čerstvá ticket intelligence označuje příležitost jako BUY.'};
}

export function capitalAllocation(s,now=new Date()){
 const cf=cashflow90(s,now),audit=xtbPortfolioAudit(s),cockpit=ticketSellCockpit(s),xtbAge=xtbDataAge(s),xtbLive=xtbIntelligenceAge(s),ticketLive=ticketIntelligenceAge(s);
 const planned=clamp0(s.financePlan?.plannedInvestment);
 const currentHeadroom=clamp0(cf.cash-cf.reserve),futureHeadroom=clamp0(cf.minBalance-cf.reserve);
 const safeBeforePlan=Math.min(currentHeadroom,futureHeadroom),fundedPlan=Math.min(planned,safeBeforePlan),unfundedPlan=clamp0(planned-safeBeforePlan);
 const deployable=clamp0(safeBeforePlan-fundedPlan);
 let ticketBudget=0,xtbBudget=0,cashHold=deployable,ticket=null;
 const blockers=[];
 if(cf.status==='RISK'||safeBeforePlan<=0)blockers.push('90denní cashflow neponechává bezpečný prostor nad rezervním minimem.');
 if(unfundedPlan>0)blockers.push('Už naplánovaná investice je vyšší než bezpečný prostor nad rezervou.');
 if(cockpit.urgent>0)blockers.push(`Nejdřív řešit ${cockpit.urgent} urgentní ticket pozice; nový ticket kapitál se nepřiděluje.`);

 if(deployable>0&&cockpit.urgent===0){
  ticket=ticketOpportunity(s,ticketLive,deployable);
  if(ticket){ticketBudget=ticket.budget;cashHold-=ticketBudget}
 }
 const xtbNeedsAllocation=audit.positions>0&&(audit.risks.length>0||audit.healthScore<90);
 if(cashHold>0&&xtbNeedsAllocation&&!xtbAge.stale){
  xtbBudget=cashHold;cashHold=0;
 }else if(cashHold>0&&xtbAge.stale&&audit.positions>0){
  blockers.push('XTB import je zastaralý; nový kapitál zůstává v hotovosti do novějšího importu.');
 }
 if(cashHold>0&&!xtbNeedsAllocation&&audit.positions>0&&!xtbAge.stale)blockers.push('XTB alokace je blízko cílovým pásmům; přebytek se bez konkrétní příležitosti neposílá automaticky dál.');
 if(cashHold>0&&!audit.positions)blockers.push('Chybí použitelné XTB portfolio pro alokační rozhodnutí; přebytek zůstává v hotovosti.');

 const rows=[
  {key:'reserve',label:'Nedotknutelná rezerva',amount:round(cf.reserve),action:'CHRÁNIT',source:'ULOŽENÝ PLÁN',reason:'Rezervní minimum se do investovatelného kapitálu nikdy nepočítá.'},
  {key:'planned',label:'Už plánovaná investice',amount:round(fundedPlan),action:fundedPlan>0?'PLÁN':'—',source:'ULOŽENÝ PLÁN',reason:planned>0?'Částka už existuje ve finančním plánu a proto se nepočítá jako nový volný kapitál.':'Ve finančním plánu není další investice předem rezervovaná.'},
  {key:'xtb',label:'XTB / rebalancing',amount:round(xtbBudget),action:xtbBudget>0?'SMĚROVAT':'0',source:xtbAge.stale?'ZASTARALÝ IMPORT':'XTB IMPORT',reason:xtbBudget>0?audit.nextContribution:(xtbAge.stale?'Počkat na nový import.':'Bez nutnosti dalšího rebalancingu z nového kapitálu.')},
  {key:'tickets',label:'Vstupenky',amount:round(ticketBudget),action:ticketBudget>0?'LIMIT':'0',source:ticketBudget>0?'ŽIVĚ':ticketLive.fresh?'ŽIVĚ / bez BUY':'BEZ ČERSTVÉHO BUY',reason:ticketBudget>0?`${ticket.name}: max rozpočet podle live BUY a 15% bezpečnostního limitu nového kapitálu.`:(cockpit.urgent>0?'Nový nákup blokuje urgentní neprodaná zásoba.':'Bez čerstvého live BUY se ticket rozpočet nevytváří.')},
  {key:'cash',label:'Nechat volné',amount:round(cashHold),action:cashHold>0?'DRŽET':'0',source:'PRAVIDLO',reason:cashHold>0?'Kapitál nemá dostatečně silný a čerstvý důvod k nasazení.':'Bez zbytkového kapitálu.'}
 ];
 const allocated=round(xtbBudget+ticketBudget),newCapital=round(deployable);
 return {newCapital,allocated,cashHold:round(cashHold),safeBeforePlan:round(safeBeforePlan),planned:round(planned),fundedPlan:round(fundedPlan),unfundedPlan:round(unfundedPlan),currentHeadroom:round(currentHeadroom),futureHeadroom:round(futureHeadroom),rows,blockers,ticket,
  status:newCapital<=0?'PROTECT':cashHold>0?'PARTIAL':'ALLOCATED',
  audit:{healthScore:audit.healthScore,nextContribution:audit.nextContribution,positions:audit.positions},
  cockpit:{urgent:cockpit.urgent,capitalAtRisk:cockpit.capitalAtRisk,openQty:cockpit.openQty},
  freshness:{xtbImport:xtbAge,xtbLive,ticketLive},
  note:'Capital Allocation je plánovací vrstva. Neposílá peníze, neprovádí XTB obchody ani nenakupuje vstupenky. Výpočet používá jen uložené cashflow, existující XTB import a čerstvou ticket intelligence tam, kde je skutečně dostupná.'};
}
