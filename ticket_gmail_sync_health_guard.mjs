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

for(const key of ['GOOGLE_CLIENT_ID','GOOGLE_CLIENT_SECRET','GOOGLE_REFRESH_TOKEN'])delete process.env[key];

const res=response();
await handler({method:'POST',query:{mode:'tickets'},url:'/api/ticket-gmail-sync?mode=tickets',headers:{}},res);
const payload=res.json();
assert.equal(res.statusCode,200);
assert.equal(payload.ok,true);
assert.equal(payload.configured,false);
assert.equal(payload.healthy,false);
assert.equal(payload.status,'unconfigured');
assert.deepEqual(payload.messages,[]);

console.log('Ticket Gmail sync health guard PASS');
