import {store} from './state.js';
import {profileBootstrap31} from './profileBootstrap31.js';
import {qs,h} from './utils.js';
const id='profileBootstrap31Host';

function markup(r){
 const total=r.itemSignal;
 return `<div class="card"><div class="card-head"><div><div class="eyebrow">PERSONAL DATA / RECOVERY 31.2</div><h2>Tvoje data nejsou na tomto zařízení.</h2><p class="muted">Kamil OS běží správně, ale tento browser má prázdný lokální profil. Pokud jsi appku používal jinde, připoj cloud nebo obnov zálohu.</p></div><span class="status warn">DATA CHYBÍ</span></div><div class="metric-strip"><div class="metric"><span>Lokální položky</span><b>${total}</b></div><div class="metric"><span>XTB účty</span><b>${r.counts.xtbAccounts}</b></div><div class="metric"><span>Vstupenky</span><b>${r.counts.tickets}</b></div><div class="metric"><span>Úkoly</span><b>${r.counts.tasks}</b></div></div><div class="decision-note">Nic nemažu ani nepřepisuju. Připojení cloudu nejdřív ověří účet a potom načte jeho uložený stav.</div><div class="row"><span><b>Nejrychlejší cesta</b><small class="muted" style="display:block">Připojit existující cloudový profil e-mailem, bez nutnosti znát heslo.</small></span><button class="btn primary" data-bootstrap-connect>Připojit moje data</button></div><div class="row"><span><b>Nemáš cloud session?</b><small class="muted" style="display:block">Záloha z Kamil OS jde stále obnovit přes systémové nástroje.</small></span><button class="btn" data-bootstrap-system>Systém</button></div></div>`;
}
function render(){
 const root=qs('#todayView');if(!root)return;const active=qs('#view-today')?.classList.contains('on');const r=profileBootstrap31(store.get(),store.meta());let host=qs(`#${id}`,root);
 if(!active||!r.needsRecovery){host?.remove();return}
 if(!host){host=document.createElement('div');host.id=id;const head=root.querySelector('.view-head');if(head)head.insertAdjacentElement('afterend',host);else root.prepend(host)}
 host.innerHTML=markup(r);host.querySelector('[data-bootstrap-connect]')?.addEventListener('click',()=>window.dispatchEvent(new CustomEvent('kamil:cloud-login',{detail:{reason:'recovery'}})));host.querySelector('[data-bootstrap-system]')?.addEventListener('click',()=>{window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:'more'}));queueMicrotask(()=>window.dispatchEvent(new CustomEvent('kamil:more',{detail:'system'})))})
}
function start(){const root=qs('#todayView');if(!root)return;new MutationObserver(()=>queueMicrotask(render)).observe(root,{childList:true,subtree:false});store.subscribe(()=>queueMicrotask(render));window.addEventListener('kamil:navigate',()=>queueMicrotask(render));render()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
