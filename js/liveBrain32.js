const finite=v=>Number.isFinite(Number(v));
const clamp=(v,min=0,max=100)=>Math.max(min,Math.min(max,Number(v)));
const upper=v=>String(v??'').trim().toUpperCase();
const asArray=v=>Array.isArray(v)?v:[];

export const LIVE_BRAIN_LIMITS_32={xtbHours:48,ticketHours:30,futureSkewMinutes:5,maxSources:8};

export function validSourceUrl32(raw){
 try{
  const u=new URL(String(raw||'').trim());
  return ['http:','https:'].includes(u.protocol)&&!u.username&&!u.password&&!!u.hostname;
 }catch{return false}
}

export function normalizeSourceUrls32(live={}){
 const raw=[...asArray(live?.sourceUrls),live?.sourceUrl].filter(Boolean),out=[];
 for(const value of raw){const url=String(value).trim();if(!validSourceUrl32(url)||out.includes(url))continue;out.push(url);if(out.length>=LIVE_BRAIN_LIMITS_32.maxSources)break}
 return out;
}

export function liveSignalTrust32(live={},opts={}){
 const action=upper(live?.action),rawAsOf=live?.asOf||opts.asOf||null,maxHours=Number(opts.maxHours),futureSkewMinutes=Number.isFinite(Number(opts.futureSkewMinutes))?Number(opts.futureSkewMinutes):LIVE_BRAIN_LIMITS_32.futureSkewMinutes,now=opts.now instanceof Date?opts.now:new Date(opts.now||Date.now()),nowMs=now.getTime();
 if(!action)return {trusted:false,status:'NO_ACTION',issues:['NO_ACTION'],action:null,asOf:rawAsOf,ageHours:null,confidence:null,sourceUrls:[]};
 const at=new Date(rawAsOf||'').getTime();
 if(!Number.isFinite(at)||!Number.isFinite(nowMs))return {trusted:false,status:'INVALID_ASOF',issues:['INVALID_ASOF'],action,asOf:rawAsOf,ageHours:null,confidence:null,sourceUrls:normalizeSourceUrls32(live)};
 const futureMinutes=(at-nowMs)/60000,ageHours=Math.max(0,(nowMs-at)/3600000),sourceUrls=normalizeSourceUrls32(live),confidence=finite(live?.confidence)?clamp(live.confidence):null,issues=[];
 if(futureMinutes>futureSkewMinutes)issues.push('FUTURE_ASOF');
 if(Number.isFinite(maxHours)&&maxHours>=0&&ageHours>maxHours)issues.push('STALE');
 if(!sourceUrls.length)issues.push('UNSOURCED');
 if(confidence===null)issues.push('NO_CONFIDENCE');
 const status=issues[0]||'TRUSTED_FRESH';
 return {trusted:issues.length===0,status,issues,action,asOf:new Date(at).toISOString(),ageHours,confidence,sourceUrls,sourceHosts:sourceUrls.map(x=>new URL(x).hostname)};
}

const values=o=>o&&typeof o==='object'?Object.values(o):[];
function domainSummary(signals,asOf,maxHours,now){
 const checks=signals.filter(Boolean).map(live=>liveSignalTrust32(live,{asOf,maxHours,now})),has=issue=>checks.filter(x=>x.issues.includes(issue)).length;
 return {total:checks.length,trusted:checks.filter(x=>x.trusted).length,blocked:checks.filter(x=>!x.trusted).length,stale:has('STALE'),unsourced:has('UNSOURCED'),noConfidence:has('NO_CONFIDENCE'),invalidAsOf:has('INVALID_ASOF')+has('FUTURE_ASOF'),checks};
}

export function liveBrainSummary32(state={},now=new Date()){
 const xtbLive=state.xtbStrategy?.live||{},ticketIntel=state.ticketBook?.intelligence||{},xtb=domainSummary(values(xtbLive.positions),state.xtbStrategy?.liveAsOf||xtbLive.asOf,LIVE_BRAIN_LIMITS_32.xtbHours,now),tickets=domainSummary([...values(ticketIntel.positions),...values(ticketIntel.opportunities)],state.ticketBook?.intelligenceAsOf||ticketIntel.asOf,LIVE_BRAIN_LIMITS_32.ticketHours,now),total=xtb.total+tickets.total,trusted=xtb.trusted+tickets.trusted,blocked=xtb.blocked+tickets.blocked;
 return {total,trusted,blocked,xtb,tickets,status:!total?'IDLE':blocked?'WARN':'TRUSTED',contract:'SOURCE_BACKED_ONLY'};
}

export const liveBrain32Contract={requires:['action','asOf','sourceUrls','confidence'],fallback:'RULE_ENGINE',autoTrading:false,unsourcedOverride:false};
