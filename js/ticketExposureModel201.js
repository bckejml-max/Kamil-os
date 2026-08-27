export const TICKET_EXPOSURE_VERSION_201=201;
const n=v=>Number(v||0)||0;
const text=v=>String(v??'').trim();
const OPEN=new Set(['LISTED','NOT_LISTED','ACTIVE','HOLD']);
const norm=v=>text(v).toLowerCase().replace(/[^a-z0-9á-ž]+/gi,' ').trim();
const dateKey=v=>{const t=Date.parse(v||'');return Number.isFinite(t)?new Date(t).toISOString().slice(0,10):''};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const invested=r=>n(r.buy_total_czk??r.buyTotalCzk)||(n(r.buy_each_czk??r.buyEachCzk)*Math.max(1,n(r.qty)));

export function ticketExposureKeys201(row={}){
 const event=norm(row.event_key??row.eventKey??row.event_name??row.eventName??row.name);
 const group=norm(row.club??row.team??row.artist??row.organizer??row.home_team??row.homeTeam);
 const category=norm(row.sport??row.category??row.event_category??row.eventCategory);
 const date=dateKey(row.event_date??row.eventDate??row.date);
 return {event,group,category,date};
}

export function buildTicketExposure201(inventory=[],capitalCzk=0){
 const capital=n(capitalCzk);
 const active=(inventory||[]).filter(r=>OPEN.has(text(r.market_status??r.marketStatus).toUpperCase()));
 const buckets={event:new Map(),group:new Map(),category:new Map(),date:new Map()};
 let total=0;
 for(const row of active){const value=invested(row);if(!value)continue;total+=value;const keys=ticketExposureKeys201(row);for(const dim of Object.keys(buckets)){const key=keys[dim];if(key)buckets[dim].set(key,(buckets[dim].get(key)||0)+value)}}
 const ranked={};for(const dim of Object.keys(buckets))ranked[dim]=[...buckets[dim]].map(([key,value])=>({key,value:Math.round(value),pct:capital>0?Math.round(value/capital*1000)/10:null})).sort((a,b)=>b.value-a.value);
 return {version:TICKET_EXPOSURE_VERSION_201,capital:capital||null,invested:Math.round(total),buckets,ranked};
}

export function ticketExposureGuard201(candidate={},exposure={},opts={}){
 const capital=n(exposure?.capital);
 const keys=ticketExposureKeys201(candidate);
 const caps={event:clamp(n(opts.eventCapPct)||20,5,40),group:clamp(n(opts.groupCapPct)||35,10,70),date:clamp(n(opts.dateCapPct)||30,10,60),category:clamp(n(opts.categoryCapPct)||60,20,90)};
 if(!capital)return {ok:false,reason:'NO_CAPITAL',keys,caps,remainingBudget:null,limits:[]};
 const limits=Object.entries(caps).map(([dim,pct])=>{const key=keys[dim];const current=key?n(exposure?.buckets?.[dim]?.get(key)):0;const cap=Math.floor(capital*pct/100);const remaining=Math.max(0,cap-current);return {dimension:dim,key:key||null,pct,current:Math.round(current),cap:Math.round(cap),remaining:Math.round(remaining),applies:!!key}}).filter(x=>x.applies);
 const remainingBudget=limits.length?Math.min(...limits.map(x=>x.remaining)):Math.floor(capital*caps.event/100);
 const binding=limits.find(x=>x.remaining===remainingBudget)||null;
 return {ok:true,reason:remainingBudget>0?'OK':'CONCENTRATED',keys,caps,remainingBudget:Math.round(remainingBudget),binding,limits};
}

export function applyTicketExposureToExecution201(row={},execution={},exposure={},opts={}){
 const guard=ticketExposureGuard201(row,exposure,opts),buyPrice=n(execution.buyPrice),hardQty=Math.max(0,n(execution.maxQty));
 if(!guard.ok)return {...execution,exposureGuard:guard};
 const qtyByExposure=buyPrice>0?Math.floor(guard.remainingBudget/buyPrice):0;
 const maxQty=Math.min(hardQty,qtyByExposure);
 let verdict=execution.verdict;
 if(execution.verdict==='EXECUTE'&&maxQty<1)verdict='CONCENTRATED';
 const deploy=maxQty>0&&buyPrice>0?Math.round(maxQty*buyPrice):0;
 return {...execution,verdict,maxQty,deployCapital:deploy||null,exposureGuard:guard};
}
