import {installCommandRouter} from './commandRouter.js';
import {VIEW_REGISTRY} from './viewRegistry.js';
import {installStateContracts} from './stateContracts.js';
import {listen,cleanup} from './lifecycle.js';

const state={version:'consolidation-1',startedAt:Date.now(),coreReady:false,osReady:false,modules:[],failures:[]};
window.__KAMIL_CONSOLIDATION_RUNTIME__=state;
function ensureStyle(){if(document.querySelector('link[data-consolidation]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href='./consolidation.css';l.dataset.consolidation='1';document.head.appendChild(l)}
ensureStyle();installStateContracts();installCommandRouter();

function shellContract(){const missing=[];for(const [key,def] of Object.entries(VIEW_REGISTRY)){if(!document.querySelector(`#view-${key}`))missing.push(`view-${key}`);if(!document.querySelector(`#${def.host}`)&&!(def.legacyHost&&document.querySelector(`#${def.legacyHost}`)))missing.push(def.host)}state.shell={ok:missing.length===0,missing};document.documentElement.dataset.consolidatedShell=missing.length?'partial':'ready';return state.shell}
async function install(path,fn){const started=performance.now();try{const m=await import(path);if(typeof m?.[fn]!=='function')throw new Error(`Chybí ${fn}`);await m[fn]();state.modules.push({path,fn,ok:true,ms:Math.round(performance.now()-started)});return m}catch(error){state.failures.push({path,fn,error:String(error?.message||error)});state.modules.push({path,fn,ok:false,ms:Math.round(performance.now()-started)});console.warn(`[consolidation] ${path}`,error);return null}}
async function installOS(){if(state.osReady||state.osInstalling)return;state.osInstalling=true;await install('./oneOS967.js','installOneOS967');await install('./oneOS977.js','installOneOS977');await install('./legacyCleanup987.js','installLegacyCleanup987');await install('./controlPlane1037.js','installControlPlane1037');const ops=await install('./controlOperations1047.js','installControlOperations1047'),health=document.querySelector('[data-os-health-1046]');if(health&&ops?.openOperations1047){health.onclick=()=>ops.openOperations1047();health.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();ops.openOperations1047()}}}state.osInstalling=false;state.osReady=true;state.completedAt=Date.now();state.healthy=state.failures.length===0;shellContract();window.dispatchEvent(new CustomEvent('kamil:consolidation-ready',{detail:{healthy:state.healthy,modules:state.modules.length}}))}
function onCoreReady(){if(state.coreReady)return;state.coreReady=true;void installOS()}

shellContract();cleanup('consolidation-runtime');listen('consolidation-runtime',window,'kamil:boot-budget343',onCoreReady,{once:true});if(window.__KAMIL_BOOT_BUDGET343__?.complete)queueMicrotask(onCoreReady);
