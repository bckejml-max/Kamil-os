import {renderDashboard110} from './dashboard110.js';
import {store} from './state.js';
import {xtbPositions} from './decision24.js';
import {quoteSymbolForPosition32} from './marketQuote32.js';

const N=v=>Number(v||0);
const qty=p=>N(p.quantity||p.qty||p.volume||p.units||p.shares||0);
const fmt=v=>Number(v||0).toLocaleString('cs-CZ',{maximumFractionDigits:0});
const pct=v=>`${v>=0?'+':''}${Number(v||0).toLocaleString('cs-CZ',{minimumFractionDigits:2,maximumFractionDigits:2})} %`;
const currencyOf=(p,q)=>String(q?.currency||p.currency||p.accountCurrency||'').toUpperCase();
const fxSymbol=c=>c==='USD'?'CZK=X':c==='EUR'?'EURCZK=X':null;

async function fetchAll(positions){
 const symbols=[...new Set([...positions.map(quoteSymbolForPosition32).filter(Boolean),'CZK=X','EURCZK=X'])];
 try{const r=await fetch(`/api/market-quotes?symbols=${encodeURIComponent(symbols.join(','))}`,{cache:'no-store'}),j=await r.json();return j?.ok?j:{ok:false,quotes:[],errors:j?.errors||[]}}catch{return{ok:false,quotes:[],errors:[]}}
}

function mapQuotes(rows=[]){return new Map(rows.map(x=>[String(x.symbol||'').toUpperCase(),x]))}
function fxFor(currency,map){if(currency==='CZK')return{now:1,prev:1,ok:true};const s=fxSymbol(currency),q=s?map.get(s):null;const now=N(q?.price),prev=N(q?.previousClose)||now;return{now,prev,ok:now>0}}
function positionQuote(p,map){const s=quoteSymbolForPosition32(p),q=s?map.get(s):null;const now=N(q?.price)||N(p.marketPrice||p.currentPrice||p.price),prev=N(q?.previousClose)||now;return{q,now,prev,ok:now>0}}

async function enhanceFx1103(){
 const root=document.querySelector('.dashboard110');if(!root)return;
 const positions=xtbPositions(store.get()),data=await fetchAll(positions),map=mapQuotes(data.quotes||[]);
 let total=0,previous=0,covered=0;const rows=[];
 for(const p of positions){const pq=positionQuote(p,map),cur=currencyOf(p,pq.q),fx=fxFor(cur,map),qnty=qty(p);if(!(pq.ok&&fx.ok&&qnty>0)){rows.push({ticker:p.ticker,ok:false});continue}const nowCzk=qnty*pq.now*fx.now,prevCzk=qnty*pq.prev*fx.prev;total+=nowCzk;previous+=prevCzk;covered++;rows.push({ticker:p.ticker,ok:true,czk:nowCzk})}
 const complete=positions.length>0&&covered===positions.length,totalDelta=total-previous,totalPct=previous>0?totalDelta/previous*100:0,usd=fxFor('USD',map),eur=fxFor('EUR',map);
 const summary=root.querySelector('.d110-summary'),big=summary?.querySelector('.d110-big');
 if(big){const small=big.querySelector('small'),b=big.querySelector('b');if(complete){if(small)small.textContent='Aktuální hodnota portfolia';if(b)b.textContent=`${fmt(total)} Kč`;big.insertAdjacentHTML('beforeend',`<div class="d110-fxchange ${totalDelta>=0?'pos':'neg'}"><b>${totalDelta>=0?'+':''}${fmt(totalDelta)} Kč</b><span>${pct(totalPct)} dnes</span></div>`)}else{if(small)small.textContent=`Hodnota z importu · live FX pokrytí ${covered}/${positions.length}`}}
 if(summary){const old=summary.querySelector('.d110-fxbox');old?.remove();summary.insertAdjacentHTML('beforeend',`<div class="d110-fxbox"><div><span>USD/CZK</span><b>${usd.ok?usd.now.toLocaleString('cs-CZ',{minimumFractionDigits:2,maximumFractionDigits:3}):'—'}</b></div><div><span>EUR/CZK</span><b>${eur.ok?eur.now.toLocaleString('cs-CZ',{minimumFractionDigits:2,maximumFractionDigits:3}):'—'}</b></div><small>${complete?'LIVE přepočet všech XTB pozic':'Částečný přepočet — chybí cena nebo FX u některé pozice'}</small></div>`)}
 const quality=[...root.querySelectorAll('.d110-bottom .d110-card')].find(x=>x.textContent.includes('DATOVÁ KVALITA'));if(quality)quality.insertAdjacentHTML('beforeend',`<div class="d110-kpi"><span>Live FX přepočet</span><b class="${complete?'live':'stale'}">${complete?'ANO':`${covered}/${positions.length}`}</b></div>`);
 window.__KAMIL_FX1103__={at:Date.now(),complete,covered,totalCzk:complete?Math.round(total):null,dayChangeCzk:complete?Math.round(totalDelta):null,usdCzk:usd.ok?usd.now:null,eurCzk:eur.ok?eur.now:null};
}

export async function renderDashboard1103(){await renderDashboard110();await enhanceFx1103()}
