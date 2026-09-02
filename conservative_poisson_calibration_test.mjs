import assert from 'node:assert/strict';
import {calibratePoissonProbability,calibratePoissonModels} from './lib/conservative-poisson-calibration.js';

const awayMarket={type:'MATCH_RESULT'};
const norwich=calibratePoissonProbability(0.473,awayMarket,{outcome:'AWAY'});
assert.equal(Number(norwich.probability.toFixed(4)),0.3765);
assert.equal(norwich.outlier,false);

const plymouth=calibratePoissonProbability(0.6582,awayMarket,{outcome:'AWAY'});
assert.equal(Number(plymouth.probability.toFixed(4)),0.3746);
assert.equal(plymouth.outlier,true);
assert.equal(plymouth.weight,0.25);

const fulham=calibratePoissonProbability(0.5223,{type:'MATCH_RESULT'},{outcome:'HOME'});
assert.equal(Number(fulham.probability.toFixed(4)),0.4812);
assert.equal(fulham.outlier,false);

const under=calibratePoissonProbability(0.6348,{type:'OVER_UNDER'},{outcome:'UNDER'});
assert.equal(Number(under.probability.toFixed(4)),0.5135);
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
assert.equal(Number(calibrated.probabilities.get('away').toFixed(4)),0.3765);
assert.equal(Number(calibrated.probabilities.get('home').toFixed(4)),0.4812);
assert.equal(Number(calibrated.probabilities.get('under').toFixed(4)),0.5135);
assert.equal(calibrated.probabilities.get('external'),0.6);
assert.equal(calibrated.sources.get('away'),'football-data-poisson-calibrated');
assert.equal(calibrated.sources.get('external'),'external');
assert.equal(calibrated.meta.calibratedSelections,3);
assert.equal(calibrated.meta.outlierSelections,0);

console.log('conservative Poisson calibration tests: OK');
