import {xtbBoard as ruleXtbBoard,xtbDataAge,ticketDecision as ruleTicketDecision,ticketOpportunityDecision as ruleTicketOpportunityDecision,actionLabel,actionTone} from './decision24.js';
import {applyTicketLearning} from './ticketLearning25.js';

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
export const xtbIntelligenceAge=s=>age(s.xtbStrategy?.liveAsOf||s.xtbStrategy?.live?.asOf,48);
export const ticketIntelligenceAge=s=>age(s.ticketBook?.intelligenceAsOf||s.ticketBook?.intelligence?.asOf,30);

const mergeLive=(auto,live,meta)=>{
 if(!live?.action||!meta.fresh)return auto;
 const action=upper(live.action);
 return {...auto,...live,action,priority:Math.max(0,Math.min(100,n(live.priority)||n(auto.priority))),confidence:live.confidence===undefined||live.confidence===null?null:Math.max(0,Math.min(100,n(live.confidence))),when:live.when||auto.when,reason:live.reason||auto.reason,buyRule:live.buyRule||auto.buyRule,sellRule:live.sellRule||auto.sellRule,source:'ŽIVĚ',tone:actionTone(action),live:true,asOf:meta.raw,sourceUrls:Array.isArray(live.sourceUrls)?live.sourceUrls:[]};
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
   return {...item,d:mergeLive(item.d,positions[item.p.ticker],meta)};
 }).sort((a,b)=>b.d.priority-a.d.priority);
}

export function ticketDecision(x,s={}){
 const auto=ruleTicketDecision(x),intel=s.ticketBook?.intelligence||{},live=intel.positions?.[x.id]||(!intel.positions?intel[x.id]:null);
 return mergeLive(auto,live,ticketIntelligenceAge(s));
}

export function ticketOpportunityDecision(x,s={}){
 const auto=ruleTicketOpportunityDecision(x),intel=s.ticketBook?.intelligence||{},live=intel.opportunities?.[x.id];
 const merged=mergeLive(auto,live,ticketIntelligenceAge(s));
 return applyTicketLearning(x,s,merged);
}
