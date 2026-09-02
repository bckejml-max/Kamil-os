import assert from 'node:assert/strict';
import {
 footballDataLeague,footballSeasonCode,parseCsvLine,parseFootballDataCsv,
 footballDataTeamSimilarity,estimateGoalLambdas,poissonMarkets,selectionProbability,
 resolveFootballDataModels
} from './lib/football-data-poisson.js';

assert.equal(footballDataLeague('Anglická Premier League')?.code,'E0');
assert.equal(footballDataLeague('Německá 2. Bundesliga')?.code,'D2');
assert.equal(footballDataLeague('Německá Bundesliga')?.code,'D1');
assert.equal(footballDataLeague('Australská NPL, New South Wales'),null);
assert.equal(footballSeasonCode('2026-09-02T12:00:00Z'),'2627');
assert.equal(footballSeasonCode('2027-02-02T12:00:00Z'),'2627');
assert.deepEqual(parseCsvLine('A,"B, Team",2'),['A','B, Team','2']);
assert.ok(footballDataTeamSimilarity('Manchester City','Man City')>=0.94);
assert.ok(footballDataTeamSimilarity('Wolverhampton Wanderers','Wolves')>=0.94);

const parsed=parseFootballDataCsv('HomeTeam,AwayTeam,FTHG,FTAG,HC,AC\nMan City,Wolves,2,1,6,4\nArsenal,Chelsea,,,,\n');
assert.equal(parsed.length,1);
assert.equal(parsed[0].homeGoals,2);
assert.equal(parsed[0].homeCorners,6);

const rawMatches=[];
for(let i=0;i<14;i+=1){
 rawMatches.push({home:'Man City',away:'Chelsea',homeGoals:3,awayGoals:i%3===0?1:0});
 rawMatches.push({home:'Arsenal',away:'Wolves',homeGoals:i%2,awayGoals:1});
 rawMatches.push({home:'Chelsea',away:'Arsenal',homeGoals:1,awayGoals:1});
 rawMatches.push({home:'Wolves',away:'Man City',homeGoals:1,awayGoals:2});
}
const lambdas=estimateGoalLambdas(rawMatches,'Man City','Wolves');
assert.ok(lambdas);
assert.ok(lambdas.home>lambdas.away);
const model=poissonMarkets(lambdas.home,lambdas.away);
const resultSum=model.HOME+model.DRAW+model.AWAY;
assert.ok(Math.abs(resultSum-1)<1e-8);
assert.ok(Math.abs(model.BTTS_YES+model.BTTS_NO-1)<1e-8);

const over25={type:'OVER_UNDER',period:'FULL_TIME',line:2.5};
const over2={type:'OVER_UNDER',period:'FULL_TIME',line:2};
const over25p=selectionProbability(over25,{outcome:'OVER',line:2.5},model);
assert.ok(over25p>0&&over25p<1);
assert.equal(selectionProbability(over2,{outcome:'OVER',line:2},model),null);
assert.ok(selectionProbability({type:'BOTH_TEAMS_TO_SCORE',period:'FULL_TIME'},{outcome:'YES'},model)>0);
assert.ok(selectionProbability({type:'HOME_OVER_UNDER',period:'FULL_TIME',line:1.5},{outcome:'OVER',line:1.5},model)>0);

const header='HomeTeam,AwayTeam,FTHG,FTAG,HC,AC,HY,AY,HR,AR';
const rows=[];
for(let i=0;i<14;i+=1){
 rows.push(`Man City,Chelsea,3,${i%3===0?1:0},7,3,1,2,0,0`);
 rows.push(`Arsenal,Wolves,${i%2},1,5,4,2,2,0,0`);
 rows.push('Chelsea,Arsenal,1,1,4,5,2,2,0,0');
 rows.push('Wolves,Man City,1,2,3,6,2,1,0,0');
}
rows.push('Arsenal,Chelsea,,,,,,,,');
const csv=[header,...rows].join('\n');
let calls=[];
const fetchImpl=async url=>{
 calls.push(String(url));
 return {ok:true,status:200,async text(){return csv}};
};

const event={
 id:'evt-prem',home:'Manchester City',away:'Wolverhampton Wanderers',league:'Anglická Premier League',startTime:'2026-09-05T14:00:00Z',
 markets:[
  {type:'MATCH_RESULT',period:'FULL_TIME',selections:[{id:'h',outcome:'HOME'},{id:'d',outcome:'DRAW'},{id:'a',outcome:'AWAY'}]},
  {type:'BOTH_TEAMS_TO_SCORE',period:'FULL_TIME',selections:[{id:'btts-y',outcome:'YES'},{id:'btts-n',outcome:'NO'}]},
  {type:'OVER_UNDER',period:'FULL_TIME',line:2.5,selections:[{id:'o25',outcome:'OVER',line:2.5},{id:'u25',outcome:'UNDER',line:2.5}]},
  {type:'OVER_UNDER',period:'FULL_TIME',line:2,selections:[{id:'o2',outcome:'OVER',line:2},{id:'u2',outcome:'UNDER',line:2}]},
  {type:'HOME_OVER_UNDER',period:'FULL_TIME',line:1.5,selections:[{id:'ho15',outcome:'OVER',line:1.5},{id:'hu15',outcome:'UNDER',line:1.5}]},
  {type:'AWAY_OVER_UNDER',period:'FULL_TIME',line:0.5,selections:[{id:'ao05',outcome:'OVER',line:0.5},{id:'au05',outcome:'UNDER',line:0.5}]}
 ]
};
const resolved=await resolveFootballDataModels([event],{fetchImpl,useCache:false,now:Date.parse('2026-09-02T08:00:00Z')});
assert.equal(calls.length,2);
assert.ok(calls.some(url=>url.includes('/2526/E0.csv')));
assert.ok(calls.some(url=>url.includes('/2627/E0.csv')));
assert.equal(resolved.meta.modeledEvents,1);
assert.equal(resolved.meta.matchedEvents,1);
assert.ok(resolved.probabilities.get('h')>resolved.probabilities.get('a'));
assert.ok(resolved.probabilities.has('btts-y'));
assert.ok(resolved.probabilities.has('o25'));
assert.ok(resolved.probabilities.has('ho15'));
assert.ok(resolved.probabilities.has('ao05'));
assert.equal(resolved.probabilities.has('o2'),false);
assert.equal(resolved.probabilities.has('u2'),false);
assert.equal(resolved.sources.get('h'),'football-data-poisson');

console.log('football-data-poisson tests: OK');
