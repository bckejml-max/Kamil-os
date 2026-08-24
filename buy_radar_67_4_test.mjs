import assert from 'node:assert/strict';
import {scoreBuyCandidate674} from './js/buyRadarScore674.js';

const strong={official_status:'SOLD_OUT',capacity:5000,secondary_spread_pct:.4,extra_dates:0,official_sale_start:new Date(Date.now()+86400000).toISOString()};
const watch={official_status:'LOW_STOCK',capacity:12000,secondary_spread_pct:.2,extra_dates:0,official_sale_start:new Date(Date.now()+2*86400000).toISOString()};
const weak={official_status:'AVAILABLE',capacity:30000,secondary_spread_pct:.01,extra_dates:3,official_sale_start:new Date(Date.now()+30*86400000).toISOString()};
assert.ok(scoreBuyCandidate674(strong).score>=80);assert.equal(scoreBuyCandidate674(strong).label,'PROVĚŘIT NÁKUP');
assert.ok(scoreBuyCandidate674(watch).score>=65);assert.equal(scoreBuyCandidate674(watch).label,'HLÍDAT');
assert.ok(scoreBuyCandidate674(weak).score<65);assert.equal(scoreBuyCandidate674(weak).label,'NEBRAT');
console.log('Buy Radar 67.4 OK');
