import {store} from './state.js';
import {h,qs} from './utils.js';
import {session} from './cloud.js';
import {loadTicketCloud660} from './ticketCloud660.js';
import {ensurePersonalVault640} from './personalVault640.js';
import {openPersonalAction641} from './personalActionExecution641.js';
import {personalDailyAssistant650,personalActionCta650} from './personalAssistant650.js';
import {openPersonalWaiting650} from './personalWaiting650.js';
import {personalDailyRhythm651,openDailyClose651} from './personalDailyRhythm651.js';
import {openPersonalTomorrow653,openPersonalNext7Days653} from './personalTomorrow653.js';
import {personalMorningLaunch655,openMorningLaunch655} from './personalMorning655.js';
import {appendTicketBriefing660} from './personalTicketBriefing660.js';

const LAST_SEEN_KEY='kamil-os-68-last-seen-today';
const hour=()=>new Date().getHours();
const greeting=()=>hour()<11?'Dobré ráno.':hour()<18?'Dobré odpoledne.':'Dobrý večer.';
const badge=x=>x?.level==='critical'?'DŮLEŽITÉ':x?.level==='high'?'BRZY':x?.level==='medium'?'HLÍDAT':'POZDĚJI';
const titleOf=x=>x.title||x.name||x.summary||'Osobní věc';
const primaryHtml=x=>`<article class="ux65-primary ux64-${h(x.level)}"><div class="ux64-action-top"><span class="ux66-rank">1</span><span class="ux64-badge">${badge(x)}</span><span class="ux64-time">${h(String(x.minutes||5))} min</span></div><h2>${h(x.title)}</h2><p>${h(x.why)}</p><div class="ux64-next">${h(x.next)}</div><button class="btn primary" data-ux65-action="${h(x.id)}">${h(x.cta||personalActionCta650(x))}</button></article>`;
const secondaryHtml=(x,i)=>`<article class="ux66-secondary-card ux64-${h(x.level)}"><div class="ux64-action-top"><span class="ux66-rank">${i+2}</span><span class="ux64-badge">${badge(x)}</span><span class="ux64-time">${h(String(x.minutes||5))} min</span></div><h3>${h(x.title)}</h3><p>${h(x.why)}</p><button class="btn" data-ux65-action="${h(x.id)}">${h(x.cta||personalActionCta650(x))}</button></article>`;
const tomorrowPreview=rows=>rows.length?`<section class="card ux65-night-handoff"><div class="eyebrow">ZÍTRA</div>${rows.slice(0,2).map(x=>`<div class="row"><span>${h(titleOf(x))}</span><b>${h(x.sourceKind==='calendar'?'Kalendář':x.sourceKind==='admin'?'Administrativa':'Úkol')}</b></div>`).join('')}<button class="btn" data-tomorrow-open>Otevřít zítřek</button></section>`:'';
const morningPreview=x=>`<section class="card ux65-morning-launch"><div class="eyebrow">START DNE</div><div class="row"><span>Dnes v kalendáři</span><b>${x.calendar.length}</b></div><div class="row"><span>Follow-up dnes / po termínu</span><b>${x.followups.length}</b></div><button class="btn" data-morning-open>Ranní přehled</button></section>`;
const healthPill=(tone,label,detail)=>`<span class="os684-pill ${tone}"><i></i><b>${h(label)}</b><small>${h(detail)}</small></span>`;
function changesSince685(s){
 let since=Date.now()-864e5;try{const saved=Number(localStorage.getItem(LAST_SEEN_KEY)||0);if(saved)since=saved}catch{}
 const out=[],seen=new Set();for(const x of s.audit||[]){const at=Date.parse(x?.at||'');if(!at||at<=since)continue;const label=String(x?.label||'').trim();if(!label||seen.has(label))continue;seen.add(label);out.push({label,at});if(out.length>=3)break}return out;
}
function changesHtml685(rows){if(!rows.length)return'';return `<section class="card os685-changes"><div class="eyebrow">CO SE ZMĚNILO OD MINULA</div><div class="os685-change-list">${rows.map(x=>`<div class="row"><span>${h(x.label)}</span><small>${new Date(x.at).toLocaleTimeString('cs-CZ',{hour:'2-digit',minute:'2-digit'})}</small></div>`).join('')}</div></section>`}
async function appendSystemHealth684(host){
 try{
  const [sess,cloud,vr]=await Promise.all([session(),loadTicketCloud660(),fetch('/api/viagogo-official',{cache:'no-store'}).then(r=>r.json()).catch(()=>({configured:false}))]);
  const latest=cloud?.snapshots?.[0]?.checked_at||null,age=latest?Math.max(0,(Date.now()-Date.parse(latest))/36e5):null;
  const cloudP=sess?healthPill('ok','Cloud','připojen'):healthPill('bad','Cloud','odpojen');
  const ticketP=age==null?healthPill('warn','Tržní data','bez kontroly'):age>24?healthPill('warn','Tržní data',`${Math.round(age)} h stará`):healthPill('ok','Tržní data',age<1?'čerstvá':`${Math.round(age)} h`);
  const vgP=vr?.configured?healthPill('ok','Viagogo API','připojeno'):healthPill('warn','Viagogo API','nepřipojeno');
  const wrap=document.createElement('section');wrap.className='card os684-health';wrap.innerHTML=`<div class="os684-head"><div><div class="eyebrow">STAV OS</div><b>Datové zdroje</b></div><button class="btn" data-os684-tickets>Vstupenky</button></div><div class="os684-pills">${cloudP}${ticketP}${vgP}</div>`;
  host.querySelector('.ux65-today')?.appendChild(wrap);wrap.querySelector('[data-os684-tickets]')?.addEventListener('click',()=>window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:'tickets'})));
 }catch{}
}

export function renderPersonalToday640(){
 ensurePersonalVault640();const s=store.get(),d=personalDailyAssistant650(s),rhythm=personalDailyRhythm651(s),morningData=personalMorningLaunch655(s),host=qs('#todayView');if(!host)return;
 const changes=changesSince685(s),late=rhythm.mode==='late',morning=rhythm.mode==='morning',primary=late?(rhythm.urgent[0]||null):d.primary,secondary=late?rhythm.urgent.slice(1,3):d.secondary;
 const headline=late?rhythm.summary:d.headline;
 const quick=late?`<section class="ux65-quick"><button class="btn primary" data-daily-close>Uzavřít den</button></section>`:morning?`<section class="ux65-quick"><button class="btn primary" data-morning-open>Ranní přehled</button></section>`:`<section class="ux65-quick ux66-quick"><button class="btn" data-ask="Co mám dnes řešit?">Co dnes řešit?</button><button class="btn" data-ask="Co mi končí?">Co mi končí?</button><button class="btn" data-ask="Na co čekám?">Na co čekám?</button><button class="btn" data-daily-close>${rhythm.mode==='evening'?'Uzavřít den':'Denní přehled'}</button></section>`;
 host.innerHTML=`<div class="ux64-page ux65-today"><section class="ux64-hero ux65-hero ux66-hero"><div class="eyebrow">DNES · TOP 3</div><h1>${greeting()}</h1><p>${h(headline)}</p></section>
 ${changesHtml685(changes)}
 ${primary?`<section class="ux66-priority"><div class="ux66-section-label">NEJDŘÍV</div>${primaryHtml(primary)}</section>`:`<section class="card ux64-clear ux66-clear"><b>${late?'Dnešek můžeš uzavřít.':'Všechno důležité je teď v pořádku.'}</b><p class="muted">${late?'Neurgentní věci nechávám na zítřek.':'Nemusíš nic spravovat jen proto, že je appka otevřená.'}</p></section>`}
 ${secondary.length?`<section><div class="ux66-section-label">PAK</div><div class="ux66-secondary-grid">${secondary.map(secondaryHtml).join('')}</div></section>`:''}
 ${late?tomorrowPreview(d.tomorrow):morning?morningPreview(morningData):''}
 <section class="ux65-context ux66-context"><button class="ux65-chip ux66-waiting" data-waiting-open><b>${d.waitingCount}</b><span>Čekám na odpověď</span></button><button class="ux65-chip ux66-tomorrow" data-tomorrow-open><b>${d.tomorrowCount}</b><span>Zítra</span></button><button class="ux65-chip ux66-week" data-next7-open><b>${d.next7Count}</b><span>Do 7 dní</span></button><button class="ux65-chip ux66-done" data-daily-close><b>${rhythm.done}</b><span>Dnes hotovo</span></button></section>${quick}</div>`;
 host.querySelector('[data-waiting-open]')?.addEventListener('click',()=>openPersonalWaiting650());
 host.querySelectorAll('[data-tomorrow-open]').forEach(b=>b.addEventListener('click',()=>openPersonalTomorrow653()));
 host.querySelector('[data-next7-open]')?.addEventListener('click',()=>openPersonalNext7Days653());
 host.querySelectorAll('[data-daily-close]').forEach(b=>b.addEventListener('click',()=>openDailyClose651()));
 host.querySelectorAll('[data-morning-open]').forEach(b=>b.addEventListener('click',()=>openMorningLaunch655()));
 host.querySelectorAll('[data-ask]').forEach(b=>b.addEventListener('click',()=>{const input=qs('#commandInput');if(input){input.value=b.dataset.ask;input.focus();qs('#commandGo')?.click()}}));
 host.querySelectorAll('[data-ux65-action]').forEach(b=>b.addEventListener('click',async()=>{const fresh=personalDailyAssistant650(store.get()).top.find(x=>x.id===b.dataset.ux65Action);if(!fresh)return;await openPersonalAction641(fresh);renderPersonalToday640()}));
 if(morning)appendTicketBriefing660(host).catch(()=>null);appendSystemHealth684(host);setTimeout(()=>{try{localStorage.setItem(LAST_SEEN_KEY,String(Date.now()))}catch{}},1200);
 if(typeof window!=='undefined')window.__KAMIL_PERSONAL_UX_660_LAST__={at:Date.now(),view:'today',primary:primary?.title||null,secondary:secondary.map(x=>x.title),waiting:d.waitingCount,tomorrow:d.tomorrowCount,next7:d.next7Count,doneToday:rhythm.done,mode:rhythm.mode,lateCalm:late&&!primary,nightHandoff:late,morningLaunch:morning,morningCalendar:morningData.calendar.length,morningFollowups:morningData.followups.length,ticketBriefing:'critical-only',topThree:true,systemHealth:true,changesSinceLastVisit:changes.length};
}
