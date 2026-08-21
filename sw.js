const CACHE='kamil-os-41.0.0-runtime-r1';
const SHELL=[
  './','./index.html','./manifest.webmanifest','./styles.css','./today25.css','./personal29.css','./theme33.css',
  './js/instantShell42.js','./js/app.js','./js/viewRuntime41.js','./js/perf41.js','./js/theme33.js','./js/releaseMeta.js','./js/releaseStamp.js','./js/lazyBoot41.js',
  './icons/icon-192.png','./icons/icon-512.png'
];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('kamil-os-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
async function networkFirst(request){const cache=await caches.open(CACHE);try{const fresh=await fetch(request);if(fresh?.ok)cache.put(request,fresh.clone());return fresh}catch{return (await cache.match(request))||(request.mode==='navigate'?await cache.match('./index.html'):Response.error())}}
async function staleWhileRevalidate(request){const cache=await caches.open(CACHE),cached=await cache.match(request),refresh=fetch(request).then(response=>{if(response?.ok)cache.put(request,response.clone());return response}).catch(()=>null);if(cached){refresh.catch(()=>null);return cached}return (await refresh)||Response.error()}
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;const url=new URL(event.request.url);if(url.origin!==location.origin||url.pathname.startsWith('/api/'))return;if(event.request.mode==='navigate'){event.respondWith(networkFirst(event.request));return}event.respondWith(staleWhileRevalidate(event.request))});
