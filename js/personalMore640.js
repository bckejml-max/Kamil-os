import {store} from './state.js';
import {modal,h} from './utils.js';
import {personalSettings647,openPersonalSettings647,openPersonalDataHealth647} from './personalSettings647.js';
import {openPersonalWaiting650} from './personalWaiting650.js';
import {personalWeeklyReset650} from './personalAssistant650.js';
import {openTicketCommander660} from './ticketCommander660.js';

const open=x=>!['DONE','CLOSED','ARCHIVED','RESOLVED'].includes(String(x?.status||'').toUpperCase());
const openRows=(arr=[])=>arr.filter(open);
const nav=v=>window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:v}));
const areaLabel=id=>id==='family'?'Rodina':id==='home'?'Domov':id==='money'?'Peníze':id==='admin'?'Administrativa':'Bez zvýhodnění';
const date=v=>{const t=Date.parse(v||'');return Number.isFinite(t)?new Date(t).toLocaleDateString('cs-CZ'):'—'};
const listBody=(title,rows)=>`<div class="card"><div class="eyebrow">${h(title)}</div>${rows.length?rows.slice(0,20).map(x=>`<div class="row"><div><b>${h(x.title||x.name||'Položka')}</b><div class="muted">${h(x.due||x.deadline||x.followUpAt?date(x.due||x.deadline||x.followUpAt):x.note||x.notes||'')}</div></div></div>`).join(''):'<div class="empty">Nic otevřeného.</div>'}</div>`;

async function openSimpleList(title,rows){return modal(title,listBody(title,rows),[{label:'Zavřít',value:null,primary:true}])}
async function openWeeklyReset650(s){const w=personalWeeklyReset650(s),body=`<div class="card"><div class="eyebrow">PŘÍŠTÍCH 7 DNÍ</div>${w.next7.length?w.next7.slice(0,6).map(x=>`<div class="row"><span>${h(x.title||x.summary||'Událost')}</span><b>${x.d===0?'dnes':x.d===1?'zítra':`za ${x.d} d`}</b></div>`).join(''):'<div class="empty">Žádný známý termín.</div>'}</div><div class="card"><div class="eyebrow">ČEKÁM</div>${w.waiting.length?w.waiting.map(x=>`<div class="row"><span>${h(x.title||x.name||'Čekání')}</span></div>`).join(''):'<div class="empty">Na nic nečekáš.</div>'}</div><div class="card"><div class="eyebrow">OVĚŘIT DATA</div>${w.stale.length?w.stale.map(x=>`<div class="row"><span>${h(x.title)}</span><span>${h(x.nextAction||'')}</span></div>`).join(''):'<div class="empty success-empty">Nic důležitého k ověření.</div>'}</div>`;return modal('Týdenní reset',body,[{label:'Hotovo',value:null,primary:true}])}

export async function openPersonalMore640(){
 const s=store.get(),health=personalSettings647(s),goals=openRows(s.personalGoals?.items||[]),inbox=openRows(s.personalInbox?.items||[]),admin=openRows(s.personalAdmin?.items||[]),waiting=openRows(s.delegations||[]);
 const body=`<div class="card"><div class="eyebrow">VÍCE</div><h2>Osobní přehled a nastavení</h2><div class="row"><span>Čekám na odpověď</span><b>${waiting.length}</b></div><div class="row"><span>Osobní inbox</span><b>${inbox.length}</b></div><div class="row"><span>Administrativa</span><b>${admin.length}</b></div><div class="row"><span>Osobní cíle</span><b>${goals.length}</b></div><div class="row"><span>Data k aktualizaci</span><b>${health.missing}</b></div><div class="row"><span>Cloud</span><b>${health.cloud?'Připojen':'Jen toto zařízení'}</b></div><div class="row"><span>Preferovaná oblast</span><b>${areaLabel(health.priorityArea)}</b></div></div>`;
 const choice=await modal('Kamil OS / Více',body,[{label:'Ticket Intelligence',value:'tickets'},{label:'Čekám na odpověď',value:'waiting',primary:waiting.length>0},{label:'Týdenní reset',value:'week'},{label:`Osobní inbox (${inbox.length})`,value:'inbox'},{label:`Administrativa (${admin.length})`,value:'admin'},{label:`Cíle (${goals.length})`,value:'goals'},{label:'Stav a export dat',value:'health'},{label:'Nastavit prioritu',value:'settings'},{label:'Dokumenty',value:'documents'},{label:'Zavřít',value:null}]);
 if(choice==='tickets')return openTicketCommander660();if(choice==='waiting')return openPersonalWaiting650();if(choice==='week')return openWeeklyReset650(s);if(choice==='inbox')return openSimpleList('Osobní inbox',inbox);if(choice==='admin')return openSimpleList('Administrativa',admin);if(choice==='goals')return openSimpleList('Osobní cíle',goals);if(choice==='health')return openPersonalDataHealth647();if(choice==='settings')return openPersonalSettings647();if(choice==='documents')return nav('more');return choice;
}
