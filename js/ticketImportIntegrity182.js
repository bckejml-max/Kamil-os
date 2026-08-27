export const CLOSED_TICKET_STATUSES_182=new Set(['SOLD_UNDELIVERED','SOLD_WAITING_PAYMENT','PAYOUT_RECEIVED','PAID']);
export const ACTIVE_TICKET_STATUSES_182=new Set(['LISTED','NOT_LISTED']);

const statusOf=x=>String(x?.marketStatus||x?.market_status||'').toUpperCase();
const has=(x,key)=>Object.prototype.hasOwnProperty.call(x||{},key);
const first=(x,...keys)=>{for(const key of keys)if(has(x,key))return x[key];return undefined};

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

export function prepareTicketReplace182(rows=[],current=[]){
 const old=new Map((Array.isArray(current)?current:[]).map(x=>[x.id,x]));
 const incoming=Array.isArray(rows)?rows:[];
 const merged=incoming.map(row=>{
  const prev=old.get(row.id)||{};
  const previousStatus=statusOf(prev),incomingStatus=statusOf(row)||'NOT_LISTED';
  const lockedStatus=CLOSED_TICKET_STATUSES_182.has(previousStatus)?previousStatus:incomingStatus;
  return {
   ...row,
   marketStatus:lockedStatus,
   viagogoUrl:row.viagogoUrl||row.viagogo_url||prev.viagogo_url||null,
   stubhubUrl:row.stubhubUrl||row.stubhub_url||prev.stubhub_url||null,
   officialUrl:row.officialUrl||row.official_url||prev.official_url||null,
   askEachCzk:Number(row.askEachCzk??row.ask_each_czk??prev.ask_each_czk??0)||null,
   ...settlementFields(row,prev)
  };
 });
 const keep=new Set(merged.map(x=>x.id));
 const preservedClosed=(Array.isArray(current)?current:[]).filter(x=>CLOSED_TICKET_STATUSES_182.has(statusOf(x))&&!keep.has(x.id));
 const staleActiveIds=(Array.isArray(current)?current:[]).filter(x=>ACTIVE_TICKET_STATUSES_182.has(statusOf(x))&&!keep.has(x.id)).map(x=>x.id);
 return {merged,preservedClosed,staleActiveIds};
}

export const ticketImportIntegrity182Info={
 closedRowsSurviveReplace:true,
 closedWorkflowCannotRegressFromImport:true,
 settlementFieldsPreferCloud:true,
 onlyMissingActiveRowsAreDeleted:true
};
