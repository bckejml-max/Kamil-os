import {buildTicketPortfolioPlanner204} from './ticketPortfolioPlannerModel204.js';
import {buildTicketPayoutLearning192,estimateTicketNet192,inferTicketMarketplace192} from './ticketPayoutLearningModel192.js';

export const TICKET_LEARNED_NET_PLANNER_VERSION_205=205;
const n=v=>Number(v||0)||0;

function estimateProjectedNet205(row={},learning={}){
 const pm=row.profitModel||{};
 const qty=Math.max(0,Math.floor(n(pm.qty??row?.allocation?.qty)));
 const askEach=n(pm.modelSellPrice);
 if(!pm.ok||!qty||!askEach)return {ok:false,reason:'NO_GROSS_MODEL',market:'Unknown',gross:null,net:null,ratio:null,source:null,confidence:'NONE'};
 const inferred=inferTicketMarketplace192(row);
 // Unknown marketplace must never learn from unattributed one-off sales. A synthetic
 // market key forces OS192 to use only sufficiently broad known-market history.
 const market=inferred==='Unknown'?'Portfolio':inferred;
 return estimateTicketNet192({...row,qty,ask_each_czk:askEach},learning,market);
}

export function enrichTicketPortfolioScenario205(scenario={},learning={}){
 const rows=(scenario.rows||[]).map(row=>{
  if(!(n(row?.allocation?.qty)>0))return {...row,learnedNet:{ok:false,status:'UNFUNDED',reason:'UNFUNDED',grossRevenue:null,netRevenue:null,netProfit:null,netRoiPct:null,ratio:null,source:null,confidence:'NONE'}};
  const est=estimateProjectedNet205(row,learning);
  const cost=n(row?.profitModel?.cost??row?.allocation?.capital);
  if(!est.ok)return {...row,learnedNet:{...est,status:'GROSS ONLY',grossRevenue:n(row?.profitModel?.revenue)||null,netRevenue:null,netProfit:null,netRoiPct:null}};
  const netProfit=Math.round(n(est.net)-cost);
  return {...row,learnedNet:{...est,status:'LEARNED NET',grossRevenue:n(est.gross),netRevenue:n(est.net),netProfit,netRoiPct:cost>0?Math.round(netProfit/cost*1000)/10:null}};
 });
 const funded=rows.filter(r=>n(r?.allocation?.qty)>0);
 const learned=funded.filter(r=>r.learnedNet?.status==='LEARNED NET');
 const coveragePct=funded.length?Math.round(learned.length/funded.length*1000)/10:0;
 const netKnownProfit=learned.reduce((s,r)=>s+n(r.learnedNet.netProfit),0);
 const netKnownRevenue=learned.reduce((s,r)=>s+n(r.learnedNet.netRevenue),0);
 const netKnownCost=learned.reduce((s,r)=>s+n(r?.profitModel?.cost??r?.allocation?.capital),0);
 const fullCoverage=funded.length>0&&learned.length===funded.length;
 const fullNetProfit=fullCoverage?netKnownProfit:null;
 const fullNetRoiPct=fullCoverage&&netKnownCost>0?Math.round(netKnownProfit/netKnownCost*1000)/10:null;
 const displayProfitMode=fullCoverage?'LEARNED NET':learned.length?'MIXED':'GROSS ONLY';
 return {...scenario,rows,learnedNet:{displayProfitMode,coveragePct,funded:funded.length,learned:learned.length,missing:funded.length-learned.length,netKnownRevenue,netKnownProfit,fullNetProfit,fullNetRoiPct}};
}

export function buildTicketLearnedNetPlanner205(input={},now=Date.now(),opts={}){
 const inventory=Array.isArray(input.inventory)?input.inventory:[];
 const learning=buildTicketPayoutLearning192(inventory);
 const grossPlanner=buildTicketPortfolioPlanner204(input,now,opts);
 const scenarios=grossPlanner.scenarios.map(s=>enrichTicketPortfolioScenario205(s,learning));
 const balanced=scenarios.find(x=>x.mode==='BALANCED')||null;
 return {version:TICKET_LEARNED_NET_PLANNER_VERSION_205,learning,scenarios,recommended:'BALANCED',balanced,grossPlanner,summary:{scenarios:scenarios.length,withAnyNet:scenarios.filter(s=>s.learnedNet.learned>0).length,fullNet:scenarios.filter(s=>s.learnedNet.fullNetProfit!==null).length}};
}
