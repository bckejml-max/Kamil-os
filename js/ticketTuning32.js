const n=v=>Number(v||0);
const upper=v=>String(v||'').toUpperCase();
const clamp=(v,min=0,max=100)=>Math.max(min,Math.min(max,Number(v)||0));
const isoDay=d=>{const x=new Date(d);return Number.isNaN(x.getTime())?null:x.toISOString().slice(0,10)};
const daysTo=raw=>{if(!raw)return null;const t=new Date(raw);if(Number.isNaN(t.getTime()))return null;const a=new Date();a.setHours(0,0,0,0);t.setHours(0,0,0,0);return Math.round((t-a)/86400000)};

export function ticketPhase32(ticket={}){
 const days=daysTo(ticket.date);
 if(days===null)return {code:'UNKNOWN',label:'Chybí datum',days:null,nextCheckHours:24,targetGrossRoiPct:null,repriceStepPct:0};
 if(days<=3)return {code:'EXIT',label:'Výstup',days,nextCheckHours:6,targetGrossRoiPct:0,repriceStepPct:10};
 if(days<=7)return {code:'LIQUIDITY',label:'Likvidita',days,nextCheckHours:12,targetGrossRoiPct:10,repriceStepPct:7};
 if(days<=14)return {code:'DEFEND',label:'Chránit prodej',days,nextCheckHours:24,targetGrossRoiPct:18,repriceStepPct:5};
 if(days<=30)return {code:'ACTIVE_SELL',label:'Aktivní prodej',days,nextCheckHours:48,targetGrossRoiPct:30,repriceStepPct:4};
 if(days<=45)return {code:'TEST_MARKET',label:'Test trhu',days,nextCheckHours:72,targetGrossRoiPct:40,repriceStepPct:3};
 return {code:'WATCH',label:'Sledovat',days,nextCheckHours:168,targetGrossRoiPct:50,repriceStepPct:0};
}

export function ticketDataQuality32(ticket={}){
 const flow=upper(ticket.workflow||'HOLD'),checks=[
  {key:'date',label:'datum akce',ok:!!ticket.date,critical:true},
  {key:'platform',label:'prodejní platforma',ok:!!String(ticket.platform||'').trim(),critical:false},
  {key:'floorPrice',label:'floor cena',ok:n(ticket.floorPrice)>0,critical:true},
  {key:'sellBy',label:'sell-by datum',ok:!!ticket.sellBy,critical:true},
  {key:'marketPrice',label:'market cena',ok:n(ticket.marketPrice)>0,critical:false},
  {key:'marketCheckedAt',label:'čas kontroly trhu',ok:!!ticket.marketCheckedAt,critical:false},
  {key:'marketSourceUrl',label:'zdroj market ceny',ok:/^https?:\/\//i.test(String(ticket.marketSourceUrl||'')),critical:false},
  {key:'transferStatus',label:'stav převodu',ok:!!ticket.transferStatus&&upper(ticket.transferStatus)!=='UNKNOWN',critical:flow==='LISTED'}
 ];
 if(flow==='LISTED')checks.push({key:'listPrice',label:'skutečná list cena',ok:n(ticket.listPrice)>0,critical:true});
 const score=Math.round(checks.filter(x=>x.ok).length/Math.max(1,checks.length)*100),missing=checks.filter(x=>!x.ok),criticalMissing=missing.filter(x=>x.critical);
 return {score,missing,criticalMissing,ready:criticalMissing.length===0};
}

export function ticketPricingPlan32(ticket={}){
 const phase=ticketPhase32(ticket),qty=Math.max(1,n(ticket.qty)||1),buyPer=n(ticket.buy1)||n(ticket.buy)/qty,feesPer=n(ticket.fees)/qty,breakEven=buyPer+feesPer,market=n(ticket.marketPrice),list=n(ticket.listPrice),floor=n(ticket.floorPrice)||breakEven,targetRoi=phase.targetGrossRoiPct,internalTarget=breakEven>0&&targetRoi!==null?Math.max(floor,Math.round(breakEven*(1+targetRoi/100))):null;
 let marketTarget=null,marketGapPct=null;
 if(market>0){const factor=phase.code==='EXIT'?.97:phase.code==='LIQUIDITY'?.99:phase.code==='DEFEND'?1.00:phase.code==='ACTIVE_SELL'?1.02:1.05;marketTarget=Math.max(floor,Math.round(market*factor));if(list>0)marketGapPct=(list-market)/market*100}
 const event=Date.parse(ticket.date||0),suggestedSellBy=Number.isFinite(event)&&event>0?isoDay(new Date(event-5*86400000)):null;
 return {phase,buyPer,feesPer,breakEven,floor,internalTargetPricePerTicket:internalTarget,recommendedListPricePerTicket:marketTarget,marketPrice:market||null,listPrice:list||null,marketGapPct:marketGapPct===null?null:Math.round(marketGapPct*10)/10,nextCheckHours:phase.nextCheckHours,repriceStepPct:phase.repriceStepPct,suggestedSellBy,priceBasis:marketTarget?'MARKET_INPUT':'INTERNAL_TARGET',note:marketTarget?'Doporučený listing vychází z ručně/zdrojově zadané market ceny a časové fáze.':'Bez market ceny jde jen o interní hrubý target podle nákladu a času; není to tvrzení o tržní ceně.'};
}

export function tuneTicketDecision32(ticket={},decision={}){
 const flow=upper(ticket.workflow||'HOLD'),quality=ticketDataQuality32(ticket),pricing=ticketPricingPlan32(ticket),days=pricing.phase.days;
 let out={...decision,pricingPlan:pricing,dataQuality:quality,nextCheckHours:pricing.nextCheckHours,suggestedSellBy:ticket.sellBy||pricing.suggestedSellBy};
 if(flow==='LISTED'&&n(ticket.listPrice)<=0){
  out={...out,action:'REVIEW',tone:'warn',priority:Math.max(94,n(out.priority)),when:'Doplnit skutečnou list cenu dnes',reason:'Vstupenka je označená jako LISTED, ale Kamil OS nezná cenu, za kterou je skutečně vystavená. Bez ní nejde dělat spolehlivý repricing.',sellRule:'Doplň list cenu; potom ji porovnám s market/floor a časem do akce.'};
 }
 if(days!==null&&days<=14&&quality.criticalMissing.some(x=>x.key==='transferStatus')){
  out.priority=Math.max(90,n(out.priority));out.transferWarning='Akce je do 14 dnů a stav převodu není potvrzený.';
 }
 if(pricing.marketGapPct!==null&&pricing.marketGapPct>8&&flow==='LISTED'){
  out.action='REPRICE';out.tone='warn';out.priority=Math.max(88,n(out.priority));out.when='Upravit cenu dnes';out.reason=`List cena je přibližně ${pricing.marketGapPct.toFixed(1)} % nad zadaným trhem.`;
 }
 return out;
}

export function ticketTuningSummary32(items=[],decider){
 const rows=(Array.isArray(items)?items:[]).filter(x=>!['SOLD','PAYOUT WAIT','PAYOUT RECEIVED'].includes(upper(x.workflow||'HOLD'))).map(x=>({x,d:decider?decider(x):null,q:ticketDataQuality32(x),p:ticketPricingPlan32(x)}));
 return {active:rows.length,lowQuality:rows.filter(r=>r.q.score<60).length,missingListedPrice:rows.filter(r=>upper(r.x.workflow)==='LISTED'&&n(r.x.listPrice)<=0).length,urgent:rows.filter(r=>r.p.phase.days!==null&&r.p.phase.days<=14).length,rows};
}
