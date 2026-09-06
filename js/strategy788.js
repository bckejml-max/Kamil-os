import {store} from './state.js';
import {modal,h,uid,toast} from './utils.js';
import {buildTruth737,recordDecision736} from './operatorTruth737.js';
import {buildDataAudit738} from './dataTruth738.js';

const VERSION='788.0.0';
const A=v=>Array.isArray(v)?v:[];
const N=v=>Number.isFinite(Number(v))?Number(v):0;
const U=v=>String(v||'').toUpperCase();
const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const money=v=>`${Math.round(N(v)).toLocaleString('cs-CZ')} Kč`;
const pct=v=>`${N(v).toFixed(1).replace('.',',')} %`;
const dayDiff=v=>{const t=Date.parse(v||'');return Number.isFinite(t)?Math.ceil((t-Date.now())/86400000):null};
const closed=x=>['DONE','CLOSED','ARCHIVED','RESOLVED','PAID','CANCELLED','CANCELED','SOLD','PAYOUT RECEIVED'].includes(U(x?.status||x?.workflow||x?.market_status));
const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,N(v)));
const ageHours=v=>{const t=Date.parse(v||'');return Number.isFinite(t)?Math.max(0,(Date.now()-t)/36e5):null};

function freshness(kind,at){const sla={ticket:6,money:24,property:168,work:24,document:720}[kind]||168,a=ageHours(at);return{slaHours:sla,ageHours:a,stale:a===null||a>sla};}
function sourceOf(x){return x?.source||x?.sourceName||x?.source_name||x?.importedFrom||'local';}
function entityKey(x){return norm(`${x?.id||''}|${x?.name||x?.title||x?.event_name||''}|${x?.date||x?.event_date||''}`)}
function duplicates(rows){const seen=new Map(),out=[];for(const x of rows){const k=entityKey(x);if(!k)continue;if(seen.has(k))out.push([seen.get(k),x]);else seen.set(k,x)}return out;}
function scoreConfidence(base,gaps=0,stale=0){return clamp(base-gaps*12-stale*8)}

export async function buildStrategy788(s=store.get()){
 const [truth,audit]=await Promise.all([buildTruth737(s),buildDataAudit738(s)]);
 const gaps=A(audit.gaps||audit.issues||[]),tickets=truth.tickets.rows,properties=truth.property.rows,work=truth.work.rows,docs=truth.documents;
 const ticketFresh=tickets.map(x=>freshness('ticket',x.snap?.checked_at||x.snap?.checkedAt||x.updated_at));
 const staleTickets=ticketFresh.filter(x=>x.stale).length,staleProps=properties.filter(x=>freshness('property',x.updatedAt||x.asOf||x.checkedAt).stale).length;
 const decisionConfidence=scoreConfidence(audit.score||70,gaps.length,staleTickets+staleProps);
 const provenance={tickets:truth.tickets.source,property:truth.property.source,money:truth.money.capital?.source||'state',work:'manager341 via manager481'};
 const dup={tickets:duplicates(tickets),properties:duplicates(properties),tasks:duplicates(A(s.tasks))};
 const cash=N(truth.money.allocation.free),reserve=N(truth.money.allocation.reserve),xtb=N(truth.money.allocation.xtb),ticketCapital=N(truth.money.allocation.ticket),netWorth=cash+reserve+xtb+ticketCapital+properties.reduce((a,x)=>a+N(x.marketValue||x.purchasePrice||x.totalCost),0)-A(s.debtBook?.items).reduce((a,x)=>a+N(x.balance||x.amount),0);
 const monthlySpend=Math.max(1,A(s.personalSpending?.transactions).filter(x=>N(x.amount)<0).reduce((a,x)=>a+Math.abs(N(x.amount)),0)/Math.max(1,new Set(A(s.personalSpending?.transactions).map(x=>String(x.date||'').slice(0,7))).size||1));
 const runway=monthlySpend?cash/monthlySpend:null;
 const idleCash=truth.money.drift!=='OK'?cash:0;
 const opportunities=[];
 if(truth.property.best)opportunities.push({type:'PROPERTY',title:truth.property.best.name,returnPct:N(truth.property.best.netYieldPct),risk:truth.property.best.scenarios?.crisis<2?75:45,lock:85,liquidity:25});
 if(truth.money.bankComparator?.best)opportunities.push({type:'CASH',title:truth.money.bankComparator.best.name,returnPct:N(truth.money.bankComparator.best.rate),risk:5,lock:5,liquidity:95});
 if(xtb)opportunities.push({type:'XTB',title:'XTB portfolio',returnPct:7,risk:55,lock:20,liquidity:85,estimated:true});
 for(const x of tickets.filter(x=>x.netPnl!==null&&x.buy>0).slice(0,10))opportunities.push({type:'TICKET',title:x.event_name,returnPct:x.netPnl/x.buy*100,risk:x.status==='LISTED'?55:70,lock:45,liquidity:35});
 for(const o of opportunities){o.riskAdjusted=o.returnPct/(1+o.risk/50);o.score=clamp(50+o.returnPct*2-o.risk*.35-o.lock*.15+o.liquidity*.1)}
 opportunities.sort((a,b)=>b.score-a.score);
 const propertyRanking=properties.map(x=>({...x,score:clamp(50+N(x.netYieldPct)*5-(x.scenarios?.crisis<2?20:0)-(N(x.totalCost)>cash?15:0))})).sort((a,b)=>b.score-a.score);
 const ticketRows=tickets.map(x=>{const buy=N(x.buy),market=N(x.marketPrice)*Math.max(1,N(x.qty)),margin=buy&&market?(market-buy)/buy*100:null,days=dayDiff(x.event_date),decay=days===null?20:days<3?90:days<7?70:days<30?40:15,confidence=scoreConfidence(x.snap?.multi_market_confidence||60,0,freshness('ticket',x.snap?.checked_at).stale?1:0);return{...x,liveMarginPct:margin,timeDecay:decay,exitDeadline:days===null?null:days<=7?'PRODAT / OVĚŘIT TEĎ':days<=21?'HLÍDAT DENNĚ':'DRŽET',marketConfidence:confidence}});
 const betting=A(s.bettingLedger?.bets||s.bets||[]),settled=betting.filter(x=>['WON','LOST','VOID'].includes(U(x.status))),stake=settled.reduce((a,x)=>a+N(x.stake),0),profit=settled.reduce((a,x)=>a+N(x.profit),0),bankroll=N(s.bettingBankroll?.current||s.bettingLedger?.bankroll||0),drawdown=N(s.bettingPerformance?.drawdown||0);
 const betExposure={bySport:{},byLeague:{},today:0};for(const x of betting.filter(x=>!closed(x))){const st=N(x.stake);betExposure.today+=st;const sp=x.sport||'other',lg=x.league||'other';betExposure.bySport[sp]=(betExposure.bySport[sp]||0)+st;betExposure.byLeague[lg]=(betExposure.byLeague[lg]||0)+st;}
 const workBoard=work.map(x=>({...x,owner:x.owner||x.assignee||'NEPŘIŘAZENO',blocker:x.detail||x.blocker||'',economics:N(x.value||x.contractValue||0)}));
 const closeout=workBoard.map(x=>({id:x.id,title:x.title,checks:{deadline:!!x.due,owner:x.owner!=='NEPŘIŘAZENO',detail:!!x.detail},complete:[!!x.due,x.owner!=='NEPŘIŘAZENO',!!x.detail].filter(Boolean).length/3}));
 const expiries=docs.filter(x=>x.status!=='AKTUÁLNÍ').sort((a,b)=>(a.days??9999)-(b.days??9999));
 const weekly={money:{netWorth,cash,idleCash,runway},property:propertyRanking.slice(0,3),tickets:{invested:truth.tickets.invested,realized:truth.tickets.realized,risk:truth.tickets.risk},betting:{roi:stake?profit/stake*100:0,bankroll,drawdown},work:{overdue:truth.work.overdue,missingDeadline:truth.work.missingDeadline},data:{confidence:decisionConfidence,gaps:gaps.length}};
 const history=A(truth.history),learning=truth.learning,actions=[];
 if(gaps.length)actions.push({priority:100,area:'DATA',action:'DOPLNIT DATA',reason:`${gaps.length} datových mezer blokuje jistější rozhodnutí.`});
 if(idleCash>500000)actions.push({priority:90,area:'MONEY',action:'VYŘEŠIT VOLNÝ CASH',reason:`${money(idleCash)} je označeno jako neefektivně využitá hotovost.`});
 if(truth.work.overdue)actions.push({priority:95,area:'WORK',action:'ŘEŠIT OVERDUE',reason:`${truth.work.overdue} pracovních termínů je po termínu.`});
 if(truth.tickets.risk==='HIGH')actions.push({priority:82,area:'TICKETS',action:'SNÍŽIT KONCENTRACI',reason:'Příliš velká část ticket kapitálu je v jednom eventu.'});
 if(drawdown>20)actions.push({priority:92,area:'BETTING',action:'SNÍŽIT EXPOZICI',reason:`Drawdown ${pct(drawdown)} překročil bezpečnou zónu.`});
 if(expiries.length)actions.push({priority:70,area:'DOCUMENTS',action:'VYŘEŠIT EXPIRACE',reason:`${expiries.length} dokumentů vyžaduje kontrolu.`});
 actions.sort((a,b)=>b.priority-a.priority);
 const strategy={monthFocus:actions.slice(0,5),doMore:[],doLess:[],stop:[]};
 if(propertyRanking[0]?.score>=70)strategy.doMore.push(`Reality: prověřit ${propertyRanking[0].name}`);
 if(opportunities[0])strategy.doMore.push(`Kapitál: priorita ${opportunities[0].type} – ${opportunities[0].title}`);
 if(idleCash)strategy.doLess.push('Držet vysokou neúročenou hotovost');
 if(truth.tickets.risk==='HIGH')strategy.doLess.push('Koncentrovat ticket kapitál do jednoho eventu');
 if(drawdown>25)strategy.stop.push('Nové agresivní sázky do návratu pod risk limit');
 const sla={ticket:ticketFresh,property:properties.map(x=>freshness('property',x.updatedAt||x.asOf)),money:freshness('money',s.meta?.lastMutationAt),work:freshness('work',s.meta?.lastMutationAt)};
 return{version:VERSION,truth,audit,confidence:decisionConfidence,provenance,duplicates:dup,sla,financial:{netWorth,cash,reserve,monthlySpend,runway,idleCash},opportunities,propertyRanking,tickets:ticketRows,betting:{settled,roi:stake?profit/stake*100:0,bankroll,drawdown,exposure:betExposure},work:{board:workBoard,closeout},documents:{expiries},weekly,history,learning,strategy,guardrails:{noInventedExternalRates:true,noAutoFinancialExecution:true,canonicalSourcesOnly:true}};
}

export function recordStrategyDecision788({area='strategy',decision='REVIEW',subject='',reason='',outcome=null}={}){return recordDecision736({area,decision,subject,reason,outcome,meta:{source:'OS788'}})}
export function smartMergePreview749(rows=[]){const d=duplicates(rows);return d.map(([a,b])=>({keep:a,merge:b,changes:Object.keys({...a,...b}).filter(k=>JSON.stringify(a?.[k])!==JSON.stringify(b?.[k]))}))}
export function importDiff751(before=[],after=[]){const B=new Map(before.map(x=>[x.id,x])),A2=new Map(after.map(x=>[x.id,x]));const added=[],changed=[],removed=[];for(const [id,x] of A2){if(!B.has(id))added.push(x);else if(JSON.stringify(B.get(id))!==JSON.stringify(x))changed.push({before:B.get(id),after:x})}for(const [id,x] of B)if(!A2.has(id))removed.push(x);return{added,changed,removed,safe:removed.length===0}}
export function universalAnswer786(q,model=window.__KAMIL_STRATEGY788__?.model){if(!model)return null;const n=norm(q);if(/kolik.*ticket|vstupenk/.test(n))return`Ve vstupenkách je aktivně ${money(model.truth.tickets.invested)}.`;if(/kolik.*cash|hotov/.test(n))return`Volný cash je ${money(model.financial.cash)}.`;if(/nejlepsi.*byt|reality/.test(n))return model.propertyRanking[0]?`Nejvýše je ${model.propertyRanking[0].name} se skóre ${Math.round(model.propertyRanking[0].score)}.`:'Nemám dost realitních dat.';if(/co.*ted|priorit/.test(n))return model.strategy.monthFocus[0]?`${model.strategy.monthFocus[0].action}: ${model.strategy.monthFocus[0].reason}`:'Nic kritického.';return null;}

function row(a,b,c=''){return`<div class="row"><div><b>${h(a)}</b>${c?`<div class="muted">${h(c)}</div>`:''}</div><span>${h(b)}</span></div>`}
function card(t,b){return`<div class="card"><div class="eyebrow">${h(t)}</div>${b}</div>`}
function html(m){const s=m.strategy,w=m.weekly;return`<div data-strategy788>
${card('OS739–753 · DATA CONTROL',`${row('Decision confidence',pct(m.confidence))}${row('Datové mezery',String(m.audit.gaps?.length||m.audit.issues?.length||0))}${row('Duplicitní tickety',String(m.duplicates.tickets.length))}${row('Duplicitní reality',String(m.duplicates.properties.length))}${row('Canonical sources','ANO',Object.entries(m.provenance).map(([k,v])=>`${k}:${v}`).join(' · '))}`)}
${card('OS754–761 · CAPITAL',`${row('Net worth snapshot',money(m.financial.netWorth))}${row('Volný cash',money(m.financial.cash))}${row('Runway',m.financial.runway?`${m.financial.runway.toFixed(1)} měs.`:'—')}${row('Idle cash',money(m.financial.idleCash))}${row('Nejlepší příležitost',m.opportunities[0]?.title||'—',m.opportunities[0]?`score ${Math.round(m.opportunities[0].score)} · risk-adjusted ${m.opportunities[0].riskAdjusted.toFixed(1)}`:'')}`)}
${card('OS762–767 · PROPERTY',`${row('Top kandidát',m.propertyRanking[0]?.name||'—')}${row('Skóre',m.propertyRanking[0]?String(Math.round(m.propertyRanking[0].score)):'—')}${row('Net yield',m.propertyRanking[0]?pct(m.propertyRanking[0].netYieldPct):'—')}${row('Crisis yield',m.propertyRanking[0]?pct(m.propertyRanking[0].scenarios?.crisis):'—')}`)}
${card('OS768–773 · TICKETS',`${row('Aktivní kapitál',money(m.truth.tickets.invested))}${row('Realizovaný P&L',money(m.truth.tickets.realized))}${row('Koncentrace',m.truth.tickets.risk)}${row('Exit alerty',String(m.tickets.filter(x=>/PRODAT/.test(x.exitDeadline||'')).length))}`)}
${card('OS774–778 · BETTING',`${row('ROI',pct(m.betting.roi))}${row('Bankroll',money(m.betting.bankroll))}${row('Drawdown',pct(m.betting.drawdown))}${row('Dnešní expozice',money(m.betting.exposure.today))}`)}
${card('OS779–785 · WORK / DOCS / FAMILY',`${row('Pracovní overdue',String(w.work.overdue))}${row('Práce bez termínu',String(w.work.missingDeadline))}${row('Dokumenty k řešení',String(m.documents.expiries.length))}${row('Closeout nekompletní',String(m.work.closeout.filter(x=>x.complete<1).length))}`)}
${card('OS786–788 · WEEKLY CEO / STRATEGY',`${s.monthFocus.slice(0,5).map((x,i)=>row(`${i+1}. ${x.action}`,x.area,x.reason)).join('')||row('Stav','Bez kritických priorit')}${s.doMore.length?row('Dělat víc',s.doMore.join(' · ')):''}${s.doLess.length?row('Dělat míň',s.doLess.join(' · ')):''}${s.stop.length?row('Přestat',s.stop.join(' · ')):''}`)}
</div>`}
export async function openStrategy788(){const m=await buildStrategy788();window.__KAMIL_STRATEGY788__={version:VERSION,model:m,at:Date.now()};const choice=await modal('OS788 · Strategy & Control',html(m),[{label:'Zapsat dnešní strategii',value:'record',primary:true},{label:'Zavřít',value:null}]);if(choice==='record'){recordStrategyDecision788({decision:'WEEKLY_REVIEW',subject:m.strategy.monthFocus[0]?.action||'Bez kritických priorit',reason:m.strategy.monthFocus.map(x=>`${x.area}:${x.action}`).join(' | ')});toast('Strategie uložena do Decision History.')}return m;}
