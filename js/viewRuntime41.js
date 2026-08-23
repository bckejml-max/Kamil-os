import {hydrateColdView42} from './coldPartition42.js';
const modules=new Map(),warmViews=new Map();
const viewDefs={
 today:['./personalToday640.js','renderPersonalToday640'],
 money:['./personalMoney640.js','renderPersonalMoney640'],
 tickets:['./personalFamily640.js','renderPersonalFamily640'],
 home:['./personalHome640.js','renderPersonalHome640'],
 more:['./personalDocuments640.js','renderPersonalDocuments640']
};
export const validViews41=new Set(Object.keys(viewDefs));
function load(path){if(modules.has(path))return modules.get(path);const p=import(path).catch(err=>{modules.delete(path);throw err});modules.set(path,p);return p}
function warmView(name='today'){
 const key=validViews41.has(name)?name:'today';if(warmViews.has(key))return warmViews.get(key);
 const def=viewDefs[key],p=Promise.resolve().then(()=>hydrateColdView42(key)).then(()=>load(def[0])).then(m=>m[def[1]]).catch(err=>{warmViews.delete(key);throw err});warmViews.set(key,p);return p;
}
export function getViewRenderer41(name='today'){return warmView(name)}
export function prefetchView41(){return Promise.resolve(null)}
export async function setMoreMode41(){return Promise.resolve(null)}
export async function openCapture41(type='task'){const m=await load('./personalCapture643.js');return m.openPersonalCapture643(type)}
export async function renderCommandResults41(){return Promise.resolve(null)}
export async function executeCommand41(){return Promise.resolve(null)}
export function renderExtras41(){return Promise.resolve([])}
export function refreshRiskBadge41(){return Promise.resolve(null)}
export async function runPreflight41(){try{const m=await load('./personalHardening650.js');return {...m.personalReleasePreflight650(),safeCore:true,personalUx:'65.0'}}catch(error){return{ok:false,safeCore:true,personalUx:'65.0',error:String(error?.message||error)}}}
export function scheduleNotifications41(){return Promise.resolve(null)}
export function warmRuntime41(){return Promise.resolve(null)}
