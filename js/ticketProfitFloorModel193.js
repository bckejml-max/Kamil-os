import {buildTicketPayoutLearning192} from './ticketPayoutLearningModel192.js';

export const TICKET_PROFIT_FLOOR_VERSION_193=193;
const n=v=>Number(v||0)||0;
const arr=v=>Array.isArray(v)?v:[];
const status=row=>String(row?.market_status||row?.marketStatus||'').toUpperCase();
const qty=row=>Math.max(1,n(row?.qty)||1);
const buyTotal=row=>n(row?.buy_total_czk??row?.buyTotalCzk)||(n(row?.buy_each_czk??row?.buyEachCzk)*qty(row));
const askEach=row=>n(row?.ask_each_czk??row?.askEachCzk??row?.listPrice)||null;
const name=row=>String(row?.event_name||row?.eventName||row?.name||row?.id||'Vstupenka');

function payoutStats193(learning,market){
 const exact=learning?.byMarket?.[market];
 if(exact?.count>=1&&exact?.ratio>0)return{ok:true,ratio:exact.ratio,feeRate:exact.feeRate,confidence:exact.confidence,samples:exact.count,source:`${market} history`};
 if(learning?.knownGlobal?.count>=2&&learning.knownGlobal.ratio>0)return{ok:true,ratio:learning.knownGlobal.ratio,feeRate:learning.knownGlobal.feeRate,confidence:learning.knownGlobal.confidence,samples:learning.knownGlobal.count,source:'cross-market history'};
 if(learning?.global?.count>=3&&learning.global.ratio>0)return{ok:true,ratio:learning.global.ratio,feeRate:learning.global.feeRate,confidence:learning.global.confidence,samples:learning.global.count,source:'all payout history'};
 return{ok:false,ratio:null,feeRate:null,confidence:'NONE',samples:0,source:null};
}

export function ticketProfitFloor193(row={},learning,market='Viagogo',roi=0){
 const q=qty(row),cost=buyTotal(row),stats=payoutStats193(learning,market);
 if(!(cost>0))return{ok:false,reason:'NO_COST',market,roi,costTotal:null,grossFloor:null,askEachFloor:null,netTarget:null,ratio:null,confidence:'NONE'};
 if(!stats.ok)return{ok:false,reason:'INSUFFICIENT_HISTORY',market,roi,costTotal:cost,grossFloor:null,askEachFloor:null,netTarget:Math.ceil(cost*(1+roi)),ratio:null,confidence:'NONE'};
 const netTarget=cost*(1+roi);
 const grossFloor=netTarget/stats.ratio;
 const askEachFloor=Math.ceil(grossFloor/q);
 return{ok:true,market,roi,costTotal:cost,netTarget:Math.ceil(netTarget),grossFloor:Math.ceil(grossFloor),askEachFloor,ratio:stats.ratio,feeRate:stats.feeRate,confidence:stats.confidence,samples:stats.samples,source:stats.source};
}

export function buildTicketProfitFloorRow193(row={},learning){
 const q=qty(row),ask=askEach(row),cost=buyTotal(row),market='Viagogo';
 const floors={breakEven:ticketProfitFloor193(row,learning,market,0),roi20:ticketProfitFloor193(row,learning,market,.2),roi50:ticketProfitFloor193(row,learning,market,.5)};
 let verdict='PAYOUT DATA NEEDED',reason='Bez skutečné payout historie nelze bezpečný floor spočítat.';
 if(floors.breakEven.ok&&ask){
  if(ask<floors.breakEven.askEachFloor){verdict='BELOW BREAK-EVEN';reason='Aktuální ask je pod odhadovanou break-even cenou po marketplace fee.';}
  else if(ask<floors.roi20.askEachFloor){verdict='LOW MARGIN';reason='Ask je nad break-even, ale pod cílem +20 % ROI.';}
  else if(ask<floors.roi50.askEachFloor){verdict='SAFE +20%';reason='Ask splňuje alespoň +20 % ROI, ale ještě ne +50 %.';}
  else{verdict='SAFE +50%';reason='Ask je nad odhadovaným floorem pro +50 % ROI.';}
 }
 return{id:row?.id||'',name:name(row),section:String(row?.section||'—'),qty:q,costTotal:cost,askEach:ask,status:status(row),floors,verdict,reason};
}

export function buildTicketProfitFloorDesk193(inventory=[]){
 const learning=buildTicketPayoutLearning192(inventory);
 const rows=arr(inventory).filter(row=>['LISTED','NOT_LISTED'].includes(status(row))).map(row=>buildTicketProfitFloorRow193(row,learning));
 const known=rows.filter(r=>r.floors.breakEven.ok);
 return{version:TICKET_PROFIT_FLOOR_VERSION_193,learning,rows,coverage:{active:rows.length,knownFloors:known.length,belowBreakEven:rows.filter(r=>r.verdict==='BELOW BREAK-EVEN').length,safe50:rows.filter(r=>r.verdict==='SAFE +50%').length}};
}
