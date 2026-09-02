import {normalizeTeam as baseNormalizeTeam,teamSimilarity as baseTeamSimilarity} from './api-football-model.js';

const FOOTBALL_DATA_BASE='https://www.football-data.co.uk/mmz4281';
const CACHE_TTL_MS=8*60*60*1000;
const cache=globalThis.__kamilFootballDataCache||(globalThis.__kamilFootballDataCache=new Map());

const LEAGUES=[
 {code:'E0',name:'England Premier League',rules:[['anglick','premier'],['england','premier'],['english','premier']]},
 {code:'E1',name:'England Championship',rules:[['anglick','championship'],['england','championship'],['english','championship']]},
 {code:'E2',name:'England League One',rules:[['anglick','league one'],['england','league one'],['english','league one']]},
 {code:'E3',name:'England League Two',rules:[['anglick','league two'],['england','league two'],['english','league two']]},
 {code:'SC0',name:'Scotland Premiership',rules:[['skotsk','premiership'],['scotland','premiership'],['scottish','premiership']]},
 {code:'D2',name:'Germany 2 Bundesliga',rules:[['nemeck','2 bundesliga'],['germany','2 bundesliga'],['german','2 bundesliga']]},
 {code:'D1',name:'Germany Bundesliga',rules:[['nemeck','bundesliga'],['germany','bundesliga'],['german','bundesliga']]},
 {code:'I1',name:'Italy Serie A',rules:[['italsk','serie a'],['italy','serie a'],['italian','serie a']]},
 {code:'I2',name:'Italy Serie B',rules:[['italsk','serie b'],['italy','serie b'],['italian','serie b']]},
 {code:'SP1',name:'Spain LaLiga',rules:[['spanelsk','laliga'],['spanelsk','la liga'],['spain','laliga'],['spanish','laliga'],['spain','la liga']]},
 {code:'SP2',name:'Spain Segunda',rules:[['spanelsk','segunda'],['spain','segunda'],['spanish','segunda']]},
 {code:'F1',name:'France Ligue 1',rules:[['francouzsk','ligue 1'],['france','ligue 1'],['french','ligue 1']]},
 {code:'F2',name:'France Ligue 2',rules:[['francouzsk','ligue 2'],['france','ligue 2'],['french','ligue 2']]},
 {code:'N1',name:'Netherlands Eredivisie',rules:[['nizozemsk','eredivisie'],['netherlands','eredivisie'],['dutch','eredivisie']]},
 {code:'B1',name:'Belgium First Division A',rules:[['belgick','jupiler'],['belgium','jupiler'],['belgian','jupiler'],['belgick','pro league'],['belgium','pro league']]},
 {code:'P1',name:'Portugal Primeira Liga',rules:[['portugalsk','liga portugal'],['portugal','liga portugal'],['portugalsk','primeira'],['portugal','primeira']]},
 {code:'T1',name:'Turkey Super Lig',rules:[['tureck','super lig'],['turkey','super lig'],['turkish','super lig']]},
 {code:'G1',name:'Greece Super League',rules:[['reck','super league'],['greece','super league'],['greek','super league']]}
];

function plain(value){
 return String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
}

export function footballDataLeague(value){
 const text=` ${plain(value)} `;
 for(const league of LEAGUES){
  for(const rule of league.rules){
   if(rule.every(part=>text.includes(plain(part))))return league;
  }
 }
 return null;
}

export function footballSeasonCode(value=Date.now()){
 const date=new Date(value);
 if(!Number.isFinite(date.getTime()))return null;
 const year=date.getUTCFullYear();
 const start=date.getUTCMonth()>=6?year:year-1;
 const yy=n=>String(n%100).padStart(2,'0');
 return `${yy(start)}${yy(start+1)}`;
}

function previousSeasonCode(code){
 const start=Number.parseInt(String(code).slice(0,2),10);
 if(!Number.isFinite(start))return null;
 const prev=(start+99)%100;
 return `${String(prev).padStart(2,'0')}${String(start).padStart(2,'0')}`;
}

export function parseCsvLine(line){
 const out=[];
 let value='';
 let quoted=false;
 for(let i=0;i<String(line).length;i+=1){
  const ch=line[i];
  if(ch==='"'){
   if(quoted&&line[i+1]==='"'){value+='"';i+=1}else quoted=!quoted;
  }else if(ch===','&&!quoted){out.push(value);value=''}
  else value+=ch;
 }
 out.push(value);
 return out;
}

function requiredNumber(value){
 const raw=String(value??'').trim();
 if(!raw)return null;
 const n=Number(raw);
 return Number.isFinite(n)?n:null;
}
function optionalNumber(value){
 const raw=String(value??'').trim();
 if(!raw)return null;
 const n=Number(raw);
 return Number.isFinite(n)?n:null;
}

export function parseFootballDataCsv(text){
 const lines=String(text??'').replace(/^\uFEFF/,'').split(/\r?\n/).filter(line=>line.trim().length);
 if(lines.length<2)return [];
 const headers=parseCsvLine(lines[0]).map(item=>item.trim());
 const index=new Map(headers.map((name,i)=>[name,i]));
 const required=['HomeTeam','AwayTeam','FTHG','FTAG'];
 if(required.some(name=>!index.has(name)))return [];
 const matches=[];
 for(const line of lines.slice(1)){
  const row=parseCsvLine(line);
  const home=String(row[index.get('HomeTeam')]??'').trim();
  const away=String(row[index.get('AwayTeam')]??'').trim();
  const homeGoals=requiredNumber(row[index.get('FTHG')]);
  const awayGoals=requiredNumber(row[index.get('FTAG')]);
  if(!home||!away||homeGoals===null||awayGoals===null)continue;
  matches.push({
   home,away,homeGoals,awayGoals,
   homeCorners:index.has('HC')?optionalNumber(row[index.get('HC')]):null,
   awayCorners:index.has('AC')?optionalNumber(row[index.get('AC')]):null,
   homeYellow:index.has('HY')?optionalNumber(row[index.get('HY')]):null,
   awayYellow:index.has('AY')?optionalNumber(row[index.get('AY')]):null,
   homeRed:index.has('HR')?optionalNumber(row[index.get('HR')]):null,
   awayRed:index.has('AR')?optionalNumber(row[index.get('AR')]):null
  });
 }
 return matches;
}

const TEAM_ALIASES=new Map([
 ['manchester city','man city'],['manchester united','man united'],['manchester utd','man united'],
 ['nottingham forest','nottm forest'],['nottingham','nottm forest'],['wolverhampton wanderers','wolves'],['wolverhampton','wolves'],
 ['tottenham hotspur','tottenham'],['brighton and hove albion','brighton'],['newcastle united','newcastle'],['west ham united','west ham'],
 ['leeds united','leeds'],['sheffield united','sheffield utd'],['leicester city','leicester'],['ipswich town','ipswich'],
 ['paris saint germain','paris sg'],['paris st germain','paris sg'],['internazionale','inter'],['inter milan','inter'],
 ['bayern munchen','bayern munich'],['bayern munich','bayern munich'],['borussia monchengladbach','m gladbach'],['monchengladbach','m gladbach'],
 ['atletico madrid','ath madrid'],['athletic bilbao','ath bilbao'],['athletic club','ath bilbao'],
 ['real betis balompie','betis'],['real sociedad de futbol','sociedad']
]);

export function footballDataTeam(value){
 const normalized=baseNormalizeTeam(value);
 return TEAM_ALIASES.get(normalized)||normalized;
}

export function footballDataTeamSimilarity(a,b){
 const left=footballDataTeam(a);
 const right=footballDataTeam(b);
 if(!left||!right)return 0;
 if(left===right)return 1;
 if(left.includes(right)||right.includes(left))return 0.94;
 return Math.max(baseTeamSimilarity(left,right),baseTeamSimilarity(a,b));
}

function resolveTeam(value,names){
 let best=null;
 let second=null;
 for(const name of names){
  const score=footballDataTeamSimilarity(value,name);
  if(!best||score>best.score){second=best;best={name,score}}
  else if(!second||score>second.score)second={name,score};
 }
 if(!best||best.score<0.72)return null;
 if(second&&second.score>0.72&&best.score-second.score<0.08)return null;
 return best;
}

function cacheRead(key,now){
 const item=cache.get(key);
 if(!item||item.expiresAt<=now){if(item)cache.delete(key);return null}
 return item.value;
}
function cacheWrite(key,value,now){cache.set(key,{value,expiresAt:now+CACHE_TTL_MS});return value}

async function fetchCsv(url,{fetchImpl,now,useCache,meta}){
 if(useCache){
  const cached=cacheRead(url,now);
  if(cached){meta.cacheHits+=1;return cached}
 }
 meta.dataRequests+=1;
 const response=await fetchImpl(url,{headers:{Accept:'text/csv,text/plain;q=0.9,*/*;q=0.1','User-Agent':'Kamil-OS-Value-Scanner/1.0'}});
 if(!response.ok)throw new Error(`FOOTBALL_DATA_HTTP_${response.status}`);
 const text=await response.text();
 const matches=parseFootballDataCsv(text);
 if(!matches.length)throw new Error('FOOTBALL_DATA_EMPTY');
 if(useCache)cacheWrite(url,matches,now);
 return matches;
}

function mean(values){return values.length?values.reduce((sum,value)=>sum+value,0)/values.length:null}
function clamp(value,min,max){return Math.max(min,Math.min(max,value))}

function recentVenueMatches(matches,team,venue,limit=14){
 const filtered=matches.filter(match=>venue==='home'?match.home===team:match.away===team);
 return filtered.slice(Math.max(0,filtered.length-limit));
}

export function estimateGoalLambdas(matches,homeTeam,awayTeam,{priorWeight=7,minVenueMatches=5,recentLimit=14}={}){
 if(!Array.isArray(matches)||matches.length<40)return null;
 const leagueHome=mean(matches.map(match=>match.homeGoals));
 const leagueAway=mean(matches.map(match=>match.awayGoals));
 if(!Number.isFinite(leagueHome)||!Number.isFinite(leagueAway)||leagueHome<=0||leagueAway<=0)return null;
 const homeSample=recentVenueMatches(matches,homeTeam,'home',recentLimit);
 const awaySample=recentVenueMatches(matches,awayTeam,'away',recentLimit);
 if(homeSample.length<minVenueMatches||awaySample.length<minVenueMatches)return null;
 const homeFor=(homeSample.reduce((sum,m)=>sum+m.homeGoals,0)+priorWeight*leagueHome)/(homeSample.length+priorWeight);
 const homeAgainst=(homeSample.reduce((sum,m)=>sum+m.awayGoals,0)+priorWeight*leagueAway)/(homeSample.length+priorWeight);
 const awayFor=(awaySample.reduce((sum,m)=>sum+m.awayGoals,0)+priorWeight*leagueAway)/(awaySample.length+priorWeight);
 const awayAgainst=(awaySample.reduce((sum,m)=>sum+m.homeGoals,0)+priorWeight*leagueHome)/(awaySample.length+priorWeight);
 const homeAttack=homeFor/leagueHome;
 const homeDefense=homeAgainst/leagueAway;
 const awayAttack=awayFor/leagueAway;
 const awayDefense=awayAgainst/leagueHome;
 return {
  home:clamp(leagueHome*homeAttack*awayDefense,0.2,3.8),
  away:clamp(leagueAway*awayAttack*homeDefense,0.2,3.8),
  leagueHome,leagueAway,homeMatches:homeSample.length,awayMatches:awaySample.length
 };
}

function poissonMass(lambda,maxGoals=10){
 const out=[];
 let p=Math.exp(-lambda);
 out.push(p);
 for(let k=1;k<=maxGoals;k+=1){p=p*lambda/k;out.push(p)}
 return out;
}

export function poissonMarkets(lambdaHome,lambdaAway,maxGoals=10){
 if(!Number.isFinite(lambdaHome)||!Number.isFinite(lambdaAway)||lambdaHome<=0||lambdaAway<=0)return null;
 const homeMass=poissonMass(lambdaHome,maxGoals);
 const awayMass=poissonMass(lambdaAway,maxGoals);
 const scores=[];
 let totalMass=0;
 for(let h=0;h<=maxGoals;h+=1){
  for(let a=0;a<=maxGoals;a+=1){
   const p=homeMass[h]*awayMass[a];
   scores.push({h,a,p});totalMass+=p;
  }
 }
 if(totalMass<=0)return null;
 for(const score of scores)score.p/=totalMass;
 const result={HOME:0,DRAW:0,AWAY:0,BTTS_YES:0,BTTS_NO:0,scores};
 for(const score of scores){
  if(score.h>score.a)result.HOME+=score.p;else if(score.h===score.a)result.DRAW+=score.p;else result.AWAY+=score.p;
  if(score.h>0&&score.a>0)result.BTTS_YES+=score.p;else result.BTTS_NO+=score.p;
 }
 return result;
}

function isHalfLine(value){
 const n=Number(value);
 return Number.isFinite(n)&&n>=0&&Math.abs(n*2-Math.round(n*2))<1e-8&&Math.abs(Math.round(n*2)%2)===1;
}

function isHalfHandicapLine(value){
 const n=Number(value);
 return Number.isFinite(n)&&Math.abs(n*2-Math.round(n*2))<1e-8&&Math.abs(Math.round(n*2)%2)===1;
}

function totalProbability(model,line,over=true){
 let p=0;
 for(const score of model.scores){
  const total=score.h+score.a;
  if(over?total>line:total<line)p+=score.p;
 }
 return p;
}
function teamTotalProbability(model,line,side,over=true){
 let p=0;
 for(const score of model.scores){
  const total=side==='home'?score.h:score.a;
  if(over?total>line:total<line)p+=score.p;
 }
 return p;
}
function handicapProbability(model,line,outcome){
 let p=0;
 for(const score of model.scores){
  const wins=outcome==='HOME'?score.h+line>score.a:score.a+line>score.h;
  if(wins)p+=score.p;
 }
 return p;
}

export function selectionProbability(market,selection,model){
 const type=String(market?.type||'').toUpperCase();
 const period=String(market?.period||'').toUpperCase();
 const outcome=String(selection?.outcome||'').toUpperCase();
 if(period!=='FULL_TIME')return null;
 if(type==='MATCH_RESULT')return Number.isFinite(model?.[outcome])?model[outcome]:null;
 if(type==='BOTH_TEAMS_TO_SCORE')return outcome==='YES'?model.BTTS_YES:outcome==='NO'?model.BTTS_NO:null;
 if(['OVER_UNDER','HOME_OVER_UNDER','AWAY_OVER_UNDER'].includes(type)){
  const line=Number(selection?.line??market?.line);
  if(!isHalfLine(line)||!['OVER','UNDER'].includes(outcome))return null;
  const over=outcome==='OVER';
  if(type==='OVER_UNDER')return totalProbability(model,line,over);
  return teamTotalProbability(model,line,type==='HOME_OVER_UNDER'?'home':'away',over);
 }
 if(type==='ASIAN_HANDICAP'){
  const line=Number(selection?.line??market?.line);
  if(!isHalfHandicapLine(line)||!['HOME','AWAY'].includes(outcome))return null;
  return handicapProbability(model,line,outcome);
 }
 return null;
}

async function leagueHistory(league,seasonCode,options){
 const previous=previousSeasonCode(seasonCode);
 const seasons=[previous,seasonCode].filter(Boolean);
 const matches=[];
 for(const season of seasons){
  const url=`${options.baseUrl||FOOTBALL_DATA_BASE}/${season}/${league.code}.csv`;
  try{matches.push(...await fetchCsv(url,{...options,meta:options.meta}))}
  catch(error){options.meta.errors.push({stage:'data',league:league.code,season,message:String(error?.message||error)})}
 }
 return matches;
}

export async function resolveFootballDataModels(events,options={}){
 const fetchImpl=options.fetchImpl||fetch;
 const now=Number.isFinite(options.now)?options.now:Date.now();
 const useCache=options.useCache!==false;
 const limit=Math.max(1,Math.min(30,Number.parseInt(String(options.limit??15),10)||15));
 const probabilities=new Map();
 const sources=new Map();
 const candidates=(Array.isArray(events)?events:[]).map(event=>({event,league:footballDataLeague(event?.league)})).filter(item=>item.league).slice(0,limit);
 const meta={requested:true,provider:'football-data-poisson',configured:true,limit,candidateEvents:candidates.length,matchedEvents:0,modeledEvents:0,modeledSelections:0,dataRequests:0,cacheHits:0,leagues:[],errors:[],matches:[]};
 const historyCache=new Map();
 for(const item of candidates){
  const {event,league}=item;
  const season=footballSeasonCode(event?.startTime||now);
  const historyKey=`${league.code}:${season}`;
  if(!historyCache.has(historyKey)){
   const matches=await leagueHistory(league,season,{fetchImpl,now,useCache,baseUrl:options.baseUrl,meta});
   historyCache.set(historyKey,matches);
   meta.leagues.push({code:league.code,name:league.name,season,matches:matches.length});
  }
  const matches=historyCache.get(historyKey)||[];
  const names=[...new Set(matches.flatMap(match=>[match.home,match.away]))];
  const home=resolveTeam(event?.home,names);
  const away=resolveTeam(event?.away,names);
  if(!home||!away||home.name===away.name){
   meta.matches.push({eventId:event?.id??null,event:`${event?.home||'?'} vs ${event?.away||'?'}`,league:league.code,status:'TEAM_UNMATCHED'});
   continue;
  }
  meta.matchedEvents+=1;
  const lambdas=estimateGoalLambdas(matches,home.name,away.name,options.model||{});
  if(!lambdas){
   meta.matches.push({eventId:event?.id??null,event:`${event?.home||'?'} vs ${event?.away||'?'}`,league:league.code,status:'INSUFFICIENT_HISTORY'});
   continue;
  }
  const model=poissonMarkets(lambdas.home,lambdas.away);
  let modeled=0;
  for(const market of Array.isArray(event?.markets)?event.markets:[]){
   for(const selection of Array.isArray(market?.selections)?market.selections:[]){
    if(!selection?.id)continue;
    const p=selectionProbability(market,selection,model);
    if(!Number.isFinite(p)||p<=0||p>=1)continue;
    probabilities.set(String(selection.id),p);
    sources.set(String(selection.id),'football-data-poisson');
    modeled+=1;
   }
  }
  if(modeled){
   meta.modeledEvents+=1;
   meta.modeledSelections+=modeled;
   meta.matches.push({eventId:event?.id??null,event:`${event?.home||'?'} vs ${event?.away||'?'}`,league:league.code,dataHome:home.name,dataAway:away.name,homeSimilarity:Number(home.score.toFixed(3)),awaySimilarity:Number(away.score.toFixed(3)),lambdaHome:Number(lambdas.home.toFixed(3)),lambdaAway:Number(lambdas.away.toFixed(3)),homeVenueMatches:lambdas.homeMatches,awayVenueMatches:lambdas.awayMatches,status:'MODELED'});
  }
 }
 return {probabilities,sources,meta};
}