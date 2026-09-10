import fs from 'node:fs';
import assert from 'node:assert/strict';

const read=p=>fs.readFileSync(p,'utf8');
const boot=read('js/instantShell64.js');
const app=read('js/app.js');
const views=read('js/viewRuntime41.js');
const ticketPage=read('js/ticketPage100.js');
const ticketUi=read('js/ticketUi421.js');
const ticketConsolidation=read('js/ticketConsolidation466.js');
const ticketCloud=read('js/ticketCloud660.js');
const release=read('js/releaseMeta.js');
const index=read('index.html');
const pkg=JSON.parse(read('package.json'));

const version=release.match(/APP_VERSION='([^']+)'/)?.[1]||'';
assert.equal(pkg.version,version,'package.json and releaseMeta must agree');

// OS 2.0 startup: only the core app may be eagerly imported. Everything else is view/action driven.
assert.match(boot,/architecture:'os2-on-demand'/,'OS2 boot architecture marker missing');
assert.ok(!boot.includes('personalAsk640.js'),'personalAsk640 must stay out of startup');
assert.ok(!boot.includes('ticketDesk331.js'),'Ticket Desk must stay out of startup');
assert.ok(!boot.includes('workspaces305.js'),'legacy workspaces must stay out of startup');
assert.ok(!boot.includes('bettingBootstrap543.js'),'Betting bootstrap must stay out of startup');
assert.equal((boot.match(/await import\('\.\/app\.js'\)/g)||[]).length,1,'OS2 startup must eagerly import app.js exactly once');
assert.ok(!boot.includes('optionalImport(')&&!boot.includes('deferredImport('),'OS2 must not recreate layered startup import queues');

// Canonical shell and command bar remain stable.
assert.ok(app.includes("const input=qs('#commandInput')")&&app.includes('executeCommand41(v)'),'canonical command bar execution missing');
assert.ok(app.includes("e.key.toLowerCase()==='k'")&&app.includes('input.focus()'),'Ctrl+K canonical command shortcut missing');
assert.match(index,/data-os2="1"/,'OS2 shell marker missing');
assert.ok(index.includes('id="view-inbox"')&&index.includes('id="view-betting"'),'Inbox and Betting must be present in the static shell to avoid layout injection');

// Current ticket ownership: loaded only when the Tickets view is requested.
assert.ok(ticketPage.includes("import('./ticketDesk331.js')"),'ticketPage100 must delegate to Ticket Desk 331');
assert.ok(ticketPage.includes("'./ticketUi421.js','installTicketUi421','CANONICAL UI 421/466'")&&ticketUi.includes('canonical-466'),'ticketPage100 must boot the canonical Ticket DOM owner first');
assert.ok(ticketConsolidation.includes('logicOnly:true')&&!ticketConsolidation.includes('function reorder('),'ticket consolidation must remain logic-only');
assert.ok(views.includes("tickets:['./ticketPage100.js','renderTicketPage100']"),'Tickets must be lazy through viewRuntime41');

// Betting enrichment is lazy and must only start from the Betting view.
assert.ok(views.includes("betting:['./bettingPage527.js','renderBettingPage527']"),'Betting view must be lazy through viewRuntime41');
const betting=read('js/bettingPage527.js');
assert.ok(betting.includes("import('./bettingBootstrap543.js')"),'Betting enrichment must boot on-demand from the Betting page');
assert.ok(!index.includes('bettingBootstrap543.js'),'Betting bootstrap must not be an index script');

// Current ticket cloud safety remains unchanged.
assert.ok(ticketCloud.includes("c.includes('official-api')")&&ticketCloud.includes("u.includes('viagogo.com')"),'Viagogo source detection missing');
assert.ok(ticketCloud.includes("from('ticket_inventory')"),'ticket inventory cloud contract missing');
assert.ok(!/service[_-]?role/i.test(ticketCloud),'service-role secret reference must never enter browser ticket code');

console.log(`OS2000 CURRENT ARCHITECTURE PASS · ${version}`);
