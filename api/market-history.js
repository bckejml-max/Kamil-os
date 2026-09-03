import {quoteSymbol32} from '../js/marketQuote32.js';
import {getBettingLedger543,mutateBettingLedger543} from '../lib/betting-ledger543-store.js';
const UA='Mozilla/5.0 (compatible; KamilOS/111; +https://kamil-os-smoke.vercel.app/)';
const ranges=new Set(['1mo','3mo','6mo','1y']);
function requestUrl(req){return new URL(String(req.url||'/api/market-history'),'https://kamil-os-smoke.vercel.app')}
function symbols(req){const u=requestUrl(req),out=[];for(const raw of String(u.searchParams.get('symbols')||'').split(',')){const s=quoteSymbol32(raw);if(s&&!out.includes(s))out.push(s);if(out.length>=16)break}return out}
async function one(symbol,range){const url=`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=1d&includePrePost=false&events=div%2Csplits`;const r=await fetch(url,{headers:{'User-Agent':UA,'Accept':'application/json'}});if(!r.ok)throw new Error(`HISTORY ${r.status}`);const j=await r.json(),x=j?.chart?.result?.[0],ts=x?.timestamp||[],close=x?.indicators?.quote?.[0]?.close||[],points=[];for(let i=0;i<Math.min(ts.length,close.length);i++){const p=Number(close[i]);if(Number.isFinite(p)&&p>0)points.push({t:ts[i]*1000,p})}return{symbol,currency:x?.meta?.currency||'',points}}
async function readBody(req){let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>100000)throw new Error('BODY_TOO_LARGE')}return raw?JSON.parse(raw):{}}
export default async function handler(req,res){
 const u=requestUrl(req),source=String(u.searchParams.get('source')||'').toLowerCase();
 res.setHeader('Content-Type','application/json; charset=utf-8');
 if(source==='ledger543'){
  res.setHeader('Cache-Control','no-store');
  if(req.method==='GET')return res.status(200).json(await getBettingLedger543());
  if(req.method==='POST'||req.method==='PUT'){try{const result=await mutateBettingLedger543(await readBody(req));return res.status(result.status).json(result.body)}catch(error){return res.status(500).json({ok:false,error:'LEDGER_543_FAILED',message:String(error?.message||error)})}}
  res.setHeader('Allow','GET, POST, PUT');return res.status(405).json({ok:false,error:'METHOD_NOT_ALLOWED'});
 }
 res.setHeader('Cache-Control','public, s-maxage=600, stale-while-revalidate=1800');
 if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({ok:false,error:'METHOD_NOT_ALLOWED'})}
 const ss=symbols(req),range=ranges.has(u.searchParams.get('range'))?u.searchParams.get('range'):'1mo';if(!ss.length)return res.status(400).json({ok:false,error:'NO_SYMBOLS'});const series=[],errors=[];for(const s of ss){try{series.push(await one(s,range))}catch(e){errors.push({symbol:s,error:String(e?.message||e).slice(0,80)})}}return res.status(series.length?200:502).json({ok:series.length>0,provider:'Yahoo Finance chart',range,fetchedAt:new Date().toISOString(),series,errors})}
