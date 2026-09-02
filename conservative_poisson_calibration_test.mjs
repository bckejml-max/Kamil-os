import assert from 'node:assert/strict';
import {calibratePoissonProbability,calibratePoissonModels} from './lib/conservative-poisson-calibration.js';

const approx=(actual,expected,epsilon=0.00015)=>assert.ok(Math.abs(Number(actual)-Number(expected))<=epsilon,`expected ${actual} to be within ${epsilon} of ${expected}`);

const awayMarket={type:'MATCH_RESULT'};
const norwich=calibratePoissonProbability(0.473,awayMarket,{outcome:'AWAY'});
approx(norwich.probability,0.3765);
assert.equal(norwich.outlier,false);

const plymouth=calibratePoissonProbability(0.6582,awayMarket,{outcome:'AWAY'});
approx(plymouth.probability,0.3746);
assert.equal(plymouth.outlier,true);
assert.equal(plymouth.weight,0.25);

const fulham=calibratePoissonProbability(0.5223,{type:'MATCH_RESULT'},{outcome:'HOME'});
approx(fulham.probability,0.4811);
assert.equal(fulham.outlier,false);

const under=calibratePoissonProbability(0.6348,{type:'OVER_UNDER'},{outcome:'UNDER'});
approx(under.probability,0.5135);
assert.equal(under.weight,0.1);

const events=[{
 id:'e1',markets:[
  {type:'MATCH_RESULT',selections:[{id:'away',outcome:'AWAY',odds:2.52},{id:'home',outcome:'HOME',odds:2.33}]},
  {type:'OVER_UNDER',selections:[{id:'under',outcome:'UNDER',odds:1.98}]}
 ]
}];
const probabilities=new Map([['away',0.473],['home',0.5223],['under',0.6348],['external',0.6]]);
const sources=new Map([['away','football-data-poisson'],['home','football-data-poisson'],['under','football-data-poisson'],['external','external']]);
const calibrated=calibratePoissonModels(events,probabilities,sources);
approx(calibrated.probabilities.get('away'),0.3765);
approx(calibrated.probabilities.get('home'),0.4811);
approx(calibrated.probabilities.get('under'),0.5135);
assert.equal(calibrated.probabilities.get('external'),0.6);
assert.equal(calibrated.sources.get('away'),'football-data-poisson-calibrated');
assert.equal(calibrated.sources.get('external'),'external');
assert.equal(calibrated.meta.calibratedSelections,3);
assert.equal(calibrated.meta.outlierSelections,0);

console.log('conservative Poisson calibration tests: OK');
