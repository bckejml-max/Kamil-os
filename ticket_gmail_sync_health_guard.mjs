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

for(const key of ['GOOGLE_CLIENT_ID','GOOGLE_CLIENT_SECRET','GOOGLE_REFRESH_TOKEN','GMAIL_ALLOWED_EMAILS'])delete process.env[key];

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
  }
}

{
  const originalFetch=globalThis.fetch;
  const jsonResponse=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json; charset=utf-8'}});
  process.env.GMAIL_ALLOWED_EMAILS='owner@example.com';
  const headers=id=>[
    {name:'Subject',value:`Action ${id}`},
    {name:'From',value:'person@example.com'},
    {name:'Message-ID',value:`<${id}@example.com>`}
  ];
  globalThis.fetch=async(url)=>{
    const u=String(url);
    if(u.includes('/auth/v1/user'))return jsonResponse({id:'user-1',email:'owner@example.com'});
    if(u.includes('oauth2.googleapis.com/token'))return jsonResponse({access_token:'gmail-token'});
    if(u.endsWith('/gmail/v1/users/me/profile'))return jsonResponse({emailAddress:'owner@example.com',historyId:'history-42'});
    if(u.includes('/gmail/v1/users/me/messages?'))return jsonResponse({messages:[{id:'m1'},{id:'m1'},{id:'m2'}]});
    if(u.includes('/gmail/v1/users/me/messages/m1?'))return jsonResponse({id:'m1',threadId:'t1',internalDate:'1000',labelIds:['UNREAD'],snippet:'Please confirm this action?',payload:{headers:headers('m1')}});
    if(u.includes('/gmail/v1/users/me/messages/m2?'))return jsonResponse({id:'m2',threadId:'t2',internalDate:'2000',labelIds:['UNREAD'],snippet:'Please reply and confirm.',payload:{headers:headers('m2')}});
    throw new Error(`unexpected mock URL ${u}`);
  };
  try{
    const {res,payload}=await run({method:'POST',url:'/api/ticket-gmail-sync?mode=inbox',headers:{authorization:'Bearer os-token'}});
    assert.equal(res.statusCode,200);
    assert.equal(payload.ok,true);
    assert.equal(payload.scanned,2,'duplicate Gmail ids must be removed before detail fetch');
    assert.equal(payload.count,2,'duplicate Gmail rows must not replay into the response');
    assert.deepEqual(payload.messages.map(x=>x.id).sort(),['m1','m2']);
    assert.equal(payload.checkpoint.historyId,'history-42');
    assert.equal(payload.checkpoint.messageCount,2);
    assert.equal(payload.checkpoint.newestReceivedAt,new Date(2000).toISOString());
  }finally{
    globalThis.fetch=originalFetch;
    for(const key of ['GOOGLE_CLIENT_ID','GOOGLE_CLIENT_SECRET','GOOGLE_REFRESH_TOKEN','GMAIL_ALLOWED_EMAILS'])delete process.env[key];
  }
}

console.log('Ticket Gmail sync health guard PASS');