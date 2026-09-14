import fs from 'node:fs';
import assert from 'node:assert/strict';
import {bettingDecision1179,assertFreshForBet1174,validateOdds1176,validateProbability1177,computeEv1178} from './lib/betting-integrity1173.js';

const src=fs.readFileSync(new URL('./api/market-history.js',import.meta.url),'utf8');
assert.match(src,/betting-integrity1173\.js/,'market-history must import betting integrity');
assert.match(src,/bettingDecision1179/,'BET verdict must use auditable decision proof');
assert.match(src,/assertFreshForBet1174/,'BET verdict must reject stale odds');
assert.match(src,/validateOdds1176/,'BET verdict must validate odds');
assert.match(src,/validateProbability1177/,'BET verdict must validate probability');
assert.match(src,/fetchedAt=loaded\.fetchedAt/,'provider timestamp must survive cache reads');
assert.match(src,/STALE_ODDS/,'stale odds need an explicit non-BET state');
assert.match(src,/INVALID_ODDS/,'invalid odds need an explicit non-BET state');
assert.match(src,/INVALID_PROBABILITY/,'invalid probability needs an explicit non-BET state');

assert.throws(()=>validateOdds1176(1),/INVALID_ODDS/);
assert.throws(()=>validateOdds1176(Infinity),/INVALID_ODDS/);
assert.throws(()=>validateProbability1177(1.01),/INVALID_PROBABILITY/);
const calc=computeEv1178(.55,2.1);
assert.ok(Math.abs(calc.ev-.155)<1e-12,'EV invariant changed');
const proof=bettingDecision1179({eventId:'e',marketId:'m',selectionId:'s',odds:2.1,probability:.55,provider:'test',fetchedAt:new Date().toISOString(),modelVersion:'guard'});
assert.ok(proof.decisionId.startsWith('bd:'),'decision proof must be addressable');
assert.equal(assertFreshForBet1174(proof,{maxAgeMs:300000}).allowed,true);
assert.throws(()=>assertFreshForBet1174({...proof,fetchedAt:new Date(Date.now()-301000).toISOString()},{maxAgeMs:300000}),/STALE_BETTING_DATA/);
console.log('OS1173-1179 betting decision guard PASS: source age, odds, probability, EV and proof are enforced');
