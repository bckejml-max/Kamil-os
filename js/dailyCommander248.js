import {store} from './state.js';

const DAY=86400000;
const upper=x=>String(x||'').toUpperCase();
const active=x=>!['DONE','HOTOVO','CLOSED','ARCHIVED','PAID','SOLD'].includes(upper(x?.status||x?.workflow));
const ts=x=>{const raw=x?.dueAt||x?.dueDate||x?.date||x?.deadline||x?.followUpAt||x?.nextActionAt||x?.targetDate;const n=raw?Date.parse(raw):NaN;return Number.isFinite(n)?n:null};
const title=x=>x?.title||x?.name||x?.person||x?.reason||'Položka';
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const days=(n,now)=>Math.floor((n-now)/DAY);
function ensureCss(){if(document.querySelector('link[data-daily248]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href='./dailyCommander248.css';l.dataset.daily248='1';document.head.appendChild(l)}

function flatten(s){
 const out=[];
 for(const x of s.tasks||[])if(active(x))out.push({kind:'task',source:x,title:title(x),at:ts(x),priority:upper(x.priority),waiting:false});
 for(const x of s.directorBook?.waiting||[])if(active(x))out.push({kind:'waiting',source:x,title:title(x),at:ts(x),priority:upper(x.priority),waiting:true});
 for(const x of s.personalWaiting?.items||[])if(active(x))out.push({kind:'waiting',source:x,title:title(x),at:ts(x),priority:upper(x.priority),waiting:true});
 for(const x of s.personalAdmin?.items||[])if(active(x))out.push({kind:'admin',source:x,title:title(x),at:ts(x),priority:upper(x.priority),waiting:false});
 return out;
}
function score(item,now){let s=0;if(item.priority==='HIGH'||item.priority==='URGENT')s+=45;else if(item.priority==='NORMAL')s+=12;if(item.at){const d=days(item.at,now);if(d<0)s+=80+Math.min(30,Math.abs(d)*4);else if(d===0)s+=70;else if(d===1)s+=48;else if(d<=3)s+=32;else if(d<=7)s+=18;else if(d<=14)s+=8}if(item.waiting)s+=item.at&&item.at<now?35:10;return s}
function why(item,now){if(item.at){const d=days(item.at,now);if(d<0)return `${Math.abs(d)} d po termínu`;if(d===0)return 'termín dnes';if(d===1)return 'termín zítra';if(d<=7)return `za ${d} d`;}if(item.waiting)return 'čekáš na odpověď';if(item.priority==='HIGH'||item.priority==='URGENT')return 'vysoká priorita';return 'další smysluplný krok'}
function snooze(item,now){if(item.at&&item.at<now)return new Date(now+DAY).toISOString();if(item.waiting)return new Date(now+2*DAY).toISOString();return new Date(now+3*DAY).toISOString()}

export function buildDailyCommander248(s=store.get(),now=Date.now()){
 const items=flatten(s).map(x=>({...x,score:score(x,now),reason:why(x,now),snoozeTo:snooze(x,now)})).sort((a,b)=>b.score-a.score||String(a.title).localeCompare(String(b.title),'cs'));
 const due=d=>items.filter(x=>x.at&&days(x.at,now)<=d);
 const overdue=items.filter(x=>x.at&&x.at<now);
 const today=items.filter(x=>x.at&&days(x.at,now)===0);
 const waiting=items.filter(x=>x.waiting);
 const top3=items.filter(x=>x.score>0).slice(0,3);
 const hour=new Date(now).getHours();const mode=hour<12?'morning':hour>=18?'evening':'day';
 const completed=(s.tasks||[]).filter(x=>['DONE','HOTOVO','CLOSED'].includes(upper(x.status))).length;
 const open=(s.tasks||[]).filter(active).length;
 const dailyScore=Math.max(0,Math.min(100,Math.round(100-(overdue.length*12)-(today.length*4)+(Math.min(25,completed*2)))));
 const weekStart=now-7*DAY;const doneWeek=(s.tasks||[]).filter(x=>['DONE','HOTOVO','CLOSED'].includes(upper(x.status))&&Date.parse(x.updatedAt||x.doneAt||0)>=weekStart).length;
 return {mode,items,top3,overdue,today,waiting,radar:{d1:due(1).length,d3:due(3).length,d7:due(7).length,d14:due(14).length,d30:due(30).length},dailyScore,weekly:{done:doneWeek,open},generatedAt:new Date(now).toISOString()};
}
function row(x){return `<div class="daily248-row"><div><b>${esc(x.title)}</b><small>${esc(x.reason)}</small></div><strong>${x.score}</strong></div>`}
function body(model){const mode=model.mode==='morning'?'Ranní start':model.mode==='evening'?'Večerní uzávěrka':'Denní fokus';const top=model.top3.length?model.top3.map(row).join(''):'<div class="daily248-clear"><b>Žádná naléhavá věc.</b><span>Můžeš se věnovat plánovaným úkolům nebo skončit dřív.</span></div>';return `<div class="daily248"><div class="daily248-hero"><div><small>${mode}</small><h2>${model.top3.length?'Tři věci, které mají největší smysl řešit':'Dnes je čisto'}</h2></div><div class="daily248-score"><b>${model.dailyScore}</b><span>denní skóre</span></div></div><div class="daily248-top">${top}</div><div class="daily248-radar"><span><b>${model.overdue.length}</b> po termínu</span><span><b>${model.radar.d1}</b> 1 den</span><span><b>${model.radar.d3}</b> 3 dny</span><span><b>${model.radar.d7}</b> 7 dní</span><span><b>${model.radar.d30}</b> 30 dní</span></div><div class="daily248-review"><b>Týden:</b> ${model.weekly.done} dokončeno · ${model.weekly.open} otevřeno · ${model.waiting.length} čekání</div></div>`}
export function openDailyCommander248(){const model=buildDailyCommander248();window.dispatchEvent(new CustomEvent('kamil:detail-drawer',{detail:{title:'Denní briefing',html:body(model)}}));return model}
export function installDailyCommander248(){ensureCss();window.addEventListener('kamil:open-daily-briefing',openDailyCommander248);document.addEventListener('keydown',e=>{if(e.altKey&&!e.ctrlKey&&!e.metaKey&&e.key.toLowerCase()==='b'){e.preventDefault();openDailyCommander248()}},true);window.__KAMIL_DAILY_COMMANDER248__={version:248,build:buildDailyCommander248,open:openDailyCommander248};}
