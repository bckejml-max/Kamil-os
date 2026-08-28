import fs from 'node:fs';
import assert from 'node:assert/strict';

const brain=fs.readFileSync(new URL('./js/kamilBrain302.js',import.meta.url),'utf8');
const inbox=fs.readFileSync(new URL('./js/universalInbox302.js',import.meta.url),'utf8');
const nav=fs.readFileSync(new URL('./js/navigation302.js',import.meta.url),'utf8');
const shell=fs.readFileSync(new URL('./js/instantShell64.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('./kamilBrain302.css',import.meta.url),'utf8');
const release=fs.readFileSync(new URL('./js/releaseMeta.js',import.meta.url),'utf8');

assert.match(brain,/installKamilBrain302/,'OS302 brain installer missing');
assert.match(brain,/data-brain-why302/,'Explain action missing');
assert.match(brain,/Proč právě tohle/,'Explain drawer missing');
assert.match(inbox,/buildUniversalInbox302/,'Universal Inbox missing');
assert.match(inbox,/urgent/,'Urgent inbox slice missing');
assert.match(nav,/Život/,'Simplified Life navigation missing');
assert.match(nav,/data-view=\\"home\\"/,'Home hiding rule missing');
assert.match(shell,/navigation302\.js/,'OS302 navigation is not booted');
assert.match(shell,/kamilBrain302\.js/,'OS302 brain is not booted');
assert.doesNotMatch(shell,/optionalImport\('\.\/kamilBrain301\.js'/,'Old brain must not boot directly');
assert.match(css,/uin302-card/,'Universal Inbox styling missing');
assert.match(release,/302\.0\.0/,'Release not bumped to 302');
console.log('Kamil OS 302 static guard OK');
