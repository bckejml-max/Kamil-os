import {modal,h} from './utils.js';
import {buildCopilot840} from './copilot840.js';

export const COPILOT_FEEDBACK842_VERSION='842.0.0';
const KEY='kamil.copilot.feedback.842';
const A=v=>Array.isArray(v)?v:[];
const U=v=>String(v||'').toUpperCase();
const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();

export function readFeedback842(){try{return A(JSON.parse(localStorage.getItem(KEY)||'[]'))}catch{return[]}}
function write(rows){try{localStorage.setItem(KEY,JSON.stringify(A(rows).slice(-250)))}catch{}}
export function inferArea842(q='',item={}){
 const n=norm(`${q} ${item.area||''} ${item.title||item.action||''}`);
 if(/ticket|vstupenk/.test(n))return'TICKETS';
 if(/bet|saz/.test(n))return'BETTING';
 if(/byt|realit|property/.test(n))return'PROPERTY';
 if(/cash|pen|majet|xtb|bank/.test(n))return'MONEY';
 if(/prace|práce|work|zakaz|zakáz/.test(n))return'WORK';
 if(/rodin|family|mia/.test(n))return'FAMILY';
 if(/domov|home/.test(n))return'HOME';
 if(/dokum|document/.test(n))return'DOCUMENTS';
 return U(item.area)||'GENERAL';
}
export function recordFeedback842({query='',answer='',item=null,vote='up',reason=''}={}){
 const area=inferArea842(query,item||{}),row={id:`fb-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,at:new Date().toISOString(),query:String(query),answer:String(answer).slice(0,500),area,vote:vote==='down'?'down':'up',reason:String(reason||'')};
 const rows=readFeedback842();rows.push(row);write(rows);return row;
}
export function feedbackBias842(area){
 const rows=readFeedback842().filter(x=>U(x.area)===U(area)).slice(-30);if(!rows.length)return 0;
 const score=rows.reduce((a,x)=>a+(x.vote==='up'?1:-1),0);
 return Math.max(-5,Math.min(5,score));
}
export function applyFeedback842(model){
 if(!model)return model;
 const rows=A(model.notifications).map((x,i)=>({...x,__order:i,__fbBias:feedbackBias842(x.area||inferArea842('',x))}));
 rows.sort((a,b)=>(Number(b.priority||0)+b.__fbBias)-(Number(a.priority||0)+a.__fbBias)||a.__order-b.__order);
 const clean=rows.map(({__order,__fbBias,...x})=>x),nextBest=clean[0]||model.nextBest;
 return{...model,notifications:clean,nextBest,feedback842:{version:COPILOT_FEEDBACK842_VERSION,count:readFeedback842().length,boundedBias:true,maxAdjustment:5}};
}
export async function askFeedback842({query='',answer='',item=null}={}){
 const choice=await modal('Byla odpověď užitečná?',`<div class="card"><div class="eyebrow">OS842 · FEEDBACK</div><h2>${h(answer||'Copilot odpověď')}</h2><p class="muted">Feedback jemně upravuje budoucí pořadí. Bezpečnostní pravidla a finanční guardrails nepřepisuje.</p></div>`,[{label:'👍 Užitečné',value:'up',primary:true},{label:'👎 Neužitečné',value:'down'},{label:'Přeskočit',value:null}]);
 if(!choice)return null;
 let reason='';
 if(choice==='down')reason=await modal('Co bylo špatně?',`<div class="card"><p>Vyber hlavní důvod.</p></div>`,[{label:'Nerelevantní',value:'irrelevant'},{label:'Špatná data',value:'bad_data'},{label:'Špatná priorita',value:'bad_priority'},{label:'Příliš obecné',value:'too_generic'},{label:'Jiné',value:'other'},{label:'Zrušit',value:null}])||'';
 return recordFeedback842({query,answer,item,vote:choice,reason});
}
export async function buildCopilot842(){return applyFeedback842(await buildCopilot840())}
export async function openCopilot842(){
 const m=await buildCopilot842(),top=m.nextBest;
 const body=`<div class="card"><div class="eyebrow">OS842 · LEARNING LOOP</div><h2>${h(top?.title||top?.action||'Bez kritické priority')}</h2><p>${h(top?.detail||top?.reason||'')}</p><div class="row"><span>Feedback záznamů</span><b>${m.feedback842.count}</b></div><div class="row"><span>Max. vliv na prioritu</span><b>±5 bodů</b></div><p class="muted">Feedback nikdy nepřepisuje stop rules, data blockers ani finanční guardrails.</p></div>`;
 return modal('Kamil OS Copilot · Feedback',body,[{label:'Zavřít',value:null,primary:true}]);
}
