import {store} from './state.js';
import {modal,h,toast} from './utils.js';
import {moneyCockpit954,ticketPortfolio957,bettingLedger958,propertyCenter959,documentIntelligence962} from './oneOS967.js';

export const ONE_OS977_VERSION='977.0.0';
const PREF_KEY='kamil.oneos.preferences.968';
const USAGE_KEY='kamil.oneos.usage.975';
const ACTION_KEY='kamil.oneos.actions.949';
const A=v=>Array.isArray(v)?v:[];
const N=v=>Number.isFinite(Number(v))?Number(v):0;
const U=v=>String(v||'').toUpperCase();
const json=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch{return d}};
const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch{return false}};

export function readPreferences968(){return{legacyToday:false,mobileAction:true,...json(PREF_KEY,{})}}
export function setPreferences968(patch={}){const next={...readPreferences968(),...patch};save(PREF_KEY,next);applyPreferences968(next);return next}
export function applyPreferences968(p=readPreferences968()){
 const today=document.querySelector('#todayView');today?.classList.toggle('oneos967-show-legacy',!!p.legacyToday);
 const mobile=document.querySelector('[data-oneos-mobile965]');if(mobile)mobile.style.display=p.mobileAction?'':'none';
 return p;
}

export const retirementRegistry969=()=>[
 {legacy:'Operator Center · OS717',replacement:'Autopilot + Action Center · OS967',state:'ADVANCED'},
 {legacy:'Truth & Learning · OS737',replacement:'Source Confidence + Data Gaps · OS972/973',state:'ADVANCED'},
 {legacy:'Data Truth Audit · OS738',replacement:'Source Confidence + Data Gaps · OS972/973',state:'ADVANCED'},
 {legacy:'Strategy & Control · OS788',replacement:'Opportunity Engine + Decision Journal · OS955/956',state:'ADVANCED'},
 {legacy:'Copilot & Control · OS842',replacement:'Command Bar + Autopilot · OS951/967',state:'ADVANCED'},
 {legacy:'Self-Improving OS · OS892',replacement:'Learning backend; UI only for diagnostics',state:'BACKEND'},
 {legacy:'Autonomous proposals · OS943–945',replacement:'Advanced change lab',state:'ADVANCED'},
 {legacy:'Ticket Commander · OS660',replacement:'Ticket Portfolio 3.0 · OS957',state:'ADVANCED'}
];

export function commandOwnership970(q=''){
 const x=String(q||'').trim().toLowerCase();
 const owned=/^\/(os|one|inbox|cash|money|tickets|bets|betting|property|byt|family|home|docs|timeline|opportunities|find|health|gaps|legacy)\b/.test(x)||/^(co mam dnes|co mám dnes|co mam ted|co mám teď|najdi\s+)/.test(x);
 return{owned,owner:owned?'ONE_OS':'LEGACY_FALLBACK',policy:'explicit-only'};
}

export function recordUsage975(feature,surface='oneos'){
 if(!feature)return null;const rows=A(json(USAGE_KEY,[])),row={feature:String(feature),surface,at:new Date().toISOString()};rows.push(row);save(USAGE_KEY,rows.slice(-600));return row;
}
export function usage975(days=30){
 const since=Date.now()-days*86400000,rows=A(json(USAGE_KEY,[])).filter(x=>Date.parse(x.at)>=since),by={};for(const x of rows)by[x.feature]=(by[x.feature]||0)+1;
 return{days,total:rows.length,by,top:Object.entries(by).sort((a,b)=>b[1]-a[1]).slice(0,8)};
}

export function actionOutcomes974(){
 const rows=A(json(ACTION_KEY,[])),since=Date.now()-30*86400000,recent=rows.filter(x=>Date.parse(x.at)>=since),counts={do:0,snooze:0,ignore:0,done:0};for(const x of recent)if(x.action in counts)counts[x.action]++;
 const resolved=counts.done+counts.ignore,total=recent.length;return{total,counts,resolved,completionRate:total?Math.round(counts.done/total*100):null};
}

export function sourceConfidence972(s=store.get()){
 const money=moneyCockpit954(s),tickets=ticketPortfolio957(s),bets=bettingLedger958(s),property=propertyCenter959(s),docs=documentIntelligence962(s);
 const moneyKnown=Object.prototype.hasOwnProperty.call(s.financePlan||{},'cashNow')&&!!money.asOf;
 return[
  {domain:'MONEY',grade:moneyKnown?'MEDIUM':'LOW',detail:moneyKnown?'cash + datum aktualizace':'chybí datum nebo canonical cash'},
  {domain:'TICKETS',grade:tickets.active.length&&!tickets.missingMarket?'HIGH':tickets.active.length?'MEDIUM':'LOW',detail:`${tickets.active.length} aktivních · ${tickets.missingMarket} bez market ceny`},
  {domain:'BETTING',grade:bets.rows.length&&bets.withClv===bets.rows.length?'HIGH':bets.rows.length?'MEDIUM':'LOW',detail:`${bets.rows.length} sázek · ${bets.withClv} s CLV`},
  {domain:'PROPERTY',grade:property.rows.length&&!property.missing?'HIGH':property.rows.length?'MEDIUM':'LOW',detail:`${property.rows.length} kandidátů · ${property.missing} nekompletních`},
  {domain:'DOCS',grade:docs.length?'MEDIUM':'LOW',detail:`${docs.length} strukturovaných dokumentových položek`}
 ];
}

export function dataGaps973(s=store.get()){
 const gaps=[],tickets=ticketPortfolio957(s),property=propertyCenter959(s),bets=bettingLedger958(s),docs=documentIntelligence962(s);
 if(!s.financePlan?.asOf&&!s.meta?.lastMutationAt)gaps.push({area:'MONEY',priority:90,title:'Chybí datum aktuálnosti financí',fix:'Aktualizovat Money / financePlan'});
 if(!Object.prototype.hasOwnProperty.call(s.financePlan||{},'reserveFloor'))gaps.push({area:'MONEY',priority:85,title:'Chybí rezervní minimum',fix:'Doplnit reserveFloor'});
 if(tickets.missingMarket)gaps.push({area:'TICKETS',priority:80,title:`${tickets.missingMarket} ticketů bez market ceny`,fix:'Doplnit current/market price'});
 if(property.missing)gaps.push({area:'PROPERTY',priority:78,title:`${property.missing} bytů bez ceny nebo nájmu`,fix:'Doplnit price + rent'});
 if(bets.rows.length&&bets.withClv<bets.rows.length)gaps.push({area:'BETTING',priority:62,title:`${bets.rows.length-bets.withClv} sázek bez CLV`,fix:'Doplnit closing odds pouze pokud jsou známé'});
 if(!docs.length)gaps.push({area:'DOCS',priority:45,title:'Dokumenty nemají strukturovaná metadata',fix:'Doplnit typ / protistranu / platnost'});
 return gaps.sort((a,b)=>b.priority-a.priority);
}

export function safePerformance976(){
 const styles=[...document.querySelectorAll('link[rel="stylesheet"]')],hrefs=styles.map(x=>x.href),duplicates=hrefs.filter((x,i)=>hrefs.indexOf(x)!==i),boot=window.__KAMIL_BOOT_BUDGET343__||{},deferred=window.__KAMIL_DEFERRED345__||{};
 return{styles:styles.length,duplicateStyles:new Set(duplicates).size,bootHealthy:boot.healthy!==false,deferredHealthy:deferred.healthy!==false,bootFailures:A(boot.failures).length,deferredFailures:A(deferred.failures).length,oneOSInstalled:!!window.__KAMIL_ONE_OS967__?.installed};
}

export function consolidationHealth977(){
 const perf=safePerformance976(),gaps=dataGaps973(),usage=usage975(),outcomes=actionOutcomes974();let score=100;
 if(!perf.oneOSInstalled)score-=45;score-=Math.min(24,gaps.filter(x=>x.priority>=75).length*6);score-=Math.min(15,(perf.bootFailures+perf.deferredFailures)*5);score-=Math.min(8,perf.duplicateStyles*2);
 return{score:Math.max(0,score),perf,gaps,usage,outcomes,retirement:retirementRegistry969(),sources:sourceConfidence972(),policy:{oneOSFirst:true,legacyAccessible:true,noAutoFinancialExecution:true,commandRouting:'explicit-only'}};
}

async function openPreferences968(){
 const p=readPreferences968(),v=await modal('One OS preference · OS968',`<div class="card"><div class="row"><span>Původní detail Dnes</span><b>${p.legacyToday?'ZOBRAZIT':'SKRÝT'}</b></div><div class="row"><span>Mobilní „Co teď“</span><b>${p.mobileAction?'ZOBRAZIT':'SKRÝT'}</b></div></div>`,[{label:p.legacyToday?'Skrýt legacy Dnes':'Zobrazit legacy Dnes',value:'legacy',primary:true},{label:p.mobileAction?'Skrýt „Co teď“':'Zobrazit „Co teď“',value:'mobile'},{label:'Zavřít',value:null}]);
 if(v==='legacy')setPreferences968({legacyToday:!p.legacyToday});if(v==='mobile')setPreferences968({mobileAction:!p.mobileAction});return v;
}
export async function openDataGaps973(){const rows=dataGaps973();return modal('Data Gaps Resolver · OS973',`${rows.length?rows.map(x=>`<div class="row"><div><div class="eyebrow">${h(x.area)} · ${x.priority}</div><b>${h(x.title)}</b><div class="muted">${h(x.fix)}</div></div></div>`).join(''):'<div class="empty success-empty">Žádná významná strukturovaná mezera.</div>'}`,[{label:'Stav a export dat',value:'health',primary:true},{label:'Zavřít',value:null}]).then(async v=>{if(v==='health'){const m=await import('./personalSettings647.js');return m.openPersonalDataHealth647()}return v})}
export async function openLegacy969(){
 const rows=retirementRegistry969(),v=await modal('Pokročilé / legacy · OS969',`<div class="decision-note">Tyto vrstvy zůstávají dostupné pro diagnostiku a specializované workflow, ale nejsou primární navigace One OS.</div>${rows.map(x=>`<div class="row"><div><b>${h(x.legacy)}</b><div class="muted">→ ${h(x.replacement)}</div></div><span>${h(x.state)}</span></div>`).join('')}`,[{label:'Operator 717',value:'operator'},{label:'Truth 737',value:'truth'},{label:'Audit 738',value:'audit'},{label:'Strategy 788',value:'strategy'},{label:'Copilot 842',value:'copilot'},{label:'Self-Improving 892',value:'self'},{label:'Proposals 943',value:'autonomous'},{label:'Review 944',value:'review'},{label:'Safe Plan 945',value:'safe'},{label:'Ticket Commander',value:'tickets'},{label:'Zavřít',value:null}]);
 if(!v)return v;recordUsage975(`legacy:${v}`,'legacy');
 const map={operator:['./operator717.js','openOperator717'],truth:['./operatorTruth737.js','openTruthCenter737'],audit:['./dataTruthAudit738.js','openDataTruthAudit738'],strategy:['./strategy788.js','openStrategy788'],copilot:['./copilotFeedback842.js','openCopilot842'],self:['./selfImproving892.js','openSelfImproving892'],autonomous:['./autonomous943.js','openAutonomous943'],review:['./proposalReview944.js','openProposalReview944'],safe:['./safeChangePlan945.js','openSafeChangePlan945'],tickets:['./ticketCommander660.js','openTicketCommander660']};
 const [path,fn]=map[v]||[];if(!path)return null;try{const m=await import(path);return m[fn]?.()}catch(error){console.error('[OS969]',error);toast('Legacy centrum se nepodařilo otevřít');return null}
}
async function openSources972(){const rows=sourceConfidence972();return modal('Source Confidence · OS972',rows.map(x=>`<div class="row"><div><b>${h(x.domain)}</b><div class="muted">${h(x.detail)}</div></div><span>${h(x.grade)}</span></div>`).join(''),[{label:'Data gaps',value:'gaps',primary:true},{label:'Zavřít',value:null}]).then(v=>v==='gaps'?openDataGaps973():v)}
async function openUsage975(){const x=usage975(),o=actionOutcomes974();return modal('One OS Usage · OS974/975',`<div class="metric-strip"><div class="metric"><span>One OS akcí / 30 d</span><b>${x.total}</b></div><div class="metric"><span>Action Center záznamů</span><b>${o.total}</b></div><div class="metric"><span>Hotovo</span><b>${o.counts.done}</b></div><div class="metric"><span>Completion</span><b>${o.completionRate===null?'—':o.completionRate+' %'}</b></div></div>${x.top.map(([k,n])=>`<div class="row"><span>${h(k)}</span><b>${n}</b></div>`).join('')||'<div class="empty">Zatím bez usage historie.</div>'}`,[{label:'Zavřít',value:null,primary:true}])}
async function openPerformance976(){const x=safePerformance976();return modal('Safe Performance · OS976',`<div class="card"><div class="row"><span>One OS</span><b>${x.oneOSInstalled?'OK':'CHYBÍ'}</b></div><div class="row"><span>Boot</span><b>${x.bootHealthy?'OK':'PROBLÉM'}</b></div><div class="row"><span>Deferred</span><b>${x.deferredHealthy?'OK':'PROBLÉM'}</b></div><div class="row"><span>Duplicitní CSS</span><b>${x.duplicateStyles}</b></div><div class="row"><span>Boot/deferred chyby</span><b>${x.bootFailures+x.deferredFailures}</b></div></div>`,[{label:'Zavřít',value:null,primary:true}])}

export async function openConsolidation977(){
 recordUsage975('control','more');const x=consolidationHealth977(),v=await modal('One OS Control · OS977',`<div class="card"><div class="eyebrow">CONSOLIDATION HEALTH</div><h2>${Math.round(x.score)} / 100</h2><p class="muted">One OS je primární pracovní vrstva. Legacy moduly zůstávají dostupné pouze pod Pokročilé.</p><div class="row"><span>Datové mezery</span><b>${x.gaps.length}</b></div><div class="row"><span>One OS použití / 30 dní</span><b>${x.usage.total}</b></div><div class="row"><span>Legacy centra mimo hlavní navigaci</span><b>${x.retirement.length}</b></div><div class="row"><span>Command routing</span><b>EXPLICIT ONLY</b></div></div>`,[{label:'Autopilot',value:'autopilot',primary:true},{label:'Data gaps',value:'gaps'},{label:'Source confidence',value:'sources'},{label:'Usage',value:'usage'},{label:'Preference',value:'prefs'},{label:'Performance',value:'performance'},{label:'Pokročilé / legacy',value:'legacy'},{label:'Zavřít',value:null}]);
 if(v==='autopilot'){const m=await import('./oneOS967.js');return m.openFeature('autopilot')}if(v==='gaps')return openDataGaps973();if(v==='sources')return openSources972();if(v==='usage')return openUsage975();if(v==='prefs')return openPreferences968();if(v==='performance')return openPerformance976();if(v==='legacy')return openLegacy969();return v;
}

function bindUsage975(){document.addEventListener('click',e=>{const b=e.target.closest?.('[data-oneos-open]');if(b)recordUsage975(b.dataset.oneosOpen,'today')},true);document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target?.id==='commandInput'){const q=e.target.value||'',o=commandOwnership970(q);if(o.owned)recordUsage975(`command:${String(q).trim().split(/\s+/)[0]}`,'command')}},true)}
function bindCommands977(){document.addEventListener('keydown',e=>{if(e.key!=='Enter'||e.target?.id!=='commandInput')return;const q=String(e.target.value||'').trim().toLowerCase();let fn=null;if(/^\/health\b/.test(q))fn=openConsolidation977;else if(/^\/gaps\b/.test(q))fn=openDataGaps973;else if(/^\/legacy\b/.test(q))fn=openLegacy969;if(!fn)return;e.preventDefault();e.stopImmediatePropagation();fn()},true)}
export function installOneOS977(){if(window.__KAMIL_ONE_OS977__?.installed)return;bindUsage975();bindCommands977();applyPreferences968();window.addEventListener('kamil:boot-budget343',()=>setTimeout(()=>applyPreferences968(),0),{once:true});window.__KAMIL_ONE_OS977__={version:ONE_OS977_VERSION,installed:true,features:[968,969,970,971,972,973,974,975,976,977],health:consolidationHealth977,open:openConsolidation977,legacy:openLegacy969,gaps:dataGaps973,usage:usage975,preferences:readPreferences968}}
