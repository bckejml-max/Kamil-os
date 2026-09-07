import {store} from './state.js';
import {h} from './utils.js';

export const SOURCE_REGISTRY=Object.freeze({
 MONEY:{canonical:'financePlan + netWorthBook',fallback:'xtbReport',external:'bank/broker adapters only when explicitly connected'},
 TICKETS:{canonical:'ticketBook.items',fallback:'manual market fields',external:'market adapter'},
 BETTING:{canonical:'bettingBook/betBook ledger',fallback:'manual odds/model data',external:'odds adapter'},
 PROPERTY:{canonical:'propertyBook.candidates',fallback:'propertyBook.items',external:'listing adapter'},
 WORK:{canonical:'projects + tasks',fallback:'personalInbox',external:null},
 FAMILY:{canonical:'familyHome + calendar',fallback:'tasks',external:null},
 DOCS:{canonical:'personal vault + document metadata',fallback:'personalAdmin',external:null}
});
const A=v=>Array.isArray(v)?v:[],ageDays=v=>{const t=Date.parse(v||'');return Number.isFinite(t)?Math.max(0,Math.floor((Date.now()-t)/86400000)):null};
const freshness=at=>{const age=ageDays(at);return{at:at||null,ageDays:age,label:age===null?'UNKNOWN':age===0?'TODAY':age<=7?'FRESH':age<=30?'AGING':'STALE'}};
export function sourceState(domain,s=store.get()){
 const d=String(domain||'').toUpperCase(),meta=SOURCE_REGISTRY[d]||{};let at=null,source=meta.canonical||'unknown',confidence='LOW',detail='';
 if(d==='MONEY'){at=s.financePlan?.asOf||s.meta?.lastMutationAt;confidence=Object.prototype.hasOwnProperty.call(s.financePlan||{},'cashNow')&&at?'MEDIUM':'LOW';detail=`cash ${Object.prototype.hasOwnProperty.call(s.financePlan||{},'cashNow')?'known':'missing'}`}
 if(d==='TICKETS'){const rows=A(s.ticketBook?.items),priced=rows.filter(x=>Number(x.marketPrice||x.currentPrice||x.askPrice)>0),dates=rows.map(x=>x.marketObservedAt||x.priceObservedAt||x.updatedAt).filter(Boolean);at=dates.sort().at(-1)||s.meta?.lastMutationAt;confidence=rows.length&&priced.length===rows.length?'HIGH':rows.length?'MEDIUM':'LOW';detail=`${priced.length}/${rows.length} market priced`}
 if(d==='BETTING'){const rows=[s.bettingBook?.bets,s.betBook?.items,s.bets,s.betLedger?.items].find(Array.isArray)||[],dated=rows.map(x=>x.oddsObservedAt||x.updatedAt||x.createdAt).filter(Boolean);at=dated.sort().at(-1)||s.meta?.lastMutationAt;confidence=rows.length?'MEDIUM':'LOW';detail=`${rows.length} ledger rows`}
 if(d==='PROPERTY'){const rows=A(s.propertyBook?.candidates||s.propertyBook?.items),complete=rows.filter(x=>Number(x.price||x.purchasePrice||x.askingPrice)>0&&Number(x.rent||x.monthlyRent||x.expectedRent)>0);at=s.propertyBook?.asOf||s.meta?.lastMutationAt;confidence=rows.length&&complete.length===rows.length?'HIGH':rows.length?'MEDIUM':'LOW';detail=`${complete.length}/${rows.length} complete`}
 if(d==='DOCS'){const rows=A(s.personalAdmin?.items);at=s.meta?.lastMutationAt;confidence=rows.length?'MEDIUM':'LOW';detail=`${rows.length} admin/document rows`}
 const f=freshness(at);if(f.label==='STALE'&&confidence==='HIGH')confidence='MEDIUM';if(f.label==='UNKNOWN')confidence='LOW';return{domain:d,...meta,source,confidence,detail,freshness:f};
}
export function mountSourceBadge(domain,host){if(typeof host==='string')host=document.querySelector(host);if(!host)return false;const x=sourceState(domain),id=`source-${String(domain).toLowerCase()}`,selector=`[data-source-badge="${id}"]`,html=`<div class="data-source-strip" data-source-badge="${id}"><span class="eyebrow">DATA</span><span>${h(x.source)}</span><b>${h(x.confidence)}</b><span>${h(x.freshness.label)}${x.freshness.ageDays!==null?` · ${x.freshness.ageDays} d`:''}</span><span class="muted">${h(x.detail)}</span></div>`;host.querySelectorAll(selector).forEach(el=>el.remove());const head=host.querySelector('.view-head');head?.insertAdjacentHTML('afterend',html)||host.insertAdjacentHTML('afterbegin',html);return host.querySelectorAll(selector).length===1}
