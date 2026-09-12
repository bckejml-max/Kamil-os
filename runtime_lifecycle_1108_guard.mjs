import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=p=>readFile(new URL(p,import.meta.url),'utf8');
const files=[
 ['./js/platform43.js','core.platform43'],
 ['./js/platform43Ui.js','platform.ui43'],
 ['./js/bettingControl586.js','betting.control586'],
 ['./js/bettingMissed566.js','betting.missed566'],
 ['./js/unifiedCommand333.js','core.unified333'],
 ['./js/domainOS328.js','core.domain328'],
 ['./js/performance330.js','core.performance330'],
 ['./js/hardening329.js','core.hardening329'],
 ['./js/audit525.js','core.audit527'],
 ['./js/marketEdgeUi32.js','market.edge32'],
 ['./js/profitControlUi32.js','profit.control32'],
 ['./js/scenarioSimulatorUi26.js','money.scenario26'],
 ['./js/recoveryShieldUi32.js','recovery.shield32'],
 ['./js/investmentBattle480.js','money.investmentBattle480'],
 ['./js/capitalPlan469.js','money.capitalPlan469'],
 ['./js/cashflow468.js','money.cashflow468'],
 ['./js/propertyDecision472.js','money.propertyDecision472'],
 ['./js/operator717.js','operator717'],
 ['./js/operatorHome299.js','operator.home299'],
 ['./js/todayDashboard213.js','today.dashboard213'],
 ['./js/todayCockpit363.js','today.cockpit363'],
 ['./js/todayActions697.js','today.actions697'],
 ['./js/changePulseUi35.js','today.changePulse35'],
 ['./js/dailyProfitBriefUi32.js','today.profitBrief32'],
 ['./js/actionExecution336.js','today.actionExecution336'],
 ['./js/focusQueue335.js','today.focusQueue335'],
 ['./js/commandCenter467.js','today.commandCenter467'],
 ['./js/managerDeadlines481.js','manager.deadlines481'],
 ['./js/morningDirector483.js','today.morning483'],
 ['./js/kamilBrain300.js','today.brain300'],
 ['./js/kamilBrain301.js','today.brain301'],
 ['./js/kamilBrain302.js','today.brain302'],
 ['./js/kamilBrain303.js','today.brain303'],
 ['./js/emailWorkflowUi35.js','email.workflow35'],
 ['./js/followUpUi35.js','followup.ui35'],
 ['./js/emergencyFileUi26.js','home.emergency26'],
 ['./js/directorUi34.js','director.ui34'],
 ['./js/systemDiagnostics421.js','system.diagnostics421'],
 ['./js/remoteInboxUi31.js','remote.inbox31'],
 ['./js/compactNavigation212.js','navigation.compact212'],
 ['./js/documentScannerUi30.js','documents.scanner30'],
 ['./js/externalInvestmentsUi33.js','money.external33']
];
for(const [path,owner] of files){
 const src=await read(path);
 assert.ok(src.includes("./runtimeOwnership1100.js"),`${path} must import OS1100 runtime ownership`);
 assert.ok(src.includes(owner),`${path} must use owner ${owner}`);
 assert.equal((src.match(/\bsetInterval\s*\(/g)||[]).length,0,`${path} must not use raw setInterval`);
 assert.equal((src.match(/\bnew\s+MutationObserver\s*\(/g)||[]).length,0,`${path} must not create raw MutationObserver`);
 assert.equal((src.match(/\bwindow\.addEventListener\s*\(/g)||[]).length,0,`${path} must not own raw window listeners`);
 assert.equal((src.match(/\bdocument\.addEventListener\s*\(/g)||[]).length,0,`${path} must not own raw document listeners`);
}
console.log(`OS1108 lifecycle guard PASS: ${files.length} core/UI modules stay OS1100-owned`);