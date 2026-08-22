import {hydrateColdView42} from './coldPartition42.js';
import {scheduleOs50FastBoot} from './os50FastBootGuard.js';
const modules=new Map(),warmViews=new Map();
const viewDefs={today:['./todayLite43.js','renderTodayLite43'],money:['./money24.js','renderMoney'],tickets:['./tickets24.js','renderTickets'],home:['./home26.js','renderHome'],more:['./more26.js','renderMore']};
export const validViews41=new Set(Object.keys(viewDefs));
function load(path){if(modules.has(path))return modules.get(path);const p=import(path).catch(err=>{modules.delete(path);throw err});modules.set(path,p);return p}
const idle=(fn,timeout=1800)=>'requestIdleCallback'in window?requestIdleCallback(fn,{timeout}):setTimeout(fn,650);
const afterGraceIdle=(fn,grace=12000,timeout=4000)=>setTimeout(()=>idle(fn,timeout),Math.max(0,grace));
function warmView(name='today'){
 const key=validViews41.has(name)?name:'today';
 if(warmViews.has(key))return warmViews.get(key);
 const def=viewDefs[key],p=Promise.resolve().then(()=>hydrateColdView42(key)).then(()=>load(def[0])).then(m=>m[def[1]]).catch(err=>{warmViews.delete(key);throw err});
 warmViews.set(key,p);return p;
}
export function getViewRenderer41(name='today'){return warmView(name)}
export function prefetchView41(name){return warmView(name).catch(()=>null)}
export async function setMoreMode41(mode){await hydrateColdView42('more');const m=await load('./more26.js');m.setMoreMode?.(mode)}
export async function openCapture41(type){const m=await load('./capture26.js');return m.openQuickCapture(type)}
export async function renderCommandResults41(value){const m=await load('./command.js');return m.renderResults(value)}
export async function executeCommand41(value){const m=await load('./command.js');return m.execute(value)}
export function renderExtras41(view){const run=()=>{const jobs=[];if(view!=='today')jobs.push(load('./autopilotUi28.js').then(m=>m.renderAutopilot?.(view)));jobs.push(load('./personalPlusUi29.js').then(m=>m.renderPersonalPlus?.(view)));if(view==='more')jobs.push(load('./perfUi43.js').then(m=>m.renderPerf43?.()));return Promise.allSettled(jobs)};if(view==='today'){scheduleOs50FastBoot(load);afterGraceIdle(run,18000,5000);return Promise.resolve([])}return run()}
let riskTimer=null;
async function doRiskBadge(state){try{const m=await load('./personalRisk25.js'),risk=m.personalRiskCenter(state),count=Number(risk?.critical||0)+Number(risk?.high||0),b=document.querySelector('#moreBadge');if(b){b.textContent=count;b.classList.toggle('hidden',!count)}return count}catch{return 0}}
export function refreshRiskBadge41(state,delay=9000){clearTimeout(riskTimer);riskTimer=setTimeout(()=>idle(()=>doRiskBadge(state),3000),Math.max(9000,delay));return Promise.resolve(null)}
export async function runPreflight41(){const m=await load('./preflight.js');return m.runPreflight?.()}
let notifyTimer=null;
export function scheduleNotifications41(delay=20000){clearTimeout(notifyTimer);if(typeof Notification!=='undefined'&&Notification.permission!=='granted')return;notifyTimer=setTimeout(()=>idle(()=>{Promise.allSettled([load('./autopilotUi28.js').then(m=>m.runAutopilotNotifications?.()),load('./personalPlusUi29.js').then(m=>m.runReminderNotifications?.())])},4000),Math.max(15000,delay))}
export function warmRuntime41(){afterGraceIdle(()=>Promise.allSettled([load('./personalRisk25.js')]),30000,5000)}