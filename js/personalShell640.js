import {APP_VERSION} from './releaseMeta.js';
import {qs,qsa} from './utils.js';
import {openPersonalMore640} from './personalMore640.js';

const TITLES={today:'DNES',tickets:'RODINA',home:'DOMOV',money:'PENÍZE',more:'DOKUMENTY'};
const ADD={today:'Osobní úkol',home:'Osobní položka',money:'Pohledávka'};
let bound=false;
function apply(view='today'){
 const page=qs('#pageTitle');if(page)page.textContent=TITLES[view]||'DNES';
 qsa('.version').forEach(x=>x.textContent=APP_VERSION);document.title=`Kamil OS ${APP_VERSION}`;
 const add=qs('#quickAddBtn');if(add){const show=!!ADD[view];add.classList.toggle('hidden',!show);const b=qs('b',add);if(b&&show)b.textContent=ADD[view]}
}
export function bindPersonalShell640(){
 if(bound)return;bound=true;
 qsa('[data-personal-more]').forEach(b=>b.addEventListener('click',()=>openPersonalMore640()));
 window.addEventListener('kamil:view-change',e=>apply(e.detail));
 apply('today');
}
