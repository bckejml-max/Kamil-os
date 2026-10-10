import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const sources=[];
function walk(dir){
 for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
  const abs=path.join(dir,ent.name);
  if(ent.isDirectory())walk(abs);
  else if(ent.name.endsWith('.js'))sources.push(abs);
 }
}
walk(path.join(root,'js'));

const refs=[];
for(const file of sources){
 const source=fs.readFileSync(file,'utf8');
 const relSource=path.relative(root,file).replaceAll('\\','/');
 for(const match of source.matchAll(/['"`](\.\/[^'"`]+\.css)['"`]/g)){
  const href=match[1];
  const target=path.join(root,href.slice(2));
  refs.push({source:relSource,href,target:path.relative(root,target).replaceAll('\\','/')});
 }
}
const missing=refs.filter(x=>!fs.existsSync(x.target));
assert.deepEqual(missing,[],`Runtime stylesheet references must resolve to real files: ${missing.map(x=>x.source+' -> '+x.href).join(', ')}`);
console.log(`runtime style integrity PASS · ${refs.length} stylesheet references resolve`);
