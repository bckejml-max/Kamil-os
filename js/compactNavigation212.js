const NAV_LABELS={today:'Dnes',tickets:'Vstupenky',family:'Rodina',home:'Domov',money:'Peníze',more:'Dokumenty'};
function labelButton212(button){
 const view=button?.dataset?.view,label=NAV_LABELS[view]||button?.textContent?.trim().replace(/\s+/g,' ');if(!label)return;
 button.title=label;button.setAttribute('aria-label',label);
}
function labelWorkspace212(root=document){
 root.querySelectorAll('.main-nav button[data-view],.bottom-nav button[data-view]').forEach(labelButton212);
 root.querySelectorAll('[data-personal-more]').forEach(b=>{b.title='Více';b.setAttribute('aria-label','Více')});
 root.querySelectorAll('.app-workspace211-buttons button,.ticket-workspace210-tabs button').forEach(b=>{const label=b.textContent.trim().replace(/\s+/g,' ');if(label){b.title=label;b.setAttribute('aria-label',label)}});
 root.querySelectorAll('[data-prev211]').forEach(b=>{b.title='Předchozí panel';b.setAttribute('aria-label','Předchozí panel')});
 root.querySelectorAll('[data-next211]').forEach(b=>{b.title='Další panel';b.setAttribute('aria-label','Další panel')});
 root.querySelectorAll('.ticket-workspace210-pager button').forEach((b,i)=>{if(!b.getAttribute('aria-label')){const label=i===0?'Předchozí panel':'Další panel';b.title=label;b.setAttribute('aria-label',label)}});
 const add=document.querySelector('#quickAddBtn');if(add){add.title='Rychle přidat';add.setAttribute('aria-label','Rychle přidat')}
}
function syncWorkspaceReserve212(){
 const workspace=document.querySelector('.workspace');if(!workspace)return;
 if(matchMedia('(max-width:850px)').matches)workspace.style.removeProperty('padding-bottom');
 else workspace.style.setProperty('padding-bottom','0','important');
}
function ensureStyle212(){
 let link=document.querySelector('link[data-compactnavigation212]');
 if(link?.sheet)return Promise.resolve(link);
 if(!link){
  link=document.createElement('link');link.rel='stylesheet';link.href='./compactNavigation212.css';link.dataset.compactnavigation212='1';document.head.appendChild(link);
 }
 return new Promise(resolve=>{
  let done=false;
  const finish=()=>{if(done)return;done=true;resolve(link)};
  if(link.sheet)return finish();
  link.addEventListener('load',finish,{once:true});
  link.addEventListener('error',finish,{once:true});
  setTimeout(finish,1500);
 });
}
export async function installCompactNavigation212(){
 await ensureStyle212();
 syncWorkspaceReserve212();labelWorkspace212();let timer=0;const rerun=()=>{clearTimeout(timer);timer=setTimeout(()=>{syncWorkspaceReserve212();labelWorkspace212()},60)};
 new MutationObserver(rerun).observe(document.body,{childList:true,subtree:true});window.addEventListener('kamil:view-change',rerun);window.addEventListener('resize',rerun,{passive:true});window.__KAMIL_COMPACT_NAV212__={version:212,refresh:()=>{syncWorkspaceReserve212();labelWorkspace212()},styleReady:true};
}
