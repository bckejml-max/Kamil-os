import fs from 'node:fs';
const fail=m=>{console.error(`OS333+ release guard: ${m}`);process.exitCode=1};
const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8');
const release=read('./js/releaseMeta.js'),boot=read('./js/instantShell64.js'),mod=read('./js/unifiedCommand333.js'),resilience=read('./js/os333Resilience.js'),css=read('./os333.css'),pkg=JSON.parse(read('./package.json'));
const releaseVersion=release.match(/APP_VERSION='([^']+)'/)?.[1]||'';
const releaseMajor=Number(releaseVersion.split('.')[0]||0);
if(releaseMajor<333)fail(`releaseMeta ${releaseVersion||'unknown'} predates canonical OS333`);
if(pkg.version!==releaseVersion)fail(`package version ${pkg.version} does not match releaseMeta ${releaseVersion}`);
for(const path of ['./unifiedCommand333.js','./os333Resilience.js'])if(!boot.includes(path))fail(`OS333 boot missing ${path}`);
if(releaseMajor>=334&&!boot.includes("./focusRadar334.js"))fail('OS334+ boot missing ./focusRadar334.js');
if(releaseMajor>=342&&!boot.includes("./navigationOS342.js"))fail('OS342+ boot missing ./navigationOS342.js');
if(releaseMajor>=343){for(const symbol of ['BOOT343','__KAMIL_BOOT_BUDGET343__','kamil:boot-budget343'])if(!boot.includes(symbol))fail(`OS343 boot budget missing ${symbol}`);if(!fs.existsSync(new URL('./e2e_os343_boot_budget.spec.mjs',import.meta.url)))fail('missing OS343 browser regression')}
if(releaseMajor>=344){const shellPath='./js/personalShell640.js';if(!fs.existsSync(new URL(shellPath,import.meta.url)))fail(`missing OS344 file ${shellPath}`);else{const shell=read(shellPath);for(const symbol of ['SHELL344','__KAMIL_PERSONAL_SHELL344__','ticketMarketWatch656.js','personalAsk640.js'])if(!shell.includes(symbol))fail(`OS344 lazy shell missing ${symbol}`)}if(!fs.existsSync(new URL('./e2e_os344_lazy_shell.spec.mjs',import.meta.url)))fail('missing OS344 browser regression')}
if(releaseMajor>=345){const lazyPath='./js/ticketLazy345.js';if(!fs.existsSync(new URL(lazyPath,import.meta.url)))fail(`missing OS345 file ${lazyPath}`);else{const lazy=read(lazyPath);for(const symbol of ['installTicketLazy345','__KAMIL_TICKET_LAZY345__','ticketDesk331.js','ticketQa332.js','kamil:view-change'])if(!lazy.includes(symbol))fail(`OS345 lazy ticket loader missing ${symbol}`)}if(!boot.includes("./ticketLazy345.js"))fail('OS345 boot missing ./ticketLazy345.js');if(boot.includes("optionalImport('./ticketDesk331.js'"))fail('OS345 critical boot still imports ticketDesk331 directly');if(boot.includes("optionalImport('./ticketQa332.js'"))fail('OS345 critical boot still imports ticketQa332 directly');if(!fs.existsSync(new URL('./e2e_os345_ticket_lazy.spec.mjs',import.meta.url)))fail('missing OS345 browser regression')}
for(const symbol of ['installUnifiedCommand333','Ticket Action Center','RUNTIME HEALTH','INVESTMENT ACTION CENTER'])if(!mod.includes(symbol))fail(`missing ${symbol}`);
for(const symbol of ['installOS333Resilience','data-os333-exec','data-os333-invest'])if(!resilience.includes(symbol))fail(`resilience missing ${symbol}`);
if(!css.includes('.os333-drawer'))fail('ticket detail drawer CSS missing');
for(const p of ['./js/ticketDesk331.js','./js/ticketQa332.js','./js/ticketCloud660.js','./js/financeCommand258.js'])if(!fs.existsSync(new URL(p,import.meta.url)))fail(`missing critical file ${p}`);
if(releaseMajor>=334)for(const p of ['./js/focusRadar334.js','./focusRadar334.css'])if(!fs.existsSync(new URL(p,import.meta.url)))fail(`missing OS334 file ${p}`);
if(releaseMajor>=342){const navPath='./js/navigationOS342.js';if(!fs.existsSync(new URL(navPath,import.meta.url)))fail(`missing OS342 file ${navPath}`);else{const nav=read(navPath);for(const symbol of ['installNavigation342','stopImmediatePropagation','kamil:navigate'])if(!nav.includes(symbol))fail(`OS342 navigation missing ${symbol}`)}}
if(!process.exitCode)console.log(`OS333+ release guard OK · ${releaseVersion}`);
