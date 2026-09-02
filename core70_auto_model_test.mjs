import assert from 'node:assert/strict';
import handler from './api/core70-health.js';

function responseCapture(){
 let body='';
 return {
  statusCode:200,headers:{},
  setHeader(k,v){this.headers[k]=v},
  end(chunk){body+=chunk||''},
  json(){return JSON.parse(body)}
 };
}

const future=new Date(Date.now()+60*60*1000).toISOString();
const pulsePayload={page:1,limit:1,total:1,totalPages:1,hasNextPage:false,events:[{
 eventId:'evt-1',sport:'soccer',home:'Alpha FC',away:'Beta FC',league:'Test League',startTime:future,live:false,
 markets:[{marketId:'m1',canonicalMarket:'MATCH_RESULT',rawName:'Výsledek zápasu',period:'FULL_TIME',isActive:true,selections:[
  {selectionId:'sel-home',canonicalOutcome:'HOME',rawName:'Alpha FC',decimal:2.20,isActive:true},
  {selectionId:'sel-draw',canonicalOutcome:'DRAW',rawName:'Remíza',decimal:3.10,isActive:true},
  {selectionId:'sel-away',canonicalOutcome:'AWAY',rawName:'Beta FC',decimal:3.00,isActive:true}
 ]}]
}]};

process.env.PULSESCORE_API_KEY='pulse-test';
delete process.env.API_FOOTBALL_KEY;
delete process.env.API_SPORTS_KEY;
let fetchCalls=[];
globalThis.fetch=async url=>{
 fetchCalls.push(String(url));
 return {ok:true,status:200,async text(){return JSON.stringify(pulsePayload)}};
};

let res=responseCapture();
await handler({method:'GET',url:'/api/core70-health?source=chance&sport=soccer&days=1&value=1&autoModel=1&betsOnly=1'},res);
let data=res.json();
assert.equal(data.ok,true);
assert.equal(data.value.autoModel.requested,true);
assert.equal(data.value.autoModel.configured,false);
assert.equal(data.value.automaticModelProbabilities,0);
assert.equal(data.events.length,0);
assert.equal(fetchCalls.length,1);

res=responseCapture();
await handler({method:'GET',url:'/api/core70-health?source=chance&sport=soccer&days=1&value=1&betsOnly=1&model=sel-home%3D0.60&modelSource=test'},res);
data=res.json();
assert.equal(data.events.length,1);
const pick=data.events[0].markets[0].selections[0];
assert.equal(pick.id,'sel-home');
assert.equal(pick.decision,'BET');
assert.equal(pick.modelSource,'test');
assert.equal(pick.evPct,32);

console.log('core70 auto-model safety tests: OK');
