let runPromise=null;
const MODULE_STATS_KEY='kamil-os-module-stats-43-3';
const QUARANTINE_KEY='kamil-os-module-quarantine-43-5';

function readQuarantine(){try{const now=Date.now(),all=JSON.parse(localStorage.getItem(QUARANTINE_KEY)||'{}')||{};return Object.fromEntries(Object.entries(all).filter(([,q])=>Number(q?.until||0)>now))}catch{return{}}}
function fmtTime(ts){return ts?new Date(Number(ts)).toLocaleTimeString('cs-CZ',{hour:'2-digit',minute:'2-digit'}):'čeká na plán'}

function renderLoaderStats436(){
  const host=document.querySelector('#moreView');if(!host)return;
  host.querySelector('#loaderStats436')?.remove();host.querySelector('#loaderStats435')?.remove();
  let stats={};try{stats=JSON.parse(localStorage.getItem(MODULE_STATS_KEY)||'{}')||{}}catch{}
  const rows=Object.entries(stats).sort((a,b)=>Number(b[1]?.avg||0)-Number(a[1]?.avg||0)).slice(0,8);
  const cold=window.__KAMIL_COLD_MODULE__||null,coldStats=cold?stats[cold]||{}:{};
  const quarantined=readQuarantine(),qRows=Object.entries(quarantined),healed=window.__KAMIL_LAST_SELF_HEAL__||null;
  const root=document.createElement('section');root.id='loaderStats436';root.className='card';
  root.innerHTML=`<div class="card-head"><div><div class="eyebrow">43.6 SELF-HEALING LOADER</div><h2>Stabilita modulů</h2></div><span class="status">${rows.length} měřených</span></div><div class="decision-note good"><b>Self-Healing:</b> Kamil OS po karanténě počká na klidné okno, bezpečně zkusí modul znovu a při úspěchu ho automaticky vrátí do provozu. Maximálně 3 automatické pokusy, vždy s odstupem.</div>${healed?`<div class="decision-note good"><b>Naposledy opraveno:</b> ${healed.path.replace('./','')} · pokus ${Number(healed.attempt||1)}.</div>`:''}${qRows.length?`<div class="decision-note bad"><b>Karanténa:</b> ${qRows.length} modul${qRows.length===1?'':'ů'} je izolován${qRows.length===1?'':'o'}. Background loader je vynechává, ale Self-Healing je může po klidové době vrátit.</div>${qRows.map(([path,q])=>`<div class="life42-row"><div class="life42-main"><b>${path.replace('./','')} · QUARANTINE</b><span>${Number(q.failures?.length||0)} selhání · auto test ${Number(q.autoProbes||0)}/3 · další nejdřív ${fmtTime(q.nextProbeAt)} · ochrana do ${fmtTime(q.until)}</span></div><div class="actions"><button class="btn" data-self-heal-module="${path}">Bezpečně otestovat</button><button class="btn" data-retry-module="${path}">Načíst ručně</button></div></div>`).join('')}`:'<div class="decision-note good">Žádný modul není v karanténě. Self-Healing nemá co opravovat.</div>'}${cold?`<div class="decision-note"><b>Cold-load ochrana:</b> ${cold.replace('./','')} · ${Math.round(Number(coldStats.avg||0))} ms / ${Number(coldStats.count||0)} měření. Při automatickém background startu se nenačte; pustí se až po skutečném otevření sekce.</div><div class="actions"><button class="btn primary" id="loadCold436">Načíst odložený modul teď</button></div>`:'<div class="decision-note good">Žádný modul zatím nepřekročil cold-load limit. Background loader běží normálně.</div>'}${rows.length?rows.map(([path,s])=>`<div class="life42-row"><div class="life42-main"><b>${path.replace('./','')}${path===cold?' · COLD':''}${quarantined[path]?' · QUARANTINE':''}</b><span>${Number(s.count||0)} měření</span></div><span>${Math.round(Number(s.avg||0))} ms</span></div>`).join(''):'<div class="empty">Ještě nemám dost dat. Po pár použitích se loader sám přizpůsobí.</div>'}<div class="actions"><button class="btn" id="resetLoader436">Reset měření loaderu</button>${qRows.length?'<button class="btn" id="resetQuarantine436">Vyčistit karanténu</button>':''}</div>`;
  host.appendChild(root);
  root.querySelector('#loadCold436')?.addEventListener('click',()=>{window.dispatchEvent(new CustomEvent('kamil:load-cold-module',{detail:{path:cold}}));const b=root.querySelector('#loadCold436');if(b){b.disabled=true;b.textContent='Načítám…'}});
  root.querySelectorAll('[data-self-heal-module]').forEach(button=>button.addEventListener('click',()=>{const path=button.dataset.selfHealModule;if(!path)return;button.disabled=true;button.textContent='Testuji…';window.dispatchEvent(new CustomEvent('kamil:self-heal-now',{detail:{path}}))}));
  root.querySelectorAll('[data-retry-module]').forEach(button=>button.addEventListener('click',()=>{const path=button.dataset.retryModule;if(!path)return;button.disabled=true;button.textContent='Načítám…';window.dispatchEvent(new CustomEvent('kamil:retry-quarantined-module',{detail:{path}}))}));
  root.querySelector('#resetLoader436')?.addEventListener('click',()=>{try{localStorage.removeItem(MODULE_STATS_KEY);window.__KAMIL_MODULE_STATS__={};window.__KAMIL_COLD_MODULE__=null}catch{}window.dispatchEvent(new CustomEvent('kamil:loader-stats-reset'));renderLoaderStats436()});
  root.querySelector('#resetQuarantine436')?.addEventListener('click',()=>{try{localStorage.removeItem(QUARANTINE_KEY);window.__KAMIL_QUARANTINED_MODULES__={}}catch{}window.dispatchEvent(new CustomEvent('kamil:quarantine-reset'));renderLoaderStats436()});
}

export function renderSystemDiagnostics421(){
  if(runPromise)return runPromise;
  runPromise=Promise.allSettled([
    import('./recoveryShieldUi32.js'),
    import('./smartSyncUi31.js'),
    import('./remoteInboxUi31.js')
  ]).then(()=>{
    window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:'more'}));
    setTimeout(renderLoaderStats436,80);
    return true;
  }).finally(()=>{runPromise=null});
  return runPromise;
}

for(const event of ['kamil:cold-module-loaded','kamil:module-quarantined','kamil:module-quarantine-recovered','kamil:module-quarantine-retry-failed','kamil:module-quarantine-cleared','kamil:self-heal-probing','kamil:module-self-healed','kamil:self-heal-failed'])window.addEventListener(event,()=>setTimeout(renderLoaderStats436,80));
