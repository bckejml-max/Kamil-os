import {modal,h} from './utils.js';
import {buildSelfImproving892,readOutcomes851,recordOutcome851,decisionReliability850,featureUsageAnalytics886,monthlyDecisionScorecard890} from './selfImproving892.js';
import {usageSummary892,recordUsage892} from './usage892.js';

export const AUTONOMOUS943_VERSION='943.0.0';
const REVIEW_KEY='kamil.outcome.review.943';
const SOURCE_KEY='kamil.source.health.943';
const DECISION_KEY='kamil.decision.versions.943';
const TIME_KEY='kamil.time.alloc.943';
const PLAYBOOK_KEY='kamil.playbooks.943';
const APPROVAL_KEY='kamil.improvement.approvals.943';
const A=v=>Array.isArray(v)?v:[];
const N=v=>Number.isFinite(Number(v))?Number(v):0;
const U=v=>String(v||'').toUpperCase();
const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,N(v)));
const json=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch{return d}};
const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch{return false}};
const ageDays=v=>{const t=Date.parse(v||'');return Number.isFinite(t)?Math.max(0,(Date.now()-t)/86400000):999};

// OS894-903 · outcome quality + confidence
export function outcomeReviewQueue894(){const reviewed=new Set(readOutcomes851().map(x=>String(x.recommendation)));return A(json(REVIEW_KEY,[])).filter(x=>!reviewed.has(String(x.recommendation))).sort((a,b)=>Date.parse(a.reviewAt||0)-Date.parse(b.reviewAt||0))}
export function queueOutcomeReview895(row={}){const rows=A(json(REVIEW_KEY,[]));const x={id:`r-${Date.now()}`,at:new Date().toISOString(),reviewAt:new Date(Date.now()+Math.max(1,N(row.days||3))*86400000).toISOString(),area:U(row.area)||'GENERAL',recommendation:String(row.recommendation||''),sourceId:String(row.sourceId||'')};rows.push(x);save(REVIEW_KEY,rows.slice(-500));return x}
export function outcomeByDomain896(){return decisionReliability850()}
export function recommendationPrecision897(area){const g=outcomeByDomain896()[U(area)]||{good:0,bad:0,neutral:0,total:0};return g.total?g.good/g.total:0}
export function recommendationRecall898(model){const missed=A(model?.notifications).filter(x=>N(x.priority)>=90&&!readOutcomes851().some(o=>o.recommendation===String(x.title||x.action)));return{highPriority:A(model?.notifications).filter(x=>N(x.priority)>=90).length,missed:missed.length,items:missed.slice(0,20)}}
export function falseAlarmDetector899(){return readOutcomes851().filter(x=>x.outcome==='bad'&&/urgent|teď|ted|now/i.test(x.recommendation||'')).slice(-30)}
export function missedOpportunity900(model){return A(model?.notifications).filter(x=>['TICKETS','PROPERTY','BETTING','MONEY'].includes(U(x.area))&&N(x.priority)>=80&&!readOutcomes851().some(o=>o.recommendation===String(x.title||x.action))).slice(0,20)}
export function confidenceVsReality901(model){const by=outcomeByDomain896(),out={};for(const [area,g] of Object.entries(by)){const observed=g.total?g.good/g.total*100:null;const predicted=N(model?.confidenceCalibrated?.[area.toLowerCase()]??model?.confidence?.[area.toLowerCase()]??model?.confidence?.overall);out[area]={predicted:Math.round(predicted),observed:observed===null?null:Math.round(observed),samples:g.total,gap:observed===null?null:Math.round(predicted-observed)}}return out}
export function confidenceAutoCorrection902(model){const x=confidenceVsReality901(model),out={};for(const [area,v] of Object.entries(x)){out[area]=v.samples<5?v.predicted:clamp(v.predicted-(v.gap||0)*0.25)}return out}
export function domainReliabilityFloor903(area,model){const g=outcomeByDomain896()[U(area)]||{total:0},base=N(model?.confidence?.[String(area).toLowerCase()]??model?.confidence?.overall);const floor=g.total<3?Math.min(base,60):g.total<10?Math.min(base,80):base;return Math.round(floor)}

// OS904-914 · source truth + decision lifecycle
export function sourceReliability904(){return json(SOURCE_KEY,{})}
export function recordSourceState905(source,state='ok',detail=''){const all=sourceReliability904(),s=all[source]||{ok:0,fail:0,history:[]};state==='ok'?s.ok++:s.fail++;s.history.push({at:new Date().toISOString(),state,detail:String(detail||'')});s.history=s.history.slice(-100);all[source]=s;save(SOURCE_KEY,all);return s}
export function sourceFallbackRanking906(){return Object.entries(sourceReliability904()).map(([source,s])=>({source,score:(N(s.ok)+1)/(N(s.ok)+N(s.fail)+2)})).sort((a,b)=>b.score-a.score)}
export function sourceConflictResolution907(rows=[]){const by={};for(const x of A(rows)){const k=String(x.key||x.field||'unknown'),v=String(x.value);(by[k]??=[]).push({source:x.source,value:v,at:x.at})}return Object.entries(by).filter(([,xs])=>new Set(xs.map(x=>x.value)).size>1).map(([key,sources])=>({key,sources,needsHuman:true}))}
export function humanVerificationQueue908(model){return [...A(model?.missing).map(x=>({type:'MISSING',impact:N(x.impact||70),item:x})),...sourceConflictResolution907(A(model?.sourceFacts)).map(x=>({type:'CONFLICT',impact:90,item:x}))].sort((a,b)=>b.impact-a.impact)}
export function smartVerificationOrder909(model){return humanVerificationQueue908(model).sort((a,b)=>b.impact-a.impact)}
export function decisionDependencyMap910(model){return A(model?.notifications).map(x=>({decision:x.title||x.action,area:U(x.area),dependencies:A(x.dependencies||x.sources||[]),blocked:!!x.blocked}))}
export function brokenDecisionDetector911(model){return decisionDependencyMap910(model).filter(x=>x.blocked||x.dependencies.some(d=>d?.stale||d?.conflict))}
export function automaticRecompute912(model){return brokenDecisionDetector911(model).map(x=>({decision:x.decision,action:'RECOMPUTE',automaticExecution:false,requiresFreshData:true}))}
export function decisionVersion913(key,value,reason=''){const all=json(DECISION_KEY,{}),rows=A(all[key]);const prev=rows.at(-1);if(JSON.stringify(prev?.value)!==JSON.stringify(value))rows.push({at:new Date().toISOString(),value,reason:String(reason||'')});all[key]=rows.slice(-100);save(DECISION_KEY,all);return rows.at(-1)}
export function decisionTimeline914(key){return A(json(DECISION_KEY,{})[key])}

// OS915-919 · forecast quality
export function forecastConfidence915(row={}){const hard=N(row.hardInputs),soft=N(row.softInputs),total=hard+soft;return total?Math.round(100*hard/total):0}
export function forecastError916(predicted,actual){const p=N(predicted),a=N(actual);return{absolute:Math.abs(p-a),pct:a?Math.abs(p-a)/Math.abs(a)*100:null}}
export function forecastModelSelection917(models=[]){return A(models).map(x=>({...x,penalizedError:N(x.error)+N(x.complexity||0)*0.05})).sort((a,b)=>a.penalizedError-b.penalizedError)[0]||null}
export function scenarioProbability918(rows=[]){const xs=A(rows),weights=xs.map(x=>Math.max(0,N(x.weight||x.confidence||1))),sum=weights.reduce((a,b)=>a+b,0)||1;return xs.map((x,i)=>({...x,probability:weights[i]/sum}))}
export function scenarioOutcomeReview919(rows=[],actual){return A(rows).map(x=>({...x,error:forecastError916(x.value??x.result,actual).absolute})).sort((a,b)=>a.error-b.error)}

// OS920-932 · time, attention and goals
export function recordTimeAllocation920(area,minutes){const rows=A(json(TIME_KEY,[]));rows.push({at:new Date().toISOString(),area:U(area)||'GENERAL',minutes:Math.max(0,N(minutes))});save(TIME_KEY,rows.slice(-1000));return rows.at(-1)}
export function timeAllocation921(days=30){const cut=Date.now()-days*86400000,by={};for(const x of A(json(TIME_KEY,[])).filter(x=>Date.parse(x.at)>=cut))by[x.area]=(by[x.area]||0)+N(x.minutes);return by}
export function attentionBudget922(model){return{active:A(model?.notifications).length,critical:A(model?.notifications).filter(x=>N(x.priority)>=90).length,waiting:A(model?.notifications).filter(x=>/WAIT|ČEK|CEK/.test(U(x.lane||x.status))).length}}
export function overloadDetector923(model){const a=attentionBudget922(model);return{overloaded:a.active>25||a.critical>7,score:Math.min(100,a.active*2+a.critical*8),...a}}
export function wipLimit924(model){const o=overloadDetector923(model);return Math.max(3,Math.min(10,o.overloaded?5:8))}
export function finishBeforeStart925(model){return A(model?.notifications).filter(x=>/PROGRESS|ROZPRAC|STARTED/.test(U(x.status||x.lane))).sort((a,b)=>N(b.priority)-N(a.priority)).slice(0,wipLimit924(model))}
export function lifeAreaBalance926(){const t=timeAllocation921(30),total=Object.values(t).reduce((a,b)=>a+b,0)||1;return Object.entries(t).map(([area,minutes])=>({area,minutes,share:minutes/total})).sort((a,b)=>b.share-a.share)}
export function neglectedAreaDetector927(target=['WORK','FAMILY','MONEY','HOME']){const b=new Map(lifeAreaBalance926().map(x=>[x.area,x.share]));return target.filter(x=>(b.get(x)||0)<0.05).map(area=>({area,reason:'Pod 5 % zaznamenaného času za 30 dní'}))}
export function strategicGoalTracker928(model){return A(model?.monthly?.monthFocus||model?.goals||[]).map(g=>({goal:g.title||g.name||String(g),area:U(g.area),linked:A(model?.notifications).filter(x=>U(x.area)===U(g.area)).length}))}
export function goalContribution929(item,goals=[]){return A(goals).map(g=>({goal:g.goal||g.title,score:U(g.area)===U(item?.area)?100:0})).sort((a,b)=>b.score-a.score)}
export function goalDrift930(model){const goals=strategicGoalTracker928(model);return A(model?.notifications).filter(x=>goalContribution929(x,goals)[0]?.score!==100).slice(0,30)}
export function monthlyGoalReset931(model){return{keep:strategicGoalTracker928(model).filter(x=>x.linked>0),review:strategicGoalTracker928(model).filter(x=>x.linked===0)}}
export function killList932(model){const usage=featureUsageAnalytics886();return [...A(model?.archive).slice(0,10).map(x=>({type:'ITEM',name:x.title||x.name,reason:'120+ dní bez uzavření'})),...A(usage.unusedCandidates).map(x=>({type:'FEATURE',name:x,reason:'Bez usage za 30 dní'}))].slice(0,20)}

// OS933-943 · adaptive UI, playbooks, monthly review and proposal-only autonomy
export function simplifyMyOS933(model){return killList932(model).filter(x=>x.type==='FEATURE').map(x=>({feature:x.name,proposal:'MOVE_TO_MORE_OR_HIDE',reason:x.reason,requiresApproval:true}))}
export function adaptiveNavigation934(){const u=usageSummary892(30);return u.top.map(([feature,count])=>({feature,count})).filter(x=>['today','inbox','tickets','money','more','betting','family','home'].includes(x.feature)).slice(0,5)}
export function adaptiveMoreMenu935(){return usageSummary892(30).top.map(([feature,count])=>({feature,count})).filter(x=>!['today','inbox','money'].includes(x.feature)).slice(0,12)}
export function adaptiveCommandSuggestions936(){return usageSummary892(30).top.filter(([x])=>String(x).startsWith('command:')).map(([feature,count])=>({query:feature.slice(8),count})).slice(0,8)}
export function personalShortcutLearning937(){return adaptiveCommandSuggestions936().filter(x=>x.count>=3).map((x,i)=>({shortcut:`/p${i+1}`,query:x.query,requiresApproval:true}))}
export function smartDefaults938(key,history=[]){const xs=A(history).map(x=>x?.[key]).filter(v=>v!==undefined&&v!==null),counts={};for(const v of xs)counts[String(v)]=(counts[String(v)]||0)+1;const best=Object.entries(counts).sort((a,b)=>b[1]-a[1])[0];return best?{value:best[0],samples:best[1],autoApply:false}:null}
export function decisionTemplates939(){return[{id:'property',steps:['price','rent','net_yield','vacancy','liquidity','decision']},{id:'ticket',steps:['buy_price','market_price','fees','time_to_event','exit','decision']},{id:'work',steps:['deadline','blocker','owner','invoice','closeout']}]}
export function personalPlaybooks940(){const custom=A(json(PLAYBOOK_KEY,[]));return[...decisionTemplates939(),...custom]}
export function playbookSuccessRate941(id){const xs=readOutcomes851().filter(x=>String(x.note||'').includes(`playbook:${id}`));return xs.length?xs.filter(x=>x.outcome==='good').length/xs.length:null}
export function monthlyOSReview942(model){return{health:Math.round(N(model?.health)),confidence:Math.round(N(model?.confidence?.overall)),usage:featureUsageAnalytics886(),outcomes:monthlyDecisionScorecard890(),overload:overloadDetector923(model),neglected:neglectedAreaDetector927(),kill:killList932(model),simplify:simplifyMyOS933(model)}}
export function autonomousImprovementProposal943(model){const review=monthlyOSReview942(model),proposals=[];if(review.overload.overloaded)proposals.push({priority:100,title:'Snížit WIP',change:`Limit aktivních věcí na ${wipLimit924(model)}`,evidence:`${review.overload.active} aktivních / ${review.overload.critical} kritických`,expectedBenefit:'Méně přepínání a nedokončených věcí'});for(const x of review.simplify.slice(0,3))proposals.push({priority:70,title:`Zjednodušit ${x.feature}`,change:x.proposal,evidence:x.reason,expectedBenefit:'Čistší UI'});for(const x of review.neglected.slice(0,2))proposals.push({priority:60,title:`Vrátit pozornost: ${x.area}`,change:'Přidat oblast do měsíčního review',evidence:x.reason,expectedBenefit:'Menší strategický drift'});const bad=Object.entries(confidenceVsReality901(model)).filter(([,v])=>v.samples>=5&&Math.abs(v.gap||0)>=20);for(const [area,v] of bad.slice(0,2))proposals.push({priority:90,title:`Kalibrovat ${area}`,change:`Upravit confidence z ${v.predicted}% směrem k ${v.observed}%`,evidence:`${v.samples} outcomes, gap ${v.gap} b.`,expectedBenefit:'Realističtější confidence'});return{version:AUTONOMOUS943_VERSION,mode:'PROPOSAL_ONLY',requiresApproval:true,autoApply:false,generatedAt:new Date().toISOString(),proposals:proposals.sort((a,b)=>b.priority-a.priority),guardrails:{noAutonomousFinancialExecution:true,noAutonomousBettingExecution:true,noAutomaticUiMutation:true,noAutomaticStrategyMutation:true}}}
export function approveProposal943(proposal){const rows=A(json(APPROVAL_KEY,[]));rows.push({at:new Date().toISOString(),proposal,approved:true});save(APPROVAL_KEY,rows.slice(-300));return rows.at(-1)}
export async function buildAutonomous943(){const model=await buildSelfImproving892();return{...model,reviewQueue:outcomeReviewQueue894(),precision:Object.fromEntries(Object.keys(outcomeByDomain896()).map(a=>[a,recommendationPrecision897(a)])),confidenceReality:confidenceVsReality901(model),confidenceCorrected:confidenceAutoCorrection902(model),verification:smartVerificationOrder909(model),broken:brokenDecisionDetector911(model),recompute:automaticRecompute912(model),attention:attentionBudget922(model),overload:overloadDetector923(model),goals:strategicGoalTracker928(model),kill:killList932(model),adaptiveNav:adaptiveNavigation934(),adaptiveMore:adaptiveMoreMenu935(),proposal:autonomousImprovementProposal943(model)}}
export async function openAutonomous943(){recordUsage892('autonomous-943',{surface:'more'});const m=await buildAutonomous943(),p=m.proposal.proposals[0];const body=`<div class="card"><div class="eyebrow">OS943 · AUTONOMOUS IMPROVEMENT</div><h2>${h(p?.title||'Bez zásadního návrhu')}</h2><p>${h(p?.change||'')}</p><div class="row"><span>Režim</span><b>PROPOSAL ONLY</b></div><div class="row"><span>Outcome review</span><b>${m.reviewQueue.length}</b></div><div class="row"><span>Broken decisions</span><b>${m.broken.length}</b></div><div class="row"><span>Active workload</span><b>${m.attention.active}</b></div><p class="muted">OS může připravit návrh a důkazy, ale sám nemění strategii, navigaci ani finanční/betting akce.</p></div><div class="card"><div class="eyebrow">DALŠÍ NÁVRHY</div>${m.proposal.proposals.slice(1,7).map(x=>`<div class="row"><span>${h(x.title)}</span><b>${h(x.evidence||'')}</b></div>`).join('')||'<div class="empty">Žádné další návrhy.</div>'}</div>`;const c=await modal('Autonomous Improvement Proposals',body,[{label:'Schválit hlavní návrh',value:'approve',primary:!!p},{label:'Zavřít',value:null}]);if(c==='approve'&&p)return approveProposal943(p);return c}
