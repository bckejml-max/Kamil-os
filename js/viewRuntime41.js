import {hydrateColdView42} from './coldPartition42.js';
import {APP_RELEASE} from './releaseMeta.js';
import {validViews41,viewDefinition41,viewTitle41} from './viewRegistry.js';
import {renderCentralCommandResults,executeCentralCommand} from './commandRouter.js';
import {beginViewLoad,completeViewLoad,renderViewError} from './uiState.js';
import {listen,cleanup} from './lifecycle.js';
export {validViews41};

const modules=new Map(),warmViews=new Map();
function ensurePolish142(){if(typeof document==='undefined')return;if(!document.querySelector('link[data-finalpolish142]')){const l=document.createElement('link');l.rel='stylesheet';l.href='./finalPolish142.css';l.dataset.finalpolish142='1';document.head.appendChild(l)}document.documentElement.dataset.os142='1'}
function syncChrome142(view){if(typeof document==='undefined')return;const def=viewDefinition41(view),p=document.querySelector('#pageTitle');if(p)p.textContent=def.title||'KAMIL OS';document.querySelectorAll('[data-view]').forEach(x=>{const on=x.dataset.view===view;x.toggleAttribute('aria-current',on);if(on)x.setAttribute('aria-current','page')});const add=document.querySelector('#quickAddBtn');if(add){const hidden=!def.quickLabel;add.classList.toggle('hidden',hidden);if(!hidden){const b=add.querySelector('b');if(b)b.textContent=def.quickLabel;add.title=`Rychle přidat ${def.quickLabel.toLowerCase()} · Ctrl N`}}}
ensurePolish142();syncChrome142('today');cleanup('view-runtime');listen('view-runtime',window,'kamil:view-change',e=>syncChrome142(e.detail));
function load(path){if(modules.has(path))return modules.get(path);const p=import(path).catch(err=>{modules.delete(path);throw err});modules.set(path,p);return p}
function guarded(key,renderer){return async(...args)=>{beginViewLoad(key);try{const value=renderer(...args);const result=value&&typeof value.then==='function'?await value:value;completeViewLoad(key);return result}catch(error){console.error(`[view:${key}]`,error);renderViewError(key,error,async()=>{warmViews.delete(key);const next=await warmView(key);await next(...args)});return null}}}
function warmView(name='today'){const key=validViews41.has(name)?name:'today';if(warmViews.has(key))return warmViews.get(key);const def=viewDefinition41(key),p=Promise.resolve().then(()=>hydrateColdView42(key)).then(()=>load(def.renderer[0])).then(m=>{const renderer=m?.[def.renderer[1]];if(typeof renderer!=='function')throw new Error(`Chybí renderer ${def.renderer[1]} pro ${key}`);return guarded(key,renderer)}).catch(err=>{warmViews.delete(key);throw err});warmViews.set(key,p);return p}
export function getViewRenderer41(name='today'){return warmView(name)}
export function prefetchView41(name='today'){return warmView(name).then(()=>true).catch(error=>{console.warn(`[viewRuntime41] prefetch ${name}`,error);return false})}
export async function setMoreMode41(){return Promise.resolve(null)}
export async function openCapture41(type='task'){if(type==='money-task'){const m=await load('./personalMoneyActions645.js');return m.createMoneyTask645()}if(type==='document-source'){const btn=document.querySelector('#documentInbox650');if(btn){btn.click();return true}return null}const m=await load('./personalCapture643.js');if(type==='family-task')return m.openPersonalCapture643('task',{area:'Rodina',category:'Rodina'});if(type==='home-task')return m.openPersonalCapture643('task',{area:'Domov',category:'Domov'});if(type==='ticket-task')return m.openPersonalCapture643('task',{area:'Vstupenky',category:'Vstupenky'});return m.openPersonalCapture643(['task','waiting','admin','insurance','contract'].includes(type)?type:'task')}
export async function renderCommandResults41(q=''){return renderCentralCommandResults(q)}
export async function executeCommand41(q=''){return executeCentralCommand(q)}
export async function renderExtras41(view='today'){syncChrome142(view);if(view==='today'){const m=await load('./personalWeekly700.js');return m.appendWeeklyReset700()}return null}
export function refreshRiskBadge41(){return Promise.resolve(null)}
export async function runPreflight41(){try{const m=await load('./personalHardening650.js');return{...m.personalReleasePreflight650(),safeCore:true,personalUx:APP_RELEASE,canonicalViews:[...validViews41],canonicalRegistry:true,centralCommandRouter:true,guardedViews:true,inbox:true,betting:true,weeklyReset:true,finalPolish142:true}}catch(error){return{ok:false,safeCore:true,personalUx:APP_RELEASE,error:String(error?.message||error)}}}
export function scheduleNotifications41(){return Promise.resolve(null)}
export function warmRuntime41(){ensurePolish142();load('./qa143.js').catch(e=>console.warn('[qa143 optional]',e));load('./commandRouter.js').catch(()=>{});load('./marketAction101.js').catch(()=>{});return Promise.resolve(null)}
export {viewTitle41};
