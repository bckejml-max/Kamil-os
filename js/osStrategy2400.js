import {store} from './state.js';
import {h} from './utils.js';
import {ownEvent1100} from './runtimeOwnership1100.js';
import {buildPortfolioContext2300} from './osPortfolio2300.js';

export const STRATEGY_SUITE2400_VERSION='2400.0.0';
export const STRATEGY_NAMES2400=[
 'Goal Hierarchy Map','North Star Dashboard','Goal Progress Engine','Goal Dependency Graph','Milestone Slip Detector',
 'Goal Resource Gap','Objective Conflict Detector','Goal Abandonment Radar','Goal Review Cadence','Strategic Focus Score',
 'Decision Portfolio','Bet Size Discipline','Reversibility Classifier','Decision Pre-Mortem','Decision Post-Mortem',
 'Kill Criteria Register','Option Value Tracker','Regret Minimizer','Decision Queue Aging','Decision Debt Monitor',
 'KPI Drift Monitor','Baseline Shift Detector','Threshold Health Check','Anomaly Persistence Tracker','Data Distribution Drift',
 'Rule Drift Monitor','False Positive Tracker','False Negative Tracker','Alert Fatigue Index','Calibration Health',
 'Navigation Friction Monitor','Search Success Rate','Time-to-Action','Dead-End Detector','Repeated Click Detector',
 'Empty State Quality','Mobile Readiness','Accessibility Risk Radar','Cognitive Load Index','Workspace Personalization',
 '90-Day Strategic Plan','One-Year Roadmap','Goal Cash Requirement','Capacity Horizon','Major Event Timeline',
 'Portfolio Rebalancing Cadence','Strategic Risk Register','Scenario Horizon','Annual Review Prep','Life / Business Balance'
];

const OWNER='product.strategy2400';
const A=v=>Array.isArray(v)?v:[];
const N=v=>Number.isFinite(Number(v))?Number(v):0;
const U=v=>String(v||'').trim().toUpperCase();
const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
const txt=x=>String(x?.title||x?.name||x?.label||x?.subject||'').trim();
const CLOSED=new Set(['DONE','HOTOVO','CLOSED','ARCHIVED','RESOLVED','PAID','SOLD','CANCELLED','CANCELED','COMPLETED','FINISHED']);
const open=x=>!CLOSED.has(U(x?.status||x?.state||x?.workflow||'OPEN'));
const parse=v=>{const t=Date.parse(v||'');return Number.isFinite(t)?t:null};
const days=v=>{const t=parse(v);return t===null?null:Math.round((t-Date.now())/86400000)};
const age=v=>{const d=days(v);return d===null?null:-d};
const money=v=>Math.round(N(v)).toLocaleString('cs-CZ')+' Kč';
const pct=v=>(N(v)*100).toFixed(1).replace('.',',')+' %';
const sum=(rows,fn)=>rows.reduce((n,x)=>n+N(fn(x)),0);
const med=rows=>{const a=rows.filter(Number.isFinite).sort((x,y)=>x-y);if(!a.length)return 0;const i=Math.floor(a.length/2);return a.length%2?a[i]:(a[i-1]+a[i])/2};
const due=x=>x?.deadline||x?.due||x?.targetDate||x?.reviewAt||null;
const updated=x=>x?.updatedAt||x?.lastChangedAt||x?.createdAt||x?.date||null;
const f=(id,domain,title,o={})=>({id,domain,title,value:o.value||'—',detail:o.detail||'',tone:o.tone||'',route:o.route||'today',score:N(o.score),data:o.data||null});
const goals=s=>A(s.goals||s.personalGoals||s.objectives);
const decisions=s=>A(s.decisionJournal||s.decisions);
const telemetry=s=>s.telemetry||{};
const events=s=>A(s.calendar?.events||s.events);
const tasks=s=>A(s.tasks).filter(open);

export function buildStrategyContext2400(input=null){
 const base=buildPortfolioContext2300(input||store.get()),s=base.s;
 return{...base,goals:goals(s),decisions:decisions(s),telemetry:telemetry(s),events:events(s),openTasks:tasks(s)};
}

export function goalHierarchy2400(c){const linked=c.goals.filter(x=>x.parentId).length;return f(201,'Strategy',STRATEGY_NAMES2400[0],{value:linked+'/'+c.goals.length+' propojeno',detail:'Cíle s explicitním parentId tvoří hierarchii.',route:'today'});}
export function northStar2400(c){const x=c.goals.find(g=>g.northStar||g.primary)||c.goals[0];return f(202,'Strategy',STRATEGY_NAMES2400[1],{value:x?txt(x):'Bez North Star',tone:x?'good':'warn',detail:x?'Hlavní strategický cíl.':'Označ jeden cíl jako northStar/primary.',route:'today'});}
export function goalProgress2400(c){const rows=c.goals.filter(x=>x.progress!=null||x.current!=null&&x.target!=null),p=rows.length?sum(rows,x=>x.progress!=null?N(x.progress):N(x.target)?N(x.current)/N(x.target):0)/rows.length:0;return f(203,'Strategy',STRATEGY_NAMES2400[2],{value:rows.length?pct(p):'Bez dat',detail:'Průměrný progress evidovaných cílů.',route:'today'});}
export function goalDependency2400(c){const n=sum(c.goals,x=>A(x.dependsOn||x.dependencies).length);return f(204,'Strategy',STRATEGY_NAMES2400[3],{value:n+' vazeb',detail:'Závislosti mezi cíli.',route:'today'});}
export function milestoneSlip2400(c){const rows=c.goals.flatMap(g=>A(g.milestones).map(m=>({...m,goal:g}))).filter(m=>!m.done&&days(m.date||m.due)<0);return f(205,'Strategy',STRATEGY_NAMES2400[4],{value:rows.length+' skluzů',tone:rows.length?'bad':'good',detail:rows.slice(0,3).map(x=>txt(x)+' / '+txt(x.goal)).join(' · ')||'Bez milestone skluzu.',route:'today'});}
export function goalResourceGap2400(c){const gap=sum(c.goals.filter(open),x=>Math.max(0,N(x.requiredBudget)-N(x.allocatedBudget)));return f(206,'Strategy',STRATEGY_NAMES2400[5],{value:money(gap),tone:gap?'warn':'good',detail:'Součet requiredBudget minus allocatedBudget u otevřených cílů.',route:'money'});}
export function objectiveConflict2400(c){const rows=c.goals.filter(x=>A(x.conflictsWith).length);return f(207,'Strategy',STRATEGY_NAMES2400[6],{value:rows.length+' konfliktů',tone:rows.length?'warn':'good',detail:'Cíle s explicitním conflictsWith.',route:'today'});}
export function abandonmentRadar2400(c){const rows=c.goals.filter(open).filter(x=>{const a=age(updated(x));return a!==null&&a>60&&N(x.progress||0)<.1});return f(208,'Strategy',STRATEGY_NAMES2400[7],{value:rows.length+' opuštěných?',tone:rows.length?'warn':'good',detail:'>60 dní bez změny a <10 % progress.',route:'today'});}
export function goalReviewCadence2400(c){const rows=c.goals.filter(x=>x.reviewAt),over=rows.filter(x=>days(x.reviewAt)<0);return f(209,'Strategy',STRATEGY_NAMES2400[8],{value:over.length+' po revizi',tone:over.length?'warn':'good',detail:rows.length+' cílů má reviewAt.',route:'today'});}
export function strategicFocus2400(c){const active=c.goals.filter(open),top=active.filter(x=>['HIGH','CRITICAL'].includes(U(x.priority))).length,score=active.length?Math.round(100*top/active.length):100;return f(210,'Strategy',STRATEGY_NAMES2400[9],{value:score+'/100',tone:active.length>10&&score<30?'warn':'good',detail:active.length+' aktivních cílů, '+top+' high-priority.',route:'today'});}

export function decisionPortfolio2400(c){const openRows=c.decisions.filter(open);return f(211,'Decisions',STRATEGY_NAMES2400[10],{value:openRows.length+' otevřených',detail:'Portfolio aktivních rozhodnutí.',route:'today'});}
export function betSize2400(c){const rows=c.decisions.filter(x=>N(x.commitment||x.amount)>0),largest=rows.sort((a,b)=>N(b.commitment||b.amount)-N(a.commitment||a.amount))[0];return f(212,'Decisions',STRATEGY_NAMES2400[11],{value:largest?money(N(largest.commitment||largest.amount)):'Bez dat',detail:largest?txt(largest):'Chybí commitment/amount.',route:'money'});}
export function reversibility2400(c){const irreversible=c.decisions.filter(x=>['ONE_WAY','IRREVERSIBLE'].includes(U(x.reversibility))).length;return f(213,'Decisions',STRATEGY_NAMES2400[12],{value:irreversible+' one-way',tone:irreversible?'warn':'good',detail:'Rozhodnutí označená jako nevratná.',route:'today'});}
export function premortem2400(c){const rows=c.decisions.filter(open).filter(x=>!A(x.failureModes).length&&!x.preMortem);return f(214,'Decisions',STRATEGY_NAMES2400[13],{value:rows.length+' chybí',tone:rows.length?'warn':'good',detail:'Otevřená rozhodnutí bez failureModes/preMortem.',route:'today'});}
export function postmortem2400(c){const rows=c.decisions.filter(x=>!open(x)&&!x.postMortem&&!x.actualOutcome);return f(215,'Decisions',STRATEGY_NAMES2400[14],{value:rows.length+' chybí',tone:rows.length?'warn':'good',detail:'Uzavřená rozhodnutí bez post-mortem/outcome.',route:'today'});}
export function killCriteria2400(c){const rows=c.decisions.filter(open).filter(x=>x.killCriteria||A(x.killConditions).length);return f(216,'Decisions',STRATEGY_NAMES2400[15],{value:rows.length+' definovaných',detail:'Otevřená rozhodnutí s kill kritérii.',route:'today'});}
export function optionValue2400(c){const rows=c.decisions.filter(open).filter(x=>x.optionValue!=null||x.keepOpen===true);return f(217,'Decisions',STRATEGY_NAMES2400[16],{value:rows.length+' opcí',detail:'Rozhodnutí, kde se explicitně chrání budoucí volba.',route:'today'});}
export function regretMinimizer2400(c){const rows=c.decisions.filter(open).map(x=>({x,r:N(x.regretIfAct)-N(x.regretIfWait)})).filter(x=>x.r!==0).sort((a,b)=>Math.abs(b.r)-Math.abs(a.r));return f(218,'Decisions',STRATEGY_NAMES2400[17],{value:rows[0]?Math.round(rows[0].r)+' Δ':'Bez dat',detail:rows[0]?txt(rows[0].x):'Chybí regretIfAct/regretIfWait.',route:'today'});}
export function decisionAging2400(c){const rows=c.decisions.filter(open).filter(x=>age(updated(x))>30);return f(219,'Decisions',STRATEGY_NAMES2400[18],{value:rows.length+' >30 dní',tone:rows.length?'warn':'good',detail:'Otevřená rozhodnutí dlouho bez změny.',route:'today'});}
export function decisionDebt2400(c){const debt=c.decisions.filter(open).filter(x=>days(due(x))<0||x.blocked).length;return f(220,'Decisions',STRATEGY_NAMES2400[19],{value:debt+' dluhů',tone:debt?'bad':'good',detail:'Rozhodnutí po termínu nebo blokovaná.',route:'today'});}

export function kpiDrift2400(c){const k=A(c.s.kpis),drift=k.filter(x=>x.baseline!=null&&x.current!=null&&Math.abs(N(x.current)-N(x.baseline))>Math.abs(N(x.threshold||0))).length;return f(221,'Quality',STRATEGY_NAMES2400[20],{value:drift+' driftů',tone:drift?'warn':'good',detail:'KPI mimo baseline o více než threshold.',route:'more'});}
export function baselineShift2400(c){const rows=A(c.s.kpis).filter(x=>x.previousBaseline!=null&&x.baseline!=null&&N(x.previousBaseline)!==N(x.baseline));return f(222,'Quality',STRATEGY_NAMES2400[21],{value:rows.length+' posunů',detail:'KPI se změněnou baseline.',route:'more'});}
export function thresholdHealth2400(c){const rows=A(c.s.kpis),bad=rows.filter(x=>x.threshold==null).length;return f(223,'Quality',STRATEGY_NAMES2400[22],{value:bad+' bez prahu',tone:bad?'warn':'good',detail:rows.length+' KPI celkem.',route:'more'});}
export function anomalyPersistence2400(c){const rows=A(c.s.anomalies).filter(x=>open(x)&&age(x.firstSeenAt)>7);return f(224,'Quality',STRATEGY_NAMES2400[23],{value:rows.length+' persistentních',tone:rows.length?'warn':'good',detail:'Anomálie otevřené déle než 7 dní.',route:'more'});}
export function distributionDrift2400(c){const rows=A(c.s.dataDrift).filter(x=>N(x.distance)>N(x.threshold||.2));return f(225,'Quality',STRATEGY_NAMES2400[24],{value:rows.length+' zdrojů',tone:rows.length?'warn':'good',detail:'Datové distribuce nad drift prahem.',route:'more'});}
export function ruleDrift2400(c){const rows=A(c.s.autonomy2200?.rules).filter(x=>x.baselineSuccess!=null&&x.successRate!=null&&N(x.baselineSuccess)-N(x.successRate)>.15);return f(226,'Quality',STRATEGY_NAMES2400[25],{value:rows.length+' pravidel',tone:rows.length?'warn':'good',detail:'Success rate klesla proti baseline o >15 p. b.',route:'more'});}
export function falsePositive2400(c){const a=A(c.s.alerts||c.s.notifications),rows=a.filter(x=>x.feedback==='FALSE_POSITIVE');return f(227,'Quality',STRATEGY_NAMES2400[26],{value:rows.length+' FP',tone:rows.length>5?'warn':'good',detail:'Alerty označené jako false positive.',route:'more'});}
export function falseNegative2400(c){const rows=A(c.s.learning?.misses).filter(x=>x.type==='FALSE_NEGATIVE'||x.missedAlert);return f(228,'Quality',STRATEGY_NAMES2400[27],{value:rows.length+' FN',tone:rows.length?'bad':'good',detail:'Evidované zmeškané relevantní signály.',route:'more'});}
export function alertFatigue2400(c){const a=A(c.s.alerts||c.s.notifications),dismiss=a.filter(x=>x.dismissed||x.ignored).length,r=a.length?dismiss/a.length:0;return f(229,'Quality',STRATEGY_NAMES2400[28],{value:pct(r),tone:r>.5?'warn':'good',detail:'Podíl ignorovaných/dismissed alertů.',route:'today'});}
export function calibrationHealth2400(c){const rows=A(c.s.forecasts).filter(x=>x.confidence!=null&&x.actualCorrect!=null),err=rows.length?med(rows.map(x=>Math.abs((N(x.confidence)>1?N(x.confidence)/100:N(x.confidence))-(x.actualCorrect?1:0)))):0;return f(230,'Quality',STRATEGY_NAMES2400[29],{value:rows.length?Math.round((1-err)*100)+'/100':'Bez dat',detail:'Confidence calibration proti outcome.',route:'more'});}

export function navFriction2400(c){const n=N(c.telemetry.navBacktracks||0)+N(c.telemetry.deadEnds||0);return f(231,'UX',STRATEGY_NAMES2400[30],{value:n+' friction',tone:n>10?'warn':'good',detail:'Backtracks + dead ends z telemetry.',route:'more'});}
export function searchSuccess2400(c){const q=N(c.telemetry.searches),ok=N(c.telemetry.searchSuccess),r=q?ok/q:1;return f(232,'UX',STRATEGY_NAMES2400[31],{value:pct(r),tone:r<.7?'warn':'good',detail:ok+'/'+q+' úspěšných search akcí.',route:'more'});}
export function timeToAction2400(c){const rows=A(c.telemetry.actionTimes).map(N).filter(x=>x>0),m=rows.length?med(rows):0;return f(233,'UX',STRATEGY_NAMES2400[32],{value:rows.length?Math.round(m)+' s':'Bez dat',detail:'Medián času od vstupu do view po akci.',route:'more'});}
export function deadEnd2400(c){const n=N(c.telemetry.deadEnds);return f(234,'UX',STRATEGY_NAMES2400[33],{value:n+' dead-endů',tone:n?'warn':'good',detail:'Návštěvy bez navazující akce/navigace.',route:'more'});}
export function repeatedClick2400(c){const n=N(c.telemetry.repeatedClicks);return f(235,'UX',STRATEGY_NAMES2400[34],{value:n+' opakování',tone:n>5?'warn':'good',detail:'Opakované kliky mohou indikovat nejasnou odezvu UI.',route:'more'});}
export function emptyState2400(c){const rows=A(c.telemetry.emptyStates),good=rows.filter(x=>x.hasAction&&x.hasExplanation).length,r=rows.length?good/rows.length:1;return f(236,'UX',STRATEGY_NAMES2400[35],{value:pct(r),tone:r<.8?'warn':'good',detail:'Empty states s vysvětlením + next action.',route:'more'});}
export function mobileReadiness2400(c){const issues=N(c.telemetry.mobileOverflow)+N(c.telemetry.mobileTapIssues);return f(237,'UX',STRATEGY_NAMES2400[36],{value:issues+' issues',tone:issues?'warn':'good',detail:'Mobile overflow + tap target problémy.',route:'more'});}
export function accessibilityRisk2400(c){const issues=N(c.telemetry.a11yIssues||0);return f(238,'UX',STRATEGY_NAMES2400[37],{value:issues+' issues',tone:issues?'bad':'good',detail:'Evidované accessibility problémy.',route:'more'});}
export function cognitiveLoad2400(c){const avg=N(c.telemetry.avgVisibleActions),score=Math.max(0,Math.round((avg-7)*10));return f(239,'UX',STRATEGY_NAMES2400[38],{value:score+'/100',tone:score>50?'warn':'good',detail:'Odvozeno z průměrného počtu současně viditelných akcí.',route:'more'});}
export function workspacePersonalization2400(c){const prefs=A(c.s.workspacePreferences||Object.keys(c.s.preferences||{})),n=Array.isArray(prefs)?prefs.length:0;return f(240,'UX',STRATEGY_NAMES2400[39],{value:n+' preferencí',detail:'Evidované workspace/personalization volby.',route:'more'});}

export function plan90d2400(c){const rows=c.goals.filter(open).filter(x=>{const d=days(due(x));return d!==null&&d>=0&&d<=90});return f(241,'Horizon',STRATEGY_NAMES2400[40],{value:rows.length+' cílů',detail:'Aktivní cíle s horizontem 90 dní.',route:'today'});}
export function roadmap1y2400(c){const rows=c.goals.filter(open).filter(x=>{const d=days(due(x));return d!==null&&d>=0&&d<=365});return f(242,'Horizon',STRATEGY_NAMES2400[41],{value:rows.length+' milníků/cílů',detail:'Aktivní cíle v horizontu jednoho roku.',route:'today'});}
export function goalCashRequirement2400(c){const total=sum(c.goals.filter(open),x=>N(x.requiredBudget||x.cashNeed));return f(243,'Horizon',STRATEGY_NAMES2400[42],{value:money(total),detail:'Známý requiredBudget/cashNeed aktivních cílů.',route:'money'});}
export function capacityHorizon2400(c){const mins=sum(c.openTasks,x=>Math.max(15,N(x.estimateMinutes||x.minutes||30))),weeks=mins/(30*60);return f(244,'Horizon',STRATEGY_NAMES2400[43],{value:weeks.toFixed(1)+' týd.',detail:'Backlog proti 30 hodinám čisté kapacity týdně.',route:'today'});}
export function eventTimeline2400(c){const rows=c.events.filter(x=>{const d=days(x.start||x.date);return d!==null&&d>=0&&d<=365});return f(245,'Horizon',STRATEGY_NAMES2400[44],{value:rows.length+' událostí',detail:'Známé události v příštích 12 měsících.',route:'today'});}
export function rebalanceCadence2400(c){const d=days(c.s.financePlan?.nextRebalanceAt),dueNow=d!==null&&d<=0;return f(246,'Horizon',STRATEGY_NAMES2400[45],{value:d===null?'Bez termínu':dueNow?'Rebalance teď':d+' dní',tone:dueNow?'warn':'good',detail:'Další strategická kontrola alokace kapitálu.',route:'money'});}
export function strategicRiskRegister2400(c){const rows=[...c.goals,...c.openTasks].filter(x=>['HIGH','CRITICAL'].includes(U(x.risk||x.riskLevel)));return f(247,'Horizon',STRATEGY_NAMES2400[46],{value:rows.length+' strategických rizik',tone:rows.length?'warn':'good',detail:rows.slice(0,3).map(txt).join(' · ')||'Bez explicitních high-risk položek.',route:'today'});}
export function scenarioHorizon2400(c){const rows=A(c.s.scenarios),dated=rows.filter(x=>x.horizonDays||x.date);return f(248,'Horizon',STRATEGY_NAMES2400[47],{value:dated.length+' scénářů',detail:'Scénáře s explicitním časovým horizontem.',route:'today'});}
export function annualReviewPrep2400(c){const missing=['goals','netWorthBook','decisionJournal'].filter(k=>!c.s[k]&&!(k==='goals'&&c.s.personalGoals));return f(249,'Horizon',STRATEGY_NAMES2400[48],{value:missing.length?missing.length+' chybí':'Připraveno',tone:missing.length?'warn':'good',detail:missing.length?'Chybí: '+missing.join(', '):'Cíle, majetek a rozhodnutí jsou dostupné pro annual review.',route:'more'});}
export function lifeBusinessBalance2400(c){const personal=c.openTasks.filter(x=>['Rodina','Domov','Osobní','Personal'].includes(x.area)).length,business=c.openTasks.filter(x=>['Práce','Work'].includes(x.area)).length,total=personal+business,balance=total?1-Math.abs(personal-business)/total:1;return f(250,'Horizon',STRATEGY_NAMES2400[49],{value:pct(balance),tone:balance<.4?'warn':'good',detail:personal+' osobní vs '+business+' pracovní otevřené úkoly.',route:'today'});}

export const STRATEGY_BUILDERS2400=[
 goalHierarchy2400,northStar2400,goalProgress2400,goalDependency2400,milestoneSlip2400,goalResourceGap2400,objectiveConflict2400,abandonmentRadar2400,goalReviewCadence2400,strategicFocus2400,
 decisionPortfolio2400,betSize2400,reversibility2400,premortem2400,postmortem2400,killCriteria2400,optionValue2400,regretMinimizer2400,decisionAging2400,decisionDebt2400,
 kpiDrift2400,baselineShift2400,thresholdHealth2400,anomalyPersistence2400,distributionDrift2400,ruleDrift2400,falsePositive2400,falseNegative2400,alertFatigue2400,calibrationHealth2400,
 navFriction2400,searchSuccess2400,timeToAction2400,deadEnd2400,repeatedClick2400,emptyState2400,mobileReadiness2400,accessibilityRisk2400,cognitiveLoad2400,workspacePersonalization2400,
 plan90d2400,roadmap1y2400,goalCashRequirement2400,capacityHorizon2400,eventTimeline2400,rebalanceCadence2400,strategicRiskRegister2400,scenarioHorizon2400,annualReviewPrep2400,lifeBusinessBalance2400
];

export function strategySuite2400(input=null){const c=buildStrategyContext2400(input);return{version:STRATEGY_SUITE2400_VERSION,context:c,features:STRATEGY_BUILDERS2400.map(fn=>fn(c))};}
const row=x=>'<button type="button" class="pr1300-row pr1300-clickrow" data-strategy2400="'+x.id+'" data-strategy-route="'+h(x.route)+'"><div class="pr1300-row-main"><b>'+x.id+'. '+h(x.title)+'</b><small>'+h(x.detail)+'</small></div><div class="pr1300-row-side '+h(x.tone)+'">'+h(x.value)+' <span class="os1500-row-arrow">→</span></div></button>';

export function renderStrategyCenter2400(){
 const host=document.querySelector('#moreView');if(!host)return false;const model=strategySuite2400(),features=model.features,bad=features.filter(x=>x.tone==='bad').length,warn=features.filter(x=>x.tone==='warn').length;
 host.innerHTML='<div class="pr1300-shell" data-strategy2400-center><div class="pr1300-head"><div><div class="pr1300-kicker">OS Strategy & Horizon · pátých 50</div><h1>Cíle, rozhodnutí, drift, UX kvalita a dlouhý horizont.</h1><p>Vrstva 201–250 hlídá, zda se OS i tvoje rozhodnutí posouvají správným směrem — nejen zda jsou úkoly hotové.</p></div><span class="pr1300-status '+(bad?'bad':warn?'warn':'good')+'">'+bad+' červených · '+warn+' žlutých</span></div><section class="pr1320-now"><div><div class="pr1300-kicker">North Star</div><h2>'+h(northStar2400(model.context).value)+'</h2><p>Strategic Focus: '+h(strategicFocus2400(model.context).value)+' · 90denní plán: '+h(plan90d2400(model.context).value)+'</p></div><div class="pr1320-now-actions"><button class="pr1300-btn" type="button" data-strategy2400-back>Zpět</button></div></section>';
 for(const domain of ['Strategy','Decisions','Quality','UX','Horizon']){const rows=features.filter(x=>x.domain===domain);host.innerHTML+='<section class="pr1300-panel"><div class="pr1300-panel-head"><h2>'+domain+'</h2><span>'+rows.length+' modulů</span></div><div class="os1500-direct-list">'+rows.map(row).join('')+'</div></section>'}
 host.innerHTML+='</div>';host.__strategy2400=model;
 if(!host.dataset.strategy2400Bound){host.dataset.strategy2400Bound='1';ownEvent1100(OWNER,host,'click',async e=>{if(e.target.closest('[data-strategy2400-back]')){const m=await import('./documentsPage141.js');m.renderDocumentsPage141?.();return}const el=e.target.closest('[data-strategy2400]');if(el){const x=host.__strategy2400?.features?.find(y=>String(y.id)===el.dataset.strategy2400);if(x?.route&&x.route!=='more')window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:x.route}));}})}
 window.__KAMIL_STRATEGY2400__={healthy:true,version:STRATEGY_SUITE2400_VERSION,count:features.length,bad,warn,names:[...STRATEGY_NAMES2400],at:Date.now()};return true;
}
