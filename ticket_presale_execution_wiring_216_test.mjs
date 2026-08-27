import assert from 'node:assert/strict';
import fs from 'node:fs';

const ui=fs.readFileSync(new URL('./js/ticketPresaleExecution200.js',import.meta.url),'utf8');
assert.match(ui,/buildTicketPayoutLearning192/,'execution UI must load payout learning');
assert.match(ui,/buildTicketPayoutLearning192\(inventory\)/,'execution UI must learn from real inventory');
assert.match(ui,/buildTicketPresaleRadar199\(watchlist,Date\.now\(\),12,\{learning\}\)/,'execution radar must receive payout learning');
assert.match(ui,/netSafeMaxBuyPrice/,'execution UI must expose net-safe ceiling');
assert.doesNotMatch(ui,/buildTicketPresaleRadar199\(watchlist,Date\.now\(\),12\);/,'old fee-unaware radar wiring must not return');
console.log('OS 216 PAYOUT-AWARE EXECUTION WIRING PASS');
