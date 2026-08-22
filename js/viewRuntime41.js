import {hydrateColdView42} from './coldPartition42.js';
const modules=new Map(),warmViews=new Map();
const viewDefs={today:['./todayLite43.js','renderTodayLite43'],money:['./money24.js','renderMoney'],tickets:['./tickets24.js','renderTickets'],home:['./home26.js','renderHome'],more:['./more26.js','renderMore']};
export const validViews41=new Set(Object.keys(viewDefs));
function load(path){if(modules.has(path))return modules.get(path);const p=import(path).catch(err=>{modules.delete(path);throw err});modules.set(path,p);return p}
function warmView(name='today'){
 const key=validViews41.has(name)?name:'today';
 if(warmViews.has(key))return warmViews.get(key);
 const def=viewDefs[key],p=Promise.resolve().then(()=>hydrateColdView42(key)).then(()=>load(def[0])).then(m=>m[def[1]]).catch(err=>{warmViews.delete(key);throw err});
 warmViews.set(key,p);return p;
}
export function getViewRenderer41(name='today'){return warmView(name)}
// Safe Core 43.7.1: never preload a view from hover/pointer/focus. Load only after explicit navigation.
export function prefetchView41(){return Promise.resolve(null)}
export async function setMoreMode41(mode){await hydrateColdView42('more');const m=await load('./more26.js');m.setMoreMode?.(mode)}
export async function openCapture41(type){const m=await load('./capture26.js');return m.openQuickCapture(type)}
export async function renderCommandResults41(value){const m=await load('./command.js');return m.renderResults(value)}
export async function executeCommand41(value){const m=await load('./command.js');return m.execute(value)}
// Safe Core: no autopilot/personal-plus/performance extras are started in the background.
export function renderExtras41(){return Promise.resolve([])}
export function refreshRiskBadge41(){return Promise.resolve(null)}
export async function runPreflight41(){return {ok:true,safeCore:true,skipped:true}}
export function scheduleNotifications41(){return Promise.resolve(null)}
export function warmRuntime41(){return Promise.resolve(null)}
