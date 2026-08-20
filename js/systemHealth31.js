const bytes=v=>{try{return new TextEncoder().encode(JSON.stringify(v??null)).length}catch{return 0}};
const ageHours=(iso,now=new Date())=>{const t=new Date(iso||0).getTime(),n=new Date(now).getTime();return Number.isFinite(t)&&t>0&&Number.isFinite(n)?Math.max(0,(n-t)/3600000):null};
const ageDays=(iso,now=new Date())=>{const h=ageHours(iso,now);return h===null?null:Math.floor(h/24)};
const levelRank={OK:0,INFO:1,WARN:2,BAD:3};
const check=(id,label,level,detail)=>({id,label,level,detail});
export function systemHealth31(state={},meta={},env={},now=new Date()){
 const stateBytes=Number.isFinite(env.stateBytes)?env.stateBytes:bytes(state),queueBytes=Number.isFinite(env.queueBytes)?env.queueBytes:0,totalBytes=stateBytes+queueBytes;
 const checks=[];
 const backupAge=ageDays(meta.lastBackupAt,now),xtbAge=ageHours(state.xtbHub?.asOf||state.xtbReport?.asOf||state.xtbHub?.updatedAt,now),ticketAge=ageHours(state.ticketBook?.intelligenceAsOf||state.ticketBook?.intelligence?.asOf,now);
 checks.push(check('release','Verze aplikace',env.releaseConsistent===false?'BAD':'OK',env.releaseConsistent===false?'Nesedí více zdrojů verze.':'Jeden kanonický release zdroj.'));
 checks.push(check('schema','Datové schema',Number(state.meta?.schemaVersion||0)===Number(env.schemaVersion||0)?'OK':'BAD',`v${state.meta?.schemaVersion||0} / očekáváno v${env.schemaVersion||0}`));
 checks.push(check('storage','Lokální úložiště',totalBytes>4_500_000?'BAD':totalBytes>3_000_000?'WARN':'OK',`${Math.max(1,Math.round(totalBytes/1024)).toLocaleString('cs-CZ')} kB včetně pending sync.`));
 checks.push(check('backup','Záloha',backupAge===null?'WARN':backupAge>30?'BAD':backupAge>14?'WARN':'OK',backupAge===null?'Záloha zatím nebyla potvrzena.':backupAge===0?'Poslední záloha dnes.':`Poslední záloha před ${backupAge} dny.`));
 checks.push(check('sync','Synchronizace',env.pendingSync?'WARN':state.meta?.cloudMode==='cloud'?'OK':'INFO',env.pendingSync?'Čeká lokální změna k odeslání.':state.meta?.cloudMode==='cloud'?'Cloud je připojený.':'Lokální režim; cloud je volitelný.'));
 checks.push(check('network','Síť',env.online===false?'INFO':'OK',env.online===false?'Offline režim — změny zůstávají lokálně.':'Síť dostupná.'));
 checks.push(check('pwa','PWA',env.serviceWorkerSupported===false?'WARN':env.serviceWorkerControlled===false?'INFO':'OK',env.serviceWorkerSupported===false?'Service Worker není podporovaný.':env.serviceWorkerControlled===false?'Service Worker ještě nepřevzal stránku.':'Offline shell je aktivní.'));
 if(xtbAge===null)checks.push(check('xtb','XTB data','INFO','Bez datovaného XTB snapshotu.'));else checks.push(check('xtb','XTB data',xtbAge>72?'BAD':xtbAge>48?'WARN':'OK',`Stáří ${Math.floor(xtbAge)} h.`));
 if(ticketAge!==null)checks.push(check('tickets','Ticket intelligence',ticketAge>48?'BAD':ticketAge>30?'WARN':'OK',`Stáří ${Math.floor(ticketAge)} h.`));else checks.push(check('tickets','Ticket intelligence','INFO','Bez živého intelligence snapshotu; pravidlový engine funguje dál.'));
 const worst=checks.reduce((a,b)=>levelRank[b.level]>levelRank[a]?b.level:a,'OK'),score=Math.max(0,100-checks.reduce((s,x)=>s+({OK:0,INFO:2,WARN:10,BAD:24}[x.level]||0),0));
 return {status:worst,score,checks,stateBytes,queueBytes,totalBytes,backupAgeDays:backupAge,xtbAgeHours:xtbAge,ticketAgeHours:ticketAge,note:'System Health 31 je diagnostika. Nic neopravuje ani nesynchronizuje bez explicitní akce uživatele.'};
}
export const systemHealth31Note='System Health sleduje verzi, schema, velikost lokálních dat, zálohu, pending sync, PWA a stáří rozhodovacích dat.';
