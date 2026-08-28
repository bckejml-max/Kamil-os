const VERSION=342;
let current='today',transitions=0,bound=false,lastSource='boot';

const viewFromDom=()=>document.querySelector('.view.on')?.id?.replace(/^view-/,'')||'today';
const valid=view=>typeof view==='string'&&!!document.querySelector(`#view-${CSS.escape(view)}`);
const normalize=view=>valid(view)?view:'today';

function sync(detail){
 const next=typeof detail==='string'?detail:detail?.view;
 if(!next||!valid(next))return;
 current=next;
 transitions++;
 window.__KAMIL_NAVIGATION342__={version:VERSION,navigate,current:()=>current,transitions,lastSource,healthy:true};
}

export function navigate(view,opts={}){
 const next=normalize(view),active=viewFromDom();
 current=active;
 if(next===active)return false;
 lastSource=opts.source||'api';
 window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:next}));
 return true;
}

function captureViewClick(e){
 const button=e.target.closest?.('[data-view]');
 if(!button)return;
 const view=button.dataset.view;
 if(!valid(view))return;
 e.preventDefault();
 e.stopImmediatePropagation();
 navigate(view,{source:'click'});
}

export function installNavigation342(){
 if(bound)return;
 bound=true;
 current=viewFromDom();
 document.documentElement.dataset.navigation342='1';
 document.addEventListener('click',captureViewClick,true);
 window.addEventListener('kamil:view-change',e=>sync(e.detail));
 window.__KAMIL_NAVIGATION342__={version:VERSION,navigate,current:()=>current,transitions,lastSource,healthy:true};
}
