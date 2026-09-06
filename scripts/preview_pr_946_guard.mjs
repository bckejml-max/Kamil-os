import fs from 'node:fs';
const files=['js/previewPr946.js','js/safeChangePlan945.js'];
for(const f of files)if(!fs.existsSync(f))throw new Error(`missing ${f}`);
const c=fs.readFileSync('js/previewPr946.js','utf8');
const safe=fs.readFileSync('js/safeChangePlan945.js','utf8');
for(const x of ["PREVIEW_PR946_VERSION='946.0.0'",'previewPrManifest946','previewPrDrafts946','openPreviewPr946',"mode:'PREVIEW_PR_DRAFT_ONLY'",'requiresHumanImplementation:true','requiresSeparateMergeApproval:true','autoMerge:false','autoDeploy:false','noAutomaticCodeMutation:true','noAutomaticMerge:true','noProductionDeployment:true','noFinancialExecution:true','noBettingExecution:true'])if(!c.includes(x))throw new Error(`missing OS946 contract ${x}`);
if(!safe.includes("import('./previewPr946.js')")||!safe.includes('Připravit Preview PR'))throw new Error('OS945 -> OS946 integration missing');
if(/merge_pull_request|create_pull_request|create_branch|deploy\(|autoMerge:true|autoDeploy:true|placeBet|buyTicket|sellTicket|sendMoney/.test(c))throw new Error('unsafe preview PR execution pattern detected');
console.log('OS946 Preview PR Builder guard OK');
