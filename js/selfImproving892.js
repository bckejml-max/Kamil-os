import {store} from './state.js';
import {modal,h} from './utils.js';
import {buildCopilot842,readFeedback842} from './copilotFeedback842.js';
import {usageSummary892,recordUsage892} from './usage892.js';

export const SELF_IMPROVING892_VERSION='892.0.0';
const OUTCOME_KEY='kamil.copilot.outcomes.892';
const CONTEXT_KEY='kamil.copilot.context.892';
const MODE_KEY='kamil.copilot.mode.892';
const CHANGE_KEY='kamil.copilot.change-log.892';
const A=v=>Array.isArray(v)?v:[];
const N=v=>Number.isFinite(Number(v))?Number(v):0;
const U=v=>String(v||'').toUpperCase();
const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,N(v)));
const json=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch{return d}};
const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch{return false}};

export function feedbackAnalytics843(){const rows=readFeedback842(),byArea={},reasons={};for(const x of rows){const a=U(x.area)||'GENERAL',g=byArea[a]||{up:0,down:0,total:0};g[x.vote==='down'?'down':'up']++;g.total++;byArea[a]=g;if(x.reason)reasons[x.reason]=(reasons[x.reason]||0)+1}return{total:rows.length,byArea,reasons,topProblem:Object.entries(reasons).sort((a,b)=>b[1]-a[1])[0]?.[0]||null}}
export function confidenceCalibration844(model,analytics=feedbackAnalytics843()){const out={...model.confidence};for(const [area,g] of Object.entries(analytics.byArea)){if(g.total<3)continue;const hit=g.up/g.total,adj=(hit-.5)*20,key=area.toLowerCase();if(key in out)out[key]=clamp(N(out[key])+adj)}return out}
export function badDataDetector845(){return readFeedback842().filter(x=>x.vote==='down'&&x.reason==='bad_data').slice(-20)}
export function priorityMisfire846(){return readFeedback842().filter(x=>x.vote==='down'&&x.reason==='bad_priority').slice(-20)}
export function feedbackReasonTrends847(){return feedbackAnalytics843().reasons}
export function domainTrust848(calibrated){return Object.entries(calibrated||{}).map(([domain,score])=>({domain,score:Math.round(N(score)),grade:N(score)>=80?'HIGH':N(score)>=60?'MEDIUM':'LOW'})).sort((a,b)=>b.score-a.score)}
export function confidenceExplanation849(domain,model,analytics){const base=N(model.confidence?.[domain]??model.confidence?.overall),g=analytics.byArea?.[U(domain)]||{up:0,down:0,total:0};return{domain,base,feedbackTotal:g.total,positive:g.up,negative:g.down,reason:g.total?`Feedback ${g.up}/${g.total} pozitivní`:'Zatím bez dostatku feedbacku'}}

export function readOutcomes851(){return A(json(OUTCOME_KEY,[]))}
export function recordOutcome851(row={}){const rows=readOutcomes851();rows.push({id:`o-${Date.now()}`,at:new Date().toISOString(),area:U(row.area)||'GENERAL',recommendation:String(row.recommendation||''),outcome:['good','bad','neutral'].includes(row.outcome)?row.outcome:'neutral',note:String(row.note||'')});save(OUTCOME_KEY,rows.slice(-500));return rows.at(-1)}
export function decisionReliability850(){const by={};for(const x of readOutcomes851()){const g=by[x.area]||{good:0,bad:0,neutral:0,total:0};g[x.outcome]++;g.total++;by[x.area]=g}return by}
export function learningWeight852(area){const xs=readOutcomes851().filter(x=>x.area===U(area)).slice(-30);if(!xs.length)return 0;return Math.max(-10,Math.min(10,xs.reduce((a,x)=>a+(x.outcome==='good'?2:x.outcome==='bad'?-2:0),0)))}

export function contextMemory853(){return json(CONTEXT_KEY,{byArea:{},lastQuery:'',lastAnswer:''})}
export function updateContext853(area,patch={}){const c=contextMemory853(),k=U(area)||'GENERAL';c.byArea[k]={...(c.byArea[k]||{}),...patch,updatedAt:new Date().toISOString()};save(CONTEXT_KEY,c);return c}
export function followupContext854(area){return contextMemory853().byArea?.[U(area)]||null}
export function readMode892(){return json(MODE_KEY,{goal:'',focus:[],timeBudget:null,energy:'normal',moneyFree:false,deepWork:false,quickWins:false})}
export function setMode892(patch={}){const m={...readMode892(),...patch};save(MODE_KEY,m);return m}
export const sessionGoal855=goal=>setMode892({goal:String(goal||'')});
export const focusMode856=focus=>setMode892({focus:A(focus).map(U)});
export const timeBudget857=minutes=>setMode892({timeBudget:Math.max(5,N(minutes))});
export const energyMode858=energy=>setMode892({energy:['low','normal','high'].includes(energy)?energy:'normal'});
export const moneyFreeMode859=on=>setMode892({moneyFree:!!on});
export const deepWorkMode860=on=>setMode892({deepWork:!!on,quickWins:on?false:readMode892().quickWins});
export const quickWinsMode861=on=>setMode892({quickWins:!!on,deepWork:on?false:readMode892().deepWork});

function ageDays(x){const t=Date.parse(x?.updatedAt||x?.at||x?.createdAt||x?.date||'');return Number.isFinite(t)?Math.max(0,(Date.now()-t)/86400000):0}
export const priorityDecay862=x=>Math.max(-20,-Math.floor(ageDays(x)/14)*2);
export const urgencyAcceleration863=x=>{const t=Date.parse(x?.due||x?.deadline||'');if(!Number.isFinite(t))return 0;const d=(t-Date.now())/86400000;return d<0?30:d<=1?20:d<=3?12:d<=7?6:0};
export const waitingEscalation864=x=>{const d=ageDays(x);return /WAIT|ČEK|CEK/.test(U(x?.status||x?.lane))&&d>=5?Math.min(20,Math.floor(d-4)*2):0};
export function notificationCooldown865(item){const log=A(json(CHANGE_KEY,[])).filter(x=>x.key===String(item?.id||item?.title||'')).slice(-1)[0];if(!log)return false;return Date.now()-Date.parse(log.at)<24*3600000&&log.state===JSON.stringify(item)}
export const meaningfulChange866=(a,b)=>JSON.stringify(a)!==JSON.stringify(b);
export function logDecisionChange867(key,before,after,reason=''){if(!meaningfulChange866(before,after))return null;const rows=A(json(CHANGE_KEY,[]));const row={key:String(key),at:new Date().toISOString(),before,after,reason};rows.push(row);save(CHANGE_KEY,rows.slice(-500));return row}
export const explainWhatChanged868=(a,b)=>Object.keys({...a,...b}).filter(k=>JSON.stringify(a?.[k])!==JSON.stringify(b?.[k])).map(k=>({field:k,before:a?.[k],after:b?.[k]}));
export const scenarioComparison869=rows=>A(rows).map(x=>({name:x.name||x.title,returnPct:N(x.returnPct||x.yieldPct||x.roi),risk:N(x.risk||x.riskScore),liquidity:N(x.liquidity),cost:N(x.cost||x.amount)}));
export const regretMinimizer870=rows=>A(rows).map(x=>({...x,worstCase:N(x.worstCase||x.loss||x.cost)*-1})).sort((a,b)=>b.worstCase-a.worstCase);
export const opportunityCost871=(amount,alternatives)=>A(alternatives).map(x=>({name:x.name||x.title,foregone:amount*Math.max(0,N(x.returnPct))/100})).sort((a,b)=>b.foregone-a.foregone);
export const liquidityCost872=x=>({locked:N(x.cost||x.amount),liquidity:N(x.liquidity),costScore:clamp(100-N(x.liquidity))});
export function decisionDeadline873(x){const t=Date.parse(x?.due||x?.deadline||x?.event_date||'');if(!Number.isFinite(t))return{label:'NENÍ URGENTNÍ',days:null};const d=Math.ceil((t-Date.now())/86400000);return{label:d<=0?'TEĎ':d<=2?'DO 48 HODIN':d<=7?'TENTO TÝDEN':'NENÍ URGENTNÍ',days:d}}
export function recheckTrigger874(x){if(x.type==='PROPERTY')return'změna ceny, nájmu nebo financování';if(x.type==='TICKET')return'změna market price, času do eventu nebo payoutu';if(x.type==='BETTING')return'změna kurzu nebo model probability';if(x.type==='MONEY')return'změna cash, sazeb nebo nové investice';if(x.type==='WORK')return'změna termínu, blockeru nebo fakturace';return'významná změna vstupních dat'}
export function watchlist875(model){return [...A(model.control?.property?.rows).map(x=>({type:'PROPERTY',title:x.name||x.title,...x})),...A(model.control?.ticket?.rows).map(x=>({type:'TICKET',title:x.event_name||x.title,...x}))].filter(x=>decisionDeadline873(x).label!=='TEĎ').slice(0,30)}
export const smartWatchFrequency876=x=>{const d=decisionDeadline873(x).days;if(d===null)return'WEEKLY';if(d<=2)return'HOURLY';if(d<=7)return'DAILY';return'WEEKLY'};
export const propertyRecheck877=x=>({type:'PROPERTY',trigger:recheckTrigger874({type:'PROPERTY'}),score:N(x.dealScore||x.score)});
export const ticketRecheck878=x=>({type:'TICKET',trigger:recheckTrigger874({type:'TICKET'}),score:N(x.buyScore)});
export const bettingRecheck879=x=>({type:'BETTING',trigger:recheckTrigger874({type:'BETTING'}),stop:!!x.stop});
export const moneyRecheck880=x=>({type:'MONEY',trigger:recheckTrigger874({type:'MONEY'}),cash:N(x.free||x.cash)});
export const workRecheck881=x=>({type:'WORK',trigger:recheckTrigger874({type:'WORK'}),risk:N(x.riskScore)});

export function dailyDataRefresh882(model){return A(model.missing).slice(0,12)}
export function weeklyDataHygiene883(model){return{stale:A(model.strategy?.sla?.ticket).filter(x=>x.stale).length+A(model.strategy?.sla?.property).filter(x=>x.stale).length,duplicates:A(model.strategy?.duplicates).length,missing:A(model.missing).length}}
export function archiveIntelligence884(s=store.get()){return [...A(s.tasks),...A(s.personalAdmin?.items),...A(s.personalGoals?.items)].filter(x=>!['DONE','CLOSED','ARCHIVED'].includes(U(x.status))&&ageDays(x)>120).slice(0,30)}
export function deadDataDetector885(s=store.get()){const out=[];for(const [k,v] of Object.entries(s||{})){if(Array.isArray(v)&&v.length===0)out.push(k);else if(v&&typeof v==='object'&&!Array.isArray(v)&&Object.keys(v).length===0)out.push(k)}return out.slice(0,50)}
export function featureUsageAnalytics886(){return usageSummary892(30)}
export function uiSimplification887(usage=featureUsageAnalytics886()){return usage.unusedCandidates.map(x=>({feature:x,action:'SCHOVAT / PŘESUNOUT POD VÍCE',reason:'Bez zaznamenaného použití za posledních 30 dní'}))}
export function personalKpi888(model){return[{name:'OS Health',value:Math.round(N(model.health))},{name:'Data confidence',value:Math.round(N(model.confidence?.overall))},{name:'Missing data',value:A(model.missing).length},{name:'High priority',value:A(model.notifications).filter(x=>N(x.priority)>=90).length},{name:'Work risk',value:A(model.control?.work).filter(x=>N(x.riskScore)>=70).length},{name:'Dead ticket capital',value:A(model.control?.ticket?.deadCapital).length}]}
export function weeklyWinsLosses889(){const xs=readOutcomes851().filter(x=>Date.now()-Date.parse(x.at)<=7*86400000);return{wins:xs.filter(x=>x.outcome==='good'),losses:xs.filter(x=>x.outcome==='bad')}}
export function monthlyDecisionScorecard890(){const xs=readOutcomes851().filter(x=>Date.now()-Date.parse(x.at)<=31*86400000),by={};for(const x of xs){const g=by[x.area]||{good:0,bad:0,neutral:0};g[x.outcome]++;by[x.area]=g}return by}
export function strategyDrift891(model){const usage=featureUsageAnalytics886(),focus=A(model.monthly?.monthFocus).map(x=>U(x.area)),topUsed=usage.top.map(([x])=>U(x));return focus.filter(x=>x&&!topUsed.some(u=>u.includes(x))).map(area=>({area,warning:'Deklarovaná priorita není vidět v posledním používání OS'}))}
export function selfImprovement892(model){const a=feedbackAnalytics843(),usage=featureUsageAnalytics886(),hyg=weeklyDataHygiene883(model),drift=strategyDrift891(model),suggestions=[];if(a.reasons.bad_data)suggestions.push({priority:100,title:'Opravit datové zdroje',reason:`${a.reasons.bad_data}× feedback „špatná data“`});if(a.reasons.bad_priority)suggestions.push({priority:95,title:'Doladit ranking priorit',reason:`${a.reasons.bad_priority}× špatná priorita`});if(hyg.missing>5)suggestions.push({priority:90,title:'Snížit missing data',reason:`${hyg.missing} datových mezer`});if(drift.length)suggestions.push({priority:80,title:'Srovnat strategii s používáním',reason:`${drift.length} oblastí ve driftu`});for(const x of uiSimplification887(usage).slice(0,3))suggestions.push({priority:50,title:`Zjednodušit ${x.feature}`,reason:x.reason});return suggestions.sort((a,b)=>b.priority-a.priority)}

function applyModes(model){const mode=readMode892(),rows=A(model.notifications).map(x=>({...x,_score:N(x.priority)+priorityDecay862(x)+urgencyAcceleration863(x)+waitingEscalation864(x)+learningWeight852(x.area)}));for(const x of rows){if(mode.focus.length&&!mode.focus.includes(U(x.area)))x._score-=25;if(mode.moneyFree&&['MONEY','TICKETS','BETTING'].includes(U(x.area)))x._score-=40;if(mode.quickWins)x._score+=/rychl|quick|5 min|10 min/i.test(`${x.title} ${x.detail}`)?15:-5;if(mode.deepWork)x._score+=/projekt|dokument|strategie|deep/i.test(`${x.title} ${x.detail}`)?10:0;if(mode.energy==='low')x._score-=N(x.effort||0)>60?15:0;if(mode.energy==='high')x._score+=N(x.impact||0)>70?8:0}rows.sort((a,b)=>b._score-a._score);return{...model,notifications:rows.map(({_score,...x})=>x),nextBest:rows[0]||model.nextBest,mode892:mode}}

export async function buildSelfImproving892(){const base=await buildCopilot842(),model=applyModes(base),analytics=feedbackAnalytics843(),calibrated=confidenceCalibration844(model,analytics);return{...model,version892:SELF_IMPROVING892_VERSION,confidenceCalibrated:calibrated,feedbackAnalytics:analytics,domainTrust:domainTrust848(calibrated),reliability:decisionReliability850(),badData:badDataDetector845(),priorityMisfires:priorityMisfire846(),usage:featureUsageAnalytics886(),kpis:personalKpi888(model),refresh:dailyDataRefresh882(model),hygiene:weeklyDataHygiene883(model),archive:archiveIntelligence884(),deadData:deadDataDetector885(),watchlist:watchlist875(model),winsLosses:weeklyWinsLosses889(),scorecard:monthlyDecisionScorecard890(),drift:strategyDrift891(model),selfImprove:selfImprovement892(model),guardrails:{...model.guardrails,feedbackCannotOverrideSafety:true,outcomesWeightedMoreThanVotes:true,noAutonomousExecution:true}}}

export async function openSelfImproving892(){recordUsage892('self-improving');const m=await buildSelfImproving892(),top=m.nextBest,improve=m.selfImprove[0];const body=`<div class="card"><div class="eyebrow">OS892 · SELF-IMPROVING</div><h2>${h(top?.title||top?.action||'Bez kritické priority')}</h2><p>${h(top?.detail||top?.reason||'')}</p><div class="row"><span>OS Health</span><b>${Math.round(N(m.health))}%</b></div><div class="row"><span>Feedback</span><b>${m.feedbackAnalytics.total}</b></div><div class="row"><span>Usage 30 dní</span><b>${m.usage.total}</b></div><div class="row"><span>Data gaps</span><b>${A(m.missing).length}</b></div></div><div class="card"><div class="eyebrow">CO ZLEPŠIT V OS</div><h2>${h(improve?.title||'Bez zásadního návrhu')}</h2><p>${h(improve?.reason||'')}</p>${m.selfImprove.slice(1,6).map(x=>`<div class="row"><span>${h(x.title)}</span><b>${h(x.reason)}</b></div>`).join('')}</div><div class="card"><div class="eyebrow">KPI</div>${m.kpis.map(x=>`<div class="row"><span>${h(x.name)}</span><b>${h(String(x.value))}</b></div>`).join('')}</div>`;return modal('Self-Improving Kamil OS',body,[{label:'Zavřít',value:null,primary:true}])}
