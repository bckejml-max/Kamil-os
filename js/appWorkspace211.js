const VIEW_META={today:{host:'#todayView',title:'Dnes'},money:{host:'#moneyView',title:'Peníze'},home:{host:'#homeView',title:'Domov'},more:{host:'#moreView',title:'Dokumenty'}};
const EXCLUDE='.view-head,.money-filters,.home-filters,.document-filters,.ux65-footnote,[data-app-workspace211]';

function ensureStyle211(){if(document.querySelector('link[data-appworkspace211]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href='./appWorkspace211.css';l.dataset.appworkspace211='1';document.head.appendChild(l)}
function titleOf211(el,fallback='Panel'){
 const text=el?.querySelector?.('.eyebrow,h1,h2,h3,b')?.textContent?.trim()||el?.getAttribute?.('aria-label')||fallback;
 return text.replace(/\s+/g,' ').slice(0,54)||fallback;
}
function root211(host){return host.querySelector(':scope > .ux64-page')||host.firstElementChild||host}
function virtualRows211(el){
 if(el.matches?.('.ux64-doc-list,.ux64-contract-grid'))return [...el.children].filter(x=>x.nodeType===1).map((row,i)=>({el:row,wrapper:el,title:titleOf211(row,`Položka ${i+1}`),nested:true}));
 const rows=[...el.querySelectorAll?.(':scope > .row,:scope > .ux64-row')||[]].filter(x=>x.nodeType===1);
 if(rows.length>5)return rows.map((row,i)=>({el:row,wrapper:el,title:titleOf211(row,`Položka ${i+1}`),nested:true}));
 return null;
}
function entries211(root){
 const out=[];
 [...root.children].forEach((el,i)=>{
  if(el.matches?.(EXCLUDE))return;
  if(el.tagName==='NAV'||el.hidden)return;
  const nested=virtualRows211(el);
  if(nested?.length){out.push(...nested);return}
  if(['SECTION','ARTICLE','DIV'].includes(el.tagName))out.push({el,wrapper:null,title:titleOf211(el,`Panel ${i+1}`),nested:false});
 });
 return out;
}
function reset211(root){
 root.querySelectorAll('.app-panel211,.app-panel211-on,.app-wrapper211-on,.app-workspace211-hide').forEach(el=>el.classList.remove('app-panel211','app-panel211-on','app-wrapper211-on','app-workspace211-hide'));
}
function hideChrome211(root){root.querySelectorAll(':scope > .view-head,:scope > nav,:scope > .money-filters,:scope > .home-filters,:scope > .document-filters,:scope > .ux65-footnote').forEach(x=>x.classList.add('app-workspace211-hide'))}

export function installViewWorkspace211(view){
 if(view==='tickets')return null;const meta=VIEW_META[view];if(!meta)return null;ensureStyle211();
 const host=document.querySelector(meta.host);if(!host)return null;const root=root211(host);if(!root||root===host&&host.children.length<2)return null;
 reset211(root);hideChrome211(root);const entries=entries211(root);if(!entries.length)return null;
 let shell=host.querySelector(':scope > [data-app-workspace211]');if(!shell){shell=document.createElement('section');shell.dataset.appWorkspace211='1';shell.className='app-workspace211';host.prepend(shell)}
 host.classList.add('app-host211');root.classList.add('app-root211');
 let index=Math.min(Number(shell.dataset.index||0)||0,Math.max(0,entries.length-1));
 const draw=()=>{
  const current=entries[index];
  const wrappers=new Set(entries.map(x=>x.wrapper).filter(Boolean));
  [...root.children].forEach(x=>{if(x.matches?.(EXCLUDE)||x===shell)return;x.classList.toggle('app-workspace211-hide',!entries.some(e=>e.el===x||e.wrapper===x))});
  entries.forEach(e=>{e.el.classList.add('app-panel211');e.el.classList.toggle('app-panel211-on',e===current)});
  wrappers.forEach(w=>w.classList.toggle('app-wrapper211-on',current?.wrapper===w));
  const start=Math.max(0,Math.min(index-1,Math.max(0,entries.length-4))),windowEntries=entries.slice(start,start+4);
  shell.innerHTML=`<div class="app-workspace211-top"><div><div class="eyebrow">OS 211 · NO-SCROLL</div><h1>${meta.title}</h1></div><span>${index+1} / ${entries.length}</span></div><div class="app-workspace211-buttons">${windowEntries.map((e,j)=>`<button type="button" data-jump211="${start+j}" class="${start+j===index?'on':''}">${e.title}</button>`).join('')}</div><div class="app-workspace211-pager"><button type="button" data-prev211 ${entries.length<2?'disabled':''}>←</button><strong>${current?.title||meta.title}</strong><button type="button" data-next211 ${entries.length<2?'disabled':''}>→</button></div>`;
  shell.querySelectorAll('[data-jump211]').forEach(b=>b.onclick=()=>{index=Number(b.dataset.jump211);shell.dataset.index=String(index);draw()});
  shell.querySelector('[data-prev211]')?.addEventListener('click',()=>{index=(index-1+entries.length)%entries.length;shell.dataset.index=String(index);draw()});
  shell.querySelector('[data-next211]')?.addEventListener('click',()=>{index=(index+1)%entries.length;shell.dataset.index=String(index);draw()});
  shell.dataset.index=String(index);
 };
 draw();return{draw,count:entries.length,get index(){return index}};
}

let timer=0;
export function installAppWorkspaces211(){
 ensureStyle211();
 const run=()=>{const active=document.querySelector('.view.on')?.id?.replace('view-','')||'today';installViewWorkspace211(active)};
 window.addEventListener('kamil:view-change',e=>setTimeout(()=>installViewWorkspace211(e.detail),80));
 ['today','money','home','more'].forEach(view=>{const host=document.querySelector(VIEW_META[view].host);if(!host||host.dataset.workspaceObserver211)return;host.dataset.workspaceObserver211='1';new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(()=>{const active=document.querySelector('.view.on')?.id?.replace('view-','');if(active===view)installViewWorkspace211(view)},120)}).observe(host,{childList:true,subtree:true})});
 setTimeout(run,120);setTimeout(run,900);window.__KAMIL_APP_WORKSPACE211__={install:installViewWorkspace211};
}
