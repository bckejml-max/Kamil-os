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

for(const mode of ['tickets','unknown','inbox']){
  const {res,payload}=await run({method:'POST',url:`/api/ticket-gmail-sync?mode=${mode}`,headers:{}});
  assert.equal(res.statusCode,401);
  assert.equal(payload.ok,false);
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
  let called=false;
  process.env.GOOGLE_CLIENT_ID='test-id';
  process.env.GOOGLE_CLIENT_SECRET='test-secret';
  process.env.GOOGLE_REFRESH_TOKEN='test-refresh';
  globalThis.fetch=async()=>{called=true;throw new Error('must not call upstream without auth')};
  try{
    const {res,payload}=await run({method:'POST',url:'/api/ticket-gmail-sync?mode=tickets',headers:{}});
    assert.equal(res.statusCode,401);
    assert.equal(payload.error,'AUTH_REQUIRED');
    assert.equal(called,false);
  }finally{
    globalThis.fetch=originalFetch;
    for(const key of ['GOOGLE_CLIENT_ID','GOOGLE_CLIENT_SECRET','GOOGLE_REFRESH_TOKEN'])delete process.env[key];
  }
}

console.log('Ticket Gmail sync health guard PASS');
