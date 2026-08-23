import {store} from './state.js';
import {formModal,h,toast} from './utils.js';
import {personalVaultRecord640} from './personalVault640.js';

const n=v=>{const x=Number(String(v??'').replace(',','.').trim());return Number.isFinite(x)?x:null};
const cleanDate=v=>String(v||'').trim()||null;

export function updateVaultRecord641(id,patch={}){
 let changed=false;
 store.mutate(`Upraven osobní údaj: ${id}`,s=>{
  const items=Array.isArray(s.personalVault?.items)?s.personalVault.items:[],x=items.find(v=>String(v.id)===String(id));if(!x)return;
  const allowed=['provider','monthlyAmount','annualAmount','balance','validUntil','noticeBy','reviewAt','asOf','nextAction','sourceLabel'];
  for(const k of allowed)if(Object.prototype.hasOwnProperty.call(patch,k))x[k]=patch[k];
  x.updatedAt=new Date().toISOString();x.userEdited=true;changed=true;
 },{undo:true,cloud:true,audit:true});
 return changed;
}

export async function openVaultEdit641(id){
 const x=personalVaultRecord640(id);if(!x)return null;
 const body=`<div class="form-grid"><label>Poskytovatel<input name="provider" value="${h(x.provider||'')}" autofocus></label><label>Částka / měsíc<input name="monthlyAmount" inputmode="decimal" value="${x.monthlyAmount??''}"></label><label>Částka / rok<input name="annualAmount" inputmode="decimal" value="${x.annualAmount??''}"></label><label>Aktuální zůstatek<input name="balance" inputmode="decimal" value="${x.balance??''}"></label><label>Platnost do<input name="validUntil" type="date" value="${h(x.validUntil||'')}"></label><label>Rozhodnout nejpozději<input name="noticeBy" type="date" value="${h(x.noticeBy||'')}"></label><label>Stav k<input name="asOf" type="date" value="${h((x.asOf||'').slice(0,10))}"></label><label class="wide">Další krok<textarea name="nextAction" rows="3">${h(x.nextAction||'')}</textarea></label></div>`;
 const data=await formModal(`Upravit: ${x.title}`,body,{submitLabel:'Uložit změny'});if(!data)return null;
 const patch={provider:String(data.provider||'').trim(),monthlyAmount:n(data.monthlyAmount),annualAmount:n(data.annualAmount),balance:n(data.balance),validUntil:cleanDate(data.validUntil),noticeBy:cleanDate(data.noticeBy),asOf:cleanDate(data.asOf),nextAction:String(data.nextAction||'').trim()};
 if(updateVaultRecord641(id,patch)){toast('Údaj uložen.');return patch}return null;
}
