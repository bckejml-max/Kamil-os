import {renderDashboard110} from './dashboard110.js';
import {store} from './state.js';
import {xtbPositions} from './decision24.js';
import {quoteSymbolForPosition32,quoteFresh32} from './marketQuote32.js';

const N=v=>Number(v||0);
const A=v=>Array.isArray(v)?v:[];
const qty=p=>N(p.quantity||p.qty||p.volume||p.units||p.shares||0);
const fmt=v=>Number(v||0).toLocaleString('cs-CZ',{maximumFractionDigits:0});
const pct=v=>`${v>=0?'+':''}${Number(v||0).toLocaleString('cs-CZ',{minimumFractionDigits:2,maximumFractionDigits:2})} %`;
const currencyOf=(p,q)=>String(q?.currency||p.currency||p.accountCurrency||'').toUpperCase();
const fxSymbol=c=>c==='USD'?'CZK=X':c==='EUR'?'EURCZK=X':null;
const key=p=>`${String(p?.ticker||p?.symbol||'').toUpperCase()}|${qty(p).toFixed(6)}`;

async function fetchAll(positions){
 const symbols=[...new Set([...positions.map(quoteSymbolForPosition32).filter(Boolean),'CZK=X','EURCZK=X'])];
 try{const r=await fetch(`/api/market-quotes?symbols=${encodeURIComponent(symbols.join(','))}`,{cache:'no-store'}),j=await r.json();return j?.ok?j:{ok:false,quotes:[],errors:j?.errors||[]}}catch{return{ok:false,quotes:[],errors:[]}}
}

function mapQuotes(rows=[]){return new Map(rows.map(x=>[String(x.symbol||'').toUpperCase(),x]))}
function fresh(q){return !!q&&quoteFresh32(q).fresh}
function fxFor(currency,map){if(currency==='CZK')return{now:1,prev:1,ok:true,fresh:true};const s=fxSymbol(currency),q=s?map.get(s):null,isFresh=fresh(q),now=isFresh?N(q?.price):0,prev=isFresh?(N(q?.previousClose)||now):0;return{now,prev,ok:now>0&&isFresh,fresh:isFresh,asOf:q?.asOf||null}}
function positionQuote(p,map){const s=quoteSymbolForPosition32(p),q=s?map.get(s):null,isFresh=fresh(q),now=isFresh?N(q?.price):0,prev=isFresh?(N(q?.previousClose)||now):0;return{q,now,prev,ok:now>0&&isFresh,fresh:isFresh,asOf:q?.asOf||null}}
function overlapAudit(s,canonical){
 const canon=new Set(canonical.map(key));
 const legacy=[['investments',A(s.investments?.positions)],['portfolio',A(s.portfolio?.positions)],['xtb',A(s.xtb?.positions)]];
 const hits=[];for(const [source,rows] of legacy)for(const p of rows){const k=key(p);if(canon.has(k))hits.push({source,ticker:String(p?.ticker||p?.symbol||'').toUpperCase(),qty:qty(p)})}
 return{legacyRows:legacy.reduce((a,[,r])=>a+r.length,0),overlaps:hits};
}

async function enhanceFx1103(){
 const root=document.querySelector('.dashboard110');if(!root)return;
 const s=store.get(),positions=xtbPositions(s),data=await fetchAll(positions),map=mapQuotes(data.quotes||[]);
 let total=0,previous=0,covered=0;const rows=[];
 for(const p of positions){const pq=positionQuote(p,map),cur=currencyOf(p,pq.q),fx=fxFor(cur,map),qnty=qty(p);if(!(pq.ok&&fx.ok&&qnty>0)){rows.push({ticker:p.ticker,ok:false,quoteFresh:pq.fresh,fxFresh:fx.fresh,currency:cur});continue}const nowCzk=qnty*pq.now*fx.now,prevCzk=qnty*pq.prev*fx.prev;total+=nowCzk;previous+=prevCzk;covered++;rows.push({ticker:p.ticker,ok:true,czk:nowCzk,quoteAsOf:pq.asOf,fxAsOf:fx.asOf})}
 const complete=positions.length>0&&covered===positions.length,totalDelta=total-previous,totalPct=previous>0?totalDelta/previous*100:0,usd=fxFor('USD',map),eur=fxFor('EUR',map),audit=overlapAudit(s,positions);
 const summary=root.querySelector('.d110-summary'),big=summary?.querySelector('.d110-big');
 if(big){const small=big.querySelector('small'),b=big.querySelector('b'),oldChange=big.querySelector('.d110-fxchange');oldChange?.remove();if(complete){if(small)small.textContent='Aktuální hodnota portfolia · čerstvé ceny + FX';if(b)b.textContent=`${fmt(total)} Kč`;big.insertAdjacentHTML('beforeend',`<div class="d110-fxchange ${totalDelta>=0?'pos':'neg'}"><b>${totalDelta>=0?'+':''}${fmt(totalDelta)} Kč</b><span>${pct(totalPct)} dnes</span></div>`)}else{if(small)small.textContent=`Importovaná hodnota · čerstvé live pokrytí ${covered}/${positions.length}`}}
 if(summary){summary.querySelector('.d110-fxbox')?.remove();summary.insertAdjacentHTML('beforeend',`<div class="d110-fxbox"><div><span>USD/CZK</span><b>${usd.ok?usd.now.toLocaleString('cs-CZ',{minimumFractionDigits:2,maximumFractionDigits:3}):'—'}</b></div><div><span>EUR/CZK</span><b>${eur.ok?eur.now.toLocaleString('cs-CZ',{minimumFractionDigits:2,maximumFractionDigits:3}):'—'}</b></div><small>${complete?'ČERSTVÝ live přepočet všech XTB pozic':'Live total nepoužívám, dokud chybí čerstvá cena nebo FX u některé pozice'}</small></div>`)}
 const quality=[...root.querySelectorAll('.d110-bottom .d110-card')].find(x=>x.textContent.includes('DATOVÁ KVALITA'));if(quality){quality.querySelectorAll('[data-xtbqa145]').forEach(x=>x.remove());quality.insertAdjacentHTML('beforeend',`<div class="d110-kpi" data-xtbqa145><span>Čerstvý FX přepočet</span><b class="${complete?'live':'stale'}">${complete?'ANO':`${covered}/${positions.length}`}</b></div><div class="d110-kpi" data-xtbqa145><span>Legacy překryvy XTB</span><b class="${audit.overlaps.length?'stale':'live'}">${audit.overlaps.length}</b></div>${audit.overlaps.length?`<small data-xtbqa145>Legacy struktury obsahují stejné ticker+qty jako xtbHub. Do kanonického totalu je nezapočítávám.</small>`:''}`)}
 window.__KAMIL_FX1103__={at:Date.now(),complete,covered,totalCzk:complete?Math.round(total):null,dayChangeCzk:complete?Math.round(totalDelta):null,usdCzk:usd.ok?usd.now:null,eurCzk:eur.ok?eur.now:null,rows};
 window.__KAMIL_XTB_QA145__={at:Date.now(),canonicalPositions:positions.length,legacyRows:audit.legacyRows,legacyOverlaps:audit.overlaps,freshCovered:covered,complete};
}

export async function renderDashboard1103(){await renderDashboard110();await enhanceFx1103()}
