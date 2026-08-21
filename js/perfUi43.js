import {APP_VERSION} from './releaseMeta.js';
import {coldStorageStats42,compactLocalState42} from './coldPartition42.js';
import {qs,modal,toast,h} from './utils.js';

const ms=v=>v===null||v===undefined||!Number.isFinite(Number(v))?'—':`${Math.round(Number(v))} ms`;
const kb=v=>`${Math.max(0,Number(v||0)/1024).toLocaleString('cs-CZ',{maximumFractionDigits:1})} kB`;
function diagnostics(){
 const storage=coldStorageStats42(),nav=performance.getEntriesByType?.('navigation')?.[0]||null,long=performance.getEntriesByType?.('longtask')||[],preboot=window.__KAMIL_PREBOOT_COMPACT__||null;
 const shell=Number(window.__KAMIL_INSTANT_SHELL_AT__),app=Number(window.__KAMIL_APP_READY_AT__),today=Number(window.__KAMIL_TODAY_FULL_AT__);
 const bottleneck=!Number.isFinite(shell)?'Čekám na měření':shell>500?'První vykreslení':Number.isFinite(app)&&app>1800?'Start aplikace':Number.isFinite(today)&&today>4000?'Plný Today Brain':storage.mainBytes>700000?'Horké lokální úložiště':'Bez zjevného kritického bottlenecku';
 return {storage,nav,long,preboot,shell,app,today,bottleneck};
}
function tile(){
 const d=diagnostics(),grid=qs('#moreView .more26-grid');if(!grid)return;
 let b=qs('[data-perf43]',grid);if(!b){b=document.createElement('button');b.className='hub-tile';b.dataset.perf43='1';grid.appendChild(b)}
 b.innerHTML=`<span class="hub-icon good">⚡</span><span class="hub-copy"><b>Výkon 41.3</b><small>shell ${h(ms(d.shell))} · app ${h(ms(d.app))} · hot state ${h(kb(d.storage.mainBytes))}</small></span><span class="hub-arrow">→</span>`;
 b.onclick=openPerf43;
}
async function openPerf43(){
 const d=diagnostics(),ttfb=d.nav?Math.max(0,d.nav.responseStart-d.nav.requestStart):null,dom=d.nav?.domContentLoadedEventEnd||null,preboot=d.preboot?.ok?(d.preboot.changed?`${d.preboot.moved||0} záznamů → cold`:'už bylo kompaktní'):'—';
 const body=`<div class="decision-note"><b>${h(d.bottleneck)}</b><br><span class="muted">Měření je lokální na tomto zařízení. Nic se neposílá ven.</span></div><div class="metric-strip"><div class="metric"><span>Instant shell</span><b>${h(ms(d.shell))}</b></div><div class="metric"><span>App ready</span><b>${h(ms(d.app))}</b></div><div class="metric"><span>Plný Today</span><b>${h(ms(d.today))}</b></div><div class="metric"><span>TTFB</span><b>${h(ms(ttfb))}</b></div></div><div class="card"><div class="row"><span>Horký lokální stav</span><b>${h(kb(d.storage.mainBytes))}</b></div><div class="row"><span>Cold historie</span><b>${h(kb(d.storage.coldBytes))}</b></div><div class="row"><span>Sync fronta</span><b>${h(kb(d.storage.queueBytes))}</b></div><div class="row"><span>Pre-boot compaction</span><b>${h(preboot)}</b></div><div class="row"><span>DOMContentLoaded</span><b>${h(ms(dom))}</b></div><div class="row"><span>Dlouhé tasky dostupné v timeline</span><b>${d.long.length}</b></div><div class="row"><span>Načtené cold domény</span><b>${h((d.storage.hydrated||[]).join(', ')||'žádné')}</b></div></div><p class="muted">Optimalizace pouze přesune historická pole do lazy úložiště. Záznamy nemaže.</p>`;
 const action=await modal(`Výkon Kamil OS ${APP_VERSION}`,body,[{label:'Zavřít',value:null},{label:'Optimalizovat lokální data',value:'compact',primary:true}]);
 if(action==='compact'){const r=compactLocalState42();toast(r?.ok?`Hotovo · hot state ${kb(r.mainBytes)}`:'Optimalizace nebyla potřeba');tile()}
}
export function renderPerf43(){tile()}
