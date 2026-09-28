import fs from 'node:fs';
import assert from 'node:assert/strict';

const docs=fs.readFileSync('js/documentsPage141.js','utf8');
const today=fs.readFileSync('js/todayPage2000.js','utf8');
const css=fs.readFileSync('os1500.css','utf8');

assert.match(docs,/data-doc1500-advanced/,'advanced OS tooling must be behind one explicit disclosure');
const insuranceAt=docs.indexOf('<h2>Pojištění</h2>');
const recordsAt=docs.indexOf('Všechny dokumenty a údaje');
const advancedAt=docs.indexOf('data-doc1500-advanced');
assert.ok(insuranceAt>=0&&recordsAt>insuranceAt,'real document workflows must stay prominent');
assert.ok(advancedAt>recordsAt,'technical suites must come after everyday document workflows');
for(const label of ['OS Intelligence','OS Automation & Learning','OS Execution & Governance','OS Portfolio & Resilience','OS Strategy & Horizon']){
  assert.ok(docs.indexOf(label)>advancedAt,label+' must stay inside the advanced disclosure');
}
assert.match(today,/toneRank=\{bad:3,warn:2,good:1,'':0\}/,'Today must prioritize bad/warn areas before healthy areas');
assert.match(today,/problémy první · vše na jeden klik/,'Today must explain the priority ordering');
assert.match(css,/Product calm mode/,'calm product override must stay present');
assert.match(css,/\.os1500-advanced-tools/,'advanced tooling needs a quiet disclosure style');
const mobile=css.slice(css.lastIndexOf('@media(max-width:760px)'));
assert.match(mobile,/\.os2-bottom\{[\s\S]*height:68px!important;[\s\S]*display:flex!important;[\s\S]*overflow-x:auto!important;/,'mobile navigation must be one horizontally scrollable row');
assert.doesNotMatch(mobile,/grid-template-rows:repeat\(2/,'final mobile override must not restore a two-row nav');

console.log('Product usability guard PASS');
