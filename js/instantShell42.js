(function(){
  const VERSION='41.1.0';
  const SNAPSHOT_KEY='kamil-os-fast-snapshot-41-1';
  const BOOT_KEY='kamil-os-41-boot-summary';
  const THEME_KEY='kamil-os-theme33';
  const root=document.documentElement;
  const now=Date.now();
  const fullStyles=['./styles.css','./today25.css','./personal29.css','./theme33.css'];

  function parse(raw,fallback=null){try{return JSON.parse(raw)}catch{return fallback}}
  function applyTheme(){
    try{
      const theme=localStorage.getItem(THEME_KEY)||'light',light=theme!=='dark';
      root.classList.toggle('theme-light',light);root.classList.toggle('theme-dark',!light);
      root.dataset.theme=light?'light':'dark';root.style.colorScheme=light?'light':'dark';
    }catch{}
  }
  function fallbackHtml(){
    const b=parse(localStorage.getItem(BOOT_KEY)||'null',{})||{};
    const tasks=Number(b.tasks||0),waiting=Number(b.waiting||0),tickets=Number(b.tickets||0),inbox=Number(b.inbox||0);
    return `<div class="view-head"><div><div class="eyebrow">KAMIL OS ${VERSION} / INSTANT START</div><h1>Kamil OS je připravený.</h1><p>Lokální přehled je vidět hned. Detail, cloud a analýzy běží až potom.</p></div></div><div class="metric-strip"><div class="metric"><span>Otevřené úkoly</span><b>${tasks}</b></div><div class="metric"><span>Waiting For</span><b>${waiting}</b></div><div class="metric"><span>Inbox</span><b>${inbox}</b></div><div class="metric"><span>Aktivní vstupenky</span><b>${tickets}</b></div></div><div class="decision-note">První obrazovka už nečte celý datový soubor ani Undo historii.</div>`;
  }
  function paintInstant(){
    const host=document.querySelector('#todayView');if(!host)return;
    let html='';
    try{
      const snap=parse(localStorage.getItem(SNAPSHOT_KEY)||'null');
      if(snap?.html&&typeof snap.html==='string'&&snap.html.length<120000&&now-Number(snap.at||0)<2*86400000)html=snap.html;
    }catch{}
    host.innerHTML=html||fallbackHtml();host.dataset.instantShell='1';
    window.__KAMIL_INSTANT_SHELL_AT__=performance.now();try{performance.mark('kamil-instant-shell')}catch{}
  }
  function loadStyles(){
    for(const href of fullStyles){
      if(document.querySelector(`link[data-kamil-full-style="${href}"]`))continue;
      const l=document.createElement('link');l.rel='stylesheet';l.href=href;l.dataset.kamilFullStyle=href;document.head.appendChild(l);
    }
  }
  function compactSnapshot(host){
    const nodes=[...host.children].slice(0,4),html=nodes.map(x=>x.outerHTML).join('');
    return html.length>=200&&html.length<120000?html:'';
  }
  function saveSnapshot(){
    const host=document.querySelector('#todayView');if(!host||host.dataset.instantShell==='1')return;
    const html=compactSnapshot(host);if(!html)return;
    try{localStorage.setItem(SNAPSHOT_KEY,JSON.stringify({version:VERSION,html,at:Date.now()}))}catch{}
  }
  function idle(fn,timeout=1800){if('requestIdleCallback'in window)return requestIdleCallback(fn,{timeout});return setTimeout(fn,450)}
  async function loadFullApp(){
    try{
      await import('./app.js');
      import('./state.js').then(({store})=>{const b=document.querySelector('#undoBtn');if(b)b.disabled=!store.undoCount()}).catch(()=>{});
      setTimeout(saveSnapshot,1000);setTimeout(saveSnapshot,3500);
      idle(()=>Promise.allSettled([import('./theme33.js'),import('./releaseStamp.js'),import('./lazyBoot41.js')]),2000);
    }catch(error){
      console.error('[instantShell41]',error);
      const host=document.querySelector('#todayView');if(host)host.insertAdjacentHTML('beforeend','<div class="decision-note bad">Detail aplikace se nepodařilo načíst. Lokální data zůstala beze změny.</div>');
    }
  }

  applyTheme();paintInstant();
  requestAnimationFrame(loadStyles);
  window.addEventListener('kamil:view-change',e=>{if(e.detail==='today')setTimeout(saveSnapshot,900)});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')saveSnapshot()});
  window.addEventListener('beforeunload',saveSnapshot);
  requestAnimationFrame(()=>requestAnimationFrame(loadFullApp));
})();
