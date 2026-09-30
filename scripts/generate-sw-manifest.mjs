import fs from 'node:fs';
import assert from 'node:assert/strict';
import {VIEW_ORDER,VIEW_REGISTRY} from '../js/viewRegistry.js';

const base=[
 './','./index.html','./manifest.webmanifest','./os-canonical.css',
 './js/osHardening1110.js','./js/dataIntegrity1130.js','./js/instantShell64.js','./js/app.js','./js/releaseMeta.js','./js/config.js',
 './js/state.js','./js/utils.js',
 './js/viewRegistry.js','./js/diagnostics.js','./js/viewRuntime41.js','./js/runtimeOwnership1100.js'
];
const extras=['./js/propertyHub620.js','./js/cloud.js','./js/authUx32.js','./js/perf41.js','./js/coldPartition42.js'];
export const criticalAssets=()=>[...new Set([...base,...VIEW_ORDER.map(v=>'./js/'+VIEW_REGISTRY[v].module.replace('./','')),...extras])];

const file=new URL('../sw.js',import.meta.url);
const source=fs.readFileSync(file,'utf8');
const nextBlock='const CRITICAL='+JSON.stringify(criticalAssets(),null,1).replace(/\n/g,'\n')+';';
const re=/const CRITICAL=\[[\s\S]*?\];/;
assert.match(source,re,'sw.js CRITICAL block missing');
if(process.argv.includes('--check')){
 const current=source.match(re)?.[0]||'';
 assert.equal(current,nextBlock,'sw.js CRITICAL manifest is stale; run npm run build:sw-manifest');
 console.log('service worker manifest PASS · '+criticalAssets().length+' critical assets');
}else{
 fs.writeFileSync(file,source.replace(re,nextBlock));
 console.log('service worker manifest updated · '+criticalAssets().length+' critical assets');
}
