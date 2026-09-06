import fs from 'node:fs';
for(const f of ['js/safeChangePlan945.js','js/personalMore640.js'])if(!fs.existsSync(f))throw new Error(`missing ${f}`);
const c=fs.readFileSync('js/safeChangePlan945.js','utf8');
const more=fs.readFileSync('js/personalMore640.js','utf8');
for(const x of ["SAFE_CHANGE_PLAN945_VERSION='945.0.0'",'approvedProposals945','safeChangePlan945','safeChangePlans945','mode:\'PLAN_ONLY\'','executed:false','requiresExplicitImplementation:true','noAutomaticExecution:true','noAutomaticMerge:true','noAutomaticDeployment:true','noFinancialExecution:true','noBettingExecution:true'])if(!c.includes(x))throw new Error(`missing OS945 contract ${x}`);
if(!more.includes('Safe Change Plan')||!more.includes("import('./safeChangePlan945.js')"))throw new Error('OS945 More integration missing');
if(/executeBet|placeBet|buyTicket|sellTicket|sendMoney|transferMoney|mergePullRequest|deployProduction/.test(c))throw new Error('unsafe execution pattern in OS945');
console.log('OS945 Safe Change Plan guard OK');
