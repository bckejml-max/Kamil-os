import {capitalAllocation} from './capitalAllocation25.js';
import {xtbTradePlanner} from './xtbPlanner24.js';
import {ticketSellCockpit} from './ticketCockpit24.js';

const n=v=>Number(v||0);
const push=(steps,step)=>steps.push({id:`step-${steps.length+1}`,priority:steps.length+1,...step});

export function capitalActionPlan(s,now=new Date()){
 const allocation=capitalAllocation(s,now),planner=xtbTradePlanner(s),tickets=ticketSellCockpit(s),steps=[];
 const xtbAmount=n(allocation.rows.find(x=>x.key==='xtb')?.amount),ticketAmount=n(allocation.rows.find(x=>x.key==='tickets')?.amount);

 if(allocation.unfundedPlan>0||allocation.status==='PROTECT'){
  push(steps,{domain:'cash',state:'DO_NOW',title:'Neinvestovat další kapitál',amount:0,source:'CASHFLOW 90',reason:allocation.unfundedPlan>0?`Plánované investice převyšují bezpečný prostor o ${Math.round(allocation.unfundedPlan)} Kč.`:'90denní cashflow neponechává dost bezpečného prostoru nad rezervou.',navigate:'money'});
 }
 if(tickets.urgent>0){
  push(steps,{domain:'tickets',state:'DO_NOW',title:`Vyřešit ${tickets.urgent} urgentní ticket pozice`,amount:n(tickets.capitalAtRisk),source:'TICKET COCKPIT',reason:'Nový ticket kapitál je zablokovaný, dokud existuje urgentní neprodaná zásoba.',navigate:'tickets'});
 }
 if(planner.plans?.length){
  const first=planner.plans[0];
  push(steps,{domain:'xtb',state:'REVIEW',title:`Prověřit XTB krok: ${first.name||first.ticker||'portfolio'}`,amount:n(first.amount),qty:n(first.qty)||null,source:first.source||'XTB PLANNER',reason:first.reason||first.method||'Trade Planner má konkrétní návrh k ručnímu prověření.',navigate:'money'});
 }
 if(ticketAmount>0&&allocation.ticket){
  push(steps,{domain:'tickets',state:'REVIEW',title:`Prověřit nákup: ${allocation.ticket.name}`,amount:ticketAmount,qty:allocation.ticket.qty||null,source:'ŽIVĚ',reason:`Rozpočet je pouze limit podle čerstvého BUY signálu; nákup musí být ručně potvrzen.`,navigate:'tickets'});
 }
 if(xtbAmount>0){
  push(steps,{domain:'xtb',state:'REVIEW',title:'Připravit nový XTB vklad podle auditu',amount:xtbAmount,source:'XTB IMPORT',reason:allocation.audit.nextContribution||'Portfolio audit doporučuje použít nový kapitál na rebalancing.',navigate:'money'});
 }
 if(allocation.cashHold>0){
  push(steps,{domain:'cash',state:'WAIT',title:'Zbytek kapitálu ponechat volný',amount:n(allocation.cashHold),source:'PRAVIDLO',reason:'Pro tuto část není dostatečně silný a čerstvý důvod k nasazení.',navigate:'money'});
 }
 if(!steps.length){
  push(steps,{domain:'cash',state:'WAIT',title:'Dnes není nutný finanční krok',amount:0,source:'PRAVIDLO',reason:'Žádná ochranná ani investiční podmínka nevyžaduje akci. Nevyráběj obchod jen proto, aby se něco dělo.',navigate:'money'});
 }
 const doNow=steps.filter(x=>x.state==='DO_NOW').length,review=steps.filter(x=>x.state==='REVIEW').length,wait=steps.filter(x=>x.state==='WAIT').length;
 return {steps,top:steps[0],doNow,review,wait,allocationStatus:allocation.status,note:'Action Plan pouze řadí bezpečné další kroky. Neprovádí převody, XTB obchody ani nákup/prodej vstupenek.'};
}
