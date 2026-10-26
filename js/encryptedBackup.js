import {store} from './state.js';
import {createEncryptedBackup747,readEncryptedBackup747} from './backupGuard26.js';
import {formModal,modal,downloadJson,toast,h} from './utils.js';

const stamp=()=>new Date().toISOString().replace(/[:.]/g,'-');
export async function exportEncryptedBackup(){
 const form=await formModal('Šifrovaná záloha',`<p class="muted">Zvol heslo s alespoň 10 znaky. Heslo se nikam neukládá; bez něj zálohu nepůjde obnovit.</p><label>Heslo</label><input name="passphrase" type="password" minlength="10" autocomplete="new-password" required autofocus><label>Zopakovat heslo</label><input name="confirm" type="password" minlength="10" autocomplete="new-password" required>`,{submitLabel:'Stáhnout šifrovanou zálohu'});
 if(!form)return false;
 const pass=String(form.passphrase||''),confirm=String(form.confirm||'');
 if(pass.length<10){toast('Heslo musí mít alespoň 10 znaků.');return false}
 if(pass!==confirm){toast('Hesla se neshodují.');return false}
 try{
  const encrypted=await createEncryptedBackup747(store.get(),pass);
  downloadJson(`kamil-os-encrypted-backup-${stamp()}.json`,encrypted);
  store.setMeta({lastBackupAt:new Date().toISOString(),lastBackupEncrypted:true});
  toast('Šifrovaná záloha je připravená ke stažení.');
  return true;
 }catch(error){toast('Šifrovanou zálohu se nepodařilo vytvořit.');console.warn('[encrypted-backup:export]',error);return false}
}
export async function restoreEncryptedBackup(){
 const form=await formModal('Obnovit šifrovanou zálohu',`<p class="muted">Vyber Kamil OS encrypted backup a zadej heslo, kterým byl vytvořen.</p><label>Soubor</label><input name="file" type="file" accept=".json,application/json" required autofocus><label>Heslo</label><input name="passphrase" type="password" autocomplete="current-password" required>`,{submitLabel:'Ověřit zálohu'});
 if(!form)return false;
 const file=form.file,pass=String(form.passphrase||'');
 if(!(file instanceof File)||!file.size){toast('Vyber soubor se zálohou.');return false}
 try{
  const raw=JSON.parse(await file.text()),read=await readEncryptedBackup747(raw,pass);
  if(!read.ok){toast(read.message||'Zálohu se nepodařilo odemknout.');return false}
  const choice=await modal('Potvrdit obnovu',`<p>Obnovit ověřenou šifrovanou zálohu z <b>${h(read.exportedAt||raw.createdAt||'neznámého data')}</b>?</p><p class="muted">Aktuální stav zařízení bude nahrazen. Změna se zapíše do auditu a při připojeném cloudu se synchronizuje.</p>`,[{label:'Zrušit',value:null},{label:'Obnovit',value:'restore',primary:true,danger:true}]);
  if(choice!=='restore')return false;
  store.replace(read.payload,'Obnovena šifrovaná záloha',{cloud:true,audit:true});
  store.setMeta({lastRestoreAt:new Date().toISOString(),lastRestoreEncrypted:true});
  toast('Šifrovaná záloha byla obnovena.');
  return true;
 }catch(error){toast('Soubor zálohy je neplatný nebo poškozený.');console.warn('[encrypted-backup:restore]',error);return false}
}
