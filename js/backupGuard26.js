import {APP_VERSION,SCHEMA_VERSION} from './config.js';

export const BACKUP_FORMAT='KAMIL_OS_BACKUP';
export const BACKUP_FORMAT_VERSION=1;
export const backupGuardNote='JSON záloha není šifrovaná. Ulož ji na bezpečné místo. Kontrolní otisk chrání proti náhodnému poškození souboru, není to kryptografický podpis.';

const obj=v=>v&&typeof v==='object'&&!Array.isArray(v);
const jsonClone=v=>JSON.parse(JSON.stringify(v));
const utf8Bytes=s=>typeof TextEncoder!=='undefined'?new TextEncoder().encode(s).length:unescape(encodeURIComponent(s)).length;

function stableStringify(v){
 if(v===null||typeof v!=='object')return JSON.stringify(v);
 if(Array.isArray(v))return `[${v.map(stableStringify).join(',')}]`;
 return `{${Object.keys(v).sort().map(k=>`${JSON.stringify(k)}:${stableStringify(v[k])}`).join(',')}}`;
}

export function backupFingerprint(payload){
 const text=stableStringify(payload);let hash=0xcbf29ce484222325n;
 for(let i=0;i<text.length;i++){
  const code=text.charCodeAt(i);
  hash^=BigInt(code&0xff);hash=BigInt.asUintN(64,hash*0x100000001b3n);
  if(code>0xff){hash^=BigInt((code>>8)&0xff);hash=BigInt.asUintN(64,hash*0x100000001b3n)}
 }
 return hash.toString(16).padStart(16,'0');
}

export function backupPayload(state){
 const base=obj(state)?{...state,undo:[]}:{undo:[]};
 const payload=jsonClone(base);payload.undo=[];
 return payload;
}

export function createBackupEnvelope(state,now=new Date()){
 const payload=backupPayload(state),fingerprint=backupFingerprint(payload),exportedAt=new Date(now).toISOString();
 const envelope={format:BACKUP_FORMAT,formatVersion:BACKUP_FORMAT_VERSION,appVersion:APP_VERSION,schemaVersion:SCHEMA_VERSION,exportedAt,fingerprint,payload};
 return {...envelope,bytes:utf8Bytes(JSON.stringify(envelope))};
}

export function readBackup(raw){
 if(!obj(raw))return {ok:false,code:'INVALID',message:'Soubor neobsahuje objekt zálohy.'};
 if(raw.format===BACKUP_FORMAT){
  if(Number(raw.formatVersion)!==BACKUP_FORMAT_VERSION)return {ok:false,code:'FORMAT_VERSION',message:'Tato verze formátu zálohy není podporovaná.'};
  if(!obj(raw.payload))return {ok:false,code:'NO_PAYLOAD',message:'Záloha neobsahuje datový payload.'};
  const schema=Number(raw.schemaVersion??raw.payload?.meta?.schemaVersion??0);
  if(schema>SCHEMA_VERSION)return {ok:false,code:'FUTURE_SCHEMA',message:`Záloha používá novější schema v${schema}; tato aplikace umí v${SCHEMA_VERSION}.`};
  const actual=backupFingerprint(raw.payload),expected=String(raw.fingerprint||'');
  if(!expected||actual!==expected)return {ok:false,code:'FINGERPRINT_MISMATCH',message:'Kontrolní otisk nesedí. Soubor mohl být po exportu změněn nebo poškozen.',expected,actual};
  return {ok:true,legacy:false,payload:raw.payload,schema,exportedAt:raw.exportedAt||null,appVersion:raw.appVersion||null,fingerprint:actual,bytes:utf8Bytes(JSON.stringify(raw))};
 }
 const schema=Number(raw.meta?.schemaVersion||0);
 if(schema>SCHEMA_VERSION)return {ok:false,code:'FUTURE_SCHEMA',message:`Starší JSON export používá novější schema v${schema}; tato aplikace umí v${SCHEMA_VERSION}.`};
 return {ok:true,legacy:true,payload:raw,schema,exportedAt:null,appVersion:null,fingerprint:null,bytes:utf8Bytes(JSON.stringify(raw))};
}

const daysAgo=(iso,now)=>{const t=new Date(iso||0).getTime();if(!Number.isFinite(t)||t<=0)return null;return Math.max(0,Math.floor((new Date(now).getTime()-t)/86400000))};
const active=a=>(Array.isArray(a)?a:[]).filter(x=>String(x?.status||'ACTIVE').toUpperCase()!=='ARCHIVED').length;

export function backupHealth(state,meta={},now=new Date()){
 const env=createBackupEnvelope(state,now),ageDays=daysAgo(meta.lastBackupAt,now);
 const status=ageDays===null?'NO_BACKUP':ageDays>30?'STALE':ageDays>14?'AGING':'OK';
 const label={NO_BACKUP:'BEZ ZÁLOHY',STALE:'STARÁ ZÁLOHA',AGING:'BRZY OBNOVIT',OK:'ZÁLOHA OK'}[status];
 const counts={
  personalAdmin:active(state?.personalAdmin?.items),
  family:active(state?.familyHome?.members),
  emergencyContacts:active(state?.emergencyFile?.contacts),
  emergencyAssets:active(state?.emergencyFile?.assets),
  personalInbox:(state?.personalInbox?.items||[]).filter(x=>String(x?.status||'NEW').toUpperCase()==='NEW').length,
  assets:active(state?.assetBook?.items),
  tickets:active(state?.ticketBook?.items),
  debts:active(state?.debtBook?.items)
 };
 return {status,label,ageDays,lastBackupAt:meta.lastBackupAt||null,lastRestoreAt:meta.lastRestoreAt||null,currentFingerprint:env.fingerprint,currentBytes:env.bytes,counts,note:backupGuardNote};
}
