const CACHE='kamil-os-738.0.0-core-r141';
const CRITICAL=[
 './','./index.html','./manifest.webmanifest','./styles.css','./os2.css','./productReset1300.css','./os1331.css','./os1332.css','./os1333.css','./os1334.css','./os1400.css','./os1500.css',
 './js/osHardening1110.js','./js/dataIntegrity1130.js','./js/instantShell64.js','./js/app.js','./js/releaseMeta.js','./js/config.js',
 './js/state.js','./js/bettingMaster1335.js','./js/ticketMaster1336.js','./js/insuranceMaster1336.js','./js/utils.js','./js/viewRuntime41.js','./js/runtimeOwnership1100.js','./js/todayPage2000.js','./js/workPage1300.js','./js/propertyPage1300.js','./js/propertyHub620.js','./js/tasksOverview.js','./js/moneyOverview.js','./js/ticketOverview.js','./js/bettingOverview.js','./js/familyPage140.js','./js/homePage140.js','./js/documentsPage141.js',
 './js/cloud.js','./js/authUx32.js','./js/perf41.js','./js/coldPartition42.js'
];
const CACHEABLE_PATHS=new Set(CRITICAL.map(path=>new URL(path,self.location.href).pathname));
const RUNTIME_STATIC_PATH=/\.(?:js|css|webmanifest|png|svg|ico|webp)$/i;
const sensitiveAuthUrl=url=>url.searchParams.has('code')||url.searchParams.has('token_hash')||url.searchParams.has('access_token')||url.searchParams.has('refresh_token')||url.searchParams.get('type')==='recovery';

async function cacheStaticModuleGraph(cache,path,seen=new Set()){
 const url=new URL(path,self.location.href);
 if(url.origin!==self.location.origin||seen.has(url.href)||!url.pathname.endsWith('.js'))return;
 seen.add(url.href);
 const request=new Request(url.href,{cache:'reload'});
 const response=await fetch(request);
 if(!response?.ok)throw new Error('Module precache failed: '+url.pathname);
 await cache.put(request,response.clone());
 const source=await response.text();