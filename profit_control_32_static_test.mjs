import fs from 'node:fs';
const text=f=>fs.readFileSync(f,'utf8'),assert=(x,m)=>{if(!x)throw new Error(m)};
const fx=text('js/marketQuoteIngest32.js'),audit=text('js/xtbAudit24.js'),planner=text('js/xtbContribution32.js'),tickets=text('js/ticketPortfolio32.js'),ui=text('js/profitControlUi32.js'),preflight=text('js/preflight.js');
assert(fx.includes('EURCZK=X')||fx.includes('`${c}CZK=X`'),'FX symbol ingestion missing');assert(fx.includes('marketFxRate32')&&fx.includes('requestedFx'),'FX read/status contract missing');
assert(audit.includes('valuationComplete')&&audit.includes('missingFx')&&audit.includes('marketFxRate32'),'FX-correct audit missing');assert(!audit.includes('raw+'),'audit must not silently sum raw cross-currency values');
assert(planner.includes("contract:'ALLOCATION_PROPOSAL_ONLY'")&&planner.includes('requiresCompleteFx:true')&&planner.includes('autoTrade:false'),'contribution safety contract missing');assert(planner.includes('plannedInvestment')&&planner.includes('estimatedQty'),'25k allocation/qty layer missing');
assert(tickets.includes('ticketEventKey32')&&tickets.includes('ticketActionQueue32')&&tickets.includes('capitalAtRisk'),'ticket event/action queue missing');assert(tickets.includes('autoPrice:false')&&tickets.includes('autoSell:false'),'ticket automation firewall missing');
assert(ui.includes('Event Portfolio & Action Queue')&&ui.includes('přesný plán')&&ui.includes('Peníze, které dnes potřebují pozornost'),'Profit Control UI missing');assert(!ui.includes('store.mutate('),'Profit Control UI must stay read-only');assert(preflight.includes("import './profitControlUi32.js'"),'Profit Control UI not loaded');
console.log('KAMIL OS 32.5 PROFIT CONTROL STATIC PASS');
