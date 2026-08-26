import {marketQuoteForPosition32,marketFxRate32} from './marketQuoteIngest32.js';
const N=v=>Number(v||0);
const A=v=>Array.isArray(v)?v:[];
const upper=v=>String(v||'').trim().toUpperCase();
const qty=p=>N(p?.quantity??p?.qty??p?.volume??p?.units??p?.shares);
const value=p=>N(p?.value??p?.marketValue);
const avg=p=>N(p?.open_price??p?.openPrice??p?.avgPrice??p?.averagePrice??p?.purchasePrice??p?.price_open);
const ageDays=x=>{const t=Date.parse(x||'');return Number.isFinite(t)?Math.max(0,(Date.now()-t)/86400000):null};
const ACTIONABLE=new Set(['BUY','TRIM','SELL']);
function accountCurrency(p,s){if(p?.accountCurrency||p?.currency)return upper(p.accountCurrency||p.currency);const id=String(p?.accountId||'');const a=(s.xtbHub?.accounts||s.xtbHub?.report?.accounts||{})[id];return upper(a?.currency||'')}
function needsBasis(d={}){return /zisk|ztrát|pokles|drawdown|nákup|\+\d|−\d|-%|\+%/i.test(String(d.reason||''))||['SELL'].includes(upper(d.action))}
export function xtbDecisionSafety148(p,d,s={}){
 const action=upper(d?.action);if(!ACTIONABLE.has(action)||d?.source==='RUČNĚ')return d;
 const issues=[],ticker=upper(p?.ticker||p?.symbol),q=qty(p),v=value(p),ccy=accountCurrency(p,s),importAge=ageDays(s.xtbHub?.asOf||s.xtbReport?.asOf||s.xtbHub?.updatedAt);
 if(!ticker)issues.push('chybí ticker');
 if(!(q>0))issues.push('neplatné množství');
 if(!(v>0))issues.push('chybí hodnota pozice');
 if(!ccy)issues.push('chybí měna účtu');
 if(importAge===null)issues.push('import nemá datum');else if(importAge>=2)issues.push(`XTB import je ${Math.floor(importAge)} dní starý`);
 const quote=marketQuoteForPosition32(p);if(!quote?.fresh||!(N(quote?.price)>0))issues.push('chybí čerstvá tržní cena');
 if(ccy&&ccy!=='CZK'&&!marketFxRate32(ccy,'CZK'))issues.push(`chybí čerstvý ${ccy}/CZK kurz`);
 if(needsBasis(d)&&!(avg(p)>0))issues.push('chybí průměrná nákupní cena');
 if(!issues.length)return {...d,safety148:'PASS'};
 return {...d,action:'REVIEW',priority:Math.max(82,N(d.priority)),when:'Nejdřív obnovit a ověřit data',reason:`Původní ${action} je zablokováno datovým gate: ${issues.join('; ')}.`,buyRule:'Neprovádět nový nákup, dokud neprojde datová kontrola.',sellRule:'Neprovádět automatický prodej/redukci, dokud neprojde datová kontrola.',tone:'warn',source:`${d.source||'AUTO'} · SAFETY GATE`,safety148:'BLOCKED',safetyIssues:issues,blockedAction:action};
}
export function xtbSafetySummary148(board=[]){const blocked=A(board).filter(x=>x?.d?.safety148==='BLOCKED');return{blocked:blocked.length,items:blocked.map(x=>({ticker:x.p?.ticker,blockedAction:x.d?.blockedAction,issues:x.d?.safetyIssues||[]}))}}
