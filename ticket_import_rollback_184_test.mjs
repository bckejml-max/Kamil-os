import assert from 'node:assert/strict';
import {createTicketImportBackup184,ticketImportBackupSummary184,saveTicketImportBackup184,loadTicketImportBackup184,clearTicketImportBackup184} from './js/ticketImportRollback184.js';

const rows=[
 {id:'a',qty:2,market_status:'LISTED',event_name:'A'},
 {id:'b',qty:1,market_status:'PAYOUT_RECEIVED',event_name:'B',payout_received_czk:5000,marketplace_fee_czk:300}
];
const backup=createTicketImportBackup184(rows,{fileName:'tickets.xlsx',createdAt:'2026-08-27T12:00:00.000Z'});
assert.equal(backup.version,184);
assert.notEqual(backup.rows,rows);
assert.deepEqual(ticketImportBackupSummary184(backup),{rows:2,qty:3,active:1,closed:1,createdAt:'2026-08-27T12:00:00.000Z',fileName:'tickets.xlsx'});

const mem=new Map();
const storage={setItem:(k,v)=>mem.set(k,v),getItem:k=>mem.get(k)||null,removeItem:k=>mem.delete(k)};
const saved=saveTicketImportBackup184(rows,{fileName:'tickets.xlsx',storage,createdAt:'2026-08-27T12:00:00.000Z'});
assert.equal(saved.ok,true);
const loaded=loadTicketImportBackup184({storage});
assert.equal(loaded.ok,true);
assert.equal(loaded.backup.rows[1].payout_received_czk,5000);
assert.equal(clearTicketImportBackup184({storage}),true);
assert.equal(loadTicketImportBackup184({storage}).ok,false);
console.log('OS 184 TICKET IMPORT ROLLBACK PASS');
