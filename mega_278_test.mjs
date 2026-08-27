import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');const assert=(ok,msg)=>{if(!ok)throw new Error(msg)};
const ux=read('js/uxFoundation238.js'),daily=read('js/dailyCommander248.js'),fin=read('js/financeCommand258.js'),tic=read('js/ticketCommand268.js'),auto=read('js/managerAutopilot278.js'),boot=read('js/instantShell64.js'),rel=read('js/releaseMeta.js'),sw=read('sw.js');
// OS229-238
for(const marker of ['Command Palette','openQuickAdd','kamil-os-last-view-232','e.altKey','kamil-os-density-236','kamil:detail-drawer'])assert(ux.includes(marker),`UX marker missing: ${marker}`);
assert(read('uxFoundation238.css').includes('.main-nav button:hover'),'sidebar/visual polish missing');
// OS239-248
for(const marker of ['morning','evening','radar','waiting','snoozeTo','top3','dailyScore','weekly'])assert(daily.includes(marker),`Daily marker missing: ${marker}`);
// OS249-258
for(const marker of ['netWorth','forecast','deployable','concentration','review','timeline'])assert(fin.includes(marker),`Finance marker missing: ${marker}`);
assert(fin.includes('neprovádí automatické obchody'),'finance execution guardrail missing');
// OS259-268
for(const marker of ['invested','projected','opportunities','sellTiming','history','rotation','perf','guardrails'])assert(tic.includes(marker),`Ticket marker missing: ${marker}`);
assert(tic.includes('resaleAllowed===true')&&tic.includes('transferCompatible===true'),'ticket compliance gate missing');
assert(tic.includes('autoExecute:false')&&tic.includes('netPayoutRequired:true'),'ticket autopilot guardrails missing');
// OS269-278
for(const marker of ['monthlyClosing','riskRadar','zlTracker','timeline','notificationBrain','top3','backup','guardrails'])assert(auto.includes(marker),`Autopilot marker missing: ${marker}`);
assert(auto.includes('Koncepty faktur vydaných')&&auto.includes('Fakturace na dodavatele'),'monthly manager deadlines missing');
assert(auto.includes('autoMutate:false')&&auto.includes('financialExecution:false')&&auto.includes('ticketExecution:false'),'OS278 confirmation guardrails missing');
for(const file of ['./uxFoundation238.js','./dailyCommander248.js','./financeCommand258.js','./ticketCommand268.js','./managerAutopilot278.js'])assert(boot.includes(file),`boot missing ${file}`);
assert(rel.includes("278.0.0"),'release not OS278');assert(sw.includes('kamil-os-278.0.0-core-r1'),'OS278 cache missing');
for(const f of ['uxFoundation238.css','dailyCommander248.css','financeCommand258.css','ticketCommand268.css','managerAutopilot278.css'])assert(sw.includes(f),`cache missing ${f}`);
console.log('OS229-278 mega regression OK');
