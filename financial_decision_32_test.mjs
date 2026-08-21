import {strict as assert} from 'node:assert';
import {cashflowBaseline32,tradeOutcomeSummary32,moneyRouter32,xtbAccountSummary32,financialDecision32Contract} from './js/financialDecision32.js';

const history=[
 {month:'2026-01',income:70000,expenses:50000,surplus:20000,closed:true,source:'BANK'},
 {month:'2026-02',income:80000,expenses:60000,surplus:20000,closed:true,source:'BANK'},
 {month:'2026-03',income:75000,expenses:55000,surplus:20000,closed:true,source:'BANK'}
];
const base={
 financePlan:{cashNow:40000,reserveFloor:100000,plannedInvestment:25000},
 wealthProfile:{cashflow:{baselineIncome:1,baselineExpenses:1,baselineSurplus:0,history},reserve:{floor:100000,target:220000}},
 xtbHub:{asOf:'2026-08-20T10:00:00Z',accounts:{czk:{currency:'CZK',value:100000,profit:1000,positions:[{ticker:'AAA',value:100000}]},eur:{currency:'EUR',value:1000,profit:-10,positions:[{ticker:'BBB',value:1000}]}}},
 tradeJournal:{trades:[
  {ticker:'WIN',purchaseValue:10000,saleValue:12000,realized:2000,closeDate:'2026-07-02',kind:'INVESTMENT'},
  {ticker:'LOSS',purchaseValue:10000,saleValue:9000,realized:-1000,closeDate:'2026-07-01',kind:'INVESTMENT'},
  {ticker:'MOVE',purchaseValue:10000,saleValue:10000,realized:0,closeDate:'2026-07-03',kind:'TRANSFER'}
 ]}
};
const c=cashflowBaseline32(base);assert.equal(c.months,3);assert.equal(c.averageIncome,75000);assert.equal(c.averageExpenses,55000);assert.equal(c.averageSurplus,20000);assert.equal(c.source,'CASHFLOW_HISTORY');
const r=moneyRouter32(base);assert.equal(r.code,'CASH_FLOOR');assert.equal(r.reserveBudget,25000);assert.equal(r.xtbBudget,0);assert.equal(r.hardGap,60000);assert.equal(r.autoTrade,false);
const mid=moneyRouter32({...base,financePlan:{cashNow:205000,reserveFloor:100000,plannedInvestment:25000}});assert.equal(mid.code,'BUILD_RESERVE');assert.equal(mid.reserveBudget,15000);assert.equal(mid.xtbBudget,10000);
const open=moneyRouter32({...base,financePlan:{cashNow:250000,reserveFloor:100000,plannedInvestment:25000}});assert.equal(open.code,'XTB_ALLOWED');assert.equal(open.reserveBudget,0);assert.equal(open.xtbBudget,25000);
const t=tradeOutcomeSummary32(base);assert.equal(t.trades,2);assert.equal(t.wins,1);assert.equal(t.losses,1);assert.equal(t.realizedTotal,1000);assert.equal(t.weightedRoiPct,5);assert.equal(t.hitRate,50);assert.equal(t.best.ticker,'WIN');assert.equal(t.worst.ticker,'LOSS');
const x=xtbAccountSummary32(base);assert.equal(x.positionCount,2);assert.equal(x.accounts.length,2);
assert.equal(financialDecision32Contract.autoTrade,false);assert.equal(financialDecision32Contract.neverMovesMoney,true);assert.equal(financialDecision32Contract.hardFloorBeforeXtb,true);
console.log('KAMIL OS 32.7 FINANCIAL DECISION UNIT PASS');
