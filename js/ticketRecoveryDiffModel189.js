export const TICKET_RECOVERY_DIFF_VERSION_189=189;
const CLOSED=new Set(['SOLD_UNDELIVERED','SOLD_WAITING_PAYMENT','PAYOUT_RECEIVED','PAID']);
const status=x=>String(x?.market_status||x?.marketStatus||'').toUpperCase();
const id=x=>String(x?.id||'');
const name=x=>String(x?.event_name||x?.eventName||x?.name||x?.id||'Bez názvu');
const num=x=>Number(x||0)||0;
const comparable=x=>JSON.stringify([name(x),num(x?.qty),x?.event_date||x?.eventDate||'',x?.section||'',num(x?.buy_total_czk??x?.buyTotalCzk),num(x?.sell_total_czk??x?.sellTotalCzk),status(x)]);

export function buildTicketRecoveryDiff189(currentRows=[],snapshotRows=[]){
 const cur=new Map((currentRows||[]).map(x=>[id(x),x])),target=new Map((snapshotRows||[]).map(x=>[id(x),x]));
 const added=[],changed=[],removed=[],protectedRows=[];
 for(const row of snapshotRows||[]){const before=cur.get(id(row));if(!before)added.push({after:row});else if(comparable(before)!==comparable(row))changed.push({before,after:row,statusChanged:status(before)!==status(row)});}
 for(const row of currentRows||[])if(!target.has(id(row))){if(CLOSED.has(status(row)))protectedRows.push(row);else removed.push({before:row});}
 for(const pair of changed)if(CLOSED.has(status(pair.before))&&!CLOSED.has(status(pair.after)))protectedRows.push(pair.before);
 const uniqProtected=[...new Map(protectedRows.map(x=>[id(x),x])).values()];
 return{added,changed,removed,protected:uniqProtected,summary:{added:added.length,changed:changed.length,removed:removed.length,protected:uniqProtected.length,statusChanged:changed.filter(x=>x.statusChanged).length}};
}

export function ticketRecoveryDiffLabel189(row){return `${name(row)} · ${num(row?.qty)} ks · ${status(row)||'—'}`;}
