let runPromise=null;
const MODULE_STATS_KEY='kamil-os-module-stats-43-3';
const QUARANTINE_KEY='kamil-os-module-quarantine-43-5';
const STABILITY_MEMORY_KEY='kamil-os-stability-memory-43-7';

function readQuarantine(){try{const now=Date.now(),all=JSON.parse(localStorage.getItem(QUARANTINE_KEY)||'{}')||{};return Object.fromEntries(Object.entries(all).filter(([,q])=>Number(q?.until||0)>now))}catch{return{}}}
function readMemory(){try{return JSON.parse(localStorage.getItem(STABILITY_MEMORY_KEY)||'{}')||{}}catch{return{}}}
function fmtTime(ts){return ts?new Date(Number(ts)).toLocaleTimeString('cs-CZ',{hour:'2-digit',minute:'2-digit'}):'čeká na plán'}
function memoryMode(m){const score=Number(m?.score||0),samples=Number(m?.samples||0),failures=Number(m?.failures||0);if((samples>=3||failures>=2)&&score>=10)return'BLOCK';if((samples>=3||failures>=1)&&score>=6)return'COLD';return'OK'}

function renderLoaderStats437(){
  const host=document.querySelector('#moreView');if(!host)return;
  host.querySelector('#loaderStats437')?.remove();host.querySelector('#loaderStats436')?.remove();host.querySelector('#loaderStats435')?.remove();
  let stats={};try{stats=JSON.parse(localStorage.getItem(MODULE_STATS_KEY)||'{}')||{}}catch{}
  const rows=Object.entries(stats).sort((a,b)=>Number(b[1]?.avg||0)-Number(a[1]?.avg||0)).slice(0,8);
  const memory=readMemory(),memoryRows=Object.entries(memory).filter(([,m])=>Number(m?.score||0)>0).sort((a,b)=>Number(b[1]?.score||0)-Number(a[1]?.score||0)).slice(0,8);
  const risky=memoryRows.filter(([,m])=>memoryMode(m)!=='OK');
  const cold=window.__KAMIL_COLD_MODULE__||null,coldStats=cold?stats[cold]||{}:{};
  const quarantined=readQuarantine(),qRows=Object.entries(quarantined),healed=window.__KAMIL_LAST_SELF_HEAL__||null;
  const root=document.createElement('section');root.id='loaderStats437';root.className='card';
  root.innerHTML=`<div class="card-head"><div><div class="eyebrow">43.7 STABILITY MEMORY</div><h2>Stabilita modulů</h2></div><span class="status">${risky.length} rizikových</span></div><div class="decision-note good"><b>Stability Memory:</b> Kamil OS si na tomto zařízení dlouhodobě pamatuje pomalé a chybující background moduly. Rizikové moduly rovnou přesouvá do COLD režimu nebo je z automatického backgroundu úplně vynechá. Ruční otevření funkce zůstává povolené.</div>${memoryRows.length?memoryRows.map(([path,m])=>{const mode=memoryMode(m);return `<div class="life42-row"><div class="life42-main"><b>${path.replace('./','')} · ${mode}</b><span>skóre ${Number(m.score||0)}/20 · ${Number(m.samples||0)} měření · ${Number(m.failures||0)} chyb · ${Number(m.successes||0)} úspěšných načtení</span></div><span>${Number(m.lastMs||0)?`${Number(m.lastMs)} ms`:''}</span></div>`}).join(''):'<div class="decision-note good">Paměť zatím nemá žádný rizikový modul. Učení se začne plnit během běžného používání.</div>'}${healed?`<div class="decision-note good"><b>Naposledy samoopraveno:</b> ${healed.path.replace('./','')} · pokus ${Number(healed.attempt||1)}.</div>`:''}${qRows.length?`<div class="decision-note bad"><b>Karanténa:</b> ${qRows.length} modul${qRows.length===1?'':'ů'} je izolován${qRows.length===1?'':'o'}. Self-Healing je může po klidové době bezpečně vrátit.</div>${qRows.map(([path,q])=>`<div class="life42-row"><div class="life42-main"><b>${path.replace('./','')} · QUARANTINE</b><span>${Number(q.failures?.length||0)} selhání · auto test ${Number(q.autoProbes||0)}/3 · další nejdřív ${fmtTime(q.nextProbeAt)} · ochrana do ${fmtTime(q.until)}</span></div><div class="actions"><button class="btn" data-self-heal-module="${path}">Bezpečně otestovat</button><button class="btn" data-retry-module="${path}">Načíst ručně</button></div></div>`).join('')}`:'<div class="decision-note good">Žádný modul není v karanténě.</div>'}${cold?`<div class="decision-note"><b>Cold-load podle rychlosti:</b> ${cold.replace('./','')} · ${Math.round(Number(coldStats.avg||0))} ms / ${Number(coldStats.count||0)} měření.</div><div class="actions"><button class="btn primary" id="loadCold437">Načíst odložený modul teď</button></div>`:'<div class="decision-note good">Žádný modul teď nepřekročil klasický cold-load limit.</div>'}${rows.length?`<div class="eyebrow" style="margin-top:14px">NEJPOMALEJŠÍ MODULY</div>${rows.map(([path,s])=>`<div class="life42-row"><div class="life42-main"><b>${path.replace('./','')}${path===cold?' · COLD':''}${quarantined[path]?' · QUARANTINE':''}</b><span>${Number(s.count||0)} měření</span></div><span>${Math.round(Number(s.avg||0))} ms</span></div>`).join('')}`:''}<div class="actions"><button class="btn" id="resetLoader437">Reset měření loaderu</button><button class="btn" id="resetMemory437">Reset Stability Memory</button>${qRows.length?'<button class="btn" id="resetQuarantine437">Vyčistit karanténu</button>':''}</div>`;
  host.appendChild(root);
  root.querySelector('#loadCold437')?.addEventListener('click',()=>{window.dispatchEvent(new CustomEvent('kamil:load-cold-module',{detail:{path:cold}}));const b=root.querySelector('#loadCold437');if(b){b.disabled=true;b.textContent='Načítám…'}});
  root.querySelectorAll('[data-self-heal-module]').forEach(button=>button.addEventListener('click',()=>{const path=button.dataset.selfHealModule;if(!path)return;button.disabled=true;button.textContent='Testuji…';window.dispatchEvent(new CustomEvent('kamil:self-heal-now',{detail:{path}}))}));
  root.querySelectorAll('[data-retry-module]').forEach(button=>button.addEventListener('click',()=>{const path=button.dataset.retryModule;if(!path)return;button.disabled=true;button.textContent='Načítám…';window.dispatchEvent(new CustomEvent('kamil:retry-quarantined-module',{detail:{path}}))}));
  root.querySelector('#resetLoader437')?.addEventListener('click',()=>{try{localStorage.removeItem(MODULE_STATS_KEY);window.__KAMIL_MODULE_STATS__={};window.__KAMIL_COLD_MODULE__=null}catch{}window.dispatchEvent(new CustomEvent('kamil:loader-stats-reset'));renderLoaderStats437()});
  root.querySelector('#resetMemory437')?.addEventListener('click',()=>{try{localStorage.removeItem(STABILITY_MEMORY_KEY);window.__KAMIL_STABILITY_MEMORY__={};window.__KAMIL_MEMORY_BLOCKED_MODULES__=[];window.__KAMIL_MEMORY_COLD_MODULES__=[]}catch{}window.dispatchEvent(new CustomEvent('kamil:stability-memory-reset'));renderLoaderStats437()});
  root.querySelector('#resetQuarantine437')?.addEventListener('click',()=>{try{localStorage.removeItem(QUARANTINE_KEY);window.__KAMIL_QUARANTINED_MODULES__={}}catch{}window.dispatchEvent(new CustomEvent('kamil:quarantine-reset'));renderLoaderStats437()});
}

export function renderSystemDiagnostics421(){
  if(runPromise)return runPromise;
  runPromise=Promise.allSettled([
    import('./recoveryShieldUi32.js'),
    import('./smartSyncUi31.js'),
    import('./remoteInboxUi31.js')
  ]).then(()=>{
    window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:'more'}));
    setTimeout(renderLoaderStats437,80);
    return true;
  }).finally(()=>{runPromise=null});
  return runPromise;
}

for(const event of ['kamil:cold-module-loaded','kamil:module-quarantined','kamil:module-quarantine-recovered','kamil:module-quarantine-retry-failed','kamil:module-quarantine-cleared','kamil:self-heal-probing','kamil:module-self-healed','kamil:self-heal-failed'])window.addEventListener(event,()=>setTimeout(renderLoaderStats437,80));
