import {opportunityScore671} from './ticketDecisionEngine671.js';

const daysTo=v=>{const t=Date.parse(v||'');return Number.isFinite(t)?Math.ceil((t-Date.now())/86400000):999};
export function buyRadarSignals674(x={}){return{officialSoldOut:String(x.official_status||x.officialStatus||'').toUpperCase()==='SOLD_OUT',lowStock:String(x.official_status||x.officialStatus||'').toUpperCase()==='LOW_STOCK',capacity:Number(x.capacity||0),secondarySpreadPct:Number(x.secondary_spread_pct??x.secondarySpreadPct??0),extraDates:Number(x.extra_dates??x.extraDates??0),daysToSale:daysTo(x.official_sale_start||x.saleStart)}}
export function scoreBuyCandidate674(x={}){const score=opportunityScore671(buyRadarSignals674(x));return{score,label:score>=80?'PROVĚŘIT NÁKUP':score>=65?'HLÍDAT':'NEBRAT',tone:score>=80?'success':score>=65?'warning':'neutral'}}
