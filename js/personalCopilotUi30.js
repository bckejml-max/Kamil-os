import {store} from './state.js';
import {personalCopilot30,personalCopilot30Note} from './personalCopilot30.js';
import {h,qs,qsa} from './utils.js';

const id='personalCopilot30Host';
function queries(s){
 const planned=Number(s.financePlan?.plannedInvestment||0),currency=String(s.financePlan?.currency||'CZK').toUpperCase();
 return [
  'Jak jsem na tom?',
  planned>0?`Co koupit za ${Math.round(planned)} ${currency}?`:'Jak je na tom portfolio?',
  'Jak jsou na tom vstupenky?',
  'Co příští měsíc?'
 ];
}
function render(){
 const view=qs('#todayView');if(!view)return;qs(`#${id}`,view)?.remove();const head=view.querySelector('.view-head');if(!head)return;
 const host=document.createElement('div');host.id=id;host.className='card';const q=queries(store.get());
 host.innerHTML=`<div class="card-head"><div><div class="eyebrow">PERSONAL COPILOT / 30.0</div><h2>Zeptej se napříč Kamil OS</h2><p class="muted">Jedna odpověď může spojit cashflow, čisté jmění, XTB, vstupenky i termíny. Jen z uložených dat.</p></div><span class="status good">READ-ONLY</span></div><div class="row-actions">${q.map(x=>`<button class="btn" data-copilot30-query="${h(x)}">${h(x)}</button>`).join('')}</div><div class="decision-note" style="margin-top:10px">${h(personalCopilot30Note)}</div>`;
 head.insertAdjacentElement('afterend',host);
 qsa('[data-copilot30-query]',host).forEach(b=>b.addEventListener('click',()=>{const a=personalCopilot30(b.dataset.copilot30Query,store.get(),store.meta(),new Date());if(a)window.dispatchEvent(new CustomEvent('kamil:copilot-answer',{detail:a}))}));
}
function start(){const view=qs('#todayView');if(!view)return;new MutationObserver(()=>{if(view.querySelector('.view-head')&&!qs(`#${id}`,view))queueMicrotask(render)}).observe(view,{childList:true,subtree:false});store.subscribe(()=>{if(qs('#view-today')?.classList.contains('on'))queueMicrotask(render)});render()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
