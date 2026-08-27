const CLOSED=new Set(['SOLD_UNDELIVERED','SOLD_WAITING_PAYMENT','PAYOUT_RECEIVED','PAID']);
const ACTIVE=new Set(['LISTED','NOT_LISTED']);
const statusOf=x=>String(x?.marketStatus||x?.market_status||'').toUpperCase();

export function ticketImportPreview183(diff={}){
 const added=Array.isArray(diff.added)?diff.added:[];
 const changed=Array.isArray(diff.changed)?diff.changed:[];
 const removed=Array.isArray(diff.removed)?diff.removed:[];
 const removedActive=removed.filter(x=>ACTIVE.has(statusOf(x)));
 const preservedClosed=removed.filter(x=>CLOSED.has(statusOf(x)));
 return {
  added:added.length,
  changed:changed.length,
  statusChanged:changed.filter(x=>x.statusChanged).length,
  removedActive:removedActive.length,
  preservedClosed:preservedClosed.length,
  protectedSettlement:preservedClosed.filter(x=>statusOf(x)==='PAYOUT_RECEIVED'||statusOf(x)==='PAID').length
 };
}

export function ticketImportResult183(out={},diff={}){
 const preview=ticketImportPreview183(diff);
 return {
  imported:Number(out.count||0),
  added:preview.added,
  changed:preview.changed,
  statusChanged:preview.statusChanged,
  removedActive:Number(out.removed??preview.removedActive),
  preservedClosed:Number(out.preservedClosed??preview.preservedClosed),
  protectedSettlement:preview.protectedSettlement,
  accountingProtected:true
 };
}

export const ticketImportReport183Info={truthfulDeletePreview:true,closedRowsReportedSeparately:true,accountingProtectionVisible:true};
