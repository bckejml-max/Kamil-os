const CACHE='kamil-os-737.0.1-core-r5';
const CRITICAL=[
 './','./index.html','./manifest.webmanifest','./styles.css','./os2.css','./os2010.css','./os737.css',
 './js/instantShell64.js','./js/app.js','./js/releaseMeta.js','./js/config.js',
 './js/state.js','./js/utils.js','./js/viewRuntime41.js','./js/runtimeOwnership1100.js',
 './js/cloud.js','./js/authUx32.js','./js/perf41.js','./js/coldPartition42.js'
];

async function precache(){
 const cache=await caches.open(CACHE);
 const results=await Promise.allSettled(CRITICAL.map(path=>cache.add(path)));
 const failed=results.filter(x=>x.status==='rejected').length;
 if(failed)console.warn(`[sw-os2] shell precache failures: ${failed}`);
}
self.addEventListener('install',event=>{event.waitUntil(precache().then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('kamil-os-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
async function networkFirst(request){
 const cache=await caches.open(CACHE);
 try{const response=await fetch(request,{cache:'no-store'});if(response?.ok)cache.put(request,response.clone());return response}
 catch{const cached=await cache.match(request,{ignoreSearch:false});return cached||Response.error()}
}
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);
 if(url.origin!==location.origin||url.pathname.startsWith('/api/'))return;
 event.respondWith(networkFirst(event.request));
});
