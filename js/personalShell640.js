import {APP_VERSION} from './releaseMeta.js';
import {h,qs,qsa,modal} from './utils.js';
import {openPersonalMore640} from './personalMore640.js';
import {answerPersonalQuestion640} from './personalAsk640.js';
import {openPersonalCapture643} from './personalCapture643.js';

const TITLES={today:'DNES',tickets:'RODINA',home:'DOMOV',money:'PENÍZE',more:'DOKUMENTY'};
let bound=false,currentView='today';
const captureType=()=>currentView==='home'?'contract':currentView==='more'?'insurance':'task';
function apply(view='today'){
 currentView=view;const page=qs('#pageTitle');if(page)page.textContent=TITLES[view]||'DNES';
 qsa('.version').forEach(x=>x.textContent=APP_VERSION);document.title=`Kamil OS ${APP_VERSION}`;
 const add=qs('#quickAddBtn');if(add){add.classList.remove('hidden');const b=qs('b',add);if(b)b.textContent='Přidat osobní věc';add.title='Přidat osobní úkol, čekání, administrativu nebo smlouvu'}
}
async function askGlobal(){
 const input=qs('#commandInput'),q=input?.value.trim();if(!q){input?.focus();return null}
 const a=answerPersonalQuestion640(q);if(input)input.value='';
 const body=`<div class="card"><div class="eyebrow">ZEPTEJ SE KAMIL OS</div><h2>${h(a.title)}</h2>${a.body?`<p>${h(a.body)}</p>`:''}${a.lines?.length?`<div>${a.lines.map(x=>`<div class="row"><span>${h(x)}</span></div>`).join('')}</div>`:''}</div>`;
 return modal('Kamil OS / odpověď',body,[{label:'Zavřít',value:null,primary:true}]);
}
export function bindPersonalShell640(){
 if(bound)return;bound=true;
 qsa('[data-personal-more]').forEach(b=>b.addEventListener('click',()=>openPersonalMore640()));
 window.addEventListener('kamil:view-change',e=>apply(e.detail));
 const input=qs('#commandInput'),go=qs('#commandGo');if(input){input.placeholder='Zeptej se Kamil OS: Co mi končí? Kolik platím měsíčně?';input.oninput=null;input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();askGlobal()}if(e.key==='Escape'){input.value='';input.blur()}}}if(go){go.textContent='Zeptat se';go.onclick=askGlobal}
 const add=qs('#quickAddBtn');if(add)add.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();openPersonalCapture643(captureType())},true);
 apply('today');
}
