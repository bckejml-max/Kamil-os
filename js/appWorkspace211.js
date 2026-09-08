const VIEW_META={today:{host:'#todayView',title:'Dnes'},money:{host:'#moneyView',title:'Peníze'},home:{host:'#homeView',title:'Domov'},more:{host:'#moreView',title:'Dokumenty'}};
const LEGACY_CLASSES=['app-panel211','app-panel211-on','app-wrapper211-on','app-workspace211-hide','app-root211'];

function cleanupHost211(host){
 if(!host)return false;
 host.querySelectorAll(':scope > [data-app-workspace211]').forEach(x=>x.remove());
 host.classList.remove('app-host211');
 delete host.dataset.workspaceObserver211;
 host.querySelectorAll('*').forEach(el=>LEGACY_CLASSES.forEach(c=>el.classList.remove(c)));
 return true;
}

export function installViewWorkspace211(view){
 if(view==='tickets')return null;
 const meta=VIEW_META[view];
 if(!meta)return null;
 const host=document.querySelector(meta.host);
 if(!host)return null;
 cleanupHost211(host);
 document.documentElement.dataset.workspace211='compat';
 return{draw:()=>cleanupHost211(host),count:0,get index(){return 0},legacy:false};
}

export function installAppWorkspaces211(){
 const cleanAll=()=>Object.values(VIEW_META).forEach(meta=>cleanupHost211(document.querySelector(meta.host)));
 cleanAll();
 window.addEventListener('kamil:view-change',e=>{if(e.detail!=='tickets')setTimeout(()=>installViewWorkspace211(e.detail),40)});
 setTimeout(cleanAll,150);
 setTimeout(cleanAll,900);
 window.__KAMIL_APP_WORKSPACE211__={version:211,mode:'compat-cleanup',install:installViewWorkspace211,cleanup:cleanAll};
}
