import fs from 'node:fs';
const fail=m=>{console.error(`OS2000 release guard: ${m}`);process.exitCode=1};
const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8');
const exists=p=>fs.existsSync(new URL(p,import.meta.url));

const release=read('./js/releaseMeta.js');
const boot=read('./js/instantShell64.js');
const index=read('./index.html');
const views=read('./js/viewRuntime41.js');
const app=read('./js/app.js');
const today=read('./js/todayPage2000.js');
const ticketPage=read('./js/ticketPage100.js');
const ticketOverview=read('./js/ticketOverview.js');
const moneyOverview=read('./js/moneyOverview.js');
const bettingOverview=read('./js/bettingOverview.js');
const tasksOverview=read('./js/tasksOverview.js');
const ticketCloud=read('./js/ticketCloud660.js');
const betting=read('./js/bettingPage527.js');
const pkg=JSON.parse(read('./package.json'));
const releaseVersion=release.match(/APP_VERSION='([^']+)'/)?.[1]||'';
if(pkg.version!==releaseVersion)fail(`package version ${pkg.version} does not match releaseMeta ${releaseVersion}`);

for(const p of [
 './os2.css','./productReset1300.css','./js/todayPage2000.js','./js/workPage1300.js','./js/propertyPage1300.js','./js/app.js','./js/viewRuntime41.js','./js/runtimeOwnership1100.js',
 './js/ticketOverview.js','./js/ticketAdvanced100.js','./js/ticketPage100.js','./js/ticketDesk331.js','./js/ticketUi421.js','./js/ticketCloud660.js','./js/moneyOverview.js','./js/moneyAdvanced100.js','./js/bettingOverview.js','./js/bettingAdvanced527.js','./js/tasksOverview.js','./js/inboxAdvanced141.js',
 './js/bettingPage527.js','./js/bettingBootstrap543.js','./js/command.js','./js/commandSearch610.js'
])if(!exists(p))fail(`missing required OS2 file ${p}`);

if(!index.includes('data-os2="1"'))fail('index missing OS2 shell marker');
if(!index.includes('./os2.css'))fail('index missing OS2 stylesheet');
if(!index.includes('./productReset1300.css')||!index.includes('data-product-reset1300="1"'))fail('index missing OS1300 product reset shell');
if(index.includes('theme33.css')||index.includes('personal65.css')||index.includes('ticketDesk353.css'))fail('legacy view styles must not eager-load from index');
if(index.includes('bettingBootstrap543.js'))fail('Betting bootstrap must not eager-load from index');
for(const id of ['view-today','view-work','view-tickets','view-property','view-money','view-betting','view-inbox','view-family','view-home','view-more'])if(!index.includes(`id="${id}"`))fail(`static shell missing ${id}`);

for(const symbol of ['architecture:\'os2-on-demand\'','BOOT343','DEFER345','__KAMIL_BOOT_BUDGET343__','__KAMIL_DEFERRED345__'])if(!boot.includes(symbol))fail(`OS2 boot missing ${symbol}`);
if((boot.match(/await import\('\.\/app\.js'\)/g)||[]).length!==1)fail('OS2 boot must import app.js exactly once');
if(boot.includes('optionalImport(')||boot.includes('deferredImport('))fail('layered optional/deferred boot queues must stay retired');
for(const p of ['ticketDesk331.js','bettingBootstrap543.js','workspaces305.js','todayCockpit363.js','commandCenter467.js'])if(boot.includes(p))fail(`${p} must not be an eager OS2 boot dependency`);

for(const token of [
 "today:['./todayPage2000.js','renderTodayPage2000']",
 "work:['./workPage1300.js','renderWorkPage1300']",
 "property:['./propertyPage1300.js','renderPropertyPage1300']",
 "inbox:['./tasksOverview.js','renderTasksOverview']",
 "money:['./moneyOverview.js','renderMoneyOverview']",
 "tickets:['./ticketOverview.js','renderTicketOverview']",
 "betting:['./bettingOverview.js','renderBettingOverview']"
])if(!views.includes(token))fail(`view runtime missing ${token}`);
if(!views.includes('ensureViewStyles'))fail('view-specific CSS must remain lazy');
if(!views.includes("tickets:[]"))fail('Heavy Ticket styles must stay off the default simple view');

for(const symbol of ['data-os2-today','data-product-home1300','pr1300-attention','pr1300-domains','__KAMIL_TODAY_OS2000__'])if(!today.includes(symbol))fail(`Today OS2 missing ${symbol}`);
if(!app.includes("const input=qs('#commandInput')")||!app.includes('executeCommand41(v)'))fail('canonical command bar missing');
if(!ticketOverview.includes("import('./ticketAdvanced100.js')"))fail('Advanced Ticket Desk must be explicit/on-demand from the simple overview');
if(!moneyOverview.includes("import('./moneyAdvanced100.js')"))fail('Advanced Money view must be explicit/on-demand from the simple overview');
if(!bettingOverview.includes("import('./bettingAdvanced527.js')"))fail('Advanced Betting scanner must be explicit/on-demand from the simple overview');
if(!tasksOverview.includes("import('./inboxAdvanced141.js')"))fail('Advanced Inbox/Gmail view must be explicit/on-demand from Tasks');
if(!ticketPage.includes("import('./ticketDesk331.js')"))fail('Preserved advanced Ticket adapter must still delegate to Ticket Desk');
if(!betting.includes("import('./bettingBootstrap543.js')"))fail('Preserved advanced Betting adapter must still own enrichment');
if(!ticketCloud.includes("from('ticket_inventory')"))fail('ticket inventory cloud contract missing');
if(/service[_-]?role/i.test(ticketCloud))fail('service-role reference in browser ticket code');

if(!exists('./e2e_os2000_redesign.spec.mjs'))fail('missing OS2 browser regression');
if(!process.exitCode)console.log(`OS2000 release guard OK · ${releaseVersion}`);
