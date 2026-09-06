import {store} from './state.js';
import {modal,h,toast,uid} from './utils.js';
import {loadTicketCloud660} from './ticketCloud660.js';
import {buildPropertyDecision472} from './propertyDecision472.js';
import {unifiedCapitalState160} from './unifiedCapital160.js';
import {buildManagerDeadlines481} from './managerDeadlines481.js';

const VERSION='737.0.0';
const A=v=>Array.isArray(v)?v:[];
const N=v=>Number.isFinite(Number(v))?Number(v):0;
const U=v=>String(v||'').toUpperCase();
const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const closed=x=>['DONE','CLOSED','ARCHIVED','RESOLVED','PAID','CANCELLED','CANCELED','SOLD','PAYOUT RECEIVED'].includes(U(x?.status||x?.workflow||x?.market_status));
const money=v=>`${Math.round(N(v)).toLocaleString('cs-CZ')} Kč`;
const pct=v=>`${N(v).toFixed(1).replace('.',',')} %`;
const date=v=>{const t=Date.parse(v||'');return Number.isFinite(t)?new Date(t).toLocaleDateString('cs-CZ'):'—'};
const dayDiff=v=>{const t=Date.parse(v||'');return Number.isFinite(t)?Math.ceil((t-Date.now())/86400000):null};
const escAttr=v=>h(v).replace(/`/g,'&#96;');

function ticketLocal(s){return A(s.ticketBook?.items).map(x=>({id:x.id,event_name:x.eventName||x.name||'Vstupenka',qty:N(x.qty)||1,event_date:x.date||x.eventDate||null,buy_total_czk:N(x.buy)||N(x.buyTotalCzk),sell_total_czk:N(x.sell)||N(x.sellTotalCzk),buy_each_czk:(N(x.buy)||N(x.buyTotalCzk))/(N(x.qty)||1),sell_each_czk:(N(x.sell)||N(x.sellTotalCzk))/(N(x.qty)||1),ask_each_czk:N(x.listPrice),market_status:x.marketStatus||x.workflow||'NOT_LISTED',payout_received_czk:N(x.payoutReceivedCzk),marketplace_fee_czk:N(x.marketplaceFeeCzk)}));}
export async function ticketTruth718(s=store.get()){
 let cloud=null;try{cloud=await loadTicketCloud660()}catch{}
 const inventory=cloud?.ok?A(cloud.inventory):ticketLocal(s),latest=cloud?.ok?cloud.latest:new Map();
 const rows=inventory.map(x=>{const snap=latest?.get?.(x.id)||null,status=U(x.market_status||x.marketStatus),buy=N(x.buy_total_czk)||N(x.buy_each_czk)*Math.max(1,N(x.qty)),sell=N(x.sell_total_czk)||N(x.sell_each_czk)*Math.max(1,N(x.qty)),payout=N(x.payout_received_czk),fee=N(x.marketplace_fee_czk),netRevenue=payout||Math.max(0,sell-fee),netPnl=(payout||sell)?netRevenue-buy:null,action=snap?.recommendation_label||snap?.recommendation_code||(['LISTED','NOT_LISTED'].includes(status)?'OVĚŘIT DATA':'BEZ AKCE');return{...x,status,buy,sell,payout,fee,netRevenue,netPnl,snap,action,marketPrice:N(snap?.market_price_czk),recommendedAsk:N(snap?.recommended_ask_czk)}});
 const active=rows.filter(x=>['LISTED','NOT_LISTED'].includes(x.status)),sold=rows.filter(x=>['SOLD_UNDELIVERED','SOLD_WAITING_PAYMENT','PAID'].includes(x.status));
 const invested=active.reduce((a,x)=>a+x.buy,0),realized=rows.reduce((a,x)=>a+(x.netPnl??0),0),awaiting=sold.filter(x=>x.status!=='PAID').reduce((a,x)=>a+(x.sell||x.payout),0),received=rows.reduce((a,x)=>a+x.payout,0);
 const byEvent=new Map();for(const x of active){const k=x.event_name||'Event';byEvent.set(k,(byEvent.get(k)||0)+x.buy)}const concentration=[...byEvent].map(([event,amount])=>({event,amount,share:invested?amount/invested:0})).sort((a,b)=>b.amount-a.amount);
 return{source:cloud?.ok?'ticket_cloud':'local_ticket_book',cloudOk:!!cloud?.ok,rows,active,sold,invested,realized,awaiting,received,concentration,risk:concentration[0]?.share>=.5?'HIGH':concentration[0]?.share>=.3?'MEDIUM':'LOW'};
}

export function propertyTruth723(s=store.get()){
 const engine=buildPropertyDecision472(s),rows=A(engine.candidates).map(x=>{const realistic=x.netYield*100,optimistic=((x.annualGross-(N(x.annualGross)*.03)-(N(x.annualGross)*.03)-N(x.monthlyFund||0)*12)/Math.max(1,x.totalCost))*100,crisis=((x.monthlyRent*.85*12*.78)-N(x.monthlyFund||0)*12)/Math.max(1,x.totalCost)*100;return{...x,netYieldPct:realistic,scenarios:{optimistic,realistic,crisis}}});return{source:'propertyBook.candidates',rows,best:rows[0]||null,counts:engine.counts};
}

function bankAssets(s){return A(s.assetBook?.items).filter(x=>/bank|spor|ucet|deposit|cash/i.test(norm(`${x.type} ${x.category} ${x.name}`))).map(x=>({name:x.name||x.title||'Účet',balance:N(x.balanceCzk||x.valueCzk||x.value||x.amount),rate:N(x.interestRate||x.rate||x.apy),updatedAt:x.updatedAt||x.asOf||null}));}
export async function moneyTruth726(s=store.get()){
 const capital=await unifiedCapitalState160(s).catch(()=>({cashKnown:false,cash:0,ticketCapital:0,xtbValue:0})),accounts=bankAssets(s),cash=capital.cashKnown?N(capital.cash):N(s.financePlan?.cashNow),reserve=Math.max(N(s.financePlan?.reserveFloor),cash*.15),ticket=Math.max(0,N(capital.ticketCapital)),xtb=Math.max(0,N(s.xtbReport?.czkValue)+N(s.xtbReport?.eurValue)),propertyCommitted=propertyTruth723(s).rows.filter(x=>x.decision?.code==='BUY').reduce((a,x)=>a+N(x.purchasePrice),0),free=Math.max(0,cash-reserve);
 const allocation={reserve,ticket,xtb,property:propertyCommitted,free};const rates=accounts.filter(x=>x.rate>0).sort((a,b)=>b.rate-a.rate),best=rates[0]||null,current=rates.find(x=>x.balance>0)||null,deltaRate=best&&current?Math.max(0,best.rate-current.rate):0,monthlyDelta=best&&current?current.balance*deltaRate/100/12:null;
 const drift=cash>Math.max(500000,reserve*2)&&(accounts.length===0||!best)?'NEOVĚŘENÉ ÚROČENÍ':cash>Math.max(1000000,reserve*3)&&best&&best.rate<2?'NÍZKÉ ÚROČENÍ':'OK';
 return{capital,accounts,allocation,drift,bankComparator:{current,best,monthlyDelta,needsExternalRates:accounts.length<2}};
}

function classifyInbox(x){const t=norm(`${x.title||x.name||''} ${x.note||x.notes||''}`);if(/faktur|zaplat|platb|splatn/.test(t))return'ZAPLATIT';if(/odpoved|odeps|email|mail|potvrdit/.test(t))return'ODPOVĚDĚT';if(/cek|vyjadren|schvalen|odpovi/.test(t))return'ČEKAT';if(/deleg|predat|poslat .* koleg/.test(t))return'DELEGOVAT';return'ZPRACOVAT';}
function inboxIntel729(s){return A(s.personalInbox?.items).filter(x=>!closed(x)).map(x=>({...x,intent:classifyInbox(x)}));}
function followups730(s){return A(s.delegations).filter(x=>!closed(x)).map(x=>({...x,due:x.followUpAt||x.due||x.deadline||null,days:dayDiff(x.followUpAt||x.due||x.deadline)})).filter(x=>x.days!==null&&x.days<=0).sort((a,b)=>a.days-b.days);}
function workTruth731(){const m=buildManagerDeadlines481();return{rows:m.rows.map(x=>({...x,riskScore:N(x.risk),band:x.risk>=85?'CRITICAL':x.risk>=65?'HIGH':x.risk>=40?'MEDIUM':'LOW'})),recommendation:m.recommendation,overdue:m.overdue.length,missingDeadline:m.missingDeadline.length};}
function documents733(s){const rows=[...A(s.documents?.items),...A(s.documentBook?.items),...A(s.personalDocuments?.items),...A(s.emergencyFile?.assets)].filter((x,i,a)=>a.findIndex(y=>(y.id||y.name||y.title)===(x.id||x.name||x.title))===i);return rows.map(x=>{const expiry=x.expiresAt||x.expiry||x.validTo||x.due||null,d=dayDiff(expiry);let status='AKTUÁLNÍ';if(!expiry)status='NEOVĚŘENO';else if(d<0)status='EXPIROVÁNO';else if(d<=30)status='BRZY EXPIRUJE';return{...x,title:x.title||x.name||'Dokument',expiry,days:d,status}});}
function recurring734(s){return [...A(s.tasks),...A(s.routines),...A(s.personalAdmin?.items)].filter(x=>!closed(x)&&(x.recurrence||x.repeat||x.frequency||x.interval)).map(x=>({id:x.id,title:x.title||x.name||'Opakovaná věc',recurrence:x.recurrence||x.repeat||x.frequency||x.interval,next:x.nextAt||x.due||x.deadline||null}));}
function entities735(s,truth){const e=[];for(const x of A(s.tasks))e.push({type:'úkol',title:x.title||x.name||'Úkol',meta:x.status||'',route:'today'});for(const x of truth.tickets.rows)e.push({type:'vstupenka',title:x.event_name,meta:`${x.status} · ${money(x.buy)}`,route:'tickets'});for(const x of truth.property.rows)e.push({type:'reality',title:x.name,meta:`${x.decision?.action||''} · net ${pct(x.netYieldPct)}`,route:'money'});for(const x of truth.work.rows)e.push({type:'práce',title:x.title,meta:`risk ${x.riskScore}`,route:'today'});for(const x of truth.documents)e.push({type:'dokument',title:x.title,meta:x.status,route:'more'});for(const x of A(s.assetBook?.items))e.push({type:'finance',title:x.name||x.title||'Aktivum',meta:money(x.valueCzk||x.value||x.balanceCzk),route:'money'});return e;}
export function universalEntitySearch735(q,truth=window.__KAMIL_TRUTH737__?.model){if(!truth||!String(q||'').trim())return[];const qq=norm(q);return truth.entities.filter(x=>norm(`${x.title} ${x.type} ${x.meta}`).includes(qq)).slice(0,20)}

function decisionHistory736(s){return A(s.decisionJournal737?.items).slice().sort((a,b)=>String(b.at||'').localeCompare(String(a.at||'')));}
function learning737(history){const groups={};for(const x of history){const k=x.area||x.kind||'other',g=groups[k]||(groups[k]={count:0,positive:0,negative:0,score:0});if(x.outcome===null||x.outcome===undefined)continue;g.count++;const v=N(x.outcome);if(v>0)g.positive++;if(v<0)g.negative++;g.score+=v}for(const g of Object.values(groups))g.bias=g.count?Math.max(-20,Math.min(20,g.score/g.count)):0;return groups;}
export function recordDecision736({area='other',decision,subject='',reason='',outcome=null,meta={}}={}){store.mutate(`Decision history: ${decision||subject}`,s=>{s.decisionJournal737=s.decisionJournal737||{items:[]};s.decisionJournal737.items=A(s.decisionJournal737.items);s.decisionJournal737.items.unshift({id:uid('decision'),at:new Date().toISOString(),area,decision:decision||'REVIEW',subject,reason,outcome,meta});s.decisionJournal737.items=s.decisionJournal737.items.slice(0,500)},{undo:true,cloud:true,audit:true});return true;}

export async function buildTruth737(s=store.get()){
 const [tickets,moneyState]=await Promise.all([ticketTruth718(s),moneyTruth726(s)]),property=propertyTruth723(s),work=workTruth731(),inbox=inboxIntel729(s),followups=followups730(s),documents=documents733(s),recurring=recurring734(s),history=decisionHistory736(s),learning=learning737(history);const truth={version:VERSION,tickets,property,money:moneyState,inbox,followups,work,documents,recurring,history,learning};truth.entities=entities735(s,truth);truth.health={ticketSource:tickets.source,propertySource:property.source,bankRatesVerified:!moneyState.bankComparator.needsExternalRates,workSource:'manager341 via manager481',decisionSamples:history.length};return truth;
}

function row(label,value,meta=''){return`<div class="truth737-row"><div><b>${h(label)}</b>${meta?`<small>${h(meta)}</small>`:''}</div><span>${h(value)}</span></div>`}
function card(title,body){return`<section class="truth737-card"><div class="eyebrow">${h(title)}</div>${body}</section>`}
function html(m){const t=m.tickets,p=m.property,mo=m.money,w=m.work,b=mo.bankComparator;return`<div class="truth737" data-truth737>
${card('OS718–722 · TICKET TRUTH',`${row('Zdroj',t.source)}${row('Aktivní kapitál',money(t.invested))}${row('Realizovaný net P&L',money(t.realized))}${row('Čeká na payout',money(t.awaiting))}${row('Připsáno',money(t.received))}${row('Koncentrační riziko',t.risk,t.concentration[0]?`${t.concentration[0].event} · ${(t.concentration[0].share*100).toFixed(0)} %`:'bez expozice')}`)}
${card('OS723–725 · PROPERTY TRUTH',`${row('Kandidáti',String(p.rows.length),p.best?.name||'bez kandidáta')}${row('Verdikt',p.best?.decision?.action||'—')}${row('Net yield',p.best?pct(p.best.netYieldPct):'—')}${row('Krizový scénář',p.best?pct(p.best.scenarios.crisis):'—')}`)}
${card('OS726–728 · CASH ALLOCATION',`${row('Rezerva',money(mo.allocation.reserve))}${row('Volný cash',money(mo.allocation.free))}${row('Money drift',mo.drift)}${row('Bank comparator',b.needsExternalRates?'CHYBÍ EXTERNÍ SAZBY':(b.monthlyDelta!==null?`+${money(b.monthlyDelta)} / měs.`:'bez rozdílu'),b.best?.name||'')}`)}
${card('OS729–732 · INBOX / FOLLOW-UP / WORK',`${row('Inbox k akci',String(m.inbox.length),m.inbox[0]?`${m.inbox[0].intent}: ${m.inbox[0].title||m.inbox[0].name}`:'čistý')}${row('Follow-up po termínu',String(m.followups.length),m.followups[0]?.title||m.followups[0]?.name||'nic')}${row('Pracovní overdue',String(w.overdue),w.recommendation?.title||'')}${row('Bez termínu',String(w.missingDeadline))}`)}
${card('OS733–735 · DOCUMENTS / RECURRING / SEARCH',`${row('Dokumenty',String(m.documents.length),m.documents.filter(x=>x.status!=='AKTUÁLNÍ').length+' k ověření')}${row('Opakované věci',String(m.recurring.length))}<div class="truth737-search"><input class="command-input" data-truth737-search placeholder="Hledej osoby, byty, ticket, projekt…"><button class="btn" data-truth737-go>Hledat</button></div><div data-truth737-results></div>`)}
${card('OS736–737 · DECISION HISTORY / LEARNING',`${row('Rozhodnutí v historii',String(m.history.length))}${row('Learning oblasti',String(Object.keys(m.learning).length),Object.entries(m.learning).slice(0,3).map(([k,v])=>`${k}: ${v.bias.toFixed(1)}`).join(' · ')||'čeká na výsledky')}<button class="btn" data-truth737-record>Zapsat aktuální verdikt</button>`)}
</div>`}
function bind(root,m){const input=root?.querySelector('[data-truth737-search]'),out=root?.querySelector('[data-truth737-results]');root?.querySelector('[data-truth737-go]')?.addEventListener('click',()=>{const rows=universalEntitySearch735(input?.value,m);out.innerHTML=rows.length?rows.map(x=>`<div class="truth737-hit"><b>${h(x.title)}</b><small>${h(x.type)} · ${h(x.meta)}</small></div>`).join(''):'<div class="empty">Nic nenalezeno.</div>'});root?.querySelector('[data-truth737-record]')?.addEventListener('click',()=>{const best=m.property.best,subject=best?.name||m.work.recommendation?.title||'Kamil OS';recordDecision736({area:best?'property':'work',decision:best?.decision?.action||m.work.recommendation?.action||'REVIEW',subject,reason:best?.decision?.reason||m.work.recommendation?.reason||''});toast('Rozhodnutí zapsáno do historie.');setTimeout(openTruthCenter737,100);document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}))})}
function ensureCss(){if(document.querySelector('link[data-truth737-css]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href='./truth737.css';l.dataset.truth737Css='1';document.head.appendChild(l)}
export async function openTruthCenter737(){ensureCss();const m=await buildTruth737();window.__KAMIL_TRUTH737__={version:VERSION,healthy:true,model:m,open:openTruthCenter737,at:Date.now()};const p=modal('Kamil OS · Truth & Learning',html(m),[{label:'Zavřít',value:null,primary:true}]);setTimeout(()=>bind(document.querySelector('#modalHost [data-truth737]'),m),0);return p}
export async function refreshTruth737(){const m=await buildTruth737();window.__KAMIL_TRUTH737__={version:VERSION,healthy:true,model:m,open:openTruthCenter737,at:Date.now()};document.documentElement.dataset.truth737='1';return m}
