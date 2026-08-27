import assert from 'node:assert/strict';
import {ticketPortfolioCapital200,ticketPresaleExecutionPlan200,buildTicketPresaleExecution200,TICKET_PRESALE_EXECUTION_VERSION_200} from './js/ticketPresaleExecutionModel200.js';

assert.equal(TICKET_PRESALE_EXECUTION_VERSION_200,200);
const inventory=[{market_status:'LISTED',buy_total_czk:12000},{market_status:'NOT_LISTED',buy_each_czk:1000,qty:8},{market_status:'PAID',buy_total_czk:99999}];
const cap=ticketPortfolioCapital200(inventory,{});
assert.equal(cap.invested,20000);
assert.equal(cap.total,20000);
assert.equal(cap.source,'INVESTED');
const configured=ticketPortfolioCapital200(inventory,{capitalBudgetCzk:50000});
assert.equal(configured.total,50000);
assert.equal(configured.source,'CONFIGURED');

const buyTarget={action:'BUY TARGET',priority:90,opportunity:{officialPrice:1000,maxBuyPrice:1200,score:80}};
const plan=ticketPresaleExecutionPlan200(buyTarget,20000,{eventCapPct:20,hardQtyCap:8});
assert.equal(plan.verdict,'EXECUTE');
assert.equal(plan.eventBudget,4000);
assert.equal(plan.buyPrice,1000);
assert.equal(plan.maxQty,4);
assert.equal(plan.deployCapital,4000);
assert.ok(plan.deployCapital<=plan.eventBudget);

const noCapital=ticketPresaleExecutionPlan200(buyTarget,0,{eventCapPct:20});
assert.equal(noCapital.verdict,'SET CAPITAL');
assert.equal(noCapital.maxQty,0);
const noBuy=ticketPresaleExecutionPlan200({...buyTarget,action:'PREPARE'},20000,{});
assert.equal(noBuy.verdict,'NO BUY');

const radar={rows:[buyTarget,{action:'PREPARE',priority:70,opportunity:{officialPrice:500,maxBuyPrice:700,score:60}}]};
const built=buildTicketPresaleExecution200(radar,inventory,{},{});
assert.equal(built.version,200);
assert.equal(built.summary.execute,1);
assert.equal(built.actionable.length,1);
console.log('OS 200 TICKET PRESALE EXECUTION PASS');
