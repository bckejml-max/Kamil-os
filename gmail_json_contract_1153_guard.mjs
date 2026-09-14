import assert from 'node:assert/strict';
import handler from './api/ticket-gmail-sync.js';

const makeRes=()=>({statusCode:200,headers:{},body:'',setHeader(k,v){this.headers[String(k).toLowerCase()]=String(v)},end(value=''){this.body=String(value)}});
const run=async response=>{
  const previous=globalThis.fetch;
  globalThis.fetch=async()=>response;
  try{
    const res=makeRes();
    await handler({method:'POST',url:'/api/ticket-gmail-sync?mode=inbox',headers:{authorization:'Bearer test-token'}},res);
    return{status:res.statusCode,body:JSON.parse(res.body)};
  }finally{globalThis.fetch=previous}
};

const html=await run(new Response('<html>proxy error</html>',{status:200,headers:{'content-type':'text/html'}}));
assert.equal(html.status,500,'non-JSON upstream response must fail closed');
assert.equal(html.body?.error,'GMAIL_SYNC_FAILED','non-JSON response must not be treated as auth or Gmail data');

const malformed=await run(new Response('{broken',{status:200,headers:{'content-type':'application/json'}}));
assert.equal(malformed.status,500,'malformed JSON upstream response must fail closed');
assert.equal(malformed.body?.error,'GMAIL_SYNC_FAILED','malformed JSON must not reach the sync pipeline');

const arrayShape=await run(new Response('[]',{status:200,headers:{'content-type':'application/json'}}));
assert.equal(arrayShape.status,500,'unexpected top-level JSON shape must fail closed');

const source=await (await import('node:fs/promises')).readFile(new URL('./api/ticket-gmail-sync.js',import.meta.url),'utf8');
assert.match(source,/async function parseJsonResponse\(/,'Gmail sync must keep the guarded JSON parser');
assert.equal((source.match(/\.json\(\)/g)||[]).length,0,'Gmail sync must not bypass guarded parsing with response.json()');
assert.match(source,/content-type/,'guarded parser must validate content type');
assert.match(source,/JSON_SHAPE/,'guarded parser must reject unsafe JSON shapes');

console.log('OS1153 Gmail JSON contract guard PASS: upstream JSON fails closed');
