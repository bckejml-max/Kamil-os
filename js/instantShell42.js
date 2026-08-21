(function(){
  const VERSION='41.0.0';
  const SNAPSHOT_KEY='kamil-os-fast-snapshot-42';
  const STATE_KEY='kamil-os-state';
  const THEME_KEY='kamil-os-theme33';
  const root=document.documentElement;
  const now=Date.now();

  function parse(raw,fallback=null){try{return JSON.parse(raw)}catch{return fallback}}
  function applyTheme(){
    try{
      const theme=localStorage.getItem(THEME_KEY)||'light',light=theme!=='dark';
      root.classList.toggle('theme-light',light);
      root.dataset.theme=light?'light':'dark';
      root.style.colorScheme=light?'light':'dark';
    }catch{}
  }
  function openItem(x){return !['DONE','CLOSED','ARCHIVED','RESOLVED','PAID','SOLD','PAYOUT RECEIVED'].includes(String(x?.status||x?.workflow||'').toUpperCase())}
  function fallbackHtml(){
    const state=parse(localStorage.getItem(STATE_KEY)||'null',{})||{};
    const tasks=(state.tasks||[]).filter(openItem).length;
    const waiting=[...(state.directorBook?.waiting||[]),...(state.delegations||[])].filter(openItem).length;
    const tickets=(state.ticketBook?.items||[]).filter(x=>['HOLD','LISTED'].includes(String(x?.workflow||'HOLD').toUpperCase())).length;
    const inbox=(state.inbox||[]).filter(openItem).length;
    return `<div class="view-head"><div><div class="eyebrow">KAMIL OS ${VERSION} / INSTANT START</div><h1>Kamil OS je připravený.</h1><p>Ukazuju poslední lokální stav okamžitě. Detail, cloud a analýzy se dopočítají na pozadí.</p></div></div><div class="metric-strip"><div class="metric"><span>Otevřené úkoly</span><b>${tasks}</b></div><div class="metric"><span>Waiting For</span><b>${waiting}</b></div><div class="metric"><span>Inbox</span><b>${inbox}</b></div><div class="metric"><span>Aktivní vstupenky</span><b>${tickets}</b></div></div><div class="decision-note">Lokální snapshot je dostupný hned; síť není potřeba pro první obrazovku.</div>`;
  }
  function paintInstant(){
    const host=document.querySelector('#todayView');if(!host)return;
    let html='';
    try{
      const snap=parse(localStorage.getItem(SNAPSHOT_KEY)||'null');
      if(snap?.html&&typeof snap.html==='string'&&snap.html.length<400000&&now-Number(snap.at||0)<7*86400000)html=snap.html;
    }catch{}
    host.innerHTML=html||fallbackHtml();
    host.dataset.instantShell='1';
    window.__KAMIL_INSTANT_SHELL_AT__=performance.now();
    try{performance.mark('kamil-instant-shell')}catch{}
  }
  function saveSnapshot(){
    const host=document.querySelector('#todayView');
    if(!host||host.dataset.instantShell==='1')return;
    const html=host.innerHTML||'';
    if(html.length<200||html.length>400000)return;
    try{localStorage.setItem(SNAPSHOT_KEY,JSON.stringify({version:VERSION,html,at:Date.now()}))}catch{}
  }
  function idle(fn,timeout=1600){
    if('requestIdleCallback'in window)return requestIdleCallback(fn,{timeout});
    return setTimeout(fn,350);
  }
  async function loadFullApp(){
    try{
      await import('./app.js');
      setTimeout(saveSnapshot,900);
      setTimeout(saveSnapshot,3000);
      idle(()=>Promise.allSettled([import('./theme33.js'),import('./releaseStamp.js'),import('./lazyBoot41.js')]),1800);
    }catch(error){
      console.error('[instantShell42] full app failed',error);
      const host=document.querySelector('#todayView');
      if(host)host.insertAdjacentHTML('beforeend','<div class="decision-note bad">Detail aplikace se nepodařilo načíst. Lokální data zůstala beze změny; zkus obnovit stránku.</div>');
    }
  }

  applyTheme();
  paintInstant();
  window.addEventListener('kamil:view-change',e=>{if(e.detail==='today')setTimeout(saveSnapshot,1000)});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')saveSnapshot()});
  window.addEventListener('beforeunload',saveSnapshot);
  requestAnimationFrame(()=>requestAnimationFrame(loadFullApp));
})();
