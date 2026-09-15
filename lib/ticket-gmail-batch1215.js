import {prepareTicketTransaction1213} from './ticket-transaction1213.js';

export const TICKET_GMAIL_BATCH_VERSION='1216.0.0';
const n=v=>{if(v===null||v===undefined||v==='')return null;const x=Number(v);return Number.isFinite(x)?x:null};
const clean=v=>String(v??'').trim();
const clone=value=>{try{return structuredClone(value)}catch{return JSON.parse(JSON.stringify(value))}};
const timeOf=m=>Date.parse(m?.ts||m?.at||m?.receivedAt||'')||0;
const EVENT_TYPES=new Set(['buyer','delivery_required','transfer_confirmed','payout_info']);

function reviewReason(message){
 const type=clean(message?.type).toLowerCase();if(!EVENT_TYPES.has(type))return'TYPE_UNSUPPORTED';
 if(!clean(message?.id||message?.messageId))return'MESSAGE_ID_REQUIRED';
 if(['buyer','transfer_confirmed'].includes(type)){const qty=n(message?.qty);if(!Number.isInteger(qty)||qty<=0)return'QTY_REQUIRED'}
 if(type==='payout_info'){const payout=n(message?.payout_czk??message?.payoutCzk),fee=n(message?.fee_czk??message?.feeCzk),gross=n(message?.gross_czk??message?.grossCzk);if(payout===null||payout<0)return'PAYOUT_REQUIRED';if(fee===null&&gross===null)return'PAYOUT_COMPONENTS_REQUIRED'}
 return null;
}

function eventFor(message){
 const type=clean(message?.type).toLowerCase();let fee=n(message?.fee_czk??message?.feeCzk),payout=n(message?.payout_czk??message?.payoutCzk),gross=n(message?.gross_czk??message?.grossCzk);
 if(fee!==null)fee=Math.abs(fee);if(fee===null&&gross!==null&&payout!==null)fee=Math.abs(gross-payout);if(gross===null&&payout!==null&&fee!==null)gross=payout+fee;
 return{
  eventId:clean(message?.id||message?.messageId),messageId:clean(message?.id||message?.messageId),type,
  order_id:clean(message?.order_id||message?.orderId),qty:message?.qty==null?undefined:Number(message.qty),
  at:message?.ts||message?.at||message?.receivedAt||new Date().toISOString(),
  ...(gross===null?{}:{gross_czk:gross}),...(fee===null?{}:{fee_czk:fee}),...(payout===null?{}:{payout_czk:payout})
 };
}

function bootstrap(ticket,firstType){
 const purchased=Math.max(1,Number(ticket?.qty||1)),base={id:ticket?.id,state:'listed',purchased,listed:purchased,sold:0,transferred:0,events:[]};
 if(firstType==='delivery_required')return{...base,state:'sold',sold:purchased};
 if(firstType==='transfer_confirmed')return{...base,state:'transfer_required',sold:purchased};
 if(firstType==='payout_info')return{...base,state:'transferred',sold:purchased,transferred:purchased};
 return base;
}

function patchFor(ticket,payload){
 const qty=Math.max(1,Number(ticket?.qty||payload?.purchased||1)),state=clean(payload?.state).toLowerCase(),patch={sale_source:'viagogo-gmail-os1215'};
 if(state==='sold'||state==='transfer_required')patch.market_status='SOLD_UNDELIVERED';
 else if(state==='transferred')patch.market_status='SOLD_WAITING_PAYMENT';
 else if(state==='paid')patch.market_status='PAYOUT_RECEIVED';
 if(payload?.transferredAt)patch.delivered_at=payload.transferredAt;
 const payout=n(payload?.payoutCzk),fee=n(payload?.feeCzk);
 if(payout!==null){patch.sell_total_czk=Math.round(payout*100)/100;patch.sell_each_czk=Math.round((payout/qty)*100)/100}
 if(fee!==null)patch.marketplace_fee_czk=Math.round(Math.abs(fee)*100)/100;
 return patch;
}

export function planTicketGmailBatch1215({messages=[],inventory=[],states=[],checkpoint=null,now=Date.now()}={}){
 const byOrder=new Map((inventory||[]).filter(x=>clean(x?.marketplace_order_id)).map(x=>[clean(x.marketplace_order_id),x]));
 const stateByTicket=new Map((states||[]).map(x=>[clean(x?.ticket_id||x?.ticketId),clone(x?.payload||x?.state||{})]));
 const grouped=new Map(),unmatched=[],review=[];
 for(const message of messages||[]){const order=clean(message?.order_id||message?.orderId);if(!order||!byOrder.has(order)){unmatched.push(message);continue}const reason=reviewReason(message);if(reason){review.push({...message,reviewReason:reason});continue}const list=grouped.get(order)||[];list.push(message);grouped.set(order,list)}
 const items=[],replays=[];
 for(const [order,rows] of grouped){
  const ticket=byOrder.get(order),ticketId=clean(ticket?.id);if(!ticketId)throw new Error('TICKET_ID_REQUIRED');
  rows.sort((a,b)=>timeOf(a)-timeOf(b)||clean(a?.id||a?.messageId).localeCompare(clean(b?.id||b?.messageId)));
  let current=stateByTicket.get(ticketId);if(!current||!clean(current.state))current=bootstrap(ticket,clean(rows[0]?.type).toLowerCase());
  for(const message of rows){const event=eventFor(message),tx=prepareTicketTransaction1213(current,event,{now});if(tx.replay)replays.push({ticketId,eventId:event.eventId});current=tx.next}
  items.push({ticketId,orderId:order,payload:current,patch:patchFor(ticket,current)});
 }
 return{version:TICKET_GMAIL_BATCH_VERSION,items,unmatched,review,replays,checkpoint};
}
