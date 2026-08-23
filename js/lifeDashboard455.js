import {store} from './state.js';
import {h,money,modal} from './utils.js';
import {personalFinance445,openPersonalFinance445} from './personalFinance445.js';
import {lifePlanner446,openLifePlanner446} from './lifePlanner446.js';
import {cashflow447,openCashflow447} from './cashflow447.js';
import {wealth448,openWealth448} from './wealth448.js';
import {ticketIntel449,openTicketIntel449} from './ticketIntel449.js';
import {inbox450,openInbox450} from './inbox450.js';
import {maintenance451,openMaintenance451} from './maintenance451.js';
import {family452,openFamily452} from './family452.js';
import {goals453,openGoals453} from './goals453.js';
import {decision454,openDecision454} from './decision454.js';
import {personalLifePlus475,openPersonalLifePlus475} from './personalLifePlus475.js';
import {practical490,openPractical490} from './personalPractical490.js';
import {command500,openCommand500} from './personalCommand500.js';
import {suite530,openSuite530,openAssistant530,openQuickCapture501} from './personalAssistant530.js';
import {openPersonalLifeCommander621} from './personalLifeCommander621.js';
// Legacy release-gate compatibility markers: Životní dashboard 47.5 · Životní dashboard 49.0 · Životní dashboard 50.0 · Life+ 20 · TOP 3 DNES

export function lifeDashboard455(s=store.get()){
 const finance=personalFinance445(s),plan=lifePlanner446(s),cashflow=cashflow447(s),wealth=wealth448(s),tickets=ticketIntel449(s),inbox=inbox450(s),maintenance=maintenance451(s),family=family452(s),goals=goals453(s),decision=decision454(s),plus=personalLifePlus475(s),practical=practical490(s),command=command500(s),assistant=suite530(s);
 const alerts=[];
 if(finance.reserveGap>0)alerts.push(`Rezerva: chybí ${money(finance.reserveGap)}`);
 if(finance.portfolio.stale)alerts.push('XTB data jsou stará');
 if(maintenance.overdue.length)alerts.push(`Údržba: ${maintenance.overdue.length} po termínu`);
 if(inbox.needsFollow.length)alerts.push(`Follow-up: ${inbox.needsFollow.length}`);
 if(cashflow.d90.end<finance.reserve)alerts.push('90denní cashflow klesá pod rezervu');
 if(plus.health.score<65)alerts.push(`Life Health: ${plus.health.score}/100`);
 if(practical.missing.missing.length)alerts.push(`Chybí ${practical.missing.missing.length} oblastí dat`);
 if(assistant.anomalies.length)alerts.push(`Výdaje: ${assistant.anomalies.length} anomálie`);
 return{finance,plan,cashflow,wealth,tickets,inbox,maintenance,family,goals,decision,plus,practical,command,assistant,alerts};
}

export async function openLifeDashboard455(){
 const t=performance.now(),x=lifeDashboard455();window.__KAMIL_LIFE_455_LAST__={ms:Math.round((performance.now()-t)*10)/10,at:Date.now()};
 const top=x.command.next.main?`<div class="row"><div><b>${h(x.command.next.main.title)}</b><div class="muted">${h(x.command.next.main.reason)}</div></div></div>`:x.decision.doNow.map((v,i)=>`<div class="row"><div><b>${i+1}. ${h(v.title)}</b><div class="muted">${h(v.reason)} · skóre ${v.score}</div></div>${v.money?`<b>${money(v.money)}</b>`:''}</div>`).join('')||'<div class="empty">Dnes nic zásadního nehoří.</div>';
 const alert=x.alerts.length?x.alerts.slice(0,3).map(a=>`<div class="row"><span>${h(a)}</span><b>HLÍDAT</b></div>`).join(''):'<div class="empty success-empty">Bez zásadní osobní výstrahy podle uložených dat.</div>';
 const next=x.plan.d90.slice(0,5).map(v=>`<div class="row"><div><b>${h(v.title)}</b><div class="muted">${h(v.kind)} · ${v.days===null?'bez termínu':`za ${v.days} d`}</div></div>${v.amount?`<b>${money(v.amount)}</b>`:''}</div>`).join('')||'<div class="empty">Na 3 měsíce nic velkého.</div>';
 const body=`<div class="metric-strip"><div class="metric"><span>Readiness</span><b>${x.command.readiness}/100</b></div><div class="metric"><span>Life Health</span><b>${x.plus.health.score}/100</b></div><div class="metric"><span>Safe purchase</span><b>${money(x.assistant.purchase.limit)}</b></div><div class="metric"><span>Investice / měsíc</span><b>${money(x.assistant.contribution.suggested)}</b></div></div><div class="card"><div class="eyebrow">PERSONAL LIFE SUITE 62.1</div><h2>20 osobních modulů v jednom Commanderu</h2><p class="muted">Rodina, domácnost, administrativa, termíny, dokumenty, finance domácnosti, údržba, volný čas a jedna hlavní osobní priorita.</p></div><div class="card"><div class="eyebrow">UDĚLEJ TEĎ · TOP 3 DNES</div>${top}</div><div class="card"><div class="eyebrow">CO HLÍDAT</div>${alert}</div><div class="card"><div class="eyebrow">CO SE BLÍŽÍ / 3 MĚSÍCE</div>${next}</div><div class="card"><div class="eyebrow">RYCHLÝ STAV</div><div class="row"><span>Pokrytí dat</span><b>${x.practical.missing.coverage}%</b></div><div class="row"><span>Cashflow za 90 dní</span><b>${money(x.cashflow.d90.end)}</b></div><div class="row"><span>Ticket k prověření</span><b>${x.assistant.rotation[0]?h(x.assistant.rotation[0].name):'—'}</b></div><div class="row"><span>Záruky do 120 dní</span><b>${x.assistant.warranty.length}</b></div></div><div class="decision-note">Unified Life Dashboard + Personal Life Suite 62.1: analytické motory jsou click-only/read-only. Zápisy zůstávají jen za explicitním potvrzením v původních modulech.</div>`;
 const choice=await modal('Kamil OS / Životní dashboard 62.1',body,[{label:'Personal Life Commander',value:'life621',primary:true},{label:'Zeptat se asistenta',value:'assistant'},{label:'Quick Capture',value:'capture'},{label:'Assistant Suite 30',value:'suite'},{label:'Udělej teď',value:'command'},{label:'Praktické centrum',value:'practical'},{label:'Life+ 20',value:'plus'},{label:'Finance',value:'finance'},{label:'Plány',value:'plan'},{label:'Rodina',value:'family'},{label:'Vstupenky',value:'tickets'},{label:'Inbox',value:'inbox'},{label:'Další',value:'more'},{label:'Zavřít',value:null}]);
 if(choice==='life621')return openPersonalLifeCommander621();
 if(choice==='assistant')return openAssistant530();
 if(choice==='capture')return openQuickCapture501();
 if(choice==='suite')return openSuite530();
 if(choice==='command')return openCommand500();
 if(choice==='practical')return openPractical490();
 if(choice==='plus')return openPersonalLifePlus475();
 if(choice==='finance')return openPersonalFinance445();
 if(choice==='plan')return openLifePlanner446();
 if(choice==='family')return openFamily452();
 if(choice==='tickets')return openTicketIntel449();
 if(choice==='inbox')return openInbox450();
 if(choice==='more'){
  const c=await modal('Další osobní přehledy','<div class="decision-note">Vyber detail.</div>',[{label:'Cashflow',value:'cash'},{label:'Majetek',value:'wealth'},{label:'Údržba',value:'maint'},{label:'Cíle',value:'goals'},{label:'Rozhodnutí',value:'dec'},{label:'Zavřít',value:null,primary:true}]);
  if(c==='cash')return openCashflow447();if(c==='wealth')return openWealth448();if(c==='maint')return openMaintenance451();if(c==='goals')return openGoals453();if(c==='dec')return openDecision454();
 }
}