import assert from 'node:assert/strict';
import fs from 'node:fs';

const css=fs.readFileSync('os-canonical.css','utf8');
const baseline=JSON.parse(fs.readFileSync('scripts/css-conflict-baseline.json','utf8')).duplicates||{};
const counts=new Map();
for(const m of css.matchAll(/([^{}]+)\{[^{}]*\}/g)){
 const raw=m[1].trim();
 if(raw.startsWith('@')||raw.includes('/*'))continue;
 for(const sel of raw.split(',').map(x=>x.trim()).filter(Boolean)){
  if(/^(\.os2-|\.(?:os1400|os1500|os1600)-|\.pr13\d\d-|#familyView|#todayView|#moneyView|#ticketIntelView)/.test(sel))counts.set(sel,(counts.get(sel)||0)+1);
 }
}
const duplicates=Object.fromEntries([...counts].filter(([,n])=>n>1));
const newDup=Object.entries(duplicates).filter(([sel])=>!(sel in baseline));
const increased=Object.entries(duplicates).filter(([sel,n])=>sel in baseline&&n>baseline[sel]);
assert.deepEqual(newDup,[],`New critical CSS selector duplication detected: ${newDup.map(([s,n])=>s+' x'+n).join(', ')}`);
assert.deepEqual(increased,[],`Critical CSS duplicate count increased: ${increased.map(([s,n])=>s+' '+baseline[s]+'→'+n).join(', ')}`);
console.log(`canonical CSS conflict audit PASS · ${counts.size} critical selectors · ${Object.keys(duplicates).length} tolerated legacy duplicates`);
