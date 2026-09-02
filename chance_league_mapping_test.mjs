import assert from 'node:assert/strict';
import {canonicalChanceLeague,mapChanceEventsForFootballData} from './lib/chance-football-data-model.js';
import {footballDataLeague} from './lib/football-data-poisson.js';

const cases=[
 ['1. anglická liga','E0'],
 ['2. anglická liga','E1'],
 ['3. anglická liga','E2'],
 ['4. anglická liga','E3'],
 ['1. skotská liga','SC0'],
 ['1. německá liga','D1'],
 ['2. německá liga','D2'],
 ['1. italská liga','I1'],
 ['2. italská liga','I2'],
 ['1. španělská liga','SP1'],
 ['2. španělská liga','SP2'],
 ['1. francouzská liga','F1'],
 ['2. francouzská liga','F2'],
 ['1. nizozemská liga','N1'],
 ['1. belgická liga','B1'],
 ['1. portugalská liga','P1'],
 ['1. turecká liga','T1'],
 ['1. řecká liga','G1']
];

for(const [chance,code] of cases){
 const canonical=canonicalChanceLeague(chance);
 assert.equal(footballDataLeague(canonical)?.code,code,`${chance} -> ${canonical}`);
}
assert.equal(canonicalChanceLeague('2. skotská liga'),'2. skotská liga');
assert.equal(canonicalChanceLeague('Český pohár'),'Český pohár');
const [mapped]=mapChanceEventsForFootballData([{id:'x',league:'1. anglická liga'}]);
assert.equal(mapped.league,'England Premier League');
assert.equal(mapped.chanceLeague,'1. anglická liga');
console.log('chance league mapping tests: OK');
