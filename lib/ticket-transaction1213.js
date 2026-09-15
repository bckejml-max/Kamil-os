import {appendTicketEvent1195,assertTicketTransition1191,commitCheckpoint1199,payoutReconciliation1192,reconcileQuantity1190,reduceTicketEvents1195,transferDeadline1193,viagogoState1194} from './ticket-integrity1188.js';

export const TICKET_TRANSACTION_VERSION='1213.1.0';
const clone=value=>{try{return structuredClone(value)}catch{return JSON.parse(JSON.stringify(value))}};
const targetFor=type=>({buyer:'sold',delivery_required:'transfer_required',transfer_confirmed:'transferred',payout_info:'paid'}[String(type||'').toLowerCase()]||null);
const finite=v=>Number.isFinite(Number(v));
function fail(code,detail){const error=new Error(code);error.code=code;error.detail=detail;throw error}
function eventQty(event,type){if(!['buyer','transfer_confirmed'].includes(type))return 0;const qty=Number(event?.qty??1);if(!Number.isInteger(qty)||qty<=0)fail('TICKET_EVENT_QTY_INVALID',{qty:event?.qty,type});return qty}
export function prepareTicketTransaction1213(current,event,{now=Date.now()}={}){
 const original=current&&typeof current==='object'?current:{},base=clone(original),type=String(event?.type||'').toLowerCase(),nominalTarget=targetFor(type),stream=Array.isArray(base.events)?base.events:[];
 const appended=appendTicketEvent1195(stream,event);
 if(appended.replay)return{version:TICKET_TRANSACTION_VERSION,replay:true,committed:false,original,next:original,eventId:event?.eventId||event?.messageId||event?.id||null};
 if(!nominalTarget)fail('TICKET_EVENT_TYPE_UNSUPPORTED',{type});
 const qty=eventQty(event,type),baseSold=Number(base.sold||0),baseTransferred=Number(base.transferred||0);
 const counts={
  purchased:event?.purchased??base.purchased??base.qty??0,
  listed:event?.listed??base.listed??0,
  sold:event?.sold??(type==='buyer'?baseSold+qty:baseSold),
  transferred:event?.transferred??(type==='transfer_confirmed'?baseTransferred+qty:baseTransferred)
 };
 const quantity=reconcileQuantity1190(counts);if(!quantity.ok)fail('TICKET_QUANTITY_INVARIANT',{quantity});
 let target=nominalTarget;
 if(type==='transfer_confirmed'&&quantity.transferred<quantity.sold)target='transfer_required';
 const from=String(base.state||'available').toLowerCase();
 const progressiveSameState=(type==='buyer'&&from==='sold'&&target==='sold')||(type==='delivery_required'&&from==='transfer_required'&&target==='transfer_required')||(type==='transfer_confirmed'&&from==='transfer_required'&&target==='transfer_required')||(type==='transfer_confirmed'&&from==='transferred'&&target==='transferred');
 assertTicketTransition1191(from,target,{sameState:progressiveSameState});
 if(type==='delivery_required'&&event?.eventStart){const deadline=transferDeadline1193({eventStart:event.eventStart,cutoffHours:event?.cutoffHours??2,now});if(!deadline.valid)fail('TICKET_TRANSFER_DEADLINE_INVALID',{deadline})}
 let payout=null;if(type==='payout_info'){payout=payoutReconciliation1192({grossCzk:event?.gross_czk??event?.grossCzk??base.grossCzk,feeCzk:event?.fee_czk??event?.feeCzk??base.feeCzk,payoutCzk:event?.payout_czk??event?.payoutCzk??base.payoutCzk});if(!payout.ok)fail('TICKET_PAYOUT_RECONCILIATION_FAILED',{payout})}
 const reduced=reduceTicketEvents1195(appended.stream,{...base,state:from}),viagogo=viagogoState1194(base.viagogoState,type);
 const next={...base,...reduced,state:target,events:appended.stream,purchased:quantity.purchased,listed:quantity.listed,sold:quantity.sold,transferred:quantity.transferred,available:quantity.available,viagogoState:viagogo.state,updatedAt:new Date(now).toISOString()};
 if(payout?.ok){next.grossCzk=payout.grossCzk;next.feeCzk=payout.feeCzk;next.payoutCzk=payout.payoutCzk;next.expectedPayoutCzk=payout.expectedPayoutCzk}
 return{version:TICKET_TRANSACTION_VERSION,replay:false,committed:false,original,next,eventId:appended.stream.at(-1)?.eventId||null,quantity,payout,viagogo};
}
export async function commitTicketTransaction1213({current,event,persist,checkpoint=null,checkpointKey=null,now=Date.now()}={}){
 if(typeof persist!=='function')fail('TICKET_PERSIST_REQUIRED');const tx=prepareTicketTransaction1213(current,event,{now});if(tx.replay)return{...tx,committed:true,checkpointCommit:null};
 let persisted=false;const checkpointCommit=await commitCheckpoint1199({key:checkpointKey||`ticket:${tx.eventId||'event'}`,checkpoint,persist:async()=>{await persist(clone(tx.next));persisted=true}});
 if(!persisted)fail('TICKET_PERSIST_NOT_CONFIRMED');return{...tx,committed:true,checkpointCommit};
}
