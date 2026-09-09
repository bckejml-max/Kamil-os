import assert from 'node:assert/strict';
import handler from './api/ticket-gmail-sync.js';

function response(){
  let body='';
  return {
    statusCode:0,
    headers:{},
    setHeader(name,value){this.headers[String(name).toLowerCase()]=value},
    end(chunk=''){body+=String(chunk)},
    json(){return JSON.parse(body)}
  };
}

async function run(req){
  Object.defineProperty(req,'query',{get(){throw new Error('ticket-gmail-sync must not access legacy req.query')}});
  const res=response();
  await handler(req,res);
  return {res,payload:res.json()};
}

for(const key of ['GOOGLE_CLIENT_ID','GOOGLE_CLIENT_SECRET','GOOGLE_REFRESH_TOKEN'])delete process.env[key];

{
  const {res,payload}=await run({method:'POST',url:'/api/ticket-gmail-sync?mode=tickets',headers:{}});
  assert.equal(res.statusCode,200);
  assert.equal(payload.ok,true);
  assert.equal(payload.configured,false);
  assert.equal(payload.healthy,false);
  assert.equal(payload.status,'unconfigured');
  assert.equal(payload.count,0);
  assert.deepEqual(payload.messages,[]);
}

{
  const {res,payload}=await run({method:'POST',url:'/api/ticket-gmail-sync?mode=unknown',headers:{}});
  assert.equal(res.statusCode,200);
  assert.equal(payload.status,'unconfigured');
  assert.deepEqual(payload.messages,[]);
}

{
  const {res,payload}=await run({method:'POST',url:'/api/ticket-gmail-sync?mode=inbox',headers:{}});
  assert.equal(res.statusCode,401);
  assert.equal(payload.status,'auth_required');
  assert.equal(payload.error,'AUTH_REQUIRED');
}

{
  const {res,payload}=await run({method:'GET',url:'/api/ticket-gmail-sync?mode=tickets',headers:{}});
  assert.equal(res.statusCode,405);
  assert.equal(payload.error,'METHOD_NOT_ALLOWED');
}

{
  const originalFetch=globalThis.fetch;
  process.env.GOOGLE_CLIENT_ID='test-id';
  process.env.GOOGLE_CLIENT_SECRET='test-secret';
  process.env.GOOGLE_REFRESH_TOKEN='test-refresh';
  globalThis.fetch=async()=>{throw new Error('sensitive upstream detail must not reach client')};
  try{
    const {res,payload}=await run({method:'POST',url:'/api/ticket-gmail-sync?mode=tickets',headers:{}});
    assert.equal(res.statusCode,500);
    assert.equal(payload.error,'GMAIL_SYNC_FAILED');
    assert.equal(JSON.stringify(payload).includes('sensitive upstream detail'),false);
  }finally{
    globalThis.fetch=originalFetch;
    for(const key of ['GOOGLE_CLIENT_ID','GOOGLE_CLIENT_SECRET','GOOGLE_REFRESH_TOKEN'])delete process.env[key];
  }
}

console.log('Ticket Gmail sync health guard PASS');
