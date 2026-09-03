import {quoteSymbol32} from '../js/marketQuote32.js';
import {getBettingLedger543,mutateBettingLedger543} from '../lib/betting-ledger543-store.js';
import {resolveAutoBettingModels} from '../lib/auto-betting-model.js';
import {applyOddsValueModel692,chunkEventIds692,normalizeOddsApiEvents692,ODDS_API_BOOKMAKER692} from '../lib/betting-odds692.js';

const UA='Mozilla/5.0 (compatible; KamilOS/692; +https://kamil-os-smoke.vercel.app/)';
const ODDS_BASE='https://api.odds-api.io/v3';
const ranges=new Set(['1mo','3mo','6mo','1y']);
const clamp=(v,min,max,fallback)=>{const n=Number.parseInt(String(v??''),10);return Number.isFinite(n)?Math.min(max,Math.max(min,n)):fallback};
const finite=(v,fallback=null)=>{const n=Number(v);return Number.isFinite(n)?n:fallback};
function requestUrl(req){return new URL(String(req.url||'/api/market-history'),'https://kamil-os-smoke.vercel.app')}
function symbols(req){const u=requestUrl(req),out=[];for(const raw of String(u.searchParams.get('symbols')||'').split(',')){const s=quoteSymbol32(raw);if(s&&!out.includes(s))out.push(s);if(out.length>=16)break}return out}
async function one(symbol,range){const url=`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=1d&includePrePost=false&events=div%2Csplits`;const r=await fetch(url,{headers:{'User-Agent':UA,Accept:'application/json'}});if(!r.ok)throw new Error(`HISTORY ${r.status}`);const j=await r.json(),x=j?.chart?.result?.[0],ts=x?.timestamp||[],close=x?.indicators?.quote?.[0]?.close||[],points=[];for(let i=0;i<Math.min(ts.length,close.length);i++){const p=Number(close[i]);if(Number.isFinite(p)&&p>0)points.push({t:ts[i]*1000,p})}return{symbol,currency:x?.meta?.currency||'',points}}
async function readBody(req){let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>100000)throw new Error('BODY_TOO_LARGE')}return raw?JSON.parse(raw):{}}
function isoDate(offset=0){const d=new Date(Date.now()+offset*86400000);return d.toISOString().slice(0,10)}
function norm(value){return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\b(fc|cf|fk|sk|afc|sc|ac|club)\b/g,' ').replace(/[^a-z0-9]+/g,' ').trim()}
function scoreName(a,b){const x=norm(a),y=norm(b);if(!x||!y)return 0;if(x===y)return 1;if(x.includes(y)||y.includes(x))return .92;const xs=new Set(x.split(' ').filter(t=>t.length>2)),ys=new Set(y.split(' ').filter(t=>t.length>2));let hit=0;for(const t of xs)if(ys.has(t))hit++;return hit/Math.max(1,Math.max(xs.size,ys.size))}
async function fixturesForDate(date,key){const url=`https://v3.football.api-sports.io/fixtures?date=${encodeURIComponent(date)}&timezone=Europe%2FPrague`;const r=await fetch(url,{headers:{Accept:'application/json','x-apisports-key':key},cache:'no-store'});const j=await r.json().catch(()=>null);if(!r.ok)throw new Error(`API_FOOTBALL_${r.status}`);return Array.isArray(j?.response)?j.response:[]}
function compactFixture(x){return{fixtureId:x?.fixture?.id??null,date:x?.fixture?.date??null,status:x?.fixture?.status?.short??null,statusLong:x?.fixture?.status?.long??null,league:x?.league?.name??null,home:x?.teams?.home?.name??null,away:x?.teams?.away?.name??null,homeGoals:Number.isFinite(Number(x?.goals?.home))?Number(x.goals.home):null,awayGoals:Number.isFinite(Number(x?.goals?.away))?Number(x.goals.away):null}}
function matchBet(bet,fixtures){const home=bet?.home||String(bet?.event||'').split(/\s+(?:vs|v|–|-)\s+/i)[0]||'';const away=bet?.away||String(bet?.event||'').split(/\s+(?:vs|v|–|-)\s+/i)[1]||'';let best=null,bestScore=0;for(const fixture of fixtures){const direct=(scoreName(home,fixture.home)+scoreName(away,fixture.away))/2;const swapped=(scoreName(home,fixture.away)+scoreName(away,fixture.home))/2*.7;const s=Math.max(direct,swapped);if(s>bestScore){best=fixture;bestScore=s}}return bestScore>=.72?{fixture:best,confidence:Number(bestScore.toFixed(3))}:null}
async function bettingResults(req,res){res.setHeader('Cache-Control','no-store');if(req.method!=='POST')return res.status(405).json({ok:false,error:'METHOD_NOT_ALLOWED'});const key=String(process.env.API_FOOTBALL_KEY||process.env.API_SPORTS_KEY||'').trim();if(!key)return res.status(503).json({ok:false,error:'API_FOOTBALL_NOT_CONFIGURED'});let input={};try{input=await readBody(req)}catch{return res.status(400).json({ok:false,error:'BAD_BODY'})}const bets=(Array.isArray(input?.bets)?input.bets:[]).filter(b=>String(b?.status||'OPEN').toUpperCase()==='OPEN').slice(0,50);const dates=[0,-1,-2,-3].map(isoDate),all=[],errors=[];for(const date of dates){try{all.push(...(await fixturesForDate(date,key)).map(compactFixture))}catch(e){errors.push({date,error:String(e?.message||e)})}}const matches=bets.map(bet=>{const hit=matchBet(bet,all);return hit?{betId:bet.id,confidence:hit.confidence,fixture:hit.fixture}:null}).filter(Boolean);return res.status(200).json({ok:true,version:'544.0.0',provider:'API-Football',dates,fixturesChecked:all.length,matches,errors})}

function oddsKey(){return String(process.env.ODDS_API_IO_KEY||process.env.ODDS_API_KEY||'').trim()}
async function oddsJson(path,key){
 const join=path.includes('?')?'&':'?';
 const response=await fetch(`${ODDS_BASE}${path}${join}apiKey=${encodeURIComponent(key)}`,{headers:{Accept:'application/json','User-Agent':UA},cache:'no-store',signal:AbortSignal.timeout(15000)});
 let payload=null;try{payload=await response.json()}catch{}
 if(!response.ok){const error=new Error(String(payload?.message||payload?.error||`ODDS_API_HTTP_${response.status}`));error.status=response.status;error.payload=payload;throw error}
 return payload;
}
function selectedBookmakerNames692(payload){
 const rows=Array.isArray(payload)?payload:Array.isArray(payload?.bookmakers)?payload.bookmakers:Array.isArray(payload?.selected)?payload.selected:Array.isArray(payload?.data)?payload.data:[];
 return [...new Set(rows.map(item=>typeof item==='string'?item:item?.name??item?.bookmaker??item?.title).map(value=>String(value||'').trim()).filter(Boolean))];
}
function oddsHealth692(){
 const configured=!!oddsKey();
 return{ok:true,version:'692.0.0',provider:'odds-api.io',bookmaker:ODDS_API_BOOKMAKER692,exactChance:true,configured,pulsescoreFallbackConfigured:!!String(process.env.PULSESCORE_API_KEY||'').trim(),primary:configured?'odds-api.io':'pulsescore',directChanceWeb:{public:true,serverIngestion:false,reason:'Do not bypass bookmaker anti-bot protection'}};
}
async function chanceOdds692(req,res,u){
 res.setHeader('Cache-Control','public, s-maxage=120, stale-while-revalidate=600');
 if(req.method!=='GET')return res.status(405).json({ok:false,error:'METHOD_NOT_ALLOWED'});
 if(u.searchParams.get('health')==='1')return res.status(200).json(oddsHealth692());
 const key=oddsKey();
 if(!key)return res.status(503).json({...oddsHealth692(),ok:false,error:'ODDS_API_IO_NOT_CONFIGURED',message:'Exact Chance.cz feed is ready but ODDS_API_IO_KEY is not configured. PulseScore remains the fallback.'});
 const days=clamp(u.searchParams.get('days'),1,7,5),maxEvents=clamp(u.searchParams.get('limit'),10,50,40),now=Date.now(),until=now+days*86400000;
 const minOdds=finite(u.searchParams.get('minOdds'),1.45),maxOdds=finite(u.searchParams.get('maxOdds'),3.20),minEv=finite(u.searchParams.get('minEv'),0.05),minEdgePp=finite(u.searchParams.get('minEdgePp'),4),betsOnly=u.searchParams.get('betsOnly')!=='0';
 try{
  const selectedPayload=await oddsJson('/bookmakers/selected',key);
  const selectedBookmakers=selectedBookmakerNames692(selectedPayload);
  if(!selectedBookmakers.includes(ODDS_API_BOOKMAKER692))return res.status(409).json({...oddsHealth692(),ok:false,error:'ODDS_API_IO_CHANCE_NOT_SELECTED',message:`${ODDS_API_BOOKMAKER692} is not selected in the Odds-API.io account. Select Chance.cz in one of the available bookmaker slots before scanning.`,selectedBookmakers});
  const from=new Date(now).toISOString(),to=new Date(until).toISOString();
  const rawEvents=await oddsJson(`/events?sport=football&status=pending&bookmaker=${encodeURIComponent(ODDS_API_BOOKMAKER692)}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&limit=${maxEvents}`,key);
  const events=(Array.isArray(rawEvents)?rawEvents:[]).filter(e=>{const t=Date.parse(e?.date||'');return Number.isFinite(t)&&t>now&&t<=until}).sort((a,b)=>Date.parse(a.date)-Date.parse(b.date)).slice(0,maxEvents);
  const batches=chunkEventIds692(events.map(e=>e.id),10),oddsPayload=[];
  for(const batch of batches){
   const rows=await oddsJson(`/odds/multi?eventIds=${encodeURIComponent(batch.join(','))}&bookmakers=${encodeURIComponent(ODDS_API_BOOKMAKER692)}`,key);
   if(Array.isArray(rows))oddsPayload.push(...rows);
  }
  const normalized=normalizeOddsApiEvents692(oddsPayload,ODDS_API_BOOKMAKER692);
  const autoModel=await resolveAutoBettingModels(normalized,{apiFootballKey:process.env.API_FOOTBALL_KEY||process.env.API_SPORTS_KEY||'',apiFootballLimit:3,poissonLimit:30});
  const ledger=await getBettingLedger543();
  const valued=applyOddsValueModel692(normalized,autoModel,{openBets:ledger?.bets||[],minOdds,maxOdds,minEv,minEdgePp,betsOnly});
  const valueSelections=valued.reduce((n,event)=>n+event.markets.reduce((m,market)=>m+market.selections.filter(s=>s.decision==='BET').length,0),0);
  return res.status(200).json({ok:true,version:'692.0.0',provider:'odds-api.io',bookmaker:ODDS_API_BOOKMAKER692,exactChance:true,fresh:true,fetchedAt:new Date().toISOString(),days,selectedBookmakers,sourceEventCount:events.length,oddsEventCount:normalized.length,eventCount:valued.length,providerRequests:2+batches.length,events:valued,value:{minEv,minEvPct:minEv*100,minEdgePp,betsOnly,automaticModelProbabilities:autoModel.probabilities.size,modelProvider:autoModel.meta.provider,autoModel:autoModel.meta,valueSelections,rule:'Only exact Chance.cz odds are evaluated. BET requires an independent Kamil OS model probability; open/locked bets are always NO_ADD.'},ledger:{openCount:ledger?.analytics?.openCount||0,openExposureCzk:ledger?.analytics?.openExposureCzk||0}});
 }catch(error){
  const status=Number(error?.status||0),code=status===401||status===403?'ODDS_API_IO_AUTH':status===429?'ODDS_API_IO_RATE_LIMIT':'ODDS_API_IO_FETCH_FAILED';
  return res.status(status===401||status===403?401:status===429?429:502).json({...oddsHealth692(),ok:false,error:code,status:status||null,message:String(error?.message||error)});
 }
}

export default async function handler(req,res){
 const u=requestUrl(req),source=String(u.searchParams.get('source')||'').toLowerCase();
 res.setHeader('Content-Type','application/json; charset=utf-8');
 if(source==='ledger543'){
  res.setHeader('Cache-Control','no-store');
  if(req.method==='GET')return res.status(200).json(await getBettingLedger543());
  if(req.method==='POST'||req.method==='PUT'){try{const result=await mutateBettingLedger543(await readBody(req));return res.status(result.status).json(result.body)}catch(error){return res.status(500).json({ok:false,error:'LEDGER_543_FAILED',message:String(error?.message||error)})}}
  res.setHeader('Allow','GET, POST, PUT');return res.status(405).json({ok:false,error:'METHOD_NOT_ALLOWED'});
 }
 if(source==='bet_results')return bettingResults(req,res);
 if(source==='bet_odds692')return chanceOdds692(req,res,u);
 res.setHeader('Cache-Control','public, s-maxage=600, stale-while-revalidate=1800');
 if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({ok:false,error:'METHOD_NOT_ALLOWED'})}
 const ss=symbols(req),range=ranges.has(u.searchParams.get('range'))?u.searchParams.get('range'):'1mo';if(!ss.length)return res.status(400).json({ok:false,error:'NO_SYMBOLS'});const series=[],errors=[];for(const s of ss){try{series.push(await one(s,range))}catch(e){errors.push({symbol:s,error:String(e?.message||e).slice(0,80)})}}return res.status(series.length?200:502).json({ok:series.length>0,provider:'Yahoo Finance chart',range,fetchedAt:new Date().toISOString(),series,errors});
}
