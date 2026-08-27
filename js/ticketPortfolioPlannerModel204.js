import {buildTicketCapitalAllocator203} from './ticketCapitalAllocatorModel203.js';

export const TICKET_PORTFOLIO_PLANNER_VERSION_204=204;
const n=v=>Number(v||0)||0;

const MODES={
 CONSERVATIVE:{reservePct:30,marketRealization:.80,label:'CONSERVATIVE'},
 BALANCED:{reservePct:10,marketRealization:.90,label:'BALANCED'},
 AGGRESSIVE:{reservePct:5,marketRealization:1.00,label:'AGGRESSIVE'}
};

export function ticketScenarioProfit204(row={},marketRealization=.9){
 const qty=Math.max(0,Math.floor(n(row?.allocation?.qty)));
 const buy=n(row?.allocation?.price??row?.riskBudget?.buyPrice);
 const market=n(row.marketPrice??row.marketPriceCzk??row.market_price_czk);
 if(!qty||!buy||!market)return {ok:false,qty,buyPrice:buy||null,marketPrice:market||null,modelSellPrice:null,revenue:null,cost:null,grossProfit:null,roiPct:null,reason:'INSUFFICIENT_PRICE_DATA'};
 const realization=Math.max(.5,Math.min(1,Number(marketRealization)||.9));
 const modelSell=Math.floor(market*realization/10)*10;
 const cost=Math.round(qty*buy),revenue=Math.round(qty*modelSell),profit=revenue-cost;
 return {ok:true,qty,buyPrice:buy,marketPrice:market,realization,modelSellPrice:modelSell,revenue,cost,grossProfit:profit,roiPct:cost>0?Math.round(profit/cost*1000)/10:null,reason:'MODEL_GROSS_BEFORE_FEES'};
}

export function buildTicketPortfolioScenario204(input={},now=Date.now(),mode='BALANCED',opts={}){
 const config=MODES[String(mode).toUpperCase()]||MODES.BALANCED;
 const allocator=buildTicketCapitalAllocator203(input,now,{...opts,reservePct:config.reservePct});
 const rows=allocator.rows.map(row=>({...row,profitModel:ticketScenarioProfit204(row,config.marketRealization)}));
 const funded=rows.filter(r=>r.allocation.qty>0);
 const modeled=funded.filter(r=>r.profitModel.ok);
 const deployed=funded.reduce((s,r)=>s+n(r.allocation.capital),0);
 const grossProfit=modeled.reduce((s,r)=>s+n(r.profitModel.grossProfit),0);
 const modeledCost=modeled.reduce((s,r)=>s+n(r.profitModel.cost),0);
 return {version:TICKET_PORTFOLIO_PLANNER_VERSION_204,mode:config.label,reservePct:config.reservePct,marketRealization:config.marketRealization,capital:allocator.capital,invested:allocator.invested,available:allocator.available,deployed,remaining:allocator.remaining,rows,grossProfit,modeledRoiPct:modeledCost>0?Math.round(grossProfit/modeledCost*1000)/10:null,coverage:{funded:funded.length,modeled:modeled.length,missing:funded.length-modeled.length},allocator};
}

export function buildTicketPortfolioPlanner204(input={},now=Date.now(),opts={}){
 const scenarios=['CONSERVATIVE','BALANCED','AGGRESSIVE'].map(mode=>buildTicketPortfolioScenario204(input,now,mode,opts));
 const balanced=scenarios.find(x=>x.mode==='BALANCED');
 return {version:TICKET_PORTFOLIO_PLANNER_VERSION_204,scenarios,recommended:'BALANCED',balanced,summary:{scenarios:scenarios.length,bestMode:[...scenarios].sort((a,b)=>b.grossProfit-a.grossProfit)[0]?.mode||null}};
}
