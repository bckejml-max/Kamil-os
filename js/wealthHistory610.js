import {store} from './state.js';
import {personalVault640} from './personalVault640.js';
import {uid,h} from './utils.js';

const VERSION=610;
const A=v=>Array.isArray(v)?v:[];
const N=v=>Number.isFinite(Number(v))?Number(v):0;
const money=v=>`${Math.round(N(v)).toLocaleString('cs-CZ')} Kč`;
const val=(x,...keys)=>{for(const k of keys){const n=Number(x?.[k]);if(Number.isFinite(n)&&n!==0)return n}return 0};
const dayKey=d=>new Date(d||Date.now()).toLocaleDateString('sv-SE');
function css(){if(document.querySelector('link[data-upgrade610-css]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href='./upgrade610.css';l.dataset.upgrade610Css='1';document.head.appendChild(l)}

export function buildWealthSnapshot610(s=store.get()){
 const v=personalVault640(s),records=A(v?.records);
 const debt=records.filter(x=>['mortgage','loan','debt'].includes(x.recordType)).reduce((a,x)=>a+Math.abs(val(x,'balance','debtBalance')),0);
 const property=records.filter(x=>x.recordType==='property').reduce((a,x)=>a+val(x,'marketValue','estimatedValue','value'),0);
 const bank=records.filter(x=>x.recordType==='bank-data').reduce((a,x)=>a+val(x,'balance','cashBalance','currentBalance'),0);
 const xtbAccounts=Object.values(s.xtbHub?.accounts||{});
 const genericPositions=[...A(s.investments?.positions),...A(s.portfolio?.positions),...(xtbAccounts.length?[]:A(s.xtb?.positions))];
 const genericInvest=genericPositions.reduce((a,x)=>a+val(x,'marketValueCzk','valueCzk'),0);
 const xtbAccountCzk=xtbAccounts.reduce((a,x)=>a+val(x,'totalValueCzk','marketValueCzk','valueCzk'),0);
 const xtbPositionsCzk=xtbAccounts.reduce((a,account)=>a+A(account?.positions).reduce((b,p)=>b+val(p,'marketValueCzk','valueCzk')+(String(account?.currency||'').toUpperCase()==='CZK'?val(p,'marketValue','currentValue','value'):0),0),0);
 const invest=genericInvest+(xtbAccountCzk||xtbPositionsCzk);
 const tickets=A(s.ticketBook?.items).filter(x=>['HOLD','LISTED','ACTIVE','NOT_LISTED'].includes(String(x.workflow||x.status||'').toUpperCase())).reduce((a,x)=>a+N(x.buy||x.buyTotalCzk||x.buy_total_czk||N(x.buy_each_czk)*Math.max(1,N(x.qty))),0);
 const knownAssets=property+bank+invest+tickets,netKnown=knownAssets-debt,missing=[];
 if(!property)missing.push('nemovitosti');if(!bank)missing.push('hotovost');if(!invest)missing.push('investice');
 return{asOf:new Date().toISOString(),knownAssets,debt,property,bank,invest,tickets,netKnown,complete:missing.length===0,missing}
}
function historyRows(s=store.get()){return A(s.netWorthBook?.history).map(x=>({...x,netKnown:N(x.netKnown||x.netWorth||x.value),asOf:x.asOf||x.date||x.createdAt})).filter(x=>x.asOf&&Number.isFinite(x.netKnown)).sort((a,b)=>Date.parse(a.asOf)-Date.parse(b.asOf))}
function chartSvg(rows){
 const data=rows.slice(-12);if(data.length<2)return '<div class="muted">Až uložíš alespoň dva snapshoty, zobrazí se trend čistého jmění.</div>';
 const vals=data.map(x=>N(x.netKnown)),min=Math.min(...vals),max=Math.max(...vals),range=Math.max(1,max-min),w=760,hgt=150,p=10;
 const pts=data.map((x,i)=>`${p+(i*(w-2*p)/Math.max(1,data.length-1))},${hgt-p-((N(x.netKnown)-min)/range)*(hgt-2*p)}`).join(' ');
 const area=`${p},${hgt-p} ${pts} ${w-p},${hgt-p}`;
 return `<svg class="os610-chart" viewBox="0 0 ${w} ${hgt}" role="img" aria-label="Vývoj čistého jmění"><line class="axis" x1="${p}" y1="${hgt-p}" x2="${w-p}" y2="${hgt-p}"/><polygon class="area" points="${area}"/><polyline class="line" points="${pts}"/></svg>`
}
function card(){
 const s=store.get(),current=buildWealthSnapshot610(s),rows=historyRows(s),last=rows.at(-1),previous=rows.length>1?rows.at(-2):null,delta=last&&previous?N(last.netKnown)-N(previous.netKnown):null;
 return `<section class="os610-card" data-wealth-history610><div class="os610-head"><div><small>OS610 · NET WORTH HISTORY</small><h2>Vývoj čistého jmění</h2><p>Snapshoty jsou uložené lokálně v Kamil OS. Neodhaduju hodnoty, které v datech chybí.</p></div><span class="os610-badge">${rows.length} snapshotů</span></div><div class="os610-grid"><div class="os610-metric"><span>Aktuálně známé netto</span><b>${money(current.netKnown)}</b></div><div class="os610-metric"><span>Známá aktiva</span><b>${money(current.knownAssets)}</b></div><div class="os610-metric"><span>Dluhy</span><b>${money(current.debt)}</b></div><div class="os610-metric"><span>Poslední změna</span><b class="${delta===null?'':delta>=0?'os610-good':'os610-bad'}">${delta===null?'—':`${delta>=0?'+':''}${money(delta)}`}</b></div></div>${chartSvg(rows)}<div class="os610-history-actions"><button type="button" class="os610-btn primary" data-wealth-snapshot610>Uložit dnešní snapshot</button>${current.missing.length?`<span class="os610-delta">Neúplné: ${h(current.missing.join(' · '))}</span>`:'<span class="os610-delta">Snapshot má všechny hlavní zdroje.</span>'}</div></section>`
}
export function saveWealthSnapshot610(){
 const snap=buildWealthSnapshot610(),key=dayKey(snap.asOf);
 store.mutate('Uložen snapshot čistého jmění',s=>{s.netWorthBook=s.netWorthBook||{items:[],history:[]};s.netWorthBook.history=A(s.netWorthBook.history);const item={id:uid('networth-snapshot'),title:`Net worth ${key}`,date:key,...snap};const i=s.netWorthBook.history.findIndex(x=>dayKey(x.asOf||x.date||x.createdAt)===key);if(i>=0)s.netWorthBook.history[i]={...s.netWorthBook.history[i],...item,id:s.netWorthBook.history[i].id||item.id};else s.netWorthBook.history.push(item)});
 return snap
}
function mount(){const host=document.querySelector('#moneyView');if(!host)return false;const old=host.querySelector('[data-wealth-history610]'),wrap=document.createElement('div');wrap.innerHTML=card();const next=wrap.firstElementChild;if(old)old.replaceWith(next);else{const anchor=host.querySelector('.wealth69-grid')||host.querySelector('[data-money-group="wealth"]');anchor?.after(next);if(!anchor)host.prepend(next)}next.querySelector('[data-wealth-snapshot610]')?.addEventListener('click',()=>{saveWealthSnapshot610();setTimeout(mount,30)});return true}
export function appendWealthHistory610(){css();const ok=mount();window.__KAMIL_WEALTH_HISTORY610__={version:VERSION,healthy:ok,current:buildWealthSnapshot610(),history:historyRows(),refresh:mount,save:saveWealthSnapshot610,at:Date.now()};return ok}
window.addEventListener('kamil:focus610',e=>{if(e.detail?.focus!=='wealth-history')return;setTimeout(()=>document.querySelector('[data-wealth-history610]')?.scrollIntoView({behavior:'smooth',block:'start'}),180)});
