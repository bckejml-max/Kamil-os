import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const root=new URL('./',import.meta.url),read=p=>readFile(new URL(p,root),'utf8');
const [index,boot,views,today,betting,css,product,sw]=await Promise.all([read('./index.html'),read('./js/instantShell64.js'),read('./js/viewRuntime41.js'),read('./js/todayPage2000.js'),read('./js/bettingBootstrap543.js'),read('./os2.css'),read('./productReset1300.css'),read('./sw.js')]);

assert.match(index,/data-os2="1"/,'OS2 index marker missing');
const eagerStyles=[...index.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map(x=>x[1]);
assert.deepEqual(eagerStyles,['./styles.css','./os2.css','./productReset1300.css','./os1331.css','./os1332.css','./os1333.css','./os1334.css'],'OS1336 shell eager styles must be the approved canonical layers only');
assert.match(index,/\.\/styles\.css/,'base stylesheet missing');
assert.match(index,/\.\/os2\.css/,'OS2 stylesheet missing');
assert.match(index,/\.\/productReset1300\.css/,'OS1300 product reset stylesheet missing');
for(const cssName of ['os1331.css','os1332.css','os1333.css','os1334.css'])assert.match(index,new RegExp(`\\.\\/${cssName.replace('.', '\\.')}`),`${cssName} canonical layer missing`);
assert.equal(index.includes('bettingBootstrap543.js'),false,'Betting bootstrap must not be a global script');
for(const id of ['view-today','view-work','view-tickets','view-property','view-money','view-betting','view-inbox','view-family','view-home','view-more'])assert.match(index,new RegExp(`id="${id}"`),`static OS2 shell missing ${id}`);

assert.match(boot,/architecture:'os2-on-demand'/,'OS2 on-demand boot marker missing');
assert.equal((boot.match(/await import\('\.\/app\.js'\)/g)||[]).length,1,'OS2 boot must import app exactly once');
assert.equal((boot.match(/optionalImport\s*\(/g)||[]).length,0,'old optionalImport queue must remain retired');
assert.equal((boot.match(/deferredImport\s*\(/g)||[]).length,0,'old deferredImport queue must remain retired');
for(const legacy of ['todayCockpit363.js','workspaces305.js','ticketQa332.js','performance330.js','bettingBootstrap543.js'])assert.equal(boot.includes(legacy),false,`${legacy} must not eager-load in OS2`);

assert.match(views,/today:\['\.\/todayPage2000\.js','renderTodayPage2000'\]/,'OS2 Today must be canonical');
assert.match(views,/ensureViewStyles/,'view CSS loader missing');
assert.equal(views.includes('ensureInboxShell'),false,'Inbox must be static shell, not runtime DOM injection');
assert.equal(views.includes('ensureBettingShell'),false,'Betting must be static shell, not runtime DOM injection');
assert.match(views,/data-os2-lazy|dataset\.os2Lazy/,'lazy view stylesheet marker missing');

for(const symbol of ['pr1320-today','pr1320-now','pr1320-queue','__KAMIL_TODAY_OS2000__'])assert.match(today,new RegExp(symbol),`Today OS2 missing ${symbol}`);
assert.ok((today.match(/ownEvent1100\s*\(/g)||[]).length<=1,'Today OS2 should own at most one delegated UI listener');
assert.match(betting,/export function installBettingBootstrap543/,'Betting bootstrap must be explicitly view-owned');
assert.equal(betting.includes('runtimeCoordinator1050'),false,'Betting must not revive legacy global runtime');

for(const token of ['--os-bg','#0b0f14','.os2-app','.os2-sidebar','.os2-today','.os2-bottom'])assert.match(css,new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')),`OS2 CSS missing ${token}`);
assert.match(product,/data-product-reset1300|product-reset1300/,'OS1300 product reset selectors missing');
assert.match(sw,/\.\/productReset1300\.css/,'service worker must precache OS1300 product layer');
assert.match(sw,/workPage1300\.js/,'service worker must precache Work product page');
assert.match(sw,/propertyPage1300\.js/,'service worker must precache Reality product page');
console.log('OS2000/2010/737/1300 architecture guard PASS');
