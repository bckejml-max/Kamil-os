import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const f='js/todayLite43.js',a=fs.readFileSync(f,'utf8'),decision=fs.readFileSync('js/marketDecision534.js','utf8');
execFileSync(process.execPath,['--check',f],{stdio:'inherit'});execFileSync(process.execPath,['--check','js/marketDecision534.js'],{stdio:'inherit'});
for(const bad of ['setInterval(','requestIdleCallback','store.subscribe(']){assert.ok(!a.includes(bad),`Home 53.4 must not background-run: ${bad}`);assert.ok(!decision.includes(bad),`Decision 53.4 must not background-run: ${bad}`)}
assert.ok(a.includes('MARKET COCKPIT 53.4')&&a.includes('XTB + vstupenky. Nic ostatního teď neřešíme.'),'Market cockpit 53.4 missing');
assert.ok(a.includes('__KAMIL_MARKET_TOP3_533_LAST__')&&a.includes('__KAMIL_PERSONAL_HOME_531_LAST__'),'Home timing markers missing');
assert.ok(a.includes('ticketStats(')&&a.includes('xtbStats(')&&a.includes('smartMarketTop3('),'XTB/ticket smart TOP 3 missing');
assert.ok(a.includes('breakEven')&&a.includes('returnPct')&&a.includes('weight'),'Market risk signals missing');
assert.ok(a.includes('WORK_RE')&&a.includes('.filter(personal)'),'Work exclusion missing');
assert.ok(a.includes("import('./marketDecision534.js')")&&a.includes('data-decision-534'),'Decision 53.4 must stay lazy and explicit');
assert.ok(!a.includes("from './marketDecision534.js'"),'Decision 53.4 must not be a startup static import');
assert.ok(decision.includes("from './xtbPlanner24.js'")&&decision.includes("from './ticketCockpit24.js'"),'Decision 53.4 must reuse existing market engines');
assert.ok(decision.includes('__KAMIL_DECISION_534_LAST__')&&!decision.includes('store.update(')&&!decision.includes('store.patch('),'Decision 53.4 must stay measurable and read-only');
assert.ok(!a.includes('personalCalendar(')&&!a.includes('personalHomeRows(')&&!a.includes('adminRows('),'Non-market priorities must not drive Home');
console.log('PERSONAL MARKET HOME 53.4 STATIC PASS');
