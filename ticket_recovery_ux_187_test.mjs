import assert from 'node:assert/strict';
import {recoverySyncState187,recoverySyncLabel187,TICKET_RECOVERY_UX_VERSION_187} from './js/ticketRecoveryUx187.js';

assert.equal(TICKET_RECOVERY_UX_VERSION_187,187);
const synced=recoverySyncState187({ok:true,count:7,localCount:4,cloudCount:6,syncedAt:'2026-08-27T13:00:00.000Z'});
assert.equal(synced.status,'synced');
assert.equal(synced.count,7);
assert.equal(synced.localCount,4);
assert.equal(synced.cloudCount,6);
assert.match(recoverySyncLabel187(synced),/CLOUD SYNCED/);
assert.match(recoverySyncLabel187(synced),/6 cloud/);
assert.match(recoverySyncLabel187(synced),/4 lokálně/);

const local=recoverySyncState187({ok:false,message:'offline',syncedAt:'2026-08-27T13:00:00.000Z'});
assert.equal(local.status,'local');
assert.match(recoverySyncLabel187(local),/LOCAL FALLBACK/);
assert.match(recoverySyncLabel187(null),/čekám na synchronizaci/);

console.log('OS 187 TICKET RECOVERY UX PASS');
