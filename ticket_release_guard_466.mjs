import fs from 'node:fs';

const fail=message=>{console.error(`Ticket canonical guard 466: ${message}`);process.exitCode=1};
const read=path=>fs.readFileSync(new URL(path,import.meta.url),'utf8');
const count=(text,needle)=>text.split(needle).length-1;

const release=read('./js/releaseMeta.js');
const page=read('./js/ticketPage100.js');
const ui=read('./js/ticketUi421.js');
const commander=read('./js/ticketCommander465.js');
const consolidation=read('./js/ticketConsolidation466.js');
const layout=read('./js/ticketLayoutGuard458.js');

const appVersion=release.match(/APP_VERSION='([^']+)'/)?.[1]||'';
const appRelease=release.match(/APP_RELEASE='([^']+)'/)?.[1]||'';
const major=Number(appVersion.split('.')[0]||0);

if(appVersion!==appRelease)fail(`APP_VERSION ${appVersion||'unknown'} != APP_RELEASE ${appRelease||'unknown'}`);
if(major<466){
  if(!process.exitCode)console.log(`Ticket canonical guard skipped · release ${appVersion}`);
  process.exit();
}

const criticalStart=page.indexOf('const CRITICAL=[');
const legacyStart=page.indexOf('const MODULES=[');
if(criticalStart<0)fail('ticketPage100 missing CRITICAL boot list');
if(legacyStart<0)fail('ticketPage100 missing legacy MODULES list');
if(criticalStart>=0&&legacyStart>=0&&criticalStart>legacyStart)fail('critical boot must be declared before legacy modules');

const criticalBlock=criticalStart>=0&&legacyStart>criticalStart?page.slice(criticalStart,legacyStart):'';
for(const path of ['./ticketUi421.js','./ticketMarketEngine426.js','./ticketCommander465.js','./ticketConsolidation466.js']){
  if(!criticalBlock.includes(path))fail(`critical boot missing ${path}`);
  if(count(page,path)!==1)fail(`${path} must appear exactly once in ticketPage100`);
}
for(const token of ['state.criticalDone=true','kick(\'boot466-critical\')','state.legacyDone=true'])if(!page.includes(token))fail(`critical-first boot missing ${token}`);

for(const token of ['__KAMIL_TICKET_COMMANDER454__','__KAMIL_TICKET_COMMANDER439__','__KAMIL_TICKET_COMMANDER435__','__KAMIL_TICKET_ENGINE426__',"source:'WAIT'",'čekám na model'])if(!commander.includes(token))fail(`Commander 6 fallback missing ${token}`);
if(commander.includes('if(!c?.rows?.length)return null'))fail('Commander 6 must not disappear when OS454 has no rows');

for(const token of ['normalizeHero','moveDiagnostics','data-bridge-system466','data-analytics466','canonical-466'])if(!ui.includes(token))fail(`canonical UI bridge missing ${token}`);
if(!ui.includes("kicker.textContent='Kamil OS · Ticket Portfolio'"))fail('canonical hero title normalization missing');
if(!ui.includes("h1.textContent='Ticket Trading Desk'"))fail('canonical hero H1 normalization missing');

for(const forbidden of ['function reorder(','function moveAnalytics(','host.appendChild(drawer)'])if(consolidation.includes(forbidden))fail(`logic-only consolidation must not own page DOM: ${forbidden}`);
for(const token of ['logicOnly:true','decorateCommander','data-c466-more'])if(!consolidation.includes(token))fail(`execution consolidation missing ${token}`);

for(const token of ['canonicalSystem','data-bridge-system466','data-system466'])if(!layout.includes(token))fail(`Layout Guard 458.1 missing canonical bridge support: ${token}`);

if(!process.exitCode)console.log(`Ticket canonical guard OK · ${appVersion}`);
