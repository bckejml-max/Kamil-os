import {store} from './state.js';
import {modal,h} from './utils.js';
import {buildStrategy788,universalAnswer786} from './strategy788.js';

export const COPILOT840_VERSION='840.0.0';
const A=v=>Array.isArray(v)?v:[];
const N=v=>Number.isFinite(Number(v))?Number(v):0;
const U=v=>String(v||'').toUpperCase();
const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const money=v=>`${Math.round(N(v)).toLocaleString('cs-CZ')} Kč`;
const pct=v=>`${N(v).toFixed(1).replace('.',',')} %`;
const closed=x=>['DONE','CLOSED','ARCHIVED','RESOLVED','PAID','CANCELLED','CANCELED','SOLD','PAYOUT RECEIVED','VOID','WON','LOST'].includes(U(x?.status||x?.workflow||x?.market_status));
const when=v=>{const t=Date.parse(v||'');return Number.isFinite(t)?t:null};
const days=v=>{const t=when(v);return t===null?null:Math.ceil((t-Date.now())/86400000)};
const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,N(v)));
const taskTitle=x=>x?.title||x?.name||x?.summary||x?.event_name||'Položka';

function domainConfidence(m){
 const ticketStale=A(m.sla?.ticket).filter(x=>x.stale).length;
 const propStale=A(m.sla?.property).filter(x=>x.stale).length;
 const base=N(m.confidence||0);
 return{
  overall:base,
  tickets:clamp(base-ticketStale*5),
  property:clamp(base-propStale*7),
  money:clamp(base-(m.sla?.money?.stale?15:0)),
  work:clamp(base-(m.sla?.work?.stale?15:0)),
  betting:clamp(base-(m.betting?.settled?.length?0:18))
 };
}
function dataMissing(m){return A(m.audit?.gaps||m.audit?.issues).map((x,i)=>({id:x.id||`gap-${i}`,title:x.title||x.label||x.message||String(x),area:x.area||x.domain||'DATA',action:x.action||'Doplnit / ověřit'}));}
function commandShortcuts(){return[
 {key:'/today',label:'Co mám řešit teď?',query:'co mám teď řešit'},
 {key:'/cash',label:'Kolik mám volný cash?',query:'kolik mám volný cash'},
 {key:'/tickets',label:'Kolik mám ve vstupenkách?',query:'kolik mám ve vstupenkách'},
 {key:'/property',label:'Který byt je nejlepší?',query:'který byt je nejlepší'},
 {key:'/bets',label:'Jaké je riziko sázek?',query:'jaké je riziko sázek'},
 {key:'/week',label:'Weekly CEO Review',query:'weekly ceo review'}
]}
function priorityConflicts(m){
 const out=[];
 const cash=N(m.financial?.cash),topProp=m.propertyRanking?.[0],ticket=N(m.truth?.tickets?.invested),todayBet=N(m.betting?.exposure?.today);
 if(topProp&&N(topProp.totalCost||topProp.purchasePrice)>cash*.85)out.push({area:'CAPITAL',title:'Reality vs. likvidní rezerva',detail:'Top realitní kandidát by spotřeboval většinu volné hotovosti.'});
 if(ticket>cash*.35)out.push({area:'TICKETS',title:'Ticket kapitál vs. cash',detail:'V ticketech je vysoký podíl vůči volné hotovosti.'});
 if(todayBet>Math.max(1000,N(m.betting?.bankroll)*.08))out.push({area:'BETTING',title:'Sázková expozice',detail:'Dnešní aktivní stake je vysoký vůči bankrollu.'});
 return out;
}
function capitalAllocation(m){
 const free=Math.max(0,N(m.financial?.cash)),monthly=N(m.financial?.monthlySpend),reserveTarget=Math.max(monthly*6,N(m.financial?.reserve));
 const reserveGap=Math.max(0,reserveTarget-N(m.financial?.reserve));
 const available=Math.max(0,free-reserveGap);
 const top=m.opportunities?.[0];
 return{free,reserveTarget,reserveGap,available,top,verdict:reserveGap>0?'DOPLNIT REZERVU':top?`PROVĚŘIT ${top.type}`:'DRŽET LIKVIDNÍ'};
}
function purchaseWhatIf(m,amount){const a=Math.max(0,N(amount)),cash=N(m.financial?.cash),after=cash-a,monthly=Math.max(1,N(m.financial?.monthlySpend)),months=after/monthly;return{amount,before:cash,after,runwayMonths:months,warning:after<monthly*6?'NARUŠÍ 6M REZERVU':after<0?'NEDOSTATEK CASH':'OK'}}
function moneyMap(m){return[
 {name:'Volný cash',value:N(m.financial?.cash),liquidity:100},
 {name:'Rezerva',value:N(m.financial?.reserve),liquidity:100},
 {name:'XTB',value:N(m.truth?.money?.allocation?.xtb),liquidity:85},
 {name:'Vstupenky',value:N(m.truth?.tickets?.invested),liquidity:35},
 {name:'Reality',value:A(m.propertyRanking).reduce((a,x)=>a+N(x.marketValue||x.totalCost||x.purchasePrice),0),liquidity:20}
].filter(x=>x.value>0)}
function leakageCandidates(s){
 const tx=A(s.personalSpending?.transactions).filter(x=>N(x.amount)<0),groups=new Map();
 for(const x of tx){const k=norm(x.merchant||x.counterparty||x.title||x.note);if(!k)continue;const g=groups.get(k)||[];g.push(x);groups.set(k,g)}
 return[...groups.entries()].filter(([,xs])=>xs.length>=3).map(([name,xs])=>({name,occurrences:xs.length,total:xs.reduce((a,x)=>a+Math.abs(N(x.amount)),0),note:'Opakovaný výdaj – kandidát ke kontrole, ne automaticky zbytečný.'})).sort((a,b)=>b.total-a.total).slice(0,10);
}
function propertyControl(m){
 const rows=A(m.propertyRanking).map(x=>{
  const cost=N(x.totalCost||x.purchasePrice),rent=N(x.monthlyRent||x.rent),yieldPct=N(x.netYieldPct),score=N(x.score);
  const target=rent>0?rent*12/Math.max(.01,Math.max(0.04,yieldPct/100))*0.9:null;
  return{...x,dealScore:Math.round(score),targetPrice:target,rentReality:{conservative:rent*.9,realistic:rent,optimistic:rent*1.08},sellability:cost<5000000?70:55};
 });
 const cash=N(m.financial?.cash);return{rows,best:rows[0]||null,portfolioSimulation:rows.slice(0,2).map((x,i)=>({scenario:i===0?'JEDEN BYT':'DRUHÝ KANDIDÁT',name:x.name,cost:N(x.totalCost||x.purchasePrice),cashAfter:cash-N(x.totalCost||x.purchasePrice),yieldPct:N(x.netYieldPct)}))};
}
function ticketControl(m){
 const rows=A(m.tickets).map(x=>{const d=days(x.event_date),margin=N(x.liveMarginPct),conf=N(x.marketConfidence);let sell='DRŽET';if(/PRODAT/.test(x.exitDeadline||''))sell='PRODAT / OVĚŘIT';else if(d!==null&&d<=14&&margin<10)sell='ZLEVNIT / OVĚŘIT';const buyScore=clamp(50+margin*.8+conf*.25-(N(x.timeDecay)*.35));return{...x,sellNow:sell,buyScore:Math.round(buyScore),deadCapital:d!==null&&d>60&&margin<=0,exposureKey:x.event_name||x.title||'event'}});
 const total=rows.reduce((a,x)=>a+N(x.buy),0),by={};for(const x of rows){const k=x.exposureKey;by[k]=(by[k]||0)+N(x.buy)}const max=Math.max(0,...Object.values(by)),concentration=total?max/total*100:0;
 return{rows,total,concentration,topBuy:[...rows].sort((a,b)=>b.buyScore-a.buyScore)[0]||null,deadCapital:rows.filter(x=>x.deadCapital)};
}
function bettingControl(m,s){
 const open=A(s.bettingLedger?.bets||s.bets).filter(x=>!closed(x)),byMatch=new Map();for(const x of open){const k=norm(`${x.event||x.match||x.home||''}|${x.away||''}|${x.date||x.start||''}`);if(!k)continue;const g=byMatch.get(k)||[];g.push(x);byMatch.set(k,g)}
 const correlated=[...byMatch.values()].filter(xs=>xs.length>1).map(xs=>({title:taskTitle(xs[0]),count:xs.length,stake:xs.reduce((a,x)=>a+N(x.stake),0)}));
 const clv=A(s.bettingLedger?.bets||s.bets).filter(x=>N(x.closingOdds)>0&&N(x.odds)>0).map(x=>({title:taskTitle(x),clv:(N(x.odds)/N(x.closingOdds)-1)*100}));
 const probs=A(s.bettingLedger?.bets||s.bets).filter(x=>N(x.modelProbability)>0&&['WON','LOST'].includes(U(x.status)));const buckets={};for(const x of probs){const b=Math.round(N(x.modelProbability)*10)/10;const g=buckets[b]||{n:0,w:0};g.n++;if(U(x.status)==='WON')g.w++;buckets[b]=g}
 const limit=Math.max(1000,N(m.betting?.bankroll)*.08),stop=N(m.betting?.drawdown)>25||N(m.betting?.exposure?.today)>limit;
 return{correlated,clv,calibration:buckets,limit,stop,stopReason:N(m.betting?.drawdown)>25?'Drawdown > 25 %':N(m.betting?.exposure?.today)>limit?'Dnešní expozice nad limitem':'OK'};
}
function workControl(m){return A(m.work?.board).map(x=>{const overdue=days(x.due)<0;return{...x,riskScore:clamp((overdue?55:0)+(x.owner==='NEPŘIŘAZENO'?25:0)+(!x.detail?15:0)),nextOwner:x.owner||'NEPŘIŘAZENO',followup:`Navázat na ${x.title}: ${x.detail||'ověřit stav a další krok'}`,closeout:A(m.work?.closeout).find(c=>c.id===x.id)}}).sort((a,b)=>b.riskScore-a.riskScore)}
function familyHome(s){const rows=[...A(s.tasks),...A(s.personalAdmin?.items),...A(s.personalGoals?.items)].filter(x=>!closed(x));const family=rows.filter(x=>['FAMILY','RODINA'].includes(U(x.area||x.domain||x.category)));const home=rows.filter(x=>['HOME','DOMOV'].includes(U(x.area||x.domain||x.category)));return{family,home}}
function universalTimeline(m,s){
 const rows=[];const push=(kind,x,date)=>{const t=when(date);if(t!==null)rows.push({kind,title:taskTitle(x),at:t,date:new Date(t).toISOString(),status:x.status||''})};
 for(const x of A(s.tasks))push('TASK',x,x.due||x.deadline);for(const x of A(m.tickets))push('TICKET',x,x.event_date);for(const x of A(m.work?.board))push('WORK',x,x.due);for(const x of A(m.documents?.expiries))push('DOCUMENT',x,x.expiresAt||x.expiry||x.date);return rows.sort((a,b)=>a.at-b.at).slice(0,100);
}
function notificationBrain(m,s,control){
 const n=[];const add=(priority,title,detail,area)=>n.push({priority,title,detail,area});
 for(const x of dataMissing(m).slice(0,3))add(90,'Chybí data',x.title,x.area);
 if(m.strategy?.monthFocus?.[0])add(95,m.strategy.monthFocus[0].action,m.strategy.monthFocus[0].reason,m.strategy.monthFocus[0].area);
 if(control.ticket.deadCapital.length)add(75,'Dead ticket capital',`${control.ticket.deadCapital.length} položek vyžaduje kontrolu.`,'TICKETS');
 if(control.betting.stop)add(100,'Betting stop rule',control.betting.stopReason,'BETTING');
 for(const x of control.work.filter(x=>x.riskScore>=70).slice(0,3))add(85,'Pracovní riziko',x.title,'WORK');
 return n.sort((a,b)=>b.priority-a.priority).slice(0,8);
}
function brief(m,control){const top=m.strategy?.monthFocus?.[0];return{headline:top?`${top.action}: ${top.reason}`:'Nic kritického.',money:`Cash ${money(m.financial?.cash)} · runway ${m.financial?.runway?m.financial.runway.toFixed(1)+' měs.':'—'}`,tickets:`Ticket kapitál ${money(control.ticket.total)} · koncentrace ${pct(control.ticket.concentration)}`,betting:control.betting.stop?`STOP: ${control.betting.stopReason}`:`Betting ROI ${pct(m.betting?.roi)}`,work:`${control.work.filter(x=>x.riskScore>=70).length} vysokých pracovních rizik`}}

export async function buildCopilot840(s=store.get()){
 const strategy=await buildStrategy788(s),confidence=domainConfidence(strategy),capital=capitalAllocation(strategy),property=propertyControl(strategy),ticket=ticketControl(strategy),betting=bettingControl(strategy,s),work=workControl(strategy),areas=familyHome(s),timeline=universalTimeline(strategy,s),conflicts=priorityConflicts(strategy),missing=dataMissing(strategy),leakage=leakageCandidates(s),map=moneyMap(strategy);
 const control={capital,property,ticket,betting,work,areas,timeline,conflicts,missing,leakage,map};
 const notifications=notificationBrain(strategy,s,control),morning=brief(strategy,control),nextBest=notifications[0]||strategy.strategy?.monthFocus?.[0]||null;
 const health=clamp((confidence.overall*.55)+(100-Math.min(100,missing.length*10))*.25+(notifications.filter(x=>x.priority>=95).length?10:20));
 return{version:COPILOT840_VERSION,strategy,confidence,shortcuts:commandShortcuts(),missing,health,nextBest,notifications,morning,evening:{doneToday:A(s.auditLog||s.history).filter(x=>String(x.at||x.date||'').slice(0,10)===new Date().toISOString().slice(0,10)).length,carry:notifications.filter(x=>x.priority>=70)},weekly:strategy.weekly,monthly:strategy.strategy,control,guardrails:{readOnlyByDefault:true,noAutoFinancialExecution:true,noInventedExternalRates:true,noInventedCLV:true,canonicalSourcesOnly:true}};
}

export function autocomplete791(q=''){const n=norm(q);const all=[...commandShortcuts(),{label:'Kolik mám celkem majetku?',query:'kolik mám majetku'},{label:'Co mám dnes udělat?',query:'co mám dnes udělat'},{label:'Kde mám největší riziko?',query:'kde mám největší riziko'},{label:'Co mám tento měsíc dělat víc?',query:'strategie tento měsíc'}];if(!n)return all.slice(0,6);return all.filter(x=>norm(`${x.key||''} ${x.label} ${x.query}`).includes(n)).slice(0,6)}
export function contextualFollowups795(q=''){const n=norm(q);if(/ticket|vstupenk/.test(n))return['Co z toho prodat?','Kde mám největší ticket expozici?'];if(/cash|pen|majet/.test(n))return['Co mám s cash udělat?','Co když koupím byt za 4 miliony?'];if(/byt|realit/.test(n))return['Jaká je cílová cena?','Co když koupím dva byty?'];if(/bet|saz/.test(n))return['Nemám moc korelované sázky?','Platí stop rules?'];return['Proč je to priorita?','Co je druhý nejlepší krok?']}
export function whatIf810(model,amount){return purchaseWhatIf(model.strategy,amount)}
export function answer840(q,model){const n=norm(q),base=universalAnswer786(q,model.strategy);if(base)return base;if(/majet|net worth/.test(n))return`Odhad čistého majetku v canonical datech je ${money(model.strategy.financial.netWorth)}.`;if(/nejvetsi riz|největší riz/.test(n))return model.notifications[0]?`${model.notifications[0].title}: ${model.notifications[0].detail}`:'Nemám aktivní kritické riziko.';if(/dnes.*udel|dnes.*udě|mam dnes|mám dnes/.test(n))return model.nextBest?`${model.nextBest.title||model.nextBest.action}: ${model.nextBest.detail||model.nextBest.reason||''}`:'Dnes nemám kritický další krok.';if(/co.*ticket.*prodat|prodat.*ticket/.test(n)){const x=model.control.ticket.rows.find(x=>/PRODAT|ZLEVNIT/.test(x.sellNow));return x?`${x.event_name||x.title}: ${x.sellNow}.`:'Žádný ticket teď nemá sell alert.'}if(/ticket.*expoz|expoz.*ticket/.test(n))return`Nejvyšší event koncentrace je ${pct(model.control.ticket.concentration)}.`;if(/cilov.*cen|cílov.*cen/.test(n)){const x=model.control.property.best;return x?.targetPrice?`Orientační datový target pro ${x.name} je ${money(x.targetPrice)}. Je to interní výpočet z uloženého nájmu/yieldu, ne tržní odhad.`:'Nemám dost dat pro cílovou cenu.'}if(/stop.*rule|stop.*saz|betting stop/.test(n))return model.control.betting.stop?`STOP: ${model.control.betting.stopReason}`:'Betting stop rule teď není aktivní.';if(/strategie|strategy|mesic|měsíc/.test(n))return model.monthly?.monthFocus?.[0]?`${model.monthly.monthFocus[0].action}: ${model.monthly.monthFocus[0].reason}`:'Nemám dost dat pro měsíční prioritu.';return null}

function row(a,b,c=''){return`<div class="row"><div><b>${h(a)}</b>${c?`<div class="muted">${h(c)}</div>`:''}</div><span>${h(b)}</span></div>`}
function card(t,body){return`<div class="card"><div class="eyebrow">${h(t)}</div>${body}</div>`}
function html(m){const c=m.control;return`<div data-copilot840>${card('OS791–800 · COMMAND & TRUST',`${row('OS Health Score',pct(m.health))}${row('Decision confidence',pct(m.confidence.overall))}${row('Chybějící data',String(m.missing.length))}${row('Priority conflicts',String(c.conflicts.length))}`)}${card('OS801–810 · CONTROL',`${row('Next Best Action',m.nextBest?.title||m.nextBest?.action||'Nic kritického',m.nextBest?.detail||m.nextBest?.reason||'')}${row('Morning brief',m.morning.headline)}${row('Capital verdict',c.capital.verdict)}${row('Volné po rezervě',money(c.capital.available))}`)}${card('OS811–820 · MONEY & PROPERTY',`${row('Runway',m.strategy.financial.runway?`${m.strategy.financial.runway.toFixed(1)} měs.`:'—')}${row('Money map položek',String(c.map.length))}${row('Leakage candidates',String(c.leakage.length),'Pouze opakované výdaje ke kontrole.')}${row('Top byt',c.property.best?.name||'—',c.property.best?`score ${c.property.best.dealScore}`:'')}`)}${card('OS821–830 · TICKETS & BETTING',`${row('Ticket kapitál',money(c.ticket.total))}${row('Ticket koncentrace',pct(c.ticket.concentration))}${row('Dead capital',String(c.ticket.deadCapital.length))}${row('Betting stop',c.betting.stop?'ANO':'NE',c.betting.stopReason)}${row('Korelované skupiny',String(c.betting.correlated.length))}${row('CLV vzorky',String(c.betting.clv.length),'Jen pokud jsou closing odds skutečně uložené.')}`)}${card('OS831–839 · LIFE / WORK / TIMELINE',`${row('Rodinné otevřené',String(c.areas.family.length))}${row('Domácí otevřené',String(c.areas.home.length))}${row('High-risk práce',String(c.work.filter(x=>x.riskScore>=70).length))}${row('Akční notifikace',String(m.notifications.length))}${row('Timeline položek',String(c.timeline.length))}`)}${card('OS840 · KAMIL OS COPILOT',`<h2>${h(m.nextBest?.title||m.nextBest?.action||'Dnes bez kritického zásahu')}</h2><p>${h(m.nextBest?.detail||m.nextBest?.reason||'Můžeš se soustředit na plánované věci.')}</p><p class="muted">Read-only by default · canonical sources · žádné automatické finanční provedení.</p>`)} </div>`}
export async function openCopilot840(){const m=await buildCopilot840();window.__KAMIL_COPILOT840__={model:m,at:Date.now()};return modal('Kamil OS Copilot',html(m),[{label:'Zavřít',value:null,primary:true}])}
