import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const normalize=p=>p.replaceAll('\\','/');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const registry=read('js/viewRegistry.js');
const seeds=new Set(['js/app.js',...Array.from(registry.matchAll(/module:\s*['"]\.\/(.+?\.js)['"]/g),m=>'js/'+m[1])]);
const reachable=new Set(),queue=[...seeds],missing=[];

while(queue.length){
 const rel=queue.shift();
 if(reachable.has(rel))continue;
 const abs=path.join(root,rel);
 if(!fs.existsSync(abs)){missing.push(rel);continue}
 reachable.add(rel);
 const source=fs.readFileSync(abs,'utf8'),base=path.dirname(rel);
 const specs=[
  ...Array.from(source.matchAll(/\b(?:import|export)\s+(?:[^'"]*?\s+from\s*)?['"](\.\/[^'"]+\.js)['"]/g),m=>m[1]),
  ...Array.from(source.matchAll(/\bimport\(\s*['"](\.\/[^'"]+\.js)['"]\s*\)/g),m=>m[1])
 ];
 for(const spec of specs){
  const next=normalize(path.normalize(path.join(base,spec)));
  if(next.startsWith('js/')&&!reachable.has(next))queue.push(next);
 }
}
assert.deepEqual(missing,[],'OS747 runtime graph must not reference missing JS modules');
const bytes=[...reachable].reduce((n,p)=>n+fs.statSync(path.join(root,p)).size,0);
const cssBytes=fs.statSync(path.join(root,'os-canonical.css')).size;
assert.ok(reachable.size<=170,`OS747 reachable runtime grew past 170 modules: ${reachable.size}`);
assert.ok(bytes<=2500000,`OS747 reachable JS grew past 2.5 MB: ${bytes}`);
assert.ok(cssBytes<=180000,`OS747 canonical CSS grew past 180 KB: ${cssBytes}`);
const allJs=[];
for(const ent of fs.readdirSync(path.join(root,'js'),{withFileTypes:true}))if(ent.isFile()&&ent.name.endsWith('.js'))allJs.push('js/'+ent.name);
const unreachable=allJs.filter(x=>!reachable.has(x));
console.log(`OS747 runtime budget PASS · ${reachable.size} reachable modules · ${Math.round(bytes/1024)} KB JS · ${Math.round(cssBytes/1024)} KB CSS · ${unreachable.length} top-level legacy/unreachable modules`);
