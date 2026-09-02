import assert from 'node:assert/strict';
import {resolveFootballDataCountModels} from './lib/football-data-count-resolver.js';

const header='HomeTeam,AwayTeam,FTHG,FTAG,HC,AC,HY,AY';
const rows=[];
for(let i=0;i<55;i+=1){
 const home=i%5===0?'Fulham':`Home${i%8}`;
 const away=i%6===0?'Crystal Palace':`Away${i%9}`;
 rows.push(`${home},${away},1,1,${4+i%4},${3+i%3},${1+i%3},${1+(i+1)%3}`);
}
for(let i=0;i<10;i+=1){
 rows.push(`Fulham,X${i},1,1,${6+i%2},4,${2+i%2},2`);
 rows.push(`Y${i},Crystal Palace,1,1,5,${5+i%2},2,${2+i%2}`);
}
const csv=[header,...rows].join('\n');
const fetchImpl=async()=>({ok:true,status:200,text:async()=>csv});
const events=[{
 id:'e1',league:'1. anglická liga',home:'Fulham',away:'Crystal Palace',startTime:'2026-09-05T14:00:00Z',
 markets:[
  {type:'CORNERS_OVER_UNDER',name:'Počet rohů',line:9.5,selections:[{id:'corners-over',outcome:'OVER',line:9.5},{id:'corners-under',outcome:'UNDER',line:9.5}]},
  {type:'YELLOW_CARDS_OVER_UNDER',name:'Žluté karty',line:3.5,selections:[{id:'cards-over',outcome:'OVER',line:3.5}]},
  {type:'TOTAL_CARDS',name:'Karty celkem',line:3.5,selections:[{id:'unsafe-general-cards',outcome:'OVER',line:3.5}]}
 ]
}];
const resolved=await resolveFootballDataCountModels(events,{fetchImpl,useCache:false,now:Date.parse('2026-09-02T12:00:00Z'),limit:5,baseUrl:'https://example.test'});
assert.equal(resolved.meta.candidateEvents,1);
assert.equal(resolved.meta.modeledEvents,1);
assert.equal(resolved.meta.provider,'football-data-count-calibrated');
assert.ok(resolved.probabilities.has('corners-over'));
assert.ok(resolved.probabilities.has('corners-under'));
assert.ok(resolved.probabilities.has('cards-over'));
assert.equal(resolved.probabilities.has('unsafe-general-cards'),false,'generic card markets must not assume yellow-card settlement rules');
assert.equal(resolved.sources.get('corners-over'),'football-data-count-corners-calibrated');
assert.equal(resolved.sources.get('cards-over'),'football-data-count-yellow_cards-calibrated');
assert.equal(resolved.meta.calibrationWeights.corners,0.5);
assert.equal(resolved.meta.calibrationWeights.yellow_cards,0.35);
console.log('football-data count resolver tests: OK');
