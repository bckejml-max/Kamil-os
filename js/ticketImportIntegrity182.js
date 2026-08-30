export const CLOSED_TICKET_STATUSES_182=new Set(['SOLD_UNDELIVERED','SOLD_WAITING_PAYMENT','PAYOUT_RECEIVED','PAID']);
export const ACTIVE_TICKET_STATUSES_182=new Set(['LISTED','NOT_LISTED']);

const statusOf=x=>String(x?.marketStatus||x?.market_status||'').toUpperCase();
const has=(x,key)=>Object.prototype.hasOwnProperty.call(x||{},key);
const first=(x,...keys)=>{for(const key of keys)if(has(x,key))return x[key];return undefined};
const n=x=>Number(x||0);

function settlementFields(row,previous){
 const payout=first(previous,'payout_received_czk','payoutReceivedCzk')??first(row,'payoutReceivedCzk','payout_received_czk');
 const fee=first(previous,'marketplace_fee_czk','marketplaceFeeCzk')??first(row,'marketplaceFeeCzk','marketplace_fee_czk');
 const recorded=first(previous,'payout_recorded_at','payoutRecordedAt')??first(row,'payoutRecordedAt','payout_recorded_at');
 const out={};
 if(payout!==undefined&&payout!==null)out.payoutReceivedCzk=payout;
 if(fee!==undefined&&fee!==null)out.marketplaceFeeCzk=fee;
 if(recorded!==undefined&&recorded!==null)out.payoutRecordedAt=recorded;
 return out;
}

function soldChildren(current=[]){
 const byParent=new Map();
 for(const x of current){
  const parent=String(x?.parent_inventory_id||'').trim();
  if(!parent||!CLOSED_TICKET_STATUSES_182.has(statusOf(x)))continue;
  const item=byParent.get(parent)||{qty:0,rows:[]};
  item.qty+=Math.max(0,n(x.qty));item.rows.push(x);byParent.set(parent,item);
 }
 return byParent;
}

export function prepareTicketReplace182(rows=[],current=[]){
 const cur=Array.isArray(current)?current:[],old=new Map(cur.map(x=>[x.id,x])),children=soldChildren(cur),incoming=Array.isArray(rows)?rows:[];
 const merged=[];
 for(const row of incoming){
  const prev=old.get(row.id)||{},previousStatus=statusOf(prev),incomingStatus=statusOf(row)||'NOT_LISTED';
  const child=children.get(String(row.id)),incomingQty=Math.max(0,n(row.qty)||0),remainingQty=child?Math.max(0,incomingQty-child.qty):incomingQty;
  if(child&&remainingQty<=0)continue;
  const lockedStatus=CLOSED_TICKET_STATUSES_182.has(previousStatus)?previousStatus:incomingStatus;
  const buyEach=n(row.buyEachCzk??row.buy_each_czk??prev.buy_each_czk),buyTotal=child?buyEach*remainingQty:n(row.buyTotalCzk??row.buy_total_czk??prev.buy_total_czk);
  merged.push({
   ...row,
   qty:remainingQty||row.qty,
   buyEachCzk:buyEach||row.buyEachCzk,
   buyTotalCzk:buyTotal||row.buyTotalCzk,
   marketStatus:lockedStatus,
   viagogoUrl:row.viagogoUrl||row.viagogo_url||prev.viagogo_url||null,
   stubhubUrl:row.stubhubUrl||row.stubhub_url||prev.stubhub_url||null,
   officialUrl:row.officialUrl||row.official_url||prev.official_url||null,
   askEachCzk:Number(row.askEachCzk??row.ask_each_czk??prev.ask_each_czk??0)||null,
   ...settlementFields(row,prev)
  });
 }
 const keep=new Set(merged.map(x=>x.id));
 const preservedClosed=cur.filter(x=>CLOSED_TICKET_STATUSES_182.has(statusOf(x))&&!keep.has(x.id));
 const staleActiveIds=cur.filter(x=>ACTIVE_TICKET_STATUSES_182.has(statusOf(x))&&!keep.has(x.id)&&!children.has(String(x.id))).map(x=>x.id);
 return {merged,preservedClosed,staleActiveIds,partialSales:[...children.entries()].map(([parent,v])=>({parent,soldQty:v.qty,orders:v.rows.length}))};
}

export const ticketImportIntegrity182Info={
 closedRowsSurviveReplace:true,
 closedWorkflowCannotRegressFromImport:true,
 settlementFieldsPreferCloud:true,
 partialSalesSurviveReplace:true,
 activeQuantitySubtractsSoldChildren:true,
 onlyMissingActiveRowsAreDeleted:true
};
