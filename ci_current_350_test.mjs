import fs from 'node:fs';
import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(p,'utf8');
const boot=read('js/instantShell64.js'),manifest=read('js/runtimeManifest.js'),shell=read('js/personalShell640.js'),app=read('js/app.js'),viewRuntime=read('js/viewRuntime41.js'),router=read('js/commandRouter.js'),ticketPage=read('js/ticketPage100.js'),ticketUi=read('js/ticketUi421.js'),ticketConsolidation=read('js/ticketConsolidation466.js'),ticketLoader=read('js/ticketOnDemand346.js'),ticketCloud=read('js/ticketCloud660.js'),workspaces=read('js/workspaces305.js'),release=read('js/releaseMeta.js'),pkg=JSON.parse(read('package.json'));
const version=release.match(/APP_VERSION='([^']+)'/)?.[1]||'';assert.equal(pkg.version,version,'package.json and releaseMeta must agree');

assert.ok(!boot.includes('personalAsk640.js')&&!shell.includes("from './personalAsk640.js'"),'personalAsk640 must stay out of startup dependencies');
assert.ok(shell.includes('const lazy=async(path,name)=>')&&shell.includes("lazy('./personalMore640.js','openPersonalMore640')"),'personal shell lazy-loading contract missing');
assert.ok(app.includes("const input=qs('#commandInput')")&&app.includes('executeCommand41(v)'),'canonical command bar execution missing');
assert.ok(viewRuntime.includes("from './commandRouter.js'")&&router.includes("owner:'central'"),'central command ownership missing');
assert.ok(app.includes("e.key.toLowerCase()==='k'")&&app.includes('input.focus()'),'Ctrl+K canonical command shortcut missing');
assert.ok(!shell.includes("from './personalAssistant530.js'"),'legacy Assistant 53 must not return to startup');

assert.ok(ticketPage.includes("await import('./ticketDesk331.js')"),'ticketPage100 must delegate to Ticket Desk 331');
assert.ok(ticketPage.includes("'./ticketUi421.js','installTicketUi421','CANONICAL UI'")&&ticketUi.includes('canonical-466'),'ticketPage100 must boot the canonical Ticket DOM owner first');
assert.ok(ticketConsolidation.includes('logicOnly:true')&&!ticketConsolidation.includes('function reorder('),'ticket consolidation must remain logic-only and must not own page ordering');
assert.ok(manifest.includes("path:'./ticketOnDemand346.js'")&&manifest.includes("fn:'installTicketOnDemand346'")&&manifest.includes("phase:'deferred'"),'ticket on-demand loader must remain registered as deferred');
assert.ok(!manifest.includes("path:'./ticketDesk331.js'"),'Ticket Desk 331 must not eager-load from runtime manifest');
assert.ok(ticketLoader.includes("import('./ticketDesk331.js')")&&ticketLoader.includes('kamil:view-change'),'ticket on-demand loader contract missing');
assert.ok(ticketPage.includes('loadTicketAdvancedAnalytics')&&ticketPage.includes('Načíst analytiku'),'advanced ticket analytics must remain explicit on-demand');

assert.ok(ticketCloud.includes("c.includes('official-api')")&&ticketCloud.includes("u.includes('viagogo.com')"),'Viagogo source detection missing');
assert.ok(ticketCloud.includes("from('ticket_inventory')"),'ticket inventory cloud contract missing');
assert.ok(!/service[_-]?role/i.test(ticketCloud),'service-role secret reference must never enter browser ticket code');

assert.ok(manifest.includes("path:'./workspaces305.js'")&&manifest.includes("phase:'idle'"),'workspaces305 must remain idle/deferred');
assert.ok(!manifest.includes("path:'./workspaces305.js',fn:'installWorkspaces305',phase:'critical'"),'workspaces305 must not return to critical boot');
assert.ok(workspaces.includes("observer:'retired-os348'")||workspaces.includes('retired-os348'),'workspace observer retirement marker missing');
assert.ok((manifest.match(/phase:'critical'/g)||[]).length<=6,'critical runtime budget exceeded');
console.log(`OS350 CURRENT ARCHITECTURE PASS · ${version} · manifest runtime`);