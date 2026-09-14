import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {CircuitBreaker1168,providerFetch1165,shouldRetry1166,timeoutFor1165} from './lib/provider-reliability1160.js';

const market=await fs.readFile(new URL('./api/market-quotes.js',import.meta.url),'utf8');
const provider=await fs.readFile(new URL('./lib/provider-reliability1160.js',import.meta.url),'utf8');

for(const token of ['providerFetch1165','CircuitBreaker1168','rememberLastGood1170','lastKnownGood1170','dataState:\'degraded\''])assert.ok(market.includes(token),`market-quotes missing ${token}`);
for(const token of ['PROVIDER_TIMEOUTS_1165','withProviderRetry1166','recoveryProbe1169','freshness1171','ttlFor1172'])assert.ok(provider.includes(token),`provider helper missing ${token}`);
assert.equal(shouldRetry1166(429),true);
assert.equal(shouldRetry1166(503),true);
assert.equal(shouldRetry1166({code:'TIMEOUT'}),true);
assert.equal(shouldRetry1166(400),false);
assert.ok(timeoutFor1165('liveOdds')<timeoutFor1165('history'));

let calls=0;
const response=await providerFetch1165('https://example.invalid',{}, {
 provider:'TEST',kind:'financeQuote',retries:1,sleep:async()=>{},random:()=>0.5,
 fetchImpl:async()=>{calls++;if(calls===1)return{status:503,ok:false};return{status:200,ok:true}}
});
assert.equal(response.status,200);
assert.equal(calls,2,'retryable provider status must retry once');

const breaker=new CircuitBreaker1168({failureThreshold:2,cooldownMs:60_000});
const fail=async()=>{throw Object.assign(new Error('network'),{code:'ECONNRESET'})};
for(let i=0;i<2;i++){try{await providerFetch1165('https://example.invalid',{}, {provider:'TEST_BREAKER',breaker,retries:0,fetchImpl:fail})}catch{}}
assert.equal(breaker.snapshot().state,'open');
let blocked=false;try{await providerFetch1165('https://example.invalid',{}, {provider:'TEST_BREAKER',breaker,retries:0,fetchImpl:async()=>({status:200,ok:true})})}catch(error){blocked=error?.code==='CIRCUIT_OPEN'}
assert.equal(blocked,true,'open circuit must fail fast');

console.log('OS1172 PASS: live provider timeout/retry/circuit/fallback wiring guarded');
