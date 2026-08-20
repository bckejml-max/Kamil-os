export const VAULT_STORAGE_KEY='kamil-os-vault-29';
export const VAULT_VERSION=1;
export const VAULT_KINDS={POLICY:'Číslo smlouvy / pojistky',DOCUMENT:'Identifikátor dokladu',ACCOUNT:'Osobní identifikátor účtu',OTHER:'Jiný citlivý identifikátor'};
export const vaultNote='Sensitive Vault je šifrovaný pouze na tomto zařízení a není součástí Kamil OS cloud state ani běžné JSON zálohy. Neukládej do něj hesla, PINy, CVV, seed/recovery fráze ani privátní klíče.';

const enc=new TextEncoder(),dec=new TextDecoder();
const b64=bytes=>{let s='';for(const b of bytes)s+=String.fromCharCode(b);return btoa(s)};
const unb64=s=>{const raw=atob(String(s||''));return Uint8Array.from(raw,c=>c.charCodeAt(0))};
const secretLike=v=>/(?:heslo|password|pin\b|cvv|cvc|seed\s*phrase|recovery\s*(?:phrase|words?)|mnemonic|private\s*key|privátní\s*klíč|privatni\s*klic)/i.test(String(v||''));
export const vaultRejects=v=>secretLike(v);

async function keyFromPassphrase(passphrase,salt){
 const base=await crypto.subtle.importKey('raw',enc.encode(String(passphrase||'')),'PBKDF2',false,['deriveKey']);
 return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:210000,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
}
export function emptyVault(){return {items:[],updatedAt:null}}
export async function encryptVault(data,passphrase){
 if(String(passphrase||'').length<8)throw new Error('PASSPHRASE_SHORT');
 const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12)),key=await keyFromPassphrase(passphrase,salt),payload={version:VAULT_VERSION,data:data&&typeof data==='object'?data:emptyVault()},plain=enc.encode(JSON.stringify(payload)),cipher=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},key,plain));
 return {format:'KAMIL_OS_LOCAL_VAULT',version:VAULT_VERSION,kdf:'PBKDF2-SHA256',iterations:210000,cipher:'AES-GCM',salt:b64(salt),iv:b64(iv),data:b64(cipher),updatedAt:new Date().toISOString()};
}
export async function decryptVault(envelope,passphrase){
 try{
  if(!envelope||envelope.format!=='KAMIL_OS_LOCAL_VAULT'||Number(envelope.version)!==VAULT_VERSION)return {ok:false,code:'FORMAT'};
  const salt=unb64(envelope.salt),iv=unb64(envelope.iv),cipher=unb64(envelope.data),key=await keyFromPassphrase(passphrase,salt),plain=await crypto.subtle.decrypt({name:'AES-GCM',iv},key,cipher),parsed=JSON.parse(dec.decode(plain));
  if(Number(parsed.version)!==VAULT_VERSION||!parsed.data||typeof parsed.data!=='object')return {ok:false,code:'PAYLOAD'};
  parsed.data.items=Array.isArray(parsed.data.items)?parsed.data.items:[];return {ok:true,data:parsed.data};
 }catch{return {ok:false,code:'LOCKED'}}
}
export function readVaultEnvelope(){try{return JSON.parse(localStorage.getItem(VAULT_STORAGE_KEY)||'null')}catch{return null}}
export function vaultExists(){return !!readVaultEnvelope()}
export function writeVaultEnvelope(envelope){localStorage.setItem(VAULT_STORAGE_KEY,JSON.stringify(envelope));return envelope}
export function deleteVault(){localStorage.removeItem(VAULT_STORAGE_KEY)}
export async function saveVault(data,passphrase){const envelope=await encryptVault(data,passphrase);writeVaultEnvelope(envelope);return envelope}
export async function unlockStoredVault(passphrase){const envelope=readVaultEnvelope();if(!envelope)return {ok:true,data:emptyVault(),new:true};return decryptVault(envelope,passphrase)}
export function sanitizeVaultItem(x={}){
 const title=String(x.title||'').trim().slice(0,120),value=String(x.value||'').trim().slice(0,240),note=String(x.note||'').trim().slice(0,400),kind=VAULT_KINDS[x.kind]?x.kind:'OTHER';
 if(secretLike(`${title} ${value} ${note}`))return {ok:false,code:'SECRET_TYPE',message:'Vault záměrně nepřijímá hesla, PINy, CVV, seed/recovery fráze ani privátní klíče.'};
 if(!title||!value)return {ok:false,code:'REQUIRED',message:'Doplň název i citlivý identifikátor.'};
 return {ok:true,item:{...x,title,value,note,kind,updatedAt:new Date().toISOString(),createdAt:x.createdAt||new Date().toISOString()}};
}
