import fs from 'node:fs';
for(const f of ['js/projectMoney25.js','js/projectMoneyUi25.js','project_money_test.mjs'])if(!fs.existsSync(f))throw new Error('Missing '+f);
const html=fs.readFileSync('index.html','utf8'),sw=fs.readFileSync('sw.js','utf8'),cfg=fs.readFileSync('js/config.js','utf8'),engine=fs.readFileSync('js/projectMoney25.js','utf8'),ui=fs.readFileSync('js/projectMoneyUi25.js','utf8');
for(const x of ['25.12.0'])if(!cfg.includes(x)||!html.includes(x)||!sw.includes(x))throw new Error('25.12 version mismatch');
for(const x of ['projectMoney25.js','projectMoneyUi25.js'])if(!sw.includes(x))throw new Error('PWA missing '+x);
if(!html.includes('projectMoneyUi25.js'))throw new Error('Project Money UI not mounted');
for(const x of ['projectMoney','pendingClaims','receivable','unbilled','projectMoneyNote'])if(!engine.includes(x))throw new Error('Project Money engine missing '+x);
for(const x of ['PROJECT MONEY / 25.12','data-pm-edit','Prázdné pole zůstane neznámé'])if(!ui.includes(x))throw new Error('Project Money UI missing '+x);
console.log('project money static OK');
