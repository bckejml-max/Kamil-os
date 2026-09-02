import assert from 'node:assert/strict';
import {estimateCountLambdas,poissonCountProbability,totalCountProbability,countMarketProbability,countModelMetrics} from './lib/football-data-count-model.js';

const matches=[];
for(let i=0;i<60;i+=1){
 matches.push({
  home:i%3===0?'Home FC':`H${i%8}`,
  away:i%4===0?'Away FC':`A${i%9}`,
  homeCorners:4+(i%4),awayCorners:3+(i%3),
  homeYellow:1+(i%3),awayYellow:1+((i+1)%3)
 });
}
for(let i=0;i<10;i+=1){
 matches.push({home:'Home FC',away:`X${i}`,homeCorners:6+(i%2),awayCorners:4,homeYellow:2+(i%2),awayYellow:2});
 matches.push({home:`Y${i}`,away:'Away FC',homeCorners:5,awayCorners:5+(i%2),homeYellow:2,awayYellow:2+(i%2)});
}

const corners=estimateCountLambdas(matches,'Home FC','Away FC','corners');
assert.ok(corners);
assert.ok(corners.home>4.5&&corners.home<8);
assert.ok(corners.away>3.5&&corners.away<7);
assert.equal(corners.metric,'corners');

const cards=estimateCountLambdas(matches,'Home FC','Away FC','yellow_cards');
assert.ok(cards);
assert.ok(cards.home>1&&cards.home<4);
assert.ok(cards.away>1&&cards.away<4);

const over45=poissonCountProbability(5.6,4.5,true);
const under45=poissonCountProbability(5.6,4.5,false);
assert.ok(over45>0.6&&over45<0.8);
assert.ok(Math.abs(over45+under45-1)<1e-10);
assert.equal(poissonCountProbability(5.6,5,true),null,'integer lines are intentionally not auto-modeled');

const total=totalCountProbability(5.5,4.8,9.5,true);
assert.ok(total>0.5&&total<0.7);
const marketP=countMarketProbability({type:'HOME_CORNERS_OVER_UNDER',line:4.5},{outcome:'OVER'},corners);
assert.ok(Number.isFinite(marketP)&&marketP>0&&marketP<1);
assert.deepEqual(countModelMetrics,['corners','yellow_cards']);

console.log('football-data count model tests: OK');
