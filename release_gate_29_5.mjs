await import('./release_gate_29_4.mjs');
import fs from 'fs';
const assert=(x,m)=>{if(!x)throw new Error(m)};
const config=fs.readFileSync('js/config.js','utf8'),html=fs.readFileSync('index.html','utf8'),sw=fs.readFileSync('sw.js','utf8'),engine=fs.readFileSync('js/spendingIntelligence29.js','utf8');
assert(config.includes("APP_VERSION = '29.5.0'")&&config.includes('SCHEMA_VERSION = 41'),'release version/schema mismatch');
assert(html.includes('./js/spendingIntelligenceUi29.js'),'release shell missing Spending Intelligence UI');
assert(sw.includes('29.5.0')&&sw.includes('spendingIntelligence29.js'),'release PWA cache missing Spending Intelligence');
assert(engine.toLocaleLowerCase('cs-CZ').includes('převody se nepočítají jako spotřeba')&&engine.includes('měny se nikdy nesčítají'),'spending safety note missing');
console.log('PERSONAL AUTOPILOT 29.5 RELEASE GATE PASS');
