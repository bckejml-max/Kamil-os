import assert from 'node:assert/strict';
import {readdir,readFile} from 'node:fs/promises';

const root=new URL('./',import.meta.url);
const workflowsDir=new URL('./.github/workflows/',root);
const workflows=(await readdir(workflowsDir)).filter(f=>/\.ya?ml$/i.test(f)).sort();
const retired=new Set([
  'assistant53.yml','command50.yml','betting691.yml','betting692.yml','os696.yml','os697_today_actions.yml',
  'os717-operator.yml','os717-polish.yml','os737-truth.yml','os738-data-truth.yml','os788_strategy.yml',
  'os789-strategy-polish.yml','os790-strategy-command.yml'
]);
const survivors=workflows.filter(f=>retired.has(f));
assert.deepEqual(survivors,[],`Retired duplicate workflows returned: ${survivors.join(', ')}`);

const pkg=JSON.parse(await readFile(new URL('./package.json',root),'utf8'));
const release=String(pkg.scripts?.['test:release']||'');
for(const token of [
  'assistant_53_static_test.mjs','command_50_static_test.mjs','betting_reliability_691_guard.mjs',
  'today_priority_696_guard.mjs','today_actions_697_guard.mjs','operator_717_guard.mjs',
  'operator_717_polish_guard.mjs','operator_truth_737_guard.mjs','data_truth_738_guard.mjs',
  'strategy_788_guard.mjs','strategy_789_guard.mjs','strategy_command_790_guard.mjs',
  'api_runtime_guard.mjs','ticket_gmail_sync_health_guard.mjs'
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
assert.ok(workflows.length<=30,`Workflow fanout still too high: ${workflows.length} workflows (budget 30)`);
console.log(`Repo hygiene PASS: ${workflows.length} workflows, ${jsFiles.length} JS modules, timers=${intervals+timeouts}, listeners=${listeners}`);
