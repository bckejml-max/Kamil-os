import fs from 'node:fs';
for(const f of ['js/safeChangePlan945.js','js/oneOS977.js'])if(!fs.existsSync(f))throw new Error(`missing ${f}`);
const c=fs.readFileSync('js/safeChangePlan945.js','utf8');
const legacy=fs.readFileSync('js/oneOS977.js','utf8');
for(const x of ["SAFE_CHANGE_PLAN945_VERSION='945.0.0'",'approvedProposals945','safeChangePlan945','safeChangePlans945','mode:\'PLAN_ONLY\'','executed:false','requiresExplicitImplementation:true','noAutomaticExecution:true','noAutomaticMerge:true','noAutomaticDeployment:true','noFinancialExecution:true','noBettingExecution:true'])if(!c.includes(x))throw new Error(`missing OS945 contract ${x}`);
for(const x of ["safe:['./safeChangePlan945.js','openSafeChangePlan945']",'Safe Plan 945','Pokročilé / legacy'])if(!legacy.includes(x))throw new Error(`OS945 legacy gateway missing ${x}`);
if(/executeBet|placeBet|buyTicket|sellTicket|sendMoney|transferMoney|mergePullRequest|deployProduction/.test(c))throw new Error('unsafe execution pattern in OS945');
console.log('OS945 Safe Change Plan guard OK · gateway OS977');
