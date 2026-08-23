import {store} from './state.js';
import {h,modal} from './utils.js';
import {personalDailyAssistant650,personalWaitingCenter650} from './personalAssistant650.js';

const DAY=86400000;
const WORK_RE=/zak[aá]zk|faktur|dodavat|cest[aá]k|doch[aá]zk|ředitel|reditel|pks|cpi|zbrojov|pracovn|xtb|ticket|vstupenk/i;
const todayStart=()=>{const d=new Date();d.setHours(0,0,0,0);return d.getTime()};
const at=x=>Date.parse(x?.completedAt||x?.at||x?.createdAt||x?.updatedAt||'');
const personalText=x=>String(x?.reason||x?.title||x?.action||x?.name||'');
const doneToday=s=>{
 const ids=new Set();
 for(const x of [...(s.tasks||[]),...(s.personalAdmin?.items||[]),...(s.delegations||[])]){
  const t=at(x);if(String(x?.status||'').toUpperCase()==='DONE'&&Number.isFinite(t)&&t>=todayStart()&&!WORK_RE.test(personalText(x)))ids.add(String(x.id||x.title||x.name));
 }
 for(const x of (s.audit||[])){
  const t=at(x),txt=personalText(x);if(Number.isFinite(t)&&t>=todayStart()&&!WORK_RE.test(txt)&&/dokončen|hotovo|uzavřen/i.test(txt))ids.add(`audit:${txt}`);
 }
 return ids.size;
};
const eventLabel=x=>x.title||x.summary||'Událost';

export function personalDailyRhythm651(s=store.get()){
 const d=personalDailyAssistant650(s),w=personalWaitingCenter650(s),done=doneToday(s),hour=new Date().getHours();
 const urgent=d.top.filter(x=>x.score>=90).slice(0,3),tomorrow=d.tomorrow.slice(0,5),followups=w.rows.filter(x=>x.days!==null&&x.days<=1).slice(0,5);
 const mode=hour<11?'morning':hour>=18?'evening':'day';
 const summary=mode==='evening'
  ?(urgent.length?`Dnes má ještě smysl vyřešit ${urgent.length===1?'jednu důležitou věc':`${urgent.length} důležité věci`}.`:'Dnešek můžeš klidně uzavřít.')
  :(d.primary?`Nejdůležitější teď: ${d.primary.title}.`:'Nic osobního teď nehoří.');
 return{mode,done,urgent,tomorrow,followups,summary};
}

export async function openDailyClose651(){
 const x=personalDailyRhythm651(store.get());
 const list=(rows,label)=>rows.length?`<div class="card"><div class="eyebrow">${h(label)}</div>${rows.map(v=>`<div class="row"><span>${h(v.title||eventLabel(v))}</span></div>`).join('')}</div>`:'';
 const body=`<div class="metric-strip"><div class="metric"><span>Dnes hotovo</span><b>${x.done}</b></div><div class="metric"><span>Ještě důležité</span><b>${x.urgent.length}</b></div><div class="metric"><span>Zítra</span><b>${x.tomorrow.length}</b></div><div class="metric"><span>Follow-up do zítřka</span><b>${x.followups.length}</b></div></div><div class="decision-note"><b>${h(x.summary)}</b></div>${list(x.urgent,'JEŠTĚ DNES')}${list(x.tomorrow,'ZÍTRA')}${list(x.followups,'FOLLOW-UP')}`;
 return modal('Uzavření dne',body,[{label:'Hotovo',value:null,primary:true}]);
}
