import fs from 'node:fs';
import assert from 'node:assert/strict';
import {applyOddsValueModel692,chunkEventIds692,normalizeOddsApiEvent692,ODDS_API_BOOKMAKER692} from './lib/betting-odds692.js';

assert.equal(ODDS_API_BOOKMAKER692,'Chance.cz');
const sample={
 id:61300607,
 home:'Brentford FC',away:'Manchester United',date:'2026-09-05T15:00:00Z',status:'pending',
 sport:{name:'Football',slug:'football'},league:{name:'England Premier League',slug:'england-premier-league'},
 bookmakers:{'Chance.cz':[
  {name:'Moneyline',updatedAt:'2026-09-03T18:00:00Z',odds:[{home:'3.520',draw:'3.810',away:'2.050'}]},
  {name:'Totals',updatedAt:'2026-09-03T18:01:00Z',odds:[{hdp:2.5,over:'1.84',under:'2.02'}]},
  {name:'Both Teams To Score',updatedAt:'2026-09-03T18:02:00Z',odds:[{yes:'1.78',no:'2.10'}]},
  {name:'Spread',updatedAt:'2026-09-03T18:03:00Z',odds:[{hdp:0.5,home:'1.72',away:'2.20'}]},
  {name:'Team Total Home',updatedAt:'2026-09-03T18:04:00Z',odds:[{hdp:1.5,over:'2.20',under:'1.67'}]},
  {name:'Corners Totals',updatedAt:'2026-09-03T18:05:00Z',odds:[{hdp:9.5,over:'1.91',under:'1.91'}]},
  {name:'Spread HT',updatedAt:'2026-09-03T18:06:00Z',odds:[{hdp:0.5,home:'1.9',away:'1.9'}]}
 ]}
};
const event=normalizeOddsApiEvent692(sample);
assert.ok(event);
assert.equal(event.home,'Brentford FC');
assert.equal(event.bookmaker,'Chance.cz');
assert.equal(event.rawMarketCount,7);
assert.equal(event.mappedMarketCount,6,'unsafe/period-specific markets must stay unmapped');
assert.equal(event.upstreamUpdatedAt,'2026-09-03T18:06:00.000Z');
const byType=new Map(event.markets.map(m=>[m.type,m]));
assert.deepEqual(byType.get('MATCH_RESULT').selections.map(s=>[s.outcome,s.odds]),[['HOME',3.52],['DRAW',3.81],['AWAY',2.05]]);
assert.deepEqual(byType.get('BOTH_TEAMS_TO_SCORE').selections.map(s=>s.outcome),['YES','NO']);
assert.equal(byType.get('OVER_UNDER').line,2.5);
assert.deepEqual(byType.get('ASIAN_HANDICAP').selections.map(s=>[s.outcome,s.line]),[['HOME',0.5],['AWAY',-0.5]]);
assert.equal(byType.get('HOME_OVER_UNDER').line,1.5);
assert.equal(byType.get('CORNERS_OVER_UNDER').line,9.5);

const home=byType.get('MATCH_RESULT').selections.find(s=>s.outcome==='HOME');
const draw=byType.get('MATCH_RESULT').selections.find(s=>s.outcome==='DRAW');
const model={probabilities:new Map([[home.id,0.34],[draw.id,0.25]]),sources:new Map([[home.id,'test-model'],[draw.id,'test-model']]),meta:{provider:'test-model'}};
let valued=applyOddsValueModel692([event],model,{minEv:0.05,minEdgePp:4,minOdds:1.45,maxOdds:4,betsOnly:true,openBets:[]});
assert.equal(valued.length,1);
assert.equal(valued[0].markets[0].selections[0].outcome,'HOME');
assert.equal(valued[0].markets[0].selections[0].decision,'BET');
assert.ok(valued[0].markets[0].selections[0].evPct>0);
valued=applyOddsValueModel692([event],model,{minEv:0.05,minEdgePp:4,minOdds:1.45,maxOdds:4,betsOnly:true,openBets:[{status:'OPEN',home:'Brentford FC',away:'Manchester United',market:'MATCH_RESULT',selection:'HOME'}]});
assert.equal(valued.length,0,'open/locked bet must never be recommended again');
assert.deepEqual(chunkEventIds692([1,2,3,4,5],2),[['1','2'],['3','4'],['5']]);
assert.equal(chunkEventIds692(Array.from({length:25},(_,i)=>i+1),50).length,3,'provider batch size must never exceed 10');

const api=fs.readFileSync('api/market-history.js','utf8');
assert.ok(api.includes("oddsJson('/bookmakers/selected',key)"),'OS692 must verify the bookmakers selected for the provider account before scanning');
assert.ok(api.includes("error:'ODDS_API_IO_CHANCE_NOT_SELECTED'"),'OS692 must fail explicitly when Chance.cz is not in the provider account slots');
assert.ok(api.includes('providerRequests:2+batches.length'),'provider request accounting must include selected-bookmaker validation');
console.log('OS692 Chance odds normalization/value guard PASS');
