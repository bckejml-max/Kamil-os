import {store,validateState,repairState} from './state.js';
import {h,money,date,dayDiff,norm,uid,toast,modal,downloadJson,qs,qsa} from './utils.js';
import {recommendation,signals,feedback,attentionCount,netWorth,ticketStatus,debtStatus,debtRemaining} from './intelligence.js';

let moreMode='menu';
const S=()=>store.get();

const statusClass=s=>s.score>=85?'bad':s.score>=65?'warn':'good';
const taskGroups=s=>{
 const g={overdue:[],today:[],week:[],later:[],nodate:[]},now=new Date(),today=now.toDateString();
 for(const t of s.tasks||[]){if(t.status==='HOTOVO')continue;if(!t.due){g.nodate.push(t);continue}const d=new Date(t.due),dd=dayDiff(t.due);if(d<now&&d.toDateString()!==today)g.overdue.push(t);else if(d.toDateString()===today)g.today.push(t);else if(dd<=7)g.week.push(t);else g.later.push(t)}
 return g;
};

function taskRows(a,title){
 if(!a.length)return '';
 return `<div class="task-group"><h3>${h(title)}</h3>${a.map(t=>`<div class="row"><div><b>${h(t.title)}</b><div class="muted">${h(t.area||'Úkol')}${t.due?' · '+date(t.due):''}</div></div><div class="row-actions"><button class="btn primary" data-task-done="${t.id}">Hotovo</button><button class="btn" data-task-tomorrow="${t.id}">Zítra</button></div></div>`).join('')}</div>`;
}

export function renderToday(){
 const s=S(),rec=recommendation(s),sig=signals(s).slice(1,4),nw=netWorth(s);
 const open=(s.tasks||[]).filter(x=>x.status!=='HOTOVO').length,doneToday=(s.audit||[]).filter(x=>x.label?.startsWith('Hotovo')&&new Date(x.at).toDateString()===new Date().toDateString()).length;
 qs('#todayView').innerHTML=`
 <div class="hero"><div class="eyebrow">DOPORUČENÍ PRÁVĚ TEĎ</div><div class="hero-title">${h(rec.title)}</div><div class="rec-reason"><b>Proč:</b> ${h(rec.reason)}<br><span class="muted">${h(rec.impact||'')}</span></div>
 <div class="feedback"><button class="btn primary" data-open="${rec.target}" data-id="${rec.id||''}">Otevřít a vyřešit</button><button class="btn" id="goodRec">👍 Užitečné</button><button class="btn" id="badRec">👎 Ne</button></div></div>
 <div class="grid" style="margin-bottom:14px"><div class="kpi"><div class="l">Otevřené úkoly</div><div class="v">${open}</div></div><div class="kpi"><div class="l">Hotovo dnes</div><div class="v">${doneToday}</div></div><div class="kpi"><div class="l">Potřebuje pozornost</div><div class="v">${attentionCount(s)}</div></div></div>
 <div class="grid two"><div class="card"><div class="eyebrow">DALŠÍ NA RADARU</div>${sig.map(x=>`<div class="row"><div><b>${h(x.title)}</b><div class="muted">${h(x.type)} · ${h(x.reason)}</div></div><span class="${statusClass(x)}">${x.score}</span></div>`).join('')||'<div class="empty">Nic dalšího kritického.</div>'}</div>
 <div class="card"><div class="eyebrow">PENÍZE</div><div class="row"><span>Hotovost</span><b>${money(nw.cash)}</b></div><div class="row"><span>XTB</span><b>${money(nw.xtb)}</b></div><div class="row"><span>Vstupenky</span><b>${money(nw.tickets)}</b></div><div class="row"><span>Dluží ti</span><b>${money(nw.debts)}</b></div></div></div>`;
 qs('#goodRec').onclick=()=>store.mutate('Doporučení užitečné',s=>feedback(s,rec.type,1),{undo:false});
 qs('#badRec').onclick=()=>store.mutate('Doporučení neužitečné',s=>feedback(s,rec.type,-1),{undo:false});
 qsa('[data-open]',qs('#todayView')).forEach(b=>b.onclick=()=>navigateFromTarget(b.dataset.open));
}

export function renderWork(){
 const s=S(),g=taskGroups(s);
 qs('#workView').innerHTML=`<div class="section-title">PRÁCE</div>
 <div class="grid" style="margin-bottom:14px"><div class="kpi"><div class="l">Po termínu</div><div class="v ${g.overdue.length?'bad':'good'}">${g.overdue.length}</div></div><div class="kpi"><div class="l">Dnes</div><div class="v">${g.today.length}</div></div><div class="kpi"><div class="l">Bez termínu</div><div class="v">${g.nodate.length}</div></div></div>
 <div class="card">${taskRows(g.overdue,'Po termínu')}${taskRows(g.today,'Dnes')}${taskRows(g.week,'Tento týden')}${taskRows(g.later,'Později')}${taskRows(g.nodate,'Bez termínu')||'<div class="empty">Žádné otevřené úkoly.</div>'}</div>
 <div class="card"><div class="eyebrow">PROJEKTY</div>${(s.projects||[]).filter(x=>!/hotov|archiv/i.test(x.status||'')).map(p=>`<div class="row"><div><b>${h(p.name)}</b><div class="muted">${h(p.next||'Chybí konkrétní další krok')}</div></div><button class="btn" data-project-next="${p.id}">Další krok</button></div>`).join('')||'<div class="empty">Žádný aktivní projekt.</div>'}</div>`;
 qsa('[data-task-done]').forEach(b=>b.onclick=()=>store.mutate('Hotovo: úkol',s=>{const t=s.tasks.find(x=>x.id===b.dataset.taskDone);if(t){t.status='HOTOVO';t.updatedAt=new Date().toISOString()}}));
 qsa('[data-task-tomorrow]').forEach(b=>b.onclick=()=>store.mutate('Úkol přesunut na zítra',s=>{const t=s.tasks.find(x=>x.id===b.dataset.taskTomorrow);if(t){const d=new Date();d.setDate(d.getDate()+1);d.setHours(9,0,0,0);t.due=d.toISOString();t.updatedAt=new Date().toISOString()}}));
 qsa('[data-project-next]').forEach(b=>b.onclick=async()=>{const p=s.projects.find(x=>x.id===b.dataset.projectNext);const val=await promptModal('Další krok projektu',p?.next||'');if(val!==null)store.mutate('Upraven další krok projektu',s=>{const x=s.projects.find(y=>y.id===b.dataset.projectNext);if(x)x.next=val})});
}

export function renderMoney(){
 const s=S(),nw=netWorth(s);
 qs('#moneyView').innerHTML=`<div class="section-title">PENÍZE</div><div class="hero"><div class="eyebrow">OPATRNÝ ODHAD MAJETKU</div><div class="hero-title">${money(nw.adjusted)}</div><div class="muted">Vstupenky počítám 65 % nákupní hodnoty a pohledávky 80 %, protože nejsou stejně likvidní jako hotovost.</div></div>
 <div class="grid"><div class="kpi"><div class="l">Hotovost</div><div class="v">${money(nw.cash)}</div></div><div class="kpi"><div class="l">XTB</div><div class="v">${money(nw.xtb)}</div></div><div class="kpi"><div class="l">Pohledávky + vstupenky</div><div class="v">${money(nw.debts+nw.tickets)}</div></div></div>
 <div class="card"><div class="eyebrow">ROZPOČET</div><div class="row"><span>Hotovost teď</span><b>${money(s.financePlan?.cashNow)}</b></div><div class="row"><span>Očekávané příjmy</span><b>${money(s.financePlan?.expectedIncome)}</b></div><div class="row"><span>Rezervní minimum</span><b>${money(s.financePlan?.reserveFloor)}</b></div><button class="btn" id="editFinance">Upravit</button></div>
 <div class="card"><div class="eyebrow">XTB</div><div class="row"><span>Hodnota CZK účtu</span><b>${money(s.xtbReport?.czkValue)}</b></div><div class="row"><span>Hodnota EUR účtu (odhad v CZK)</span><b>${money(Number(s.xtbReport?.eurValue||0)*24.5)}</b></div><div class="muted">Aktualizováno: ${date(s.xtbReport?.asOf)}</div></div>`;
 qs('#editFinance').onclick=editFinanceModal;
}

export function renderTickets(){
 const s=S(),a=[...(s.ticketBook?.items||[])].sort((x,y)=>new Date(x.date||'9999')-new Date(y.date||'9999'));
 const capital=a.filter(x=>!['SOLD','PAYOUT RECEIVED'].includes(x.workflow)).reduce((n,x)=>n+(Number(x.buy)||0),0);
 qs('#ticketsView').innerHTML=`<div class="section-title">VSTUPENKY</div><div class="grid" style="margin-bottom:14px"><div class="kpi"><div class="l">Pozic</div><div class="v">${a.length}</div></div><div class="kpi"><div class="l">Kapitál</div><div class="v">${money(capital)}</div></div><div class="kpi"><div class="l">Brzy řešit</div><div class="v">${a.filter(x=>ticketStatus(x).score>=68).length}</div></div></div>
 <div class="card">${a.map(x=>{const st=ticketStatus(x),days=x.date?dayDiff(x.date):null,qty=Number(x.qty||1),expected=(Number(x.listPrice)||0)*qty-(Number(x.buy)||0),actual=(Number(x.sell)||0)-(Number(x.buy)||0)-(Number(x.fees)||0),roi=Number(x.buy)>0?actual/Number(x.buy)*100:0;return `<div class="row ticket ${st.score>=90?'urgent':st.score>=68?'soon':''}"><div><b>${h(x.name)}</b><div class="muted">${qty} ks · ${date(x.date)}${days!==null?' · za '+days+' dní':''}<br>Nákup ${money(x.buy)} · ${h(x.platform||'platforma neuvedena')}${Number(x.listPrice)>0?`<br>Očekávaný zisk ${money(expected)}`:''}${Number(x.sell)>0?`<br>Skutečný zisk <span class="${actual>=0?'good':'bad'}">${money(actual)} (${roi.toFixed(1)} %)</span>`:''}</div></div><div class="row-actions"><span class="status ${statusClass(st)}">${h(st.label)}</span><button class="btn" data-ticket-edit="${x.id}">Upravit</button>${ticketButtons(x)}</div></div>`}).join('')||'<div class="empty">Žádné vstupenky.</div>'}</div>`;
 qsa('[data-ticket-edit]').forEach(b=>b.onclick=()=>ticketEditModal(b.dataset.ticketEdit));
 qsa('[data-ticket-sell]').forEach(b=>b.onclick=()=>ticketSaleModal(b.dataset.ticketSell));
 qsa('[data-ticket-state]').forEach(b=>b.onclick=()=>store.mutate(`Vstupenka → ${b.dataset.ticketState}`,s=>{const x=s.ticketBook.items.find(y=>y.id===b.dataset.ticketId);if(x){x.workflow=b.dataset.ticketState;if(x.workflow==='PAYOUT RECEIVED')x.payoutAt=new Date().toISOString()}}));
}
function ticketButtons(x){
 if((x.workflow||'HOLD')==='HOLD')return `<button class="btn primary" data-ticket-state="LISTED" data-ticket-id="${x.id}">Dát do prodeje</button>`;
 if(x.workflow==='LISTED')return `<button class="btn primary" data-ticket-sell="${x.id}">Prodáno</button>`;
 if(x.workflow==='SOLD')return `<button class="btn" data-ticket-state="PAYOUT WAIT" data-ticket-id="${x.id}">Čekám na výplatu</button>`;
 if(x.workflow==='PAYOUT WAIT')return `<button class="btn primary" data-ticket-state="PAYOUT RECEIVED" data-ticket-id="${x.id}">Vyplaceno</button>`;
 return '';
}

export function renderMore(){
 const s=S(),unread=(s.inbox||[]).filter(x=>x.status!=='DONE').length,debts=(s.debtBook?.items||[]).filter(x=>x.status!=='PAID').length;
 if(moreMode==='menu'){
   qs('#moreView').innerHTML=`<div class="section-title">VÍCE</div><div class="more-menu">
   ${tile('inbox','Inbox',`${unread} nerozhodnutých`)}${tile('debts','Dluhy',`${debts} aktivních`)}${tile('terms','Termíny','30 dní dopředu')}${tile('backup','Záloha','Export / obnova')}${tile('settings','Nastavení','Vzhled a upozornění')}${tile('system','Systém','Cloud a diagnostika')}</div>`;
   qsa('[data-more]').forEach(b=>b.onclick=()=>{moreMode=b.dataset.more;renderMore()});return;
 }
 const back=`<button class="btn" id="moreBack">← Zpět</button>`;
 let body='';
 if(moreMode==='inbox')body=renderInboxHtml(s);
 if(moreMode==='debts')body=renderDebtsHtml(s);
 if(moreMode==='terms')body=renderTermsHtml(s);
 if(moreMode==='backup')body=renderBackupHtml(s);
 if(moreMode==='settings')body=renderSettingsHtml(s);
 if(moreMode==='system')body=renderSystemHtml(s);
 qs('#moreView').innerHTML=`<div class="section-title">VÍCE</div>${back}${body}`;qs('#moreBack').onclick=()=>{moreMode='menu';renderMore()};
 bindMoreActions();
}
const tile=(id,title,sub)=>`<div class="more-tile" data-more="${id}"><b>${h(title)}</b><div class="muted">${h(sub)}</div></div>`;

function renderInboxHtml(s){
 const a=(s.inbox||[]).filter(x=>x.status!=='DONE');
 return `<div class="hero"><div class="eyebrow">INBOX ZERO</div><div class="hero-title">${a.length}</div><div class="muted">Každou novou věc zařaď, odlož nebo ignoruj.</div></div><div class="card">${a.map(x=>`<div class="row"><div><b>${h(x.title)}</b><div class="muted">${h(x.detail||'')}</div></div><div class="row-actions"><button class="btn primary" data-inbox-task="${x.id}">Úkol</button><button class="btn" data-inbox-project="${x.id}">Projekt</button><button class="btn" data-inbox-wait="${x.id}">Čekám</button><button class="btn" data-inbox-term="${x.id}">Termín</button><button class="btn" data-inbox-ignore="${x.id}">Ignorovat</button></div></div>`).join('')||'<div class="empty">Inbox je čistý.</div>'}</div>`;
}
function renderDebtsHtml(s){
 const a=(s.debtBook?.items||[]).filter(x=>x.status!=='PAID').sort((x,y)=>debtStatus(y).score-debtStatus(x).score);
 const total=a.reduce((n,x)=>n+debtRemaining(x),0);
 return `<div class="hero"><div class="eyebrow">DLUHY VŮČI TOBĚ</div><div class="hero-title">${money(total)}</div><div class="muted">${a.length} aktivních položek</div></div><div class="card">${a.map(x=>{const st=debtStatus(x);return `<div class="row"><div><b>${h(x.person)} · ${money(debtRemaining(x))}</b><div class="muted">${h(x.reason||'')}${x.promisedAt?' · slíbeno '+date(x.promisedAt):''}</div></div><div class="row-actions"><span class="status ${statusClass(st)}">${h(st.label)}</span><button class="btn" data-debt-follow="${x.id}">Připomenout</button><button class="btn primary" data-debt-pay="${x.id}">Splátka</button></div></div>`}).join('')||'<div class="empty">Žádné aktivní pohledávky.</div>'}</div>`;
}
function renderTermsHtml(s){
 const now=new Date(),end=new Date(Date.now()+30*86400000),a=[];
 for(const e of s.calendar?.events||[]){const d=new Date(e.start);if(d>=now&&d<=end)a.push({d,title:e.title,type:'Kalendář'})}
 for(const t of s.tasks||[]){if(t.status!=='HOTOVO'&&t.due){const d=new Date(t.due);if(d>=now&&d<=end)a.push({d,title:t.title,type:'Úkol'})}}
 for(const x of s.ticketBook?.items||[]){if(x.date){const d=new Date(x.date);if(d>=now&&d<=end)a.push({d,title:x.name,type:'Vstupenka'})}}
 a.sort((x,y)=>x.d-y.d);
 return `<div class="hero"><div class="eyebrow">TERMÍNY</div><div class="hero-title">${a.length}</div><div class="muted">Příštích 30 dní</div></div><div class="card">${a.map(x=>`<div class="row"><div><b>${h(x.title)}</b><div class="muted">${h(x.type)}</div></div><b>${date(x.d)}</b></div>`).join('')||'<div class="empty">Nic důležitého v příštích 30 dnech.</div>'}</div>`;
}
function renderBackupHtml(s){return `<div class="card"><div class="eyebrow">ZÁLOHA A OBNOVA</div><p class="muted">Export obsahuje celý lokální stav. Obnova vytvoří před importem Undo bod.</p><div class="row-actions"><button class="btn primary" id="backupExport">Exportovat JSON</button><label class="btn">Obnovit JSON<input id="backupImport" type="file" accept=".json,application/json" hidden></label></div></div>`}
function renderSettingsHtml(s){return `<div class="card"><div class="eyebrow">NASTAVENÍ</div><div class="row"><span>Upozornění v prohlížeči</span><button class="btn" id="notifyBtn">${Notification.permission==='granted'?'Povoleno':'Povolit'}</button></div><div class="row"><span>Inteligence</span><button class="btn" id="resetLearning">Resetovat učení</button></div></div>`}
function renderSystemHtml(s){
 const pf=s.meta?.preflight,failed=pf?.checks?.filter(x=>!x.ok)||[];
 return `<div class="card"><div class="eyebrow">SYSTÉM</div><div class="row"><span>Release stav</span><b class="${failed.length?'bad':'good'}">${failed.length?'JEŠTĚ NE':'LOKÁLNĚ READY'}</b></div><div class="row"><span>Schema</span><b>v${s.meta?.schemaVersion}</b></div><div class="row"><span>Poslední cloud</span><b>${date(s.meta?.lastCloudAt)}</b></div><div class="row"><span>Lokální změna</span><b>${date(s.meta?.lastMutationAt)}</b></div><div class="row"><span>Verze</span><b>22.3.4</b></div>${failed.map(x=>`<div class="row"><span class="bad">${h(x.name)}</span><span class="muted">${h(x.detail)}</span></div>`).join('')}<button class="btn" id="logoutBtn">Odhlásit</button></div>`;
}

function bindMoreActions(){
 qsa('[data-inbox-task]').forEach(b=>b.onclick=()=>store.mutate('Inbox → úkol',s=>{const x=s.inbox.find(y=>y.id===b.dataset.inboxTask);if(x){s.tasks.unshift({id:uid('task'),title:x.title,status:'UDĚLAT',priority:'NORMAL',area:'Inbox',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});x.status='DONE'}}));
 qsa('[data-inbox-project]').forEach(b=>b.onclick=()=>store.mutate('Inbox → projekt',s=>{const x=s.inbox.find(y=>y.id===b.dataset.inboxProject);if(x){s.projects.unshift({id:uid('project'),name:x.title,status:'Aktivní',next:'Doplnit další krok',createdAt:new Date().toISOString()});x.status='DONE'}}));
 qsa('[data-inbox-wait]').forEach(b=>b.onclick=()=>store.mutate('Inbox → čekám',s=>{const x=s.inbox.find(y=>y.id===b.dataset.inboxWait);if(x){s.delegations=s.delegations||[];s.delegations.unshift({id:uid('wait'),title:x.title,status:'WAITING',createdAt:new Date().toISOString()});x.status='DONE'}}));
 qsa('[data-inbox-term]').forEach(b=>b.onclick=()=>inboxTermModal(b.dataset.inboxTerm));
 qsa('[data-inbox-ignore]').forEach(b=>b.onclick=()=>store.mutate('Inbox ignorován',s=>{const x=s.inbox.find(y=>y.id===b.dataset.inboxIgnore);if(x)x.status='DONE'}));
 qsa('[data-debt-follow]').forEach(b=>b.onclick=()=>store.mutate('Dluh připomenut',s=>{const x=s.debtBook.items.find(y=>y.id===b.dataset.debtFollow);if(x){x.lastContactAt=new Date().toISOString();const d=new Date();d.setDate(d.getDate()+7);x.promisedAt=d.toISOString()}}));
 qsa('[data-debt-pay]').forEach(b=>b.onclick=()=>debtPaymentModal(b.dataset.debtPay));
 qs('#backupExport')?.addEventListener('click',()=>downloadJson(`kamil-os-backup-${new Date().toISOString().slice(0,10)}.json`,S()));
 qs('#backupImport')?.addEventListener('change',e=>importBackup(e.target.files[0]));
 qs('#notifyBtn')?.addEventListener('click',async()=>{await Notification.requestPermission();renderMore()});
 qs('#resetLearning')?.addEventListener('click',()=>store.mutate('Resetováno učení',s=>{s.learning={typeBias:{},feedback:[]}}));
 qs('#logoutBtn')?.addEventListener('click',()=>window.dispatchEvent(new CustomEvent('kamil:logout')));
}

async function debtPaymentModal(id){
 const s=S(),x=s.debtBook.items.find(y=>y.id===id);if(!x)return;
 const val=await promptModal(`Splátka – ${x.person}`,String(debtRemaining(x)));if(val===null)return;const amount=Number(String(val).replace(/\s/g,'').replace(',','.'));if(!Number.isFinite(amount)||amount<=0)return toast('Neplatná částka');
 store.mutate(`Splátka ${x.person}`,s=>{const d=s.debtBook.items.find(y=>y.id===id);d.payments=d.payments||[];d.payments.push({id:uid('payment'),amount,at:new Date().toISOString()});d.lastContactAt=new Date().toISOString();if(debtRemaining(d)<=0){d.status='PAID';d.paidAt=new Date().toISOString()}});
}
async function ticketEditModal(id){
 const x=S().ticketBook.items.find(y=>y.id===id);if(!x)return;
 const body=`<div class="form-grid"><label>Platforma<input id="fPlatform" value="${h(x.platform||'')}"></label><label>Nákup celkem<input id="fBuy" type="number" value="${Number(x.buy)||0}"></label><label>Datum akce<input id="fDate" type="date" value="${x.date?String(x.date).slice(0,10):''}"></label><label>Listing cena za kus<input id="fList" type="number" value="${Number(x.listPrice)||0}"></label><label>Prodej celkem<input id="fSell" type="number" value="${Number(x.sell)||0}"></label><label>Poplatky<input id="fFees" type="number" value="${Number(x.fees)||0}"></label></div>`;
 const ok=await modal('Upravit vstupenku',body,[{label:'Zrušit',value:false},{label:'Uložit',value:true,primary:true}]);if(!ok)return;
 store.mutate('Upravena vstupenka',s=>{const t=s.ticketBook.items.find(y=>y.id===id);t.platform=qs('#fPlatform')?.value||t.platform;t.buy=Number(qs('#fBuy')?.value||0);t.date=qs('#fDate')?.value||t.date;t.listPrice=Number(qs('#fList')?.value||0);t.sell=Number(qs('#fSell')?.value||0);t.fees=Number(qs('#fFees')?.value||0)});
}

async function ticketSaleModal(id){
 const x=S().ticketBook.items.find(y=>y.id===id);if(!x)return;
 const suggested=(Number(x.listPrice)||0)*Number(x.qty||1);
 const body=`<div class="form-grid"><label>Prodej celkem<input id="saleTotal" type="number" value="${suggested||Number(x.sell)||0}"></label><label>Poplatky<input id="saleFees" type="number" value="${Number(x.fees)||0}"></label></div>`;
 const ok=await modal('Vstupenka prodána',body,[{label:'Zrušit',value:false},{label:'Uložit prodej',value:true,primary:true}]);if(!ok)return;
 const sell=Number(qs('#saleTotal')?.value||0),fees=Number(qs('#saleFees')?.value||0);
 store.mutate('Vstupenka prodána',s=>{const t=s.ticketBook.items.find(y=>y.id===id);if(!t||t.workflow==='SOLD')return;t.workflow='SOLD';t.sell=sell;t.fees=fees;t.soldAt=new Date().toISOString()});
}
async function inboxTermModal(id){
 const x=S().inbox.find(y=>y.id===id);if(!x)return;
 const d=new Date();d.setDate(d.getDate()+1);
 const body=`<label class="muted">Termín<input id="inboxDue" type="date" value="${d.toISOString().slice(0,10)}" style="display:block;width:100%;margin-top:6px;background:#0e141c;color:#fff;border:1px solid #354151;border-radius:10px;padding:10px"></label>`;
 const ok=await modal('Přidat termín',body,[{label:'Zrušit',value:false},{label:'Uložit',value:true,primary:true}]);if(!ok)return;
 const due=qs('#inboxDue')?.value;
 store.mutate('Inbox → termín',s=>{const i=s.inbox.find(y=>y.id===id);if(i){s.tasks.unshift({id:uid('task'),title:i.title,status:'UDĚLAT',priority:'NORMAL',area:'Inbox',due:due?new Date(due+'T09:00:00').toISOString():null,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});i.status='DONE'}});
}
async function editFinanceModal(){
 const f=S().financePlan||{};
 const body=`<div class="form-grid"><label>Hotovost<input id="cashNow" type="number" value="${Number(f.cashNow)||0}"></label><label>Očekávané příjmy<input id="expectedIncome" type="number" value="${Number(f.expectedIncome)||0}"></label><label>Rezervní minimum<input id="reserveFloor" type="number" value="${Number(f.reserveFloor)||0}"></label></div>`;
 const ok=await modal('Finance',body,[{label:'Zrušit',value:false},{label:'Uložit',value:true,primary:true}]);if(!ok)return;
 const vals={cashNow:Number(qs('#cashNow')?.value||0),expectedIncome:Number(qs('#expectedIncome')?.value||0),reserveFloor:Number(qs('#reserveFloor')?.value||0)};
 store.mutate('Upraveny finance',s=>Object.assign(s.financePlan,vals));
}
async function promptModal(title,value=''){
 const body=`<input id="promptValue" style="width:100%;background:#0e141c;color:#fff;border:1px solid #354151;border-radius:10px;padding:10px" value="${h(value)}">`;
 const ok=await modal(title,body,[{label:'Zrušit',value:false},{label:'Uložit',value:true,primary:true}]);return ok?qs('#promptValue')?.value:null;
}
async function importBackup(file){
 if(!file)return;
 try{
   const data=JSON.parse(await file.text()),validation=validateState(data);
   if(!validation.ok){await modal('Záloha je poškozená',`<p class="bad">${h(validation.fatal.join('; '))}</p>`,[{label:'Zavřít',value:false}]);return}
   const repaired=repairState(data);
   const warnings=repaired.report.issues.length?`<p class="warn">Opravím při importu: ${h(repaired.report.issues.join('; '))}</p>`:'<p class="good">Struktura zálohy je v pořádku.</p>';
   const ok=await modal('Obnovit zálohu?',`${warnings}<p class="muted">Aktuální stav zůstane dostupný přes Undo. Import se převede na aktuální schema.</p>`,[{label:'Zrušit',value:false},{label:'Obnovit',value:true,primary:true}]);
   if(ok)store.mutate('Obnovena záloha',s=>{Object.keys(s).forEach(k=>delete s[k]);Object.assign(s,repaired.state)});
 }catch{toast('Neplatný JSON')}
}
export function setMoreMode(v){moreMode=v;renderMore()}
export function navigateFromTarget(t){if(t==='debts'){moreMode='debts';window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:'more'}))}else window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:t}))}
