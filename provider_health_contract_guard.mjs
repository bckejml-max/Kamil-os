import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const read=path=>readFile(new URL(path,import.meta.url),'utf8');
const core=await read('./api/core70-health.js');
const gmail=await read('./api/ticket-gmail-sync.js');

for(const token of [
  'configured:false,verified:false,ok:false',
  "message:'PULSESCORE_UNVERIFIED'",
  'pulsescore_verified:pulse.verified===true',
  'pulsescore_api:pulse.ok===true'
]) assert.ok(core.includes(token),`Core provider health missing truthful contract token: ${token}`);
assert.equal(core.includes("return{configured:true,ok:true,status:null,authMode:null,message:null}"),false,'Configured PulseScore must not be assumed healthy without evidence');

for(const token of [
  "healthy:false,status:'unconfigured',configured:false",
  "healthy:true,status:'ok',configured:true",
  "status:'auth_required',configured:true",
  "error:badBody?'BAD_BODY'",
  "'HISTORY_PAGE_LIMIT'",
  "'GMAIL_SYNC_FAILED'",
  'checkedAt:new Date().toISOString()',
  'AbortController',
  'retryableStatus=status=>status===429||status>=500'
]) assert.ok(gmail.includes(token),`Gmail provider health missing contract token: ${token}`);
assert.equal(gmail.includes('req.query'),false,'Gmail health endpoint must not use legacy req.query');
assert.match(gmail,/return json\(res,badBody\?400:500,\{ok:false,healthy:badBody,status:'error',configured:true,error:/,'Gmail failure response must remain fail-closed with bounded client-safe errors');
assert.ok(gmail.includes("logStage('error',{mode,error:String(e?.message||e)})"),'Detailed Gmail failures should remain server-log only');
assert.equal(/message:String\(e\?\.message/.test(gmail),false,'Detailed Gmail exception messages must not leak into client error responses');

console.log('Provider health contract PASS: configured state is distinct from verified/healthy state and Gmail errors remain bounded');
