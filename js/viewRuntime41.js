import {hydrateColdView42} from './coldPartition42.js';
import {APP_RELEASE} from './releaseMeta.js';
const modules=new Map(),warmViews=new Map();
function ensureInboxShell(){if(typeof document==='undefined')return;if(!document.querySelector('link[data-core70]')){const l=document.createElement('link');l.rel='stylesheet';l.href='./core70.css';l.dataset.core70='1';document.head.appendChild(l)}const main=document.querySelector('main');if(main&&!document.querySelector('#view-inbox')){const section=document.createElement('section');section.id='view-inbox';section.className='view';section.innerHTML='<div id="inboxView"></div>';main.prepend(section)}const nav=document.querySelector('#mainNav');if(nav&&!nav.querySelector('[data-view="inbox"]')){const b=document.createElement('button');b.dataset.view='inbox';b.innerHTML='<span>◎</span><span>Inbox</span>';const today=nav.querySelector('[data-view="today"]');today?.after(b)}const bottom=document.querySelector('#bottomNav');if(bottom&&!bottom.querySelector('[data-view="inbox"]')){const b=document.createElement('button');b.dataset.view='inbox';b.innerHTML='<span>◎</span>Inbox';const today=bottom.querySelector('[data-view="today"]');today?.after(b)}}
ensureInboxShell();
window.addEventListener?.('kamil:view-change',e=>{if(e.detail==='inbox'){const p=document.querySelector('#pageTitle');if(p)p.textContent='INBOX'}});
const viewDefs={
 today:['./personalToday640.js','renderPersonalToday640'],
 inbox:['./personalInbox690.js','renderPersonalInbox690'],
 money:['./personalMoney640.js','renderPersonalMoney640'],
 tickets:['./ticketPage665.js','renderTicketPage665'],
 family:['./personalFamily640.js','renderPersonalFamily640'],
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
export async function runPreflight41(){try{const m=await load('./personalHardening650.js');return {...m.personalReleasePreflight650(),safeCore:true,personalUx:APP_RELEASE,canonicalViews:[...validViews41]}}catch(error){return{ok:false,safeCore:true,personalUx:APP_RELEASE,error:String(error?.message||error)}}}
export function scheduleNotifications41(){return Promise.resolve(null)}
export function warmRuntime41(){return Promise.resolve(null)}