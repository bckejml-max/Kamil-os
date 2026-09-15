import {appendTicketEvent1195,assertTicketTransition1191,commitCheckpoint1199,payoutReconciliation1192,reconcileQuantity1190,reduceTicketEvents1195,transferDeadline1193,viagogoState1194} from './ticket-integrity1188.js';

export const TICKET_TRANSACTION_VERSION='1213.0.0';
const clone=value=>{try{return structuredClone(value)}catch{return JSON.parse(JSON.stringify(value))}};
const targetFor=type=>({buyer:'sold',delivery_required:'transfer_required',transfer_confirmed:'transferred',payout_info:'paid'}[String(type||'').toLowerCase()]||null);
function fail(code,detail){const error=new Error(code);error.code=code;error.detail=detail;throw error}
export function prepareTicketTransaction1213(current,event,{now=Date.now()}={}){
 const original=current&&typeof current==='object'?current:{},base=clone(original),type=String(event?.type||'').toLowerCase(),target=targetFor(type),stream=Array.isArray(base.events)?base.events:[];
 const appended=appendTicketEvent1195(stream,event);
 if(appended.replay)return{version:TICKET_TRANSACTION_VERSION,replay:true,committed:false,original,next:original,eventId:event?.eventId||event?.messageId||event?.id||null};
 if(!target)fail('TICKET_EVENT_TYPE_UNSUPPORTED',{type});
 const from=String(base.state||'available').toLowerCase();assertTicketTransition1191(from,target);
 const counts={purchased:event?.purchased??base.purchased??base.qty??0,listed:event?.listed??base.listed??0,sold:event?.sold??base.sold??(type==='buyer'?Math.max(Number(base.sold||0),Number(event?.qty||1)):base.sold??0),transferred:event?.transferred??base.transferred??(type==='transfer_confirmed'?Math.max(Number(base.transferred||0),Number(event?.qty||base.sold||1)):base.transferred??0)};
 const quantity=reconcileQuantity1190(counts);if(!quantity.ok)fail('TICKET_QUANTITY_INVARIANT',{quantity});
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
