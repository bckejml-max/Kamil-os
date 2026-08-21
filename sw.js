const CACHE='kamil-os-43.2.0-runtime-r1';
const SHELL=[
  './','./index.html','./manifest.webmanifest',
  './js/instantShell42.js','./js/app.js','./js/releaseMeta.js','./js/config.js','./js/state.js','./js/utils.js',
  './js/viewRuntime41.js','./js/todayLite43.js','./js/coldPartition42.js','./js/cloud.js','./js/cloudPayload32.js','./js/authUx32.js','./js/perf41.js',
  './js/lifeOs42Engine.js','./js/lifeOs42Ui.js','./js/adaptive421.js','./lifeOs42.css',
  './js/platform43.js','./js/platform431Stability.js','./js/platform431LeanUi.js','./js/desktopBridge43.js','./platform43.css',
  './icons/icon-192.png','./icons/icon-512.png'
];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('kamil-os-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
async function instantNavigate(request){const cache=await caches.open(CACHE),cached=(await cache.match('./index.html'))||(await cache.match(request));const refresh=fetch(request).then(response=>{if(response?.ok){cache.put('./index.html',response.clone());cache.put(request,response.clone())}return response}).catch(()=>null);if(cached){refresh.catch(()=>null);return cached}return (await refresh)||Response.error()}
async function staleWhileRevalidate(request){const cache=await caches.open(CACHE),cached=await cache.match(request),refresh=fetch(request).then(response=>{if(response?.ok)cache.put(request,response.clone());return response}).catch(()=>null);if(cached){refresh.catch(()=>null);return cached}return (await refresh)||Response.error()}
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;const url=new URL(event.request.url);if(url.origin!==location.origin||url.pathname.startsWith('/api/'))return;if(event.request.mode==='navigate'){event.respondWith(instantNavigate(event.request));return}event.respondWith(staleWhileRevalidate(event.request))});
