let runPromise=null;
const MODULE_STATS_KEY='kamil-os-module-stats-43-3';

function renderLoaderStats434(){
  const host=document.querySelector('#moreView');if(!host)return;
  host.querySelector('#loaderStats434')?.remove();
  let stats={};try{stats=JSON.parse(localStorage.getItem(MODULE_STATS_KEY)||'{}')||{}}catch{}
  const rows=Object.entries(stats).sort((a,b)=>Number(b[1]?.avg||0)-Number(a[1]?.avg||0)).slice(0,8);
  const cold=window.__KAMIL_COLD_MODULE__||null,coldStats=cold?stats[cold]||{}:{};
  const root=document.createElement('section');root.id='loaderStats434';root.className='card';
  root.innerHTML=`<div class="card-head"><div><div class="eyebrow">43.4 COLD LOAD</div><h2>Nejpomalejší moduly</h2></div><span class="status">${rows.length} měřených</span></div>${cold?`<div class="decision-note"><b>Cold-load ochrana:</b> ${cold.replace('./','')} · ${Math.round(Number(coldStats.avg||0))} ms / ${Number(coldStats.count||0)} měření. Při automatickém background startu se nenačte; pustí se až po skutečném otevření sekce.</div><div class="actions"><button class="btn primary" id="loadCold434">Načíst odložený modul teď</button></div>`:'<div class="decision-note good">Žádný modul zatím nepřekročil cold-load limit. Background loader běží normálně.</div>'}${rows.length?rows.map(([path,s])=>`<div class="life42-row"><div class="life42-main"><b>${path.replace('./','')}${path===cold?' · COLD':''}</b><span>${Number(s.count||0)} měření</span></div><span>${Math.round(Number(s.avg||0))} ms</span></div>`).join(''):'<div class="empty">Ještě nemám dost dat. Po pár použitích se loader sám přizpůsobí.</div>'}<div class="actions"><button class="btn" id="resetLoader434">Reset měření loaderu</button></div>`;
  host.appendChild(root);
  root.querySelector('#loadCold434')?.addEventListener('click',()=>{window.dispatchEvent(new CustomEvent('kamil:load-cold-module',{detail:{path:cold}}));const b=root.querySelector('#loadCold434');if(b){b.disabled=true;b.textContent='Načítám…'}});
  root.querySelector('#resetLoader434')?.addEventListener('click',()=>{try{localStorage.removeItem(MODULE_STATS_KEY);window.__KAMIL_MODULE_STATS__={};window.__KAMIL_COLD_MODULE__=null}catch{}window.dispatchEvent(new CustomEvent('kamil:loader-stats-reset'));renderLoaderStats434()});
}

export function renderSystemDiagnostics421(){
  if(runPromise)return runPromise;
  runPromise=Promise.allSettled([
    import('./recoveryShieldUi32.js'),
    import('./smartSyncUi31.js'),
    import('./remoteInboxUi31.js')
  ]).then(()=>{
    window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:'more'}));
    setTimeout(renderLoaderStats434,80);
    return true;
  }).finally(()=>{runPromise=null});
  return runPromise;
}

window.addEventListener('kamil:cold-module-loaded',()=>setTimeout(renderLoaderStats434,80));
