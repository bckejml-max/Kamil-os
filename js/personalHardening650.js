import {qs,qsa} from './utils.js';
import {openPersonalCapture643} from './personalCapture643.js';

const TITLES={today:'DNES',tickets:'RODINA',home:'DOMOV',money:'PENÍZE',more:'DOKUMENTY'};
let current='today',bound=false;
const capture=()=>current==='home'?'contract':current==='more'?'insurance':'task';
function apply(view=current){current=TITLES[view]?view:current;const page=qs('#pageTitle');if(page)page.textContent=TITLES[current];qsa('.version').forEach(x=>x.classList.add('hidden'));const sub=qs('.sidebar-sub');if(sub)sub.textContent='Osobní asistent';const add=qs('#quickAddBtn');if(add){const b=qs('b',add);if(b)b.textContent='Přidat'}document.title='Kamil OS'}
export function bindPersonalHardening650(){if(bound)return;bound=true;window.addEventListener('kamil:view-change',e=>apply(e.detail));document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='n'){e.preventDefault();e.stopImmediatePropagation();openPersonalCapture643(capture())}},true);apply('today');if(typeof window!=='undefined'){window.__KAMIL_PERSONAL_HARDENING_650__={bound:true,at:Date.now()};window.__KAMIL_PERSONAL_HARDENING_660__={bound:true,at:Date.now(),ticketIntelligence:true}}}
export function personalReleasePreflight650(){const text=document?.body?.innerText||'',forbidden=['VSTUPENKY','Pohledávka','Personal Home','KAMIL OS 64.1 / DNES','Pokrytí osobních dat'];const found=forbidden.filter(x=>text.includes(x)),primary=document?.querySelectorAll?.('.ux65-primary')?.length||0,dataHealth=document?.querySelectorAll?.('.ux64-data-health')?.length||0;return{ok:found.length===0&&primary<=1&&dataHealth===0,found,primaryCards:primary,dataHealthCards:dataHealth,views:Object.values(TITLES),assistant:'66.0'}}
