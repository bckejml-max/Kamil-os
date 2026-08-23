import {APP_VERSION} from './releaseMeta.js';
import {qs,qsa} from './utils.js';
import {openPersonalCapture643} from './personalCapture643.js';

const TITLES={today:'DNES',tickets:'RODINA',home:'DOMOV',money:'PENÍZE',more:'DOKUMENTY'};
let current='today',bound=false;

function applyChrome648(view=current){
 current=TITLES[view]?view:current;
 const page=qs('#pageTitle');if(page)page.textContent=TITLES[current];
 qsa('.version').forEach(x=>x.textContent=APP_VERSION);
 const sub=qs('.sidebar-sub');if(sub)sub.textContent='Osobní přehled';
 const add=qs('#quickAddBtn');if(add){const b=qs('b',add);if(b)b.textContent='Přidat osobní věc';add.title='Přidat osobní úkol, čekání, administrativu nebo smlouvu'}
 const input=qs('#commandInput');if(input)input.placeholder='Zeptej se Kamil OS: Co mám dnes řešit? Co mi končí?';
 const go=qs('#commandGo');if(go)go.textContent='Zeptat se';
}

export function bindPersonalHardening648(){
 if(bound)return;bound=true;
 window.addEventListener('kamil:view-change',e=>applyChrome648(e.detail));
 document.addEventListener('keydown',e=>{
  if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='n'){
   e.preventDefault();e.stopImmediatePropagation();openPersonalCapture643(current==='home'?'contract':current==='more'?'insurance':'task');
  }
 },true);
 applyChrome648('today');
 if(typeof window!=='undefined')window.__KAMIL_PERSONAL_HARDENING_648__={version:APP_VERSION,bound:true,at:Date.now()};
}

export function personalReleasePreflight648(){
 const forbidden=['VSTUPENKY','Pohledávka','Personal Home'];
 const text=document?.body?.innerText||'';
 const found=forbidden.filter(x=>text.includes(x));
 return{ok:found.length===0,found,version:APP_VERSION,views:Object.values(TITLES)};
}
