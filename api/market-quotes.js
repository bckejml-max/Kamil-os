import {MARKET_QUOTE_SOURCE_32,quoteSymbol32,normalizeYahooChart32} from '../js/marketQuote32.js';

const USER_AGENT='Mozilla/5.0 (compatible; KamilOS/32.4.1; +https://kamil-os-smoke.vercel.app/)';
const PULSE_BASE='https://api.pulsescore.net/api/chance';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function requestUrl(req){return new URL(String(req.url||'/api/market-quotes'),'https://kamil-os-smoke.vercel.app')}
function requested(req){const url=requestUrl(req),raw=url.searchParams.get('symbols')||url.searchParams.get('symbol')||'',values=String(raw).split(','),out=[];for(const v of values){const s=quoteSymbol32(v);if(s&&!out.includes(s))out.push(s);if(out.length>=MARKET_QUOTE_SOURCE_32.maxSymbols)break}return out}
async function fetchQuote(symbol){
 const url=`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=5d&interval=1d&includePrePost=false&events=div%2Csplits`,response=await fetch(url,{headers:{'User-Agent':USER_AGENT,'Accept':'application/json'}});if(!response.ok)throw new Error(`QUOTE ${response.status}`);return normalizeYahooChart32(await response.json(),symbol);
}
function clampInt(value,fallback,min,max){const n=Number.parseInt(String(value??''),10);return Number.isFinite(n)?Math.min(max,Math.max(min,n)):fallback}
function cleanSport(value){const sport=String(value||'soccer').trim().toLowerCase();return /^[a-z0-9-]+$/.test(sport)?sport:'soccer'}
function requestPulseKey(req){
 if(process.env.PULSESCORE_API_KEY)return process.env.PULSESCORE_API_KEY;
 const auth=String(req.headers?.authorization||'').trim();
 if(/^Bearer\s+/i.test(auth))return auth.replace(/^Bearer\s+/i,'').trim();
 if(/^Basic\s+/i.test(auth)){
  try{const decoded=Buffer.from(auth.replace(/^Basic\s+/i,''),'base64').toString('utf8');const i=decoded.indexOf(':');if(i>=0)return decoded.slice(i+1).trim()}catch{}
 }
 return '';
}
function normalizeChanceEvents(payload){
 const source=Array.isArray(payload)?payload:Array.isArray(payload?.events)?payload.events:Array.isArray(payload?.data)?payload.data:[];
 return source.map(event=>({
  ...event,
  markets:Array.isArray(event?.markets)?event.markets.map(market=>({
   ...market,
   selections:Array.isArray(market?.selections)?market.selections.filter(selection=>Number(selection?.decimal)>1):[]
  })).filter(market=>market.selections.length):[]
 })).filter(event=>event.markets.length);
}
async function chanceOdds(req,res,url){
 res.setHeader('Cache-Control','no-store');
 const apiKey=requestPulseKey(req);
 if(!apiKey)return res.status(503).json({ok:false,error:'PULSESCORE_NOT_CONFIGURED'});
 const sport=cleanSport(url.searchParams.get('sport'));
 const mode=String(url.searchParams.get('mode')||'prematch').toLowerCase();
 const page=clampInt(url.searchParams.get('page'),1,1,10000);
 const limit=clampInt(url.searchParams.get('limit'),100,1,100);
 const sportPrefix=sport==='soccer'?'':`/${encodeURIComponent(sport)}`;
 const target=mode==='live'
  ?`${PULSE_BASE}/live-events?sport=${encodeURIComponent(sport)}`
  :`${PULSE_BASE}${sportPrefix}/events?page=${page}&limit=${limit}`;
 try{
  const upstream=await fetch(target,{headers:{'X-Secret':apiKey,'Accept':'application/json'}});
  const text=await upstream.text();let payload;try{payload=JSON.parse(text)}catch{payload={raw:text.slice(0,2000)}}
  if(!upstream.ok)return res.status(upstream.status>=400&&upstream.status<600?upstream.status:502).json({ok:false,error:'PULSESCORE_UPSTREAM_ERROR',status:upstream.status,details:payload});
  const events=normalizeChanceEvents(payload);
  return res.status(200).json({ok:true,provider:'pulsescore',bookmaker:'chance',sport,mode,fetchedAt:new Date().toISOString(),eventCount:events.length,events});
 }catch(error){return res.status(502).json({ok:false,error:'PULSESCORE_FETCH_FAILED',message:String(error?.message||error).slice(0,300)})}
}
export default async function handler(req,res){
 res.setHeader('Content-Type','application/json; charset=utf-8');if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({ok:false,error:'METHOD_NOT_ALLOWED'})}
 const url=requestUrl(req);if(String(url.searchParams.get('source')||'').toLowerCase()==='chance')return chanceOdds(req,res,url);
 res.setHeader('Cache-Control','public, s-maxage=120, stale-while-revalidate=300');
 const symbols=requested(req);if(!symbols.length)return res.status(400).json({ok:false,error:'NO_SYMBOLS'});
 const quotes=[],errors=[];for(let i=0;i<symbols.length;i++){try{const q=await fetchQuote(symbols[i]);if(q)quotes.push(q);else errors.push({symbol:symbols[i],error:'NO_PRICE'})}catch(error){errors.push({symbol:symbols[i],error:String(error?.message||error).slice(0,80)})}if(i<symbols.length-1)await sleep(40)}
 return res.status(quotes.length?200:502).json({ok:quotes.length>0,provider:MARKET_QUOTE_SOURCE_32.provider,fetchedAt:new Date().toISOString(),requested:symbols,quotes,errors,contract:{factsOnly:true,investmentAction:false,changesDecisionAction:false,thirdPartyPublic:true,urlParser:'WHATWG'}});
}
