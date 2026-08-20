const arr=v=>Array.isArray(v)?v:[];
const clean=(v,max=220)=>String(v??'').trim().slice(0,max);
const BLOCKED_KEYS=/^(password|pass|secret|token|access_token|refresh_token|cvv|seed|privatekey|private_key|rawocr|raw_ocr|rawimage|raw_image|imagedata|image_data|attachmentdata|attachment_data|blob)$/i;
const DOMAINS=[
 ['tasks',s=>s.tasks],
 ['personalAdmin',s=>s.personalAdmin?.items],
 ['tickets',s=>s.ticketBook?.items],
 ['debts',s=>s.debtBook?.items],
 ['goals',s=>s.personalGoals?.items],
 ['netWorth',s=>s.netWorthBook?.items],
 ['spending',s=>s.personalSpending?.transactions],
 ['assets',s=>s.assetBook?.items],
 ['personalInbox',s=>s.personalInbox?.items]
];

const sanitize=(v,depth=0)=>{
 if(depth>8)return null;
 if(Array.isArray(v))return v.slice(0,500).map(x=>sanitize(x,depth+1));
 if(v&&typeof v==='object'){
  const out={};
  for(const [k,x] of Object.entries(v)){if(BLOCKED_KEYS.test(k))continue;out[k]=sanitize(x,depth+1)}
  return out;
 }
 if(typeof v==='string')return v.slice(0,4000);
 if(typeof v==='number'||typeof v==='boolean'||v===null)return v;
 return v===undefined?null:String(v).slice(0,4000);
};
const sortValue=v=>Array.isArray(v)?v.map(sortValue):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,sortValue(v[k])])):v;
const stable=v=>JSON.stringify(sortValue(v));
const hash=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(36)};

export function syncProjection31(state={}){
 const records=[];
 for(const [domain,get] of DOMAINS){
  for(const item of arr(get(state))){
   const entityId=clean(item?.id,220);if(!entityId)continue;
   const payload=sanitize(item),signature=hash(stable(payload));
   records.push({key:`${domain}|${entityId}`,domain,entityId,payload,signature});
  }
 }
 records.sort((a,b)=>a.key.localeCompare(b.key,'en'));
 return {version:1,records,total:records.length,domains:Object.fromEntries(DOMAINS.map(([d])=>[d,records.filter(x=>x.domain===d).length])),note:'Smart Sync 31.4 sleduje jen allowlist položek se stabilním ID. Vault, auth, Emergency File, raw OCR a jiné citlivé/transientní oblasti nejsou součástí shadow syncu.'};
}

export function syncDiff31(previous=[],current=[],{deviceId='device',seqStart=0,at=new Date().toISOString()}={}){
 const before=new Map(arr(previous).map(x=>[x.key,x])),after=new Map(arr(current).map(x=>[x.key,x])),ops=[];let seq=Math.max(0,Number(seqStart)||0);
 const add=(op,item)=>{seq+=1;ops.push({id:`${clean(deviceId,120)}:${seq}`,deviceId:clean(deviceId,120),seq,domain:item.domain,entityId:item.entityId,op,payload:op==='DELETE'?null:item.payload,signature:item.signature||null,clientAt:at,status:'PENDING'})};
 for(const item of after.values()){const prev=before.get(item.key);if(!prev||prev.signature!==item.signature)add('UPSERT',item)}
 for(const item of before.values())if(!after.has(item.key))add('DELETE',item);
 return {ops,nextSeq:seq,upserts:ops.filter(x=>x.op==='UPSERT').length,deletes:ops.filter(x=>x.op==='DELETE').length,note:'31.4 vytváří shadow operace pouze pro diagnostiku a upload. Tyto operace se automaticky neaplikují zpět do hlavního Kamil OS state.'};
}

export function syncPayloadSafe31(value){return sanitize(value)}
export const smartSyncDomains31=DOMAINS.map(([x])=>x);
export const smartSyncPrivacy31='Shadow sync výslovně vynechává Vault, auth tokeny, Emergency File, raw OCR/obrázky a blokované secret/password/token/CVV/seed klíče.';
