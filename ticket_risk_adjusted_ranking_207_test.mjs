import assert from 'node:assert/strict';
import {TICKET_RISK_ADJUSTED_RANKING_VERSION_207,ticketRiskAdjustedProfit207,rankTicketScenario207} from './js/ticketRiskAdjustedRankingModel207.js';

assert.equal(TICKET_RISK_ADJUSTED_RANKING_VERSION_207,207);
const strong={id:'strong',name:'Strong trade',days:20,confidenceScore:90,learnedNet:{status:'LEARNED NET',netProfit:3000,netRevenue:8000,netRoiPct:70},profitConfidence:{ok:true,score:90},riskBudget:{guard:{binding:{cap:5000,remaining:4500}}}};
const flashy={id:'flashy',name:'Flashy trade',days:1,confidenceScore:35,learnedNet:{status:'LEARNED NET',netProfit:5000,netRevenue:9000,netRoiPct:95},profitConfidence:{ok:true,score:42},riskBudget:{guard:{binding:{cap:5000,remaining:1000}}}};
const unknown={id:'unknown',name:'Unknown',learnedNet:{status:'GROSS ONLY',netProfit:null},profitConfidence:{ok:false,score:null}};
const a=ticketRiskAdjustedProfit207(strong),b=ticketRiskAdjustedProfit207(flashy),c=ticketRiskAdjustedProfit207(unknown);
assert.equal(a.ok,true);assert.equal(b.ok,true);assert.equal(c.ok,false);
assert.ok(a.riskAdjustedProfit>b.riskAdjustedProfit,'risk adjustment should allow stronger evidence/safety to beat larger theoretical net');
assert.ok(a.exposureSafety>b.exposureSafety);
const scenario=rankTicketScenario207({mode:'BALANCED',rows:[flashy,unknown,strong]});
assert.equal(scenario.riskAdjustedRanking.ranked.length,2);
assert.equal(scenario.riskAdjustedRanking.ranked[0].id,'strong');
assert.equal(scenario.riskAdjustedRanking.ranked[0].riskAdjusted.rank,1);
assert.equal(scenario.rows.find(r=>r.id==='unknown').riskAdjusted.ok,false);
console.log('ticket risk adjusted ranking 207 ok');
