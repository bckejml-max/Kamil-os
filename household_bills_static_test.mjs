import fs from 'node:fs';
for(const f of ['js/householdBills25.js','js/householdBillsUi25.js'])if(!fs.existsSync(f))throw new Error('Missing '+f);
const core=fs.readFileSync('js/householdBills25.js','utf8'),ui=fs.readFileSync('js/householdBillsUi25.js','utf8'),html=fs.readFileSync('index.html','utf8'),sw=fs.readFileSync('sw.js','utf8');
for(const x of ['householdBills','nextBillDue','BILL_CATEGORIES','costs','manualDue7'])if(!core.includes(x))throw new Error('Household Bills core missing '+x);
for(const x of ['HOUSEHOLD BILLS / 25.15','Platby domácnosti','Zaplaceno','data-bill-paid','NÁKLADY PO MĚNÁCH'])if(!ui.includes(x))throw new Error('Household Bills UI missing '+x);
if(!html.includes('js/householdBillsUi25.js'))throw new Error('Household Bills UI not loaded by shell');
for(const x of ['js/householdBills25.js','js/householdBillsUi25.js'])if(!sw.includes(x))throw new Error('PWA cache missing '+x);
if(!core.includes("x.category==='SUBSCRIPTION'")||!core.includes("x.currency"))throw new Error('Household Bills source/currency guard missing');
console.log('HOUSEHOLD BILLS STATIC OK');
