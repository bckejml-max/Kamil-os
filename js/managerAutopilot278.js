import {store} from './state.js';
import {buildDailyCommander248} from './dailyCommander248.js';
import {buildFinanceCommand258} from './financeCommand258.js';
import {buildTicketCommand268} from './ticketCommand268.js';

const DAY=86400000;
const upper=x=>String(x||'').toUpperCase();
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const active=x=>!['DONE','HOTOVO','CLOSED','ARCHIVED','PAID'].includes(upper(x?.status));
const workRe=/zak[aá]zk|faktur|dodavat|pks|cpi|zbrojov|prac|stavb|zl\b/i;
const dateOf=x=>{const raw=x?.dueAt||x?.dueDate||x?.deadline||x?.date||x?.nextActionAt;const n=raw?Date.parse(raw):NaN;return Number.isFinite(n)?n:null};
const title=x=>x?.title||x?.name||x?.reason||'Položka';
const dueIn=x=>{const d=dateOf(x);return d===null?null:Math.ceil((d-Date.now())/DAY)};

function workItems(s){const out=[];for(const x of s.tasks||[])if(active(x)&&workRe.test(`${x.title||''} ${x.area||''}`))out.push(x);for(const x of s.directorBook?.items||[])if(active(x))out.push(x);return out}
function monthlyClosing(now=new Date()){
 const y=now.getFullYear(),m=now.getMonth();const last=new Date(y,m+1,0).getDate();
 const defs=[{day:1,title:'Koncepty faktur vydaných'},{day:20,title:'Aktualizace karty zakázky'},{day:25,title:'Fakturace na dodavatele'},{day:last,title:'Cestovní příkaz + docházka'}];
 return defs.map(x=>{const at=new Date(y,m,x.day,17,0,0,0);const diff=Math.ceil((at-now)/DAY);return {...x,at:at.toISOString(),days:diff,status:diff<0?'OVERDUE':diff===0?'TODAY':diff<=3?'SOON':'OK'}});
}
function zlTracker(s){return [...(s.tasks||[]),...(s.directorBook?.items||[])].filter(x=>/\bzl\b|zm[eě]nov/i.test(`${x.title||''} ${x.name||''} ${x.notes||''}`)).map(x=>({title:title(x),status:x.status||'OPEN',due:dateOf(x),amount:Number(x.amountCzk||x.valueCzk||0)}));}
function timeline(s){const events=[];for(const x of s.tasks||[])if(x.updatedAt||x.createdAt)events.push({at:x.updatedAt||x.createdAt,title:title(x),kind:'task'});for(const x of s.ticketBook?.items||[])if(x.updatedAt||x.createdAt)events.push({at:x.updatedAt||x.createdAt,title:title(x),kind:'ticket'});for(const x of s.decisionJournal?.items||[])if(x.at||x.createdAt)events.push({at:x.at||x.createdAt,title:x.title||x.action||'Rozhodnutí',kind:'decision'});return events.filter(x=>Date.parse(x.at)).sort((a,b)=>Date.parse(b.at)-Date.parse(a.at)).slice(0,30)}
function riskRadar(items){return items.map(x=>{const d=dueIn(x),p=upper(x.priority);let score=0;if(d!==null){if(d<0)score+=100;else if(d===0)score+=80;else if(d<=3)score+=55;else if(d<=7)score+=25}if(p==='HIGH'||p==='URGENT')score+=45;return {title:title(x),days:d,score,status:score>=100?'CRITICAL':score>=60?'HIGH':score>=25?'WATCH':'OK'}}).sort((a,b)=>b.score-a.score)}
function notificationBrain(daily,work,tickets){const rows=[];for(const x of daily.top3)rows.push({area:'Osobní',title:x.title,score:x.score,reason:x.reason});for(const x of work.filter(x=>x.score>=25).slice(0,3))rows.push({area:'Práce',title:x.title,score:x.score,reason:x.days<0?'po termínu':x.days===0?'dnes':`za ${x.days} d`});if(tickets.blocked.length)rows.push({area:'Vstupenky',title:`${tickets.blocked.length} BUY rozhodnutí čeká na ověření`,score:35,reason:'compliance/data'});return rows.sort((a,b)=>b.score-a.score)}

export function buildAutopilot278(s=store.get(),now=new Date()){
 const daily=buildDailyCommander248(s,now.getTime()),finance=buildFinanceCommand258(s),tickets=buildTicketCommand268(s),work=workItems(s),risks=riskRadar(work),closing=monthlyClosing(now),zls=zlTracker(s),notifications=notificationBrain(daily,risks,tickets);
 const actions=[];
 for(const x of notifications)actions.push({area:x.area,title:x.title,reason:x.reason,score:x.score});
 const closingUrgent=closing.filter(x=>['OVERDUE','TODAY','SOON'].includes(x.status));for(const x of closingUrgent)actions.push({area:'Práce',title:x.title,reason:x.status==='OVERDUE'?'měsíční termín po splatnosti':x.status==='TODAY'?'měsíční termín dnes':`termín za ${x.days} d`,score:x.status==='OVERDUE'?120:x.status==='TODAY'?90:55});
 if(finance.concentration.length)actions.push({area:'Finance',title:`Prověř koncentraci ${finance.concentration[0].name}`,reason:`${(finance.concentration[0].weight*100).toFixed(1)} % portfolia`,score:45});
 if(tickets.opportunities.length)actions.push({area:'Vstupenky',title:`Prověř BUY ${tickets.opportunities[0].name||tickets.opportunities[0].event||''}`,reason:'compliance + net-safe cena splněna',score:42});
 const top3=actions.sort((a,b)=>b.score-a.score).filter((x,i,a)=>a.findIndex(y=>y.title===x.title)===i).slice(0,3);
 return {top3,daily,finance,tickets,manager:{work,risks,closing,zls},notifications,timeline:timeline(s),backup:{statePresent:!!s,generatedAt:new Date().toISOString(),schema:s?.meta?.schemaVersion||s?.schemaVersion||null},guardrails:{autoMutate:false,financialExecution:false,ticketExecution:false,confirmationRequired:true},generatedAt:new Date().toISOString()};
}
function body(m){const top=m.top3.length?m.top3.map((x,i)=>`<div class="auto278-action"><strong>${i+1}</strong><span><b>${esc(x.title)}</b><small>${esc(x.area)} · ${esc(x.reason)}</small></span></div>`).join(''):'<div class="auto278-clear"><b>Nemáš nic kritického.</b><span>Autopilot nenašel žádnou položku, kterou by měl tlačit před ostatní.</span></div>';const risks=m.manager.risks.slice(0,4).map(x=>`<div class="auto278-mini"><span>${esc(x.title)}</span><b>${x.status}</b></div>`).join('');const close=m.manager.closing.map(x=>`<div class="auto278-mini"><span>${esc(x.title)}</span><b>${x.status}</b></div>`).join('');return `<div class="auto278"><div class="auto278-hero"><small>KAMIL OS AUTOPILOT</small><h2>Dnes řeš hlavně tyhle 3 věci</h2></div><div class="auto278-actions">${top}</div><div class="auto278-grid"><section><h3>Pracovní rizika</h3>${risks||'<small>Bez pracovních rizik.</small>'}</section><section><h3>Měsíční uzávěrka</h3>${close}</section></div><div class="auto278-strip"><span><b>${m.daily.dailyScore}</b><small>den</small></span><span><b>${m.manager.zls.length}</b><small>ZL</small></span><span><b>${m.finance.concentration.length}</b><small>finance risk</small></span><span><b>${m.tickets.blocked.length}</b><small>ticket blok</small></span></div><div class="auto278-note">Autopilot pouze prioritizuje. Neodesílá peníze, neobchoduje a nemění ticket marketplace bez výslovného potvrzení.</div></div>`}
function ensureCss(){if(document.querySelector('link[data-auto278]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href='./managerAutopilot278.css';l.dataset.auto278='1';document.head.appendChild(l)}
export function openAutopilot278(){const m=buildAutopilot278();window.dispatchEvent(new CustomEvent('kamil:detail-drawer',{detail:{title:'Kamil OS Autopilot',html:body(m)}}));return m}
export function installManagerAutopilot278(){ensureCss();window.addEventListener('kamil:open-autopilot',openAutopilot278);document.addEventListener('keydown',e=>{if(e.altKey&&!e.ctrlKey&&!e.metaKey&&e.key.toLowerCase()==='a'){e.preventDefault();openAutopilot278()}},true);window.__KAMIL_AUTOPILOT278__={version:278,build:buildAutopilot278,open:openAutopilot278};}
