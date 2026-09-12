import {store} from './state.js';

const VERSION='737.0.1';
const money=v=>`${Math.round(Number(v||0)).toLocaleString('cs-CZ')} Kč`;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function appendPersonalDebtSummary737(){
 const host=document.querySelector('#moneyView .ux64-page')||document.querySelector('#moneyView');if(!host)return false;
 const book=store.get()?.debtBook||{},items=Array.isArray(book.items)?book.items:[],review=Array.isArray(book.review)?book.review:[];
 let box=host.querySelector('[data-debt737]');if(!box){box=document.createElement('section');box.dataset.debt737='1';box.className='card money-section';box.dataset.moneyGroup='wealth';const cockpit=host.querySelector('[data-money-group="wealth"]');cockpit?.insertAdjacentElement('afterend',box);if(!box.isConnected)host.appendChild(box)}
 const confirmed=items.filter(x=>x.direction==='OWED_TO_ME'&&x.status==='OPEN'&&Number(x.amountCzk)>0),reviewItems=items.filter(x=>x.direction==='OWED_TO_ME'&&x.status==='REVIEW'&&Number(x.amountCzk)>0),confirmedTotal=confirmed.reduce((a,x)=>a+Number(x.amountCzk||0),0),reviewMinimum=reviewItems.reduce((a,x)=>a+Number(x.amountCzk||0),0);
 box.innerHTML=`<div class="eyebrow">POHLEDÁVKY</div><div class="row"><span>Potvrzené částky, které ti mají vrátit</span><b>${money(confirmedTotal)}</b></div>${confirmed.map(x=>`<div class="row"><span>${esc(x.person||'Neurčeno')}<small class="muted">${x.note?` · ${esc(x.note)}`:''}</small></span><b>${money(x.amountCzk)}</b></div>`).join('')}${reviewItems.length?`<div class="row"><span>Částky k ověření / minimum</span><b>${money(reviewMinimum)}</b></div>${reviewItems.map(x=>`<div class="row"><span>${esc(x.person||'Neurčeno')}<small class="muted"> · ${esc(x.note||'ověřit')}</small></span><b>${money(x.amountCzk)}</b></div>`).join('')}`:''}${review.length?`<div class="decision-note"><b>${review.length} položky ještě nemají bezpečně určenou částku.</b><div class="muted">${review.map(x=>`${esc(x.person||'Neurčeno')}: ${esc(x.raw||x.reason||'ověřit')}`).join(' · ')}</div></div>`:''}<p class="muted">Pohledávky zatím nepřičítám do čistého jmění. Nejdřív držím zvlášť jisté částky a položky k ověření.</p>`;
 window.__KAMIL_DEBT_SUMMARY737__={version:VERSION,healthy:true,confirmed:confirmed.length,confirmedTotal,reviewMinimum,review:review.length,at:Date.now()};
 return true;
}
