import {store} from './state.js';
import {personalRiskCenter} from './personalRisk25.js';
import {h,date,qs} from './utils.js';

const tileId='personalRisk25Tile';
const tone=s=>s==='CRITICAL'?'bad':s==='HIGH'||s==='MEDIUM'?'warn':'good';

function ensureTile(){
 const view=qs('#moreView'),grid=view?.querySelector('.more24-grid');if(!grid||qs(`#${tileId}`,view))return;
 const a=personalRiskCenter(store.get());
 const b=document.createElement('button');b.id=tileId;b.className='hub-tile';
 b.innerHTML=`<span class="hub-icon ${a.critical?'bad':a.high?'warn':'good'}">!</span><span class="hub-copy"><b>Osobní rizika</b><small>${a.total?`${a.total} signálů · skóre ${a.score}/100`:'Pojistky, platby, doklady a domov'}</small></span><span class="hub-arrow">→</span>`;
 b.onclick=renderRisk;grid.prepend(b);
}

function renderRisk(){
 const view=qs('#moreView'),a=personalRiskCenter(store.get());if(!view)return;
 view.innerHTML=`<div class="subview-bar"><button class="btn" id="riskBack25">← Zpět</button><div><span>VÍCE</span><b>Osobní rizika</b></div></div>
 <div class="view-head compact"><div><div class="eyebrow">PERSONAL RISK / 25.18</div><h1>Co může osobně propadnout nebo stát peníze</h1><p>Jedna fronta přes pojistky, platby, doklady a domácí povinnosti.</p></div><div class="view-head-stat"><b class="${a.critical?'bad':a.high?'warn':'good'}">${a.score}</b><span>risk score / 100</span></div></div>
 <div class="metric-strip"><div class="metric"><span>Kritické</span><b class="${a.critical?'bad':'good'}">${a.critical}</b></div><div class="metric"><span>Vysoké</span><b class="${a.high?'warn':'good'}">${a.high}</b></div><div class="metric"><span>Finanční</span><b>${a.financial}</b></div><div class="metric"><span>Administrativní</span><b>${a.admin}</b></div></div>
 <div class="card"><div class="card-head"><div><div class="eyebrow">PRIORITNÍ FRONTA</div><h2>Řešit od největšího rizika</h2></div></div><div class="intel-list">${a.items.map(x=>`<div class="intel-row"><div class="intel-main"><div><span class="status ${tone(x.severity)}">${h(x.severityLabel)} · ${h(x.domains.join(' / '))}</span>${x.financial?' <span class="status warn">FINANČNÍ DOPAD</span>':''}</div><b>${h(x.title)}</b><span>${h((x.reasons||[]).join(' · ')||x.reason||'Vyžaduje kontrolu')}</span><small>${x.detail?h(x.detail)+' · ':''}${x.date?'termín '+date(x.date):'bez evidovaného termínu'} · pravidlové skóre ${x.priority}/100</small></div></div>`).join('')||'<div class="empty">Z uložených osobních dat teď nevychází žádné zvýšené riziko.</div>'}</div><div class="decision-note">${h(a.note)} Duplicitní signály ke stejné osobní položce se slučují, aby jedna věc nenafukovala frontu několikrát.</div></div>`;
 qs('#riskBack25').onclick=()=>window.dispatchEvent(new CustomEvent('kamil:more',{detail:'menu'}));
}

const start=()=>{const view=qs('#moreView');if(!view)return;new MutationObserver(()=>queueMicrotask(ensureTile)).observe(view,{childList:true,subtree:true});ensureTile()};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
