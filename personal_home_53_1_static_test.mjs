import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const legacy=fs.readFileSync('js/todayLite43.js','utf8'),decision=fs.readFileSync('js/marketDecision534.js','utf8'),queue=fs.readFileSync('js/actionQueue559.js','utf8'),today=fs.readFileSync('js/personalToday640.js','utf8');
execFileSync(process.execPath,['--check','js/todayLite43.js'],{stdio:'inherit'});execFileSync(process.execPath,['--check','js/marketDecision534.js'],{stdio:'inherit'});execFileSync(process.execPath,['--check','js/actionQueue559.js'],{stdio:'inherit'});execFileSync(process.execPath,['--check','js/personalToday640.js'],{stdio:'inherit'});
for(const bad of ['setInterval(','requestIdleCallback','store.subscribe(']){assert.ok(!legacy.includes(bad),`Legacy Home must not background-run: ${bad}`);assert.ok(!decision.includes(bad),`Decision 53.4 must not background-run: ${bad}`);assert.ok(!queue.includes(bad),`Action Queue 55.9 must not background-run: ${bad}`)}
assert.ok(legacy.includes('__KAMIL_MARKET_HOME_560_LAST__')&&legacy.includes('__KAMIL_MARKET_HOME_588_LAST__'),'Legacy market Home timing compatibility missing');
assert.ok(legacy.includes('ticketStats(')&&legacy.includes('xtbStats(')&&legacy.includes('smartMarketTop3('),'Legacy XTB/ticket smart TOP 3 compatibility missing');
assert.ok(legacy.includes('WORK_RE')&&legacy.includes('.filter(personal)'),'Legacy Home work exclusion missing');
assert.ok(legacy.includes("import('./marketCommander587.js')")&&!legacy.includes("from './marketCommander587.js'"),'Market Commander must remain lazy, not startup-imported');
assert.ok(legacy.includes("import('./actionQueue559.js')")&&!legacy.includes("from './actionQueue559.js'"),'Action Queue must remain lazy, not startup-imported');
assert.ok(legacy.includes("import('./marketDecision534.js')")&&!legacy.includes("from './marketDecision534.js'"),'Decision diagnostics must remain lazy');
assert.ok(decision.includes("from './xtbPlanner24.js'")&&decision.includes("from './ticketCockpit24.js'"),'Decision 53.4 must reuse existing market engines');
assert.ok(decision.includes('__KAMIL_DECISION_534_LAST__')&&!decision.includes('store.update(')&&!decision.includes('store.patch('),'Decision 53.4 must stay measurable/read-only');
assert.ok(queue.includes("from './finalMarketVerdict558.js'")&&queue.includes('__KAMIL_ACTION_QUEUE_559_LAST__'),'Action Queue compatibility missing');
assert.ok(today.includes('ux65-primary')&&!today.includes('XTB + vstupenky. Co přesně udělat teď?'),'Canonical 65.0 Today must be personal decision-first, not Market Home');
console.log('LEGACY MARKET HOME SAFETY + PERSONAL HOME 65.0 STATIC PASS');
