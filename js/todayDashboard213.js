const ACTIONS213=[
 {key:'focus',icon:'⚡',label:'Co řešit',selector:'[data-ask="Co mám dnes řešit?"],[data-morning-open]'},
 {key:'inbox',icon:'✉',label:'Inbox',selector:'[data-inbox-open]'},
 {key:'waiting',icon:'⌛',label:'Čekám',selector:'[data-waiting-open]',count:true},
 {key:'tomorrow',icon:'→',label:'Zítra',selector:'[data-tomorrow-open]',count:true},
 {key:'week',icon:'7',label:'7 dní',selector:'[data-next7-open]',count:true},
 {key:'close',icon:'✓',label:'Den',selector:'[data-daily-close]',count:true}
];
function ensureStyle213(){if(document.querySelector('link[data-todaydashboard213]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href='./todayDashboard213.css';l.dataset.todaydashboard213='1';document.head.appendChild(l)}
function actionButton213(root,def){const source=root.querySelector(def.selector);if(!source)return'';const count=def.count?source.querySelector('b')?.textContent?.trim():'';return `<button type="button" class="today213-action today213-${def.key}" data-action213="${def.key}" aria-label="${def.label}"><span class="today213-icon">${def.icon}</span><span class="today213-label">${def.label}</span>${count?`<b>${count}</b>`:''}</button>`}
function findSource213(root,key){const def=ACTIONS213.find(x=>x.key===key);return def?root.querySelector(def.selector):null}
function root213(host){return host?.querySelector('.ux65-today')||host?.querySelector('.ux64-page')||host?.firstElementChild||null}
function decorate213(){
 const host=document.querySelector('#todayView'),root=root213(host);if(!root||root.matches?.('[data-today-dashboard213]')||root.dataset.dashboard213==='1')return false;
 const hero=root.querySelector(':scope > .ux65-hero,:scope > .ux64-hero'),commander=root.querySelector(':scope > .ux66-priority')||root.querySelector(':scope > .ux64-clear'),health=root.querySelector(':scope > .os684-health');
 const shell=document.createElement('section');shell.className='today-dashboard213';shell.dataset.todayDashboard213='1';shell.innerHTML=`<div class="today213-head"></div><div class="today213-body"><div class="today213-commander"></div><aside class="today213-actions">${ACTIONS213.map(x=>actionButton213(root,x)).join('')}</aside></div><div class="today213-status"></div>`;
 root.prepend(shell);if(hero)shell.querySelector('.today213-head').appendChild(hero);if(commander)shell.querySelector('.today213-commander').appendChild(commander);if(health)shell.querySelector('.today213-status').appendChild(health);
 shell.querySelectorAll('[data-action213]').forEach(button=>button.addEventListener('click',()=>findSource213(root,button.dataset.action213)?.click()));
 root.dataset.dashboard213='1';root.classList.add('today213-root');host.classList.add('today213-host');
 window.__KAMIL_TODAY_DASHBOARD213__={version:213,at:Date.now(),actions:shell.querySelectorAll('[data-action213]').length,commander:!!commander};return true;
}
function syncLateHealth213(){const host=document.querySelector('#todayView'),root=root213(host),shell=root?.querySelector?.('[data-today-dashboard213]'),health=root?.querySelector?.(':scope > .os684-health');if(root?.dataset?.dashboard213==='1'&&shell&&health)shell.querySelector('.today213-status')?.appendChild(health)}
export function installTodayDashboard213(){ensureStyle213();let timer=0;const run=()=>{clearTimeout(timer);timer=setTimeout(()=>{decorate213();syncLateHealth213()},40)};const host=document.querySelector('#todayView');if(host)new MutationObserver(run).observe(host,{childList:true,subtree:true});window.addEventListener('kamil:view-change',e=>{if(e.detail==='today')run()});run();setTimeout(run,250);setTimeout(run,900);}
