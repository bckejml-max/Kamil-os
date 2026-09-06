import {completePersonalAction641,openPersonalAction641} from './personalActionExecution641.js';
import {postponePersonalActionToTomorrow642} from './personalFollowup642.js';
import {refreshTodayPriority696} from './todayPriority696.js';
import {toast} from './utils.js';

const VERSION='697.0.0';
const norm=v=>String(v||'').trim().toLowerCase().replace(/\s+/g,' ');
let timer=0;

function ensureCss(){
 if(document.querySelector('link[data-today697-css]'))return;
 const l=document.createElement('link');l.rel='stylesheet';l.href='./todayActions697.css';l.dataset.today697Css='1';document.head.appendChild(l);
}
function candidates(model){
 const d=model?.daily||{},rows=[d.primary,...(Array.isArray(d.secondary)?d.secondary:[]),...(Array.isArray(d.waiting)?d.waiting:[])].filter(Boolean);
 const map=new Map();for(const x of rows){const key=norm(x.title||x.name||x.summary);if(key&&!map.has(key))map.set(key,x)}return map;
}
function rerender(){
 try{window.__KAMIL_TODAY_HUB650__?.refresh?.(20)}catch{}
 for(const ms of [60,180,420])setTimeout(()=>{try{refreshTodayPriority696()}catch{};setTimeout(refreshTodayActions697,30)},ms);
}
function directDone(action){
 if(!completePersonalAction641(action)){toast('Položku se nepodařilo dokončit.');return}
 toast('Hotovo.');
 window.dispatchEvent(new CustomEvent('kamil:personal-action-updated',{detail:{result:'done',actionId:action.id||null,title:action.title||null,at:Date.now()}}));
 rerender();
}
function directTomorrow(action){
 if(!postponePersonalActionToTomorrow642(action)){toast('Položku se nepodařilo přesunout.');return}
 toast('Přesunuto na zítra ráno.');
 window.dispatchEvent(new CustomEvent('kamil:personal-action-updated',{detail:{result:'tomorrow',actionId:action.id||null,title:action.title||null,at:Date.now()}}));
 rerender();
}
function bar(action){
 const kind=String(action?.kind||'').toLowerCase(),safe=['task','admin','waiting'].includes(kind),data=kind==='data'||kind==='calendar';
 if(!safe&&!data)return null;
 const el=document.createElement('div');el.className='today697-actions';el.dataset.today697Actions='1';
 if(safe){
  const done=document.createElement('button');done.type='button';done.className='today697-btn primary';done.textContent='Hotovo';done.addEventListener('click',e=>{e.stopPropagation();directDone(action)});el.appendChild(done);
  const tomorrow=document.createElement('button');tomorrow.type='button';tomorrow.className='today697-btn';tomorrow.textContent='Zítra';tomorrow.addEventListener('click',e=>{e.stopPropagation();directTomorrow(action)});el.appendChild(tomorrow);
 }
 const more=document.createElement('button');more.type='button';more.className='today697-btn';more.textContent=data?(kind==='calendar'?'Připravit':'Aktualizovat'):'Více';more.addEventListener('click',async e=>{e.stopPropagation();await openPersonalAction641(action);rerender()});el.appendChild(more);
 return el;
}
export function refreshTodayActions697(){
 clearTimeout(timer);timer=setTimeout(()=>{
  ensureCss();const root=document.querySelector('[data-today-priority696]'),model=window.__KAMIL_TODAY_HUB650__?.model;if(!root||!model)return;
  root.querySelectorAll('[data-today697-actions]').forEach(x=>x.remove());
  const map=candidates(model);let mounted=0;
  root.querySelectorAll('.today696-row').forEach(row=>{
   const title=norm(row.querySelector('.today696-copy b')?.textContent);const action=map.get(title);if(!action?.id)return;const controls=bar(action);if(!controls)return;row.insertAdjacentElement('afterend',controls);mounted++;
  });
  window.__KAMIL_TODAY_ACTIONS697__={version:VERSION,healthy:true,mounted,at:Date.now()};document.documentElement.dataset.todayActions697='1';
 },30);
}
export function appendTodayActions697(){refreshTodayActions697();for(const ms of [120,350,800])setTimeout(refreshTodayActions697,ms);return true}
