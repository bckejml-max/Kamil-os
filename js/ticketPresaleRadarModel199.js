import {ticketOpportunityScore198} from './ticketOpportunityModel198.js';

export const TICKET_PRESALE_RADAR_VERSION_199=199;
const n=v=>Number(v||0)||0;
const text=v=>String(v??'').trim();
const saleValue=x=>x?.presaleAt??x?.presale_at??x?.saleAt??x?.sale_at??x?.onSaleAt??x?.on_sale_at??x?.officialSaleAt??x?.official_sale_at??x?.saleDate??x?.sale_date??null;
const parseTime=v=>{const t=Date.parse(v||'');return Number.isFinite(t)?t:null};
const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,v));

export function ticketPresaleStage199(saleAt,now=Date.now()){
 const t=parseTime(saleAt);if(t==null)return {stage:'NO_DATE',hours:null,days:null,urgency:0};
 const hours=(t-now)/36e5,days=Math.ceil(hours/24);
 if(hours<=0&&hours>-24)return {stage:'LIVE',hours,days:0,urgency:100};
 if(hours<=0)return {stage:'PAST',hours,days,urgency:0};
 if(hours<=24)return {stage:'TODAY',hours,days:1,urgency:96};
 if(hours<=48)return {stage:'D-1',hours,days:2,urgency:88};
 if(hours<=96)return {stage:'D-3',hours,days:4,urgency:76};
 if(hours<=192)return {stage:'D-7',hours,days:8,urgency:62};
 return {stage:'UPCOMING',hours,days,urgency:Math.max(12,55-Math.min(40,Math.floor(hours/72)))};
}

export function ticketPresaleCandidate199(candidate={},now=Date.now()){
 const saleAt=saleValue(candidate),stage=ticketPresaleStage199(saleAt,now);
 const opportunity=ticketOpportunityScore198(candidate,now);
 const hasPriceData=!!(opportunity.officialPrice&&opportunity.marketPrice);
 let action='PLAN';
 if(stage.stage==='PAST')action='PAST';
 else if(stage.stage==='NO_DATE')action='SET DATE';
 else if(!hasPriceData&&['LIVE','TODAY','D-1','D-3','D-7'].includes(stage.stage))action='DATA NEEDED';
 else if(opportunity.action==='BUY'&&['LIVE','TODAY','D-1','D-3','D-7'].includes(stage.stage))action='BUY TARGET';
 else if(['LIVE','TODAY'].includes(stage.stage))action='READY NOW';
 else if(['D-1','D-3'].includes(stage.stage))action='PREPARE';
 else if(stage.stage==='D-7')action='WATCH SALE';
 const priority=clamp(Math.round(stage.urgency*.62+opportunity.score*.38));
 return {...candidate,saleAt:saleAt||null,stage:stage.stage,hoursUntilSale:stage.hours,daysUntilSale:stage.days,urgency:stage.urgency,opportunity,action,priority,hasPriceData};
}

export function buildTicketPresaleRadar199(watchlist=[],now=Date.now(),limit=8){
 const rows=(watchlist||[]).map(x=>ticketPresaleCandidate199({...x,name:x.name??x.eventName??x.event_name??'Presale event',eventDate:x.eventDate??x.event_date??x.date,officialPriceCzk:n(x.officialPriceCzk??x.official_price_czk??x.faceValueCzk),marketPriceCzk:n(x.marketPriceCzk??x.market_price_czk??x.resalePriceCzk),medianPriceCzk:n(x.medianPriceCzk??x.median_price_czk),confidenceScore:n(x.confidenceScore??x.confidence)},now)).filter(x=>x.stage!=='PAST').sort((a,b)=>b.priority-a.priority||(parseTime(a.saleAt)??Infinity)-(parseTime(b.saleAt)??Infinity));
 const visible=rows.slice(0,Math.max(1,Math.min(12,limit||8)));
 return {version:TICKET_PRESALE_RADAR_VERSION_199,rows,visible,summary:{tracked:rows.length,buyTargets:rows.filter(x=>x.action==='BUY TARGET').length,today:rows.filter(x=>['LIVE','TODAY'].includes(x.stage)).length,next7d:rows.filter(x=>['LIVE','TODAY','D-1','D-3','D-7'].includes(x.stage)).length,dataNeeded:rows.filter(x=>x.action==='DATA NEEDED').length}};
}

export function ticketPresaleLabel199(row={}){
 const name=text(row.name||row.event_name||'Presale');
 return `${row.stage||'UPCOMING'} · ${row.action||'PLAN'} · ${name}`;
}
