import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=p=>readFile(new URL(p,import.meta.url),'utf8');
const files=[
 ['./js/ticketActionGovernance451.js','tickets.governance451'],
 ['./js/ticketBacktest434.js','tickets.backtest434'],
 ['./js/ticketCalibrationFeedback442.js','tickets.calibration442'],
 ['./js/ticketCalibrationReadiness443.js','tickets.readiness443'],
 ['./js/ticketCapitalPlanner453.js','tickets.capital453'],
 ['./js/ticketCommander435.js','tickets.commander435'],
 ['./js/ticketCommander439.js','tickets.commander439'],
 ['./js/ticketCommander448.js','tickets.commander448'],
 ['./js/ticketComparable437.js','tickets.comparable437'],
 ['./js/ticketRisk438.js','tickets.risk438'],
 ['./js/ticketConsensus445.js','tickets.consensus445'],
 ['./js/ticketDecisionQuality444.js','tickets.quality444'],
 ['./js/ticketRiskOps446.js','tickets.riskops446'],
 ['./js/ticketPortfolioOptimizer447.js','tickets.optimizer447'],
 ['./js/ticketMarketRegime452.js','tickets.regime452'],
 ['./js/ticketExecutionOutcomes450.js','tickets.outcomes450'],
 ['./js/ticketPredictive433.js','tickets.predict433'],
 ['./js/ticketOutcomeCalibration441.js','tickets.outcome441'],
 ['./js/ticketActionExecution449.js','tickets.execution449'],
 ['./js/ticketPriceIntelligence374.js','tickets.price374'],
 ['./js/ticketEngineHealth431.js','tickets.engine431'],
 ['./js/ticketPredictUi436.js','tickets.predictui436'],
 ['./js/ticketMarketWatch656.js','tickets.marketwatch656'],
 ['./js/ticketRefresh395.js','tickets.refresh395'],
 ['./js/ticketRefreshFix375.js','tickets.refresh375'],
 ['./js/ticketSourceEditor382.js','tickets.source382'],
 ['./js/ticketDecisionJournal440.js','tickets.journal440']
];
for(const [path,owner] of files){
 const src=await read(path);
 assert.ok(src.includes("./runtimeOwnership1100.js"),`${path} must import OS1100`);
 assert.ok(src.includes(owner),`${path} must use owner ${owner}`);
 assert.equal((src.match(/setInterval\s*\(/g)||[]).length,0,`${path} must not use raw setInterval`);
 assert.equal((src.match(/window\.addEventListener\s*\(/g)||[]).length,0,`${path} must not use raw window listeners`);
 assert.ok(/\bactive\s*=\s*\(\)\s*=>/.test(src),`${path} must gate work to active Tickets`);
 assert.ok(src.includes("schedule1100(OWNER,'cadence'"),`${path} recurring work must use OS1100 cadence`);
}
console.log(`OS1106 Ticket interval guard PASS: ${files.length} analytics modules use OS1100 cadence with no raw intervals/window listeners`);
