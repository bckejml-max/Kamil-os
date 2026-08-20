const arr=v=>Array.isArray(v)?v:[];
const norm=v=>String(v??'').toLocaleLowerCase('cs-CZ').trim().replace(/\s+/g,' ');
const personalTask=t=>String(t?.area||'').toLocaleLowerCase('cs-CZ').includes('osob');
const activeDebt=d=>String(d?.status||'').toUpperCase()!=='PAID';
const debtPaid=d=>arr(d?.payments).reduce((s,p)=>s+(Number(p?.amount)||0),0);
const debtTotal=d=>Number(d?.amount??d?.total??d?.principal??0)||0;
const debtRemaining=d=>Math.max(0,debtTotal(d)-debtPaid(d));
const iso=v=>new Date(v).toISOString();
const tomorrow9=now=>{const d=new Date(now);d.setDate(d.getDate()+1);d.setHours(9,0,0,0);return d.toISOString()};

export function buildCommandWriteProposal32(command,state={},now=new Date()){
 const c=command||{},type=String(c.type||'');
 if(type==='payment'){
  const amount=Number(c.amount),debt=arr(state.debtBook?.items).find(d=>activeDebt(d)&&norm(d.person).includes(norm(c.person)));
  if(!debt||!Number.isFinite(amount)||amount<=0)return {ok:false,code:'PAYMENT_NOT_FOUND',message:'Pohledávku nebo částku jsem nenašel.'};
  const before=debtRemaining(debt),after=Math.max(0,before-amount);
  return {ok:true,kind:'DEBT_PAYMENT',entityType:'debt',entityId:String(debt.id),title:`Zapsat splátku: ${debt.person||debt.reason||'Pohledávka'}`,summary:`Splátka ${amount.toLocaleString('cs-CZ')} Kč · zbývá ${after.toLocaleString('cs-CZ')} Kč`,before:{remaining:before},after:{remaining:after,payment:amount},mutationLabel:`Splátka ${debt.person||'pohledávky'}`,fingerprint:`debt-payment|${debt.id}|${amount}`};
 }
 if(type==='sold'){
  const ticket=arr(state.ticketBook?.items).find(t=>norm(t.name).includes(norm(c.name)));
  if(!ticket)return {ok:false,code:'TICKET_NOT_FOUND',message:'Vstupenku jsem nenašel.'};
  if(String(ticket.workflow||'').toUpperCase()==='SOLD')return {ok:false,code:'ALREADY_SOLD',message:'Vstupenka už je označená jako prodaná.'};
  return {ok:true,kind:'TICKET_SOLD',entityType:'ticket',entityId:String(ticket.id),title:`Označit jako prodané: ${ticket.name||'Vstupenka'}`,summary:`Workflow ${ticket.workflow||'—'} → SOLD`,before:{workflow:ticket.workflow||null,soldAt:ticket.soldAt||null},after:{workflow:'SOLD'},mutationLabel:'Vstupenka prodána',fingerprint:`ticket-sold|${ticket.id}`};
 }
 if(type==='tomorrow'){
  const task=arr(state.tasks).find(t=>String(t.status||'').toUpperCase()!=='HOTOVO'&&personalTask(t)&&norm(t.title).includes(norm(c.name)));
  const due=tomorrow9(now);
  if(task)return {ok:true,kind:'TASK_TOMORROW',entityType:'task',entityId:String(task.id),title:`Přesunout na zítra: ${task.title}`,summary:`Termín → ${new Date(due).toLocaleString('cs-CZ')}`,before:{due:task.due||null},after:{due},mutationLabel:'Osobní úkol přesunut na zítra',fingerprint:`task-tomorrow|${task.id}|${due.slice(0,10)}`};
  const title=String(c.name||'').replace(/^úkol\s+/i,'').trim();if(!title)return {ok:false,code:'TASK_TITLE_MISSING',message:'Napiš název úkolu.'};
  return {ok:true,kind:'TASK_CREATE_TOMORROW',entityType:'task',entityId:null,title:`Vytvořit osobní úkol: ${title}`,summary:`Nový úkol · zítra v 9:00`,before:null,after:{title,due},mutationLabel:'Přidán osobní úkol na zítra',fingerprint:`task-create-tomorrow|${norm(title)}|${due.slice(0,10)}`};
 }
 return {ok:false,code:'READ_ONLY_OR_UNKNOWN',message:'Tento příkaz není zapisovací akce.'};
}

export function applyCommandWriteProposal32(state,proposal,{now=new Date(),idFactory=()=>`id|${Date.now()}|${Math.random().toString(36).slice(2,8)}`}={}){
 if(!proposal?.ok)throw new Error('Invalid write proposal');const at=iso(now);
 if(proposal.kind==='DEBT_PAYMENT'){
  const d=arr(state.debtBook?.items).find(x=>String(x.id)===proposal.entityId);if(!d)throw new Error('Debt not found');d.payments=arr(d.payments);d.payments.push({id:idFactory('payment'),amount:Number(proposal.after.payment),at});d.lastContactAt=at;return {kind:proposal.kind,entityId:proposal.entityId};
 }
 if(proposal.kind==='TICKET_SOLD'){
  const t=arr(state.ticketBook?.items).find(x=>String(x.id)===proposal.entityId);if(!t)throw new Error('Ticket not found');if(String(t.workflow||'').toUpperCase()==='SOLD')return {kind:proposal.kind,entityId:proposal.entityId,noOp:true};t.workflow='SOLD';t.soldAt=at;return {kind:proposal.kind,entityId:proposal.entityId};
 }
 if(proposal.kind==='TASK_TOMORROW'){
  const t=arr(state.tasks).find(x=>String(x.id)===proposal.entityId);if(!t)throw new Error('Task not found');t.due=proposal.after.due;t.updatedAt=at;return {kind:proposal.kind,entityId:proposal.entityId};
 }
 if(proposal.kind==='TASK_CREATE_TOMORROW'){
  state.tasks=arr(state.tasks);const id=idFactory('task');state.tasks.unshift({id,title:proposal.after.title,status:'UDĚLAT',priority:'NORMAL',area:'Osobní',due:proposal.after.due,createdAt:at,updatedAt:at});return {kind:proposal.kind,entityId:id};
 }
 throw new Error('Unsupported write proposal');
}

export const copilotWrite32Contract={flow:['UNDERSTAND','PROPOSE','PREVIEW','CONFIRM','EXECUTE'],knownWriteTypes:['payment','sold','tomorrow'],silentWrite:false};
