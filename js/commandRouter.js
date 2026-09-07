import {h,modal} from './utils.js';

const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const slashKey=q=>norm(q).split(/\s+/)[0].replace(/^\//,'');
const ONE_KEYS=new Set(['os','one','inbox','cash','money','tickets','bets','betting','property','byt','family','home','docs','timeline','opportunities','find','health','gaps','legacy']);
const OPS_KEYS=new Set(['ops','operations','watches','snapshots']);
const CONTROL_KEYS=new Set(['system','health2','backup','automations']);
const CLEANUP_KEYS=new Set(['cleanup','retire','legacy-status']);
let installed=false;

async function openOne(raw){
 const key=slashKey(raw),m=await import('./oneOS967.js');
 const map={os:'autopilot',one:'autopilot',inbox:'inbox',cash:'money',money:'money',tickets:'tickets',bets:'betting',betting:'betting',property:'property',byt:'property',family:'family',home:'home',docs:'docs',timeline:'timeline',opportunities:'opportunities',find:'search',health:'health',gaps:'gaps',legacy:'control'};
 return m.openFeature?.(map[key]||'autopilot');
}
async function openOps(){const m=await import('./controlOperations1047.js');return m.openOperations1047?.()}
async function openControl(){const m=await import('./controlPlane1037.js');return m.openControlPlane1037?.()}
async function openCleanup(){const m=await import('./legacyCleanup987.js');return m.openLegacyCleanup987?.()}

async function runCopilot(raw){
 const [{buildCopilot842},{answer840,contextualFollowups795}]=await Promise.all([import('./copilotFeedback842.js'),import('./copilot840.js')]);
 const model=await buildCopilot842(),answer=answer840(raw,model);
 if(!answer)return false;
 const confidence=Number(model?.confidence?.overall??model?.confidence??0),health=Number(model?.health||0),follow=contextualFollowups795?.(raw)||[];
 const body=`<div class="card"><div class="eyebrow">KAMIL OS · COPILOT</div><h2>${h(answer)}</h2><div class="row"><span>Confidence</span><b>${Number.isFinite(confidence)?confidence.toFixed(0):'—'} %</b></div><div class="row"><span>OS Health</span><b>${Number.isFinite(health)?health.toFixed(0):'—'} %</b></div><p class="muted">Read-only odpověď z aktuálních dat. Finanční, ticket ani betting akce se automaticky neprovádějí.</p></div>${follow.length?`<div class="card"><div class="eyebrow">NAVAZUJÍCÍ DOTAZY</div>${follow.slice(0,4).map(x=>`<div class="row"><span>${h(x)}</span></div>`).join('')}</div>`:''}`;
 const choice=await modal('Kamil OS Copilot',body,[{label:'Otevřít detail Copilota',value:'open'},{label:'Zavřít',value:null,primary:true}]);
 if(choice==='open'){const m=await import('./copilotFeedback842.js');return m.openCopilot842?.()}
 return true;
}

async function special(raw,{execute=true}={}){
 const q=String(raw||'').trim();if(!q)return false;const key=slashKey(q),n=norm(q);
 if(q.startsWith('/')&&ONE_KEYS.has(key)){if(execute)await openOne(q);return true}
 if(q.startsWith('/')&&OPS_KEYS.has(key)){if(execute)await openOps();return true}
 if(q.startsWith('/')&&CONTROL_KEYS.has(key)){if(execute)await openControl();return true}
 if(q.startsWith('/')&&CLEANUP_KEYS.has(key)){if(execute)await openCleanup();return true}
 try{const s=await import('./strategyCommand790.js');if(s.isStrategyQuestion790?.(q)){if(execute)await s.executeStrategyCommand790(q);return true}}catch{}
 try{const c=await import('./commandCopilot840.js');if(c.canHandleCopilot841?.(q)){if(execute)await runCopilot(q);return true}}catch{}
 try{const c=await import('./capitalCommand100.js');if(c.isCapitalQuestion100?.(q)){if(execute)await c.openCapitalDecision100(q);return true}}catch{}
 if(/^(stav|status)\s+(os|systemu)$/.test(n)){if(execute)await openOps();return true}
 return false;
}

export async function executeCentralCommand(raw=''){
 const q=String(raw||'').trim();if(!q)return false;
 if(await special(q,{execute:true}))return true;
 const x=await import('./command.js');x.execute(q);return true;
}

function routePreview(label,detail,q){
 const box=document.querySelector('#commandResults');if(!box)return false;box.classList.remove('hidden');box.innerHTML=`<button class="search-row" type="button" data-central-command><div><b>${h(label)}</b><div class="muted">${h(detail)}</div></div></button>`;box.querySelector('[data-central-command]')?.addEventListener('click',()=>{box.classList.add('hidden');void executeCentralCommand(q)});return true;
}
export async function renderCentralCommandResults(raw=''){
 const q=String(raw||'').trim(),box=document.querySelector('#commandResults');if(!box)return false;
 box.setAttribute('role','listbox');
 if(!q){box.classList.add('hidden');box.innerHTML='';document.querySelector('#commandInput')?.setAttribute('aria-expanded','false');return true}
 const key=slashKey(q);
 if(q.startsWith('/')&&ONE_KEYS.has(key))return routePreview(`One OS · /${key}`,'Otevřít canonical One OS funkci',q);
 if(q.startsWith('/')&&OPS_KEYS.has(key))return routePreview('Operations','Health, snapshoty, watches a automations',q);
 if(q.startsWith('/')&&CONTROL_KEYS.has(key))return routePreview('Control Plane','Diagnostika, data a bezpečné operace',q);
 if(q.startsWith('/')&&CLEANUP_KEYS.has(key))return routePreview('Legacy cleanup','Stav konsolidace bez automatického mazání',q);
 try{const s=await import('./strategyCommand790.js');if(s.isStrategyQuestion790?.(q)){routePreview('Strategie z aktuálních dat','Read-only vyhodnocení',q);return true}}catch{}
 try{const c=await import('./commandCopilot840.js');if(c.canHandleCopilot841?.(q)){routePreview('Kamil OS Copilot','Read-only odpověď z canonical dat',q);return true}}catch{}
 try{const c=await import('./capitalCommand100.js');if(c.isCapitalQuestion100?.(q)){routePreview('Capital Allocation','Porovnat možnosti bez automatického provedení',q);return true}}catch{}
 try{const x=await import('./commandSearch610.js');x.installCommandSearch610?.();if(x.renderExtendedResults610?.(q)){document.querySelector('#commandInput')?.setAttribute('aria-expanded','true');return true}}catch{}
 const m=await import('./command.js');m.renderResults(q);document.querySelector('#commandInput')?.setAttribute('aria-expanded',box.classList.contains('hidden')?'false':'true');return true;
}

function consume(input){const raw=String(input?.value||'').trim();if(!raw)return false;input.value='';input.setAttribute('aria-expanded','false');document.querySelector('#commandResults')?.classList.add('hidden');void executeCentralCommand(raw).catch(error=>console.error('[command-router]',error));return true}
export function installCommandRouter(){
 if(installed||window.__KAMIL_COMMAND_ROUTER__?.installed)return true;installed=true;
 const input=document.querySelector('#commandInput');if(input){input.setAttribute('role','combobox');input.setAttribute('aria-autocomplete','list');input.setAttribute('aria-controls','commandResults');input.setAttribute('aria-expanded','false')}
 document.addEventListener('keydown',event=>{const el=event.target?.closest?.('#commandInput');if(!el||event.key!=='Enter')return;if(!String(el.value||'').trim())return;event.preventDefault();event.stopImmediatePropagation();consume(el)},true);
 document.addEventListener('click',event=>{if(!event.target?.closest?.('#commandGo'))return;const el=document.querySelector('#commandInput');if(!String(el?.value||'').trim())return;event.preventDefault();event.stopImmediatePropagation();consume(el)},true);
 window.__KAMIL_COMMAND_ROUTER__={installed:true,owner:'central',execute:executeCentralCommand,render:renderCentralCommandResults,at:Date.now()};return true;
}
