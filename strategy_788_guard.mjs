import fs from 'node:fs';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';
const read=p=>fs.readFileSync(p,'utf8');execFileSync(process.execPath,['--check','js/strategy788.js'],{stdio:'pipe'});
const m=read('js/strategy788.js'),css=read('strategy788.css'),legacy=read('js/oneOS977.js'),release=read('js/releaseMeta.js'),pkg=JSON.parse(read('package.json'));
for(const token of ['buildStrategy788','smartMergePreview749','importDiff751','universalAnswer786','recordStrategyDecision788','noInventedExternalRates:true','noAutoFinancialExecution:true','canonicalSourcesOnly:true'])assert.ok(m.includes(token),`missing ${token}`);
for(const token of ['OS739–753','OS754–761','OS762–767','OS768–773','OS774–778','OS779–785','OS786–788'])assert.ok(m.includes(token),`missing range ${token}`);
assert.ok(css.includes('[data-strategy788]'),'strategy css missing');
for(const token of ["strategy:['./strategy788.js','openStrategy788']",'Strategy & Control · OS788','Pokročilé / legacy'])assert.ok(legacy.includes(token),`Strategy gateway missing ${token}`);
const version=release.match(/APP_VERSION='([^']+)'/)?.[1]||'',major=Number(version.split('.')[0]||0);assert.ok(major>=788,`release ${version||'unknown'} predates Strategy OS788`);assert.equal(pkg.version,version,'package/release version mismatch');assert.ok(String(pkg.scripts?.['test:release']||'').includes('strategy_788_guard.mjs'),'release chain missing OS788 guard');
console.log(`OS788 STRATEGY GUARD PASS · ${version} · gateway OS977`);