import {quoteSymbol32} from '../js/marketQuote32.js';
import {getBettingLedger543,mutateBettingLedger543} from '../lib/betting-ledger543-store.js';
const UA='Mozilla/5.0 (compatible; KamilOS/111; +https://kamil-os-smoke.vercel.app/)';
const ranges=new Set(['1mo','3mo','6mo','1y']);
function requestUrl(req){return new URL(String(req.url||'/api/market-history'),'https://kamil-os-smoke.vercel.app')}
function symbols(req){const u=requestUrl(req),out=[];for(const raw of String(u.searchParams.get('symbols')||'').split(',')){const s=quoteSymbol32(raw);if(s&&!out.includes(s))out.push(s);if(out.length>=16)break}return out}
async function one(symbol,range){const url=`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=1d&includePrePost=false&events=div%2Csplits`;const r=await fetch(url,{headers:{'User-Agent':UA,'Accept':'application/json'}});if(!r.ok)throw new Error(`HISTORY ${r.status}`);const j=await r.json(),x=j?.chart?.result?.[0],ts=x?.timestamp||[],close=x?.indicators?.quote?.[0]?.close||[],points=[];for(let i=0;i<Math.min(ts.length,close.length);i++){const p=Number(close[i]);if(Number.isFinite(p)&&p>0)points.push({t:ts[i]*1000,p})}return{symbol,currency:x?.meta?.currency||'',points}}
async function readBody(req){let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>100000)throw new Error('BODY_TOO_LARGE')}return raw?JSON.parse(raw):{}}
function isoDate(offset=0){const d=new Date(Date.now()+offset*86400000);return d.toISOString().slice(0,10)}
function norm(value){return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\b(fc|cf|fk|sk|afc|sc|ac|club)\b/g,' ').replace(/[^a-z0-9]+/g,' ').trim()}
function scoreName(a,b){const x=norm(a),y=norm(b);if(!x||!y)return 0;if(x===y)return 1;if(x.includes(y)||y.includes(x))return .92;const xs=new Set(x.split(' ').filter(t=>t.length>2)),ys=new Set(y.split(' ').filter(t=>t.length>2));let hit=0;for(const t of xs)if(ys.has(t))hit++;return hit/Math.max(1,Math.max(xs.size,ys.size))}
async function fixturesForDate(date,key){const url=`https://v3.football.api-sports.io/fixtures?date=${encodeURIComponent(date)}&timezone=Europe%2FPrague`;const r=await fetch(url,{headers:{Accept:'application/json','x-apisports-key':key},cache:'no-store'});const j=await r.json().catch(()=>null);if(!r.ok)throw new Error(`API_FOOTBALL_${r.status}`);return Array.isArray(j?.response)?j.response:[]}
function compactFixture(x){return{fixtureId:x?.fixture?.id??null,date:x?.fixture?.date??null,status:x?.fixture?.status?.short??null,statusLong:x?.fixture?.status?.long??null,league:x?.league?.name??null,home:x?.teams?.home?.name??null,away:x?.teams?.away?.name??null,homeGoals:Number.isFinite(Number(x?.goals?.home))?Number(x.goals.home):null,awayGoals:Number.isFinite(Number(x?.goals?.away))?Number(x.goals.away):null}}
function matchBet(bet,fixtures){const home=bet?.home||String(bet?.event||'').split(/\s+(?:vs|v|–|-)\s+/i)[0]||'';const away=bet?.away||String(bet?.event||'').split(/\s+(?:vs|v|–|-)\s+/i)[1]||'';let best=null,bestScore=0;for(const fixture of fixtures){const direct=(scoreName(home,fixture.home)+scoreName(away,fixture.away))/2;const swapped=(scoreName(home,fixture.away)+scoreName(away,fixture.home))/2*.7;const s=Math.max(direct,swapped);if(s>bestScore){best=fixture;bestScore=s}}return bestScore>=.72?{fixture:best,confidence:Number(bestScore.toFixed(3))}:null}
async function bettingResults(req,res,u){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST')return res.status(405).json({ok:false,error:'METHOD_NOT_ALLOWED'});
 const key=String(process.env.API_FOOTBALL_KEY||process.env.API_SPORTS_KEY||'').trim();if(!key)return res.status(503).json({ok:false,error:'API_FOOTBALL_NOT_CONFIGURED'});
 let input={};try{input=await readBody(req)}catch(e){return res.status(400).json({ok:false,error:'BAD_BODY'})}
 const bets=(Array.isArray(input?.bets)?input.bets:[]).filter(b=>String(b?.status||'OPEN').toUpperCase()==='OPEN').slice(0,50);
 const dates=[0,-1,-2,-3].map(isoDate),all=[];const errors=[];
 for(const date of dates){try{all.push(...(await fixturesForDate(date,key)).map(compactFixture))}catch(e){errors.push({date,error:String(e?.message||e)})}}
 const matches=bets.map(bet=>{const hit=matchBet(bet,all);return hit?{betId:bet.id,confidence:hit.confidence,fixture:hit.fixture}:null}).filter(Boolean);
 return res.status(200).json({ok:true,version:'544.0.0',provider:'API-Football',dates,fixturesChecked:all.length,matches,errors});
}
function unique(values){return [...new Set(values.filter(Boolean))]}
function absolutize(base,raw){try{return new URL(String(raw||''),base).toString()}catch{return null}}
async function chanceProbe(req,res,u){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='GET')return res.status(405).json({ok:false,error:'METHOD_NOT_ALLOWED'});
 const host=String(u.searchParams.get('host')||'www').toLowerCase()==='m'?'m.chance.cz':'www.chance.cz';
 const target=`https://${host}/`;
 try{
  const r=await fetch(target,{headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/152 Safari/537.36','Accept':'text/html,application/xhtml+xml','Accept-Language':'cs-CZ,cs;q=0.9,en;q=0.7'},redirect:'follow',cache:'no-store'});
  const text=await r.text();
  const scripts=unique([...text.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)].map(m=>absolutize(r.url,m[1]))).slice(0,40);
  const links=unique([...text.matchAll(/<link[^>]+href=["']([^"']+)["']/gi)].map(m=>absolutize(r.url,m[1]))).slice(0,40);
  const endpointHints=unique([...text.matchAll(/https?:\\?\/\\?\/[A-Za-z0-9._~:/?#[\]@!$&'()*+,;=%-]+/g)].map(m=>String(m[0]).replaceAll('\\/','/')).filter(x=>/chance|api|sport|bet|offer|event|odds/i.test(x))).slice(0,80);
  return res.status(r.ok?200:r.status).json({ok:r.ok,status:r.status,url:r.url,contentType:r.headers.get('content-type'),bytes:text.length,scripts,links,endpointHints,head:text.slice(0,1600)});
 }catch(error){return res.status(502).json({ok:false,error:'CHANCE_WEB_PROBE_FAILED',message:String(error?.message||error)})}
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
 if(source==='bet_results')return bettingResults(req,res,u);
 if(source==='chance_probe')return chanceProbe(req,res,u);
 res.setHeader('Cache-Control','public, s-maxage=600, stale-while-revalidate=1800');
 if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({ok:false,error:'METHOD_NOT_ALLOWED'})}
 const ss=symbols(req),range=ranges.has(u.searchParams.get('range'))?u.searchParams.get('range'):'1mo';if(!ss.length)return res.status(400).json({ok:false,error:'NO_SYMBOLS'});const series=[],errors=[];for(const s of ss){try{series.push(await one(s,range))}catch(e){errors.push({symbol:s,error:String(e?.message||e).slice(0,80)})}}return res.status(series.length?200:502).json({ok:series.length>0,provider:'Yahoo Finance chart',range,fetchedAt:new Date().toISOString(),series,errors})}