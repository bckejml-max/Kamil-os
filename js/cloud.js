import {SUPABASE_URL,SUPABASE_KEY,STATE_TABLE,CALENDAR_TABLE,XTB_TABLE} from './config.js';
import {store} from './state.js';

export const sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
let timer=null,statusFn=()=>{};

export const onSyncStatus=fn=>statusFn=fn;
const status=(s,detail='')=>statusFn(s,detail);

export async function session(){const {data}=await sb.auth.getSession();return data.session}
export async function login(email,password){return sb.auth.signInWithPassword({email,password})}
export async function logout(){return sb.auth.signOut()}

async function saveNow(){
 const sess=await session();if(!sess)return;
 if(!navigator.onLine){store.queueSync(store.get());status('offline');return}
 status('saving');
 try{
   const payload=store.get(),clientUpdatedAt=new Date().toISOString();
   const {data,error}=await sb.from(STATE_TABLE).upsert({user_id:sess.user.id,payload,updated_at:clientUpdatedAt}).select('updated_at').single();
   if(error)throw error;
   const serverUpdatedAt=data?.updated_at||clientUpdatedAt;
   store.dirty=false;store.clearQueue();store.get().meta.lastCloudAt=serverUpdatedAt;store.persist();store.setMeta({lastCloudAt:serverUpdatedAt});
   status('ok');
 }catch(e){store.queueSync(store.get());status('offline',e.message)}
}
export function scheduleSave(){clearTimeout(timer);timer=setTimeout(saveNow,700)}
store.setCloudWriter(scheduleSave);

export async function flushQueue(){if(!navigator.onLine)return;const q=store.readQueue();if(q){store.replace(q.payload,'queued-local');store.dirty=true;await saveNow()}}

export async function loadCloud(){
 const sess=await session();if(!sess)return {ok:false};
 status('saving','načítám');
 const {data,error}=await sb.from(STATE_TABLE).select('payload,updated_at').eq('user_id',sess.user.id).maybeSingle();
 if(error){status('offline',error.message);return {ok:false,error}}
 if(!data?.payload){await saveNow();return {ok:true,new:true}}
 const local=store.get(),cloudAt=new Date(data.updated_at||0).getTime(),localAt=new Date(local.meta?.lastMutationAt||0).getTime();
 const lastCloudAt=new Date(store.meta().lastCloudAt||0).getTime();
 // Conflict only when BOTH sides changed after the last cloud version acknowledged by this device.
 if(store.dirty && localAt>lastCloudAt && cloudAt>lastCloudAt){
   status('conflict');return {ok:false,conflict:true,cloud:data.payload,updatedAt:data.updated_at,localAt:local.meta?.lastMutationAt,lastCloudAt:store.meta().lastCloudAt};
 }
 store.replace(data.payload,'cloud');store.dirty=false;store.setMeta({lastCloudAt:data.updated_at});status('ok');return {ok:true}
}


export function conflictSummary(local,cloud){
 const count=(x,path)=>{try{const v=path.split('.').reduce((o,k)=>o?.[k],x);return Array.isArray(v)?v.length:0}catch{return 0}};
 return [['Úkoly','tasks'],['Projekty','projects'],['Vstupenky','ticketBook.items'],['Dluhy','debtBook.items'],['Inbox','inbox']]
   .map(([label,path])=>({label,local:count(local,path),cloud:count(cloud,path)}));
}
export async function resolveConflict(choice,cloudPayload){
 if(choice==='cloud'){store.replace(cloudPayload,'cloud-conflict');store.dirty=false;store.clearQueue();status('ok')}
 else if(choice==='local'){await saveNow()}
}

export async function loadDataHubs(){
 const sess=await session();if(!sess)return;
 try{
   const {data}=await sb.from(CALENDAR_TABLE).select('source,as_of,events').eq('id',1).maybeSingle();
   if(data)store.mutate('Aktualizován kalendář',s=>{s.calendar={source:data.source,asOf:data.as_of,events:(data.events||[]).map(e=>({...e,title:e.title||e.summary||'Událost'}))}},{undo:false,cloud:false,audit:false});
 }catch{}
 try{
   const {data}=await sb.from(XTB_TABLE).select('source,as_of,report,trade_journal,cfd_summary,updated_at').eq('id',1).maybeSingle();
   if(data){
     store.mutate('Aktualizováno XTB',s=>{
       const a=data.report?.accounts||{},czk=Object.values(a).find(x=>x.currency==='CZK')||a['51850491']||{},eur=Object.values(a).find(x=>x.currency==='EUR')||a['56069932']||{};
       s.xtbHub={source:data.source,asOf:data.as_of,updatedAt:data.updated_at,accounts:a,positionCount:data.report?.position_count||0,report:data.report};
       s.xtbReport={asOf:data.as_of,czkValue:czk.value||0,czkProfit:czk.profit||0,eurValue:eur.value||0,eurProfit:eur.profit||0,source:data.source};
       s.tradeJournal={...(s.tradeJournal||{}),asOf:data.as_of,trades:data.trade_journal||[]};
     },{undo:false,cloud:false,audit:false});
   }
 }catch{}
}

window.addEventListener('online',()=>flushQueue());
window.addEventListener('offline',()=>status('offline'));
