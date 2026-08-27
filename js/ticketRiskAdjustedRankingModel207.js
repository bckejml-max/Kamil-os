import {buildTicketProfitConfidencePlanner206} from './ticketProfitConfidenceModel206.js';

export const TICKET_RISK_ADJUSTED_RANKING_VERSION_207=207;
const n=v=>Number(v||0)||0;
const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,v));

function liquidityProxy207(row={}){
 const days=row.days==null?row.eventDays??row.opportunity?.days??row.daysToEvent:row.days;
 const d=Number(days);
 const marketConfidence=clamp(n(row.confidenceScore??row.confidence??row.multi_market_confidence),0,100);
 let timing=55;
 if(Number.isFinite(d)){if(d>=7&&d<=45)timing=85;else if(d>45&&d<=120)timing=72;else if(d>=3&&d<7)timing=62;else if(d>=1&&d<3)timing=48;else if(d<1)timing=35;else timing=58;}
 const marketPart=marketConfidence>0?marketConfidence:50;
 return Math.round(clamp(timing*.6+marketPart*.4));
}

function exposureSafety207(row={}){
 const binding=row?.riskBudget?.guard?.binding??row?.riskBudget?.binding??row?.exposureGuard?.binding;
 if(!binding)return 100;
 const cap=n(binding.cap),remaining=n(binding.remaining);
 if(!(cap>0))return remaining>0?70:0;
 return Math.round(clamp(remaining/cap*100));
}

export function ticketRiskAdjustedProfit207(row={}){
 const pc=row.profitConfidence||{};
 const learned=row.learnedNet||{};
 if(!pc.ok||learned.status!=='LEARNED NET'||learned.netProfit==null)return {ok:false,rankScore:null,riskAdjustedProfit:null,confidenceFactor:null,liquidity:null,exposureSafety:null,reason:'LEARNED_NET_CONFIDENCE_REQUIRED'};
 const netProfit=n(learned.netProfit);
 const confidence=clamp(n(pc.score),0,100);
 const liquidity=liquidityProxy207(row);
 const exposureSafety=exposureSafety207(row);
 const confidenceFactor=confidence/100,liquidityFactor=liquidity/100,exposureFactor=exposureSafety/100;
 const riskAdjustedProfit=Math.round(netProfit*confidenceFactor*liquidityFactor*exposureFactor);
 const roi=clamp(n(learned.netRoiPct),0,150);
 const qualityScore=Math.round(clamp(confidence*.40+liquidity*.25+exposureSafety*.20+Math.min(100,roi)*.15));
 return {ok:true,netProfit:Math.round(netProfit),riskAdjustedProfit,rankScore:qualityScore,confidence,confidenceFactor,liquidity,exposureSafety,netRoiPct:learned.netRoiPct??null,reason:'RISK_ADJUSTED_MODEL_NOT_SALE_PROBABILITY'};
}

export function rankTicketScenario207(scenario={}){
 const rows=(scenario.rows||[]).map(row=>({...row,riskAdjusted:ticketRiskAdjustedProfit207(row)}));
 const ranked=rows.filter(r=>r.riskAdjusted.ok).sort((a,b)=>b.riskAdjusted.riskAdjustedProfit-a.riskAdjusted.riskAdjustedProfit||b.riskAdjusted.rankScore-a.riskAdjusted.rankScore).map((row,i)=>({...row,riskAdjusted:{...row.riskAdjusted,rank:i+1}}));
 const rankByKey=new Map(ranked.map(r=>[String(r.id??r.name??''),r.riskAdjusted]));
 const merged=rows.map(r=>{const key=String(r.id??r.name??'');return rankByKey.has(key)?{...r,riskAdjusted:rankByKey.get(key)}:r});
 return {...scenario,rows:merged,riskAdjustedRanking:{ranked,total:rows.length,modeled:ranked.length,top:ranked[0]||null,totalRiskAdjustedProfit:ranked.reduce((s,r)=>s+n(r.riskAdjusted.riskAdjustedProfit),0)}};
}

export function buildTicketRiskAdjustedRanking207(input={},now=Date.now(),opts={}){
 const confidencePlanner=buildTicketProfitConfidencePlanner206(input,now,opts);
 const scenarios=confidencePlanner.scenarios.map(rankTicketScenario207);
 const balanced=scenarios.find(x=>x.mode==='BALANCED')||null;
 return {version:TICKET_RISK_ADJUSTED_RANKING_VERSION_207,scenarios,recommended:'BALANCED',balanced,confidencePlanner,summary:{ranked:balanced?.riskAdjustedRanking?.modeled||0,top:balanced?.riskAdjustedRanking?.top?.name||null}};
}
