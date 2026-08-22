let runPromise=null;
const MODULE_STATS_KEY='kamil-os-module-stats-43-3';
const QUARANTINE_KEY='kamil-os-module-quarantine-43-5';

function readQuarantine(){try{const now=Date.now(),all=JSON.parse(localStorage.getItem(QUARANTINE_KEY)||'{}')||{};return Object.fromEntries(Object.entries(all).filter(([,q])=>Number(q?.until||0)>now))}catch{return{}}}

function renderLoaderStats435(){
  const host=document.querySelector('#moreView');if(!host)return;
  host.querySelector('#loaderStats435')?.remove();
  let stats={};try{stats=JSON.parse(localStorage.getItem(MODULE_STATS_KEY)||'{}')||{}}catch{}
  const rows=Object.entries(stats).sort((a,b)=>Number(b[1]?.avg||0)-Number(a[1]?.avg||0)).slice(0,8);
  const cold=window.__KAMIL_COLD_MODULE__||null,coldStats=cold?stats[cold]||{}:{};
  const quarantined=readQuarantine(),qRows=Object.entries(quarantined);
  const root=document.createElement('section');root.id='loaderStats435';root.className='card';
  root.innerHTML=`<div class="card-head"><div><div class="eyebrow">43.5 AUTO QUARANTINE</div><h2>Stabilita modulů</h2></div><span class="status">${rows.length} měřených</span></div>${qRows.length?`<div class="decision-note bad"><b>Karanténa:</b> ${qRows.length} modul${qRows.length===1?'':'ů'} opakovaně selhal${qRows.length===1?'':'o'}. Kamil OS je automaticky vynechává, aby neshodil zbytek aplikace.</div>${qRows.map(([path,q])=>`<div class="life42-row"><div class="life42-main"><b>${path.replace('./','')} · QUARANTINE</b><span>${Number(q.failures?.length||0)} selhání · ochrana do ${new Date(Number(q.until||0)).toLocaleTimeString('cs-CZ',{hour:'2-digit',minute:'2-digit'})}</span></div><button class="btn" data-retry-module="${path}">Zkusit znovu</button></div>`).join('')}`:'<div class="decision-note good">Žádný modul není v karanténě. Opakované import chyby se automaticky izolují bez pádu celé appky.</div>'}${cold?`<div class="decision-note"><b>Cold-load ochrana:</b> ${cold.replace('./','')} · ${Math.round(Number(coldStats.avg||0))} ms / ${Number(coldStats.count||0)} měření. Při automatickém background startu se nenačte; pustí se až po skutečném otevření sekce.</div><div class="actions"><button class="btn primary" id="loadCold435">Načíst odložený modul teď</button></div>`:'<div class="decision-note good">Žádný modul zatím nepřekročil cold-load limit. Background loader běží normálně.</div>'}${rows.length?rows.map(([path,s])=>`<div class="life42-row"><div class="life42-main"><b>${path.replace('./','')}${path===cold?' · COLD':''}${quarantined[path]?' · QUARANTINE':''}</b><span>${Number(s.count||0)} měření</span></div><span>${Math.round(Number(s.avg||0))} ms</span></div>`).join(''):'<div class="empty">Ještě nemám dost dat. Po pár použitích se loader sám přizpůsobí.</div>'}<div class="actions"><button class="btn" id="resetLoader435">Reset měření loaderu</button>${qRows.length?'<button class="btn" id="resetQuarantine435">Vyčistit karanténu</button>':''}</div>`;
  host.appendChild(root);
  root.querySelector('#loadCold435')?.addEventListener('click',()=>{window.dispatchEvent(new CustomEvent('kamil:load-cold-module',{detail:{path:cold}}));const b=root.querySelector('#loadCold435');if(b){b.disabled=true;b.textContent='Načítám…'}});
  root.querySelectorAll('[data-retry-module]').forEach(button=>button.addEventListener('click',()=>{const path=button.dataset.retryModule;if(!path)return;button.disabled=true;button.textContent='Zkouším…';window.dispatchEvent(new CustomEvent('kamil:retry-quarantined-module',{detail:{path}}))}));
  root.querySelector('#resetLoader435')?.addEventListener('click',()=>{try{localStorage.removeItem(MODULE_STATS_KEY);window.__KAMIL_MODULE_STATS__={};window.__KAMIL_COLD_MODULE__=null}catch{}window.dispatchEvent(new CustomEvent('kamil:loader-stats-reset'));renderLoaderStats435()});
  root.querySelector('#resetQuarantine435')?.addEventListener('click',()=>{try{localStorage.removeItem(QUARANTINE_KEY);window.__KAMIL_QUARANTINED_MODULES__={}}catch{}window.dispatchEvent(new CustomEvent('kamil:quarantine-reset'));renderLoaderStats435()});
}

export function renderSystemDiagnostics421(){
  if(runPromise)return runPromise;
  runPromise=Promise.allSettled([
    import('./recoveryShieldUi32.js'),
    import('./smartSyncUi31.js'),
    import('./remoteInboxUi31.js')
  ]).then(()=>{
    window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:'more'}));
    setTimeout(renderLoaderStats435,80);
    return true;
  }).finally(()=>{runPromise=null});
  return runPromise;
}

for(const event of ['kamil:cold-module-loaded','kamil:module-quarantined','kamil:module-quarantine-recovered','kamil:module-quarantine-retry-failed','kamil:module-quarantine-cleared'])window.addEventListener(event,()=>setTimeout(renderLoaderStats435,80));
