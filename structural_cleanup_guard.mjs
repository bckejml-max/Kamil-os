import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const index=read('index.html');
const app=read('js/app.js');
const runtime=read('js/viewRuntime41.js');
const registry=read('js/viewRegistry.js');
const css=read('os-canonical.css');
const sw=read('sw.js');

const views=['today','inbox','work','tickets','money','property','betting','family','home','more'];
for(const view of views)assert.match(registry,new RegExp('\\b'+view+':\\{'),`view registry missing ${view}`);
for(const host of ['todayView','inboxView','workView','ticketIntelView','moneyView','propertyView','bettingView','familyView','homeView','moreView']){
 assert.match(index,new RegExp('id="'+host+'"'),`index missing host ${host}`);
}
for(const source of [index,app,runtime,css])assert.doesNotMatch(source,/ticketsView/,'legacy ticketsView family host must stay retired');
assert.match(app,/from '\.\/viewRegistry\.js'/,'app must use canonical view registry');
assert.match(runtime,/from '\.\/viewRegistry\.js'/,'view runtime must use canonical view registry');
assert.doesNotMatch(runtime,/\bviewStyles\b|\bloadCss\b|\bensureViewStyles\b|\bstylePromises\b/,'dead lazy CSS loader must stay removed');
const eager=[...index.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map(x=>x[1]);
assert.deepEqual(eager,['./os-canonical.css'],'runtime must load one canonical stylesheet');
assert.match(css,/#familyView/,'canonical CSS must target familyView');
assert.match(app,/recordDiagnostic\('render:'/,'renderer failures must record diagnostics');
assert.match(app,/data-runtime-retry/,'renderer failure UI must expose retry');
assert.match(app,/data-runtime-copy/,'renderer failure UI must expose diagnostic copy');
assert.match(app,/writeViewToUrl/,'navigation must persist a deep link');
assert.match(app,/popstate/,'browser back\/forward must restore the active view');
assert.match(sw,/\.\/os-canonical\.css/,'service worker must cache canonical CSS');
console.log('OS740 structural cleanup guard PASS');
