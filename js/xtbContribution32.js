import {xtbBoard} from './live24.js';
import {xtbPortfolioAudit} from './xtbAudit24.js';
import {marketQuoteForPosition32,marketFxRate32} from './marketQuoteIngest32.js';

const n=v=>Number(v||0),upper=v=>String(v||'').trim().toUpperCase(),text=p=>String(`${p?.name||''} ${p?.ticker||''}`).toLowerCase();
const isBond=p=>/bond|aggregate|treasury|dluhopis/.test(text(p));
const isSectorEtf=p=>upper(p?.category)==='ETF'&&/health|tech|energy|financial|sector|semiconductor|nasdaq/.test(text(p));
const isBroad=p=>upper(p?.category)==='ETF'&&!isBond(p)&&!isSectorEtf(p);
const coreScore=p=>/all[- ]?world/.test(text(p))?100:/core.*world|msci world(?!.*small|.*health|.*ex)/.test(text(p))?90:/world ex usa/.test(text(p))?75:/em imi|emerging/.test(text(p))?60:/small cap/.test(text(p))?50:40;
const round=v=>Math.round(Number(v)||0),round4=v=>Math.round((Number(v)||0)*10000)/10000;
function candidate(board,kind){const rows=board.filter(x=>kind==='BOND'?isBond(x.p):isBroad(x.p));if(kind==='BROAD')rows.sort((a,b)=>coreScore(b.p)-coreScore(a.p)||n(b.p.value)-n(a.p.value));else rows.sort((a,b)=>n(b.p.value)-n(a.p.value));return rows[0]||null}
function currencyRate(audit,currency){const c=upper(currency||'CZK');if(c==='CZK')return 1;const row=(audit.currencyBreakdown||[]).find(x=>x.currency===c&&x.complete&&n(x.rateToCzk)>0);return row?n(row.rateToCzk):null}
function securityCzkPrice(position){const q=marketQuoteForPosition32(position);if(!q?.fresh||n(q.price)<=0)return null;const c=upper(q.currency||position.accountCurrency||'CZK');const fx=c==='CZK'?{rate:1}:marketFxRate32(c,'CZK');if(!fx?.rate)return null;return {price:n(q.price),currency:c,czkPrice:n(q.price)*n(fx.rate),asOf:q.asOf,sourceUrl:q.sourceUrl}}
function targetAmount(plan,totalGap,gap){return totalGap>0?Math.min(plan,plan*gap/totalGap):0}

export function xtbContributionPlan32(state={}){
 const planned=Math.max(0,n(state.financePlan?.plannedInvestment)),board=xtbBoard(state),audit=xtbPortfolioAudit(state),rawAt=state.xtbHub?.asOf||state.xtbReport?.asOf||null,ageHours=rawAt?Math.max(0,(Date.now()-Date.parse(rawAt))/3600000):null,stale=ageHours===null||ageHours>48;
 const base={plannedCzk:round(planned),audit,generatedAt:new Date().toISOString(),autoTrade:false,contract:'ALLOCATION_PROPOSAL_ONLY',dataAgeHours:ageHours===null?null:Math.round(ageHours*10)/10};
 if(!planned)return {...base,ok:false,blocked:true,reason:'V plánu není částka pro další vklad.',allocations:[]};
 if(stale)return {...base,ok:false,blocked:true,reason:'XTB import je starší než 48 hodin. Před plánem nového vkladu obnov XTB data.',allocations:[]};
 if(!audit.valuationComplete)return {...base,ok:false,blocked:true,reason:`Chybí čerstvý FX ${audit.missingFx.join(', ')} → CZK. Přesný multi-currency plán by byl zavádějící.`,allocations:[]};
 const postTotal=audit.total+planned,currentBroad=audit.total*n(audit.mix.broadPct)/100,currentBond=audit.total*n(audit.mix.bondPct)/100,broadGap=Math.max(0,postTotal*.55-currentBroad),bondGap=Math.max(0,postTotal*.125-currentBond),gapTotal=broadGap+bondGap;
 let broad=round(targetAmount(planned,gapTotal,broadGap)),bond=round(targetAmount(planned,gapTotal,bondGap));if(broad+bond>planned){const over=broad+bond-planned;broad=Math.max(0,broad-over)}let remainder=planned-broad-bond;if(remainder>0)broad+=remainder;
 const proposals=[],push=(kind,amount)=>{if(amount<=0)return;const row=candidate(board,kind);if(!row){proposals.push({bucket:kind,amountCzk:round(amount),ticker:null,name:null,blocked:true,reason:`V portfoliu není rozpoznaná ${kind==='BOND'?'dluhopisová':'široká ETF'} cílová pozice.`});return}const p=row.p,accountCurrency=upper(p.accountCurrency||'CZK'),rate=currencyRate(audit,accountCurrency),accountAmount=rate?amount/rate:null,quote=securityCzkPrice(p),estimatedQty=quote?.czkPrice>0?amount/quote.czkPrice:null;proposals.push({bucket:kind,amountCzk:round(amount),ticker:p.ticker,name:p.name||p.ticker,accountCurrency,accountAmount:accountAmount===null?null:Math.round(accountAmount*100)/100,estimatedQty:estimatedQty===null?null:round4(estimatedQty),quote,blocked:!rate,reason:kind==='BOND'?'Dorovnat dluhopisovou složku směrem ke středu cílového pásma 10–15 %.':'Dorovnat široké akciové jádro směrem ke středu cílového pásma 50–60 %.'})};push('BROAD',broad);push('BOND',bond);
 const allocated=proposals.filter(x=>!x.blocked).reduce((s,x)=>s+x.amountCzk,0),blocked=proposals.some(x=>x.blocked);
 return {...base,ok:!blocked,blocked,reason:blocked?'Část plánu nemá bezpečně určený cíl nebo FX.':'Plán vychází z FX-korektní alokační mezery, ne z hádání krátkodobého směru trhu.',postTotalCzk:round(postTotal),gapsCzk:{broad:round(broadGap),bond:round(bondGap)},allocations:proposals,allocatedCzk:round(allocated),unallocatedCzk:round(planned-allocated),note:'Orientační počet kusů se ukáže jen s čerstvým veřejným quote a skutečným FX. Jde o návrh; Kamil OS obchod neodesílá.'};
}

export const xtbContribution32Contract={autoTrade:false,requiresFreshXtb:true,requiresCompleteFx:true,targetMidpoints:{broadPct:55,bondPct:12.5},quoteOnlyForEstimatedQty:true};
