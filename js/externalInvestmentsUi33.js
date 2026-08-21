import {store} from './state.js';
import {qs,h,modal,uid,toast} from './utils.js';
import {netWorthFxRate} from './netWorth29.js';

const id='externalInvestments33Host';
const active=x=>String(x.status||'ACTIVE').toUpperCase()!=='ARCHIVED'&&x.externalInvestmentKey;
const fmt=(v,c)=>`${Number(v||0).toLocaleString('cs-CZ',{minimumFractionDigits:Number(v)%1?2:0,maximumFractionDigits:2})} ${h(c||'CZK')}`;
const fmtCzk=v=>`${Math.round(Number(v||0)).toLocaleString('cs-CZ')} Kč`;

function summary(items,s){
 const base='CZK',parts=[],missing=[];let total=0;
 for(const x of items){const rate=netWorthFxRate(s,x.currency||'CZK',base);if(rate===null){missing.push(x.currency||'CZK');continue}total+=Number(x.value||0)*rate}
 return {total,complete:missing.length===0,missing:[...new Set(missing)]};
}
function row(x){return `<div class="row external-investment-row33"><div><b>${h(x.title||x.instrument||'Investice')}</b><div class="muted">${h(x.provider||'')} ${x.accountType?`· ${h(x.accountType)}`:''}${x.isin?` · ISIN ${h(x.isin)}`:''}</div>${x.note?`<div class="muted">${h(x.note)}</div>`:''}</div><div class="row-actions"><span class="status">${fmt(x.value,x.currency)}</span>${Number(x.monthlyContributionCzk||0)>0?`<span class="status good">+ ${fmtCzk(x.monthlyContributionCzk)}/měs.</span>`:''}<button class="btn" data-external-edit33="${h(x.id)}">Upravit</button></div></div>`}

async function edit(idValue){
 const x=(store.get().netWorthBook?.items||[]).find(y=>y.id===idValue);if(!x)return;
 const body=`<div class="form-grid"><label class="wide-field">Název<input id="ext33title" value="${h(x.title||'')}"></label><label>Poskytovatel<input id="ext33provider" value="${h(x.provider||'')}"></label><label>Typ účtu<input id="ext33type" value="${h(x.accountType||'')}"></label><label>Hodnota<input id="ext33value" type="number" step="0.01" value="${Number(x.value||0)}"></label><label>Měna<input id="ext33currency" value="${h(x.currency||'CZK')}"></label><label>Měsíční vklad v Kč<input id="ext33monthly" type="number" step="1" value="${Number(x.monthlyContributionCzk||0)}"></label><label>ISIN<input id="ext33isin" value="${h(x.isin||'')}"></label><label class="wide-field">Poznámka<input id="ext33note" value="${h(x.note||'')}"></label></div>`;
 const ok=await modal('Upravit investici mimo XTB',body,[{label:'Zrušit',value:false},{label:'Uložit',value:true,primary:true}]);if(!ok)return;
 store.mutate('Upravena investice mimo XTB',s=>{const t=s.netWorthBook.items.find(y=>y.id===idValue);if(!t)return;t.title=qs('#ext33title')?.value?.trim()||t.title;t.provider=qs('#ext33provider')?.value?.trim()||'';t.accountType=qs('#ext33type')?.value?.trim()||'';t.value=Number(qs('#ext33value')?.value||0);t.currency=(qs('#ext33currency')?.value||'CZK').trim().toUpperCase();t.monthlyContributionCzk=Number(qs('#ext33monthly')?.value||0);t.isin=qs('#ext33isin')?.value?.trim()||'';t.note=qs('#ext33note')?.value?.trim()||'';t.updatedAt=new Date().toISOString()});
}

async function add(){
 const body=`<div class="form-grid"><label class="wide-field">Název<input id="ext33title" autofocus placeholder="Např. Conseq / Bitcoin / další ETF"></label><label>Poskytovatel<input id="ext33provider" placeholder="Efekta, banka…"></label><label>Typ účtu<input id="ext33type" placeholder="DIP, DPS, investice…"></label><label>Hodnota<input id="ext33value" type="number" step="0.01"></label><label>Měna<input id="ext33currency" value="CZK"></label><label>Měsíční vklad v Kč<input id="ext33monthly" type="number" step="1"></label><label>ISIN / ticker<input id="ext33isin"></label><label class="wide-field">Poznámka<input id="ext33note"></label></div>`;
 const ok=await modal('Přidat další investici',body,[{label:'Zrušit',value:false},{label:'Přidat',value:true,primary:true}]);if(!ok)return;const title=qs('#ext33title')?.value?.trim();if(!title){toast('Doplň název investice');return}
 store.mutate('Přidána investice mimo XTB',s=>{s.netWorthBook=s.netWorthBook||{items:[],history:[]};s.netWorthBook.items=s.netWorthBook.items||[];s.netWorthBook.items.unshift({id:uid('networth'),externalInvestmentKey:`manual-${Date.now()}`,title,provider:qs('#ext33provider')?.value?.trim()||'',accountType:qs('#ext33type')?.value?.trim()||'',value:Number(qs('#ext33value')?.value||0),currency:(qs('#ext33currency')?.value||'CZK').trim().toUpperCase(),monthlyContributionCzk:Number(qs('#ext33monthly')?.value||0),isin:qs('#ext33isin')?.value?.trim()||'',note:qs('#ext33note')?.value?.trim()||'',side:'ASSET',status:'ACTIVE',kind:'INVESTMENT',liquid:false,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()})});
}

function render(){
 const view=qs('#moneyView');if(!view)return;qs(`#${id}`,view)?.remove();const s=store.get(),items=(s.netWorthBook?.items||[]).filter(active);if(!items.length)return;const sm=summary(items,s),monthly=items.reduce((z,x)=>z+Number(x.monthlyContributionCzk||0),0),host=document.createElement('div');host.id=id;host.className='card';
 host.innerHTML=`<div class="card-head"><div><div class="eyebrow">DALŠÍ INVESTICE / MIMO XTB</div><h2>Efekta a ostatní investice</h2><p class="muted">Do celkového majetku se počítají společně s XTB; měnové účty se neposuzují izolovaně.</p></div><button class="btn" id="externalAdd33">＋ Přidat</button></div><div class="metric-strip"><div class="metric"><span>Investic mimo XTB</span><b>${items.length}</b></div><div class="metric"><span>Hodnota v CZK</span><b>${sm.complete?fmtCzk(sm.total):'—'}</b></div><div class="metric"><span>Pravidelné vklady</span><b>${fmtCzk(monthly)}/měs.</b></div><div class="metric"><span>FX přepočet</span><b class="${sm.complete?'good':'warn'}">${sm.complete?'OK':'chybí '+h(sm.missing.join(', '))}</b></div></div><div>${items.map(row).join('')}</div><div class="decision-note">Hodnoty mimo XTB jsou ručně vedené a lze je kdykoli upravit. Kamil OS je zahrne do True Net Worth, ale nebude předstírat živou cenu bez nového údaje.</div>`;
 const anchor=qs('#trueNetWorth29Host',view)||qs('#portfolioRiskMap29Host',view)||view.querySelector('.view-head');if(anchor)anchor.insertAdjacentElement('afterend',host);else view.prepend(host);
 qs('#externalAdd33',host)?.addEventListener('click',add);host.querySelectorAll('[data-external-edit33]').forEach(b=>b.addEventListener('click',()=>edit(b.dataset.externalEdit33)));
}
const start=()=>{const view=qs('#moneyView');if(!view)return;new MutationObserver(()=>{if(!qs(`#${id}`,view))queueMicrotask(render)}).observe(view,{childList:true,subtree:false});store.subscribe(()=>{if(qs('#view-money')?.classList.contains('on'))queueMicrotask(render)});render()};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
