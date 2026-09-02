import assert from 'node:assert/strict';
import {normalizeTeam,teamSimilarity,percentProbability,findBestFixture,resolveApiFootballModels} from './lib/api-football-model.js';

assert.equal(normalizeTeam('Sturm Graz Ž'),'sturm graz');
assert.ok(teamSimilarity('FK Gintra Ž','Gintra Universitetas W')>=0.9);
assert.equal(percentProbability('60%'),0.6);

const start='2026-09-02T09:30:00.000Z';
const events=[{
 id:'8483906',home:'Sutherland Sharks',away:'Manly United',startTime:start,
 markets:[{type:'MATCH_RESULT',period:'FULL_TIME',selections:[
  {id:'home-id',outcome:'HOME',odds:2.23},{id:'draw-id',outcome:'DRAW',odds:3.19},{id:'away-id',outcome:'AWAY',odds:2.88}
 ]}]
}];
const fixtures=[{fixture:{id:123,timestamp:Date.parse(start)/1000,date:start},teams:{home:{name:'Sutherland Sharks FC'},away:{name:'Manly United FC'}}}];
assert.equal(findBestFixture(events[0],fixtures)?.fixture?.fixture?.id,123);

let calls=0;
const fetchImpl=async url=>{
 calls+=1;
 const payload=url.includes('/fixtures?')
  ? {errors:[],response:fixtures}
  : {errors:[],response:[{predictions:{percent:{home:'60%',draw:'20%',away:'20%'}}}]};
 return {ok:true,status:200,headers:{get(){return null}},async json(){return payload}};
};
const result=await resolveApiFootballModels(events,{apiKey:'test-key',fetchImpl,useCache:false,limit:3,now:Date.parse('2026-09-02T08:00:00Z')});
assert.equal(calls,2);
assert.equal(result.meta.matchedEvents,1);
assert.equal(result.meta.modeledEvents,1);
assert.equal(result.meta.modeledSelections,3);
assert.equal(result.probabilities.get('home-id'),0.6);
assert.equal(result.probabilities.get('draw-id'),0.2);
assert.equal(result.probabilities.get('away-id'),0.2);

const noKey=await resolveApiFootballModels(events,{apiKey:'',fetchImpl,useCache:false});
assert.equal(noKey.meta.configured,false);
assert.equal(noKey.probabilities.size,0);

let broadenedCalls=0;
const broadenedEvents=[
 {id:'unmatched',home:'Unknown Alpha',away:'Unknown Beta',startTime:start,markets:events[0].markets},
 events[0]
];
const broadenedFetch=async url=>{
 broadenedCalls+=1;
 const payload=url.includes('/fixtures?')
  ? {errors:[],response:fixtures}
  : {errors:[],response:[{predictions:{percent:{home:'60%',draw:'20%',away:'20%'}}}]};
 return {ok:true,status:200,headers:{get(){return null}},async json(){return payload}};
};
const broadened=await resolveApiFootballModels(broadenedEvents,{apiKey:'test-key',fetchImpl:broadenedFetch,useCache:false,limit:1,now:Date.parse('2026-09-02T08:00:00Z')});
assert.equal(broadenedCalls,2);
assert.equal(broadened.meta.candidateEvents,2);
assert.equal(broadened.meta.matchedEvents,1);
assert.equal(broadened.meta.predictionAttempts,1);
assert.equal(broadened.probabilities.get('home-id'),0.6);

console.log('api-football-model tests: OK');
