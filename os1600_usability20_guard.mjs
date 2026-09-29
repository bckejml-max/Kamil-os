import fs from 'node:fs';
import assert from 'node:assert/strict';

const index=fs.readFileSync('index.html','utf8');
const app=fs.readFileSync('js/app.js','utf8');
const today=fs.readFileSync('js/todayPage2000.js','utf8');
const work=fs.readFileSync('js/workPage1300.js','utf8');
const css=fs.readFileSync('os-canonical.css','utf8');
const registry=fs.readFileSync('js/viewRegistry.js','utf8');

const checks=[
 ()=>assert.match(registry,/today:\{title:'Dnes'[\s\S]*work:\{title:'Práce'[\s\S]*tickets:\{title:'Vstupenky'/s,'1 page titles use calm sentence case'),
 ()=>assert.match(app,/current==='today'\?new Date\(\)\.toLocaleDateString/,'2 date is shown only on Today'),
 ()=>assert.match(app,/setAttribute\('aria-label',`Rychle přidat/,'3 quick add has contextual accessible label'),
 ()=>assert.match(index,/placeholder="Co chceš udělat\?"/,'4 command placeholder is short'),
 ()=>assert.match(index,/id="commandGo" aria-label="Spustit příkaz" title="Spustit">→/,'5 command submit is compact and accessible'),
 ()=>{assert.match(work,/Čekám:/,'6 Work uses Czech waiting label');assert.doesNotMatch(work,/Waiting For/,'6 no English Waiting For remains in Work')},
 ()=>assert.match(today,/class="os1600-next /,'7 Today has one primary next-step surface'),
 ()=>assert.match(today,/class="os1600-section os1600-later"/,'8 secondary work is separated into Potom'),
 ()=>assert.match(today,/later=items\.slice\(1,5\)/,'9 secondary queue is capped at four'),
 ()=>assert.match(today,/label:'Čekám'/,'10 Today summary uses Czech waiting label'),
 ()=>assert.match(today,/label:'Do 48 h'/,'11 Today summary exposes near-term load'),
 ()=>assert.match(today,/due48=\[\.\.\.d\.urgentTasks,\.\.\.d\.calendar\]/,'12 near-term load combines tasks and calendar'),
 ()=>assert.match(today,/class="os1400-row os1600-calendar-row" data-today1300-nav/,'13 calendar rows are directly clickable'),
 ()=>assert.match(today,/const route=tomorrowRoute\(x\)/,'14 calendar rows route to the relevant area'),
 ()=>assert.match(today,/const areaIcon1600=\{inbox:'✓'/,'15 areas have fast-scan icons'),
 ()=>assert.match(css,/\.os1600-area\{min-height:78px!important/,'16 area cards are compact'),
 ()=>assert.match(css,/\.os1600-area\.good\{background:#0e141b\}/,'17 healthy areas are visually quieter'),
 ()=>assert.match(css,/\.os2-bottom button\[data-nav-badge\]:after/,'18 mobile navigation renders urgency badges'),
 ()=>assert.match(css,/\.os2-chip\.sync\{width:30px!important/,'19 mobile sync status is compact'),
 ()=>assert.match(css,/\.os2-command-shortcut\{display:none!important/,'20 mobile command shortcut noise is hidden')
];
for(const check of checks)check();
assert.equal(checks.length,20);
console.log('OS1600 usability batch 1: 20/20 PASS');
