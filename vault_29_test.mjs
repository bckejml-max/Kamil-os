const {encryptVault,decryptVault,sanitizeVaultItem,VAULT_STORAGE_KEY}=await import('./js/vault29.js');
const assert=(x,m)=>{if(!x)throw new Error(m)};
const data={items:[{id:'v1',title:'Pojistka domu',kind:'POLICY',value:'ABC-12345',note:'jen identifikátor'}],updatedAt:'2026-08-20T10:00:00Z'};
const env=await encryptVault(data,'spravne-heslo-vaultu');assert(env.format==='KAMIL_OS_LOCAL_VAULT','vault format');const raw=JSON.stringify(env);assert(!raw.includes('ABC-12345')&&!raw.includes('Pojistka domu'),'plaintext not in envelope');
let r=await decryptVault(env,'spravne-heslo-vaultu');assert(r.ok&&r.data.items[0].value==='ABC-12345','vault roundtrip');r=await decryptVault(env,'spatne-heslo');assert(!r.ok&&r.code==='LOCKED','wrong passphrase blocked');
assert(sanitizeVaultItem({title:'Doklad',value:'ID-7788',kind:'DOCUMENT'}).ok,'identifier allowed');assert(!sanitizeVaultItem({title:'PIN ke kartě',value:'1234',kind:'OTHER'}).ok,'PIN rejected');assert(!sanitizeVaultItem({title:'Seed',value:'seed phrase alpha beta',kind:'OTHER'}).ok,'seed phrase rejected');assert(VAULT_STORAGE_KEY!=='kamil-os-state','vault uses separate storage key');
console.log('SENSITIVE VAULT 29 QA PASS');