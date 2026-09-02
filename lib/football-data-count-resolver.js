import {footballDataLeague,footballSeasonCode,parseFootballDataCsv,footballDataTeamSimilarity} from './football-data-poisson.js';
import {mapChanceEventsForFootballData} from './chance-football-data-model.js';
import {estimateCountLambdas,poissonCountProbability,totalCountProbability} from './football-data-count-model.js';

const FOOTBALL_DATA_BASE='https://www.football-data.co.uk/mmz4281';
const CACHE_TTL_MS=8*60*60*1000;
const COUNT_WEIGHTS={corners:0.50,yellow_cards:0.35};
const cache=globalThis.__kamilFootballDataCountCache||(globalThis.__kamilFootballDataCountCache=new Map());

function plain(value){return String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}
function previousSeasonCode(code){const start=Number.parseInt(String(code).slice(0,2),10);if(!Number.isFinite(start))return null;const prev=(start+99)%100;return `${String(prev).padStart(2,'0')}${String(start).padStart(2,'0')}`}
function cacheRead(key,now){const item=cache.get(key);if(!item||item.expiresAt<=now){if(item)cache.delete(key);return null}return item.value}
function cacheWrite(key,value,now){cache.set(key,{value,expiresAt:now+CACHE_TTL_MS});return value}

async function fetchCsv(url,{fetchImpl,now,useCache,meta}){
 if(useCache){const cached=cacheRead(url,now);if(cached){meta.cacheHits+=1;return cached}}
 meta.dataRequests+=1;
 const response=await fetchImpl(url,{headers:{Accept:'text/csv,text/plain;q=0.9,*/*;q=0.1','User-Agent':'Kamil-OS-Value-Scanner/1.0'}});
 if(!response.ok)throw new Error(`FOOTBALL_DATA_HTTP_${response.status}`);
 const matches=parseFootballDataCsv(await response.text());
 if(!matches.length)throw new Error('FOOTBALL_DATA_EMPTY');
 if(useCache)cacheWrite(url,matches,now);
 return matches;
}

async function leagueHistory(league,seasonCode,options){
 const seasons=[previousSeasonCode(seasonCode),seasonCode].filter(Boolean);
 const matches=[];
 for(const season of seasons){
  const url=`${options.baseUrl||FOOTBALL_DATA_BASE}/${season}/${league.code}.csv`;
  try{matches.push(...await fetchCsv(url,options))}
  catch(error){options.meta.errors.push({stage:'data',league:league.code,season,message:String(error?.message||error)})}
 }
 return matches;
}

function resolveTeam(value,names){
 let best=null,second=null;
 for(const name of names){
  const score=footballDataTeamSimilarity(value,name);
  if(!best||score>best.score){second=best;best={name,score}}
  else if(!second||score>second.score)second={name,score};
 }
 if(!best||best.score<0.72)return null;
 if(second&&second.score>0.72&&best.score-second.score<0.08)return null;
 return best;
}

function marketMetric(market){
 const period=String(market?.period||'').toUpperCase();
 if(period!=='FULL_TIME')return null;
 const type=String(market?.type||'').toUpperCase();
 const text=plain(`${type} ${market?.name||''}`);
 if(text.includes('corner')||text.includes('roh'))return 'corners';
 const explicitYellow=type.includes('YELLOW')||(text.includes('yellow')&&text.includes('card'))||text.includes('zluta karta')||text.includes('zlute karty');
 if(explicitYellow)return 'yellow_cards';
 return null;
}
function marketSide(market){
 const text=plain(`${market?.type||''} ${market?.name||''}`);
 if(text.includes('home')||text.includes('domac'))return 'home';
 if(text.includes('away')||text.includes('host'))return 'away';
 return 'total';
}
function selectionDirection(selection){
 const outcome=String(selection?.outcome||'').toUpperCase();
 if(outcome==='OVER')return true;if(outcome==='UNDER')return false;
 const text=plain(selection?.name);
 if(text.includes('over')||text.includes('vice')||text.includes('nad'))return true;
 if(text.includes('under')||text.includes('mene')||text.includes('pod'))return false;
 return null;
}
function halfLine(value){const n=Number(value);return Number.isFinite(n)&&Math.abs(n*2-Math.round(n*2))<1e-8&&Math.abs(Math.round(n*2)%2)===1?n:null}
function probabilityFor(selection,market,lambdas){
 const over=selectionDirection(selection);if(over===null)return null;
 const line=halfLine(selection?.line??market?.line);if(line===null)return null;
 const side=marketSide(market);
 if(side==='home')return poissonCountProbability(lambdas.home,line,over);
 if(side==='away')return poissonCountProbability(lambdas.away,line,over);
 return totalCountProbability(lambdas.home,lambdas.away,line,over);
}
function calibrateCountProbability(probability,metric){
 const p=Number(probability);if(!Number.isFinite(p)||p<=0||p>=1)return null;
 const weight=COUNT_WEIGHTS[metric]??0.35;
 return 0.5+weight*(p-0.5);
}

export async function resolveFootballDataCountModels(events,options={}){
 const fetchImpl=options.fetchImpl||fetch;
 const now=Number.isFinite(options.now)?options.now:Date.now();
 const useCache=options.useCache!==false;
 const limit=Math.max(1,Math.min(30,Number.parseInt(String(options.limit??15),10)||15));
 const mapped=mapChanceEventsForFootballData(events);
 const candidates=mapped.map(event=>({event,league:footballDataLeague(event?.league)})).filter(item=>item.league&&Array.isArray(item.event?.markets)&&item.event.markets.some(market=>marketMetric(market))).slice(0,limit);
 const probabilities=new Map();
 const sources=new Map();
 const meta={requested:true,provider:'football-data-count-calibrated',configured:true,limit,candidateEvents:candidates.length,matchedEvents:0,modeledEvents:0,modeledSelections:0,dataRequests:0,cacheHits:0,calibrationWeights:COUNT_WEIGHTS,scopeRule:'FULL_TIME corners + explicit yellow-card markets only',leagues:[],errors:[],matches:[]};
 const historyCache=new Map();
 for(const {event,league} of candidates){
  const season=footballSeasonCode(event?.startTime||now);
  const key=`${league.code}:${season}`;
  if(!historyCache.has(key)){
   const history=await leagueHistory(league,season,{fetchImpl,now,useCache,baseUrl:options.baseUrl,meta});
   historyCache.set(key,history);meta.leagues.push({code:league.code,name:league.name,season,matches:history.length});
  }
  const matches=historyCache.get(key)||[];
  const names=[...new Set(matches.flatMap(match=>[match.home,match.away]))];
  const home=resolveTeam(event?.home,names),away=resolveTeam(event?.away,names);
  if(!home||!away||home.name===away.name){meta.matches.push({eventId:event?.id??null,status:'TEAM_UNMATCHED'});continue}
  meta.matchedEvents+=1;
  const lambdasByMetric=new Map();
  let modeled=0;
  for(const market of event.markets){
   const metric=marketMetric(market);if(!metric)continue;
   if(!lambdasByMetric.has(metric))lambdasByMetric.set(metric,estimateCountLambdas(matches,home.name,away.name,metric,options.model||{}));
   const lambdas=lambdasByMetric.get(metric);if(!lambdas)continue;
   for(const selection of Array.isArray(market?.selections)?market.selections:[]){
    if(!selection?.id)continue;
    const raw=probabilityFor(selection,market,lambdas);
    const p=calibrateCountProbability(raw,metric);
    if(!Number.isFinite(p)||p<=0||p>=1)continue;
    probabilities.set(String(selection.id),p);
    sources.set(String(selection.id),`football-data-count-${metric}-calibrated`);
    modeled+=1;
   }
  }
  if(modeled){meta.modeledEvents+=1;meta.modeledSelections+=modeled;meta.matches.push({eventId:event?.id??null,event:`${event?.home||'?'} vs ${event?.away||'?'}`,league:league.code,dataHome:home.name,dataAway:away.name,modeled,status:'MODELED'})}
 }
 return {probabilities,sources,meta};
}