import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateMoneyRow1211,normalizeMoneyRow1211,moneyIntegrityScan1211,assertMoneyReconciliation1211,cashflowSafety1211} from './lib/money-integrity1211.js';

const helper=fs.readFileSync('lib/money-integrity1211.js','utf8');
const runtime=fs.readFileSync('js/moneyIntegrity1211.js','utf8');
const index=fs.readFileSync('index.html','utf8');
for(const token of ['NON_FINITE_AMOUNT','INVALID_DATE','INVALID_CURRENCY','SCHEDULED_AMOUNT_NOT_POSITIVE','MONEY_RECONCILIATION_MISMATCH','dedupeTransactions1206'])assert.ok(helper.includes(token),`OS1211 helper missing ${token}`);
for(const token of ['money-critical-integrity','money-exact-duplicate-repair','kamil-os-money-recovery-1211','money-integrity-dedupe','ownCleanup1100'])assert.ok(runtime.includes(token),`OS1211 runtime missing ${token}`);
assert.ok(index.includes('./js/moneyIntegrity1211.js'),'OS1211 runtime must load before shell');
assert.equal(index.indexOf('./js/moneyIntegrity1211.js')<index.indexOf('./js/instantShell64.js'),true,'OS1211 must load before application shell');

assert.deepEqual(validateMoneyRow1211({amountCzk:'NaN'}).issues,['NON_FINITE_AMOUNT']);
assert.ok(validateMoneyRow1211({amountCzk:100,currency:'CZK',date:'2026-09-15'}).ok);
assert.ok(validateMoneyRow1211({amountCzk:100,currency:'eur',date:'2026-09-15'}).ok,'lower-case ISO currency is valid after canonicalization');
assert.equal(validateMoneyRow1211({amountCzk:100,currency:'EURO'}).issues.includes('INVALID_CURRENCY'),true);
assert.equal(validateMoneyRow1211({amountCzk:100,date:'not-a-date'}).issues.includes('INVALID_DATE'),true);
assert.equal(validateMoneyRow1211({amountCzk:-100,direction:'EXPENSE',dueDate:'2026-09-20'},{scheduled:true}).issues.includes('SCHEDULED_AMOUNT_NOT_POSITIVE'),true);
assert.ok(validateMoneyRow1211({amountCzk:100,direction:'EXPENSE',dueDate:'2026-09-20'},{scheduled:true}).ok);
assert.equal(normalizeMoneyRow1211({id:' x ',currency:'czk',amountCzk:'12.5'}).currency,'CZK');
assert.equal(normalizeMoneyRow1211({id:' x ',currency:'czk',amountCzk:'12.5'}).amountCzk,12.5);

const duplicate={id:'bank-1',amountCzk:100,date:'2026-09-15',currency:'CZK'};
const scan=moneyIntegrityScan1211([duplicate,{...duplicate}]);
assert.equal(scan.duplicateCount,1);
assert.equal(scan.canonical.length,1);
assert.equal(scan.invalidCount,0);
const invalidScan=moneyIntegrityScan1211([{id:'bad',amount:Infinity}]);
assert.equal(invalidScan.invalidCount,1);
assert.equal(invalidScan.canonical.length,1,'corrupt money rows must never be silently deleted');
assert.throws(()=>assertMoneyReconciliation1211({expected:100,actual:99}),/MONEY_RECONCILIATION_MISMATCH/);
assert.equal(assertMoneyReconciliation1211({expected:100,actual:100.005,tolerance:.01}).ok,true);
const safety=cashflowSafety1211({scheduledPayments:[{id:'x',amountCzk:100,direction:'EXPENSE',dueDate:'2026-09-20'}],personalSpending:{transactions:[duplicate]}});
assert.equal(safety.critical,false);
assert.equal(safety.ok,true);

console.log('OS1211 PASS: money values fail closed, exact duplicates are safely repairable, corrupt rows are recovery-only, reconciliation mismatches throw');
