import {store} from './state.js';
import {renewalRadar} from './renewalRadar26.js';
import {h,date,qs,qsa} from './utils.js';

const tone=p=>Number(p)>=90?'bad':Number(p)>=75?'warn':'good';
const spend=a=>Object.entries(a||{}).map(([c,v])=>`${c} ${Math.round(Number(v)||0).toLocaleString('cs-CZ')}/rok`).join(' · ')||'žádný známý roční spend právě není v kontrolní frontě';
const fmt=(v,c)=>v===null||v===undefined?'—':`${Math.round(Number(v)||0).toLocaleString('cs-CZ')} ${h(c||'CZK')}/rok`;

function openHome(mode='contracts'){
 window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:'home'}));
 queueMicrotask(()=>window.dispatchEvent(new CustomEvent('kamil:home-open',{detail:mode})));
}

function render(){
 const host=qs('#renewalRadar26Host');if(!host)return;
 const r=renewalRadar(store.get());
 host.innerHTML=`<div class="card-head"><div><div class="eyebrow">SMLOUVY / K PROVĚŘENÍ</div><h2>Co rozhodnout před prodloužením</h2></div><button class="btn" id="renewalOpenContracts26">Smlouvy</button></div>
 <div class="metric-strip"><div class="metric"><span>Rozhodnout / prověřit</span><b class="${r.actionable?'warn':'good'}">${r.actionable}</b></div><div class="metric"><span>Okno do 30 dní</span><b>${r.due30}</b></div><div class="metric"><span>Chybí smluvní okno</span><b class="${r.dataGaps?'warn':'good'}">${r.dataGaps}</b></div><div class="metric"><span>Více závazků u stejného poskytovatele</span><b>${r.providerGroups}</b></div></div>
 <div class="decision-note"><b>Známý roční spend k prověření:</b> ${h(spend(r.reviewSpendByCurrency))}. Není to odhad úspory — jen částka, kterou má smysl před prodloužením zkontrolovat.</div>
 <div>${r.top.slice(0,6).map(x=>`<div class="intel-row"><div class="intel-main"><b>${h(x.title)}</b><span>${h(x.action)} · ${h(x.reason)}</span><small>${fmt(x.annualSpend,x.currency)} · výpověď ${x.noticeDate?date(x.noticeDate):'—'} · výročí ${x.renewalDate||x.endDate?date(x.renewalDate||x.endDate):'—'} · ${h(x.source)}</small></div><div class="row-actions"><span class="status ${tone(x.priority)}">${h(x.stateLabel)}</span><button class="btn" data-renewal-open="${h(x.homeMode)}">Otevřít</button></div></div>`).join('')||'<div class="empty success-empty">Žádná uložená smlouva teď nepotřebuje kontrolu.</div>'}</div>
 <div class="decision-note">${h(r.note)}</div>`;
 qs('#renewalOpenContracts26')?.addEventListener('click',()=>openHome('contracts'));
 qsa('[data-renewal-open]',host).forEach(b=>b.onclick=()=>openHome(b.dataset.renewalOpen||'contracts'));
}

function mount(){
 const home=qs('#homeView'),grid=home?.querySelector('.personal26-grid');
 if(!home||!grid||qs('#renewalRadar26Host'))return;
 const host=document.createElement('div');host.id='renewalRadar26Host';host.className='card';
 grid.parentNode.insertBefore(host,grid);render();
}

store.subscribe(()=>{if(qs('#renewalRadar26Host'))render()});
new MutationObserver(()=>queueMicrotask(mount)).observe(document.body,{childList:true,subtree:true});
mount();
