import {hydrateColdView42} from './coldPartition42.js';
import {APP_RELEASE} from './releaseMeta.js';
import {ownEvent1100} from './runtimeOwnership1100.js';

const OWNER='core.viewRuntime41';
const modules=new Map(),warmViews=new Map(),stylePromises=new Map();
const titles={today:'DNES',inbox:'INBOX',money:'PENÍZE',tickets:'VSTUPENKY',betting:'SÁZENÍ',family:'RODINA',home:'DOMOV',more:'DOKUMENTY'};
const quick={today:'Úkol',inbox:'Úkol',money:'Finanční úkol',tickets:'Úkol k ticketům',family:'Rodinný úkol',home:'Domácí úkol',more:'Dokument / zdroj'};
const heavyViews=new Set(['money','tickets','betting']);
const viewDefs={
 today:['./todayPage2000.js','renderTodayPage2000'],
 inbox:['./inboxPage141.js','renderInboxPage141'],
 money:['./moneyPage100.js','renderMoneyPage100'],
 tickets:['./ticketPage100.js','renderTicketPage100'],
 betting:['./bettingPage527.js','renderBettingPage527'],
 family:['./familyPage140.js','renderFamilyPage140'],
 home:['./homePage140.js','renderHomePage140'],
 more:['./documentsPage141.js','renderDocumentsPage141']
};
const viewStyles={
 inbox:['./core70.css','./personal64.css'],
 money:['./globalFintech137.css','./personal64.css'],
 tickets:['./ticket68.css','./globalFintech137.css','./ticketWorkspace210.css','./ticketDesk353.css','./ticketDesk355.css','./ticketDesk356.css'],
 betting:['./globalFintech137.css'],
 family:['./personal64.css','./family70.css'],
 home:['./personal64.css','./home68.css'],
 more:['./personal64.css']
};

export const validViews41=new Set(Object.keys(viewDefs));
function load(path){if(modules.has(path))return modules.get(path);const p=import(path).catch(err=>{modules.delete(path);throw err});modules.set(path,p);return p}
function loadCss(href){if(stylePromises.has(href))return stylePromises.get(href);const existing=[...document.querySelectorAll('link[rel="stylesheet"]')].find(x=>x.getAttribute('href')===href||x.href.endsWith(href.replace('./','/')));if(existing){const p=Promise.resolve(true);stylePromises.set(href,p);return p}const p=new Promise(resolve=>{const l=document.createElement('link');l.rel='stylesheet';l.href=href;l.dataset.os2Lazy='1';l.onload=()=>resolve(true);l.onerror=()=>resolve(false);document.head.appendChild(l)});stylePromises.set(href,p);return p}
function keepCanonicalVisualLast(){const canonical=[...document.querySelectorAll('link[rel="stylesheet"]')].find(x=>x.getAttribute('href')==='./os737.css'||x.href.endsWith('/os737.css'));if(canonical&&canonical!==document.head.lastElementChild)document.head.appendChild(canonical)}
async function ensureViewStyles(view){const hrefs=viewStyles[view]||[];if(hrefs.length)await Promise.all(hrefs.map(loadCss));keepCanonicalVisualLast();return true}
function syncChrome142(view){if(typeof document==='undefined')return;const p=document.querySelector('#pageTitle');if(p)p.textContent=titles[view]||'KAMIL OS';document.querySelectorAll('[data-view]').forEach(x=>{const on=x.dataset.view===view;x.classList.toggle('on',on);if(on)x.setAttribute('aria-current','page');else x.removeAttribute('aria-current')});const add=document.querySelector('#quickAddBtn');if(add){const hidden=view==='betting';add.classList.toggle('hidden',hidden);if(!hidden){const b=add.querySelector('b'),name=quick[view]||'Přidat';if(b)b.textContent=name;add.title=`Rychle přidat ${name.toLowerCase()} · Ctrl N`}}}
ownEvent1100(OWNER,window,'kamil:view-change',e=>syncChrome142(e.detail));syncChrome142('today');
function warmView(name='today'){const key=validViews41.has(name)?name:'today';if(warmViews.has(key))return warmViews.get(key);const def=viewDefs[key],p=Promise.resolve().then(()=>ensureViewStyles(key)).then(()=>hydrateColdView42(key)).then(()=>load(def[0])).then(m=>{const renderer=m?.[def[1]];if(typeof renderer!=='function')throw new Error(`Chybí renderer ${def[1]} pro ${key}`);return renderer}).catch(err=>{warmViews.delete(key);throw err});warmViews.set(key,p);return p}
export function getViewRenderer41(name='today'){return warmView(name)}
export function prefetchView41(name='today'){const key=validViews41.has(name)?name:'today';if(heavyViews.has(key)&&!document.querySelector(`#view-${key}.on`))return Promise.resolve(false);return warmView(key).then(()=>true).catch(error=>{console.warn(`[viewRuntime41] prefetch ${key}`,error);return false})}
export async function setMoreMode41(){return Promise.resolve(null)}
export async function openCapture41(type='task'){if(type==='money-task'){const m=await load('./personalMoneyActions645.js');return m.createMoneyTask645()}if(type==='document-source'){const btn=document.querySelector('#documentInbox650');if(btn){btn.click();return true}return null}const m=await load('./personalCapture643.js');if(type==='family-task')return m.openPersonalCapture643('task',{area:'Rodina',category:'Rodina'});if(type==='home-task')return m.openPersonalCapture643('task',{area:'Domov',category:'Domov'});if(type==='ticket-task')return m.openPersonalCapture643('task',{area:'Vstupenky',category:'Vstupenky'});return m.openPersonalCapture643(['task','waiting','admin','insurance','contract'].includes(type)?type:'task')}
export async function renderCommandResults41(q=''){try{const c=await load('./capitalCommand100.js');if(c.isCapitalQuestion100(q)){const box=document.querySelector('#commandResults');if(box){const amount=c.parseCapitalAmount100(q);box.classList.remove('hidden');box.innerHTML=`<div class="search-row"><div><b>Rozhodnout, co s ${Number(amount||0).toLocaleString('cs-CZ')} Kč</b><div class="muted">Capital Allocation Brain</div></div><button class="btn" data-capital-command100>Vyhodnotit</button></div>`;box.querySelector('[data-capital-command100]')?.addEventListener('click',()=>{box.classList.add('hidden');c.openCapitalDecision100(q)});return}}}catch{}try{const x=await load('./commandSearch610.js');x.installCommandSearch610?.();if(x.renderExtendedResults610?.(q))return}catch(e){console.warn('[command-search610]',e)}const m=await load('./command.js');return m.renderResults(q)}
export async function executeCommand41(q=''){try{const c=await load('./capitalCommand100.js');if(c.isCapitalQuestion100(q))return c.openCapitalDecision100(q)}catch(e){console.warn('[capital-command100]',e)}try{const x=await load('./commandSearch610.js');x.installCommandSearch610?.();if(x.executeExtendedCommand610?.(q))return true}catch(e){console.warn('[command-search610]',e)}const m=await load('./command.js');return m.execute(q)}
export async function renderExtras41(view='today'){syncChrome142(view);return null}
export function refreshRiskBadge41(){return Promise.resolve(null)}
export async function runPreflight41(){try{const m=await load('./personalHardening650.js');return {...m.personalReleasePreflight650(),safeCore:true,personalUx:APP_RELEASE,canonicalViews:[...validViews41],commandBar:true,inbox:true,betting:true,os2:true}}catch(error){return{ok:false,safeCore:true,personalUx:APP_RELEASE,error:String(error?.message||error)}}}
export function scheduleNotifications41(){return Promise.resolve(null)}
export function warmRuntime41(){return Promise.resolve(null)}
