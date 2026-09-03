import fs from 'node:fs';
import assert from 'node:assert/strict';

const read=p=>fs.readFileSync(p,'utf8');
const boot=read('js/instantShell64.js');
const shell=read('js/personalShell640.js');
const app=read('js/app.js');
const ticketPage=read('js/ticketPage100.js');
const ticketUi=read('js/ticketUi421.js');
const ticketConsolidation=read('js/ticketConsolidation466.js');
const ticketLoader=read('js/ticketOnDemand346.js');
const ticketCloud=read('js/ticketCloud660.js');
const workspaces=read('js/workspaces305.js');
const release=read('js/releaseMeta.js');
const pkg=JSON.parse(read('package.json'));

const version=release.match(/APP_VERSION='([^']+)'/)?.[1]||'';
assert.equal(pkg.version,version,'package.json and releaseMeta must agree');

// Current personal shell: Personal Ask must not become a startup dependency. The
// canonical user entry point is the global Command Bar owned by app.js/viewRuntime41.
assert.ok(!boot.includes('personalAsk640.js')&&!shell.includes("from './personalAsk640.js'"),'personalAsk640 must stay out of startup dependencies');
assert.ok(shell.includes('const lazy=async(path,name)=>')&&shell.includes("lazy('./personalMore640.js','openPersonalMore640')"),'personal shell lazy-loading contract missing');
assert.ok(app.includes("const input=qs('#commandInput')")&&app.includes('executeCommand41(v)'),'canonical command bar execution missing');
assert.ok(app.includes("e.key.toLowerCase()==='k'")&&app.includes('input.focus()'),'Ctrl+K canonical command shortcut missing');
assert.ok(!shell.includes("from './personalAssistant530.js'"),'legacy Assistant 53 must not return to startup');

// Current ticket ownership: Ticket Desk is on-demand; canonical UI owns page DOM and consolidation is logic-only.
assert.ok(ticketPage.includes("import('./ticketDesk331.js')"),'ticketPage100 must delegate to Ticket Desk 331');
assert.ok(ticketPage.includes("'./ticketUi421.js','installTicketUi421','CANONICAL UI 421/466'")&&ticketUi.includes('canonical-466'),'ticketPage100 must boot the canonical Ticket DOM owner first');
assert.ok(ticketConsolidation.includes('logicOnly:true')&&!ticketConsolidation.includes('function reorder('),'ticket consolidation must remain logic-only and must not own page ordering');
assert.ok(boot.includes("['./ticketOnDemand346.js','installTicketOnDemand346']")&&boot.includes('await optionalImport(p,f)'),'ticket on-demand loader must stay on the critical optional-import path');
assert.ok(!boot.includes("['./ticketDesk331.js','installTicketDesk331']")&&!boot.includes("optionalImport('./ticketDesk331.js'"),'Ticket Desk 331 must not eager-load during boot');
assert.ok(ticketLoader.includes("import('./ticketDesk331.js')")&&ticketLoader.includes('kamil:view-change'),'ticket on-demand loader contract missing');

// Current ticket market source detection: Viagogo official API and URLs are recognized without a brittle legacy label.
assert.ok(ticketCloud.includes("c.includes('official-api')")&&ticketCloud.includes("u.includes('viagogo.com')"),'Viagogo source detection missing');
assert.ok(ticketCloud.includes("from('ticket_inventory')"),'ticket inventory cloud contract missing');
assert.ok(!/service[_-]?role/i.test(ticketCloud),'service-role secret reference must never enter browser ticket code');

// Current workspace ownership: legacy workspace renderer stays deferred and observer-retired.
assert.ok(boot.includes("deferredImport('./workspaces305.js'"),'workspaces305 must remain deferred');
assert.ok(!boot.includes("optionalImport('./workspaces305.js'"),'workspaces305 must not return to critical boot');
assert.ok(workspaces.includes("observer:'retired-os348'")||workspaces.includes('retired-os348'),'workspace observer retirement marker missing');

console.log(`OS350 CURRENT ARCHITECTURE PASS · ${version}`);
