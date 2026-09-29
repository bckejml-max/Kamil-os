import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const root=new URL('./',import.meta.url),read=p=>readFile(new URL(p,root),'utf8');
const [index,boot,views,registry,today,betting,css,product,sw]=await Promise.all([read('./index.html'),read('./js/instantShell64.js'),read('./js/viewRuntime41.js'),read('./js/viewRegistry.js'),read('./js/todayPage2000.js'),read('./js/bettingBootstrap543.js'),read('./os-canonical.css'),read('./os-canonical.css'),read('./sw.js')]);

assert.match(index,/data-os2="1"/,'OS2 index marker missing');
const eagerStyles=[...index.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map(x=>x[1]);
assert.deepEqual(eagerStyles,['./os-canonical.css'],'runtime must load exactly one canonical stylesheet');
assert.match(index,/\.\/os-canonical\.css/,'canonical stylesheet missing');
for(const legacyCss of ['styles.css','os2.css','productReset1300.css','os1331.css','os1332.css','os1333.css','os1334.css','os1400.css','os1500.css'])assert.equal(eagerStyles.includes('./'+legacyCss),false,`${legacyCss} must not be eager-loaded directly`);
assert.equal(index.includes('bettingBootstrap543.js'),false,'Betting bootstrap must not be a global script');
for(const id of ['view-today','view-work','view-tickets','view-property','view-money','view-betting','view-inbox','view-family','view-home','view-more'])assert.match(index,new RegExp(`id="${id}"`),`static OS2 shell missing ${id}`);

assert.match(boot,/architecture:'os2-on-demand'/,'OS2 on-demand boot marker missing');
assert.equal((boot.match(/await import\('\.\/app\.js'\)/g)||[]).length,1,'OS2 boot must import app exactly once');
assert.equal((boot.match(/optionalImport\s*\(/g)||[]).length,0,'old optionalImport queue must remain retired');
assert.equal((boot.match(/deferredImport\s*\(/g)||[]).length,0,'old deferredImport queue must remain retired');
for(const legacy of ['todayCockpit363.js','workspaces305.js','ticketQa332.js','performance330.js','bettingBootstrap543.js'])assert.equal(boot.includes(legacy),false,`${legacy} must not eager-load in OS2`);

assert.match(registry,/today:\{title:'Dnes',host:'todayView'[\s\S]*module:'\.\/todayPage2000\.js',renderer:'renderTodayPage2000'/,'OS2 Today must be canonical');
assert.equal(views.includes('ensureViewStyles'),false,'retired view CSS loader must stay removed');
assert.equal(views.includes('loadCss'),false,'retired lazy CSS loader must stay removed');
assert.equal(views.includes('dataset.os2Lazy'),false,'retired lazy CSS marker must stay removed');
assert.equal(views.includes('ensureInboxShell'),false,'Inbox must be static shell, not runtime DOM injection');
assert.equal(views.includes('ensureBettingShell'),false,'Betting must be static shell, not runtime DOM injection');

for(const symbol of ['os1400-home','os1600-next','os1600-areas','os1400-list','__KAMIL_TODAY_OS2000__'])assert.match(today,new RegExp(symbol),`Today product cockpit missing ${symbol}`);
assert.ok((today.match(/ownEvent1100\s*\(/g)||[]).length<=1,'Today OS2 should own at most one delegated UI listener');
assert.match(betting,/export function installBettingBootstrap543/,'Betting bootstrap must be explicitly view-owned');
assert.equal(betting.includes('runtimeCoordinator1050'),false,'Betting must not revive legacy global runtime');

for(const token of ['--os-bg','#0b0f14','.os2-app','.os2-sidebar','.os2-today','.os2-bottom'])assert.match(css,new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')),`OS2 CSS missing ${token}`);
assert.match(product,/data-product-reset1300|product-reset1300/,'OS1300 product reset selectors missing');
assert.match(sw,/\.\/os-canonical\.css/,'service worker must precache canonical stylesheet');
assert.match(sw,/workPage1300\.js/,'service worker must precache Work product page');
assert.match(sw,/propertyPage1300\.js/,'service worker must precache Reality product page');
console.log('OS2000/2010/737/1300/1400 architecture guard PASS');
