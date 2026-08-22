(function(){
  const VERSION='43.7.1';
  const SNAPSHOT_KEY='kamil-os-fast-snapshot-43-7';
  const BOOT_KEY='kamil-os-41-boot-summary';
  const THEME_KEY='kamil-os-theme33';
  const root=document.documentElement;
  const now=Date.now();
  const coreStyles=['./styles.css','./theme33.css'];
  const detailStyles=['./today25.css','./personal29.css'];
  const pageTitles={today:'DNES',money:'PENÍZE',tickets:'VSTUPENKY',home:'DOMOV',more:'VÍCE'};
  let earlyView='today';
  window.__KAMIL_SAFE_CORE__=true;
  function parse(raw,fallback=null){try{return JSON.parse(raw)}catch{return fallback}}
  function bootInfo(){try{return parse(localStorage.getItem(BOOT_KEY)||'null',{})||{}}catch{return{}}}
  function applyTheme(){try{const theme=localStorage.getItem(THEME_KEY)||'light',light=theme!=='dark';root.classList.toggle('theme-light',light);root.classList.toggle('theme-dark',!light);root.dataset.theme=light?'light':'dark';root.style.colorScheme=light?'light':'dark'}catch{}document.title=`Kamil OS ${VERSION}`;document.querySelectorAll('.version').forEach(x=>x.textContent=VERSION)}
  function fallbackHtml(){const b=bootInfo(),tasks=Number(b.tasks||0),waiting=Number(b.waiting||0),tickets=Number(b.tickets||0),inbox=Number(b.inbox||0);return `<div class="view-head"><div><div class="eyebrow">KAMIL OS ${VERSION} / SAFE CORE</div><h1>Kamil OS je připravený.</h1><p>Dočasně běží jen základní jádro. Žádné background analýzy, autopilot ani skryté prefetch joby se nespouští.</p></div></div><div class="metric-strip"><div class="metric"><span>Otevřené úkoly</span><b>${tasks}</b></div><div class="metric"><span>Waiting For</span><b>${waiting}</b></div><div class="metric"><span>Inbox</span><b>${inbox}</b></div><div class="metric"><span>Aktivní vstupenky</span><b>${tickets}</b></div></div><div class="decision-note">SAFE CORE 43.7.1: sekce se načte teprve po skutečném kliknutí. Stabilita má teď přednost před background inteligencí.</div>`}
  function paintInstant(){const host=document.querySelector('#todayView');if(!host)return;let html='';try{const snap=parse(localStorage.getItem(SNAPSHOT_KEY)||'null');if(snap?.html&&typeof snap.html==='string'&&snap.html.length<120000&&now-Number(snap.at||0)<2*86400000)html=snap.html}catch{}host.innerHTML=html||fallbackHtml();host.dataset.instantShell='1';host.dataset.fastShell='1';window.__KAMIL_SNAPSHOT_HIT__=!!html;window.__KAMIL_INSTANT_SHELL_AT__=performance.now()}
  function placeholder(view){const host=document.querySelector(`#${view}View`);if(!host||host.innerHTML.trim())return;host.innerHTML=`<div class="view-head"><div><div class="eyebrow">${pageTitles[view]||'KAMIL OS'} / SAFE CORE</div><h1>Sekce je otevřená.</h1><p>Načítám jen tuto sekci. Ostatní části zůstávají vypnuté.</p></div></div>`}
  function earlyNavigate(view){if(!pageTitles[view])return;earlyView=view;document.querySelectorAll('.view').forEach(x=>x.classList.toggle('on',x.id===`view-${view}`));document.querySelectorAll('[data-view]').forEach(x=>x.classList.toggle('on',x.dataset.view===view));const p=document.querySelector('#pageTitle');if(p)p.textContent=pageTitles[view];if(view!=='today')placeholder(view)}
  function bindEarlyNavigation(){document.querySelectorAll('[data-view]').forEach(button=>{button.onclick=()=>earlyNavigate(button.dataset.view)})}
  function loadStyleList(list){for(const href of list){if(document.querySelector(`link[data-kamil-full-style="${href}"]`))continue;const l=document.createElement('link');l.rel='stylesheet';l.href=href;l.dataset.kamilFullStyle=href;document.head.appendChild(l)}}
  function compactSnapshot(host){const nodes=[...host.children].slice(0,4),html=nodes.map(x=>x.outerHTML).join('');return html.length>=200&&html.length<120000?html:''}
  function saveSnapshot(){const host=document.querySelector('#todayView');if(!host||host.dataset.instantShell==='1')return;const html=compactSnapshot(host);if(!html)return;try{localStorage.setItem(SNAPSHOT_KEY,JSON.stringify({version:VERSION,html,at:Date.now()}))}catch{}}
  function registerSw(){if(!('serviceWorker'in navigator))return;navigator.serviceWorker.register('./sw.js').catch(()=>{})}
  async function loadCoreApp(){try{const appPromise=import('./app.js');window.__KAMIL_APP_IMPORT_PROMISE__=appPromise;await appPromise;window.__KAMIL_APP_READY_AT__=performance.now();document.querySelector('#todayView')?.removeAttribute('data-instant-shell');if(earlyView!=='today')window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:earlyView}));loadStyleList(detailStyles);setTimeout(saveSnapshot,1200);setTimeout(registerSw,1800)}catch(error){console.error('[safeCore4371]',error);const host=document.querySelector('#todayView');if(host)host.insertAdjacentHTML('beforeend','<div class="decision-note bad">Základ aplikace se nepodařilo načíst. Lokální data zůstala beze změn.</div>')}}
  applyTheme();paintInstant();bindEarlyNavigation();setTimeout(()=>loadStyleList(coreStyles),50);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')saveSnapshot()});window.addEventListener('beforeunload',saveSnapshot);requestAnimationFrame(()=>requestAnimationFrame(loadCoreApp));
})();
