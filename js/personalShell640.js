import {h,qs,qsa,modal} from './utils.js';
import {openPersonalMore640} from './personalMore640.js';
import {answerPersonalQuestion640} from './personalAsk640.js';
import {openPersonalCapture643} from './personalCapture643.js';
import {openVaultRecord640} from './personalDocuments640.js';
import {openPersonalWaiting650} from './personalWaiting650.js';
import {markPersonalUsage650} from './personalUsage650.js';
import {startTicketMarketAuto656} from './ticketMarketWatch656.js';
import {appendCommandCenter800,openCommandCenter800} from './personalCommand800.js';

const TITLES={today:'DNES',tickets:'VSTUPENKY',family:'RODINA',home:'DOMOV',money:'PENÍZE',more:'DOKUMENTY'};
const OS80_RE=/command center|centrum|co hoří|co hori|nejdůležit|nejdulezit|ředitel|reditel/i;
let bound=false,currentView='today',todayObserver=null;
const captureType=()=>currentView==='home'?'contract':currentView==='more'?'insurance':'task';
const nav=v=>window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:v}));
function ensureOs80Css(){if(document.querySelector('link[data-os80-css]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href='./personal80.css';l.dataset.os80Css='1';document.head.appendChild(l)}
function mountOs80(){ensureOs80Css();const host=qs('#todayView');if(host)appendCommandCenter800(host)}
function watchToday800(){const host=qs('#todayView');if(!host||todayObserver)return;todayObserver=new MutationObserver(()=>{if(currentView==='today'&&!host.querySelector('[data-os80-command]'))requestAnimationFrame(mountOs80)});todayObserver.observe(host,{childList:true})}
function apply(view='today',track=true){
 currentView=view;const page=qs('#pageTitle');if(page)page.textContent=TITLES[view]||'DNES';document.title='Kamil OS';if(track)markPersonalUsage650('view',TITLES[view]||'DNES');
 qsa('.version').forEach(x=>x.classList.add('hidden'));
 const add=qs('#quickAddBtn');if(add){add.classList.remove('hidden');const b=qs('b',add);if(b)b.textContent='Přidat';add.title='Přidat osobní úkol, čekání, administrativu nebo smlouvu'}
 if(view==='today')requestAnimationFrame(mountOs80);
}
async function openResult(result){if(!result)return null;markPersonalUsage650('action','search-result');if(result.type==='data')return openVaultRecord640(result.id);if(result.type==='waiting')return openPersonalWaiting650();if(result.route==='family')return nav('family');if(result.route==='documents')return nav('more');if(['today','home','money'].includes(result.route))return nav(result.route);return nav('today')}
async function askGlobal(){
 const input=qs('#commandInput'),q=input?.value.trim();if(!q){input?.focus();return null}markPersonalUsage650('action','ask-or-search');if(OS80_RE.test(q)){if(input)input.value='';return openCommandCenter800()}const a=answerPersonalQuestion640(q);if(input)input.value='';
 const body=`<div class="card"><div class="eyebrow">KAMIL OS</div><h2>${h(a.title)}</h2>${a.body?`<p>${h(a.body)}</p>`:''}${a.lines?.length?`<div>${a.lines.map(x=>`<div class="row"><span>${h(x)}</span></div>`).join('')}</div>`:''}</div>`;
 const buttons=(a.results||[]).slice(0,6).map((r,i)=>({label:`Otevřít · ${r.title}`,value:`result:${i}`,primary:i===0}));buttons.push({label:'Zavřít',value:null,primary:!buttons.length});const choice=await modal('Kamil OS',body,buttons);if(String(choice||'').startsWith('result:'))return openResult(a.results[Number(choice.split(':')[1])]);return choice;
}
export function bindPersonalShell640(){
 if(bound)return;bound=true;qsa('[data-personal-more]').forEach(b=>b.addEventListener('click',()=>{markPersonalUsage650('action','more');openPersonalMore640()}));window.addEventListener('kamil:view-change',e=>apply(e.detail,true));window.addEventListener('kamil:release-stamp',()=>apply(currentView,false));
 const input=qs('#commandInput'),go=qs('#commandGo');if(input){input.placeholder='Zeptej se: co hoří, ředitel, peníze, vstupenky…';input.oninput=null;input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();askGlobal()}if(e.key==='Escape'){input.value='';input.blur()}}}if(go){go.textContent='Najít / zeptat se';go.onclick=askGlobal}
 const add=qs('#quickAddBtn');if(add)add.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();markPersonalUsage650('action','capture');openPersonalCapture643(captureType())},true);apply('today',true);watchToday800();setTimeout(mountOs80,250);startTicketMarketAuto656();window.__KAMIL_PERSONAL_SHELL_BOUND__=true;window.__KAMIL_OS80_BOUND__=true;
}
