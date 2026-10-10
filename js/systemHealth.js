import {APP_RELEASE} from './releaseMeta.js';
import {hasStoredCloudSession} from './cloud.js';
import {recentDiagnostics} from './diagnostics.js';
import {h,modal} from './utils.js';

const timeout=ms=>AbortSignal.timeout?AbortSignal.timeout(ms):undefined;
async function getJson(url){
 try{
  const r=await fetch(url,{cache:'no-store',signal:timeout(8000)});
  const data=await r.json().catch(()=>null);
  return {ok:r.ok,status:r.status,data};
 }catch(error){return{ok:false,status:0,data:null,error:String(error?.message||error)}}
}
const providerTone=status=>status==='verified'?'good':status==='configured'?'warn':status==='degraded'?'bad':'';
const label=status=>({verified:'ověřeno',configured:'nakonfigurováno',degraded:'problém',missing:'nepřipojeno'}[status]||status||'neznámé');

export async function systemHealthSnapshot747(){
 const [provider,deploy]=await Promise.all([getJson('/api/core70-health'),getJson('/api/deployment-meta')]);
 const providers=Array.isArray(provider.data?.providers)?provider.data.providers:[];
 const sw=typeof navigator!=='undefined'&&'serviceWorker'in navigator;
 const controlled=!!navigator?.serviceWorker?.controller;
 return {
  release:APP_RELEASE,
  deployment:deploy.data||null,
  productionMetaOk:deploy.ok,
  providerEndpointOk:provider.ok,
  providers,
  cloudSession:hasStoredCloudSession(),
  serviceWorkerSupported:sw,
  serviceWorkerControlled:controlled,
  diagnostics:recentDiagnostics().length,
  checkedAt:new Date().toISOString()
 };
}
export async function openSystemHealth747(){
 const x=await systemHealthSnapshot747();
 const rows=x.providers.length?x.providers.map(p=>`<div class="row"><span>${h(p.label||p.id)}</span><b class="${providerTone(p.status)}">${h(label(p.status))}</b></div>`).join(''):'<div class="row"><span>Provider health</span><b class="warn">nedostupný</b></div>';
 const commit=x.deployment?.commit?String(x.deployment.commit).slice(0,10):'—';
 const html=`<div class="card" data-system-health747>
   <div class="eyebrow">SYSTEM HEALTH / OS747</div>
   <div class="row"><span>Release</span><b>${h(x.release)}</b></div>
   <div class="row"><span>Produkční commit</span><b>${h(commit)}</b></div>
   <div class="row"><span>Service worker</span><b class="${x.serviceWorkerControlled?'good':'warn'}">${x.serviceWorkerControlled?'aktivní':x.serviceWorkerSupported?'čeká na převzetí':'nepodporován'}</b></div>
   <div class="row"><span>Cloud session</span><b>${x.cloudSession?'uložená':'nepřipojeno'}</b></div>
   <div class="row"><span>Diagnostiky v relaci</span><b>${x.diagnostics}</b></div>
   <div class="section-title" style="margin-top:14px">Živé zdroje</div>
   ${rows}
  </div>`;
 await modal('System Health',html,[{label:'Zavřít',value:null,primary:true}]);
 return x;
}
