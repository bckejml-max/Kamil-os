import assert from 'node:assert/strict';
import {readdir,readFile} from 'node:fs/promises';

const root=new URL('./',import.meta.url);
const workflowsDir=new URL('./.github/workflows/',root);
const workflows=(await readdir(workflowsDir)).filter(f=>/\.ya?ml$/i.test(f)).sort();
const allowedWorkflows=[
  'desktop.yml',
  'os1047-control-operations.yml',
  'os333-browser.yml',
  'qa.yml',
  'vercel-production-333.yml'
].sort();
assert.deepEqual(workflows,allowedWorkflows,`Workflow inventory drifted. Expected only: ${allowedWorkflows.join(', ')}`);

const retired=new Set([
  'assistant53.yml','command50.yml','betting691.yml','betting692.yml','core70.yml','performance-41-3.yml',
  'personal-65.yml','personal-home53.yml','practical49.yml','os696.yml','os697_today_actions.yml',
  'os717-operator.yml','os717-polish.yml','os737-truth.yml','os737-release-diagnose.yml','os738-data-truth.yml',
  'os788_strategy.yml','os789-strategy-polish.yml','os790-strategy-command.yml','os840-copilot-control.yml',
  'os841-copilot-polish.yml','os842-copilot-feedback.yml','os892-self-improving.yml','os943-autonomous-proposals.yml',
  'os944-proposal-review.yml','os945-safe-change-plan.yml','os946-preview-pr.yml','os947-visual-rebuild.yml',
  'os967-one-os.yml','os977-consolidation.yml','os987-legacy-cleanup.yml','os1037-control-plane.yml'
]);
assert.deepEqual(workflows.filter(f=>retired.has(f)),[],`Retired duplicate workflows returned`);

const pkg=JSON.parse(await readFile(new URL('./package.json',root),'utf8'));
const release=String(pkg.scripts?.['test:release']||'');
for(const token of [
  'assistant_53_static_test.mjs','command_50_static_test.mjs','betting_reliability_691_guard.mjs',
  'today_priority_696_guard.mjs','today_actions_697_guard.mjs','operator_717_guard.mjs',
  'operator_717_polish_guard.mjs','operator_truth_737_guard.mjs','data_truth_738_guard.mjs',
  'strategy_788_guard.mjs','strategy_789_guard.mjs','strategy_command_790_guard.mjs',
  'copilot_840_guard.mjs','copilot_841_guard.mjs','copilot_842_guard.mjs','self_improving_892_guard.mjs',
  'autonomous_943_guard.mjs','scripts/proposal_review_944_guard.mjs','scripts/safe_change_plan_945_guard.mjs',
  'scripts/preview_pr_946_guard.mjs','scripts/visual_rebuild_947_guard.mjs','scripts/one_os_967_guard.mjs',
  'scripts/one_os_977_guard.mjs','scripts/legacy_cleanup_987_guard.mjs','api_runtime_guard.mjs',
  'ticket_gmail_sync_health_guard.mjs'
]) assert.ok(release.includes(token),`Canonical release chain missing ${token}`);

const jsDir=new URL('./js/',root);
const jsFiles=(await readdir(jsDir)).filter(f=>f.endsWith('.js'));
let intervals=0,timeouts=0,listeners=0;
for(const name of jsFiles){
  const src=await readFile(new URL(name,jsDir),'utf8');
  intervals+=(src.match(/\bsetInterval\s*\(/g)||[]).length;
  timeouts+=(src.match(/\bsetTimeout\s*\(/g)||[]).length;
  listeners+=(src.match(/\.addEventListener\s*\(/g)||[]).length;
}
console.log(`Repo hygiene PASS: 5 workflows, ${jsFiles.length} JS modules, timers=${intervals+timeouts}, listeners=${listeners}`);
