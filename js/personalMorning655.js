import {store} from './state.js';
import {modal,h} from './utils.js';
import {personalDailyAssistant650,personalWaitingCenter650} from './personalAssistant650.js';
import {personalDaysTo650} from './personalDate650.js';
import {isPersonalScope527} from './personalScope527.js';

const personal=isPersonalScope527;
const title=x=>x.title||x.name||x.summary||'Událost';
const time=x=>{const t=Date.parse(x.start||x.date||x.when||'');return Number.isFinite(t)?new Date(t).toLocaleTimeString('cs-CZ',{hour:'2-digit',minute:'2-digit'}):''};

export function personalMorningLaunch655(s=store.get()){
 const d=personalDailyAssistant650(s),w=personalWaitingCenter650(s);
 const calendar=(s.calendar?.events||[]).filter(personal).map(x=>({...x,d:personalDaysTo650(x.start||x.date||x.when)})).filter(x=>x.d===0).sort((a,b)=>Date.parse(a.start||a.date||a.when||'')-Date.parse(b.start||b.date||b.when||''));
 const followups=[...w.overdue,...w.today];
 return{calendar,followups,primary:d.primary,summary:calendar.length||followups.length?`${calendar.length} dnešní ${calendar.length===1?'událost':'události'} · ${followups.length} follow-up${followups.length===1?'':'y'}`:'Dnešek je zatím klidný.'};
}

export async function openMorningLaunch655(){
 const x=personalMorningLaunch655(store.get());
 const cal=x.calendar.length?`<div class="card"><div class="eyebrow">DNES V KALENDÁŘI</div>${x.calendar.slice(0,5).map(v=>`<div class="row"><span>${h(title(v))}</span><b>${h(time(v))}</b></div>`).join('')}</div>`:'';
 const follow=x.followups.length?`<div class="card"><div class="eyebrow">FOLLOW-UP</div>${x.followups.slice(0,5).map(v=>`<div class="row"><span>${h(title(v))}</span><b>${h(v.when||'dnes')}</b></div>`).join('')}</div>`:'';
 const primary=x.primary?`<div class="decision-note"><b>Začni tímhle:</b> ${h(x.primary.title)}</div>`:'<div class="decision-note"><b>Nic důležitého teď nehoří.</b></div>';
 return modal('Ranní přehled',`<p class="muted">${h(x.summary)}</p>${primary}${cal}${follow}`,[{label:'Jdu na to',value:null,primary:true}]);
}
