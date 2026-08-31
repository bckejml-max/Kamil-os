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
const essentialStart=page.indexOf('const ESSENTIAL_ANALYTICS=[');
const legacyStart=page.indexOf('const MODULES=[');
if(criticalStart<0)fail('ticketPage100 missing CRITICAL boot list');
if(essentialStart<0)fail('ticketPage100 missing ESSENTIAL_ANALYTICS list');
if(legacyStart<0)fail('ticketPage100 missing legacy MODULES list');
if(criticalStart>=0&&essentialStart>=0&&criticalStart>essentialStart)fail('critical boot must be declared before essential analytics');
if(essentialStart>=0&&legacyStart>=0&&essentialStart>legacyStart)fail('essential analytics must be declared before legacy modules');

const criticalBlock=criticalStart>=0&&essentialStart>criticalStart?page.slice(criticalStart,essentialStart):'';
for(const path of ['./ticketUi421.js','./ticketMarketEngine426.js','./ticketCommander465.js','./ticketConsolidation466.js']){
  if(!criticalBlock.includes(path))fail(`critical boot missing ${path}`);
  if(count(page,path)!==1)fail(`${path} must appear exactly once in ticketPage100`);
}
for(const token of ['state.criticalDone=true','state.legacyDone=true','BACKGROUND_MODULES','loadBackground','LEGACY_DELAY_MS=5000'])if(!page.includes(token))fail(`critical-first boot missing ${token}`);
const essentialBlock=essentialStart>=0&&legacyStart>essentialStart?page.slice(essentialStart,legacyStart):'';
for(const path of ['./ticketMarketHealth397.js','./ticketAlerts413.js'])if(!essentialBlock.includes(path))fail(`essential analytics missing ${path}`);
if(page.includes("kick('boot466-critical')"))fail('canonical critical boot must not schedule a delayed view rerender');

for(const token of ['__KAMIL_TICKET_COMMANDER454__','__KAMIL_TICKET_COMMANDER439__','__KAMIL_TICKET_COMMANDER435__','__KAMIL_TICKET_ENGINE426__',"source:'WAIT'",'čekám na model'])if(!commander.includes(token))fail(`Commander 6 fallback missing ${token}`);
if(commander.includes('if(!c?.rows?.length)return null'))fail('Commander 6 must not disappear when OS454 has no rows');
if(commander.includes('setTimeout(()=>schedule(0),900)'))fail('Commander 6 must not use delayed critical rerender');

for(const token of ['normalizeHero','moveDiagnostics','data-bridge-system466','data-analytics466','canonical-466'])if(!ui.includes(token))fail(`canonical UI bridge missing ${token}`);
const canonicalKicker=ui.includes("kicker.textContent='Kamil OS · Ticket Portfolio'")||ui.includes("setText(kicker,'Kamil OS · Ticket Portfolio')");
const canonicalHeading=ui.includes("h1.textContent='Ticket Trading Desk'")||ui.includes("setText(h1,'Ticket Trading Desk')");
if(!canonicalKicker)fail('canonical hero title normalization missing');
if(!canonicalHeading)fail('canonical hero H1 normalization missing');
if(ui.includes('function setText')&&!ui.includes('if(el&&el.textContent!==next)'))fail('idempotent hero normalization guard missing');
if(ui.includes('setTimeout(()=>schedule(0),700)'))fail('canonical UI must not use delayed critical rerender');

for(const forbidden of ['function reorder(','function moveAnalytics(','host.appendChild(drawer)'])if(consolidation.includes(forbidden))fail(`logic-only consolidation must not own page DOM: ${forbidden}`);
for(const token of ['logicOnly:true','decorateCommander','data-c466-more'])if(!consolidation.includes(token))fail(`execution consolidation missing ${token}`);

for(const token of ['canonicalSystem','data-bridge-system466','data-system466'])if(!layout.includes(token))fail(`Layout Guard 458.1 missing canonical bridge support: ${token}`);

if(!process.exitCode)console.log(`Ticket canonical guard OK · ${appVersion}`);
