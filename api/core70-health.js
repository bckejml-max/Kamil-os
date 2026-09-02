import {decorateLedgerSelection,ledgerSummary,publicLedger} from '../lib/bet-ledger.js';
import {resolveAutoBettingModels} from '../lib/auto-betting-model.js';
import {canonicalChanceLeague} from '../lib/chance-football-data-model.js';
import {footballDataLeague} from '../lib/football-data-poisson.js';

const PULSE_BASE='https://api.pulsescore.net/api/chance';
const DISCOVERY_PAGE_LIMIT=100;
const DISCOVERY_BATCH_SIZE=1;
const DISCOVERY_BATCH_PAUSE_MS=1100;
const PULSE_HEALTH_TTL_MS=5*60*1000;
let pulseHealthCache={checkedAt:0,ok:null,status:null,authMode:null,message:null};

function json(res,status,body,cache=false){
 res.statusCode=status;
 res.setHeader('content-type','application/json; charset=utf-8');
 res.setHeader('cache-control',cache?'public, s-maxage=300, stale-while-revalidate=600':'no-store');
 res.end(JSON.stringify(body));
}

function requestUrl(req){return new URL(String(req.url||'/api/core70-health'),'https://kamil-os-smoke.vercel.app')}
function cleanSport(value){const sport=String(value||'soccer').trim().toLowerCase();return /^[a-z0-9-]+$/.test(sport)?sport:'soccer'}
function clampInt(value,fallback,min,max){const n=Number.parseInt(String(value??''),10);return Number.isFinite(n)?Math.min(max,Math.max(min,n)):fallback}
function num(value,fallback=null){if(value===null||value===undefined||String(value).trim()==='')return fallback;const n=Number(value);return Number.isFinite(n)?n:fallback}
function round(value,digits=4){if(!Number.isFinite(value))return null;const p=10**digits;return Math.round(value*p)/p}
function priceOf(selection){for(const key of ['decimal','odds','price']){const n=Number(selection?.[key]);if(Number.isFinite(n)&&n>1)return n}return null}
function sourceEvents(payload){return Array.isArray(payload)?payload:Array.isArray(payload?.events)?payload.events:Array.isArray(payload?.data)?payload.data:[]}
function probability(value){const n=Number(value);if(!Number.isFinite(n)||n<=0)return null;if(n>1&&n<=100)return n/100;return n<=1?n:null}
function sleep(ms){return new Promise(resolve=>setTimeout(resolve,ms))}

async function pulseAttempt(target,key,authMode){
 const url=new URL(target);
 const headers={Accept:'application/json'};
 if(authMode==='query-key')url.searchParams.set('key',key);else headers['X-Secret']=key;
 const response=await fetch(url.toString(),{headers,cache:'no-store'});
 const text=await response.text();
 let payload;
 try{payload=JSON.parse(text)}catch{payload={raw:text.slice(0,4000)}}
 return{response,payload,authMode,url:url.toString()};
}

async function pulseRequest(target,key){
 let last=null;
 for(const authMode of ['x-secret','query-key']){
  for(let attempt=0;attempt<3;attempt+=1){
   last=await pulseAttempt(target,key,authMode);
   if(last.response.status===429&&attempt<2){await sleep(DISCOVERY_BATCH_PAUSE_MS*(attempt+1));continue}
   break;
  }
  if(last?.response?.ok){
   pulseHealthCache={checkedAt:Date.now(),ok:true,status:last.response.status,authMode,message:null};
   return last;
  }
  if(last?.response?.status!==401)break;
 }
 const status=last?.response?.status||0;
 const message=last?.payload?.message||last?.payload?.error||null;
 pulseHealthCache={checkedAt:Date.now(),ok:false,status,authMode:last?.authMode||null,message};
 return last;
}

async function pulseHealth(key){
 if(!key)return{configured:false,ok:false,status:null,authMode:null,message:'PULSESCORE_NOT_CONFIGURED'};
 if(Date.now()-Number(pulseHealthCache.checkedAt||0)<PULSE_HEALTH_TTL_MS&&pulseHealthCache.ok!==null)return{configured:true,...pulseHealthCache};
 return{configured:true,ok:true,status:null,authMode:null,message:null};
}

function compactEvent(event){
 const markets=(Array.isArray(event?.markets)?event.markets:[]).filter(m=>m?.isActive!==false).map(market=>({
  id:market?.marketId??market?.id??null,
  type:market?.canonicalMarket??null,
  name:market?.rawName??market?.name??market?.marketName??market?.canonicalMarket??null,
  period:market?.period??null,
  line:market?.line??null,
  selections:(Array.isArray(market?.selections)?market.selections:[]).filter(s=>s?.isActive!==false).map(selection=>({
   id:selection?.selectionId??selection?.id??null,
   outcome:selection?.canonicalOutcome??null,
   name:selection?.rawName??selection?.name??selection?.label??selection?.outcome??null,
   line:selection?.line??selection?.handicap??market?.line??null,
   odds:priceOf(selection)
  })).filter(selection=>selection.odds)
 })).filter(market=>market.selections.length);
 return {
  id:event?.eventId??event?.id??null,
  sport:event?.sport??null,
  home:event?.home??event?.homeTeam??event?.competitors?.[0]?.name??null,
  away:event?.away??event?.awayTeam??event?.competitors?.[1]?.name??null,
  league:event?.league??event?.competition??event?.tournament??null,
  startTime:event?.startTime??event?.startsAt??event?.start??null,
  live:event?.live===true,
  markets
 };
}

function balanceScore(market){
 if(market.type==='MATCH_RESULT')return -10;
 const odds=market.selections.map(s=>s.odds).filter(Boolean);
 if(odds.length<2)return 20+Math.abs((odds[0]||3)-1.91);
 const sorted=odds.slice().sort((a,b)=>Math.abs(a-1.91)-Math.abs(b-1.91));
 return Math.abs(sorted[0]-1.91)+Math.abs(sorted[1]-1.91);
}

function mainLines(markets,maxMarkets){
 const best=new Map();
 for(const market of markets){
  const key=`${market.type||''}|${market.name||''}|${market.period||''}`;
  const old=best.get(key);
  if(!old||balanceScore(market)<balanceScore(old))best.set(key,market);
 }
 return [...best.values()].sort((a,b)=>balanceScore(a)-balanceScore(b)).slice(0,maxMarkets);
}

function modelProbabilities(url){
 const map=new Map();
 const raw=url.searchParams.get('models');
 if(raw){
  try{
   const parsed=JSON.parse(raw);
   if(parsed&&typeof parsed==='object'&&!Array.isArray(parsed)){
    for(const [id,value] of Object.entries(parsed)){
     const p=probability(value);
     if(p!==null)map.set(String(id),p);
    }
   }
  }catch{}
 }
 for(const item of url.searchParams.getAll('model')){
  const at=String(item).lastIndexOf('=');
  if(at<=0)continue;
  const id=String(item).slice(0,at).trim();
  const p=probability(String(item).slice(at+1).trim());
  if(id&&p!==null)map.set(id,p);
 }
 return map;
}

function valueConfig(url,autoModel=null){
 const manual=modelProbabilities(url);
 const probabilities=new Map(autoModel?.probabilities||[]);
 const sources=new Map(autoModel?.sources||[]);
 for(const id of probabilities.keys())if(!sources.has(String(id)))sources.set(String(id),autoModel?.meta?.provider||'automatic');
 const manualSource=String(url.searchParams.get('modelSource')||'external').trim()||'external';
 for(const [id,p] of manual){probabilities.set(String(id),p);sources.set(String(id),manualSource)}
 return {
  enabled:url.searchParams.get('value')==='1',
  minEv:num(url.searchParams.get('minEv'),0.05),
  minEdgePp:num(url.searchParams.get('minEdgePp'),4),
  betsOnly:url.searchParams.get('betsOnly')==='1',
  manualProbabilities:manual,
  probabilities,
  sources
 };
}

function decorateSelection(selection,config){
 const implied=1/selection.odds;
 const id=String(selection.id);
 const modelProbability=config.probabilities.get(id)??null;
 const fairOdds=modelProbability===null?null:1/modelProbability;
 const edgePp=modelProbability===null?null:(modelProbability-implied)*100;
 const ev=modelProbability===null?null:modelProbability*selection.odds-1;
 const decision=modelProbability===null?'WAITING_FOR_MODEL':(ev>=config.minEv&&edgePp>=config.minEdgePp?'BET':'NO_BET');
 return {
  ...selection,
  impliedProbability:round(implied,4),
  modelProbability:modelProbability===null?null:round(modelProbability,4),
  fairOdds:fairOdds===null?null:round(fairOdds,3),
  edgePctPoints:edgePp===null?null:round(edgePp,2),
  ev:ev===null?null:round(ev,4),
  evPct:ev===null?null:round(ev*100,2),
  decision,
  modelSource:modelProbability===null?null:(config.sources.get(id)||'external')
 };
}

function eventPassesBaseFilters(event,url,{futureOnly=true}={}){
 const eventQ=String(url.searchParams.get('event')||'').trim().toLowerCase();
 const days=clampInt(url.searchParams.get('days'),0,0,31);
 const now=Date.now();
 const until=days?now+days*86400000:null;
 const ts=Date.parse(event.startTime||'');
 if(futureOnly&&(!Number.isFinite(ts)||ts<=now))return false;
 if(days&&(!Number.isFinite(ts)||ts>until))return false;
 if(eventQ&&!`${event.home||''} ${event.away||''} ${event.league||''}`.toLowerCase().includes(eventQ))return false;
 return true;
}

function isHalfLine(value){
 const n=Number(value);
 return Number.isFinite(n)&&n>=0&&Math.abs(n*2-Math.round(n*2))<1e-8&&Math.abs(Math.round(n*2)%2)===1;
}

function modelableFullTimeMarket(market){
 if(String(market?.period||'').toUpperCase()!=='FULL_TIME')return false;
 const type=String(market?.type||'').toUpperCase();
 if(type==='MATCH_RESULT'||type==='BOTH_TEAMS_TO_SCORE')return true;
 if(['OVER_UNDER','HOME_OVER_UNDER','AWAY_OVER_UNDER'].includes(type))return isHalfLine(market?.line??market?.selections?.[0]?.line);
 return false;
}

function autoModelCandidates(events,url,{futureOnly=true}={}){
 const minOdds=num(url.searchParams.get('minOdds'));
 const maxOdds=num(url.searchParams.get('maxOdds'));
 return events.map(compactEvent).filter(event=>eventPassesBaseFilters(event,url,{futureOnly})).filter(event=>event.markets.some(market=>{
  if(!modelableFullTimeMarket(market))return false;
  return market.selections.some(selection=>(minOdds===null||selection.odds>=minOdds)&&(maxOdds===null||selection.odds<=maxOdds));
 }));
}

function applyFilters(events,url,{futureOnly=true,autoModel=null}={}){
 const marketQ=String(url.searchParams.get('market')||'').trim().toLowerCase();
 const minOdds=num(url.searchParams.get('minOdds'));
 const maxOdds=num(url.searchParams.get('maxOdds'));
 const useMain=url.searchParams.get('main')==='1';
 const maxMarkets=clampInt(url.searchParams.get('maxMarkets'),20,1,50);
 const value=valueConfig(url,autoModel);

 return events.map(compactEvent).filter(event=>eventPassesBaseFilters(event,url,{futureOnly})).map(event=>{
  let markets=event.markets.filter(market=>{
   if(marketQ&&!`${market.type||''} ${market.name||''}`.toLowerCase().includes(marketQ))return false;
   market.selections=market.selections.filter(selection=>(minOdds===null||selection.odds>=minOdds)&&(maxOdds===null||selection.odds<=maxOdds));
   return market.selections.length>0;
  });
  if(useMain)markets=mainLines(markets,maxMarkets);
  if(value.enabled){
   markets=markets.map(market=>({...market,selections:market.selections.map(selection=>decorateSelection(selection,value))}));
  }
  markets=markets.map(market=>({...market,selections:market.selections.map(selection=>decorateLedgerSelection(event,market,selection))}));
  if(value.enabled&&value.betsOnly){
   markets=markets.map(market=>({...market,selections:market.selections.filter(selection=>selection.decision==='BET'&&!selection.existingBet)})).filter(market=>market.selections.length>0);
  }
  return {...event,markets};
 }).filter(event=>event.markets.length>0);
}

function supportedChanceLeague(value){
 const canonical=canonicalChanceLeague(value);
 return footballDataLeague(canonical);
}

async function fetchChanceDiscoveryPage(page,key){
 const target=`${PULSE_BASE}/soccer/events?page=${page}&limit=${DISCOVERY_PAGE_LIMIT}`;
 const result=await pulseRequest(target,key);
 if(!result?.response?.ok)throw new Error(`PULSESCORE_${result?.response?.status||0}`);
 return {page,payload:result.payload,events:sourceEvents(result.payload),authMode:result.authMode};
}

function summarizeChanceDiscoveryPage(item,now,until){
 const leagues=new Set();
 let supportedEvents=0;
 for(const event of item.events){
  const ts=Date.parse(event?.startTime??event?.startsAt??event?.start??'');
  if(!Number.isFinite(ts)||ts<=now||ts>until)continue;
  const leagueName=event?.league??event?.competition??event?.tournament??'';
  const league=supportedChanceLeague(leagueName);
  if(!league)continue;
  supportedEvents+=1;
  leagues.add(`${league.code}:${league.name}`);
 }
 return {page:item.page,supportedEvents,leagues:[...leagues].sort()};
}

async function chancePageDiscovery(res,url){
 const key=String(process.env.PULSESCORE_API_KEY||'').trim();
 if(!key)return json(res,503,{ok:false,error:'PULSESCORE_NOT_CONFIGURED'});
 const days=clampInt(url.searchParams.get('days'),5,1,14);
 const maxPages=clampInt(url.searchParams.get('maxPages'),40,1,60);
 const now=Date.now();
 const until=now+days*86400000;
 try{
  const first=await fetchChanceDiscoveryPage(1,key);
  const totalPages=Math.min(maxPages,clampInt(first.payload?.totalPages,1,1,maxPages));
  const items=[first];
  for(let start=2;start<=totalPages;start+=DISCOVERY_BATCH_SIZE){
   const pages=[];
   for(let page=start;page<Math.min(start+DISCOVERY_BATCH_SIZE,totalPages+1);page+=1)pages.push(page);
   const batch=await Promise.all(pages.map(page=>fetchChanceDiscoveryPage(page,key)));
   items.push(...batch);
   if(start+DISCOVERY_BATCH_SIZE<=totalPages)await sleep(DISCOVERY_BATCH_PAUSE_MS);
  }
  const summaries=items.map(item=>summarizeChanceDiscoveryPage(item,now,until)).filter(item=>item.supportedEvents>0).sort((a,b)=>a.page-b.page);
  await sleep(DISCOVERY_BATCH_PAUSE_MS);
  return json(res,200,{
   ok:true,
   provider:'pulsescore',
   bookmaker:'chance',
   sport:'soccer',
   mode:'page-discovery',
   authMode:first.authMode||null,
   days,
   fetchedAt:new Date().toISOString(),
   totalPages:Number(first.payload?.totalPages||totalPages),
   scannedPages:items.length,
   relevantPages:summaries.length,
   pages:summaries
  },true);
 }catch(error){
  const message=String(error?.message||error),authFailed=message==='PULSESCORE_401',rateLimited=message==='PULSESCORE_429';
  return json(res,authFailed?401:rateLimited?429:502,{ok:false,error:authFailed?'PULSESCORE_AUTH_FAILED':rateLimited?'PULSESCORE_RATE_LIMIT':'CHANCE_PAGE_DISCOVERY_FAILED',message,auth:pulseHealthCache});
 }
}

async function chanceProxy(req,res,url){
 const key=String(process.env.PULSESCORE_API_KEY||'').trim();
 if(!key)return json(res,503,{ok:false,error:'PULSESCORE_NOT_CONFIGURED'});
 const sport=cleanSport(url.searchParams.get('sport'));
 const mode=String(url.searchParams.get('mode')||'prematch').toLowerCase();
 const page=clampInt(url.searchParams.get('page'),1,1,10000);
 const limit=clampInt(url.searchParams.get('limit'),100,1,100);
 const compact=url.searchParams.get('compact')!=='0';
 const target=mode==='live'?`${PULSE_BASE}/live-events?sport=${encodeURIComponent(sport)}`:`${PULSE_BASE}/${encodeURIComponent(sport)}/events?page=${page}&limit=${limit}`;
 try{
  const upstream=await pulseRequest(target,key);
  if(!upstream?.response?.ok){
   const status=upstream?.response?.status||502;
   return json(res,status,{ok:false,error:status===401?'PULSESCORE_AUTH_FAILED':status===429?'PULSESCORE_RATE_LIMIT':'PULSESCORE_UPSTREAM_ERROR',status,authMode:upstream?.authMode||null,details:upstream?.payload||null});
  }
  const payload=upstream.payload;
  const rawEvents=sourceEvents(payload);
  const autoRequested=url.searchParams.get('autoModel')==='1'&&url.searchParams.get('value')==='1'&&sport==='soccer'&&mode!=='live';
  const apiFootballKey=process.env.API_FOOTBALL_KEY||process.env.API_SPORTS_KEY||'';
  let autoModel={probabilities:new Map(),sources:new Map(),meta:{requested:autoRequested,provider:'football-data-poisson',configured:true,modeledSelections:0,modeledEvents:0,dataRequests:0,apiRequests:0,cacheHits:0}};
  if(autoRequested){
   const candidates=autoModelCandidates(rawEvents,url,{futureOnly:true});
   autoModel=await resolveAutoBettingModels(candidates,{
    apiFootballKey,
    apiFootballLimit:clampInt(url.searchParams.get('autoModelLimit'),3,1,10),
    poissonLimit:clampInt(url.searchParams.get('poissonLimit'),15,1,30)
   });
  }
  const events=applyFilters(rawEvents,url,{futureOnly:mode!=='live',autoModel});
  const value=valueConfig(url,autoModel);
  const base={
   ok:true,
   provider:'pulsescore',
   bookmaker:'chance',
   authMode:upstream.authMode||null,
   sport,
   mode,
   fetchedAt:new Date().toISOString(),
   strictFutureFilter:mode!=='live',
   page:num(payload?.page,page),
   limit:num(payload?.limit,limit),
   total:num(payload?.total,rawEvents.length),
   totalPages:num(payload?.totalPages,1),
   hasNextPage:payload?.hasNextPage===true,
   rawCount:rawEvents.length,
   eventCount:events.length,
   ledger:ledgerSummary()
  };
  if(value.enabled){
   const fmd=!!process.env.FMD_API_KEY;
   base.value={
    minEv:value.minEv,
    minEvPct:round(value.minEv*100,2),
    minEdgePp:value.minEdgePp,
    betsOnly:value.betsOnly,
    suppliedModelProbabilities:value.manualProbabilities.size,
    automaticModelProbabilities:autoModel.probabilities.size,
    modelProviderConfigured:autoRequested||!!apiFootballKey||fmd,
    modelProvider:autoRequested?autoModel.meta.provider:apiFootballKey?'api-football':fmd?'fmd_key_present_not_wired':'none',
    autoModel:autoModel.meta,
    rule:'BET requires an independent model probability; bookmaker implied probability is never used as the model. Built-in Football-Data Poisson uses results/stats only. Integer goal lines are not auto-modeled because push refunds need separate EV math. Locked selections are excluded from new BET recommendations.'
   };
  }
  return json(res,200,compact?{...base,events}:{...base,raw:payload,events});
 }catch(error){
  return json(res,502,{ok:false,error:'PULSESCORE_FETCH_FAILED',message:String(error?.message||error)});
 }
}

export default async function handler(req,res){
 if(req.method!=='GET')return json(res,405,{ok:false,error:'METHOD_NOT_ALLOWED'});
 const url=requestUrl(req);
 const source=String(url.searchParams.get('source')||'').toLowerCase();
 if(source==='chance_pages')return chancePageDiscovery(res,url);
 if(source==='chance')return chanceProxy(req,res,url);
 if(source==='ledger')return json(res,200,{ok:true,version:'70.12-rate-limit',ledger:ledgerSummary(),bets:publicLedger()});
 const viagogo=!!(process.env.VIAGOGO_CLIENT_ID&&process.env.VIAGOGO_CLIENT_SECRET);
 const gmail=!!(process.env.GOOGLE_CLIENT_ID&&process.env.GOOGLE_CLIENT_SECRET&&process.env.GOOGLE_REFRESH_TOKEN);
 const pulseKey=String(process.env.PULSESCORE_API_KEY||'').trim();
 const pulse=await pulseHealth(pulseKey);
 const apiFootball=!!(process.env.API_FOOTBALL_KEY||process.env.API_SPORTS_KEY);
 const fmd=!!process.env.FMD_API_KEY;
 return json(res,200,{ok:true,version:'70.12-rate-limit',checks:{runtime_endpoint:true,viagogo_api:viagogo,gmail_api:gmail,pulsescore_api:pulse.ok===true,pulsescore_configured:!!pulseKey,pulsescore_status:pulse.status,pulsescore_auth_mode:pulse.authMode,football_data_poisson_model:true,api_football_key:apiFootball,fmd_api_key:fmd},pulse:{ok:pulse.ok,status:pulse.status,authMode:pulse.authMode,message:pulse.message},ledger:ledgerSummary()});
}
