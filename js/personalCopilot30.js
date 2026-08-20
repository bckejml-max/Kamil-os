import {smartBriefing,dataQuality} from './autopilot28.js';
import {trueNetWorth} from './netWorth29.js';
import {spendingIntelligence} from './spendingIntelligence29.js';
import {portfolioRiskMap} from './portfolioRiskMap29.js';
import {portfolioRebalancePlan,REBALANCE_BUCKETS} from './portfolioRebalancer29.js';
import {ticketProfitLedger} from './ticketProfit29.js';
import {personalMonthlyReview} from './monthlyReview29.js';
import {nextMonthPlan} from './nextMonthPlanner29.js';
import {yearAheadRadar} from './yearAheadRadar29.js';

const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const ccy=v=>String(v||'CZK').toUpperCase();
const money=(v,c)=>`${Math.round(Number(v)||0).toLocaleString('cs-CZ')} ${c}`;
const pct=v=>v===null||v===undefined?'—':`${Number(v).toLocaleString('cs-CZ',{maximumFractionDigits:1})} %`;
const answer=(intent,title,lines,note,evidence=[])=>({kind:'PERSONAL_COPILOT_30',intent,title,lines:lines.filter(Boolean).slice(0,14),note,evidence});
const formatByCurrency=(map,field,label='')=>Object.entries(map||{}).filter(([,v])=>Number.isFinite(Number(v?.[field]))).map(([c,v])=>`${label}${money(v[field],c)}`);

function amountFrom(raw){
 const q=String(raw||'');let m=q.match(/(?:za|vloz(?:it)?|invest(?:ovat|ice)?|vklad)\s*([0-9][0-9\s.,]*)(?:\s*(tis(?:ic)?|k))?\s*(czk|kč|kc|eur|€|usd|\$)?/i);
 if(!m)m=q.match(/([0-9][0-9\s.,]*)(?:\s*(tis(?:ic)?|k))?\s*(czk|kč|kc|eur|€|usd|\$)/i);if(!m)return null;
 let rawNum=String(m[1]).replace(/\s/g,'').replace(',','.');let value=Number(rawNum);if(!Number.isFinite(value)||value<=0)return null;if(m[2])value*=1000;
 const token=String(m[3]||m[4]||'').toLowerCase(),currency=token.includes('eur')||token==='€'?'EUR':token.includes('usd')||token==='$'?'USD':token?'CZK':null;
 return {value,currency};
}
function currencyFrom(raw,fallback='CZK'){const q=String(raw||'').toLowerCase();if(/\beur\b|€/.test(q))return'EUR';if(/\busd\b|\$/.test(q))return'USD';if(/\bczk\b|kč|\bkc\b/.test(q))return'CZK';return ccy(fallback)}

function statusAnswer(s,meta,now){
 const brief=smartBriefing(s,meta,now),nw=trueNetWorth(s,now),risk=portfolioRiskMap(s),tickets=ticketProfitLedger(s),lines=[];
 if(brief.today.length){lines.push(...brief.today.slice(0,3).map((x,i)=>`${i+1}. ${x.title} — ${x.reason||x.kind||'řešit'}`))}else lines.push('Dnes z uložených osobních dat nevychází žádný zásadní krok.');
 for(const c of nw.currencies)lines.push(`Čisté jmění ${c}: ${money(nw.byCurrency[c].net,c)} · aktiva ${money(nw.byCurrency[c].assets,c)} · závazky ${money(nw.byCurrency[c].liabilities,c)}`);
 if(risk.ok&&risk.riskScore!==null)lines.push(`XTB risk: ${risk.riskScore}/100 · ${risk.riskLabel}${risk.drivers?.[0]?` · hlavní driver: ${risk.drivers[0].label}`:''}`);else if(risk.code==='PARTIAL_FX')lines.push(`XTB risk: globální skóre skryté — chybí FX pro ${risk.missingCurrencies.join(', ')}.`);else lines.push('XTB risk: bez aktivních pozic pro vyhodnocení.');
 for(const c of tickets.currencies)lines.push(`Vstupenky ${c}: realizovaný P/L ${money(tickets.byCurrency[c].realizedProfit,c)} · payout čeká ${money(tickets.byCurrency[c].payoutPending,c)} · otevřený kapitál ${money(tickets.byCurrency[c].openCapital,c)}`);
 const gaps=[...nw.gaps.slice(0,1),...tickets.gaps.slice(0,1)];return answer('STATUS','Jak jsi na tom',lines,`Souhrn je jen z uložených dat. ${gaps.join(' ')}`,[brief.note,nw.note,risk.note,tickets.note]);
}
function netWorthAnswer(s,now){const r=trueNetWorth(s,now),lines=[];for(const c of r.currencies){const b=r.byCurrency[c];lines.push(`${c}: čisté jmění ${money(b.net,c)} · aktiva ${money(b.assets,c)} · závazky ${money(b.liabilities,c)} · likvidní aktiva ${money(b.liquidAssets,c)}`)}if(r.base.complete&&r.currencies.length>1)lines.push(`Přepočtený součet při dostupném skutečném FX: ${money(r.base.net,r.baseCurrency)}.`);if(!r.currencies.length)lines.push('Zatím nejsou uložené hodnoty pro výpočet čistého jmění.');return answer('NET_WORTH','Čisté jmění',lines,[r.note,...r.gaps].join(' '),['True Net Worth']);}
function riskAnswer(s){const r=portfolioRiskMap(s),lines=[];if(!r.ok)return answer('PORTFOLIO_RISK','Portfolio risk',['V XTB nejsou aktivní pozice pro mapu rizika.'],r.message||r.note||'Bez dat.');if(r.riskScore===null){lines.push(`Globální skóre nevyrábím — chybí skutečný FX pro ${r.missingCurrencies.join(', ')}.`);for(const [c,x] of Object.entries(r.byCurrency||{}))lines.push(`${c}: největší pozice ${pct(x.top1Pct)} · Top 3 ${pct(x.top3Pct)} · efektivní počet pozic ${x.effectivePositions}.`);return answer('PORTFOLIO_RISK','Portfolio risk bez falešného FX',lines,r.note,['Portfolio Risk Map']);}lines.push(`Risk score ${r.riskScore}/100 · ${r.riskLabel}.`);lines.push(`Největší pozice ${pct(r.global.concentration.top1Pct)} · Top 3 ${pct(r.global.concentration.top3Pct)} · efektivní počet pozic ${r.global.concentration.effectivePositions}.`);lines.push(`Alokace: široké ETF ${pct(r.global.buckets.broad.pct)} · dluhopisy ${pct(r.global.buckets.bond.pct)} · satelity ${pct(r.global.buckets.satellite.pct)}.`);for(const x of (r.drivers||[]).slice(0,3))lines.push(`${x.label}: +${x.points} bodů rizika — ${x.detail}`);return answer('PORTFOLIO_RISK','Jak je na tom portfolio',lines,r.note,['Portfolio Risk Map']);}
function rebalanceAnswer(raw,s){const parsed=amountFrom(raw);if(!parsed)return answer('REBALANCE','Co koupit za nový vklad',['Doplň částku, například „Co koupit za 25 000 Kč?“'],'Bez částky Kamil OS nevyrábí nákupní plán. Plán je alokační rebalancování, ne živé tržní doporučení.');const currency=parsed.currency||currencyFrom(raw,s.financePlan?.currency||'CZK'),r=portfolioRebalancePlan(s,{contribution:parsed.value,currency});if(!r.ok)return answer('REBALANCE','Rebalanční plán nevytvořen',[r.message],r.code==='MISSING_FX'?'Bez skutečného FX kurzu se měny nesčítají ani nepřepočítávají.':r.message,['Portfolio Rebalancer']);const lines=[`Nový vklad: ${money(r.contribution,r.currency)} · odchylka ${pct(r.currentDriftPct)} → ${pct(r.afterDriftPct)}.`];for(const k of REBALANCE_BUCKETS){const b=r.byBucket[k];if(b.buyAmount>0.01)lines.push(`${b.label}: ${money(b.buyAmount,r.currency)} · po vkladu ${pct(b.afterPct)} proti cíli ${pct(b.targetPct)}.`)}for(const t of r.trades){if(t.requiresChoice)lines.push(`${t.label}: ${money(t.baseAmount,t.baseCurrency)} — ticker musíš vybrat ručně.`);else lines.push(`${t.ticker}: přibližně ${money(t.nativeAmount,t.nativeCurrency)}${t.nativeCurrency!==t.baseCurrency?` (${money(t.baseAmount,t.baseCurrency)} v měně vkladu)`:''}.`)}if(!r.perfect)lines.push('Samotný nový vklad nedokáže portfolio dokonale dorovnat; zbytková odchylka zůstává viditelná.');return answer('REBALANCE',`Co koupit za ${money(r.contribution,r.currency)}`,lines,r.note,['Portfolio Rebalancer']);}
function ticketAnswer(s){const r=ticketProfitLedger(s),lines=[];if(!r.currencies.length)lines.push('Zatím není žádný aktivní ani realizovaný ticket obchod.');for(const c of r.currencies){const b=r.byCurrency[c];lines.push(`${c}: realizovaný P/L ${money(b.realizedProfit,c)} · ROI ${pct(b.realizedRoi)} · ${b.realizedTrades} realizovaných obchodů.`);lines.push(`${c}: vyplacené tržby ${money(b.cashReceived,c)} · čekající payout ${money(b.payoutPending,c)} · otevřený kapitál ${money(b.openCapital,c)}.`);if(b.missingSaleCount)lines.push(`${c}: ${b.missingSaleCount} prodaných/payout pozic nemá skutečnou prodejní částku.`)}return answer('TICKETS','Jak jsou na tom vstupenky',lines,r.note,['Ticket Profit & ROI Ledger']);}
function spendingAnswer(s,now){const r=spendingIntelligence(s,now),lines=[];if(!r.currencies.length)lines.push('Nejsou importované transakce pro Spending Intelligence.');for(const c of r.currencies){const b=r.byCurrency[c],change=b.pct===null?'bez srovnatelného minulého období':`${b.pct>=0?'+':''}${pct(b.pct)} proti stejným dnům minulého měsíce`;lines.push(`${c}: výdaje tento měsíc ${money(b.spentMtd,c)} · ${change}.`);lines.push(`${c}: příjmy ${money(b.incomeMtd,c)} · převody mimo spotřebu ${money(b.transferVolume,c)}.${b.categories[0]?` Největší kategorie ${b.categories[0].category}: ${money(b.categories[0].current,c)}.`:''}`)}return answer('SPENDING','Jak utrácíš',lines,r.note,['Spending Intelligence']);}
function monthAnswer(s,meta,now){const r=personalMonthlyReview(s,meta,now),lines=[];if(r.attention.length)lines.push(...r.attention.slice(0,5).map(x=>`${x.title} — ${x.detail}`));else lines.push('Do konce měsíce z uložených dat nevychází nový zásadní blokátor.');for(const [c,v] of Object.entries(r.goalProgressByCurrency||{}))if(Number(v)>0)lines.push(`Skutečně zapsané příspěvky do cílů ${c}: ${money(v,c)}.`);return answer('MONTH_REVIEW','Tento měsíc',lines,r.note,['Personal Monthly Review']);}
function nextMonthAnswer(s,now){const r=nextMonthPlan(s,now),c=r.cashflow.currency,lines=[`Známý cashflow: ${r.cashflow.net>=0?'+':''}${money(r.cashflow.net,c)} · minimum ${money(r.cashflow.minBalance,c)} proti rezervě ${money(r.cashflow.reserve,c)} · stav ${r.cashflow.status}.`];if(r.attention.length)lines.push(...r.attention.slice(0,5).map(x=>`${x.title} — ${x.detail}`));else lines.push('Z uložených dat pro příští měsíc nevychází nový blokátor.');for(const [currency,v] of Object.entries(r.goals.byCurrency||{}))if(v.planned>0)lines.push(`Plánované cíle ${currency}: ${money(v.planned,currency)} / měsíc.`);return answer('NEXT_MONTH','Co příští měsíc',lines,r.note,['Personal Next-Month Planner']);}
function yearAnswer(s,now){const r=yearAheadRadar(s,now),lines=[];for(const [c,v] of Object.entries(r.totalOutflowByCurrency||{}))lines.push(`Známé výdaje příštích 12 měsíců ${c}: ${money(v,c)}.`);for(const x of Object.values(r.peaksByCurrency||{}))lines.push(`${x.currency}: nejvyšší známý měsíční odtok ${money(x.outflow,x.currency)} v ${x.month}.`);if(r.milestones?.length)lines.push(...r.milestones.slice(0,5).map(x=>`${x.title} — ${String(x.at).slice(0,10)} · ${x.domain}.`));if(!lines.length)lines.push('V dalších 12 měsících nejsou uložené použitelné položky.');return answer('YEAR_AHEAD','12 měsíců dopředu',lines,r.note,['Year Ahead Radar']);}
function qualityAnswer(s,meta,now){const q=dataQuality(s,meta,now),lines=q.top.map(x=>`${x.title} — ${x.detail}`);if(!lines.length)lines.push('Data Quality teď nevidí zásadní chybějící osobní údaj.');return answer('DATA_QUALITY','Co chybí doplnit',lines,q.note,['Data Quality']);}

export function personalCopilot30(raw,s={},meta={},now=new Date()){
 const q=norm(raw);if(!q)return null;
 if(/jak jsem na tom|shrnuti|souhrn|stav vseho|prehled vseho|co je dulezite/.test(q))return statusAnswer(s,meta,now);
 if(/ciste jmeni|net worth|majetek minus|kolik mam majetku/.test(q))return netWorthAnswer(s,now);
 if(/co koupit|jak rozdelit.*vklad|jak investovat.*\d|rebalanc/.test(q))return rebalanceAnswer(raw,s);
 if(/portfolio|xtb.*rizik|rizik.*xtb|investicni rizik/.test(q))return riskAnswer(s);
 if(/vstupenk|ticket.*(?:zisk|roi|payout|stav)|payout/.test(q))return ticketAnswer(s);
 if(/jak utrac|utracim|vydaje|spending|kam.*penize/.test(q))return spendingAnswer(s,now);
 if(/pristi mesic|dalsi mesic/.test(q))return nextMonthAnswer(s,now);
 if(/12 mesic|rok dopredu|pristi rok|year ahead/.test(q))return yearAnswer(s,now);
 if(/tento mesic|mesicni review|review mesice/.test(q))return monthAnswer(s,meta,now);
 if(/co chybi|doplnit data|data quality/.test(q))return qualityAnswer(s,meta,now);
 return null;
}

export const personalCopilot30Note='Personal Copilot 30 je deterministická read-only orchestrace existujících modulů Kamil OS. Nevolá obchod, platbu ani prodej a nevymýšlí chybějící FX, tržní ceny, confidence ani zdroje.';
