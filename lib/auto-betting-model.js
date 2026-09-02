import {resolveApiFootballModels} from './api-football-model.js';
import {resolveChanceFootballDataModels} from './chance-football-data-model.js';
import {resolveFootballDataCountModels} from './football-data-count-resolver.js';
import {calibratePoissonModels} from './conservative-poisson-calibration.js';

function emptyApiMeta(requested,configured,limit){
 return {requested,provider:'api-football',configured,limit,candidateEvents:0,matchedEvents:0,modeledEvents:0,modeledSelections:0,apiRequests:0,cacheHits:0,rateRemainingDaily:null,rateRemainingMinute:null,predictionAttempts:0,errors:[],matches:[]};
}

export async function resolveAutoBettingModels(events,options={}){
 const apiKey=String(options.apiFootballKey||'').trim();
 const apiLimit=Math.max(1,Math.min(10,Number.parseInt(String(options.apiFootballLimit??3),10)||3));
 const poissonLimit=Math.max(1,Math.min(30,Number.parseInt(String(options.poissonLimit??15),10)||15));
 const poisson=await resolveChanceFootballDataModels(events,{
  fetchImpl:options.fetchImpl,
  now:options.now,
  useCache:options.useCache,
  limit:poissonLimit,
  baseUrl:options.footballDataBaseUrl,
  model:options.poissonModel
 });
 const count=await resolveFootballDataCountModels(events,{
  fetchImpl:options.fetchImpl,
  now:options.now,
  useCache:options.useCache,
  limit:poissonLimit,
  baseUrl:options.footballDataBaseUrl,
  model:options.countModel
 });
 const calibratedPoisson=calibratePoissonModels(events,poisson.probabilities,poisson.sources);
 let api={probabilities:new Map(),meta:emptyApiMeta(true,!!apiKey,apiLimit)};
 if(apiKey){
  api=await resolveApiFootballModels(events,{
   apiKey,
   fetchImpl:options.fetchImpl,
   now:options.now,
   useCache:options.useCache,
   limit:apiLimit
  });
 }
 const probabilities=new Map(calibratedPoisson.probabilities);
 const sources=new Map(calibratedPoisson.sources);
 for(const [id,p] of count.probabilities){
  probabilities.set(String(id),p);
  sources.set(String(id),count.sources.get(String(id))||'football-data-count');
 }
 for(const [id,p] of api.probabilities){
  probabilities.set(String(id),p);
  sources.set(String(id),'api-football');
 }
 const provider=apiKey?'football-data-poisson-calibrated+football-data-count+api-football':'football-data-poisson-calibrated+football-data-count';
 const meta={
  requested:true,
  provider,
  configured:true,
  modeledSelections:probabilities.size,
  modeledEvents:Math.max(Number(poisson.meta?.modeledEvents||0),Number(count.meta?.modeledEvents||0),Number(api.meta?.modeledEvents||0)),
  dataRequests:Number(poisson.meta?.dataRequests||0)+Number(count.meta?.dataRequests||0),
  apiRequests:Number(api.meta?.apiRequests||0),
  cacheHits:Number(poisson.meta?.cacheHits||0)+Number(count.meta?.cacheHits||0)+Number(api.meta?.cacheHits||0),
  calibration:calibratedPoisson.meta,
  footballData:poisson.meta,
  footballDataCount:count.meta,
  apiFootball:api.meta
 };
 return {probabilities,sources,meta};
}
