export const TICKET_PRESALE_EXECUTION_VERSION_200=200;
const n=v=>Number(v||0)||0;
const text=v=>String(v??'').trim();
const OPEN=new Set(['LISTED','NOT_LISTED','ACTIVE','HOLD']);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

export function ticketPortfolioCapital200(inventory=[],ticketBook={}){
 const configured=n(ticketBook?.capitalBudgetCzk??ticketBook?.capital_budget_czk??ticketBook?.ticketCapitalCzk);
 const invested=(inventory||[]).filter(r=>OPEN.has(text(r.market_status??r.marketStatus).toUpperCase())).reduce((s,r)=>s+n(r.buy_total_czk??r.buyTotalCzk??(n(r.buy_each_czk??r.buyEachCzk)*n(r.qty))),0);
 return {configured:configured||null,invested:Math.round(invested),total:configured||Math.round(invested)||null,source:configured?'CONFIGURED':invested>0?'INVESTED':'UNKNOWN'};
}

export function ticketPresaleExecutionPlan200(row={},portfolioCapitalCzk=0,opts={}){
 const opportunity=row.opportunity||{};
 const action=text(row.action).toUpperCase();
 const official=n(opportunity.officialPrice??row.officialPriceCzk??row.official_price_czk);
 const maxBuy=n(opportunity.maxBuyPrice??row.maxBuyPrice);
 const buyPrice=official>0&&maxBuy>0?Math.min(official,maxBuy):official||maxBuy||0;
 const capital=n(portfolioCapitalCzk);
 const eventCapPct=clamp(n(opts.eventCapPct)||20,5,35);
 const hardQtyCap=Math.max(1,Math.floor(n(opts.hardQtyCap)||8));
 const eventBudget=capital>0?Math.floor((capital*eventCapPct/100)/10)*10:0;
 const qtyByBudget=buyPrice>0&&eventBudget>0?Math.floor(eventBudget/buyPrice):0;
 const maxQty=Math.min(hardQtyCap,qtyByBudget);
 let verdict='WATCH';
 if(action!=='BUY TARGET')verdict='NO BUY';
 else if(!capital)verdict='SET CAPITAL';
 else if(!buyPrice)verdict='DATA NEEDED';
 else if(maxQty<1)verdict='TOO LARGE';
 else verdict='EXECUTE';
 const deploy=maxQty>0?Math.round(maxQty*buyPrice):0;
 return {version:TICKET_PRESALE_EXECUTION_VERSION_200,verdict,buyPrice:buyPrice||null,maxBuyPrice:maxBuy||null,maxQty,eventBudget:eventBudget||null,deployCapital:deploy||null,eventCapPct,hardQtyCap,capital:capital||null,opportunityScore:n(opportunity.score),presaleAction:action||null};
}

export function buildTicketPresaleExecution200(radar={},inventory=[],ticketBook={},opts={}){
 const capital=ticketPortfolioCapital200(inventory,ticketBook);
 const rows=(radar?.rows||[]).map(row=>({...row,execution:ticketPresaleExecutionPlan200(row,capital.total,opts)}));
 const actionable=rows.filter(x=>x.execution.verdict==='EXECUTE').sort((a,b)=>(b.priority||0)-(a.priority||0));
 return {version:TICKET_PRESALE_EXECUTION_VERSION_200,capital,rows,actionable,summary:{tracked:rows.length,execute:actionable.length,setCapital:rows.filter(x=>x.execution.verdict==='SET CAPITAL').length,dataNeeded:rows.filter(x=>x.execution.verdict==='DATA NEEDED').length}};
}
