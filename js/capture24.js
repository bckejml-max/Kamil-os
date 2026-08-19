import {store} from './state.js';
import {uid,qs,modal,toast} from './utils.js';

const isoFromDate=(v,hour='09:00:00')=>v?new Date(`${v}T${hour}`).toISOString():null;
const TYPES=new Set(['task','wait','project','debt','ticket','inbox']);

export async function openQuickCapture(initialType=null){
 let type=TYPES.has(initialType)?initialType:null;
 if(!type){
  type=await modal('Rychle přidat',`<div class="capture-intro"><p class="muted">Vyber, co chceš dostat do Kamil OS. Uložím to rovnou do správné části.</p></div>`,[
   {label:'Úkol',value:'task',primary:true},{label:'Čekám na',value:'wait'},{label:'Projekt',value:'project'},{label:'Pohledávka',value:'debt'},{label:'Vstupenka',value:'ticket'},{label:'Inbox',value:'inbox'}
  ]);
 }
 if(!type)return false;
 if(type==='task')return addTask();
 if(type==='wait')return addWaiting();
 if(type==='project')return addProject();
 if(type==='debt')return addDebt();
 if(type==='ticket')return addTicket();
 if(type==='inbox')return addInbox();
 return false;
}

async function addTask(){
 const body=`<div class="form-grid capture-form"><label class="wide-field">Co je potřeba udělat<input id="capTaskTitle" autofocus placeholder="Např. Poslat PKS finální ZL"></label><label>Termín<input id="capTaskDue" type="date"></label><label>Oblast<input id="capTaskArea" value="Práce"></label><label>Priorita<select id="capTaskPriority"><option value="NORMAL">Normální</option><option value="HIGH">Vysoká</option></select></label></div>`;
 const ok=await modal('Nový úkol',body,[{label:'Zrušit',value:false},{label:'Přidat úkol',value:true,primary:true}]);if(!ok)return false;
 const title=qs('#capTaskTitle')?.value?.trim();if(!title)return toast('Napiš název úkolu');
 const due=qs('#capTaskDue')?.value||'',area=qs('#capTaskArea')?.value?.trim()||'Práce',priority=qs('#capTaskPriority')?.value||'NORMAL';
 store.mutate(`Přidán úkol: ${title}`,s=>s.tasks.unshift({id:uid('task'),title,status:'UDĚLAT',priority,area,due:isoFromDate(due),createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()}));toast('Úkol přidán');return true;
}

async function addWaiting(){
 const body=`<div class="form-grid capture-form"><label class="wide-field">Na co čekáš<input id="capWaitTitle" autofocus placeholder="Např. PKS – potvrzení ZL"></label><label>Od koho<input id="capWaitPerson" placeholder="Jméno / firma"></label><label>Chci zkontrolovat<input id="capWaitDue" type="date"></label></div>`;
 const ok=await modal('Nové „Čekám na“',body,[{label:'Zrušit',value:false},{label:'Začít hlídat',value:true,primary:true}]);if(!ok)return false;
 const title=qs('#capWaitTitle')?.value?.trim();if(!title)return toast('Napiš, na co čekáš');
 const person=qs('#capWaitPerson')?.value?.trim()||'',due=qs('#capWaitDue')?.value||'';
 store.mutate(`Čekám na: ${title}`,s=>{s.delegations=s.delegations||[];s.delegations.unshift({id:uid('wait'),title,person,status:'WAITING',followUpAt:isoFromDate(due),createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()})});toast('Přidáno do Čekám na');return true;
}

async function addProject(){
 const body=`<div class="form-grid capture-form"><label class="wide-field">Název projektu<input id="capProjectName" autofocus placeholder="Např. Nová Zbrojovka D4"></label><label class="wide-field">Nejbližší konkrétní krok<input id="capProjectNext" placeholder="Co musí následovat?"></label></div>`;
 const ok=await modal('Nový projekt',body,[{label:'Zrušit',value:false},{label:'Přidat projekt',value:true,primary:true}]);if(!ok)return false;
 const name=qs('#capProjectName')?.value?.trim();if(!name)return toast('Napiš název projektu');
 const next=qs('#capProjectNext')?.value?.trim()||'Doplnit další krok';
 store.mutate(`Přidán projekt: ${name}`,s=>s.projects.unshift({id:uid('project'),name,status:'Aktivní',next,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()}));toast('Projekt přidán');return true;
}

async function addDebt(){
 const body=`<div class="form-grid capture-form"><label>Kdo dluží<input id="capDebtPerson" autofocus placeholder="Jméno"></label><label>Částka Kč<input id="capDebtAmount" type="number" min="0" step="1"></label><label class="wide-field">Za co<input id="capDebtReason" placeholder="Důvod / poznámka"></label><label>Slíbeno do<input id="capDebtDue" type="date"></label></div>`;
 const ok=await modal('Nová pohledávka',body,[{label:'Zrušit',value:false},{label:'Přidat pohledávku',value:true,primary:true}]);if(!ok)return false;
 const person=qs('#capDebtPerson')?.value?.trim(),amount=Number(qs('#capDebtAmount')?.value||0);if(!person||!Number.isFinite(amount)||amount<=0)return toast('Doplň jméno a platnou částku');
 const reason=qs('#capDebtReason')?.value?.trim()||'',due=qs('#capDebtDue')?.value||'';
 store.mutate(`Přidána pohledávka: ${person}`,s=>{s.debtBook=s.debtBook||{items:[],review:[]};s.debtBook.items.unshift({id:uid('debt'),person,amount,reason,payments:[],status:'OPEN',promisedAt:isoFromDate(due),createdAt:new Date().toISOString(),lastContactAt:null})});toast('Pohledávka přidána');return true;
}

async function addTicket(){
 const body=`<div class="form-grid capture-form"><label class="wide-field">Akce<input id="capTicketName" autofocus placeholder="Např. Sparta – Real Madrid"></label><label>Datum akce<input id="capTicketDate" type="date"></label><label>Počet ks<input id="capTicketQty" type="number" min="1" value="1"></label><label>Nákup celkem Kč<input id="capTicketBuy" type="number" min="0"></label><label>Platforma<input id="capTicketPlatform" placeholder="Ticketmaster / Sparta…"></label><label>Plánovaná cena / ks<input id="capTicketList" type="number" min="0"></label></div>`;
 const ok=await modal('Nová vstupenková pozice',body,[{label:'Zrušit',value:false},{label:'Přidat vstupenky',value:true,primary:true}]);if(!ok)return false;
 const name=qs('#capTicketName')?.value?.trim();if(!name)return toast('Napiš název akce');
 const qty=Math.max(1,Number(qs('#capTicketQty')?.value||1)),buy=Math.max(0,Number(qs('#capTicketBuy')?.value||0)),listPrice=Math.max(0,Number(qs('#capTicketList')?.value||0));
 const date=qs('#capTicketDate')?.value||'',platform=qs('#capTicketPlatform')?.value?.trim()||'';
 store.mutate(`Přidána vstupenka: ${name}`,s=>{s.ticketBook=s.ticketBook||{items:[],history:[],review:[]};s.ticketBook.items.unshift({id:uid('ticket'),name,qty,buy,listPrice,date:date||null,platform,workflow:'HOLD',sell:0,fees:0,createdAt:new Date().toISOString()})});toast('Vstupenky přidány');return true;
}

async function addInbox(){
 const body=`<div class="form-grid capture-form"><label class="wide-field">Rychlá poznámka<input id="capInboxTitle" autofocus placeholder="Co nechceš zapomenout"></label><label class="wide-field">Detail<textarea id="capInboxDetail" rows="3" placeholder="Volitelné"></textarea></label></div>`;
 const ok=await modal('Přidat do Inboxu',body,[{label:'Zrušit',value:false},{label:'Uložit do Inboxu',value:true,primary:true}]);if(!ok)return false;
 const title=qs('#capInboxTitle')?.value?.trim();if(!title)return toast('Napiš, co chceš zachytit');
 const detail=qs('#capInboxDetail')?.value?.trim()||'';
 store.mutate(`Inbox: ${title}`,s=>{s.inbox=s.inbox||[];s.inbox.unshift({id:uid('inbox'),title,detail,status:'NEW',createdAt:new Date().toISOString()})});toast('Uloženo do Inboxu');return true;
}
