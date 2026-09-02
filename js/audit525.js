const VERSION='525.0.0';
const TITLES={today:'DNES',inbox:'INBOX',money:'PENÍZE',tickets:'VSTUPENKY',betting:'SÁZENÍ',family:'RODINA',home:'DOMOV',more:'DOKUMENTY'};
let bound=false,timer=0,titleObserver=null;

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
    if(active)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');
  });
}
function sync(view=viewFrom(null)){
  const title=TITLES[view];
  const pageTitle=document.querySelector('#pageTitle');
  if(pageTitle&&title&&pageTitle.textContent!==title)pageTitle.textContent=title;
  if(view)syncNav(view);
  document.documentElement.dataset.audit525='1';
  window.__KAMIL_AUDIT525__={version:VERSION,healthy:true,view,title:title||null,at:Date.now()};
}
function schedule(view){
  queueMicrotask(()=>sync(view||viewFrom(null)));
  clearTimeout(timer);
  timer=setTimeout(()=>sync(view||viewFrom(null)),90);
}
export function installAudit525(){
  ensureCss();
  sync();
  if(bound)return;
  bound=true;
  window.addEventListener('kamil:view-change',event=>schedule(viewFrom(event.detail)));
  window.addEventListener('popstate',()=>schedule());
  const title=document.querySelector('#pageTitle');
  if(title){
    titleObserver=new MutationObserver(()=>schedule());
    titleObserver.observe(title,{childList:true,characterData:true,subtree:true});
  }
  setTimeout(()=>sync(),350);
}
