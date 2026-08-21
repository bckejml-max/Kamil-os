import {xtbPositions} from './decision24.js';
import {MARKET_QUOTE_SOURCE_32,quoteRequestedFromPositions32,quoteSymbolForPosition32,quoteFresh32} from './marketQuote32.js';

const KEY='kamil-os-market-quotes-32';
const CACHE_MS=MARKET_QUOTE_SOURCE_32.cacheMinutes*60000;
let running=null,lastError=null;
const clone=v=>{try{return structuredClone(v)}catch{return JSON.parse(JSON.stringify(v??null))}};

export function readMarketQuotes32(){try{const x=JSON.parse(localStorage.getItem(KEY)||'null');return x&&typeof x==='object'?x:null}catch{return null}}
function writeMarketQuotes32(value){try{localStorage.setItem(KEY,JSON.stringify(value))}catch{};return value}
export function quoteSymbolsFromState32(state={}){return quoteRequestedFromPositions32(xtbPositions(state),MARKET_QUOTE_SOURCE_32.maxSymbols)}
export function marketQuoteForPosition32(position={}){
 const symbol=quoteSymbolForPosition32(position);if(!symbol)return null;const cache=readMarketQuotes32(),quote=(cache?.quotes||[]).find(x=>String(x?.symbol||'').toUpperCase()===symbol);if(!quote)return null;return {...quote,...quoteFresh32(quote)};
}
export function marketQuoteStatus32(state={}){
 const cache=readMarketQuotes32(),symbols=quoteSymbolsFromState32(state),at=Date.parse(cache?.fetchedAt||0),ageMinutes=Number.isFinite(at)?Math.max(0,(Date.now()-at)/60000):null,quotes=Array.isArray(cache?.quotes)?cache.quotes:[],freshQuotes=quotes.filter(q=>quoteFresh32(q).fresh).length;
 return {provider:MARKET_QUOTE_SOURCE_32.provider,requested:symbols.length,quotes:quotes.length,freshQuotes,fetchedAt:cache?.fetchedAt||null,ageMinutes,error:lastError,refreshing:!!running,fresh:ageMinutes!==null&&ageMinutes<=MARKET_QUOTE_SOURCE_32.cacheMinutes,errors:cache?.errors||[],contract:'FACTS_ONLY_NO_ACTION'};
}
export async function refreshMarketQuotes32(state={},opts={}){
 if(running)return running;const symbols=quoteSymbolsFromState32(state),cached=readMarketQuotes32(),age=Date.now()-Date.parse(cached?.fetchedAt||0);
 if(!opts.force&&cached&&Number.isFinite(age)&&age>=0&&age<CACHE_MS)return {ok:true,cached:true,...clone(cached)};if(!symbols.length)return {ok:true,empty:true,quotes:[],requested:[]};
 running=(async()=>{try{const url=`/api/market-quotes?symbols=${encodeURIComponent(symbols.join(','))}`,response=await fetch(url,{headers:{Accept:'application/json'}}),json=await response.json().catch(()=>null);if(!response.ok||!json?.ok)throw new Error(json?.error||`HTTP ${response.status}`);const payload={version:1,provider:MARKET_QUOTE_SOURCE_32.provider,fetchedAt:json.fetchedAt||new Date().toISOString(),requested:symbols,quotes:Array.isArray(json.quotes)?json.quotes:[],errors:Array.isArray(json.errors)?json.errors:[],contract:json.contract||{factsOnly:true,investmentAction:false,changesDecisionAction:false}};writeMarketQuotes32(payload);lastError=null;window.dispatchEvent(new CustomEvent('kamil:market-quotes',{detail:payload}));return {ok:true,...clone(payload)}}catch(error){lastError=String(error?.message||error);window.dispatchEvent(new CustomEvent('kamil:market-quotes',{detail:{ok:false,error:lastError}}));return {ok:false,error:lastError}}finally{running=null}})();return running;
}
export const marketQuoteIngest32Info={provider:MARKET_QUOTE_SOURCE_32.provider,storage:'device-local',cacheMinutes:MARKET_QUOTE_SOURCE_32.cacheMinutes,autoTrade:false,changesDecisionAction:false};
