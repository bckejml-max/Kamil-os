import {xtbBoard as ruleXtbBoard,xtbDataAge,ticketDecision as ruleTicketDecision,ticketOpportunityDecision as ruleTicketOpportunityDecision,actionLabel,actionTone} from './decision24.js';
import {applyTicketLearning} from './ticketLearning25.js';
import {liveSignalTrust32,LIVE_BRAIN_LIMITS_32} from './liveBrain32.js';

const n=v=>Number(v||0);
const upper=v=>String(v||'').toUpperCase();
const age=(raw,maxHours)=>{
 if(!raw)return {raw:null,hours:null,days:null,fresh:false,stale:true,label:'bez živé analýzy'};
 const t=new Date(raw).getTime();if(!Number.isFinite(t))return {raw,hours:null,days:null,fresh:false,stale:true,label:'neplatné datum'};
 const hours=Math.max(0,Math.floor((Date.now()-t)/3600000)),days=Math.floor(hours/24),fresh=hours<=maxHours;
 const label=hours<1?'právě teď':hours<24?`před ${hours} h`:days===1?'před 1 dnem':`před ${days} dny`;
 return {raw,hours,days,fresh,stale:!fresh,label};
};

export {actionLabel,actionTone,xtbDataAge};
export const xtbIntelligenceAge=s=>age(s.xtbStrategy?.liveAsOf||s.xtbStrategy?.live?.asOf,LIVE_BRAIN_LIMITS_32.xtbHours);
export const ticketIntelligenceAge=s=>age(s.ticketBook?.intelligenceAsOf||s.ticketBook?.intelligence?.asOf,LIVE_BRAIN_LIMITS_32.ticketHours);

const mergeLive=(auto,live,meta,maxHours)=>{
 if(!live?.action)return auto;
 const trust=liveSignalTrust32(live,{asOf:meta.raw,maxHours});
 if(!trust.trusted)return {...auto,live:false,liveCandidate:true,liveTrust:trust.status,liveTrustIssues:trust.issues,liveAsOf:trust.asOf||meta.raw};
 const action=upper(live.action);
 return {...auto,...live,action,priority:Math.max(0,Math.min(100,n(live.priority)||n(auto.priority))),confidence:trust.confidence,when:live.when||auto.when,reason:live.reason||auto.reason,buyRule:live.buyRule||auto.buyRule,sellRule:live.sellRule||auto.sellRule,source:'ŽIVĚ · OVĚŘENÉ',tone:actionTone(action),live:true,asOf:trust.asOf,sourceUrls:trust.sourceUrls,liveTrust:'TRUSTED_FRESH',liveTrustIssues:[]};
};
const closedByNewerUserAction=(s,ticker)=>{
 const raw=s.xtbStrategy?.closedTickers?.[ticker];if(!raw)return false;
 const closedAt=new Date(typeof raw==='string'?raw:raw.at||0).getTime();if(!Number.isFinite(closedAt))return false;
 const importAt=new Date(s.xtbHub?.asOf||s.xtbReport?.asOf||0).getTime();
 return !Number.isFinite(importAt)||importAt<=closedAt;
};

export function xtbBoard(s){
 const meta=xtbIntelligenceAge(s),positions=s.xtbStrategy?.live?.positions||{};
 return ruleXtbBoard(s).filter(item=>!closedByNewerUserAction(s,item.p.ticker)).map(item=>{
   if(item.d.source==='RUČNĚ')return item;
   return {...item,d:mergeLive(item.d,positions[item.p.ticker],meta,LIVE_BRAIN_LIMITS_32.xtbHours)};
 }).sort((a,b)=>b.d.priority-a.d.priority);
}

export function ticketDecision(x,s={}){
 const auto=ruleTicketDecision(x),intel=s.ticketBook?.intelligence||{},live=intel.positions?.[x.id]||(!intel.positions?intel[x.id]:null);
 return mergeLive(auto,live,ticketIntelligenceAge(s),LIVE_BRAIN_LIMITS_32.ticketHours);
}

export function ticketOpportunityDecision(x,s={}){
 const auto=ruleTicketOpportunityDecision(x),intel=s.ticketBook?.intelligence||{},live=intel.opportunities?.[x.id];
 const merged=mergeLive(auto,live,ticketIntelligenceAge(s),LIVE_BRAIN_LIMITS_32.ticketHours);
 return applyTicketLearning(x,s,merged);
}
