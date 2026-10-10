import assert from 'node:assert/strict';
import fs from 'node:fs';
import {QA_SHARED,QA_SUITES} from './qa-suites.mjs';

const read=p=>fs.readFileSync(p,'utf8');
const pkg=JSON.parse(read('package.json'));
const ticket=read('.github/workflows/qa.yml');
const control=read('.github/workflows/os1047-control-operations.yml');
const browser=read('.github/workflows/os333-browser.yml');
const production=read('.github/workflows/vercel-production-333.yml');
const desktop=read('.github/workflows/desktop.yml');
const desktopMain=read('desktop/main.cjs');
const desktopPrep=read('desktop/scripts/prepare-web.cjs');
const workflows=[ticket,control,browser,production];

assert.equal((workflows.join('\n').match(/npm run test:release/g)||[]).length,1,'CI budget: exactly one workflow may own the full release suite');
assert.equal((browser.match(/npm run test:release/g)||[]).length,1,'CI budget: canonical browser workflow must own the full release suite');
for(const [name,source] of [['ticket',ticket],['control',control],['production',production]])assert.doesNotMatch(source,/npm run test:release/,'CI budget: '+name+' workflow must not duplicate the full release suite');

for(const [name,source] of [['ticket',ticket],['control',control],['browser',browser],['production',production]]){
 assert.match(source,/concurrency:/,'CI budget: '+name+' workflow needs concurrency cancellation');
 assert.match(source,/cancel-in-progress:\s*true/,'CI budget: '+name+' workflow must cancel superseded runs');
}
assert.match(ticket,/pull_request:[\s\S]*paths:/,'CI budget: ticket QA must be affected-file scoped');
assert.match(control,/pull_request:[\s\S]*paths:/,'CI budget: control QA must be affected-file scoped');
assert.doesNotMatch(ticket,/playwright install|npm run test:e2e|npx playwright/,'CI budget: ticket QA stays browser-free');
assert.doesNotMatch(control,/playwright install|npm run test:e2e|npx playwright/,'CI budget: control QA stays browser-free');
assert.doesNotMatch(control,/os2\.css|os2010\.css|os2020\.css/,'CI budget: control paths must not revive retired CSS layers');
assert.match(browser,/npm ci/,'CI budget: canonical browser installs locked dependencies');
assert.match(browser,/npm run test:e2e/,'CI budget: canonical browser owns the full browser suite');
assert.match(production,/npm run test:structural/,'CI budget: production source guard keeps structural integrity');
assert.match(production,/pull_request:/,'CI budget: production source guard must run before merge');
assert.match(desktop,/push:[\s\S]*branches:\s*\[main\]/,'CI budget: desktop release must originate from main push');
assert.match(desktop,/Require successful canonical QA for this exact commit/,'CI budget: desktop publish must gate on canonical QA');
assert.match(desktop,/head_sha=\"?\$\{GITHUB_SHA\}|head_sha=.*GITHUB_SHA/,'CI budget: desktop gate must bind QA to the exact main SHA');
assert.match(desktop,/Kamil OS Canonical Release \+ Browser QA/,'CI budget: desktop gate must require the canonical browser workflow');
assert.match(desktop,/\[ \"\$conclusion\" = \"success\" \]/,'CI budget: desktop publish must require a successful canonical conclusion');
assert.match(desktop,/KAMIL_DESKTOP_BUILD/,'CI budget: desktop releases need a unique monotonic build version');
assert.match(desktop,/git tag \$tag \$env:GITHUB_SHA/,'CI budget: desktop release must pre-create a tag for the exact tested SHA');
assert.match(desktop,/git push origin "refs\/tags\/\$tag"/,'CI budget: desktop release tag must be pushed before publishing');
assert.match(desktop,/git ls-remote --tags origin/,'CI budget: desktop publisher must verify an existing tag before reuse');
assert.match(desktop,/--publish never/,'CI budget: electron-builder must not race GitHub release creation');
assert.match(desktop,/gh release create \$tag[\s\S]*--draft/,'CI budget: desktop publisher must create one draft release');
assert.match(desktop,/gh release upload \$tag \$exe \$blockmap \$latest/,'CI budget: desktop publisher must upload installer, blockmap, and latest metadata together');
assert.match(desktop,/gh release view \$tag[\s\S]*--json assets/,'CI budget: desktop publisher must verify release assets before publish');
assert.match(desktop,/gh release edit \$tag[\s\S]*--draft=false[\s\S]*--latest/,'CI budget: desktop release may publish only after complete asset verification');
assert.match(desktopMain,/data-view=\\\"inbox\\\"/,'CI budget: desktop Inbox shortcut must target canonical inbox');
assert.match(desktopPrep,/KAMIL_DESKTOP_BUILD/,'CI budget: desktop prepare step must derive release version from canonical OS version');
assert.match(pkg.scripts['test:runtime'],/run-qa-suite\.mjs runtime/,'CI budget: runtime suite must route through manifest runner');
assert.match(pkg.scripts['test:release'],/run-qa-suite\.mjs release/,'CI budget: release suite must route through manifest runner');

for(const [name,suite] of Object.entries(QA_SUITES)){
 assert.equal(new Set(suite.files).size,suite.files.length,'CI budget: duplicate file in '+name+' QA suite');
 for(const file of suite.files)assert.ok(fs.existsSync(file),'CI budget: missing '+name+' QA file '+file);
}
for(const file of QA_SHARED)assert.ok(QA_SUITES.release.files.includes(file),'CI budget: release must include shared runtime guard '+file);
assert.ok(QA_SUITES.release.files.length>QA_SUITES.runtime.files.length,'CI budget: release suite must be a strict superset of runtime guards');

console.log('OS744 CI budget PASS · one full release owner · affected ticket/control QA · manifest-driven suites');
