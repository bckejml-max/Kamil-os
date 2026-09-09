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
  "status:'error',configured:true,error:'GMAIL_SYNC_FAILED'",
  'checkedAt:new Date().toISOString()',
  'AbortController',
  'retryableStatus=status=>status===429||status>=500'
]) assert.ok(gmail.includes(token),`Gmail provider health missing contract token: ${token}`);
assert.equal(gmail.includes('req.query'),false,'Gmail health endpoint must not use legacy req.query');
assert.equal(gmail.includes("error:String(e?.message||e)"),false,'Gmail health endpoint must not leak upstream errors to clients');

console.log('Provider health contract PASS: configured state is distinct from verified/healthy state');
