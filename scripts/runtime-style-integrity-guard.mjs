import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const normalize=p=>p.replaceAll('\\','/');
const registry=fs.readFileSync(path.join(root,'js/viewRegistry.js'),'utf8');
const seeds=new Set(['js/app.js',...Array.from(registry.matchAll(/module:\s*['"]\.\/(.+?\.js)['"]/g),m=>'js/'+m[1])]);
const reachable=new Set();
const queue=[...seeds];

while(queue.length){
 const rel=queue.shift();
 if(reachable.has(rel))continue;
 const abs=path.join(root,rel);
 if(!fs.existsSync(abs))continue;
 reachable.add(rel);
 const source=fs.readFileSync(abs,'utf8');
 const base=path.dirname(rel);
 const imports=[
  ...Array.from(source.matchAll(/\b(?:import|export)\s+(?:[^'"]*?\s+from\s*)?['"](\.\/[^'"]+\.js)['"]/g),m=>m[1]),
  ...Array.from(source.matchAll(/\bimport\(\s*['"](\.\/[^'"]+\.js)['"]\s*\)/g),m=>m[1])
 ];
 for(const spec of imports){
  const next=normalize(path.normalize(path.join(base,spec)));
  if(next.startsWith('js/')&&!reachable.has(next))queue.push(next);
 }
}

const refs=[];
for(const relSource of reachable){
 const source=fs.readFileSync(path.join(root,relSource),'utf8');
 for(const match of source.matchAll(/['"`](\.\/[^'"`]+\.css)['"`]/g)){
  const href=match[1],target=path.join(root,href.slice(2));
  refs.push({source:relSource,href,target:path.relative(root,target).replaceAll('\\','/')});
 }
}
const missing=refs.filter(x=>!fs.existsSync(x.target));
assert.deepEqual(missing,[],`Reachable runtime stylesheet references must resolve to real files: ${missing.map(x=>x.source+' -> '+x.href).join(', ')}`);
console.log(`runtime style integrity PASS · ${reachable.size} reachable modules · ${refs.length} stylesheet references resolve`);
