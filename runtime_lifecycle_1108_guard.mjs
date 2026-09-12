import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=p=>readFile(new URL(p,import.meta.url),'utf8');
const files=[
 ['./js/platform43.js','core.platform43'],
 ['./js/bettingControl586.js','betting.control586'],
 ['./js/unifiedCommand333.js','core.unified333'],
 ['./js/audit525.js','core.audit527'],
 ['./js/marketEdgeUi32.js','market.edge32'],
 ['./js/operator717.js','operator717'],
 ['./js/todayDashboard213.js','today.dashboard213'],
 ['./js/todayCockpit363.js','today.cockpit363'],
 ['./js/directorUi34.js','director.ui34'],
 ['./js/systemDiagnostics421.js','system.diagnostics421']
];
for(const [path,owner] of files){
 const src=await read(path);
 assert.ok(src.includes("./runtimeOwnership1100.js"),`${path} must import OS1100 runtime ownership`);
 assert.ok(src.includes(owner),`${path} must use owner ${owner}`);
 assert.equal((src.match(/\bsetInterval\s*\(/g)||[]).length,0,`${path} must not use raw setInterval`);
 assert.equal((src.match(/\bnew\s+MutationObserver\s*\(/g)||[]).length,0,`${path} must not create raw MutationObserver`);
 assert.equal((src.match(/\bwindow\.addEventListener\s*\(/g)||[]).length,0,`${path} must not own raw window listeners`);
 assert.equal((src.match(/\bdocument\.addEventListener\s*\(/g)||[]).length,0,`${path} must not own raw document listeners`);
}
console.log(`OS1108 lifecycle guard PASS: ${files.length} core/UI modules stay OS1100-owned`);