import {buildTicketPayoutLearning192,inferTicketMarketplace192} from './ticketPayoutLearningModel192.js';

export const TICKET_OPPORTUNITY_VERSION_198=280;
export const TICKET_COMPLIANCE_TTL_DAYS_280=14;
const n=v=>Number(v||0)||0;
const text=v=>String(v??'').trim();
const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,v));
const daysUntil=(date,now=Date.now())=>{const t=Date.parse(date||'');return Number.isFinite(t)?Math.ceil((t-now)/86400000):null};
const bool=v=>v===true||String(v).toLowerCase()==='true';
const explicitFalse=v=>v===false||String(v).toLowerCase()==='false';
const saleStatus=v=>text(v).toUpperCase().replace(/[ -]+/g,'_');
const SALE_OK=new Set(['LIVE','ON_SALE','OPEN','AVAILABLE','VERIFIED','ACTIVE']);
const SALE_BLOCKED=new Set(['CLOSED','CANCELLED','CANCELED','SUSPENDED','BLOCKED','OFF_SALE']);

export function ticketComplianceGate198(candidate={},now=Date.now()){
 const resaleRaw=candidate.resaleAllowed??candidate.resale_allowed;
 const transferRaw=candidate.transferCompatible??candidate.transfer_compatible;
 const officialStatus=saleStatus(candidate.officialSaleStatus??candidate.official_sale_status);
 const verifiedAt=text(candidate.restrictionsVerifiedAt??candidate.restrictions_verified_at);
 const verifiedTime=Date.parse(verifiedAt||'');
 const resaleAllowed=bool(resaleRaw),transferCompatible=bool(transferRaw),saleVerified=SALE_OK.has(officialStatus),hasVerifiedAt=Number.isFinite(verifiedTime);
 const ageDays=hasVerifiedAt?Math.max(0,(now-verifiedTime)/86400000):null,fresh=hasVerifiedAt&&ageDays<=TICKET_COMPLIANCE_TTL_DAYS_280;
 const blocked=explicitFalse(resaleRaw)||explicitFalse(transferRaw)||SALE_BLOCKED.has(officialStatus);
 const verified=!blocked&&resaleAllowed&&transferCompatible&&saleVerified&&fresh;
 const missing=[];
 if(resaleRaw==null||(!resaleAllowed&&!explicitFalse(resaleRaw)))missing.push('resaleAllowed');
 if(transferRaw==null||(!transferCompatible&&!explicitFalse(transferRaw)))missing.push('transferCompatible');
 if(!officialStatus)missing.push('officialSaleStatus');else if(!saleVerified&&!SALE_BLOCKED.has(officialStatus))missing.push('officialSaleStatus');
 if(!hasVerifiedAt)missing.push('restrictionsVerifiedAt');else if(!fresh)missing.push('restrictionsVerificationFreshness');
 return {verified,blocked,resaleAllowed,transferCompatible,officialSaleStatus:officialStatus||null,restrictionsVerifiedAt:hasVerifiedAt?new Date(verifiedTime).toISOString():null,verificationAgeDays:ageDays==null?null:Math.round(ageDays*10)/10,fresh,ttlDays:TICKET_COMPLIANCE_TTL_DAYS_280,missing};
}

export function ticketBuyFinance198(candidate={},marketRef=0,finance={}){
 const targetRoiPct=Math.max(0,n(candidate.targetRoiPct??candidate.target_roi_pct??finance.targetRoiPct)||50);
 const directRatio=n(candidate.learnedPayoutRatio??candidate.learned_payout_ratio??candidate.payoutRatio??candidate.payout_ratio);
 const directSamples=Math.floor(n(candidate.payoutSamples??candidate.payout_samples));
 const learning=finance.learning;
 const market=inferTicketMarketplace192(candidate);
 let ratio=null,samples=0,confidence='NONE',source=null;
 if(directRatio>0&&directRatio<=1&&directSamples>=2){ratio=directRatio;samples=directSamples;confidence=text(candidate.payoutConfidence??candidate.payout_confidence)||'DIRECT';source='candidate payout history'}
 else{
  const exact=learning?.byMarket?.[market];
  if(exact?.ratio>0&&exact?.count>=2){ratio=exact.ratio;samples=exact.count;confidence=exact.confidence;source=`${market} payout history`}
  else if(learning?.knownGlobal?.ratio>0&&learning?.knownGlobal?.count>=4){ratio=learning.knownGlobal.ratio;samples=learning.knownGlobal.count;confidence=learning.knownGlobal.confidence;source='cross-market payout history'}
 }
 const grossSpreadCeiling=marketRef>0?Math.floor((marketRef/(1+targetRoiPct/100))/10)*10:null;
 const netSafeMaxBuyPrice=marketRef>0&&ratio?Math.floor(((marketRef*ratio)/(1+targetRoiPct/100))/10)*10:null;
 return {ready:!!(netSafeMaxBuyPrice&&ratio),market,ratio,samples,confidence,source,targetRoiPct,grossSpreadCeiling,netSafeMaxBuyPrice};
}

export function ticketOpportunityScore198(candidate={},now=Date.now(),finance={}){
 const official=n(candidate.officialPriceCzk??candidate.official_price_czk??candidate.buyEachCzk??candidate.buy_each_czk);
 const market=n(candidate.marketPriceCzk??candidate.market_price_czk??candidate.resalePriceCzk);
 const median=n(candidate.medianPriceCzk??candidate.median_price_czk);
 const marketRef=median||market;
 const upside=official>0&&marketRef>0?(marketRef/official-1):null;
 const days=daysUntil(candidate.eventDate??candidate.event_date??candidate.date,now);
 const confidence=n(candidate.confidenceScore??candidate.multi_market_confidence??candidate.confidence)||0;
 const competitor=n(candidate.competitorCount??candidate.competitor_count);
 const sectionCount=n(candidate.sameSectionCount??candidate.same_section_count);
 let score=0;
 if(upside!=null)score+=clamp(Math.round(upside*55),-30,55);
 if(confidence>=85)score+=18;else if(confidence>=65)score+=12;else if(confidence>=45)score+=5;
 if(competitor>=3)score+=6;if(sectionCount>=2)score+=5;
 if(days==null)score-=8;else if(days>=7&&days<=45)score+=12;else if(days>45&&days<=120)score+=8;else if(days<=2)score-=18;else if(days<7)score-=6;
 if(!official)score-=25;if(!marketRef)score-=30;
 score=clamp(Math.round(score));
 const rawAction=score>=68&&upside!=null&&upside>=.45?'BUY':score>=45?'WATCH':'SKIP';
 const compliance=ticketComplianceGate198(candidate,now);
 const buyFinance=ticketBuyFinance198(candidate,marketRef,finance);
 let action=rawAction;
 if(rawAction==='BUY'&&compliance.blocked)action='BLOCK';
 else if(rawAction==='BUY'&&!compliance.verified)action='VERIFY';
 else if(rawAction==='BUY'&&!buyFinance.ready)action='DATA NEEDED';
 return {score,action,rawAction,compliance,buyFinance,upsidePct:upside==null?null:Math.round(upside*100),days,officialPrice:official||null,marketPrice:marketRef||null,grossSpreadCeiling:buyFinance.grossSpreadCeiling,maxBuyPrice:buyFinance.netSafeMaxBuyPrice,netSafeMaxBuyPrice:buyFinance.netSafeMaxBuyPrice};
}

export function buildTicketOpportunityScanner198({inventory=[],latest=new Map(),watchlist=[]}={},now=Date.now()){
 const learning=buildTicketPayoutLearning192(inventory);
 const finance={learning};
 const ownedIds=new Set((inventory||[]).map(x=>text(x.id)).filter(Boolean));
 const buyMore=(inventory||[]).filter(x=>['LISTED','NOT_LISTED'].includes(text(x.market_status??x.marketStatus).toUpperCase())).map(row=>{
  const m=latest?.get?.(row.id)||{};
  const candidate={...row,...m,id:row.id,name:row.event_name??row.eventName,eventDate:row.event_date??row.eventDate,officialPriceCzk:n(m.official_price_czk)||n(row.buy_each_czk??row.buyEachCzk),marketPriceCzk:n(m.market_price_czk),medianPriceCzk:n(m.median_price_czk),confidenceScore:n(m.multi_market_confidence)};
  return {...candidate,kind:'BUY_MORE',owned:true,...ticketOpportunityScore198(candidate,now,finance)};
 });
 const watch=(watchlist||[]).filter(x=>!ownedIds.has(text(x.ticketId??x.ticket_id??x.id))).map(x=>{
  const candidate={...x,name:x.name??x.eventName??x.event_name??'Watchlist event',eventDate:x.eventDate??x.event_date??x.date,officialPriceCzk:n(x.officialPriceCzk??x.official_price_czk??x.faceValueCzk),marketPriceCzk:n(x.marketPriceCzk??x.market_price_czk??x.resalePriceCzk),medianPriceCzk:n(x.medianPriceCzk??x.median_price_czk),confidenceScore:n(x.confidenceScore??x.confidence)};
  return {...candidate,kind:'WATCHLIST',owned:false,...ticketOpportunityScore198(candidate,now,finance)};
 });
 const rows=[...watch,...buyMore].sort((a,b)=>b.score-a.score);
 const count=a=>rows.filter(x=>x.action===a).length;
 return {version:TICKET_OPPORTUNITY_VERSION_198,learning,rows,buy:rows.filter(x=>x.action==='BUY'),verify:rows.filter(x=>x.action==='VERIFY'),blocked:rows.filter(x=>x.action==='BLOCK'),dataNeeded:rows.filter(x=>x.action==='DATA NEEDED'),watch:rows.filter(x=>x.action==='WATCH'),skip:rows.filter(x=>x.action==='SKIP'),summary:{candidates:rows.length,buy:count('BUY'),verify:count('VERIFY'),blocked:count('BLOCK'),dataNeeded:count('DATA NEEDED'),watch:count('WATCH'),skip:count('SKIP')}};
}
