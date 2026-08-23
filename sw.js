const CACHE='kamil-os-65.4-night-handoff-r1';
const SHELL=[
  './','./index.html','./manifest.webmanifest','./styles.css','./theme33.css','./personal64.css','./personal65.css',
  './js/instantShell64.js','./js/app.js','./js/releaseMeta.js','./js/config.js','./js/state.js','./js/utils.js',
  './js/viewRuntime41.js','./js/personalShell640.js','./js/personalHardening650.js','./js/personalVault640.js','./js/personalActions640.js','./js/personalAsk640.js','./js/personalAssistant650.js','./js/personalWaiting650.js','./js/personalUsage650.js','./js/personalDailyRhythm651.js','./js/personalTomorrow653.js',
  './js/personalToday640.js','./js/personalFamily640.js','./js/personalHome640.js','./js/personalMoney640.js','./js/personalDocuments640.js','./js/personalMore640.js',
  './js/personalActionExecution641.js','./js/personalVaultEdit641.js','./js/personalFollowup642.js','./js/personalCapture643.js','./js/personalFamilyHomeActions644.js','./js/personalMoneyActions645.js','./js/personalDocumentActions646.js','./js/personalSettings647.js',
  './js/cloud.js','./js/cloudPayload32.js','./js/authUx32.js','./js/coldPartition42.js','./js/perf41.js',
  './icons/icon-192.png','./icons/icon-512.png'
];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('kamil-os-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
async function networkFirst(request){const cache=await caches.open(CACHE);try{const response=await fetch(request,{cache:'no-store'});if(response?.ok)cache.put(request,response.clone());return response}catch{const cached=await cache.match(request);return cached||Response.error()}}
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;const url=new URL(event.request.url);if(url.origin!==location.origin||url.pathname.startsWith('/api/'))return;event.respondWith(networkFirst(event.request))});
