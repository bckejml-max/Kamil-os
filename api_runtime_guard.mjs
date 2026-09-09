import assert from 'node:assert/strict';
import {readdir,readFile} from 'node:fs/promises';
import path from 'node:path';

const apiDir=new URL('./api/',import.meta.url);
const files=(await readdir(apiDir)).filter(name=>name.endsWith('.js')).sort();
assert.ok(files.length>0,'Expected API files to guard');

const banned=[
  {label:'legacy req.query',re:/\breq\.query\b/},
  {label:'legacy url.parse()',re:/\burl\.parse\s*\(/},
  {label:'legacy querystring module',re:/\b(?:require\s*\(\s*['"]querystring['"]\s*\)|from\s+['"]querystring['"]) /},
];

const violations=[];
for(const name of files){
  const source=await readFile(new URL(name,apiDir),'utf8');
  for(const rule of banned){
    if(rule.re.test(source))violations.push(`${path.posix.join('api',name)}: ${rule.label}`);
  }
}
assert.deepEqual(violations,[],`Legacy API runtime usage detected:\n${violations.join('\n')}`);

const gmail=await readFile(new URL('ticket-gmail-sync.js',apiDir),'utf8');
for(const token of ['new URL(','AbortController','GMAIL_SYNC_FAILED','gmail_sync_stage','retryableStatus','timeoutMs']){
  assert.ok(gmail.includes(token),`ticket-gmail-sync missing runtime hardening token: ${token}`);
}
assert.equal(gmail.includes('req.query'),false,'ticket-gmail-sync must not access req.query');

console.log(`API runtime guard PASS (${files.length} API files)`);
