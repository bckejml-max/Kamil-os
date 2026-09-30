import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {QA_SUITES} from './qa-suites.mjs';

const root=process.cwd();
const skip=new Set(['node_modules','.git','test-results','playwright-report','.vercel']);
const files=[];
function walk(dir){
 for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
  if(skip.has(ent.name))continue;
  const abs=path.join(dir,ent.name),rel=path.relative(root,abs).replaceAll('\\','/');
  if(ent.isDirectory())walk(abs);else files.push(rel);
 }
}
walk(root);
const exists=new Set(files);
const roots=new Set();
const capture=(text)=>{
 for(const m of String(text).matchAll(/(?:^|[\s'"(])([A-Za-z0-9_./-]+\.mjs)\b/g)){
  const rel=m[1].replace(/^\.\//,'');
  if(exists.has(rel))roots.add(rel);
  else if(exists.has(path.basename(rel)))roots.add(path.basename(rel));
 }
};
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
for(const value of Object.values(pkg.scripts||{}))capture(value);
for(const name of fs.readdirSync('.github/workflows').filter(x=>/\.ya?ml$/i.test(x)))capture(fs.readFileSync(path.join('.github/workflows',name),'utf8'));
for(const suite of Object.values(QA_SUITES))for(const file of suite.files||[])if(exists.has(file))roots.add(file);

const reachable=new Set(),queue=[...roots];
while(queue.length){
 const rel=queue.shift();if(reachable.has(rel)||!exists.has(rel))continue;reachable.add(rel);
 if(!/\.(?:mjs|js)$/.test(rel))continue;
 const src=fs.readFileSync(rel,'utf8'),dir=path.posix.dirname(rel);
 for(const m of src.matchAll(/(?:import|export)\s+(?:[^'"\n]*?\s+from\s*)?['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g)){
  const spec=m[1]||m[2];if(!spec?.startsWith('.'))continue;
  const resolved=path.posix.normalize(path.posix.join(dir,spec));
  if(exists.has(resolved)&&!reachable.has(resolved))queue.push(resolved);
 }
}
const candidates=files.filter(rel=>/^e2e_.*\.spec\.mjs$/.test(path.posix.basename(rel))||/guard.*\.mjs$/.test(path.posix.basename(rel)));
const unreachable=candidates.filter(rel=>!reachable.has(rel)).sort();
assert.deepEqual(unreachable,[],`Unreachable QA files must be removed or wired into an explicit suite: ${unreachable.join(', ')}`);
const e2e=candidates.filter(x=>/^e2e_/.test(path.posix.basename(x))).length,guards=candidates.length-e2e;
console.log(`OS745 QA reachability PASS · ${guards} guards · ${e2e} E2E specs · 0 unreachable`);
