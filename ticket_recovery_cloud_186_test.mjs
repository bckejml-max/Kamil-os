import assert from 'node:assert/strict';
import {cloudRowFromRecovery186,recoveryFromCloudRow186,mergeTicketRecoveryHistories186,TICKET_RECOVERY_CLOUD_VERSION_186} from './js/ticketRecoveryCloudModel186.js';

const base={version:185,id:'recovery-a',createdAt:'2026-08-27T10:00:00.000Z',fileName:'tickets.xlsx',kind:'import',note:'before import',stats:{rows:1,qty:2,active:1,closed:0,buyTotalCzk:2000,payoutReceivedCzk:0},delta:{added:1,changed:2,removed:3,statusChanged:1},rows:[{id:'t1',qty:2,buy_total_czk:2000,market_status:'LISTED'}]};
const row=cloudRowFromRecovery186(base,'user-1',{syncedAt:'2026-08-27T10:01:00.000Z'});
assert.equal(row.user_id,'user-1');
assert.equal(row.version,TICKET_RECOVERY_CLOUD_VERSION_186);
assert.equal(row.file_name,'tickets.xlsx');
assert.equal(row.rows[0].id,'t1');
assert.equal(row.stats.qty,2);
assert.equal(row.delta.changed,2);
row.rows[0].qty=99;
assert.equal(base.rows[0].qty,2,'cloud mapping must deep clone rows');

const restored=recoveryFromCloudRow186({...row,rows:[{id:'t1',qty:2}],synced_at:'2026-08-27T10:02:00.000Z'});
assert.equal(restored.id,'recovery-a');
assert.equal(restored.fileName,'tickets.xlsx');
assert.equal(restored.cloudSyncedAt,'2026-08-27T10:02:00.000Z');

const local=[
 {...base,id:'same',createdAt:'2026-08-27T09:00:00.000Z',rows:[{id:'local'}]},
 {...base,id:'local-only',createdAt:'2026-08-27T08:00:00.000Z'}
];
const cloud=[
 {...base,id:'same',createdAt:'2026-08-27T09:00:00.000Z',cloudSyncedAt:'2026-08-27T11:00:00.000Z',rows:[{id:'cloud'}]},
 {...base,id:'cloud-only',createdAt:'2026-08-27T12:00:00.000Z'}
];
const merged=mergeTicketRecoveryHistories186(local,cloud,10);
assert.deepEqual(merged.map(x=>x.id),['cloud-only','same','local-only']);
assert.equal(merged.find(x=>x.id==='same').rows[0].id,'cloud','newer synced copy must win');
merged[0].rows[0].qty=777;
assert.notEqual(cloud[1].rows[0].qty,777,'merged history must be cloned');

const many=Array.from({length:14},(_,i)=>({...base,id:`r${i}`,createdAt:`2026-08-27T${String(i).padStart(2,'0')}:00:00.000Z`}));
assert.equal(mergeTicketRecoveryHistories186(many,[],10).length,10);

console.log('OS 186 TICKET RECOVERY CLOUD PASS');
