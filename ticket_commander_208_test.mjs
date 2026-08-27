import assert from 'node:assert/strict';
import {TICKET_COMMANDER_VERSION_208,ticketCommanderNextMove208,buildTicketCommanderFromPlans208} from './js/ticketCommanderModel208.js';

assert.equal(TICKET_COMMANDER_VERSION_208,208);
const price=ticketCommanderNextMove208({}, {action:'RAISE TO',recommendedAsk:1400,reason:'guard'}, {market_price_czk:1500}, {resaleAllowed:true,transferCompatible:true});
assert.equal(price.type,'RAISE TO');assert.equal(price.price,1400);assert.equal(price.label,'RAISE TO 1400 Kč');
const blocked=ticketCommanderNextMove208({}, {action:'HOLD'}, {market_price_czk:1500}, {resaleAllowed:false,transferCompatible:true});
assert.equal(blocked.type,'DO NOT LIST');
const verify=ticketCommanderNextMove208({}, {action:'HOLD'}, {market_price_czk:1500}, {});
assert.equal(verify.type,'VERIFY RULES');
const refresh=ticketCommanderNextMove208({}, {action:'HOLD'}, {}, {resaleAllowed:true,transferCompatible:true});
assert.equal(refresh.type,'REFRESH MARKET');
const payout=ticketCommanderNextMove208({}, {action:'PAYOUT DATA NEEDED'}, {market_price_czk:1500}, {resaleAllowed:true,transferCompatible:true});
assert.equal(payout.type,'CHECK PAYOUT DATA');

const strong={id:'strong',name:'Strong',riskAdjusted:{ok:true,rank:1,riskAdjustedProfit:2400,rankScore:82}};
const weaker={id:'weaker',name:'Weaker',riskAdjusted:{ok:true,rank:2,riskAdjustedProfit:1200,rankScore:75}};
const ranking={balanced:{riskAdjustedRanking:{ranked:[strong,weaker]}}};
const repricing={rows:[{id:'strong',name:'Strong',action:'DROP TO',recommendedAsk:1800,askEach:2100,marketEach:1700,reason:'repricing'},{id:'weaker',name:'Weaker',action:'HOLD',recommendedAsk:1500,askEach:1500,marketEach:1500,reason:'hold'},{id:'no-model',name:'No model',action:'PAYOUT DATA NEEDED',recommendedAsk:null}]};
const input={inventory:[{id:'strong',resaleAllowed:true,transferCompatible:true},{id:'weaker',resaleAllowed:true,transferCompatible:true},{id:'no-model'}],latest:new Map([['strong',{market_price_czk:1700}],['weaker',{market_price_czk:1500}]])};
const plan=buildTicketCommanderFromPlans208(ranking,repricing,input);
assert.equal(plan.rows[0].id,'strong','OS207 rank order must stay authoritative');
assert.equal(plan.rows[0].nextMove.type,'DROP TO');
assert.equal(plan.rows[0].nextMove.price,1800);
assert.equal(plan.rows[1].id,'weaker');
assert.equal(plan.rows.at(-1).nextMove.type,'CHECK PAYOUT DATA','unranked payout blocker must remain visible without fake rank');
assert.equal(plan.rows.at(-1).riskAdjusted.rank,null);
console.log('ticket commander 208 ok');
