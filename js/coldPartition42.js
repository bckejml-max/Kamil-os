const MAIN_KEY='kamil-os-state';
const COLD_KEY='kamil-os-41-2-cold-v1';
const BOOT_KEY='kamil-os-41-boot-summary';
const QUEUE_KEY='kamil-os-22-sync-queue';
const LAYOUT_VERSION=3;

const DOMAINS={
  money:[['tradeJournal','trades'],['personalSpending','transactions'],['netWorthBook','history'],['importCenter','history'],['investmentBook','history']]
};
const VIEW_DOMAINS={today:[],money:['money'],tickets:[],home:[],more:[]};
const hydrated=new Set();
let started=false,storePromise=null;

const parse=(raw,fallback)=>{try{return JSON.parse(raw)}catch{return fallback}};
const emptyCold=()=>Object.fromEntries(Object.keys(DOMAINS).map(x=>[x,{}]));
const keyOf=path=>path.join('.');
const getPath=(obj,path)=>path.reduce((v,k)=>v?.[k],obj);
function setPath(obj,path,value){
  if(path.length===1){obj[path[0]]=value;return}
  obj[path[0]]=obj[path[0]]&&typeof obj[path[0]]==='object'?obj[path[0]]:{};
  obj[path[0]][path[1]]=value;
}
function readBoot(){try{return parse(localStorage.getItem(BOOT_KEY)||'null',{})||{}}catch{return{}}}
function readCold(){
  try{
    const data=parse(localStorage.getItem(COLD_KEY)||'null',{})||{};
    for(const name of Object.keys(DOMAINS))data[name]=data[name]&&typeof data[name]==='object'?data[name]:{};
    return data;
  }catch{return emptyCold()}
}
function compactQueue(){
  try{
    const raw=localStorage.getItem(QUEUE_KEY);if(!raw)return 0;
    const previousBytes=raw.length;
    localStorage.setItem(QUEUE_KEY,JSON.stringify({at:new Date().toISOString(),pending:true}));
    return previousBytes;
  }catch{return 0}
}
function writeBootStats(mainBytes,coldBytes){
  try{
    const boot=readBoot();
    boot.storage={...(boot.storage||{}),mainBytes:Number(mainBytes||0),coldBytes:Number(coldBytes||0),queueBytes:(localStorage.getItem(QUEUE_KEY)||'').length,partitioned:true,layoutVersion:LAYOUT_VERSION,at:Date.now()};
    localStorage.setItem(BOOT_KEY,JSON.stringify(boot));
  }catch{}
}
function stateHasColdData(state={}){
  for(const paths of Object.values(DOMAINS))for(const path of paths){const value=getPath(state,path);if(Array.isArray(value)&&value.length)return true}
  return false;
}
function syncColdFromState(state,cold){
  for(const [domain,paths] of Object.entries(DOMAINS)){
    if(!hydrated.has(domain)&&!paths.some(path=>Array.isArray(getPath(state,path))&&getPath(state,path).length))continue;
    for(const path of paths){
      const k=keyOf(path),value=getPath(state,path);
      if(!Array.isArray(value))continue;
      if(value.length||hydrated.has(domain)||cold[domain][k]===undefined)cold[domain][k]=value;
    }
  }
  return cold;
}
function slimState(state={}){
  const out={...state,undo:[]};
  for(const paths of Object.values(DOMAINS))for(const path of paths){
    if(path.length===1){out[path[0]]=[];continue}
    const parent=path[0];if(out[parent]===state[parent])out[parent]={...(state[parent]||{})};out[parent][path[1]]=[];
  }
  return out;
}
function persistPartitioned(store){
  const state=store.get(),mainRaw=JSON.stringify(slimState(state));
  localStorage.setItem(MAIN_KEY,mainRaw);
  let coldBytes=Number(readBoot()?.storage?.coldBytes||0);
  if(hydrated.size||stateHasColdData(state)){
    const cold=syncColdFromState(state,readCold()),coldRaw=JSON.stringify(cold);
    localStorage.setItem(COLD_KEY,coldRaw);coldBytes=coldRaw.length;
  }
  if(store.undoLoaded)store.writeUndo?.();store.writeBootSummary?.();writeBootStats(mainRaw.length,coldBytes);
}
function patchStorePersistence(store){
  if(store.__coldPersist42)return;
  const originalPersist=store.persist.bind(store),originalQueue=store.queueSync.bind(store);
  store.persist=()=>{try{return persistPartitioned(store)}catch(error){console.warn('[coldPartition42] persist fallback',error);return originalPersist()}};
  store.queueSync=()=>{try{localStorage.setItem(QUEUE_KEY,JSON.stringify({at:new Date().toISOString(),pending:true}))}catch{return originalQueue(store.get())}};
  compactQueue();store.__coldPersist42=true;
}

export function needsLocalCompaction42(){
  try{
    const raw=localStorage.getItem(MAIN_KEY);if(!raw)return false;
    const storage=readBoot().storage||{};
    return !(storage.partitioned===true&&Number(storage.layoutVersion||0)===LAYOUT_VERSION);
  }catch{return true}
}
export function compactLocalState42({force=false}={}){
  try{
    const raw=localStorage.getItem(MAIN_KEY);if(!raw){compactQueue();return {ok:false,reason:'NO_STATE'}};
    if(!force&&!needsLocalCompaction42()){
      const queueBytesBefore=compactQueue(),coldBytes=Number(readBoot()?.storage?.coldBytes||0);
      writeBootStats(raw.length,coldBytes);
      return {ok:true,skipped:true,changed:false,moved:0,mainBytes:raw.length,coldBytes,queueBytesBefore};
    }
    const state=parse(raw,null);if(!state||typeof state!=='object')return {ok:false,reason:'BAD_STATE'};
    const cold=readCold();let changed=false,moved=0;
    for(const [domain,paths] of Object.entries(DOMAINS)){
      for(const path of paths){
        const k=keyOf(path),value=getPath(state,path);
        if(!Array.isArray(value))continue;
        if(value.length||hydrated.has(domain)||cold[domain][k]===undefined)cold[domain][k]=value;
        if(value.length){moved+=value.length;setPath(state,path,[]);changed=true}
      }
    }
    const coldRaw=JSON.stringify(cold);localStorage.setItem(COLD_KEY,coldRaw);
    const mainRaw=changed?JSON.stringify(state):raw;if(changed)localStorage.setItem(MAIN_KEY,mainRaw);
    const queueBytesBefore=compactQueue();writeBootStats(mainRaw.length,coldRaw.length);
    return {ok:true,skipped:false,changed,moved,mainBytes:mainRaw.length,coldBytes:coldRaw.length,queueBytesBefore};
  }catch(error){return {ok:false,error:String(error?.message||error)}}
}
async function getStore(){if(!storePromise)storePromise=import('./state.js').then(m=>m.store);return storePromise}
export async function hydrateColdDomains42(domains=[]){
  const wanted=[...new Set(domains)].filter(x=>DOMAINS[x]&&!hydrated.has(x));if(!wanted.length)return false;
  const store=await getStore(),state=store.get(),cold=readCold();let changed=false;
  for(const domain of wanted){
    for(const path of DOMAINS[domain]){
      const k=keyOf(path),saved=cold[domain]?.[k],current=getPath(state,path);
      if(Array.isArray(saved)&&(!Array.isArray(current)||current.length===0)){setPath(state,path,saved);changed=changed||saved.length>0}
    }
    hydrated.add(domain);
  }
  return changed;
}
export function hydrateColdView42(view='today'){return hydrateColdDomains42(VIEW_DOMAINS[view]||[])}
export function mergeColdState42(state={}){
  const cold=readCold(),out={...state};
  for(const [domain,paths] of Object.entries(DOMAINS)){
    for(const path of paths){
      const saved=cold[domain]?.[keyOf(path)],current=getPath(state,path);
      if(!Array.isArray(saved)||saved.length===0||(Array.isArray(current)&&current.length))continue;
      if(path.length===1)out[path[0]]=saved;
      else{const parent=path[0];if(out[parent]===state[parent])out[parent]={...(state[parent]||{})};out[parent][path[1]]=saved}
    }
  }
  return out;
}
export async function startColdPartition42(){
  if(started)return;started=true;
  const store=await getStore();
  if(needsLocalCompaction42())compactLocalState42({force:true});
  patchStorePersistence(store);
  if(stateHasColdData(store.get()))persistPartitioned(store);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')try{persistPartitioned(store)}catch{}});
  window.addEventListener('beforeunload',()=>{try{persistPartitioned(store)}catch{}});
}
export function coldStorageStats42(){
  try{return {mainBytes:(localStorage.getItem(MAIN_KEY)||'').length,coldBytes:(localStorage.getItem(COLD_KEY)||'').length,queueBytes:(localStorage.getItem(QUEUE_KEY)||'').length,hydrated:[...hydrated],layoutVersion:Number(readBoot()?.storage?.layoutVersion||0)}}catch{return {mainBytes:0,coldBytes:0,queueBytes:0,hydrated:[...hydrated],layoutVersion:0}}
}
export const coldStorage42Info={domains:Object.keys(DOMAINS),layoutVersion:LAYOUT_VERSION,goal:'keep money history arrays and cloud queue payloads out of hot localStorage while preserving all data and avoiding repeat startup parsing'};
