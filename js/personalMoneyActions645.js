import {store} from './state.js';
import {formModal,modal,h,toast,uid} from './utils.js';
import {personalVaultRecord640,confirmVaultRecord640} from './personalVault640.js';
import {openVaultEdit641,updateVaultRecord641} from './personalVaultEdit641.js';

const n=v=>{const x=Number(String(v??'').replace(',','.').trim());return Number.isFinite(x)?x:null};
const today=()=>{const d=new Date(),y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`};

export async function openMoneyRecord645(id){
 const x=personalVaultRecord640(id);if(!x)return null;
 const body=`<div class="card"><h2>${h(x.title)}</h2><p>${h(x.status.detail)}</p><div class="decision-note"><b>Další krok:</b> ${h(x.nextAction||'Aktualizovat údaj.')}</div></div>`;
 const choice=await modal('Peníze domácnosti',body,[{label:'Upravit údaje',value:'edit',primary:true},{label:'Potvrdit aktuálnost',value:'confirm'},{label:'Zavřít',value:null}]);
 if(choice==='edit'){await openVaultEdit641(id);return 'edited'}
 if(choice==='confirm'){confirmVaultRecord640(id);toast('Aktuálnost potvrzena.');return 'confirmed'}
 return choice;
}

export async function updateMortgageSnapshot645(id){
 const x=personalVaultRecord640(id);if(!x)return null;
 const data=await formModal('Aktualizovat hypotéku',`<div class="form-grid"><label>Aktuální zůstatek jistiny<input name="balance" inputmode="decimal" value="${x.balance??''}" autofocus></label><label>Měsíční splátka<input name="monthlyAmount" inputmode="decimal" value="${x.monthlyAmount??''}"></label><label>Stav k<input name="asOf" type="date" value="${h((x.asOf||today()).slice(0,10))}"></label></div>`,{submitLabel:'Uložit aktuální stav'});if(!data)return null;
 const patch={balance:n(data.balance),monthlyAmount:n(data.monthlyAmount),asOf:String(data.asOf||today())};
 if(updateVaultRecord641(id,patch)){toast('Hypotéka aktualizována.');return patch}return null;
}

export async function updateBankSnapshot645(id){
 const x=personalVaultRecord640(id);if(!x)return null;
 const data=await formModal('Aktualizovat bankovní data',`<div class="form-grid"><label>Data kompletní k<input name="asOf" type="date" value="${h((x.asOf||today()).slice(0,10))}" autofocus></label><label class="wide">Poznámka / další krok<textarea name="nextAction" rows="3">${h(x.nextAction||'')}</textarea></label></div>`,{submitLabel:'Uložit stav'});if(!data)return null;
 const patch={asOf:String(data.asOf||today()),nextAction:String(data.nextAction||'').trim()};
 if(updateVaultRecord641(id,patch)){toast('Bankovní snapshot aktualizován.');return patch}return null;
}

export async function createMoneyTask645(){
 const data=await formModal('Nový finanční úkol',`<div class="form-grid"><label class="wide">Co je potřeba vyřešit<input name="title" autofocus required placeholder="Např. zkontrolovat novou splátku hypotéky"></label><label>Termín<input name="due" type="date"></label><label>Odhad minut<input name="estimateMinutes" type="number" min="1" step="1" value="10"></label></div>`,{submitLabel:'Přidat úkol'});if(!data?.title?.trim())return null;
 const item={id:uid('personal-money-task'),title:String(data.title).trim(),category:'osobní finance',area:'personal',status:'OPEN',due:String(data.due||'')||null,estimateMinutes:Number(data.estimateMinutes||10),createdAt:new Date().toISOString()};
 store.mutate(`Přidán finanční úkol: ${item.title}`,s=>{s.tasks=Array.isArray(s.tasks)?s.tasks:[];s.tasks.push(item)},{undo:true,cloud:true,audit:true});toast('Finanční úkol přidán.');return item;
}
