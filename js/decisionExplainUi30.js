import {store} from './state.js';
import {oneScreenAutopilot} from './personalPlus29.js';
import {decisionExplain30,decisionExplain30Note} from './decisionExplain30.js';
import {decisionNext30,decisionNext30Note} from './decisionNext30.js';
import {h,qs,modal,toast} from './utils.js';

const BUTTON_ATTR='data-decision-why30';
const current=()=>oneScreenAutopilot(store.get(),store.meta()).doToday||[];
const keyOf=d=>`${String(d?.domain||'')}|${String(d?.id||d?.title||'')}`;
const metaRow=(label,value)=>value===null||value===undefined||value===''?'':`<div class="row"><span>${h(label)}</span><b>${h(value)}</b></div>`;
const nextRows=n=>n.rows.map(x=>`<div class="decision-note"><b>${h(x.label)}</b><div>${h(x.value)}</div></div>`).join('');

async function showWhy(key){
 const decision=current().find(x=>keyOf(x)===key);if(!decision)return toast('Rozhodnutí už není v aktuálním Top 3.');
 const e=decisionExplain30(decision),n=decisionNext30(decision),facts=e.facts.map(x=>`<div class="decision-note"><div>${h(x)}</div></div>`).join('')||'<div class="empty">Původní scoring neposkytuje další strukturovaný fakt. 30.3 nic nedoplňuje odhadem.</div>';
 const triggers=n.hasStructuredTrigger?`<h3>Kdy změnit názor?</h3>${nextRows(n)}<p class="muted">${h(decisionNext30Note)}</p>`:`<h3>Kdy změnit názor?</h3><div class="empty">${h(n.note)}</div>`;
 const body=`<div class="metric-strip"><div class="metric"><span>Priorita</span><b>${e.score}/100</b></div><div class="metric"><span>Engine</span><b>${h(e.engine)}</b></div></div><div class="decision-note" style="margin-top:12px"><b>Pravidlo skóre</b><div>${h(e.rule)}</div></div><h3>Skutečná fakta</h3>${facts}${metaRow('Zdroj',e.source)}${metaRow('Confidence',e.confidence)}${triggers}<p class="muted">${h(decisionExplain30Note)}</p>`;
 const buttons=[{label:'Zavřít',value:null,primary:true}];if(decision.target)buttons.push({label:'Otevřít rozhodnutí',value:'open'});
 const result=await modal(`Proč teď? · ${decision.title||'Rozhodnutí'}`,body,buttons);
 if(result==='open'){window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:decision.target}));if(decision.target==='home'&&decision.homeMode)queueMicrotask(()=>window.dispatchEvent(new CustomEvent('kamil:home-open',{detail:decision.homeMode})))}
}

function decorate(){
 const view=qs('#todayView'),card=view?.querySelector('.autopilot29-card');if(!card)return;
 const rows=[...card.children].filter(x=>x.classList?.contains('autopilot29-row')),decisions=current();
 rows.forEach((row,index)=>{
  if(row.querySelector(`[${BUTTON_ATTR}]`))return;const decision=decisions[index];if(!decision)return;
  const key=keyOf(decision),b=document.createElement('button');b.type='button';b.className='btn';b.textContent='Proč teď?';b.setAttribute(BUTTON_ATTR,key);b.setAttribute('aria-label',`Vysvětlit prioritu a další trigger rozhodnutí ${index+1}`);b.addEventListener('click',()=>showWhy(key));
  const open=[...row.children].find(x=>x.tagName==='BUTTON');if(open)row.insertBefore(b,open);else row.appendChild(b);
 });
}

function start(){const view=qs('#todayView');if(!view)return;new MutationObserver(()=>queueMicrotask(decorate)).observe(view,{childList:true});decorate()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
