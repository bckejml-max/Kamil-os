import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const allowPath=path.join(root,'scripts/numbered-runtime-allowlist.json');
const allow=new Set(JSON.parse(fs.readFileSync(allowPath,'utf8')).files||[]);
const skip=new Set(['node_modules','.git','test-results','playwright-report']);
const found=[];
function walk(dir){
 for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
  if(skip.has(ent.name))continue;
  const abs=path.join(dir,ent.name),rel=path.relative(root,abs).replaceAll('\\','/');
  if(ent.isDirectory())walk(abs);
  else if(/\d{3,}/.test(ent.name)&&/\.(?:js|css|mjs)$/.test(ent.name))found.push(rel);
 }
}
walk(root);
const added=found.filter(x=>!allow.has(x));
const stale=[...allow].filter(x=>!found.includes(x));
assert.deepEqual(added,[],`New numbered runtime patch files are forbidden. Use descriptive filenames instead: ${added.join(', ')}`);
assert.deepEqual(stale,[],`Numbered runtime allowlist contains removed files; prune it so deleted patches cannot return: ${stale.join(', ')}`);
console.log(`numbered runtime freeze PASS: ${found.length} legacy files frozen`);
