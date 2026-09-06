const VERSION='696.0.0';
const A=v=>Array.isArray(v)?v:[];
const N=v=>Number.isFinite(Number(v))?Number(v):0;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=v=>`${Math.round(N(v)).toLocaleString('cs-CZ')} Kč`;
let timer=0;

function ensureCss(){
 if(document.querySelector('link[data-today696-css]'))return;
 const l=document.createElement('link');l.rel='stylesheet';l.href='./todayPriority696.css';l.dataset.today696Css='1';document.head.appendChild(l);
}
function nav(view,focus=''){
 window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:view}));
 if(focus)for(const ms of [80,300,700])setTimeout(()=>window.dispatchEvent(new CustomEvent('kamil:focus610',{detail:{target:view,focus}})),ms);
}
function classify(x){
 const title=String(x?.title||'').toUpperCase(),kind=String(x?.kind||'').toUpperCase(),score=N(x?.score);
 if(score>=200||/PRODAT|ZLEVNIT|ODPOV|ZAPLAT|TERMÍN|URGENT/.test(title))return'now';
 if(kind==='SÁZKY'||/KOUPIT/.test(title)||kind==='REALITY')return'opportunity';
 return'today';
}
function opportunityRows(m,used){
 const out=[];
 for(const x of A(m?.actions)){if(classify(x)==='opportunity'&&!used.has(x.title))out.push(x)}
 const bet=A(m?.betting?.bet)[0];
 if(bet)out.push({kind:'SÁZKY',title:`VSADIT · ${bet.title||'value tip'}`,reason:bet.why||`score ${N(bet.score)}/100`,view:'betting',focus:'betting-hub'});
 const buy=A(m?.safeBuys)[0];
 if(buy)out.push({kind:'VSTUPENKY',title:`KOUPIT · ${buy.name||buy.event_name||'ticket'}`,reason:`safe max ${money(buy.netSafeMaxBuyPrice||buy.maxBuyPrice)}`,view:'tickets',focus:'ticket-hub'});
 const p=m?.property?.best;
 if(p&&['BUY','NEGOTIATE'].includes(String(p?.decision?.code||'')))out.push({kind:'REALITY',title:`${p.decision.code==='BUY'?'POKRAČOVAT':'VYJEDNÁVAT'} · ${p.name}`,reason:`Deal Score ${N(p.score)}/100 · ${p.decision.reason||''}`,view:'money',focus:'property-hub'});
 const seen=new Set();return out.filter(x=>{const k=String(x.title||'').toLowerCase();if(!k||seen.has(k)||used.has(x.title))return false;seen.add(k);return true}).slice(0,2);
}
function row(x,tone=''){
 return `<button type="button" class="today696-row ${tone}" data-696-view="${esc(x.view||'today')}" data-696-focus="${esc(x.focus||'')}"><span class="today696-kind">${esc(x.kind||'OS')}</span><span class="today696-copy"><b>${esc(x.title||'Akce')}</b><small>${esc(x.reason||'')}</small></span><span class="today696-arrow">→</span></button>`;
}
function html(m){
 const actions=A(m?.actions),now=actions.filter(x=>classify(x)==='now').slice(0,1),used=new Set(now.map(x=>x.title)),today=actions.filter(x=>classify(x)==='today'&&!used.has(x.title)).slice(0,3),opp=opportunityRows(m,used),waiting=N(m?.daily?.waitingCount),next7=N(m?.daily?.next7Count),urgent=N(m?.inbox?.counts?.urgent),cash=m?.capital?.cashKnown?money(m.capital.cash):'nezadaný';
 return `<section class="today696" data-today-priority696>
 <header class="today696-head"><div><small>OS696 · PRIORITY COCKPIT</small><h2>Co řešit dál</h2><p>Povinnosti oddělené od příležitostí. OS ti neplete „musím“ a „mohl bych“ do jednoho seznamu.</p></div><span class="today696-live">LIVE</span></header>
 <div class="today696-meta"><div><span>Čekám</span><b>${waiting}</b></div><div><span>Do 7 dní</span><b>${next7}</b></div><div><span>Urgent inbox</span><b>${urgent}</b></div><div><span>Volný cash</span><b>${esc(cash)}</b></div></div>
 <div class="today696-grid">
  <section class="today696-lane now"><div class="today696-lanehead"><span>TEĎ</span><small>nejvyšší priorita</small></div>${now.length?now.map(x=>row(x,'hot')).join(''):'<div class="today696-empty">Nic kritického teď nehoří.</div>'}</section>
  <section class="today696-lane today"><div class="today696-lanehead"><span>DNES</span><small>udělej potom</small></div>${today.length?today.map(x=>row(x)).join(''):'<div class="today696-empty">Žádná další povinná akce.</div>'}</section>
  <section class="today696-lane waiting"><div class="today696-lanehead"><span>ČEKÁ</span><small>nemusíš kontrolovat ručně</small></div><button type="button" class="today696-row" data-696-view="inbox" data-696-focus="inbox-waiting"><span class="today696-kind">ČEKÁM</span><span class="today696-copy"><b>${waiting} věcí čeká na druhou stranu</b><small>${waiting?'Otevři jen pokud chceš zkontrolovat follow-upy.':'Nic není blokované čekáním.'}</small></span><span class="today696-arrow">→</span></button></section>
  <section class="today696-lane opportunity"><div class="today696-lanehead"><span>PŘÍLEŽITOST</span><small>není povinnost</small></div>${opp.length?opp.map(x=>row(x,'good')).join(''):'<div class="today696-empty">Teď není žádná silná příležitost.</div>'}</section>
 </div></section>`;
}
function bind(root){root.querySelectorAll('[data-696-view]').forEach(b=>b.addEventListener('click',()=>nav(b.dataset['696View'],b.dataset['696Focus'])))}
export function refreshTodayPriority696(){
 clearTimeout(timer);timer=setTimeout(()=>{
  ensureCss();const hub=window.__KAMIL_TODAY_HUB650__,m=hub?.model;if(!m)return;
  const host=document.querySelector('#todayView .dashboard110')||document.querySelector('#todayView .ux65-today')||document.querySelector('#todayView');if(!host)return;
  const wrap=document.createElement('div');wrap.innerHTML=html(m);const next=wrap.firstElementChild,old=host.querySelector('[data-today-priority696]');if(old)old.replaceWith(next);else{const legacy=host.querySelector('[data-today-hub650]');legacy?.insertAdjacentElement('beforebegin',next);if(!next.isConnected)host.prepend(next)}
  const legacy=host.querySelector('[data-today-hub650]');if(legacy)legacy.hidden=true;
  bind(next);window.__KAMIL_TODAY_PRIORITY696__={version:VERSION,healthy:true,model:m,refresh:refreshTodayPriority696,at:Date.now()};document.documentElement.dataset.todayPriority696='1';
 },40);
}
export function appendTodayPriority696(){refreshTodayPriority696();for(const ms of [120,400,900])setTimeout(refreshTodayPriority696,ms);return true}
