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

const future=new Date(Date.now()+4*60*60*1000).toISOString();
const unsupportedPayload={page:1,limit:1,total:1,totalPages:1,hasNextPage:false,events:[{
 eventId:'evt-1',sport:'soccer',home:'Alpha FC',away:'Beta FC',league:'Test League',startTime:future,live:false,
 markets:[{marketId:'m1',canonicalMarket:'MATCH_RESULT',rawName:'Výsledek zápasu',period:'FULL_TIME',isActive:true,selections:[
  {selectionId:'sel-home',canonicalOutcome:'HOME',rawName:'Alpha FC',decimal:2.20,isActive:true},
  {selectionId:'sel-draw',canonicalOutcome:'DRAW',rawName:'Remíza',decimal:3.10,isActive:true},
  {selectionId:'sel-away',canonicalOutcome:'AWAY',rawName:'Beta FC',decimal:3.00,isActive:true}
 ]}]
}]};

const supportedPayload={page:1,limit:1,total:1,totalPages:1,hasNextPage:false,events:[{
 eventId:'evt-prem',sport:'soccer',home:'Manchester City',away:'Wolverhampton Wanderers',league:'Anglická Premier League',startTime:future,live:false,
 markets:[
  {marketId:'mr',canonicalMarket:'MATCH_RESULT',rawName:'Výsledek zápasu',period:'FULL_TIME',isActive:true,selections:[
   {selectionId:'prem-home',canonicalOutcome:'HOME',rawName:'Manchester City',decimal:2.20,isActive:true},
   {selectionId:'prem-draw',canonicalOutcome:'DRAW',rawName:'Remíza',decimal:3.10,isActive:true},
   {selectionId:'prem-away',canonicalOutcome:'AWAY',rawName:'Wolverhampton Wanderers',decimal:3.00,isActive:true}
  ]},
  {marketId:'ou25',canonicalMarket:'OVER_UNDER',rawName:'Počet gólů v zápasu',period:'FULL_TIME',line:2.5,isActive:true,selections:[
   {selectionId:'prem-o25',canonicalOutcome:'OVER',rawName:'Více než 2.5',line:2.5,decimal:2.10,isActive:true},
   {selectionId:'prem-u25',canonicalOutcome:'UNDER',rawName:'Méně než 2.5',line:2.5,decimal:1.70,isActive:true}
  ]},
  {marketId:'ou2',canonicalMarket:'OVER_UNDER',rawName:'Počet gólů v zápasu',period:'FULL_TIME',line:2,isActive:true,selections:[
   {selectionId:'prem-o2',canonicalOutcome:'OVER',rawName:'Více než 2.0',line:2,decimal:1.90,isActive:true},
   {selectionId:'prem-u2',canonicalOutcome:'UNDER',rawName:'Méně než 2.0',line:2,decimal:1.90,isActive:true}
  ]}
 ]
}]};

const lockedPayload={page:1,limit:1,total:1,totalPages:1,hasNextPage:false,events:[{
 eventId:'locked-zbrojovka',sport:'soccer',home:'Zbrojovka Brno',away:'Hradec Králové',league:'Český pohár',startTime:future,live:false,
 markets:[{marketId:'locked-mr',canonicalMarket:'MATCH_RESULT',rawName:'Výsledek zápasu',period:'FULL_TIME',isActive:true,selections:[
  {selectionId:'locked-home',canonicalOutcome:'HOME',rawName:'Zbrojovka Brno',decimal:2.54,isActive:true},
  {selectionId:'locked-draw',canonicalOutcome:'DRAW',rawName:'Remíza',decimal:3.20,isActive:true},
  {selectionId:'locked-away',canonicalOutcome:'AWAY',rawName:'Hradec Králové',decimal:2.90,isActive:true}
 ]}]
}]};

const header='HomeTeam,AwayTeam,FTHG,FTAG,HC,AC,HY,AY,HR,AR';
const rows=[];
for(let i=0;i<14;i+=1){
 rows.push('Man City,Chelsea,4,0,8,2,1,2,0,0');
 rows.push('Arsenal,Wolves,3,0,7,3,1,2,0,0');
 rows.push('Chelsea,Arsenal,1,1,4,5,2,2,0,0');
 rows.push('Wolves,Man City,0,2,3,6,2,1,0,0');
}
rows.push('Arsenal,Chelsea,,,,,,,,');
const footballDataCsv=[header,...rows].join('\n');

process.env.PULSESCORE_API_KEY='pulse-test';
delete process.env.API_FOOTBALL_KEY;
delete process.env.API_SPORTS_KEY;
let activePayload=unsupportedPayload;
let fetchCalls=[];
globalThis.fetch=async url=>{
 const target=String(url);
 fetchCalls.push(target);
 if(target.includes('api.pulsescore.net'))return {ok:true,status:200,async text(){return JSON.stringify(activePayload)}};
 if(target.includes('football-data.co.uk'))return {ok:true,status:200,async text(){return footballDataCsv}};
 throw new Error(`Unexpected fetch ${target}`);
};

let res=responseCapture();
await handler({method:'GET',url:'/api/core70-health?source=chance&sport=soccer&days=1&value=1&autoModel=1&betsOnly=1'},res);
let data=res.json();
assert.equal(data.ok,true);
assert.equal(data.value.autoModel.requested,true);
assert.equal(data.value.autoModel.configured,true);
assert.equal(data.value.autoModel.provider,'football-data-poisson');
assert.equal(data.value.automaticModelProbabilities,0);
assert.equal(data.events.length,0);
assert.equal(fetchCalls.length,1);

activePayload=supportedPayload;
fetchCalls=[];
res=responseCapture();
await handler({method:'GET',url:'/api/core70-health?source=chance&sport=soccer&days=1&value=1&autoModel=1&poissonLimit=10&betsOnly=1&minOdds=1.45&maxOdds=3.20'},res);
data=res.json();
assert.equal(data.ok,true);
assert.equal(data.value.modelProviderConfigured,true);
assert.equal(data.value.modelProvider,'football-data-poisson');
assert.ok(data.value.automaticModelProbabilities>=5);
assert.equal(data.value.autoModel.dataRequests,2);
assert.ok(data.value.autoModel.footballData.modeledEvents>=1);
assert.ok(fetchCalls.filter(url=>url.includes('football-data.co.uk')).length===2);
const allPicks=data.events.flatMap(event=>event.markets.flatMap(market=>market.selections));
assert.ok(allPicks.some(pick=>pick.decision==='BET'&&pick.modelSource==='football-data-poisson'));
assert.equal(allPicks.some(pick=>pick.id==='prem-o2'||pick.id==='prem-u2'),false);

res=responseCapture();
activePayload=unsupportedPayload;
await handler({method:'GET',url:'/api/core70-health?source=chance&sport=soccer&days=1&value=1&betsOnly=1&model=sel-home%3D0.60&modelSource=test'},res);
data=res.json();
assert.equal(data.events.length,1);
const pick=data.events[0].markets[0].selections[0];
assert.equal(pick.id,'sel-home');
assert.equal(pick.decision,'BET');
assert.equal(pick.modelSource,'test');
assert.equal(pick.evPct,32);

activePayload=lockedPayload;
res=responseCapture();
await handler({method:'GET',url:'/api/core70-health?source=chance&sport=soccer&days=1&value=1&betsOnly=1&model=locked-home%3D0.60&modelSource=lock-test'},res);
data=res.json();
assert.equal(data.events.length,0);

console.log('core70 auto-model safety tests: OK');
