import fs from 'node:fs';
import assert from 'node:assert/strict';

const read=p=>fs.readFileSync(p,'utf8');
const truth=read('js/actionTruthEngine.js'),sources=read('js/dataSourceRegistry.js'),today=read('js/todayPage2000.js'),app=read('js/app.js'),runtime=read('js/viewRuntime41.js'),state=read('js/state.js'),money=read('js/moneyOverview.js'),tickets=read('js/ticketOverview.js'),betting=read('js/bettingOverview.js'),property=read('js/propertyPage1300.js'),work=read('js/workPage1300.js'),docs=read('js/documentsPage141.js'),search=read('js/globalSearch.js'),pkg=JSON.parse(read('package.json')),release=read('js/releaseMeta.js'),sw=read('sw.js');

assert.equal(pkg.version,'744.0.0');
assert.match(release,/744\.0\.0/);
assert.match(sw,/kamil-os-744\.0\.0-core-r148/);

for(const symbol of ['buildActionTruth741','buildUnifiedWaiting741','dedupeActions','financeTruth741','ticketTruth741','bettingTruth741','propertyTruth741','workTruth741','insuranceTruth741','conflicts741','tomorrow741','auditSummary741','ignore741'])assert.match(truth,new RegExp(symbol),'Action Truth missing '+symbol);
assert.match(sources,/MASTER_DATA_REGISTRY/);
for(const id of ['TICKET_MASTER_ID_1336','BETTING_MASTER_ID_1335','INSURANCE_MASTER_ID_1336'])assert.match(sources,new RegExp(id));
assert.match(today,/Proč to vidím\?/);assert.match(today,/Follow-upy/);assert.match(today,/Předání do dalšího dne/);assert.match(today,/Dnes nemusíš řešit/);assert.match(today,/Datová jistota/);assert.match(today,/Uzávěrka, týden a stav dat/);
assert.equal((today.match(/buildActionTruth741\(/g)||[]).length,1,'Today must instantiate Action Truth exactly once');

assert.match(app,/COMMAND_HISTORY_KEY741/);assert.match(app,/COMMAND_FAVORITES_KEY741/);assert.match(app,/ArrowUp/);assert.match(app,/data-command-pin741/);assert.match(app,/data-command-task741/);
assert.match(runtime,/globalSearch\.js/);assert.match(runtime,/typeof type==='object'/);
assert.match(search,/globalSearch741/);assert.match(search,/resolveCommand741/);assert.match(search,/data-command-task741/);

assert.match(state,/TRASH_RETENTION_DAYS741=30/);assert.match(state,/softDelete\(/);assert.match(state,/restoreTrash\(/);assert.match(state,/purgeTrash\(/);assert.match(state,/undoLabel\(/);
assert.match(money,/Reconciliation/);assert.match(money,/Volná hotovost/);assert.match(money,/Úroková příležitost/);
assert.match(tickets,/Lifecycle a profit truth/);assert.match(tickets,/Realizovaný profit/);assert.match(tickets,/Transfer deadline risk/);
assert.match(betting,/Riziková koncentrace a settlement audit/);assert.match(betting,/Settlement chyby/);assert.match(betting,/Historické segmenty/);
assert.match(property,/Lifecycle shortlistu/);assert.match(property,/data-property741-lock/);assert.match(property,/data-property741-clean/);assert.match(property,/store\.softDelete/);
assert.match(work,/Closeout a jistota termínů/);assert.match(work,/Zádržné/);assert.match(work,/deadlineConfirmed/);
assert.match(docs,/Pojištění · radar 90 dní/);assert.match(docs,/Datová integrita/);assert.match(docs,/Koš · 30 dní/);assert.match(docs,/Repo debt dashboard/);

for(const p of ['scripts/architecture-budget.mjs','scripts/repo-debt-report.mjs','repo-health.json','e2e_action_truth.spec.mjs','e2e_visual_regression.spec.mjs','visual-baseline.json','backup_guard_test.mjs'])assert.ok(fs.existsSync(p),'OS744 artifact missing '+p);
assert.match(pkg.scripts['test:structural'],/architecture-budget/);assert.match(pkg.scripts['test:structural'],/repo-debt-report/);assert.match(pkg.scripts['test:e2e'],/e2e_action_truth\.spec\.mjs/);assert.match(pkg.scripts['test:e2e'],/e2e_visual_regression\.spec\.mjs/);assert.match(pkg.scripts['test:structural'],/backup_guard_test\.mjs/);
console.log('OS744 Action Truth + integrity contract PASS');
