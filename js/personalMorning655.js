import {store} from './state.js';
import {modal,h} from './utils.js';
import {personalDailyAssistant650,personalWaitingCenter650} from './personalAssistant650.js';

const DAY=86400000;
const WORK_RE=/zak[aá]zk|faktur|dodavat|cest[aá]k|doch[aá]zk|ředitel|reditel|pks|cpi|zbrojov|projektov[aá] karta|pracovn|xtb|ticket|vstupenk/i;
const text=x=>`${x?.title||''} ${x?.name||''} ${x?.summary||''} ${x?.category||''} ${x?.area||''}`;
const personal=x=>!WORK_RE.test(text(x));
const daysTo=v=>{const t=Date.parse(v||'');return Number.isFinite(t)?Math.ceil((t-Date.now())/DAY):null};
const title=x=>x.title||x.name||x.summary||'Událost';
const time=x=>{const t=Date.parse(x.start||x.date||x.when||'');return Number.isFinite(t)?new Date(t).toLocaleTimeString('cs-CZ',{hour:'2-digit',minute:'2-digit'}):''};

export function personalMorningLaunch655(s=store.get()){
 const d=personalDailyAssistant650(s),w=personalWaitingCenter650(s);
 const calendar=(s.calendar?.events||[]).filter(personal).map(x=>({...x,d:daysTo(x.start||x.date||x.when)})).filter(x=>x.d===0).sort((a,b)=>Date.parse(a.start||a.date||a.when||'')-Date.parse(b.start||b.date||b.when||''));
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
