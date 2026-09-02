const API_FOOTBALL_BASE='https://v3.football.api-sports.io';
const CACHE_TTL_MS=30*60*1000;
const cache=globalThis.__kamilApiFootballModelCache||(globalThis.__kamilApiFootballModelCache=new Map());

function normalizeText(value){
 return String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/&/g,' and ').replace(/[^a-z0-9]+/g,' ').trim();
}

const GENERIC_TEAM_TOKENS=new Set(['fc','fk','sc','cf','afc','ac','club','women','woman','ladies','w','z']);

export function normalizeTeam(value){
 const tokens=normalizeText(value).split(' ').filter(Boolean).filter(token=>!GENERIC_TEAM_TOKENS.has(token));
 return tokens.join(' ');
}

export function teamSimilarity(a,b){
 const left=normalizeTeam(a);
 const right=normalizeTeam(b);
 if(!left||!right)return 0;
 if(left===right)return 1;
 if(left.includes(right)||right.includes(left))return 0.9;
 const leftTokens=new Set(left.split(' '));
 const rightTokens=new Set(right.split(' '));
 let overlap=0;
 for(const token of leftTokens)if(rightTokens.has(token))overlap+=1;
 if(!overlap)return 0;
 return overlap/Math.min(leftTokens.size,rightTokens.size);
}

export function percentProbability(value){
 if(value===null||value===undefined)return null;
 const cleaned=String(value).trim().replace('%','');
 const n=Number(cleaned);
 if(!Number.isFinite(n)||n<0)return null;
 const p=n>1?n/100:n;
 return p>=0&&p<=1?p:null;
}

function cacheRead(key,now){
 const item=cache.get(key);
 if(!item||item.expiresAt<=now){if(item)cache.delete(key);return null}
 return item.value;
}

function cacheWrite(key,value,now){
 cache.set(key,{value,expiresAt:now+CACHE_TTL_MS});
 return value;
}

async function apiFootballGet(path,{apiKey,fetchImpl,now,useCache,meta}){
 const cacheKey=`api-football:${path}`;
 if(useCache){
  const cached=cacheRead(cacheKey,now);
  if(cached){meta.cacheHits+=1;return cached}
 }
 meta.apiRequests+=1;
 const response=await fetchImpl(`${API_FOOTBALL_BASE}${path}`,{headers:{'x-apisports-key':apiKey,'Accept':'application/json'}});
 const remainingDaily=response.headers?.get?.('x-ratelimit-requests-remaining');
 const remainingMinute=response.headers?.get?.('x-ratelimit-remaining');
 if(remainingDaily!==null&&remainingDaily!==undefined)meta.rateRemainingDaily=Number(remainingDaily);
 if(remainingMinute!==null&&remainingMinute!==undefined)meta.rateRemainingMinute=Number(remainingMinute);
 let payload;
 try{payload=await response.json()}catch{payload=null}
 if(!response.ok)throw new Error(`API_FOOTBALL_HTTP_${response.status}`);
 const errors=payload?.errors;
 const hasErrors=Array.isArray(errors)?errors.length>0:errors&&typeof errors==='object'?Object.keys(errors).length>0:!!errors;
 if(hasErrors)throw new Error(`API_FOOTBALL_ERROR:${JSON.stringify(errors).slice(0,300)}`);
 if(useCache)cacheWrite(cacheKey,payload,now);
 return payload;
}

function utcDate(value){
 const ts=Date.parse(value||'');
 if(!Number.isFinite(ts))return null;
 return new Date(ts).toISOString().slice(0,10);
}

export function findBestFixture(event,fixtures,{maxTimeDiffMs=12*60*60*1000}={}){
 const eventTs=Date.parse(event?.startTime||'');
 let best=null;
 for(const fixture of Array.isArray(fixtures)?fixtures:[]){
  const homeScore=teamSimilarity(event?.home,fixture?.teams?.home?.name);
  const awayScore=teamSimilarity(event?.away,fixture?.teams?.away?.name);
  if(homeScore<0.6||awayScore<0.6)continue;
  const fixtureTs=Number(fixture?.fixture?.timestamp)*1000||Date.parse(fixture?.fixture?.date||'');
  const timeDiff=Number.isFinite(eventTs)&&Number.isFinite(fixtureTs)?Math.abs(eventTs-fixtureTs):0;
  if(timeDiff>maxTimeDiffMs)continue;
  const score=homeScore+awayScore-Math.min(timeDiff/maxTimeDiffMs,1)*0.2;
  if(!best||score>best.score)best={fixture,score,homeScore,awayScore,timeDiffMs:timeDiff};
 }
 return best;
}

function matchResultMarket(event){
 return (Array.isArray(event?.markets)?event.markets:[]).find(market=>String(market?.type||'').toUpperCase()==='MATCH_RESULT'&&String(market?.period||'').toUpperCase()==='FULL_TIME')||null;
}

function normalizePredictionPercent(percent){
 const home=percentProbability(percent?.home);
 const draw=percentProbability(percent?.draw);
 const away=percentProbability(percent?.away);
 if(home===null||draw===null||away===null)return null;
 const sum=home+draw+away;
 if(sum<=0)return null;
 return {HOME:home/sum,DRAW:draw/sum,AWAY:away/sum};
}

export async function resolveApiFootballModels(events,options={}){
 const apiKey=String(options.apiKey||'').trim();
 const fetchImpl=options.fetchImpl||fetch;
 const now=Number.isFinite(options.now)?options.now:Date.now();
 const limit=Math.max(1,Math.min(10,Number.parseInt(String(options.limit??3),10)||3));
 const useCache=options.useCache!==false;
 const candidates=(Array.isArray(events)?events:[]).filter(event=>matchResultMarket(event)).slice(0,limit);
 const probabilities=new Map();
 const meta={
  requested:true,
  provider:'api-football',
  configured:!!apiKey,
  limit,
  candidateEvents:candidates.length,
  matchedEvents:0,
  modeledEvents:0,
  modeledSelections:0,
  apiRequests:0,
  cacheHits:0,
  rateRemainingDaily:null,
  rateRemainingMinute:null,
  errors:[],
  matches:[]
 };
 if(!apiKey)return {probabilities,meta};

 const dates=[...new Set(candidates.map(event=>utcDate(event.startTime)).filter(Boolean))];
 const fixturesByDate=new Map();
 for(const date of dates){
  try{
   const payload=await apiFootballGet(`/fixtures?date=${encodeURIComponent(date)}&timezone=UTC`,{apiKey,fetchImpl,now,useCache,meta});
   fixturesByDate.set(date,Array.isArray(payload?.response)?payload.response:[]);
  }catch(error){
   meta.errors.push({stage:'fixtures',date,message:String(error?.message||error)});
  }
 }

 for(const event of candidates){
  const date=utcDate(event.startTime);
  const match=findBestFixture(event,fixturesByDate.get(date)||[]);
  if(!match){
   meta.matches.push({eventId:event?.id??null,event:`${event?.home||'?'} vs ${event?.away||'?'}`,status:'UNMATCHED'});
   continue;
  }
  meta.matchedEvents+=1;
  const fixtureId=match.fixture?.fixture?.id;
  if(!fixtureId){
   meta.matches.push({eventId:event?.id??null,event:`${event?.home||'?'} vs ${event?.away||'?'}`,status:'NO_FIXTURE_ID'});
   continue;
  }
  try{
   const payload=await apiFootballGet(`/predictions?fixture=${encodeURIComponent(fixtureId)}`,{apiKey,fetchImpl,now,useCache,meta});
   const prediction=Array.isArray(payload?.response)?payload.response[0]:null;
   const normalized=normalizePredictionPercent(prediction?.predictions?.percent);
   if(!normalized){
    meta.matches.push({eventId:event?.id??null,fixtureId,status:'NO_PREDICTION'});
    continue;
   }
   const market=matchResultMarket(event);
   let modeled=0;
   for(const selection of Array.isArray(market?.selections)?market.selections:[]){
    const outcome=String(selection?.outcome||'').toUpperCase();
    const probability=normalized[outcome];
    if(!Number.isFinite(probability)||!selection?.id)continue;
    probabilities.set(String(selection.id),probability);
    modeled+=1;
   }
   if(modeled){
    meta.modeledEvents+=1;
    meta.modeledSelections+=modeled;
    meta.matches.push({
     eventId:event?.id??null,
     event:`${event?.home||'?'} vs ${event?.away||'?'}`,
     fixtureId,
     apiHome:match.fixture?.teams?.home?.name??null,
     apiAway:match.fixture?.teams?.away?.name??null,
     homeSimilarity:Number(match.homeScore.toFixed(3)),
     awaySimilarity:Number(match.awayScore.toFixed(3)),
     timeDiffMinutes:Math.round(match.timeDiffMs/60000),
     status:'MODELED'
    });
   }
  }catch(error){
   meta.errors.push({stage:'predictions',fixtureId,eventId:event?.id??null,message:String(error?.message||error)});
  }
 }
 return {probabilities,meta};
}
