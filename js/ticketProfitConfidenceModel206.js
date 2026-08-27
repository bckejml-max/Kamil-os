import {buildTicketLearnedNetPlanner205} from './ticketLearnedNetPlannerModel205.js';

export const TICKET_PROFIT_CONFIDENCE_VERSION_206=206;
const n=v=>Number(v||0)||0;
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));

function payoutQuality206(learnedNet={}){
 const samples=Math.max(0,Math.floor(n(learnedNet.samples)));
 const confidence=String(learnedNet.confidence||'NONE').toUpperCase();
 const base=confidence==='HIGH'?90:confidence==='MEDIUM'?72:confidence==='LOW'?52:confidence==='VERY_LOW'?34:0;
 const sampleBonus=Math.min(10,samples*2);
 return clamp(base+sampleBonus,0,100);
}

function marketQuality206(row={}){
 const raw=n(row.confidenceScore??row.confidence);
 if(raw>0)return clamp(raw,0,100);
 const market=n(row.marketPrice??row.marketPriceCzk??row.market_price_czk);
 const upside=n(row.upsidePct);
 if(market>0&&upside)return 55;
 if(market>0)return 45;
 return 25;
}

export function ticketProfitConfidence206(row={}){
 const learned=row.learnedNet||{};
 if(learned.status!=='LEARNED NET'||learned.netProfit==null||learned.netRevenue==null)return {ok:false,score:null,band:'NO NET MODEL',range:null,reason:'LEARNED_NET_REQUIRED'};
 const payoutQuality=payoutQuality206(learned);
 const marketQuality=marketQuality206(row);
 const score=Math.round(clamp(payoutQuality*.65+marketQuality*.35,0,100));
 const band=score>=80?'HIGH':score>=60?'MEDIUM':score>=40?'LOW':'VERY LOW';
 const payoutWidth=String(learned.confidence||'').toUpperCase()==='HIGH'?.06:String(learned.confidence||'').toUpperCase()==='MEDIUM'?.09:String(learned.confidence||'').toUpperCase()==='LOW'?.14:.20;
 const marketPenalty=(100-marketQuality)/100*.12;
 const widthPct=clamp(payoutWidth+marketPenalty,.05,.30);
 const delta=Math.round(n(learned.netRevenue)*widthPct);
 const center=Math.round(n(learned.netProfit));
 return {ok:true,score,band,payoutQuality,marketQuality,widthPct:Math.round(widthPct*1000)/10,range:{low:center-delta,center,high:center+delta},reason:'MODEL_CONFIDENCE_BAND_NOT_STATISTICAL_PROBABILITY'};
}

export function enrichTicketProfitConfidenceScenario206(scenario={}){
 const rows=(scenario.rows||[]).map(row=>({...row,profitConfidence:ticketProfitConfidence206(row)}));
 const funded=rows.filter(r=>n(r?.allocation?.qty)>0);
 const modeled=funded.filter(r=>r.profitConfidence.ok);
 const weightedDen=modeled.reduce((s,r)=>s+Math.max(1,n(r?.learnedNet?.netRevenue)),0);
 const score=weightedDen?Math.round(modeled.reduce((s,r)=>s+r.profitConfidence.score*Math.max(1,n(r?.learnedNet?.netRevenue)),0)/weightedDen):null;
 const fullCoverage=funded.length>0&&modeled.length===funded.length;
 const knownLow=modeled.reduce((s,r)=>s+n(r.profitConfidence.range.low),0);
 const knownCenter=modeled.reduce((s,r)=>s+n(r.profitConfidence.range.center),0);
 const knownHigh=modeled.reduce((s,r)=>s+n(r.profitConfidence.range.high),0);
 const band=score==null?'NO NET MODEL':score>=80?'HIGH':score>=60?'MEDIUM':score>=40?'LOW':'VERY LOW';
 return {...scenario,rows,profitConfidence:{score,band,modeled:modeled.length,funded:funded.length,coveragePct:funded.length?Math.round(modeled.length/funded.length*1000)/10:0,knownRange:modeled.length?{low:knownLow,center:knownCenter,high:knownHigh}:null,fullRange:fullCoverage?{low:knownLow,center:knownCenter,high:knownHigh}:null,fullCoverage}};
}

export function buildTicketProfitConfidencePlanner206(input={},now=Date.now(),opts={}){
 const learnedPlanner=buildTicketLearnedNetPlanner205(input,now,opts);
 const scenarios=learnedPlanner.scenarios.map(enrichTicketProfitConfidenceScenario206);
 const balanced=scenarios.find(x=>x.mode==='BALANCED')||null;
 return {version:TICKET_PROFIT_CONFIDENCE_VERSION_206,scenarios,recommended:'BALANCED',balanced,learning:learnedPlanner.learning,learnedPlanner,summary:{fullConfidence:scenarios.filter(s=>s.profitConfidence.fullCoverage).length,withConfidence:scenarios.filter(s=>s.profitConfidence.score!=null).length}};
}
