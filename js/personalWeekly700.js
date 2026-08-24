import {store} from './state.js';
import {h,qs} from './utils.js';
import {personalWeeklyReset650} from './personalAssistant650.js';

export function appendWeeklyReset700(){
 const host=qs('#todayView .ux65-today');if(!host||host.querySelector('[data-weekly700]'))return;
 const day=new Date().getDay();if(day!==0&&day!==1)return;
 const w=personalWeeklyReset650(store.get()),items=[];
 for(const x of w.stale||[])items.push({label:`Ověřit: ${x.title||x.name||'stará věc'}`,route:'today'});
 for(const x of w.waiting||[])items.push({label:`Čekám: ${x.title||x.name||'follow-up'}`,route:'inbox'});
 for(const x of w.next7||[])if(items.length<5)items.push({label:`Tento týden: ${x.title||x.summary||'termín'}`,route:'today'});
 if(!items.length)return;
 const sec=document.createElement('section');sec.className='card core70-weekly';sec.dataset.weekly700='1';sec.innerHTML=`<div class="eyebrow">TÝDENNÍ ÚKLID · MAX 5</div><b>Co zbytečně visí</b><p class="muted">Jednou týdně vytáhnu jen věci, které stojí za uzavření, urgenci nebo kontrolu.</p>${items.slice(0,5).map(x=>`<button class="inbox69-row" data-weekly-route="${h(x.route)}"><span class="inbox69-main"><b>${h(x.label)}</b></span><span>›</span></button>`).join('')}`;
 host.appendChild(sec);sec.querySelectorAll('[data-weekly-route]').forEach(b=>b.addEventListener('click',()=>window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:b.dataset.weeklyRoute}))));
}
