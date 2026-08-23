import {cloudClient,session} from './cloud.js';
import {store} from './state.js';

export const ACTIVE_TICKET_STATUSES=new Set(['LISTED','NOT_LISTED']);
const legacyWorkflow=status=>status==='LISTED'?'LISTED':status==='NOT_LISTED'?'HOLD':status==='SOLD_UNDELIVERED'?'SOLD':status==='SOLD_WAITING_PAYMENT'?'PAYOUT WAIT':'PAYOUT RECEIVED';
const transferStatus=status=>status==='SOLD_UNDELIVERED'?'PENDING':status==='SOLD_WAITING_PAYMENT'?'DELIVERED':null;

async function ctx(){const c=await cloudClient();const sess=await session();return{c,sess}}
export async function loadTicketCloud660(){
 const {c,sess}=await ctx();if(!c||!sess)return{ok:false,reason:'NO_SESSION',inventory:[],snapshots:[],alerts:[]};
 const [inv,snaps,alerts]=await Promise.all([
  c.from('ticket_inventory').select('*').order('event_date',{ascending:true}).order('source_row',{ascending:true}),
  c.from('ticket_market_snapshots').select('*').order('checked_at',{ascending:false}).limit(400),
  c.from('ticket_market_alerts').select('*').is('seen_at',null).order('created_at',{ascending:false}).limit(40)
 ]);
 if(inv.error||snaps.error||alerts.error)return{ok:false,error:inv.error||snaps.error||alerts.error,inventory:inv.data||[],snapshots:snaps.data||[],alerts:alerts.data||[]};
 const latest=new Map(),history=new Map();for(const x of snaps.data||[]){if(!latest.has(x.ticket_id))latest.set(x.ticket_id,x);const a=history.get(x.ticket_id)||[];if(a.length<12)a.push(x);history.set(x.ticket_id,a)}
 return{ok:true,inventory:inv.data||[],snapshots:snaps.data||[],latest,history,alerts:alerts.data||[],session:sess};
}
export async function upsertTicketInventory660(rows,{syncLocal=true}={}){
 const {c,sess}=await ctx();if(!c||!sess)return{ok:false,reason:'NO_SESSION'};
 const payload=rows.map(x=>({user_id:sess.user.id,id:x.id,source_row:x.sourceRow??x.source_row??null,event_name:x.eventName||x.event_name||x.name||'Vstupenka',qty:Number(x.qty||1),event_date:x.eventDate||x.event_date||null,section:x.section||null,buy_each_czk:Number(x.buyEachCzk??x.buy_each_czk??0)||0,buy_total_czk:Number(x.buyTotalCzk??x.buy_total_czk??0)||0,sell_each_czk:Number(x.sellEachCzk??x.sell_each_czk??0)||0,sell_total_czk:Number(x.sellTotalCzk??x.sell_total_czk??0)||0,market_status:x.marketStatus||x.market_status||'NOT_LISTED',viagogo_url:x.viagogoUrl||x.viagogo_url||null,ask_each_czk:Number(x.askEachCzk??x.ask_each_czk??0)||null,source_name:x.sourceName||'Excel import',source_sheet:x.sourceSheet||'Flipování 2026',imported_at:new Date().toISOString(),updated_at:new Date().toISOString()}));
 const {error}=await c.from('ticket_inventory').upsert(payload,{onConflict:'user_id,id'});if(error)return{ok:false,error};
 if(syncLocal)store.mutate('Synchronizována evidence vstupenek z Excelu',s=>{const tb=s.ticketBook||(s.ticketBook={items:[],history:[],watchlist:[],review:[]}),old=new Map((tb.items||[]).map(x=>[x.id,x]));tb.items=rows.map(x=>{const prev=old.get(x.id)||{};const status=x.marketStatus||x.market_status;return{...prev,id:x.id,name:x.eventName||x.event_name,eventName:x.eventName||x.event_name,date:x.eventDate||x.event_date,section:x.section||'',qty:Number(x.qty||1),buy:Number(x.buyTotalCzk??x.buy_total_czk??0),sell:Number(x.sellTotalCzk??x.sell_total_czk??0),workflow:legacyWorkflow(status),marketStatus:status,transferStatus:transferStatus(status),viagogoUrl:x.viagogoUrl||x.viagogo_url||prev.viagogoUrl||null,listPrice:Number(x.askEachCzk??x.ask_each_czk??prev.listPrice??0)||null,sourceRow:x.sourceRow??x.source_row??null}})},{undo:true,cloud:true,audit:true});
 return{ok:true,count:payload.length};
}
export async function updateTicketTracking660(id,patch){
 const {c,sess}=await ctx();if(!c||!sess)return{ok:false,reason:'NO_SESSION'};const safe={updated_at:new Date().toISOString()};if('viagogoUrl'in patch)safe.viagogo_url=patch.viagogoUrl||null;if('askEachCzk'in patch)safe.ask_each_czk=Number(patch.askEachCzk||0)||null;const {error}=await c.from('ticket_inventory').update(safe).eq('user_id',sess.user.id).eq('id',id);return error?{ok:false,error}:{ok:true};
}
export async function markTicketAlertsSeen660(ids=[]){const {c,sess}=await ctx();if(!c||!sess||!ids.length)return{ok:false};const {error}=await c.from('ticket_market_alerts').update({seen_at:new Date().toISOString()}).eq('user_id',sess.user.id).in('id',ids);return{ok:!error,error}}
export async function scanTicketsNow660(inventory=[]){const items=inventory.filter(x=>ACTIVE_TICKET_STATUSES.has(x.market_status||x.marketStatus)).map(x=>({id:x.id,label:x.event_name||x.eventName,event:x.event_name||x.eventName,date:x.event_date||x.eventDate,section:x.section,qty:x.qty,buyEachCzk:Number(x.buy_each_czk??x.buyEachCzk??0),status:x.market_status||x.marketStatus,viagogoUrl:x.viagogo_url||x.viagogoUrl||null,askEachCzk:Number(x.ask_each_czk??x.askEachCzk??0)||null}));const r=await fetch('/api/ticket-market-watch',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({items})});const j=await r.json();if(!r.ok||!j.ok)throw new Error(j.error||`Market Watch HTTP ${r.status}`);return j}
