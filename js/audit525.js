const VERSION='526.0.1';
const TITLES={today:'DNES',inbox:'INBOX',money:'PENÍZE',tickets:'VSTUPENKY',betting:'SÁZENÍ',family:'RODINA',home:'DOMOV',more:'DOKUMENTY'};
let bound=false,timer=0,titleObserver=null,syncObserver=null;

function ensureCss(){
  if(document.querySelector('link[data-audit525]'))return;
  const link=document.createElement('link');
  link.rel='stylesheet';
  link.href=new URL('../audit525.css',import.meta.url).href;
  link.dataset.audit525='1';
  document.head.appendChild(link);
}
function viewFrom(detail){
  const requested=typeof detail==='string'?detail:detail?.view;
  if(requested&&TITLES[requested])return requested;
  const active=document.querySelector('[id^="view-"].on');
  return active?.id?.replace(/^view-/,'')||null;
}
function syncNav(view){
  if(!view)return;
  document.querySelectorAll('[data-view]').forEach(el=>{
    const active=el.dataset.view===view;
    el.classList.toggle('on',active);
    if(active){if(el.getAttribute('aria-current')!=='page')el.setAttribute('aria-current','page')}else if(el.hasAttribute('aria-current'))el.removeAttribute('aria-current');
  });
}
function syncLocalStatus(){
  const el=document.querySelector('#syncStatus');
  if(!el?.classList.contains('local'))return;
  if(el.onclick)el.onclick=null;if(el.onkeydown)el.onkeydown=null;
  if(el.hasAttribute('role'))el.removeAttribute('role');if(el.hasAttribute('tabindex'))el.removeAttribute('tabindex');
  if(el.style.cursor!=='default')el.style.cursor='default';
  const title='Data jsou uložená na tomto zařízení. Cloudové přihlášení je v osobním režimu skryté.';
  if(el.title!==title)el.title=title;
}
function sync(view=viewFrom(null)){
  const title=TITLES[view];
  const pageTitle=document.querySelector('#pageTitle');
  if(pageTitle&&title&&pageTitle.textContent!==title)pageTitle.textContent=title;
  if(view)syncNav(view);
  syncLocalStatus();
  document.documentElement.dataset.audit525='1';
  document.documentElement.dataset.audit526='1';
  window.__KAMIL_AUDIT525__={version:VERSION,healthy:true,view,title:title||null,at:Date.now()};
  window.__KAMIL_AUDIT526__=window.__KAMIL_AUDIT525__;
}
function schedule(view){
  queueMicrotask(()=>sync(view||viewFrom(null)));
  clearTimeout(timer);
  timer=setTimeout(()=>sync(view||viewFrom(null)),90);
}
export function installAudit525(){
  ensureCss();sync();if(bound)return;bound=true;
  window.addEventListener('kamil:view-change',event=>schedule(viewFrom(event.detail)));
  window.addEventListener('popstate',()=>schedule());
  const title=document.querySelector('#pageTitle');
  if(title){titleObserver=new MutationObserver(()=>schedule());titleObserver.observe(title,{childList:true,characterData:true,subtree:true})}
  const syncStatus=document.querySelector('#syncStatus');
  if(syncStatus){syncObserver=new MutationObserver(()=>syncLocalStatus());syncObserver.observe(syncStatus,{attributes:true,childList:true,subtree:true})}
  setTimeout(()=>sync(),350);
}
