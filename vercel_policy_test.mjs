import fs from 'fs';
const assert=(x,m)=>{if(!x)throw new Error(m)};
const config=JSON.parse(fs.readFileSync('vercel.json','utf8'));
const rules=config?.git?.deploymentEnabled;
assert(rules&&typeof rules==='object','Vercel deploymentEnabled rules missing');
assert(rules['**']===false,'all non-explicit branches must be disabled');
assert(rules.main===true,'main must remain deployment-enabled');
assert(Object.keys(rules).length===2,'unexpected Vercel branch deployment rule');
console.log('VERCEL MAIN-ONLY DEPLOYMENT POLICY PASS');
