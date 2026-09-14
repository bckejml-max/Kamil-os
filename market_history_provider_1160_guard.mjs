import assert from 'node:assert/strict';
import handler from './api/market-history.js';

function makeRes(){return{statusCode:200,headers:{},payload:null,setHeader(k,v){this.headers[String(k).toLowerCase()]=String(v)},status(code){this.statusCode=code;return this},json(value){this.payload=value;return this}}}
function req(method,url,body=null){return{method,url,headers:{},async *[Symbol.asyncIterator](){if(body!==null)yield Buffer.from(JSON.stringify(body))}}}
async function run(request,mockFetch){const previous=globalThis.fetch;globalThis.fetch=mockFetch;try{const res=makeRes();await handler(request,res);return res}finally{globalThis.fetch=previous}}

const yahoo=await run(req('GET','/api/market-history?symbols=AAPL'),async()=>new Response('<html>proxy</html>',{status:200,headers:{'content-type':'text/html'}}));
assert.equal(yahoo.statusCode,502,'Yahoo HTML must fail closed');
assert.equal(yahoo.payload?.ok,false);
assert.equal(yahoo.payload?.dataState,'failed');
assert.equal(yahoo.payload?.series?.length,0);

const oldFootball=process.env.API_FOOTBALL_KEY;
process.env.API_FOOTBALL_KEY='test-key';
try{
 const football=await run(req('POST','/api/market-history?source=bet_results',{bets:[]}),async()=>new Response('{broken',{status:200,headers:{'content-type':'application/json'}}));
 assert.equal(football.statusCode,502,'all malformed API-Football responses must fail closed');
 assert.equal(football.payload?.ok,false);
 assert.equal(football.payload?.dataState,'failed');
 assert.equal(football.payload?.errors?.length,4);
}finally{if(oldFootball===undefined)delete process.env.API_FOOTBALL_KEY;else process.env.API_FOOTBALL_KEY=oldFootball}

const oldOdds=process.env.ODDS_API_IO_KEY;
process.env.ODDS_API_IO_KEY='test-key';
try{
 const odds=await run(req('GET','/api/market-history?source=chance_odds_pages693&days=5'),async()=>new Response('<html>bad gateway</html>',{status:200,headers:{'content-type':'text/html'}}));
 assert.equal(odds.statusCode,502,'Odds API HTML must fail closed');
 assert.equal(odds.payload?.ok,false);
 assert.equal(odds.payload?.dataState,'failed');
}finally{if(oldOdds===undefined)delete process.env.ODDS_API_IO_KEY;else process.env.ODDS_API_IO_KEY=oldOdds}

const source=await (await import('node:fs/promises')).readFile(new URL('./api/market-history.js',import.meta.url),'utf8');
assert.match(source,/parseProviderJson1160/);
assert.match(source,/validateApiFootball1160/);
assert.match(source,/validateOddsApi1161/);
assert.match(source,/validateYahooChart1162/);
assert.doesNotMatch(source,/\.json\(\)\.catch\(\(\)=>null\)/,'API-Football must not turn parse failure into empty data');
assert.doesNotMatch(source,/payload=\{raw:/,'Odds API malformed JSON must not become a valid payload');
console.log('OS1160 market-history provider guard PASS');
