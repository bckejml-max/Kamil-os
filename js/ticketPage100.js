// Canonical ticket view adapter.
// Ticket Desk 331 owns the ticket DOM. Scoped modules add pricing, unified
// multi-source refresh, source/row editing, row repair, market health, manual
// fallback, readiness/repair guidance, last-known price memory, clipboard
// market import, sale workflow, history, settlement, reconciliation, alerts,
// capital/performance analytics, UI cleanup, canonical market engine,
// event portfolio/cashflow, Gmail reconciliation, OS430 consolidation,
// OS431 engine health, OS432 auto repair, OS433–436 predictive trading stack,
// OS437 comparable events, OS438 portfolio stress, OS439 Commander 3.1,
// OS440 persistent decision journal, OS441 outcome calibration,
// OS442 guarded feedback, OS443 calibration readiness cockpit,
// OS444 decision quality, OS445 source consensus, OS446 risk ops,
// OS447 portfolio optimizer, OS448 Commander 4.0, OS449 action execution tracking,
// OS450 execution outcomes, OS451 action governance, OS452 market regime,
// OS453 capital planner and OS454 Commander 5.0 / Executive Brief 2.0.

let bootPromise=null;

async function desk(){
  const mod=await import('./ticketDesk331.js');
  if(document.documentElement.dataset.ticketDesk331!=='1')mod.installTicketDesk331();
  const pricing=await import('./ticketPriceIntelligence374.js');pricing.installTicketPriceIntelligence374();
  const refresh=await import('./ticketRefresh395.js');refresh.installTicketRefresh395();
  const source=await import('./ticketSourceEditor382.js');source.installTicketSourceEditor382();
  const rowAuto=await import('./ticketRowAuto396.js');rowAuto.installTicketRowAuto396();
  const health=await import('./ticketMarketHealth397.js');health.installTicketMarketHealth397();
  const manual=await import('./ticketManualMarket398.js');manual.installTicketManualMarket398();
  const readiness=await import('./ticketReadiness400.js');readiness.installTicketReadiness400();
  const memory=await import('./ticketPriceMemory402.js');memory.installTicketPriceMemory402();
  const clipboard=await import('./ticketClipboardMarket403.js');clipboard.installTicketClipboardMarket403();
  const autopilot=await import('./ticketAutopilot407.js');autopilot.installTicketAutopilot407();
  const saleSync=await import('./ticketSaleSync408.js');saleSync.installTicketSaleSync408();
  const soldGuard=await import('./ticketSoldGuard408.js');soldGuard.installTicketSoldGuard408();
  const history=await import('./ticketPriceHistory409.js');history.installTicketPriceHistory409();
  const actions=await import('./ticketActionQueue410.js');actions.installTicketActionQueue410();
  const settlement=await import('./ticketSettlement411.js');settlement.installTicketSettlement411();
  const reconcile=await import('./ticketReconcile412.js');reconcile.installTicketReconcile412();
  const alerts=await import('./ticketAlerts413.js');alerts.installTicketAlerts413();
  const performance=await import('./ticketPerformance414.js');performance.installTicketPerformance414();
  const capital=await import('./ticketCapital415.js');capital.installTicketCapital415();
  const repair=await import('./ticketRepair418.js');repair.installTicketRepair418();
  const brief=await import('./ticketDailyBrief419.js');brief.installTicketDailyBrief419();
  const ui=await import('./ticketUi420.js');ui.installTicketUi420();
  const compact=await import('./ticketUi421.js');compact.installTicketUi421();
  const soldUi=await import('./ticketUi422.js');soldUi.installTicketUi422();
  const polish=await import('./ticketUi423.js');polish.installTicketUi423();
  const detailPolish=await import('./ticketUi424.js');detailPolish.installTicketUi424();
  const responsive=await import('./ticketUi425.js');responsive.installTicketUi425();
  const engine=await import('./ticketMarketEngine426.js');engine.installTicketMarketEngine426();
  const engineUi=await import('./ticketEngineUi427.js');engineUi.installTicketEngineUi427();
  const portfolio=await import('./ticketPortfolio428.js');portfolio.installTicketPortfolio428();
  const gmail=await import('./ticketGmailSync429.js');gmail.installTicketGmailSync429();
  const engineHealth=await import('./ticketEngineHealth431.js');engineHealth.installTicketEngineHealth431();
  const autoRepair=await import('./ticketAutoRepair432.js');autoRepair.installTicketAutoRepair432();
  const predictive=await import('./ticketPredictive433.js');predictive.installTicketPredictive433();
  const backtest=await import('./ticketBacktest434.js');backtest.installTicketBacktest434();
  const commander=await import('./ticketCommander435.js');commander.installTicketCommander435();
  const predictUi=await import('./ticketPredictUi436.js');predictUi.installTicketPredictUi436();
  const comparable=await import('./ticketComparable437.js');comparable.installTicketComparable437();
  const risk=await import('./ticketRisk438.js');risk.installTicketRisk438();
  const portfolioCommander=await import('./ticketCommander439.js');portfolioCommander.installTicketCommander439();
  const journal=await import('./ticketDecisionJournal440.js');journal.installTicketDecisionJournal440();
  const outcome=await import('./ticketOutcomeCalibration441.js');outcome.installTicketOutcomeCalibration441();
  const feedback=await import('./ticketCalibrationFeedback442.js');feedback.installTicketCalibrationFeedback442();
  const calibrationReadiness=await import('./ticketCalibrationReadiness443.js');calibrationReadiness.installTicketCalibrationReadiness443();
  const quality=await import('./ticketDecisionQuality444.js');quality.installTicketDecisionQuality444();
  const consensus=await import('./ticketConsensus445.js');consensus.installTicketConsensus445();
  const riskOps=await import('./ticketRiskOps446.js');riskOps.installTicketRiskOps446();
  const optimizer=await import('./ticketPortfolioOptimizer447.js');optimizer.installTicketPortfolioOptimizer447();
  const commander4=await import('./ticketCommander448.js');commander4.installTicketCommander448();
  const execution=await import('./ticketActionExecution449.js');execution.installTicketActionExecution449();
  const executionOutcome=await import('./ticketExecutionOutcomes450.js');executionOutcome.installTicketExecutionOutcomes450();
  const governance=await import('./ticketActionGovernance451.js');governance.installTicketActionGovernance451();
  const regime=await import('./ticketMarketRegime452.js');regime.installTicketMarketRegime452();
  const capitalPlanner=await import('./ticketCapitalPlanner453.js');capitalPlanner.installTicketCapitalPlanner453();
  const commander5=await import('./ticketCommander454.js');commander5.installTicketCommander454();
  document.documentElement.dataset.ticketCanonical430='1';
  return window.__KAMIL_TICKET_DESK331__;
}

export function renderTicketPage100(){
  if(!bootPromise)bootPromise=desk().catch(error=>{
    bootPromise=null;
    console.error('[tickets454] canonical desk boot failed',error);
    throw error;
  });
  return bootPromise;
}
