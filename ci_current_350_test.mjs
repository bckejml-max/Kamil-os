import fs from 'node:fs';
import assert from 'node:assert/strict';

const read=p=>fs.readFileSync(p,'utf8');
const boot=read('js/instantShell64.js');
const shell=read('js/personalShell640.js');
const ticketPage=read('js/ticketPage100.js');
const ticketLoader=read('js/ticketOnDemand346.js');
const ticketCloud=read('js/ticketCloud660.js');
const workspaces=read('js/workspaces305.js');
const release=read('js/releaseMeta.js');
const pkg=JSON.parse(read('package.json'));

const version=release.match(/APP_VERSION='([^']+)'/)?.[1]||'';
assert.equal(pkg.version,version,'package.json and releaseMeta must agree');

// Current personal shell: question engine is lazy, not a startup dependency.
assert.ok(shell.includes("lazy('./personalAsk640.js','answerPersonalQuestion640')"),'personalAsk640 must remain lazy-loaded by the canonical shell');
assert.ok(shell.includes("go.textContent='Najít / zeptat se'"),'canonical personal command CTA missing');
assert.ok(!shell.includes("from './personalAssistant530.js'"),'legacy Assistant 53 must not return to startup');

// Current ticket ownership: ticketPage is only an adapter and Ticket Desk loads on demand.
assert.ok(ticketPage.includes("import('./ticketDesk331.js')"),'ticketPage100 must delegate to Ticket Desk 331');
assert.ok(ticketPage.includes('one owner')||ticketPage.includes('owns'),'ticketPage100 must document single DOM ownership');
assert.ok(boot.includes("optionalImport('./ticketOnDemand346.js'"),'ticket on-demand loader must stay on the critical path');
assert.ok(!boot.includes("optionalImport('./ticketDesk331.js'"),'Ticket Desk 331 must not eager-load during boot');
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
