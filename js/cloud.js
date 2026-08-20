import {SUPABASE_URL,SUPABASE_KEY,STATE_TABLE,CALENDAR_TABLE,XTB_TABLE,SCHEMA_VERSION} from './config.js';
import {store} from './state.js';
import {cloudPayload32,cloudPayloadNeedsNormalize32,cloudSchema32,mergeCloudIntoDevice32} from './cloudPayload32.js';

const SUPABASE_SDK='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
const CANONICAL_APP_URL='https://kamil-os-smoke.vercel.app/';
const projectRef=(()=>{try{return new URL(SUPABASE_URL).hostname.split('.')[0]}catch{return''}})();
const authStorageKey=projectRef?`sb-${projectRef}-auth-token`:'';
let client=null,sdkPromise=null,timer=null,statusFn=()=>{};

export const onSyncStatus=fn=>statusFn=fn;
const status=(s,detail='')=>statusFn(s,detail);
export const hasStoredCloudSession=()=>{try{return !!(authStorageKey&&localStorage.getItem(authStorageKey))}catch{return false}};
const queryParams=()=>{try{return new URLSearchParams(location.search)}catch{return new URLSearchParams()}};
const recoveryHint=()=>typeof location!=='undefined'&&(location.hash.includes('access_token=')||location.hash.includes('refresh_token=')||location.hash.includes('type=recovery')||queryParams().get('type')==='recovery'||queryParams().has('code')||queryParams().has('token_hash'));
const authRedirect=()=>{try{if(['localhost','127.0.0.1'].includes(location.hostname))return `${location.origin}${location.pathname}`}catch{}return CANONICAL_APP_URL};

async function loadSdk(){
 if(globalThis.supabase?.createClient)return globalThis.supabase;
 if(sdkPromise)return sdkPromise;
 sdkPromise=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=SUPABASE_SDK;script.async=true;script.crossOrigin='anonymous';script.onload=()=>globalThis.supabase?.createClient?resolve(globalThis.supabase):reject(new Error('Supabase SDK se nenačetlo.'));script.onerror=()=>reject(new Error('Supabase SDK není dostupné. Lokální režim funguje dál.'));document.head.appendChild(script)}).catch(error=>{sdkPromise=null;throw error});
 return sdkPromise;
}
async function getClient({force=false}={}){
 if(client)return client;
 if(!force&&!hasStoredCloudSession()&&!recoveryHint())return null;
 const sdk=await loadSdk();client=sdk.createClient(SUPABASE_URL,SUPABASE_KEY);return client;
}
export async function cloudClient(force=false){return getClient({force})}
export async function session(){const c=await getClient();if(!c)return null;const {data}=await c.auth.getSession();return data.session}
export async function login(email,password){const c=await getClient({force:true});return c.auth.signInWithPassword({email,password})}
export async function sendMagicLink(email){const c=await getClient({force:true});return c.auth.signInWithOtp({email,options:{shouldCreateUser:false,emailRedirectTo:authRedirect()}})}
export async function logout(){const c=await getClient();return c?c.auth.signOut():{error:null}}
export async function sendPasswordReset(email){const c=await getClient({force:true});return c.auth.resetPasswordForEmail(email,{redirectTo:authRedirect()})}
export async function updatePassword(password){const c=await getClient({force:true});return c.auth.updateUser({password})}
export async function watchAuth(handler){const c=await getClient();if(!c)return()=>{};const {data}=c.auth.onAuthStateChange(handler);return()=>data?.subscription?.unsubscribe?.()}

async function saveNow(){
 const c=await getClient(),sess=c?(await c.auth.getSession()).data.session:null;if(!sess)return {ok:false,reason:'NO_SESSION'};
 if(!navigator.onLine){store.queueSync(store.get());status('offline');return {ok:false,reason:'OFFLINE'}}
 status('saving');
 try{
   const payload=cloudPayload32(store.get(),SCHEMA_VERSION),clientUpdatedAt=new Date().toISOString();
   const {data,error}=await c.from(STATE_TABLE).upsert({user_id:sess.user.id,payload,updated_at:clientUpdatedAt}).select('updated_at').single();
   if(error)throw error;
   const serverUpdatedAt=data?.updated_at||clientUpdatedAt;
   store.dirty=false;store.clearQueue();store.get().meta.lastCloudAt=serverUpdatedAt;store.persist();store.setMeta({lastCloudAt:serverUpdatedAt,lastCloudSchema:SCHEMA_VERSION,lastCloudPayloadAt:serverUpdatedAt});status('ok');return {ok:true,updatedAt:serverUpdatedAt};
 }catch(e){store.queueSync(store.get());status('offline',e.message);return {ok:false,error:e}}
}
export function scheduleSave(){clearTimeout(timer);timer=setTimeout(saveNow,700)}
store.setCloudWriter(scheduleSave);
export async function flushQueue(){if(!navigator.onLine)return {ok:false,reason:'OFFLINE'};const q=store.readQueue();if(!q)return {ok:true,empty:true};store.dirty=true;return saveNow()}

export async function loadCloud(){
 const c=await getClient(),sess=c?(await c.auth.getSession()).data.session:null;if(!sess)return {ok:false,reason:'NO_SESSION'};
 status('saving','načítám');
 const {data,error}=await c.from(STATE_TABLE).select('payload,updated_at').eq('user_id',sess.user.id).maybeSingle();
 if(error){status('offline',error.message);return {ok:false,error}}
 if(!data?.payload){const saved=await saveNow();return {ok:!!saved?.ok,new:true}}
 const schema=cloudSchema32(data.payload,SCHEMA_VERSION);
 if(schema.future){status('conflict',`Cloud schema ${schema.remote} je novější než aplikace ${schema.current}`);return {ok:false,futureSchema:true,remoteSchema:schema.remote,currentSchema:schema.current,updatedAt:data.updated_at}}
 const local=store.get(),cloudAt=new Date(data.updated_at||0).getTime(),localAt=new Date(local.meta?.lastMutationAt||0).getTime(),lastCloudAt=new Date(store.meta().lastCloudAt||0).getTime();
 if(store.dirty&&localAt>lastCloudAt&&cloudAt>lastCloudAt){status('conflict');return {ok:false,conflict:true,cloud:data.payload,updatedAt:data.updated_at,localAt:local.meta?.lastMutationAt,lastCloudAt:store.meta().lastCloudAt}}
 const normalize=cloudPayloadNeedsNormalize32(data.payload,SCHEMA_VERSION),merged=mergeCloudIntoDevice32(local,data.payload,SCHEMA_VERSION);
 store.replace(merged,'cloud');store.dirty=false;store.setMeta({lastCloudAt:data.updated_at,lastCloudSchema:schema.remote||null});status('ok');
 if(normalize){const normalized=await saveNow();return {ok:true,normalized:!!normalized?.ok,updatedAt:normalized?.updatedAt||data.updated_at,fromSchema:schema.remote,toSchema:SCHEMA_VERSION}}
 return {ok:true,updatedAt:data.updated_at,fromSchema:schema.remote,toSchema:SCHEMA_VERSION};
}

export async function refreshIntelligence(){
 const c=await getClient(),sess=c?(await c.auth.getSession()).data.session:null;if(!sess)return {ok:false,error:new Error('Cloud není připojený')};
 try{
   const {data,error}=await c.from(STATE_TABLE).select('payload,updated_at').eq('user_id',sess.user.id).maybeSingle();if(error)throw error;
   const p=data?.payload||{},hasXtb=!!(p.xtbStrategy?.live||p.xtbStrategy?.liveAsOf),hasTickets=!!(p.ticketBook?.intelligence||p.ticketBook?.intelligenceAsOf);
   if(hasXtb||hasTickets)store.mutate('Načtena živá intelligence',s=>{
     if(hasXtb){s.xtbStrategy=s.xtbStrategy||{overrides:{}};if(p.xtbStrategy?.live!==undefined)s.xtbStrategy.live=p.xtbStrategy.live;if(p.xtbStrategy?.liveAsOf!==undefined)s.xtbStrategy.liveAsOf=p.xtbStrategy.liveAsOf}
     if(hasTickets){s.ticketBook=s.ticketBook||{items:[],watchlist:[]};if(p.ticketBook?.intelligence!==undefined)s.ticketBook.intelligence=p.ticketBook.intelligence;if(p.ticketBook?.intelligenceAsOf!==undefined)s.ticketBook.intelligenceAsOf=p.ticketBook.intelligenceAsOf}
   },{undo:false,cloud:false,audit:false});
   return {ok:true,xtb:hasXtb,tickets:hasTickets,updatedAt:data?.updated_at||null};
 }catch(error){return {ok:false,error}}
}

export function conflictSummary(local,cloud){
 const count=(x,path)=>{try{const v=path.split('.').reduce((o,k)=>o?.[k],x);return Array.isArray(v)?v.length:0}catch{return 0}};
 const personalTasks=x=>(x?.tasks||[]).filter(t=>String(t.area||'').toLocaleLowerCase('cs-CZ').includes('osob')&&t.status!=='HOTOVO').length;
 const emergencyCount=x=>count(x,'emergencyFile.contacts')+count(x,'emergencyFile.assets');
 return [
  {label:'Osobní administrativa',local:count(local,'personalAdmin.items'),cloud:count(cloud,'personalAdmin.items')},
  {label:'Rodina',local:count(local,'familyHome.members'),cloud:count(cloud,'familyHome.members')},
  {label:'Emergency File',local:emergencyCount(local),cloud:emergencyCount(cloud)},
  {label:'Personal Inbox',local:count(local,'personalInbox.items'),cloud:count(cloud,'personalInbox.items')},
  {label:'Majetek & servis',local:count(local,'assetBook.items'),cloud:count(cloud,'assetBook.items')},
  {label:'Cíle & fondy',local:count(local,'personalGoals.items'),cloud:count(cloud,'personalGoals.items')},
  {label:'Importované transakce',local:count(local,'personalSpending.transactions'),cloud:count(cloud,'personalSpending.transactions')},
  {label:'Historie importů',local:count(local,'importCenter.history'),cloud:count(cloud,'importCenter.history')},
  {label:'Net Worth ledger',local:count(local,'netWorthBook.items'),cloud:count(cloud,'netWorthBook.items')},
  {label:'Net Worth historie',local:count(local,'netWorthBook.history'),cloud:count(cloud,'netWorthBook.history')},
  {label:'Osobní úkoly',local:personalTasks(local),cloud:personalTasks(cloud)},
  {label:'Vstupenky',local:count(local,'ticketBook.items'),cloud:count(cloud,'ticketBook.items')},
  {label:'Pohledávky',local:count(local,'debtBook.items'),cloud:count(cloud,'debtBook.items')}
 ];
}
export async function resolveConflict(choice,cloudPayload){if(choice==='cloud'){const schema=cloudSchema32(cloudPayload,SCHEMA_VERSION);if(schema.future)return {ok:false,futureSchema:true};store.replace(mergeCloudIntoDevice32(store.get(),cloudPayload,SCHEMA_VERSION),'cloud-conflict');store.dirty=false;store.clearQueue();store.setMeta({lastCloudSchema:schema.remote||null});status('ok');if(cloudPayloadNeedsNormalize32(cloudPayload,SCHEMA_VERSION))await saveNow();return {ok:true}}if(choice==='local')return saveNow();return {ok:false,reason:'NO_CHOICE'}}

export async function loadDataHubs(){
 const c=await getClient(),sess=c?(await c.auth.getSession()).data.session:null;if(!sess)return;
 try{const {data}=await c.from(CALENDAR_TABLE).select('source,as_of,events').eq('id',1).maybeSingle();if(data)store.mutate('Aktualizován kalendář',s=>{s.calendar={source:data.source,asOf:data.as_of,events:(data.events||[]).map(e=>({...e,title:e.title||e.summary||'Událost'}))}},{undo:false,cloud:false,audit:false})}catch{}
 try{
   const {data}=await c.from(XTB_TABLE).select('source,as_of,report,trade_journal,cfd_summary,updated_at').eq('id',1).maybeSingle();
   if(data)store.mutate('Aktualizováno XTB',s=>{const a=data.report?.accounts||{},czk=Object.values(a).find(x=>x.currency==='CZK')||a['51850491']||{},eur=Object.values(a).find(x=>x.currency==='EUR')||a['56069932']||{};s.xtbHub={source:data.source,asOf:data.as_of,updatedAt:data.updated_at,accounts:a,positionCount:data.report?.position_count||0,report:data.report};s.xtbReport={asOf:data.as_of,czkValue:czk.value||0,czkProfit:czk.profit||0,eurValue:eur.value||0,eurProfit:eur.profit||0,source:data.source};s.tradeJournal={...(s.tradeJournal||{}),asOf:data.as_of,trades:data.trade_journal||[]}},{undo:false,cloud:false,audit:false});
 }catch{}
}
window.addEventListener('online',()=>flushQueue());window.addEventListener('offline',()=>status('offline'));
export const cloud32Info={schema:SCHEMA_VERSION,canonical:CANONICAL_APP_URL,undoCloud:false,futureSchemaGuard:true,queueReplaceDisabled:true};
