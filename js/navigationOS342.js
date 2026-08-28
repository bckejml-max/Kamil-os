const VERSION=342;
let current='today',transitions=0,bound=false,lastSource='boot',corrections=0,guard=null,repairing=false,observed=0,owned=[];

const discoverViews=()=>[...document.querySelectorAll('[id^="view-"]')].filter(el=>/^view-[a-z0-9-]+$/i.test(el.id));
const viewNodes=()=>owned.length?owned:discoverViews();
const viewFromDom=()=>viewNodes().find(x=>x.classList.contains('on'))?.id?.replace(/^view-/,'')||current||'today';
const valid=view=>typeof view==='string'&&!!document.querySelector(`#view-${CSS.escape(view)}`);
const normalize=view=>valid(view)?view:'today';

function publish(){
 window.__KAMIL_NAVIGATION342__={version:VERSION,navigate,current:()=>current,transitions,lastSource,corrections,observed,healthy:observed>0};
}

function enforceDom(){
 if(repairing)return;
 const nodes=viewNodes();
 if(!nodes.length)return;
 const target=`view-${current}`;
 let dirty=false;
 for(const el of nodes){
  const shouldOn=el.id===target;
  if(!el.classList.contains('view')||el.classList.contains('on')!==shouldOn){dirty=true;break}
 }
 if(!dirty)return;
 repairing=true;
 corrections++;
 for(const el of nodes){
  el.classList.add('view');
  el.classList.toggle('on',el.id===target);
 }
 repairing=false;
 publish();
}

function sync(detail){
 const next=typeof detail==='string'?detail:detail?.view;
 if(!next||!valid(next))return;
 current=next;
 transitions++;
 enforceDom();
 publish();
}

export function navigate(view,opts={}){
 const next=normalize(view),active=viewFromDom();
 current=active;
 if(next===active){enforceDom();return false}
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
 owned=discoverViews();
 observed=owned.length;
 current=viewFromDom();
 document.documentElement.dataset.navigation342='1';
 document.addEventListener('click',captureViewClick,true);
 window.addEventListener('kamil:view-change',e=>sync(e.detail));
 if(observed){
  guard=new MutationObserver(()=>queueMicrotask(enforceDom));
  owned.forEach(el=>guard.observe(el,{attributes:true,attributeFilter:['class']}));
 }
 enforceDom();
 publish();
}
