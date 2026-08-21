let runPromise=null;
const MODULE_STATS_KEY='kamil-os-module-stats-43-3';

function renderLoaderStats433(){
  const host=document.querySelector('#moreView');if(!host)return;
  host.querySelector('#loaderStats433')?.remove();
  let stats={};try{stats=JSON.parse(localStorage.getItem(MODULE_STATS_KEY)||'{}')||{}}catch{}
  const rows=Object.entries(stats).sort((a,b)=>Number(b[1]?.avg||0)-Number(a[1]?.avg||0)).slice(0,8);
  const root=document.createElement('section');root.id='loaderStats433';root.className='card';
  root.innerHTML=`<div class="card-head"><div><div class="eyebrow">43.3 ADAPTIVE LOADER</div><h2>Nejpomalejší moduly</h2></div><span class="status">${rows.length} měřených</span></div>${rows.length?rows.map(([path,s])=>`<div class="life42-row"><div class="life42-main"><b>${path.replace('./','')}</b><span>${Number(s.count||0)} měření</span></div><span>${Math.round(Number(s.avg||0))} ms</span></div>`).join(''):'<div class="empty">Ještě nemám dost dat. Po pár použitích se loader sám přizpůsobí.</div>'}<div class="actions"><button class="btn" id="resetLoader433">Reset měření loaderu</button></div>`;
  host.appendChild(root);
  root.querySelector('#resetLoader433')?.addEventListener('click',()=>{try{localStorage.removeItem(MODULE_STATS_KEY);window.__KAMIL_MODULE_STATS__={}}catch{}renderLoaderStats433()});
}

export function renderSystemDiagnostics421(){
  if(runPromise)return runPromise;
  runPromise=Promise.allSettled([
    import('./recoveryShieldUi32.js'),
    import('./smartSyncUi31.js'),
    import('./remoteInboxUi31.js')
  ]).then(()=>{
    window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:'more'}));
    setTimeout(renderLoaderStats433,80);
    return true;
  }).finally(()=>{runPromise=null});
  return runPromise;
}
