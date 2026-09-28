import fs from 'node:fs';
import assert from 'node:assert/strict';

const docs=fs.readFileSync('js/documentsPage141.js','utf8');
const today=fs.readFileSync('js/todayPage2000.js','utf8');
const css=fs.readFileSync('os1500.css','utf8');
const app=fs.readFileSync('js/app.js','utf8');
const tasks=fs.readFileSync('js/tasksOverview.js','utf8');
const family=fs.readFileSync('js/familyPage140.js','utf8');
const home=fs.readFileSync('js/homePage140.js','utf8');
const property=fs.readFileSync('js/propertyPage1300.js','utf8');

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
assert.match(tasks,/top\?'<button class="pr1300-btn primary"[^>]*data-task-open/,'urgent Tasks item must outrank creating a new task');
assert.match(family,/p\?'<button class="pr1300-btn primary"[^>]*data-family1500-primary/,'current Family obligation must be primary');
assert.match(home,/data-home1500-primary/,'current Home deadline must be directly actionable');
assert.match(docs,/data-doc1500-primary>Vyřešit teď/,'current document issue must outrank new intake');
assert.match(property,/data-property-candidate="'\+best\.index\+'">Otevřít kandidáta/,'best Property candidate must be the primary action');
assert.match(app,/function revealMobileDestination\(view\)/,'mobile navigation must reveal the active destination');
assert.match(app,/updateChrome\(\);revealMobileDestination\(current\);quickShell/,'navigation must reveal the selected mobile destination');
const mobile=css.slice(css.indexOf('/* Product focus'));
assert.match(mobile,/\.os2-bottom\{[\s\S]*grid-template-columns:repeat\(5,minmax\(0,1fr\)\)!important;[\s\S]*grid-template-rows:repeat\(2,minmax\(0,1fr\)\)!important/,'mobile navigation must keep all ten primary areas visible without an Ostatní menu');
assert.match(mobile,/\.os2-bottom button\{[\s\S]*min-width:0!important/,'mobile navigation must fit the viewport without requiring horizontal discovery');

console.log('Product usability guard PASS');
