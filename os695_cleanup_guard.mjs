import fs from 'node:fs';
import assert from 'node:assert/strict';

const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8');
const release=read('./js/releaseMeta.js');
const shell=read('./js/personalShell640.js');
const more=read('./js/personalMore640.js');
const today=read('./js/todayPage101.js');
const pkg=JSON.parse(read('./package.json'));

assert.ok(release.includes("APP_VERSION='695.0.0'"),'OS695 release identity missing');
assert.equal(pkg.version,'695.0.0','package version must match OS695');
for(const view of ['today','inbox','tickets','money'])assert.ok(shell.includes(`'${view}'`),`mobile primary navigation missing ${view}`);
assert.ok(shell.includes('data-personal-more'),'mobile primary navigation missing More');
for(const view of ['family','home','betting','documents'])assert.ok(more.includes(`value:'${view}'`),`More is missing secondary area ${view}`);
for(let version=111;version<=131;version++)assert.ok(!today.includes(`./os${version}.js`),`legacy Today addon os${version} returned`);
for(const path of ['./dataTrust163.js','./executiveCommand164.js','./os181Suite.js','./os181Final.js'])assert.ok(today.includes(path),`canonical Today addon missing ${path}`);
assert.ok(today.includes('__KAMIL_TODAY_695__'),'OS695 Today health marker missing');
console.log('OS695 CLEANUP GUARD PASS');
