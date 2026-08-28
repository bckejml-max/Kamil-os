import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');const assert=(ok,msg)=>{if(!ok)throw new Error(msg)};
const life=read('js/lifeOperator298.js'),home=read('js/operatorHome299.js'),payout=read('js/ticketPayoutLearningModel192.js'),opp=read('js/ticketOpportunityModel198.js'),boot=read('js/instantShell64.js'),ux=read('js/uxFoundation238.js'),shell=read('js/personalShell640.js'),rel=read('js/releaseMeta.js'),sw=read('sw.js');
// Preserve the mature operator models and their safety rules as reusable source modules.
for(const marker of ['unifiedInbox','deadlineGuardian','lifeTimeline','contacts','documentIntel','investmentMemory','weeklyReview','notificationBrain','capital','answerLifeOperator298','guardrails'])assert(life.includes(marker),`OS298 operator marker missing: ${marker}`);
assert(life.includes('autoFinancialExecution:false')&&life.includes('autoTicketExecution:false')&&life.includes('explicitConfirmationForWrites:true'),'OS298 execution guardrails missing');
for(const marker of ['data-operator-home299','buildLifeOperator298','openLifeOperator298','data-os80-command','deployable'])assert(home.includes(marker),`OS299 operator home marker missing: ${marker}`);
assert(payout.includes('ticketPayoutSettlementGate192')&&payout.includes('SETTLED')&&payout.includes('settledOnly:true'),'settled-only payout learning missing');
assert(payout.includes('SOLD_WAITING_PAYMENT')&&payout.includes('UNSETTLED_STATUS'),'unsettled payout rejection missing');
assert(opp.includes('TICKET_COMPLIANCE_TTL_DAYS_280=14')&&opp.includes('restrictionsVerificationFreshness'),'compliance freshness TTL missing');
// OS333+ owns the production surface. Old operator renderers must not compete for the shell anymore.
assert(boot.includes("./kamilCore312.js")&&boot.includes("./unifiedCommand333.js")&&boot.includes("./os333Resilience.js"),'OS333+ canonical operator boot missing');
assert(!boot.includes("optionalImport('./lifeOperator298.js'")&&!boot.includes("optionalImport('./operatorHome299.js'"),'legacy operator renderer must not auto-boot');
assert(ux.includes('Kamil AI Operator')&&ux.includes("kamil:open-life-operator"),'AI Operator palette entry missing');
assert(shell.includes('answerLifeOperator298')&&shell.includes('co dnes řešit'),'natural-language operator wiring missing');
assert(shell.includes('window.__KAMIL_OS80_AUTO_MOUNT__=false'),'legacy auto-mount cleanup missing');
assert(!shell.includes('appendCommandCenter800')&&!shell.includes('MutationObserver'),'legacy OS80 auto-render still wired');
const releaseMajor=Number(rel.match(/APP_VERSION='(\d+)\./)?.[1]||0);assert(releaseMajor>=333,`current release ${releaseMajor||'unknown'} predates canonical OS333 surface`);
// Keep legacy source assets cache-addressable until the destructive cleanup phase explicitly removes them.
assert(sw.includes('lifeOperator298.css')&&sw.includes('lifeOperator298.js')&&sw.includes('operatorHome299.css')&&sw.includes('operatorHome299.js'),'operator compatibility cache missing');
console.log(`OS279-300 compatibility + OS${releaseMajor} canonical operator regression OK`);
