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
assert.match(runtime,/heavyViews=new Set\(\['money','tickets','betting'\]\)/,'heavy views must be explicitly classified');
assert.match(runtime,/heavyViews\.has\(key\).*#view-\$\{key\}\.on/s,'inactive heavy views must not be speculatively prefetched');

assert.match(betting,/renderBettingPage144\(\)/,'Betting core renderer must run immediately');
assert.doesNotMatch(betting,/Betting centrum nedokončilo načtení včas/,'Betting view must not fail because enrichment timed out');
assert.match(betting,/const isActive=.*#view-betting\.on/,'Betting enrichment must be view-aware');
assert.match(betting,/scheduleHub\(/,'Betting Hub must be deferred after the core render');
assert.match(betting,/if\(isActive\(\)\)void mountBettingHub630\(\)/,'Betting Hub must not mount while the view is inactive');

assert.match(money,/renderPersonalMoney640\(\)/,'Money core renderer must stay on the critical path');
assert.match(money,/requestIdleCallback/,'Money optional modules must be deferred');
assert.match(money,/safeImport/,'Money optional module failures must be isolated');
assert.match(money,/const moneyActive=.*#view-money\.on/,'Money enrichment must be view-aware');
assert.match(money,/if\(!moneyActive\(\)\)return false/,'Money background work must stop when the view is inactive');

assert.match(tickets,/OS500 is the only critical path/,'Ticket desk must document its single critical renderer');
assert.match(tickets,/scheduleOptionalOverlays\(\)/,'Ticket overlays must be scheduled after the core desk');
assert.match(tickets,/optional overlays failed/,'Ticket overlay failures must be isolated from the core desk');

console.log('Kamil OS core-first stability guard PASS');
