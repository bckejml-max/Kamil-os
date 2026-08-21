import {MARKET_QUOTE_SOURCE_32,quoteSymbol32,normalizeYahooChart32} from '../js/marketQuote32.js';

const USER_AGENT='Mozilla/5.0 (compatible; KamilOS/32.4.1; +https://kamil-os-smoke.vercel.app/)';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function requestUrl(req){return new URL(String(req.url||'/api/market-quotes'),'https://kamil-os-smoke.vercel.app')}
function requested(req){const url=requestUrl(req),raw=url.searchParams.get('symbols')||url.searchParams.get('symbol')||'',values=String(raw).split(','),out=[];for(const v of values){const s=quoteSymbol32(v);if(s&&!out.includes(s))out.push(s);if(out.length>=MARKET_QUOTE_SOURCE_32.maxSymbols)break}return out}
async function fetchQuote(symbol){
 const url=`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=5d&interval=1d&includePrePost=false&events=div%2Csplits`,response=await fetch(url,{headers:{'User-Agent':USER_AGENT,'Accept':'application/json'}});if(!response.ok)throw new Error(`QUOTE ${response.status}`);return normalizeYahooChart32(await response.json(),symbol);
}
export default async function handler(req,res){
 res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','public, s-maxage=120, stale-while-revalidate=300');if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({ok:false,error:'METHOD_NOT_ALLOWED'})}
 const symbols=requested(req);if(!symbols.length)return res.status(400).json({ok:false,error:'NO_SYMBOLS'});
 const quotes=[],errors=[];for(let i=0;i<symbols.length;i++){try{const q=await fetchQuote(symbols[i]);if(q)quotes.push(q);else errors.push({symbol:symbols[i],error:'NO_PRICE'})}catch(error){errors.push({symbol:symbols[i],error:String(error?.message||error).slice(0,80)})}if(i<symbols.length-1)await sleep(40)}
 return res.status(quotes.length?200:502).json({ok:quotes.length>0,provider:MARKET_QUOTE_SOURCE_32.provider,fetchedAt:new Date().toISOString(),requested:symbols,quotes,errors,contract:{factsOnly:true,investmentAction:false,changesDecisionAction:false,thirdPartyPublic:true,urlParser:'WHATWG'}});
}
