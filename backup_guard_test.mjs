const {createBackupEnvelope,readBackup,backupPayload,backupHealth,BACKUP_FORMAT}=await import('./js/backupGuard26.js');
const assert=(x,m)=>{if(!x)throw new Error(m)};
const ref=new Date('2026-08-20T10:00:00+02:00');
const state={
 meta:{schemaVersion:38},
 personalAdmin:{items:[{id:'p1',title:'Pojištění',status:'ACTIVE'}]},
 familyHome:{members:[{id:'f1',name:'Rodina',status:'ACTIVE'}]},
 emergencyFile:{contacts:[{id:'c1',name:'Kontakt',status:'ACTIVE'}],assets:[{id:'a1',title:'Dokumenty',status:'ACTIVE'}]},
 ticketBook:{items:[]},debtBook:{items:[]},
 undo:[{label:'starý snapshot',state:{secretHistoricalValue:'UNDO-SECRET-SHOULD-NOT-EXPORT'}}]
};
const cleaned=backupPayload(state);
assert(Array.isArray(cleaned.undo)&&cleaned.undo.length===0,'portable backup strips undo snapshots');
assert(state.undo.length===1,'backup cleanup does not mutate live state');
const env=createBackupEnvelope(state,ref);
assert(env.format===BACKUP_FORMAT&&env.schemaVersion===38,'envelope metadata');
assert(!JSON.stringify(env).includes('UNDO-SECRET-SHOULD-NOT-EXPORT'),'undo historical secret not exported');
assert(env.payload.personalAdmin.items[0].title==='Pojištění','user records preserved');
let read=readBackup(env);assert(read.ok&&!read.legacy,'new backup verifies');assert(read.fingerprint===env.fingerprint,'fingerprint roundtrip');
const tampered=structuredClone(env);tampered.payload.personalAdmin.items[0].title='Změněno';read=readBackup(tampered);assert(!read.ok&&read.code==='FINGERPRINT_MISMATCH','tampering detected');
read=readBackup({meta:{schemaVersion:37},personalAdmin:{items:[]}});assert(read.ok&&read.legacy,'legacy raw JSON remains supported');
read=readBackup({format:BACKUP_FORMAT,formatVersion:1,schemaVersion:999,fingerprint:'x',payload:{meta:{schemaVersion:999}}});assert(!read.ok&&read.code==='FUTURE_SCHEMA','future schema blocked');
let health=backupHealth(state,{},ref);assert(health.status==='NO_BACKUP','missing backup detected');
health=backupHealth(state,{lastBackupAt:'2026-08-01T10:00:00+02:00'},ref);assert(health.status==='AGING','aging backup detected');
health=backupHealth(state,{lastBackupAt:'2026-07-01T10:00:00+02:00'},ref);assert(health.status==='STALE','stale backup detected');
health=backupHealth(state,{lastBackupAt:'2026-08-18T10:00:00+02:00'},ref);assert(health.status==='OK','fresh backup detected');assert(health.counts.emergencyContacts===1&&health.counts.personalAdmin===1,'personal coverage counted');
console.log('BACKUP & RECOVERY GUARD QA PASS');
