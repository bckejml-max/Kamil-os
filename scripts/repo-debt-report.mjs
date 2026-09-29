import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root=process.cwd(),skip=new Set(['node_modules','.git','test-results','playwright-report','.vercel']);
const rows=[];
function walk(dir){for(const ent of fs.readdirSync(dir,{withFileTypes:true})){if(skip.has(ent.name))continue;const abs=path.join(dir,ent.name),rel=path.relative(root,abs).replaceAll('\\','/');if(ent.isDirectory())walk(abs);else rows.push({path:rel,size:fs.statSync(abs).size})}}
walk(root);
const report={
 version:JSON.parse(fs.readFileSync('package.json','utf8')).version,
 totalFiles:rows.length,
 js:rows.filter(x=>x.path.endsWith('.js')).length,
 mjs:rows.filter(x=>x.path.endsWith('.mjs')).length,
 css:rows.filter(x=>x.path.endsWith('.css')).length,
 e2e:rows.filter(x=>/^e2e_.*\.spec\.mjs$/.test(path.basename(x.path))).length,
 guards:rows.filter(x=>/guard.*\.mjs$/.test(path.basename(x.path))).length,
 numberedRuntime:rows.filter(x=>/\d{3,}/.test(path.basename(x.path))&&/\.(?:js|css|mjs)$/.test(x.path)).length,
 canonicalCssBytes:rows.find(x=>x.path==='os-canonical.css')?.size||0
};
const output=JSON.stringify(report,null,2)+'\n';
if(process.argv.includes('--check')){assert.equal(fs.readFileSync('repo-health.json','utf8'),output,'repo-health.json is stale; run npm run build:repo-health');console.log('repo health snapshot PASS · '+report.totalFiles+' files')}else{fs.writeFileSync('repo-health.json',output);console.log('repo health snapshot updated')}
