import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const root=new URL('./',import.meta.url),read=p=>readFile(new URL(p,root),'utf8');
const [index,boot,views,today,betting,css,convergence,visual,sw]=await Promise.all([read('./index.html'),read('./js/instantShell64.js'),read('./js/viewRuntime41.js'),read('./js/todayPage2000.js'),read('./js/bettingBootstrap543.js'),read('./os2.css'),read('./os2010.css'),read('./os737.css'),read('./sw.js')]);

assert.match(index,/data-os2="1"/,'OS2 index marker missing');
assert.equal((index.match(/rel="stylesheet"/g)||[]).length,4,'OS2 index may eager-load only base + OS2 + convergence + OS737 visual CSS');
assert.match(index,/\.\/styles\.css/,'base stylesheet missing');
assert.match(index,/\.\/os2\.css/,'OS2 stylesheet missing');
assert.match(index,/\.\/os2010\.css/,'OS2010 convergence stylesheet missing');
assert.match(index,/\.\/os737\.css/,'OS737 visual stylesheet missing');
assert.equal(index.includes('bettingBootstrap543.js'),false,'Betting bootstrap must not be a global script');
for(const id of ['view-today','view-inbox','view-tickets','view-betting','view-money','view-family','view-home','view-more'])assert.match(index,new RegExp(`id="${id}"`),`static OS2 shell missing ${id}`);

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

for(const symbol of ['os2-welcome','os2-now','os2-kpis','__KAMIL_TODAY_OS2000__'])assert.match(today,new RegExp(symbol),`Today OS2 missing ${symbol}`);
assert.ok((today.match(/ownEvent1100\s*\(/g)||[]).length<=1,'Today OS2 should own at most one delegated UI listener');
assert.match(betting,/export function installBettingBootstrap543/,'Betting bootstrap must be explicitly view-owned');
assert.equal(betting.includes('runtimeCoordinator1050'),false,'Betting must not revive legacy global runtime');

for(const token of ['--os-bg','#0b0f14','.os2-app','.os2-sidebar','.os2-today','.os2-bottom'])assert.match(css,new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')),`OS2 CSS missing ${token}`);
for(const token of ['--os2-content','visual convergence','#ticketIntelView','#bettingView','#moneyView','#inboxView','overscroll-behavior-inline'])assert.match(convergence,new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i'),`OS2010 convergence CSS missing ${token}`);
for(const token of ['--os-sidebar:248px','#ticketIntelView','#bettingView','#moneyView','#inboxView','.os2-bottom'])assert.match(visual,new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i'),`OS737 visual CSS missing ${token}`);
assert.match(sw,/\.\/os2010\.css/,'service worker must precache OS2010 convergence layer');
assert.match(sw,/\.\/os737\.css/,'service worker must precache OS737 visual layer');
console.log('OS2000/2010/737 architecture guard PASS');
