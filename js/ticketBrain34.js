import {ticketMarketPlan32} from './ticketMarketIntel32.js';

const n=v=>Number(v||0),upper=v=>String(v||'').toUpperCase();
const active=x=>['HOLD','LISTED'].includes(upper(x?.workflow||'HOLD'));
const round=v=>Math.round(n(v));
const dayDiff=(raw,now=new Date())=>{const t=Date.parse(raw||0);if(!Number.isFinite(t))return null;const a=new Date(now);a.setHours(0,0,0,0);const b=new Date(t);b.setHours(0,0,0,0);return Math.round((b-a)/86400000)};
const tone=a=>['VERIFY_DATA','SELL_NOW'].includes(a)?'bad':['REPRICE','LIST_NOW','CHECK_MARKET'].includes(a)?'warn':'good';

export function ticketBrainRow34(ticket={},state={},now=new Date()){
 const old=ticketMarketPlan32(ticket,state,now),qty=Math.max(1,n(ticket.qty)||1),buyPer=n(ticket.buy)/qty,current=n(ticket.listPrice),recommended=n(ticket.viagogoRecommended)||n(old.marketPrice),recommendedSource=n(ticket.viagogoRecommended)?'VIAGOGO_SNAPSHOT':old.marketFresh?'MARKET':'NONE',eventDays=dayDiff(ticket.date,now),breakEven=Math.max(buyPer,n(old.breakEven),n(ticket.floorPrice)),warning=String(ticket.inventoryWarning||''),listed=upper(ticket.workflow)==='LISTED';
 let action='HOLD',priority=48,reason='Je dost času a z dostupných dat nevychází nutnost měnit cenu.',suggested=current||null;
 if(warning){action='VERIFY_DATA';priority=100;reason=`Nejdřív oprav evidenci: ${warning}`;suggested=null}
 else if(eventDays!==null&&eventDays<=3){action='SELL_NOW';priority=99;suggested=round(Math.max(breakEven,recommended||breakEven));reason='Do akce zbývají maximálně 3 dny. Priorita je likvidita; cenu držet nejméně na bezpečném flooru.'}
 else if(listed&&recommended>0&&current>0&&eventDays!==null&&eventDays<=14&&current>recommended*1.15){action='REPRICE';priority=93;suggested=round(Math.max(breakEven,recommended,current*.9));reason=`Listing je ${Math.round((current/recommended-1)*100)} % nad dostupným doporučením a akce je do 14 dnů. Snižovat postupně, ne pod bezpečný floor.`}
 else if(listed&&recommended>0&&current>0&&eventDays!==null&&eventDays<=30&&current>recommended*1.3){action='REPRICE';priority=86;suggested=round(Math.max(breakEven,recommended*1.05,current*.92));reason='Listing je výrazně nad dostupným doporučením a prodejní okno se zkracuje.'}
 else if(!listed&&eventDays!==null&&eventDays<=30){action='LIST_NOW';priority=84;suggested=recommended>0?round(Math.max(breakEven,recommended)):null;reason='Akce je do 30 dnů a pozice ještě není aktivně vystavená.'}
 else if(listed&&recommended<=0){action='CHECK_MARKET';priority=82;suggested=null;reason='Listing je aktivní, ale chybí použitelný aktuální market/recommended snapshot. Bez něj cenu nevymýšlím.'}
 else if(listed&&recommended>0&&current>0&&current<=recommended*1.15){action='HOLD';priority=58;suggested=current;reason='Aktuální listing je v rozumném pásmu vůči dostupnému doporučení; teď není důvod zlevňovat.'}
 else if(!listed){action='HOLD';priority=45;suggested=null;reason='Do aktivního prodejního okna je zatím dost času.'}
 const grossAtList=current>0?current*qty-n(ticket.buy):null,grossAtSuggested=suggested>0?suggested*qty-n(ticket.buy):null,premium=recommended>0&&current>0?(current/recommended-1)*100:null;
 return {ticketId:ticket.id,eventName:ticket.eventName||ticket.name||'Vstupenky',name:ticket.name||ticket.eventName||'Vstupenky',date:ticket.date||null,qty,listedQty:n(ticket.listedQty)||qty,section:ticket.section||null,row:ticket.row||null,workflow:upper(ticket.workflow||'HOLD'),action,tone:tone(action),priority,reason,eventDays,buyPer:round(buyPer),currentListPrice:current||null,recommendedPrice:recommended||null,recommendedSource,suggestedPrice:suggested||null,breakEven:round(breakEven),grossAtList:grossAtList===null?null:round(grossAtList),grossAtSuggested:grossAtSuggested===null?null:round(grossAtSuggested),premiumPct:premium===null?null:Math.round(premium),inventoryWarning:warning||null,listingSnapshotAt:ticket.listingSnapshotAt||ticket.snapshotAt||null,contract:'PROPOSAL_ONLY'};
}

export function ticketMarketBrain34(state={},now=new Date()){
 const rows=(state.ticketBook?.items||[]).filter(active).map(x=>ticketBrainRow34(x,state,now)).sort((a,b)=>b.priority-a.priority||String(a.date||'').localeCompare(String(b.date||''))),counts={verify:rows.filter(x=>x.action==='VERIFY_DATA').length,sell:rows.filter(x=>x.action==='SELL_NOW').length,reprice:rows.filter(x=>x.action==='REPRICE').length,list:rows.filter(x=>x.action==='LIST_NOW').length,market:rows.filter(x=>x.action==='CHECK_MARKET').length};
 return {rows,top:rows[0]||null,counts,total:rows.length,generatedAt:new Date(now).toISOString(),note:'Ticket Brain kombinuje tvoji nákupní cenu, aktuální listing, dostupný market/doporučený snapshot, čas do akce a bezpečný floor. Nic automaticky nepřecenňuje ani neprodává.'};
}
