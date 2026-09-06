import fs from 'node:fs';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';
const read=p=>fs.readFileSync(p,'utf8');execFileSync(process.execPath,['--check','js/strategy788.js'],{stdio:'pipe'});
const m=read('js/strategy788.js'),css=read('strategy788.css'),more=read('js/personalMore640.js'),release=read('js/releaseMeta.js'),pkg=read('package.json');
for(const token of ['buildStrategy788','smartMergePreview749','importDiff751','universalAnswer786','recordStrategyDecision788','noInventedExternalRates:true','noAutoFinancialExecution:true','canonicalSourcesOnly:true'])assert.ok(m.includes(token),`missing ${token}`);
for(const token of ['OS739–753','OS754–761','OS762–767','OS768–773','OS774–778','OS779–785','OS786–788'])assert.ok(m.includes(token),`missing range ${token}`);
assert.ok(css.includes('[data-strategy788]'),'strategy css missing');assert.ok(more.includes("import('./strategy788.js')"),'Strategy must be lazy loaded from More');
assert.ok(release.includes("APP_VERSION='737.0.0'"),'stable release identity must remain 737.0.0');assert.ok(pkg.includes('strategy_788_guard.mjs'),'release chain missing OS788 guard');
console.log('OS788 STRATEGY GUARD PASS');