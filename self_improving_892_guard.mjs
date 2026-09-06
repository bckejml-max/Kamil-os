import fs from 'node:fs';
const files=['js/selfImproving892.js','js/usage892.js','js/personalMore640.js','js/commandCopilot840.js'];
for(const f of files)if(!fs.existsSync(f))throw new Error(`missing ${f}`);
const s=fs.readFileSync('js/selfImproving892.js','utf8');
const u=fs.readFileSync('js/usage892.js','utf8');
const more=fs.readFileSync('js/personalMore640.js','utf8');
const cmd=fs.readFileSync('js/commandCopilot840.js','utf8');
const contracts=[
 'feedbackAnalytics843','confidenceCalibration844','badDataDetector845','priorityMisfire846','feedbackReasonTrends847','domainTrust848','confidenceExplanation849','decisionReliability850','recordOutcome851','learningWeight852','contextMemory853','followupContext854','sessionGoal855','focusMode856','timeBudget857','energyMode858','moneyFreeMode859','deepWorkMode860','quickWinsMode861','priorityDecay862','urgencyAcceleration863','waitingEscalation864','notificationCooldown865','meaningfulChange866','logDecisionChange867','explainWhatChanged868','scenarioComparison869','regretMinimizer870','opportunityCost871','liquidityCost872','decisionDeadline873','recheckTrigger874','watchlist875','smartWatchFrequency876','propertyRecheck877','ticketRecheck878','bettingRecheck879','moneyRecheck880','workRecheck881','dailyDataRefresh882','weeklyDataHygiene883','archiveIntelligence884','deadDataDetector885','featureUsageAnalytics886','uiSimplification887','personalKpi888','weeklyWinsLosses889','monthlyDecisionScorecard890','strategyDrift891','selfImprovement892','buildSelfImproving892','openSelfImproving892'
];
for(const x of contracts)if(!s.includes(x))throw new Error(`missing OS892 contract ${x}`);
for(const x of ['SELF_IMPROVING892_VERSION','feedbackCannotOverrideSafety','outcomesWeightedMoreThanVotes','noAutonomousExecution'])if(!s.includes(x))throw new Error(`missing safety contract ${x}`);
if(!u.includes('recordUsage892')||!u.includes('usageSummary892')||!u.includes('slice(-MAX)'))throw new Error('bounded usage tracking missing');
if(!more.includes('Self-Improving OS')||!more.includes("import('./selfImproving892.js')")||!more.includes('trackMore892'))throw new Error('More integration missing');
if(!cmd.includes("import('./usage892.js')")||!cmd.includes("import('./selfImproving892.js')"))throw new Error('Copilot usage/context integration missing');
if(/(sendMoney|placeBet|buyTicket|sellTicket|executeTrade)\s*\(/.test(s))throw new Error('autonomous execution detected');
console.log('OS892 Self-Improving guard OK');
