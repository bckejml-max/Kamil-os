import {store} from './state.js';
import {h,money,modal} from './utils.js';
import {personalDailyAssistant650,personalWaitingCenter650} from './personalAssistant650.js';
import {command500} from './personalCommand500.js';
import {openPersonalWaiting650} from './personalWaiting650.js';

const A=v=>Array.isArray(v)?v:[];
const CLOSED=new Set(['DONE','CLOSED','ARCHIVED','RESOLVED','PAID','SOLD','CANCELLED','CANCELED']);
const WORK_RE=/zak[aá]zk|faktur|dodavat|cest[aá]k|doch[aá]zk|ředitel|reditel|pks|cpi|zbrojov|\bzl\b|projektov[aá] karta|pracovn|nab[ií]dk|objedn|stavb|mont[aá]ž/i;
const open=x=>!CLOSED.has(String(x?.status||x?.workflow||'').toUpperCase());
const dateOf=x=>x?.due||x?.dueAt||x?.deadline||x?.followUpAt||x?.nextAt||x?.date||x?.start||x?.when||null;
const daysTo=v=>{const t=Date.parse(v||'');return Number.isFinite(t)?Math.ceil((t-Date.now())/86400000):null};
const titleOf=x=>x?.title||x?.name||x?.summary||'Pracovní věc';
const work=x=>WORK_RE.test(`${x?.title||''} ${x?.name||''} ${x?.subject||''} ${x?.category||''} ${x?.area||''} ${x?.project||''}`);

function directorRadar800(s){
 const rows=[];
 const add=(x,source)=>{if(!open(x)||!work(x))return;const days=daysTo(dateOf(x));if(days!==null&&days>14)return;let score=35;if(days!==null&&days<0)score=100;else if(days===0)score=90;else if(days!==null&&days<=2)score=78;else if(days!==null&&days<=7)score=62;rows.push({title:titleOf(x),days,score,source});};
 A(s.tasks).forEach(x=>add(x,'Úkol'));A(s.personalAdmin?.items).forEach(x=>add(x,'Administrativa'));A(s.calendar?.events).forEach(x=>add(x,'Kalendář'));
 rows.sort((a,b)=>b.score-a.score||((a.days??999)-(b.days??999)));
 const now=new Date(),day=now.getDate(),last=new Date(now.getFullYear(),now.getMonth()+1,0).getDate(),monthly=[];
 const milestone=(at,title)=>{const left=at-day;if(left>=-2&&left<=7)monthly.push({title,days:left,score:left<0?96:left===0?88:left<=2?75:55,source:'Měsíční rutina'});};
 milestone(1,'Koncepty faktur vydaných');milestone(20,'Aktualizace karet zakázek');milestone(25,'Fakturace na dodavatele');milestone(last,'Cesták a docházka');
 rows.push(...monthly);rows.sort((a,b)=>b.score-a.score||((a.days??999)-(b.days??999)));
 return{rows:rows.slice(0,8),urgent:rows.filter(x=>x.score>=78).length,total:rows.length};
}

export function commandCenter800(s=store.get()){
 const daily=personalDailyAssistant650(s),waiting=personalWaitingCenter650(s),legacy=command500(s),director=directorRadar800(s);
 const signals=[];
 if(daily.primary)signals.push({kind:'Dnes',title:daily.primary.title,detail:daily.primary.why||daily.primary.next||'',score:100,route:'today'});
 if(waiting.overdue[0])signals.push({kind:'Čekání',title:waiting.overdue[0].title||waiting.overdue[0].name||'Follow-up',detail:waiting.overdue[0].when,score:94,route:'waiting'});
 if(director.rows[0])signals.push({kind:'Ředitel',title:director.rows[0].title,detail:director.rows[0].days===null?'Bez termínu':director.rows[0].days<0?`${Math.abs(director.rows[0].days)} d po termínu`:director.rows[0].days===0?'Dnes':`za ${director.rows[0].days} d`,score:director.rows[0].score,route:'work'});
 if(legacy.cash?.status==='POD REZERVOU')signals.push({kind:'Peníze',title:'Hotovost je pod cílovou rezervou',detail:`Rozdíl ${money(Math.abs(legacy.cash.buffer||0))}`,score:92,route:'money'});
 if(legacy.tickets?.worst&&Number(legacy.tickets.worst.roi)<0)signals.push({kind:'Vstupenky',title:legacy.tickets.action,detail:legacy.tickets.worst.name||'Zkontrolovat pozici',score:76,route:'tickets'});
 signals.sort((a,b)=>b.score-a.score);
 const readiness=Math.round((Number(legacy.readiness||0)+Math.max(0,100-waiting.overdue.length*12)+Math.max(0,100-director.urgent*10))/3);
 return{daily,waiting,director,finance:legacy.finance,cash:legacy.cash,tickets:legacy.tickets,portfolio:legacy.portfolio,signals:signals.slice(0,6),readiness:Math.max(0,Math.min(100,readiness))};
}

const signalHtml=x=>`<div class="os80-signal"><span class="os80-kind">${h(x.kind)}</span><div><b>${h(x.title)}</b>${x.detail?`<small>${h(x.detail)}</small>`:''}</div></div>`;
export function commandCenterPreview800(s=store.get()){
 const x=commandCenter800(s),top=x.signals[0];return{readiness:x.readiness,waiting:x.waiting.count,waitingOverdue:x.waiting.overdue.length,directorUrgent:x.director.urgent,top:top?.title||'Nic zásadního nehoří',topKind:top?.kind||'Klid',safeSpend:Number(x.finance?.safeSpendNow||0)};
}

export async function openCommandCenter800(){
 const x=commandCenter800(),body=`<div class="os80-modal"><div class="metric-strip"><div class="metric"><span>OS readiness</span><b>${x.readiness}/100</b></div><div class="metric"><span>Čekám na</span><b>${x.waiting.count}</b><small>${x.waiting.overdue.length} po follow-up</small></div><div class="metric"><span>Ředitel · urgentní</span><b>${x.director.urgent}</b></div><div class="metric"><span>Volně utratit</span><b>${money(x.finance?.safeSpendNow||0)}</b></div></div><section class="card"><div class="eyebrow">CO TEĎ OPRAVDU ŘEŠIT</div>${x.signals.length?x.signals.map(signalHtml).join(''):'<div class="empty success-empty">Nic zásadního teď nehoří.</div>'}</section><section class="card"><div class="eyebrow">ŘEDITEL · 14DENNÍ RADAR</div>${x.director.rows.length?x.director.rows.slice(0,6).map(v=>`<div class="row"><span>${h(v.title)}</span><b>${v.days===null?'BEZ TERMÍNU':v.days<0?`${Math.abs(v.days)} D PO`:v.days===0?'DNES':`ZA ${v.days} D`}</b></div>`).join(''):'<div class="empty">Žádná pracovní položka v horizontu 14 dní.</div>'}</section><section class="card"><div class="eyebrow">PENÍZE / VSTUPENKY</div><div class="row"><span>Buffer po 30 dnech</span><b>${money(x.cash?.buffer||0)}</b></div><div class="row"><span>XTB pro hotovost</span><b>${h(x.portfolio?.status||'—')}</b></div><div class="row"><span>Vstupenky</span><b>${h(x.tickets?.action||'—')}</b></div></section><div class="decision-note">OS 80 nic automaticky neprodává, neposílá ani neplatí. Je to rozhodovací vrstva nad uloženými daty.</div></div>`;
 const choice=await modal('Kamil OS 80 · Command Center',body,[{label:'Čekám na',value:'waiting',primary:x.waiting.overdue.length>0},{label:'Peníze',value:'money'},{label:'Vstupenky',value:'tickets'},{label:'Zavřít',value:null}]);
 if(choice==='waiting')return openPersonalWaiting650();if(choice==='money')window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:'money'}));if(choice==='tickets')window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:'tickets'}));return choice;
}

export function appendCommandCenter800(host){
 if(!host||host.querySelector('[data-os80-command]'))return;const x=commandCenterPreview800(),section=document.createElement('section');section.className='card os80-command';section.dataset.os80Command='1';section.innerHTML=`<div class="os80-command-head"><div><div class="eyebrow">OS 80 · COMMAND CENTER</div><b>${h(x.top)}</b><p class="muted">${h(x.topKind)} · readiness ${x.readiness}/100</p></div><button class="btn primary" data-os80-open>Otevřít centrum</button></div><div class="os80-mini"><span><b>${x.waiting}</b> čekání</span><span class="${x.waitingOverdue?'bad':''}"><b>${x.waitingOverdue}</b> po follow-up</span><span class="${x.directorUrgent?'bad':''}"><b>${x.directorUrgent}</b> pracovní urgentní</span><span><b>${money(x.safeSpend)}</b> volně</span></div>`;const anchor=host.querySelector('.ux65-context')||host.querySelector('.ux65-quick');anchor?.before(section);if(!anchor)host.appendChild(section);section.querySelector('[data-os80-open]')?.addEventListener('click',()=>openCommandCenter800());
 if(typeof window!=='undefined')window.__KAMIL_OS80__={at:Date.now(),...x};
}
