import fs from 'fs';
const assert=(x,m)=>{if(!x)throw new Error(m)};
const ui=fs.readFileSync('js/personalPlusUi29.js','utf8'),vault=fs.readFileSync('js/vault29.js','utf8');
for(const x of ['store.subscribe((s,reason)','bulkReason','cloud-conflict','queued-local','backup-import','previousAmounts=current','Export šifrovaný','Import šifrovaný','readVaultEnvelope','writeVaultEnvelope'])assert(ui.includes(x),'Personal Plus hardening missing '+x);
assert(!ui.includes('store.subscribe(s=>'),'price watcher must receive mutation reason');
for(const x of ['AES-GCM','PBKDF2','VAULT_STORAGE_KEY','KAMIL_OS_LOCAL_VAULT'])assert(vault.includes(x),'Vault invariant missing '+x);
for(const x of ["from './state.js'",'SUPABASE','kamil_os_state'])assert(!vault.includes(x),'Vault leaked into synced state '+x);
console.log('PERSONAL PLUS 29 STATIC HARDENING PASS');