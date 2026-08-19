import {store} from './state.js';
import {h,money,date,dayDiff,qs,qsa} from './utils.js';
import {recommendation,signals,feedback,attentionCount,netWorth,ticketStatus} from './intelligence.js';

const eventStart=e=>e?.start||e?.startTime||e?.date||e?.begin||e?.dtstart||null;
const activeProjects=s=>(s.projects||[]).filter(x=>!/hotov|archiv/i.test(x.status||''));
const openTasks=s=>(s.tasks||[]).filter(x=>x.status!=='HOTOVO').sort((a,b)=>{
 const ad=a.due?new Date(a.due).getTime():Infinity,bd=b.due?new Date(b.due).getTime():Infinity;
 return ad-bd;
});

function navigate(target){
 if(['today','work','money','tickets','more'].includes(target))window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:target}));
 else{window.dispatchEvent(new CustomEvent('kamil:more',{detail:target}));window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:'more'}))}
}
function taskMeta(t){
 if(!t.due)return h(t.area||'Bez termínu');
 const d=dayDiff(t.due),label=d<0?`po termínu ${Math.abs(d)} d`:d===0?'dnes':d===1?'zítra':`za ${d} d`;
 return `${h(t.area||'Úkol')} · ${label}`;
}
function eventMeta(e){
 const start=eventStart(e);if(!start)return h(e.location||e.source||'Kalendář');
 const d=new Date(start);
 const time=Number.isNaN(d.getTime())?'':d.toLocaleTimeString('cs-CZ',{hour:'2-digit',minute:'2-digit'});
 return `${date(start)}${time?' · '+time:''}${e.location?' · '+h(e.location):''}`;
}

export function renderToday(){
 const s=store.get(),rec=recommendation(s),sig=signals(s),nw=netWorth(s);
 const tasks=openTasks(s),urgentTasks=tasks.filter(x=>x.due&&dayDiff(x.due)<=1).slice(0,5);
 const projects=activeProjects(s).slice(0,4);
 const events=[...(s.calendar?.events||[])].filter(e=>{const v=eventStart(e);return !v||new Date(v).getTime()>=Date.now()-3600000}).sort((a,b)=>new Date(eventStart(a)||'9999')-new Date(eventStart(b)||'9999')).slice(0,5);
 const tickets=[...(s.ticketBook?.items||[])].map(x=>({x,st:ticketStatus(x)})).filter(y=>y.st.score>=60).sort((a,b)=>b.st.score-a.st.score).slice(0,4);
 const doneToday=(s.audit||[]).filter(x=>x.label?.startsWith('Hotovo')&&new Date(x.at).toDateString()===new Date().toDateString()).length;
 const inbox=(s.inbox||[]).filter(x=>x.status!=='DONE').length;
 const nextSignals=sig.slice(1,4);

 qs('#todayView').innerHTML=`
  <div class="hero">
    <div class="eyebrow">PRIORITA PRÁVĚ TEĎ · ${h(rec.type)}</div>
    <div class="hero-title">${h(rec.title)}</div>
    <div class="rec-reason"><b>${h(rec.reason)}</b>${rec.impact?`<br><span class="muted">${h(rec.impact)}</span>`:''}</div>
    <div class="feedback"><button class="btn primary" id="focusOpen">Vyřešit teď</button><button class="btn" id="focusGood">Sedí</button><button class="btn" id="focusBad">Nesedí</button></div>
  </div>

  <div class="grid" style="margin-bottom:14px">
    <div class="kpi"><div class="l">Kritické / dnes</div><div class="v ${urgentTasks.length?'bad':'good'}">${urgentTasks.length}</div></div>
    <div class="kpi"><div class="l">Hotovo dnes</div><div class="v">${doneToday}</div></div>
    <div class="kpi"><div class="l">Potřebuje pozornost</div><div class="v">${attentionCount(s)}</div></div>
  </div>

  <div class="grid two">
    <div class="card">
      <div class="eyebrow">DNES A PO TERMÍNU</div>
      ${urgentTasks.map(t=>`<div class="row"><div><b>${h(t.title)}</b><div class="muted">${taskMeta(t)}</div></div><div class="row-actions"><button class="btn primary" data-today-done="${t.id}">Hotovo</button><button class="btn" data-today-tomorrow="${t.id}">Zítra</button></div></div>`).join('')||'<div class="empty">Nic nehoří. Můžeš řešit další krok.</div>'}
      ${tasks.length>urgentTasks.length?`<button class="btn" data-nav="work" style="margin-top:10px">Všechny úkoly · ${tasks.length}</button>`:''}
    </div>
    <div class="card">
      <div class="eyebrow">KALENDÁŘ</div>
      ${events.map(e=>`<div class="row"><div><b>${h(e.title||e.summary||'Událost')}</b><div class="muted">${eventMeta(e)}</div></div></div>`).join('')||'<div class="empty">V kalendáři teď nic dalšího nevidím.</div>'}
    </div>
  </div>

  <div class="grid" style="margin-top:2px">
    <div class="card">
      <div class="eyebrow">PENÍZE</div>
      <div class="row"><span>Hotovost</span><b>${money(nw.cash)}</b></div>
      <div class="row"><span>XTB</span><b>${money(nw.xtb)}</b></div>
      <div class="row"><span>Dluží ti</span><b>${money(nw.debts)}</b></div>
      <button class="btn" data-nav="money" style="margin-top:8px">Otevřít finance</button>
    </div>
    <div class="card">
      <div class="eyebrow">VSTUPENKY K ŘEŠENÍ</div>
      ${tickets.map(({x,st})=>`<div class="row"><div><b>${h(x.name)}</b><div class="muted">${date(x.date)} · ${h(st.label)}</div></div><span class="status ${st.score>=85?'bad':'warn'}">${st.score}</span></div>`).join('')||'<div class="empty">U vstupenek nic akutního.</div>'}
      <button class="btn" data-nav="tickets" style="margin-top:8px">Otevřít vstupenky</button>
    </div>
    <div class="card">
      <div class="eyebrow">AKTIVNÍ PROJEKTY</div>
      ${projects.map(p=>`<div class="row"><div><b>${h(p.name)}</b><div class="muted">${h(p.next||'Chybí další krok')}</div></div></div>`).join('')||'<div class="empty">Žádný aktivní projekt.</div>'}
      <button class="btn" data-nav="work" style="margin-top:8px">Otevřít práci</button>
    </div>
  </div>

  ${nextSignals.length||inbox?`<div class="card" style="margin-top:2px"><div class="eyebrow">RADAR</div>${nextSignals.map(x=>`<div class="row"><div><b>${h(x.title)}</b><div class="muted">${h(x.type)} · ${h(x.reason)}</div></div><span class="status ${x.score>=85?'bad':x.score>=65?'warn':'good'}">${x.score}</span></div>`).join('')}${inbox?`<div class="row"><div><b>Inbox</b><div class="muted">${inbox} položek čeká na rozhodnutí</div></div><button class="btn" data-more-nav="inbox">Projít</button></div>`:''}</div>`:''}
 `;

 qs('#focusOpen').onclick=()=>navigate(rec.target||'work');
 qs('#focusGood').onclick=()=>store.mutate('Doporučení užitečné',x=>feedback(x,rec.type,1),{undo:false});
 qs('#focusBad').onclick=()=>store.mutate('Doporučení neužitečné',x=>feedback(x,rec.type,-1),{undo:false});
 qsa('[data-nav]',qs('#todayView')).forEach(b=>b.onclick=()=>navigate(b.dataset.nav));
 qsa('[data-more-nav]',qs('#todayView')).forEach(b=>b.onclick=()=>navigate(b.dataset.moreNav));
 qsa('[data-today-done]',qs('#todayView')).forEach(b=>b.onclick=()=>store.mutate('Hotovo: úkol',x=>{const t=x.tasks.find(y=>y.id===b.dataset.todayDone);if(t){t.status='HOTOVO';t.updatedAt=new Date().toISOString()}}));
 qsa('[data-today-tomorrow]',qs('#todayView')).forEach(b=>b.onclick=()=>store.mutate('Úkol přesunut na zítra',x=>{const t=x.tasks.find(y=>y.id===b.dataset.todayTomorrow);if(t){const d=new Date();d.setDate(d.getDate()+1);d.setHours(9,0,0,0);t.due=d.toISOString();t.updatedAt=new Date().toISOString()}}));
}
