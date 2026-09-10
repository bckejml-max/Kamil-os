import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=p=>readFile(new URL(p,import.meta.url),'utf8');

const [runtime,betting,money,tickets]=await Promise.all([
  read('./js/viewRuntime41.js'),
  read('./js/bettingPage527.js'),
  read('./js/moneyPage100.js'),
  read('./js/ticketDesk331.js')
]);

assert.doesNotMatch(runtime,/load\('\.\/decisionFocus2020\.js'\)/,'decision-focus overlays must stay off the canonical runtime');
assert.match(runtime,/renderExtras41\(view='today'\)\{syncChrome142\(view\);return null\}/,'render extras must remain non-blocking');

assert.match(betting,/renderBettingPage144\(\)/,'Betting core renderer must run immediately');
assert.doesNotMatch(betting,/Betting centrum nedokončilo načtení včas/,'Betting view must not fail because enrichment timed out');
assert.match(betting,/background:true/,'Betting enrichment must be marked as background work');

assert.match(money,/renderPersonalMoney640\(\)/,'Money core renderer must stay on the critical path');
assert.match(money,/requestIdleCallback/,'Money optional modules must be deferred');
assert.match(money,/safeImport/,'Money optional module failures must be isolated');

assert.match(tickets,/OS500 is the only critical path/,'Ticket desk must document its single critical renderer');
assert.match(tickets,/scheduleOptionalOverlays\(\)/,'Ticket overlays must be scheduled after the core desk');
assert.match(tickets,/optional overlays failed/,'Ticket overlay failures must be isolated from the core desk');

console.log('Kamil OS core-first stability guard PASS');
