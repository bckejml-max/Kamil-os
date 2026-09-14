import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import handler from './api/market-quotes.js';

const makeRes=()=>({statusCode:200,headers:{},payload:null,setHeader(k,v){this.headers[String(k).toLowerCase()]=String(v)},status(code){this.statusCode=code;return this},json(value){this.payload=value;return this}});
const run=async({url,headers={},response})=>{
  const previous=globalThis.fetch;
  globalThis.fetch=async()=>response;
  try{const res=makeRes();await handler({method:'GET',url,headers},res);return res}finally{globalThis.fetch=previous}
};

const pulseHtml=await run({url:'/api/market-quotes?source=chance&sport=soccer',headers:{authorization:'Bearer test-key'},response:new Response('<html>edge error</html>',{status:200,headers:{'content-type':'text/html'}})});
assert.equal(pulseHtml.statusCode,502,'PulseScore HTML response must fail closed');
assert.equal(pulseHtml.payload?.ok,false,'PulseScore HTML response must never become ok:true');
assert.equal(pulseHtml.payload?.error,'PULSESCORE_FETCH_FAILED');

const pulseBroken=await run({url:'/api/market-quotes?source=chance&sport=soccer',headers:{authorization:'Bearer test-key'},response:new Response('{broken',{status:200,headers:{'content-type':'application/json'}})});
assert.equal(pulseBroken.statusCode,502,'PulseScore malformed JSON must fail closed');
assert.equal(pulseBroken.payload?.ok,false);

const yahooHtml=await run({url:'/api/market-quotes?symbols=AAPL',response:new Response('<html>edge error</html>',{status:200,headers:{'content-type':'text/html'}})});
assert.equal(yahooHtml.statusCode,502,'Yahoo HTML response must fail closed when no quote survives');
assert.equal(yahooHtml.payload?.ok,false);
assert.equal(yahooHtml.payload?.quotes?.length,0);

const source=await readFile(new URL('./api/market-quotes.js',import.meta.url),'utf8');
assert.match(source,/async function parseUpstreamJson\(/,'market API must keep guarded upstream JSON parser');
assert.equal((source.match(/response\.json\(\)/g)||[]).length,0,'Yahoo parsing must not bypass guarded parser');
assert.doesNotMatch(source,/payload=\{raw:/,'PulseScore must not convert malformed JSON into a successful empty market');

console.log('OS1154 market JSON contract guard PASS: provider corruption fails closed');
