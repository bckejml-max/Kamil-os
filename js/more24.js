import {APP_VERSION,SCHEMA_VERSION} from './config.js';
import {store,validateState,repairState} from './state.js';
import {h,money,date,dateTime,uid,toast,modal,downloadJson,qs,qsa,clone} from './utils.js';
import {debtStatus,debtRemaining} from './intelligence.js';

let moreMode='menu';
const S=()=>store.get();
const tone=score=>score>=85?'bad':score>=65?'warn':'good';
const eventStart=e=>e?.start||e?.startTime||e?.date||e?.begin||e?.dtstart||null;
const waitAge=x=>{const raw=x.lastContactAt||x.updatedAt||x.createdAt;if(!raw)return 0;return Math.max(0,Math.floor((Date.now()-new Date(raw).getTime())/86400000))};

export function setMoreMode(v='menu'){moreMode=v||'menu';renderMore()}

export function renderMore(){
 const s=S();
 if(moreMode==='menu'){renderMenu(s);return}
 const host=qs('#moreView');
 host.innerHTML=`<div class="subview-bar"><button class="btn" id="more24Back">← Zpět</button><div><span>VÍCE</span><b>${h(titleFor(moreMode))}</b></div></div><div id="more24Body"></div>`;
 qs('#more24Back').onclick=()=>{moreMode='menu';renderMore()};
 const body=qs('#more24Body');
 if(moreMode==='inbox')body.innerHTML=inboxHtml(s);
 else if(moreMode==='waiting')body.innerHTML=waitingHtml(s);
 else if(moreMode==='debts')body.innerHTML=debtsHtml(s);
 else if(moreMode==='terms')body.innerHTML=termsHtml(s);
 else if(moreMode==='backup')body.innerHTML=backupHtml(s);
 else if(moreMode==='settings')body.innerHTML=settingsHtml(s);
 else if(moreMode==='system')body.innerHTML=systemHtml(s);
 else{moreMode='menu';renderMenu(s);return}
 bindActions();
}

function titleFor(x){return ({inbox:'Inbox',waiting:'Čekám na',debts:'Pohledávky',terms:'Termíny',backup:'Záloha',settings:'Nastavení',system:'Systém'})[x]||'Více'}

function renderMenu(s){
 const inbox=(s.inbox||[]).filter(x=>x.status!=='DONE').length;
 const waiting=(s.delegations||[]).filter(x=>(x.status||'WAITING')!=='DONE');
 const staleWaiting=waiting.filter(x=>waitAge(x)>=7).length;
 const debts=(s.debtBook?.items||[]).filter(x=>x.status!=='PAID');
 const debtTotal=debts.reduce((n,x)=>n+debtRemaining(x),0);
 const urgentDebts=debts.filter(x=>debtStatus(x).score>=70).length;
 const pf=s.meta?.preflight;
 const next30=termItems(s).length;
 qs('#moreView').innerHTML=`
  <div class="view-head"><div><div class="eyebrow">VÍCE / OPERACE</div><h1>Všechno ostatní, bez bordelu</h1><p>Inbox, čekající věci, pohledávky, termíny, záloha a stav systému.</p></div><div class="view-head-stat"><b>${inbox+staleWaiting+urgentDebts}</b><span>věcí k pozornosti</span></div></div>
  <div class="more24-grid">
   ${hubTile('inbox','IN','Inbox',inbox?`${inbox} čeká na rozhodnutí`:'Inbox je čistý',inbox?'warn':'good')}
   ${hubTile('waiting','…','Čekám na',waiting.length?`${waiting.length} aktivních · ${staleWaiting} starších než 7 dní`:'Na nikoho nečekáš',staleWaiting?'warn':'good')}
   ${hubTile('debts','Kč','Pohledávky',`${money(debtTotal)} · ${debts.length} aktivních`,urgentDebts?'warn':'good')}
   ${hubTile('terms','30','Termíny',`${next30} položek v příštích 30 dnech`,next30?'':'good')}
   ${hubTile('backup','↧','Záloha','Export a bezpečná obnova dat','')}
   ${hubTile('settings','⚙','Nastavení','Upozornění a chování aplikace','')}
   ${hubTile('system','●','Systém',pf?.ok===false?'Preflight vyžaduje pozornost':'Cloud a diagnostika',pf?.ok===false?'bad':'good')}
  </div>`;
 qsa('[data-more24]',qs('#moreView')).forEach(b=>b.onclick=()=>{moreMode=b.dataset.more24;renderMore()});
}

const hubTile=(id,icon,title,sub,state)=>`<button class="hub-tile" data-more24="${id}"><span class="hub-icon ${state}">${icon}</span><span class="hub-copy"><b>${h(title)}</b><small>${h(sub)}</small></span><span class="hub-arrow">→</span></button>`;

function inboxHtml(s){
 const a=(s.inbox||[]).filter(x=>x.status!=='DONE');
 return `<div class="view-head compact"><div><div class="eyebrow">INBOX ZERO</div><h1>${a.length?a.length+' položek čeká':'Inbox je čistý'}</h1><p>Každou novou věc převeď na konkrétní akci, nebo ji zavři.</p></div><div class="view-head-stat"><b>${a.length}</b><span>nerozhodnutých</span></div></div>
 <div class="card"><div class="card-head"><div><div class="eyebrow">FRONTA</div><h2>Co s tím uděláme</h2></div><button class="btn" data-capture24>＋ Přidat</button></div>
 ${a.map(x=>`<div class="inbox24-row"><div><b>${h(x.title)}</b><span>${h(x.detail||'Bez dalšího popisu')}</span></div><div class="row-actions"><button class="btn primary" data-inbox24-task="${x.id}">Úkol</button><button class="btn" data-inbox24-project="${x.id}">Projekt</button><button class="btn" data-inbox24-wait="${x.id}">Čekám</button><button class="btn" data-inbox24-term="${x.id}">Termín</button><button class="btn quiet-action" data-inbox24-ignore="${x.id}">Ignorovat</button></div></div>`).join('')||'<div class="empty success-empty">Hotovo. Nic tu neleží bez rozhodnutí.</div>'}
 </div>`;
}

function waitingHtml(s){
 const a=(s.delegations||[]).filter(x=>(x.status||'WAITING')!=='DONE').sort((x,y)=>waitAge(y)-waitAge(x));
 const stale=a.filter(x=>waitAge(x)>=7).length,oldest=a.length?Math.max(...a.map(waitAge)):0;
 return `<div class="view-head compact"><div><div class="eyebrow">ČEKÁM NA</div><h1>${a.length?a.length+' aktivních':'Na nikoho nečekáš'}</h1><p>Věci, které teď blokuje někdo jiný. Staré čekání vytáhnu nahoru.</p></div><div class="view-head-stat"><b class="${stale?'warn':'good'}">${stale}</b><span>starších než 7 dní</span></div></div>
 <div class="metric-strip"><div class="metric"><span>Aktivních</span><b>${a.length}</b></div><div class="metric"><span>Starších 7 dní</span><b class="${stale?'warn':'good'}">${stale}</b></div><div class="metric"><span>Nejstarší</span><b>${oldest} d</b></div><div class="metric"><span>Čisté</span><b class="${a.length?'warn':'good'}">${a.length?'NE':'ANO'}</b></div></div>
 <div class="card"><div class="card-head"><div><div class="eyebrow">BLOKACE</div><h2>Kdo / co drží další krok</h2></div><button class="btn" data-capture24>＋ Přidat</button></div>
 ${a.map(x=>{const age=waitAge(x),state=age>=14?'bad':age>=7?'warn':'good';return `<div class="waiting24-row"><div class="waiting24-main"><b>${h(x.title||'Čekající položka')}</b><span>${h(x.person||'Bez uvedené osoby')}${x.followUpAt?' · kontrola '+date(x.followUpAt):''}</span></div><div class="waiting24-age"><b class="${state}">${age} d</b><span>od posledního pohybu</span></div><div class="row-actions"><button class="btn" data-wait24-touch="${x.id}">Připomenuto</button><button class="btn primary" data-wait24-done="${x.id}">Vyřešeno</button></div></div>`}).join('')||'<div class="empty success-empty">Nic není blokované čekáním na někoho dalšího.</div>'}
 </div>`;
}

function debtsHtml(s){
 const a=(s.debtBook?.items||[]).filter(x=>x.status!=='PAID').sort((x,y)=>debtStatus(y).score-debtStatus(x).score);
 const total=a.reduce((n,x)=>n+debtRemaining(x),0),urgent=a.filter(x=>debtStatus(x).score>=70).length;
 return `<div class="view-head compact"><div><div class="eyebrow">POHLEDÁVKY</div><h1>${money(total)}</h1><p>Peníze, které ti ještě mají přijít.</p></div><div class="view-head-stat"><b>${urgent}</b><span>k urgenci</span></div></div>
 <div class="metric-strip"><div class="metric"><span>Aktivních</span><b>${a.length}</b></div><div class="metric"><span>Celkem</span><b>${money(total)}</b></div><div class="metric"><span>Urgovat</span><b class="${urgent?'warn':'good'}">${urgent}</b></div><div class="metric"><span>Průměr</span><b>${money(a.length?total/a.length:0)}</b></div></div>
 <div class="card"><div class="card-head"><div><div class="eyebrow">PŘEHLED</div><h2>Aktivní pohledávky</h2></div><button class="btn" data-capture24>＋ Přidat</button></div>
 ${a.map(x=>{const st=debtStatus(x),rem=debtRemaining(x);return `<div class="debt24-row"><div class="debt-person"><b>${h(x.person||'Neznámý')}</b><span>${h(x.reason||'Pohledávka')}</span></div><div><b>${money(rem)}</b><small>${x.promisedAt?'slíbeno '+date(x.promisedAt):'bez slíbeného data'}</small></div><span class="status ${tone(st.score)}">${h(st.label)}</span><div class="row-actions"><button class="btn" data-debt24-follow="${x.id}">Připomenout</button><button class="btn primary" data-debt24-pay="${x.id}">Splátka</button></div></div>`}).join('')||'<div class="empty success-empty">Žádné aktivní pohledávky.</div>'}
 </div>`;
}

function termItems(s){
 const now=Date.now(),end=now+30*86400000,a=[];
 for(const e of s.calendar?.events||[]){const raw=eventStart(e);if(!raw)continue;const t=new Date(raw).getTime();if(Number.isFinite(t)&&t>=now-3600000&&t<=end)a.push({at:t,title:e.title||e.summary||'Událost',type:'Kalendář',meta:e.location||''})}
 for(const t of s.tasks||[]){if(t.status==='HOTOVO'||!t.due)continue;const at=new Date(t.due).getTime();if(Number.isFinite(at)&&at>=now-3600000&&at<=end)a.push({at,title:t.title,type:'Úkol',meta:t.area||''})}
 for(const x of s.ticketBook?.items||[]){if(!x.date)continue;const at=new Date(x.date).getTime();if(Number.isFinite(at)&&at>=now-3600000&&at<=end)a.push({at,title:x.name,type:'Vstupenka',meta:`${Number(x.qty||1)} ks`})}
 return a.sort((x,y)=>x.at-y.at);
}
function termsHtml(s){
 const a=termItems(s),next=a[0];
 return `<div class="view-head compact"><div><div class="eyebrow">TERMÍNY / 30 DNÍ</div><h1>${next?date(next.at):'Nic kritického'}</h1><p>${next?`Nejbližší: ${h(next.title)}`:'Příštích 30 dní je bez evidovaných termínů.'}</p></div><div class="view-head-stat"><b>${a.length}</b><span>položek</span></div></div>
 <div class="card timeline24">${a.map((x,i)=>`<div class="timeline-row"><span class="timeline-dot ${i===0?'next':''}"></span><div class="timeline-date"><b>${date(x.at)}</b><span>${new Date(x.at).toLocaleTimeString('cs-CZ',{hour:'2-digit',minute:'2-digit'})}</span></div><div class="timeline-copy"><b>${h(x.title)}</b><span>${h(x.type)}${x.meta?' · '+h(x.meta):''}</span></div></div>`).join('')||'<div class="empty success-empty">Nic důležitého v příštích 30 dnech.</div>'}</div>`;
}

function backupHtml(s){
 const size=Math.round(new Blob([JSON.stringify(s)]).size/1024);
 return `<div class="view-head compact"><div><div class="eyebrow">ZÁLOHA</div><h1>Tvoje data pod kontrolou</h1><p>Exportuj celý stav nebo bezpečně obnov starší JSON.</p></div><div class="view-head-stat"><b>${size} kB</b><span>aktuální stav</span></div></div>
 <div class="grid two"><div class="card backup24-card"><div class="hub-icon">↧</div><h2>Export</h2><p class="muted">Stáhne kompletní lokální stav včetně úkolů, projektů, vstupenek, pohledávek a nastavení.</p><button class="btn primary" id="backup24Export">Stáhnout JSON zálohu</button></div>
 <div class="card backup24-card"><div class="hub-icon">↥</div><h2>Obnova</h2><p class="muted">Soubor nejdřív zkontroluji. Pokud půjde opravit, ukážu ti upozornění před importem.</p><label class="btn">Vybrat JSON<input id="backup24Import" type="file" accept=".json,application/json" hidden></label></div></div>`;
}

function settingsHtml(s){
 const notification=('Notification'in window)?Notification.permission:'unsupported';
 const learned=(s.learning?.feedback||[]).length;
 return `<div class="view-head compact"><div><div class="eyebrow">NASTAVENÍ</div><h1>Chování Kamil OS</h1><p>Upozornění a naučené preference bez zbytečných voleb.</p></div></div>
 <div class="card settings24-list"><div class="settings24-row"><div><b>Upozornění v prohlížeči</b><span>Vysoká priorita, když aplikace není v popředí.</span></div><span class="status ${notification==='granted'?'good':notification==='denied'?'bad':'warn'}">${h(notification)}</span><button class="btn" id="notify24Btn" ${notification==='unsupported'?'disabled':''}>${notification==='granted'?'Povoleno':'Povolit'}</button></div>
 <div class="settings24-row"><div><b>Inteligence</b><span>${learned} uložených reakcí na doporučení.</span></div><span></span><button class="btn" id="resetLearning24">Resetovat učení</button></div>
 <div class="settings24-row"><div><b>Účet</b><span>Odhlášení neodstraní cloudová data.</span></div><span></span><button class="btn danger" id="systemLogout24">Odhlásit</button></div></div>`;
}

function systemHtml(s){
 const pf=s.meta?.preflight,checks=pf?.checks||[],failed=checks.filter(x=>!x.ok);
 const cloud=s.meta?.lastCloudAt||store.meta()?.lastCloudAt;
 return `<div class="view-head compact"><div><div class="eyebrow">SYSTÉM / DIAGNOSTIKA</div><h1>${failed.length?'Potřebuje kontrolu':'Všechno vypadá dobře'}</h1><p>Lokální stav, cloud, schema a release kontrola.</p></div><div class="view-head-stat"><b class="${failed.length?'bad':'good'}">${failed.length?'CHECK':'OK'}</b><span>preflight</span></div></div>
 <div class="metric-strip"><div class="metric"><span>Verze</span><b>${h(APP_VERSION)}</b></div><div class="metric"><span>Schema</span><b>v${SCHEMA_VERSION}</b></div><div class="metric"><span>Cloud</span><b>${cloud?date(cloud):'—'}</b></div><div class="metric"><span>Poslední změna</span><b>${s.meta?.lastMutationAt?date(s.meta.lastMutationAt):'—'}</b></div></div>
 <div class="grid two"><div class="card"><div class="card-head"><div><div class="eyebrow">PREFLIGHT</div><h2>Kontroly</h2></div><span class="status ${failed.length?'bad':'good'}">${checks.length-failed.length}/${checks.length||0}</span></div>${checks.map(x=>`<div class="system-check"><span class="check-dot ${x.ok?'good':'bad'}"></span><div><b>${h(x.name)}</b><small>${h(x.detail||'')}</small></div><strong class="${x.ok?'good':'bad'}">${x.ok?'OK':'CHYBA'}</strong></div>`).join('')||'<div class="empty">Preflight ještě neběžel.</div>'}</div>
 <div class="card"><div class="eyebrow">STAV</div><div class="row"><span>Poslední cloud</span><b>${cloud?dateTime(cloud):'—'}</b></div><div class="row"><span>Lokální změna</span><b>${s.meta?.lastMutationAt?dateTime(s.meta.lastMutationAt):'—'}</b></div><div class="row"><span>Pending sync</span><b class="${store.dirty?'warn':'good'}">${store.dirty?'ANO':'NE'}</b></div><div class="row"><span>Undo body</span><b>${(s.undo||[]).length}</b></div></div></div>`;
}

function bindActions(){
 qsa('[data-capture24]').forEach(b=>b.onclick=()=>window.dispatchEvent(new CustomEvent('kamil:capture')));
 qsa('[data-inbox24-task]').forEach(b=>b.onclick=()=>store.mutate('Inbox → úkol',s=>{const x=s.inbox.find(y=>y.id===b.dataset.inbox24Task);if(x){s.tasks.unshift({id:uid('task'),title:x.title,status:'UDĚLAT',priority:'NORMAL',area:'Inbox',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});x.status='DONE'}}));
 qsa('[data-inbox24-project]').forEach(b=>b.onclick=()=>store.mutate('Inbox → projekt',s=>{const x=s.inbox.find(y=>y.id===b.dataset.inbox24Project);if(x){s.projects.unshift({id:uid('project'),name:x.title,status:'Aktivní',next:'Doplnit další krok',createdAt:new Date().toISOString()});x.status='DONE'}}));
 qsa('[data-inbox24-wait]').forEach(b=>b.onclick=()=>store.mutate('Inbox → čekám',s=>{const x=s.inbox.find(y=>y.id===b.dataset.inbox24Wait);if(x){s.delegations=s.delegations||[];s.delegations.unshift({id:uid('wait'),title:x.title,status:'WAITING',createdAt:new Date().toISOString()});x.status='DONE'}}));
 qsa('[data-inbox24-term]').forEach(b=>b.onclick=()=>inboxTerm(b.dataset.inbox24Term));
 qsa('[data-inbox24-ignore]').forEach(b=>b.onclick=()=>store.mutate('Inbox ignorován',s=>{const x=s.inbox.find(y=>y.id===b.dataset.inbox24Ignore);if(x)x.status='DONE'}));
 qsa('[data-wait24-touch]').forEach(b=>b.onclick=()=>store.mutate('Čekající položka připomenuta',s=>{const x=s.delegations.find(y=>y.id===b.dataset.wait24Touch);if(x){x.lastContactAt=new Date().toISOString();x.updatedAt=new Date().toISOString()}}));
 qsa('[data-wait24-done]').forEach(b=>b.onclick=()=>store.mutate('Čekající položka vyřešena',s=>{const x=s.delegations.find(y=>y.id===b.dataset.wait24Done);if(x){x.status='DONE';x.doneAt=new Date().toISOString();x.updatedAt=new Date().toISOString()}}));
 qsa('[data-debt24-follow]').forEach(b=>b.onclick=()=>store.mutate('Pohledávka připomenuta',s=>{const x=s.debtBook.items.find(y=>y.id===b.dataset.debt24Follow);if(x){x.lastContactAt=new Date().toISOString();const d=new Date();d.setDate(d.getDate()+7);x.promisedAt=d.toISOString()}}));
 qsa('[data-debt24-pay]').forEach(b=>b.onclick=()=>debtPayment(b.dataset.debt24Pay));
 qs('#backup24Export')?.addEventListener('click',()=>downloadJson(`kamil-os-backup-${new Date().toISOString().slice(0,10)}.json`,S()));
 qs('#backup24Import')?.addEventListener('change',e=>importBackup(e.target.files?.[0]));
 qs('#notify24Btn')?.addEventListener('click',async()=>{if('Notification'in window){await Notification.requestPermission();renderMore()}});
 qs('#resetLearning24')?.addEventListener('click',async()=>{const ok=await modal('Resetovat učení?',`<p class="muted">Smažu pouze reakce na doporučení. Tvoje úkoly ani další data se nezmění.</p>`,[{label:'Zrušit',value:false},{label:'Resetovat',value:true,danger:true}]);if(ok)store.mutate('Resetováno učení',s=>{s.learning={typeBias:{},feedback:[]}})});
 qs('#systemLogout24')?.addEventListener('click',()=>window.dispatchEvent(new CustomEvent('kamil:logout')));
}

async function debtPayment(id){
 const x=S().debtBook?.items?.find(y=>y.id===id);if(!x)return;
 const body=`<div class="form-grid"><label>Splátka<input id="debt24Amount" type="number" value="${debtRemaining(x)}"></label><label>Poznámka<input id="debt24Note" value=""></label></div>`;
 const ok=await modal(`Splátka – ${x.person||'pohledávka'}`,body,[{label:'Zrušit',value:false},{label:'Uložit splátku',value:true,primary:true}]);if(!ok)return;
 const amount=Number(qs('#debt24Amount')?.value||0),note=qs('#debt24Note')?.value?.trim()||'';
 if(!Number.isFinite(amount)||amount<=0){toast('Neplatná částka');return}
 store.mutate(`Splátka ${x.person||''}`.trim(),s=>{const d=s.debtBook.items.find(y=>y.id===id);if(!d)return;d.payments=d.payments||[];d.payments.push({id:uid('payment'),amount,note,at:new Date().toISOString()});d.lastContactAt=new Date().toISOString();if(debtRemaining(d)<=0){d.status='PAID';d.paidAt=new Date().toISOString()}});
}

async function inboxTerm(id){
 const x=S().inbox?.find(y=>y.id===id);if(!x)return;
 const d=new Date();d.setDate(d.getDate()+1);
 const body=`<div class="form-grid"><label>Termín<input id="inbox24Due" type="date" value="${d.toISOString().slice(0,10)}"></label><label>Oblast<input id="inbox24Area" value="Inbox"></label></div>`;
 const ok=await modal('Přidat termín',body,[{label:'Zrušit',value:false},{label:'Vytvořit úkol',value:true,primary:true}]);if(!ok)return;
 const due=qs('#inbox24Due')?.value,area=qs('#inbox24Area')?.value?.trim()||'Inbox';
 store.mutate('Inbox → termín',s=>{const i=s.inbox.find(y=>y.id===id);if(!i)return;s.tasks.unshift({id:uid('task'),title:i.title,status:'UDĚLAT',priority:'NORMAL',area,due:due?new Date(due+'T09:00:00').toISOString():null,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});i.status='DONE'});
}

async function importBackup(file){
 if(!file)return;
 try{
  const data=JSON.parse(await file.text()),validation=validateState(data);
  if(!validation.ok){await modal('Záloha je poškozená',`<p class="bad">${h(validation.fatal.join('; '))}</p>`,[{label:'Zavřít',value:false}]);return}
  const repaired=repairState(data),warnings=repaired.report.issues;
  const ok=await modal('Obnovit tuto zálohu?',`${warnings.length?`<p class="warn">Při importu opravím: ${h(warnings.join('; '))}</p>`:'<p class="good">Struktura zálohy je v pořádku.</p>'}<p class="muted">Předchozí lokální stav vložím do Undo historie.</p>`,[{label:'Zrušit',value:false},{label:'Obnovit',value:true,primary:true}]);
  if(!ok)return;
  const current=clone(S()),next=repaired.state;next.undo=Array.isArray(next.undo)?next.undo:[];next.undo.unshift({label:'Před obnovou zálohy',at:new Date().toISOString(),state:current});next.undo=next.undo.slice(0,15);
  store.replace(next,'backup-import');store.mutate('Obnovena záloha',()=>{}, {undo:false});toast('Záloha obnovena');
 }catch(e){toast('Zálohu se nepodařilo načíst')}
}
