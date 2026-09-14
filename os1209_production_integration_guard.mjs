import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {settleBet1180,dedupeTransactions1206 as missing} from './lib/betting-integrity1173.js';

const read=path=>fs.readFile(new URL(path,import.meta.url),'utf8');
const [market,ledger,integrity,gmail,recovery,ticket]=await Promise.all([
 read('./api/market-quotes.js'),
 read('./lib/betting-ledger543-store.js'),
 read('./js/dataIntegrity1130.js'),
 read('./api/ticket-gmail-sync.js'),
 read('./lib/os-recovery1202.js'),
 read('./lib/ticket-integrity1188.js')
]);

for(const token of ['providerFetch1165','CircuitBreaker1168','rememberLastGood1170','lastKnownGood1170','dataState:\'degraded\''])assert.ok(market.includes(token),`market live wiring missing ${token}`);
for(const token of ["REQUIRED_REVISION='0034_betting_ledger543.sql'",'REMOTE_BETTING_LEDGER_DISABLED','writable:false'])assert.ok(ledger.includes(token),`betting ledger fail-closed missing ${token}`);
for(const token of ['repairSettled','dedupeTransactions1206','recoveryManifest1207','diagnosticsBundle1208','integrity-auto-repair'])assert.ok(integrity.includes(token),`state integrity live wiring missing ${token}`);
for(const token of ['historyId','checkpoint','uniqueIds','uniqueRows'])assert.ok(gmail.includes(token),`gmail incremental/replay contract missing ${token}`);
for(const token of ['moneyReconciliation1205','dedupeTransactions1206','recoveryManifest1207','diagnosticsBundle1208','disasterDrill1209'])assert.ok(recovery.includes(token),`recovery helper missing ${token}`);
for(const token of ['ticketIdentity1188','dedupeTickets1189','reconcileQuantity1190','assertTicketState1191','reconcilePayout1192','transferDeadline1193','viagogoState1194','gmailEvent1195','gmailReplay1196','gmailConflict1197','requireClassifierConfidence1198','updateWatermark1199'])assert.ok(ticket.includes(token),`ticket integrity helper missing ${token}`);

console.log('OS1209 PASS: critical production wiring for provider, betting, Gmail and recovery is present');
