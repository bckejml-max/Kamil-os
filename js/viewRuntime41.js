import {hydrateColdView42} from './coldPartition42.js';
const modules=new Map();
const viewDefs={today:['./todayLite43.js','renderTodayLite43'],money:['./money24.js','renderMoney'],tickets:['./tickets24.js','renderTickets'],home:['./home26.js','renderHome'],more:['./more26.js','renderMore']};
export const validViews41=new Set(Object.keys(viewDefs));
function load(path){if(modules.has(path))return modules.get(path);const p=import(path).catch(err=>{modules.delete(path);throw err});modules.set(path,p);return p}
const idle=(fn,timeout=1800)=>'requestIdleCallback'in window?requestIdleCallback(fn,{timeout}):setTimeout(fn,650);
export async function getViewRenderer41(name='today'){const key=validViews41.has(name)?name:'today',def=viewDefs[key];await hydrateColdView42(key);const m=await load(def[0]);return m[def[1]]}
export function prefetchView41(name){const key=validViews41.has(name)?name:'today',def=viewDefs[key];return load(def[0]).catch(()=>null)}
export async function setMoreMode41(mode){await hydrateColdView42('more');const m=await load('./more26.js');m.setMoreMode?.(mode)}
export async function openCapture41(type){const m=await load('./capture26.js');return m.openQuickCapture(type)}
export async function renderCommandResults41(value){const m=await load('./command.js');return m.renderResults(value)}
export async function executeCommand41(value){const m=await load('./command.js');return m.execute(value)}
export function renderExtras41(view){const run=()=>{const jobs=[];if(view!=='today')jobs.push(load('./autopilotUi28.js').then(m=>m.renderAutopilot?.(view)));jobs.push(load('./personalPlusUi29.js').then(m=>m.renderPersonalPlus?.(view)));return Promise.allSettled(jobs)};if(view==='today'){idle(run,4200);return Promise.resolve([])}return run()}
let riskTimer=null;
async function doRiskBadge(state){try{const m=await load('./personalRisk25.js'),risk=m.personalRiskCenter(state),count=Number(risk?.critical||0)+Number(risk?.high||0),b=document.querySelector('#moreBadge');if(b){b.textContent=count;b.classList.toggle('hidden',!count)}return count}catch{return 0}}
export function refreshRiskBadge41(state,delay=1800){clearTimeout(riskTimer);riskTimer=setTimeout(()=>doRiskBadge(state),delay);return Promise.resolve(null)}
export async function runPreflight41(){const m=await load('./preflight.js');return m.runPreflight?.()}
let notifyTimer=null;
export function scheduleNotifications41(delay=700){clearTimeout(notifyTimer);notifyTimer=setTimeout(()=>{Promise.allSettled([load('./autopilotUi28.js').then(m=>m.runAutopilotNotifications?.()),load('./personalPlusUi29.js').then(m=>m.runReminderNotifications?.())])},delay)}
export function warmRuntime41(){idle(()=>Promise.allSettled([load('./personalRisk25.js'),load('./autopilotUi28.js'),load('./personalPlusUi29.js')]),6500)}
