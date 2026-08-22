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

export function lifeDashboard455(s=store.get()){
 const finance=personalFinance445(s),plan=lifePlanner446(s),cashflow=cashflow447(s),wealth=wealth448(s),tickets=ticketIntel449(s),inbox=inbox450(s),maintenance=maintenance451(s),family=family452(s),goals=goals453(s),decision=decision454(s),plus=personalLifePlus475(s);
 const alerts=[];
 if(finance.reserveGap>0)alerts.push(`Rezerva: chybí ${money(finance.reserveGap)}`);
 if(finance.portfolio.stale)alerts.push('XTB data jsou stará');
 if(maintenance.overdue.length)alerts.push(`Údržba: ${maintenance.overdue.length} po termínu`);
 if(inbox.needsFollow.length)alerts.push(`Follow-up: ${inbox.needsFollow.length}`);
 if(cashflow.d90.end<finance.reserve)alerts.push('90denní cashflow klesá pod rezervu');
 if(plus.health.score<65)alerts.push(`Life Health: ${plus.health.score}/100`);
 return{finance,plan,cashflow,wealth,tickets,inbox,maintenance,family,goals,decision,plus,alerts};
}

export async function openLifeDashboard455(){
 const t=performance.now(),x=lifeDashboard455();window.__KAMIL_LIFE_455_LAST__={ms:Math.round((performance.now()-t)*10)/10,at:Date.now()};
 const top=x.decision.doNow.map((v,i)=>`<div class="row"><div><b>${i+1}. ${h(v.title)}</b><div class="muted">${h(v.reason)} · skóre ${v.score}</div></div>${v.money?`<b>${money(v.money)}</b>`:''}</div>`).join('')||'<div class="empty">Dnes nic zásadního nehoří.</div>';
 const alert=x.alerts.length?x.alerts.map(a=>`<div class="row"><span>${h(a)}</span><b>HLÍDAT</b></div>`).join(''):'<div class="empty success-empty">Bez zásadní osobní výstrahy podle uložených dat.</div>';
 const next=x.plan.d90.slice(0,5).map(v=>`<div class="row"><div><b>${h(v.title)}</b><div class="muted">${h(v.kind)} · ${v.days===null?'bez termínu':`za ${v.days} d`}</div></div>${v.amount?`<b>${money(v.amount)}</b>`:''}</div>`).join('')||'<div class="empty">Na 3 měsíce nic velkého.</div>';
 const body=`<div class="metric-strip"><div class="metric"><span>Life Health</span><b>${x.plus.health.score}/100</b></div><div class="metric"><span>Čistý majetek</span><b>${money(x.wealth.net)}</b></div><div class="metric"><span>Bezpečně investovat</span><b>${money(x.finance.safeInvestNow)}</b></div><div class="metric"><span>Opportunity budget</span><b>${money(x.plus.opportunity.free)}</b></div></div><div class="card"><div class="eyebrow">TOP 3 DNES</div>${top}</div><div class="card"><div class="eyebrow">JEDNA VÝSTRAHA / CO HLÍDAT</div>${alert}</div><div class="card"><div class="eyebrow">CO SE BLÍŽÍ / 3 MĚSÍCE</div>${next}</div><div class="card"><div class="eyebrow">RYCHLÝ STAV</div><div class="row"><span>Cashflow za 90 dní</span><b>${money(x.cashflow.d90.end)}</b></div><div class="row"><span>Cíle / chybí financovat</span><b>${money(x.goals.totalGap)}</b></div><div class="row"><span>Ticket P/L</span><b>${money(x.tickets.totalProfit)}</b></div><div class="row"><span>Runway rezervy</span><b>${x.plus.runway.months} měs.</b></div></div><div class="decision-note">Unified Life Dashboard 47.5 načte osobní motory až po kliknutí. Žádný background autopilot, automatické obchodování, platby, přecenění ani odesílání.</div>`;
 const choice=await modal('Kamil OS / Životní dashboard 47.5',body,[{label:'Life+ 20',value:'plus'},{label:'Finance',value:'finance'},{label:'Plány',value:'plan'},{label:'Rodina',value:'family'},{label:'Vstupenky',value:'tickets'},{label:'Inbox',value:'inbox'},{label:'Další',value:'more'},{label:'Zavřít',value:null,primary:true}]);
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
