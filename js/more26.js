import {APP_VERSION,SCHEMA_VERSION} from './config.js';
import {store,validateState,repairState} from './state.js';
import {createBackupEnvelope,readBackup,backupHealth,backupGuardNote} from './backupGuard26.js';
import {smartImportView,bindSmartImport} from './smartImportUi29.js';
import {h,downloadJson,qs,qsa,modal,toast} from './utils.js';
import {runPreflight} from './preflight.js';

let mode='menu';
export function setMoreMode(v='menu'){mode=['import','backup','settings','system'].includes(v)?v:'menu';renderMore()}
const back=`<div class="subview-bar"><button class="btn" id="more26Back">← Zpět</button><div><span>VÍCE</span><b>Personal OS</b></div></div>`;
const backupTone=x=>x==='OK'?'good':x==='AGING'?'warn':'bad';
const backupAge=x=>x.ageDays===null?'nikdy':x.ageDays===0?'dnes':`před ${x.ageDays} dny`;

function menu(){
 const s=store.get(),pf=s.meta?.preflight||runPreflight(),bh=backupHealth(s,store.meta()),imports=s.importCenter?.history?.length||0;
 return `<div class="view-head"><div><div class="eyebrow">VÍCE / PERSONAL OS</div><h1>Import, záloha a systém</h1><p>Osobní obsah je v Domově. Tady jsou nástroje pro bezpečný vstup dat, soukromí, zálohu a diagnostiku.</p></div><div class="view-head-stat"><b class="${pf.ok===false?'bad':'good'}">${pf.ok===false?'!':'✓'}</b><span>stav systému</span></div></div><div class="more26-grid">
 <button class="hub-tile" data-more26="import"><span class="hub-icon good">⇩</span><span class="hub-copy"><b>Smart Import</b><small>CSV / TSV / JSON · ${imports} potvrzených importů</small></span><span class="hub-arrow">→</span></button>
 <button class="hub-tile" data-more26="backup"><span class="hub-icon ${backupTone(bh.status)}">↧</span><span class="hub-copy"><b>Záloha</b><small>${h(bh.label)} · ${h(backupAge(bh))}</small></span><span class="hub-arrow">→</span></button>
 <button class="hub-tile" data-more26="settings"><span class="hub-icon">⚙</span><span class="hub-copy"><b>Nastavení</b><small>Soukromí, notifikace a volitelný cloud</small></span><span class="hub-arrow">→</span></button>
 <button class="hub-tile" data-more26="system"><span class="hub-icon ${pf.ok===false?'bad':'good'}">●</span><span class="hub-copy"><b>Systém</b><small>Verze, schema, diagnostika a synchronizace</small></span><span class="hub-arrow">→</span></button></div>`;
}
function backup(){
 const s=store.get(),meta=store.meta(),bh=backupHealth(s,meta),kb=Math.max(1,Math.round(bh.currentBytes/1024));
 return `${back}<div class="view-head compact"><div><div class="eyebrow">BACKUP & RECOVERY GUARD / 26.5</div><h1>Tvoje data pod kontrolou</h1><p>Nová záloha má kontrolní otisk, neobsahuje interní Undo snapshoty a před obnovou se automaticky vytvoří bezpečnostní kopie současného stavu.</p></div><div class="view-head-stat"><b class="${backupTone(bh.status)}">${h(bh.label)}</b><span>${h(backupAge(bh))}</span></div></div>
 <div class="metric-strip"><div class="metric"><span>Nová záloha</span><b>${kb} kB</b><small>bez Undo historie</small></div><div class="metric"><span>Osobní administrativa</span><b>${bh.counts.personalAdmin}</b></div><div class="metric"><span>Rodina + Emergency</span><b>${bh.counts.family+bh.counts.emergencyContacts+bh.counts.emergencyAssets}</b></div><div class="metric"><span>Transakce</span><b>${bh.counts.transactions||0}</b></div><div class="metric"><span>Kontrolní otisk</span><b>${h(bh.currentFingerprint.slice(0,8))}</b></div></div>
 <div class="grid two"><div class="card backup24-card"><h2>Vytvořit ověřitelnou zálohu</h2><p class="muted">Stáhne kompletní uživatelská data včetně historických pracovních dat kvůli zpětné kompatibilitě, ale vynechá interní Undo snapshoty.</p><button class="btn primary" id="backup26Export">Stáhnout bezpečnou JSON zálohu</button></div><div class="card backup24-card"><h2>Prověřit a obnovit</h2><p class="muted">Nový formát ověří kontrolní otisk. Staré JSON exporty zůstávají podporované. Novější neznámé schema se neobnoví naslepo.</p><label class="btn">Vybrat JSON zálohu<input id="backup26Import" type="file" accept=".json,application/json" hidden></label></div></div>
 <div class="decision-note warn"><b>Soukromí:</b> ${h(backupGuardNote)}</div>${meta.lastRestoreAt?`<div class="decision-note">Poslední obnova: <b>${h(new Date(meta.lastRestoreAt).toLocaleString('cs-CZ'))}</b>. Před ní byla vytvořena samostatná safety záloha.</div>`:''}`;
}
function settings(){const s=store.get(),mask=s.personalSettings?.maskSensitive!==false,cloud=s.meta?.cloudMode==='cloud',notification=('Notification'in window)?Notification.permission:'unsupported';return `${back}<div class="view-head compact"><div><div class="eyebrow">NASTAVENÍ</div><h1>Soukromí a chování</h1><p>Citlivé identifikátory se standardně maskují a nikdy se nezařazují do globálního vyhledávání.</p></div></div><div class="card settings24-list"><div class="row"><div><b>Citlivý režim</b><div class="muted">Čísla smluv a dokladů jsou ${mask?'skrytá':'viditelná'}.</div></div><button class="btn" id="mask26Toggle">${mask?'Ukázat':'Skrýt'}</button></div><div class="row"><div><b>Notifikace</b><div class="muted">Stav: ${h(notification)}</div></div>${notification==='default'?'<button class="btn" id="notify26Enable">Povolit</button>':''}</div><div class="row"><div><b>Cloud</b><div class="muted">${cloud?'Připojený Supabase účet':'Lokální režim – cloud je volitelný'}</div></div>${cloud?'<span class="status good">PŘIPOJENO</span>':'<button class="btn" id="cloud26Connect">Připojit cloud</button>'}</div></div>`}
function system(){const s=store.get(),pf=runPreflight(),size=Math.round(new Blob([JSON.stringify(s)]).size/1024),bh=backupHealth(s,store.meta());return `${back}<div class="view-head compact"><div><div class="eyebrow">SYSTÉM</div><h1>Kamil OS ${h(APP_VERSION)}</h1><p>Personal OS schema v${SCHEMA_VERSION}. Starší pracovní data jsou zachována v záloze/stavu, ale nejsou součástí osobního rozhraní.</p></div><div class="view-head-stat"><b class="${pf.ok?'good':'bad'}">${pf.ok?'OK':'!'}</b><span>preflight</span></div></div><div class="card"><div class="row"><span>Verze aplikace</span><b>${h(APP_VERSION)}</b></div><div class="row"><span>Schema</span><b>v${SCHEMA_VERSION}</b></div><div class="row"><span>Velikost lokálního stavu</span><b>${size} kB</b></div><div class="row"><span>Importované transakce</span><b>${s.personalSpending?.transactions?.length||0}</b></div><div class="row"><span>Historie importů</span><b>${s.importCenter?.history?.length||0}</b></div><div class="row"><span>Backup Guard</span><b class="${backupTone(bh.status)}">${h(bh.label)} · ${h(backupAge(bh))}</b></div><div class="row"><span>Režim dat</span><b>${s.meta?.cloudMode==='cloud'?'Cloud + lokální cache':'Jen toto zařízení'}</b></div><div class="row"><span>Poslední cloud sync</span><b>${s.meta?.lastCloudAt?new Date(s.meta.lastCloudAt).toLocaleString('cs-CZ'):'—'}</b></div></div>`}

function exportBackup({safety=false}={}){
 const env=createBackupEnvelope(store.get()),stamp=env.exportedAt.slice(0,19).replace(/[:T]/g,'-'),name=safety?`kamil-os-before-restore-${stamp}.json`:`kamil-os-${APP_VERSION}-${stamp}.json`;
 downloadJson(name,env);
 if(safety)store.setMeta({lastSafetyBackupAt:env.exportedAt,lastSafetyBackupFingerprint:env.fingerprint});
 else store.setMeta({lastBackupAt:env.exportedAt,lastBackupFingerprint:env.fingerprint,lastBackupBytes:env.bytes});
 return env;
}

async function importBackup(file){
 try{
  const raw=JSON.parse(await file.text()),parsed=readBackup(raw);
  if(!parsed.ok)return toast(parsed.message||'Zálohu nelze bezpečně ověřit.');
  const v=validateState(parsed.payload);if(!v.ok)return toast('Záloha má neplatný formát a nelze ji bezpečně obnovit.');
  const repaired=repairState(parsed.payload),issues=[...(v.issues||[]),...(repaired.report?.issues||[])],unique=[...new Set(issues)].slice(0,5),source=parsed.legacy?'starší JSON export':`ověřená záloha · otisk ${parsed.fingerprint.slice(0,8)}`;
  const ok=await modal('Obnovit zálohu?',`<p>Zdroj: <b>${h(source)}</b>${parsed.exportedAt?` · ${h(new Date(parsed.exportedAt).toLocaleString('cs-CZ'))}`:''}.</p><p>Před obnovou automaticky stáhnu <b>safety backup současného stavu</b>. Potom data bezpečně migruji na schema v${SCHEMA_VERSION}.</p>${unique.length?`<p class="muted">Opravitelné nálezy: ${h(unique.join(' · '))}</p>`:'<p class="muted">Kontrola struktury neodhalila problém.</p>'}<p class="muted">Obnova sama nic nemaže z cloudové historie ani automaticky neprovádí jiné osobní akce.</p>`,[{label:'Zrušit',value:false},{label:'Vytvořit safety backup a obnovit',value:true,primary:true}]);
  if(!ok)return;
  exportBackup({safety:true});
  store.replace(repaired.state,'backup-import');store.dirty=true;store.queueSync(store.get());store.setMeta({lastRestoreAt:new Date().toISOString(),lastRestoreSource:parsed.legacy?'legacy':parsed.fingerprint});
  toast('Záloha obnovena; původní stav byl stažen jako safety backup.');renderMore();
 }catch{toast('Soubor není platná JSON záloha.')}
}
function bind(){qsa('[data-more26]',qs('#moreView')).forEach(b=>b.onclick=()=>{mode=b.dataset.more26;renderMore();window.dispatchEvent(new CustomEvent('kamil:more',{detail:mode}))});qs('#more26Back')?.addEventListener('click',()=>{mode='menu';renderMore()});if(mode==='import')bindSmartImport(()=>renderMore());qs('#backup26Export')?.addEventListener('click',()=>{exportBackup();toast('Bezpečná JSON záloha vytvořena');renderMore()});qs('#backup26Import')?.addEventListener('change',e=>{const f=e.target.files?.[0];if(f)importBackup(f)});qs('#mask26Toggle')?.addEventListener('click',()=>store.mutate('Změněn citlivý režim',s=>{s.personalSettings=s.personalSettings||{};s.personalSettings.maskSensitive=!(s.personalSettings.maskSensitive!==false)}));qs('#notify26Enable')?.addEventListener('click',async()=>{if('Notification'in window){const p=await Notification.requestPermission();toast(p==='granted'?'Notifikace povoleny':'Notifikace nebyly povoleny');renderMore()}});qs('#cloud26Connect')?.addEventListener('click',()=>window.dispatchEvent(new CustomEvent('kamil:cloud-login')))}
export function renderMore(){const host=qs('#moreView');if(!host)return;host.innerHTML=mode==='import'?smartImportView(back):mode==='backup'?backup():mode==='settings'?settings():mode==='system'?system():menu();bind()}