import {store} from './state.js';
import {isPersonalScope527} from './personalScope527.js';
import {h} from './utils.js';

const VERSION=610;
const A=v=>Array.isArray(v)?v:[];
const CLOSED=new Set(['DONE','CLOSED','ARCHIVED','RESOLVED','CANCELLED','CANCELED']);
const familyRe=/rodin|d[ií]t|dcera|syn|manžel|manzel|mam|tat|babi|děd|ded|dom[aá]cnost/i;
const open=x=>!CLOSED.has(String(x?.status||x?.workflow||'').toUpperCase());
function css(){if(document.querySelector('link[data-upgrade610-css]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href='./upgrade610.css';l.dataset.upgrade610Css='1';document.head.appendChild(l)}
function startOfDay(d=new Date()){return new Date(d.getFullYear(),d.getMonth(),d.getDate())}
function dayDiff(v){const t=Date.parse(v||'');if(!Number.isFinite(t))return null;return Math.floor((startOfDay(new Date(t))-startOfDay())/86400000)}
function taskIsFamily(x){return isPersonalScope527(x)&&(String(x.area||'').toLowerCase()==='rodina'||familyRe.test(`${x.title||''} ${x.name||''} ${x.category||''} ${x.area||''}`))}
function eventIsFamily(x){return isPersonalScope527(x)&&(familyRe.test(`${x.title||''} ${x.summary||''} ${x.category||''} ${x.area||''}`)||String(x.area||'').toLowerCase()==='rodina')}
function build(){
 const s=store.get(),members=A(s.familyHome?.members),events=A(s.calendar?.events).filter(eventIsFamily).map(x=>({...x,_d:dayDiff(x.start||x.date||x.when)})).filter(x=>x._d!==null&&x._d>=0&&x._d<=30),tasks=A(s.tasks).filter(taskIsFamily).filter(open).map(x=>({...x,_d:dayDiff(x.due)}));
 const week=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()+i);const label=d.toLocaleDateString('cs-CZ',{weekday:'short',day:'numeric',month:'numeric'}),items=[...events.filter(x=>x._d===i).map(x=>({type:'event',title:x.title||x.summary||'Událost'})),...tasks.filter(x=>x._d===i).map(x=>({type:'task',title:x.title||x.name||'Úkol'}))];return{index:i,label,items}});
 const overdue=tasks.filter(x=>x._d!==null&&x._d<0),undated=tasks.filter(x=>x._d===null),weekend=week.filter(x=>{const d=new Date();d.setDate(d.getDate()+x.index);return [0,6].includes(d.getDay())}).reduce((n,x)=>n+x.items.length,0);
 const birthdays=members.map(m=>{const raw=m.birthDate||m.birthday||m.dob;if(!raw)return null;const d=new Date(raw);if(Number.isNaN(+d))return null;const today=startOfDay(),next=new Date(today.getFullYear(),d.getMonth(),d.getDate());if(next<today)next.setFullYear(next.getFullYear()+1);const diff=Math.floor((next-today)/86400000);return{name:m.name||m.title||'Člen rodiny',days:diff,date:next}}).filter(Boolean).filter(x=>x.days<=90).sort((a,b)=>a.days-b.days);
 const assigned=new Map(members.map(m=>[String(m.id||m.name||'').toLowerCase(),0]));for(const t of tasks){const raw=String(t.assignedTo||t.owner||t.person||t.memberId||'').toLowerCase();if(raw&&assigned.has(raw))assigned.set(raw,(assigned.get(raw)||0)+1)}
 return{members,events,tasks,week,overdue,undated,weekend,birthdays,assigned}
}
function dayHtml(x){return `<div class="os610-day"><small>${h(x.label)}</small>${x.items.length?x.items.slice(0,4).map(v=>`<div title="${h(v.title)}">${v.type==='event'?'●':'✓'} ${h(v.title)}</div>`).join(''):'<div class="muted">volno</div>'}</div>`}
function card(){const m=build(),next=m.week.flatMap(x=>x.items.map(v=>({...v,day:x.label}))).slice(0,1)[0];return `<section class="os610-card" data-family-hub610><div class="os610-head"><div><small>OS610 · FAMILY HUB</small><h2>Rodinný týden</h2><p>Termíny, úkoly a domácnost v jednom krátkém pohledu.</p></div><span class="os610-badge">${m.tasks.length} otevřených úkolů</span></div><div class="os610-grid"><div class="os610-metric"><span>Po termínu</span><b class="${m.overdue.length?'os610-bad':''}">${m.overdue.length}</b></div><div class="os610-metric"><span>Do 7 dní</span><b>${m.week.reduce((n,x)=>n+x.items.length,0)}</b></div><div class="os610-metric"><span>Víkend</span><b>${m.weekend}</b></div><div class="os610-metric"><span>Členové domácnosti</span><b>${m.members.length}</b></div></div><div class="os610-family-week">${m.week.map(dayHtml).join('')}</div><div class="os610-family-radar"><span>${next?`Nejbližší: ${h(next.title)} · ${h(next.day)}`:'Týden je bez známého termínu'}</span><span>${m.undated.length} úkolů bez termínu</span>${m.birthdays[0]?`<span>Nejbližší narozeniny: ${h(m.birthdays[0].name)} za ${m.birthdays[0].days} d</span>`:''}</div></section>`}
function mount(){const host=document.querySelector('#ticketsView');if(!host)return false;const old=host.querySelector('[data-family-hub610]'),wrap=document.createElement('div');wrap.innerHTML=card();const next=wrap.firstElementChild;if(old)old.replaceWith(next);else{const head=host.querySelector('.view-head');head?.after(next);if(!head)host.prepend(next)}return true}
export function appendFamilyHub610(){css();const ok=mount();window.__KAMIL_FAMILY_HUB610__={version:VERSION,healthy:ok,model:build(),refresh:mount,at:Date.now()};return ok}
window.addEventListener('kamil:focus610',e=>{if(e.detail?.focus!=='family-week')return;setTimeout(()=>document.querySelector('[data-family-hub610]')?.scrollIntoView({behavior:'smooth',block:'start'}),180)});
