import assert from 'node:assert/strict';
import {TICKET_RECOVERY_LIMIT_185,createTicketRecoverySnapshot185,ticketRecoverySummary185,saveTicketRecoverySnapshot185,loadTicketRecoveryHistory185,getTicketRecoverySnapshot185,clearTicketRecoveryHistory185} from './js/ticketRecovery185.js';

const rows=[
 {id:'a',qty:2,market_status:'LISTED',buy_total_czk:2000},
 {id:'b',qty:1,market_status:'PAYOUT_RECEIVED',buy_total_czk:1000,payout_received_czk:1800}
];
const snap=createTicketRecoverySnapshot185(rows,{id:'snap-a',createdAt:'2026-08-27T12:00:00.000Z',fileName:'tickets.xlsx',diff:{added:[{}],changed:[{statusChanged:true},{statusChanged:false}],removed:[{}]}});
assert.equal(snap.version,185);
assert.notEqual(snap.rows,rows);
assert.deepEqual(ticketRecoverySummary185(snap),{id:'snap-a',createdAt:'2026-08-27T12:00:00.000Z',fileName:'tickets.xlsx',kind:'import',note:'',rows:2,qty:3,active:1,closed:1,buyTotalCzk:3000,payoutReceivedCzk:1800,delta:{added:1,changed:2,removed:1,statusChanged:1}});

const mem=new Map();
const storage={setItem:(k,v)=>mem.set(k,v),getItem:k=>mem.get(k)||null,removeItem:k=>mem.delete(k)};
for(let i=0;i<TICKET_RECOVERY_LIMIT_185+3;i++){
 const saved=saveTicketRecoverySnapshot185([{id:`x${i}`,qty:1,market_status:'LISTED'}],{id:`snap-${i}`,storage,createdAt:`2026-08-27T12:${String(i).padStart(2,'0')}:00.000Z`,fileName:`f${i}.xlsx`});
 assert.equal(saved.ok,true);
}
const history=loadTicketRecoveryHistory185({storage,migrateLegacy:false});
assert.equal(history.ok,true);
assert.equal(history.snapshots.length,TICKET_RECOVERY_LIMIT_185);
assert.equal(history.snapshots[0].id,'snap-12');
assert.equal(history.snapshots.at(-1).id,'snap-3');
assert.equal(getTicketRecoverySnapshot185('snap-7',{storage}).ok,true);
assert.equal(clearTicketRecoveryHistory185({storage}),true);
assert.equal(loadTicketRecoveryHistory185({storage,migrateLegacy:false}).snapshots.length,0);
console.log('OS 185 TICKET RECOVERY PASS');
