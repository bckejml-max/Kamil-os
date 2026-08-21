export const MARKET_QUOTE_SOURCE_32={provider:'YAHOO_PUBLIC_CHART',maxSymbols:20,cacheMinutes:15,freshMinutes:30};
const upper=v=>String(v||'').trim().toUpperCase();
const finite=v=>Number.isFinite(Number(v));
export function quoteSymbol32(raw){
 let s=upper(raw).replace(/\s+/g,'');if(s.endsWith('.US'))s=s.slice(0,-3);if(!/^[A-Z0-9.^=-]{1,20}(\.[A-Z]{1,4})?$/.test(s))return null;return s;
}
export function quoteSymbolForPosition32(position={}){return quoteSymbol32(position?.ticker)}
export function quoteRequestedFromPositions32(positions=[],limit=MARKET_QUOTE_SOURCE_32.maxSymbols){const out=[];for(const p of positions||[]){const s=quoteSymbolForPosition32(p);if(s&&!out.includes(s))out.push(s);if(out.length>=limit)break}return out}
export function normalizeYahooChart32(json={},symbol){
 const result=json?.chart?.result?.[0],meta=result?.meta||{},price=Number(meta.regularMarketPrice),previous=Number(meta.chartPreviousClose??meta.regularMarketPreviousClose),marketTime=Number(meta.regularMarketTime),asOf=Number.isFinite(marketTime)&&marketTime>0?new Date(marketTime*1000).toISOString():new Date().toISOString();if(!finite(price)||price<=0)return null;
 const dailyPct=finite(previous)&&previous>0?(price-previous)/previous*100:null,clean=quoteSymbol32(symbol)||upper(meta.symbol);
 return {provider:MARKET_QUOTE_SOURCE_32.provider,symbol:clean,price,currency:String(meta.currency||'').toUpperCase()||null,exchange:String(meta.exchangeName||meta.fullExchangeName||'').trim()||null,asOf,previousClose:finite(previous)&&previous>0?previous:null,dailyPct:dailyPct===null?null:Math.round(dailyPct*100)/100,sourceUrl:`https://finance.yahoo.com/quote/${encodeURIComponent(clean)}`,sourceUrls:[`https://finance.yahoo.com/quote/${encodeURIComponent(clean)}`],confidence:75,confidenceMeaning:'PUBLIC_QUOTE_SOURCE',investmentAction:false};
}
export function quoteFresh32(quote,now=new Date()){const t=Date.parse(quote?.asOf||0),ageMinutes=Number.isFinite(t)?Math.max(0,(new Date(now).getTime()-t)/60000):null;return {fresh:ageMinutes!==null&&ageMinutes<=MARKET_QUOTE_SOURCE_32.freshMinutes,ageMinutes};}
export const marketQuote32Contract={factsOnly:true,autoTrade:false,changesDecisionAction:false,sourceQuality:'THIRD_PARTY_PUBLIC'};
