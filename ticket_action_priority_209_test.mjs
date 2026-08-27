import assert from 'node:assert/strict';
import {TICKET_ACTION_PRIORITY_VERSION_209,ticketActionPriorityScore209,prioritizeTicketCommander209} from './js/ticketActionPriorityModel209.js';

assert.equal(TICKET_ACTION_PRIORITY_VERSION_209,209);
const blocker={id:'blocked',name:'Blocked resale',nextMove:{type:'DO NOT LIST',label:'DO NOT LIST'},riskAdjusted:{rank:5,riskAdjustedProfit:100,rankScore:30}};
const price={id:'price',name:'Big profit',nextMove:{type:'DROP TO',label:'DROP TO 2000 Kč'},riskAdjusted:{rank:1,riskAdjustedProfit:50000,rankScore:99}};
const verify={id:'verify',name:'Verify',nextMove:{type:'VERIFY RULES',label:'VERIFY RULES'},riskAdjusted:{rank:2,riskAdjustedProfit:10000,rankScore:90}};
assert.ok(ticketActionPriorityScore209(blocker)>ticketActionPriorityScore209(price),'safety blocker must always outrank a price action regardless of profit');
const plan=prioritizeTicketCommander209({rows:[price,verify,blocker]});
assert.equal(plan.primary.id,'blocked');
assert.equal(plan.queue[1].id,'price');
assert.equal(plan.summary.blockers,1);
assert.equal(plan.summary.priceActions,1);

const priceLow={id:'low',name:'Low',nextMove:{type:'RAISE TO',label:'RAISE TO 1000 Kč'},riskAdjusted:{rank:3,riskAdjustedProfit:1000,rankScore:60}};
const priceHigh={id:'high',name:'High',nextMove:{type:'RAISE TO',label:'RAISE TO 1500 Kč'},riskAdjusted:{rank:1,riskAdjustedProfit:5000,rankScore:90}};
const sameTier=prioritizeTicketCommander209({rows:[priceLow,priceHigh]});
assert.equal(sameTier.primary.id,'high','within the same action tier stronger risk-adjusted economics should win');
console.log('ticket action priority 209 ok');
