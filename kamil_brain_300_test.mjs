import fs from 'node:fs';
import assert from 'node:assert/strict';

const brain=fs.readFileSync(new URL('./js/kamilBrain300.js',import.meta.url),'utf8');
const shell=fs.readFileSync(new URL('./js/instantShell64.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('./kamilBrain300.css',import.meta.url),'utf8');

assert.match(brain,/buildKamilBrain300/,'Kamil Brain builder is missing');
assert.match(brain,/TEĎ/,'NOW zone is missing');
assert.match(brain,/POTOM/,'NEXT zone is missing');
assert.match(brain,/ČEKÁM/,'WAITING zone is missing');
assert.match(brain,/RIZIKO/,'RISK zone is missing');
assert.match(brain,/Co se změnilo/,'change feed is missing');
assert.match(brain,/data-brain-action="done"/,'done action is missing');
assert.match(brain,/data-brain-action="tomorrow"/,'follow-up/defer action is missing');
assert.match(shell,/kamilBrain300\.js/,'Kamil Brain is not wired into boot');
assert.match(css,/\.brain300/,'Kamil Brain styles are missing');

console.log('Kamil Brain 300 static guard OK');
