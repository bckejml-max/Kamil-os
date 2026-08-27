const ACTIONS213=[
 {key:'focus',icon:'⚡',label:'Co řešit',selector:'[data-ask="Co mám dnes řešit?"],[data-morning-open]'},
 {key:'inbox',icon:'✉',label:'Inbox',selector:'[data-inbox-open]'},
 {key:'waiting',icon:'⌛',label:'Čekám',selector:'[data-waiting-open]',count:true},
 {key:'tomorrow',icon:'→',label:'Zítra',selector:'[data-tomorrow-open]',count:true},
 {key:'week',icon:'7',label:'7 dní',selector:'[data-next7-open]',count:true},
 {key:'close',icon:'✓',label:'Den',selector:'[data-daily-close]',count:true}
];
function ensureStyle213(){if(document.querySelector('link[data-todaydashboard213]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href='./todayDashboard213.css';l.dataset.todaydashboard213='1';document.head.appendChild(l)}
function source213(scope,def){return scope?.querySelector?.(def.selector)||document.querySelector(def.selector)}
function actionButton213(scope,def){const source=source213(scope,def);const count=def.count?source?.querySelector('b')?.textContent?.trim():'';return `<button type="button" class="today213-action today213-${def.key}" data-action213="${def.key}" aria-label="${def.label}"><span class="today213-icon">${def.icon}</span><span class="today213-label">${def.label}</span>${count?`<b>${count}</b>`:''}</button>`}
function findSource213(scope,key){const def=ACTIONS213.find(x=>x.key===key);return def?source213(scope,def):null}
function root213(host){return host?.querySelector('.ux65-today')||host?.querySelector('.ux64-page')||host?.firstElementChild||null}
function fallbackCommander213(){const wrap=document.createElement('section');wrap.className='card today213-fallback';wrap.dataset.today213Fallback='1';wrap.innerHTML='<div class="eyebrow">DNES</div><h2>Všechno důležité je teď v pořádku.</h2><p class="muted">Použij tlačítka vpravo pro Inbox, čekající věci, zítřek nebo přehled dalších 7 dní.</p><button class="btn primary" type="button" data-fallback-focus213>Co mám dnes řešit?</button>';return wrap}
function wireActions213(shell,host){shell.querySelectorAll('[data-action213]').forEach(button=>{if(button.dataset.wired213==='1')return;button.dataset.wired213='1';button.addEventListener('click',()=>findSource213(host,button.dataset.action213)?.click())});shell.querySelector('[data-fallback-focus213]')?.addEventListener('click',()=>findSource213(host,'focus')?.click())}
function syncDashboard213(host,root,shell){if(!host||!root||!shell)return;
 const head=shell.querySelector('.today213-head'),commanderSlot=shell.querySelector('.today213-commander'),status=shell.querySelector('.today213-status');
 const hero=root.querySelector(':scope > .ux65-hero,:scope > .ux64-hero');
 const commander=root.querySelector(':scope > .ux66-priority')||root.querySelector(':scope > .ux64-clear');
 const health=root.querySelector(':scope > .os684-health');
 if(hero&&hero.parentElement!==head)head.appendChild(hero);
 if(commander){commanderSlot.querySelector('[data-today213-fallback]')?.remove();if(commander.parentElement!==commanderSlot)commanderSlot.appendChild(commander)}
 else if(!commanderSlot.firstElementChild)commanderSlot.appendChild(fallbackCommander213());
 if(health&&health.parentElement!==status)status.appendChild(health);
 const actions=shell.querySelector('.today213-actions');
 const nextActions=ACTIONS213.map(x=>actionButton213(host,x)).join('');
 if(actions&&actions.innerHTML!==nextActions)actions.innerHTML=nextActions;
 wireActions213(shell,host);
}
function decorate213(){
 const host=document.querySelector('#todayView'),root=root213(host);if(!root)return false;
 let shell=root.querySelector(':scope > [data-today-dashboard213]');
 if(!shell){shell=document.createElement('section');shell.className='today-dashboard213';shell.dataset.todayDashboard213='1';shell.innerHTML='<div class="today213-head"></div><div class="today213-body"><div class="today213-commander"></div><aside class="today213-actions"></aside></div><div class="today213-status"></div>';root.prepend(shell)}
 root.dataset.dashboard213='1';root.classList.add('today213-root');host.classList.add('today213-host');syncDashboard213(host,root,shell);
 window.__KAMIL_TODAY_DASHBOARD213__={version:220,at:Date.now(),actions:shell.querySelectorAll('[data-action213]').length,commander:!!shell.querySelector('.today213-commander>.ux66-priority,.today213-commander>.ux64-clear'),fallback:!!shell.querySelector('[data-today213-fallback]')};return true;
}
export function installTodayDashboard213(){ensureStyle213();let timer=0;const run=()=>{clearTimeout(timer);timer=setTimeout(()=>decorate213(),30)};const host=document.querySelector('#todayView');if(host)new MutationObserver(run).observe(host,{childList:true,subtree:true});window.addEventListener('kamil:view-change',e=>{if(e.detail==='today')run()});run();setTimeout(run,120);setTimeout(run,350);setTimeout(run,900);setTimeout(run,1800);}
