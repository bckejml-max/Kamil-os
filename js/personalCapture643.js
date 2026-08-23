import {store} from './state.js';
import {formModal,toast,uid,h} from './utils.js';

const isoDate=v=>String(v||'').trim()?new Date(`${String(v).trim()}T12:00:00`).toISOString():null;
const num=v=>{const x=Number(String(v||'').replace(',','.'));return Number.isFinite(x)&&x!==0?x:null};

export async function openPersonalCapture643(defaultType='task'){
 const body=`<div class="form-grid"><label>Co přidáváš?<select name="type" autofocus><option value="task"${defaultType==='task'?' selected':''}>Osobní úkol</option><option value="waiting">Čekám na odpověď</option><option value="admin">Osobní administrativa</option><option value="insurance">Pojištění</option><option value="contract">Smlouva / služba</option></select></label><label class="wide">Název<input name="title" required placeholder="Např. Ověřit pojištění auta"></label><label>Termín / platnost<input name="date" type="date"></label><label>Poskytovatel<input name="provider" placeholder="Např. Allianz"></label><label>Částka / měsíc<input name="monthly" inputmode="decimal"></label><label>Částka / rok<input name="annual" inputmode="decimal"></label><label class="wide">Poznámka / další krok<textarea name="note" rows="3" placeholder="Co přesně je potřeba udělat?"></textarea></label></div>`;
 const data=await formModal('Přidat osobní věc',body,{submitLabel:'Přidat'});if(!data)return null;
 const type=String(data.type||'task'),title=String(data.title||'').trim();if(!title)return null;const at=new Date().toISOString(),date=isoDate(data.date),note=String(data.note||'').trim();
 let created=null;
 store.mutate(`Přidána osobní věc: ${title}`,s=>{
  if(type==='task'){
   created={id:uid('task'),title,area:'osobní',status:'OPEN',due:date,notes:note,createdAt:at};s.tasks=Array.isArray(s.tasks)?s.tasks:[];s.tasks.push(created);
  }else if(type==='waiting'){
   created={id:uid('waiting'),title,status:'OPEN',followUpAt:date||new Date(Date.now()+3*86400000).toISOString(),notes:note,createdAt:at};s.delegations=Array.isArray(s.delegations)?s.delegations:[];s.delegations.push(created);
  }else if(type==='admin'){
   created={id:uid('personal'),title,category:'osobní administrativa',status:'OPEN',due:date,notes:note,createdAt:at};s.personalAdmin=s.personalAdmin||{items:[]};s.personalAdmin.items=Array.isArray(s.personalAdmin.items)?s.personalAdmin.items:[];s.personalAdmin.items.push(created);
  }else{
   const recordType=type==='insurance'?'insurance':'utility';created={id:uid('vault'),title,section:type==='insurance'?'documents':'home',recordType,provider:String(data.provider||'').trim(),monthlyAmount:num(data.monthly),annualAmount:num(data.annual),validUntil:date,confidence:100,confidenceLabel:'ZADÁNO UŽIVATELEM',sourceLabel:'Zadáno uživatelem',sourceBasis:'Ruční záznam v Kamil OS 64.3',nextAction:note||'Průběžně udržovat aktuální.',createdAt:at,updatedAt:at,userEdited:true};s.personalVault=s.personalVault||{version:1,items:[],evidence:[]};s.personalVault.items=Array.isArray(s.personalVault.items)?s.personalVault.items:[];s.personalVault.items.push(created);s.personalVault.updatedAt=at;
  }
 },{undo:true,cloud:true,audit:true});
 toast('Přidáno.');return created;
}
