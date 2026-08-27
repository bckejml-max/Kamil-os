import {store} from './state.js';
const num=x=>Number.isFinite(Number(x))?Number(x):0;
const money=x=>`${Math.round(num(x)).toLocaleString('cs-CZ')} Kč`;
const upper=x=>String(x||'').toUpperCase();
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

function positions(s){const out=[];for(const [id,a] of Object.entries(s.xtbHub?.accounts||{}))for(const p of a?.positions||[])out.push({...p,account:id,currency:a.currency||p.currency||'CZK'});return out}
function pValue(p){return num(p.marketValueCzk||p.valueCzk||p.marketValue||p.value||p.currentValue||p.investedCzk||p.costCzk)}
function pCost(p){return num(p.costCzk||p.investedCzk||p.bookValueCzk||p.cost||p.invested)}
function cash(s){return num(s.finance?.cashCzk||s.cashBook?.totalCzk||s.money?.cashCzk||s.personalFinance?.cashCzk)}
function assets(s){return (s.assetBook?.items||[]).filter(x=>upper(x.status)!=='ARCHIVED').reduce((a,x)=>a+num(x.valueCzk||x.currentValueCzk||x.value),0)}
function debts(s){return (s.debtBook?.items||[]).filter(x=>upper(x.status)!=='PAID').reduce((a,x)=>a+num(x.remainingCzk||x.remaining||x.amountCzk||x.amount),0)}
function obligations(s){return (s.personalAdmin?.items||[]).filter(x=>upper(x.status)!=='ARCHIVED').reduce((a,x)=>a+num(x.monthlyCzk||x.monthlyAmount||x.paymentCzk||0),0)}
function timeline(s){const rows=[];for(const x of s.netWorthHistory||s.finance?.history||[])rows.push({at:x.at||x.date,value:num(x.valueCzk||x.value)});return rows.filter(x=>x.at&&x.value).sort((a,b)=>Date.parse(a.at)-Date.parse(b.at))}

export function buildFinanceCommand258(s=store.get()){
 const pos=positions(s),investments=pos.reduce((a,p)=>a+pValue(p),0),assetValue=assets(s),cashValue=cash(s),receivables=debts(s);const netWorth=cashValue+investments+assetValue+receivables-num(s.finance?.liabilitiesCzk||s.personalFinance?.liabilitiesCzk||0);
 const total=Math.max(1,investments);const ranked=pos.map(p=>{const value=pValue(p),cost=pCost(p),pl=value-cost,weight=value/total;return {...p,value,cost,pl,roi:cost?pl/cost:0,weight,risk:weight>.35?'HIGH':weight>.2?'MEDIUM':'OK'}}).sort((a,b)=>b.value-a.value);
 const concentration=ranked.filter(x=>x.weight>.2).map(x=>({name:x.ticker||x.name||'Pozice',weight:x.weight,risk:x.risk}));
 const reserveTarget=num(s.finance?.reserveTargetCzk||s.personalFinance?.reserveTargetCzk||0),deployable=Math.max(0,cashValue-reserveTarget);
 const monthlyOut=obligations(s);const forecast=[30,90,365].map(days=>({days,balance:cashValue-monthlyOut*(days/30)}));
 const review=ranked.map(x=>({name:x.ticker||x.name||'Pozice',action:x.weight>.35?'TRIM REVIEW':x.pl>0&&x.roi>.35?'PROFIT REVIEW':'HOLD/REVIEW',reason:x.weight>.35?`váha ${(x.weight*100).toFixed(1)} %`:x.pl>0?`P/L ${money(x.pl)}`:'bez signálu k redukci'}));
 return {netWorth,cash:cashValue,investments,assets:assetValue,receivables,deployable,reserveTarget,monthlyOut,forecast,positions:ranked,concentration,review,timeline:timeline(s),generatedAt:new Date().toISOString()};
}
function body(m){const pos=m.positions.slice(0,5).map(x=>`<div class="fin258-row"><span><b>${esc(x.ticker||x.name||'Pozice')}</b><small>${(x.weight*100).toFixed(1)} % portfolia · ${x.risk}</small></span><strong>${money(x.value)}</strong></div>`).join('')||'<div class="fin258-empty">Žádné XTB pozice.</div>';const forecast=m.forecast.map(x=>`<span><b>${money(x.balance)}</b><small>${x.days} dní</small></span>`).join('');return `<div class="fin258"><div class="fin258-hero"><div><small>ČISTÉ JMĚNÍ</small><h2>${money(m.netWorth)}</h2></div><div><small>VOLNÝ KAPITÁL NAD REZERVU</small><b>${money(m.deployable)}</b></div></div><div class="fin258-grid"><span><b>${money(m.cash)}</b><small>hotovost</small></span><span><b>${money(m.investments)}</b><small>investice</small></span><span><b>${money(m.assets)}</b><small>majetek</small></span><span><b>${money(m.receivables)}</b><small>pohledávky</small></span></div><div class="fin258-title">Cashflow forecast</div><div class="fin258-grid fin258-forecast">${forecast}</div><div class="fin258-title">Největší pozice</div><div class="fin258-list">${pos}</div><div class="fin258-note">Doporučení jsou pouze review signály z uložených dat. Kamil OS neprovádí automatické obchody.</div></div>`}
function ensureCss(){if(document.querySelector('link[data-fin258]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href='./financeCommand258.css';l.dataset.fin258='1';document.head.appendChild(l)}
export function openFinanceCommand258(){const m=buildFinanceCommand258();window.dispatchEvent(new CustomEvent('kamil:detail-drawer',{detail:{title:'Finance Command Center',html:body(m)}}));return m}
export function installFinanceCommand258(){ensureCss();window.addEventListener('kamil:open-finance-command',openFinanceCommand258);document.addEventListener('keydown',e=>{if(e.altKey&&!e.ctrlKey&&!e.metaKey&&e.key.toLowerCase()==='f'){e.preventDefault();openFinanceCommand258()}},true);window.__KAMIL_FINANCE_COMMAND258__={version:258,build:buildFinanceCommand258,open:openFinanceCommand258};}
