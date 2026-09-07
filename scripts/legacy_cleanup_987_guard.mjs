import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const read=p=>fs.readFileSync(p,'utf8');
const need=(ok,msg)=>{if(!ok)throw new Error(msg)};
for(const f of ['js/legacyCleanup987.js','js/legacyCleanup987Boot.js','js/oneOS977.js','js/bettingBootstrap543.js'])need(fs.existsSync(f),`missing ${f}`);
execFileSync(process.execPath,['--check','js/legacyCleanup987.js'],{stdio:'pipe'});
execFileSync(process.execPath,['--check','js/legacyCleanup987Boot.js'],{stdio:'pipe'});
const c=read('js/legacyCleanup987.js'),boot=read('js/bettingBootstrap543.js');
for(const x of ["LEGACY_CLEANUP987_VERSION='987.0.0'",'legacyGatewayContract978','legacyWorkflowScope979','observationWindow980','legacyUsage981','replacementCoverage982','dependencyRisk983','retirementReadiness984','archivePlan985','ciNoiseReduction986','cleanupControl987','openLegacyCleanup987','installLegacyCleanup987','requires30DayObservation:true','requiresExplicitApproval:true','noAutomaticDeletion:true','noAutomaticCodeMutation:true'])need(c.includes(x),`OS987 missing ${x}`);
need(boot.includes("import('./legacyCleanup987Boot.js')"),'OS987 bootstrap not wired');
need(!/(deleteFile|delete_file|unlinkSync|rmSync|autoMerge:true|autoDeploy:true|placeBet|buyTicket|sellTicket|sendMoney)/.test(c),'OS987 destructive execution pattern detected');
const gatewayGuards=['operator_717_guard.mjs','operator_truth_737_guard.mjs','data_truth_738_guard.mjs','strategy_788_guard.mjs','strategy_789_guard.mjs','copilot_840_guard.mjs','autonomous_943_guard.mjs','scripts/proposal_review_944_guard.mjs','scripts/safe_change_plan_945_guard.mjs'];
for(const f of gatewayGuards){const x=read(f);need(x.includes('oneOS977.js'),`${f} must validate OS977 gateway`);need(!x.includes('js/personalMore640.js'),`${f} still depends on legacy More wiring`)}
const scopedWorkflows=['.github/workflows/os717-operator.yml','.github/workflows/os737-truth.yml','.github/workflows/os738-data-truth.yml','.github/workflows/os788_strategy.yml','.github/workflows/os789-strategy-polish.yml','.github/workflows/os840-copilot-control.yml','.github/workflows/os842-copilot-feedback.yml','.github/workflows/os892-self-improving.yml','.github/workflows/os943-autonomous-proposals.yml','.github/workflows/os944-proposal-review.yml','.github/workflows/os945-safe-change-plan.yml','.github/workflows/os946-preview-pr.yml'];
for(const f of scopedWorkflows){const x=read(f);need(/pull_request:\s*\n\s+paths:/.test(x),`${f} pull_request is not path-scoped`);need(!x.includes("'js/personalMore640.js'"),`${f} still fans out on personalMore640.js`)}
console.log('OS987 Legacy Cleanup + CI Modernization guard OK');
