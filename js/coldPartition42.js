const MAIN_KEY='kamil-os-state';
const COLD_KEY='kamil-os-41-2-cold-v1';
const BOOT_KEY='kamil-os-41-boot-summary';

const DOMAINS={
  money:[['tradeJournal','trades'],['personalSpending','transactions'],['netWorthBook','history'],['importCenter','history']],
  tickets:[['ticketBook','history'],['ticketBook','review']],
  system:[['audit']]
};
const VIEW_DOMAINS={today:[],money:['money'],tickets:['tickets'],home:[],more:['system']};
const hydrated=new Set();
let started=false,compactTimer=null,storePromise=null;

const parse=(raw,fallback)=>{try{return JSON.parse(raw)}catch{return fallback}};
const keyOf=path=>path.join('.');
const getPath=(obj,path)=>path.reduce((v,k)=>v?.[k],obj);
function setPath(obj,path,value){
  if(path.length===1){obj[path[0]]=value;return}
  obj[path[0]]=obj[path[0]]&&typeof obj[path[0]]==='object'?obj[path[0]]:{};
  obj[path[0]][path[1]]=value;
}
function readCold(){
  const data=parse(localStorage.getItem(COLD_KEY)||'null',{})||{};
  for(const name of Object.keys(DOMAINS))data[name]=data[name]&&typeof data[name]==='object'?data[name]:{};
  return data;
}
function writeBootStats(mainRaw,coldRaw){
  try{
    const boot=parse(localStorage.getItem(BOOT_KEY)||'null',{})||{};
    boot.storage={mainBytes:mainRaw?.length||0,coldBytes:coldRaw?.length||0,partitioned:true,at:Date.now()};
    localStorage.setItem(BOOT_KEY,JSON.stringify(boot));
  }catch{}
}
export function compactLocalState42(){
  try{
    const raw=localStorage.getItem(MAIN_KEY);if(!raw)return {ok:false,reason:'NO_STATE'};
    const state=parse(raw,null);if(!state||typeof state!=='object')return {ok:false,reason:'BAD_STATE'};
    const cold=readCold();let changed=false,moved=0;
    for(const [domain,paths] of Object.entries(DOMAINS)){
      for(const path of paths){
        const k=keyOf(path),value=getPath(state,path);
        if(!Array.isArray(value))continue;
        if(value.length||cold[domain][k]===undefined)cold[domain][k]=value;
        if(value.length){moved+=value.length;setPath(state,path,[]);changed=true}
      }
    }
    const coldRaw=JSON.stringify(cold);
    localStorage.setItem(COLD_KEY,coldRaw);
    const mainRaw=changed?JSON.stringify(state):raw;
    if(changed)localStorage.setItem(MAIN_KEY,mainRaw);
    writeBootStats(mainRaw,coldRaw);
    return {ok:true,changed,moved,mainBytes:mainRaw.length,coldBytes:coldRaw.length};
  }catch(error){return {ok:false,error:String(error?.message||error)}}
}
async function getStore(){
  if(!storePromise)storePromise=import('./state.js').then(m=>m.store);
  return storePromise;
}
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
      else{
        const parent=path[0];
        if(out[parent]===state[parent])out[parent]={...(state[parent]||{})};
        out[parent][path[1]]=saved;
      }
    }
  }
  return out;
}
function scheduleCompact(delay=180){
  clearTimeout(compactTimer);compactTimer=setTimeout(()=>compactLocalState42(),delay);
}
export async function startColdPartition42(){
  if(started)return;started=true;
  const store=await getStore();
  store.subscribe(()=>scheduleCompact(180));
  const idle=fn=>'requestIdleCallback'in window?requestIdleCallback(fn,{timeout:2200}):setTimeout(fn,900);
  idle(()=>compactLocalState42());
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')compactLocalState42()});
  window.addEventListener('beforeunload',()=>compactLocalState42());
}
export function coldStorageStats42(){
  try{return {mainBytes:(localStorage.getItem(MAIN_KEY)||'').length,coldBytes:(localStorage.getItem(COLD_KEY)||'').length,hydrated:[...hydrated]}}catch{return {mainBytes:0,coldBytes:0,hydrated:[...hydrated]}}
}
export const coldStorage42Info={domains:Object.keys(DOMAINS),goal:'keep historical arrays out of the startup state without deleting them'};
