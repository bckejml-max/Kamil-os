import {store} from './state.js';
import {h,money,modal} from './utils.js';

const A=v=>Array.isArray(v)?v:[];
const N=v=>Number(v||0);
const U=v=>String(v||'').toUpperCase();
const CLOSED=new Set(['DONE','CLOSED','ARCHIVED','RESOLVED','PAID','SOLD','PAYOUT RECEIVED']);
const open=x=>!CLOSED.has(U(x?.status||x?.workflow));
const ms=v=>{const t=Date.parse(v||'');return Number.isFinite(t)?t:null};
const days=v=>{const t=ms(v);return t===null?null:Math.ceil((t-Date.now())/86400000)};
const hoursOld=v=>{const t=ms(v);return t===null?null:Math.max(0,Math.round((Date.now()-t)/3600000))};
const measure=(name,fn)=>{const t=performance.now();const value=fn();const elapsed=Math.round((performance.now()-t)*10)/10;window.__KAMIL_SAFE_INTEL_LAST__={name,ms:elapsed,at:Date.now()};return {value,ms:elapsed}};

function taskRows(s){return A(s.tasks).filter(open).map(x=>({kind:'Úkol',title:x.title||x.name||'Úkol',due:x.due||x.dueAt||x.date||null,days:days(x.due||x.dueAt||x.date),priority:N(x.priority),id:x.id||null}));}
function waitingRows(s){return [...A(s.directorBook?.waiting),...A(s.delegations)].filter(open).map(x=>({kind:'Čekám',title:x.title||x.person||x.name||'Waiting for',due:x.due||x.nextFollowUpAt||null,days:days(x.due||x.nextFollowUpAt),priority:N(x.priority||60),id:x.id||null}));}
function ticketRows(s){return A(s.ticketBook?.items).filter(x=>['HOLD','LISTED'].includes(U(x.workflow||'HOLD'))).map(x=>{const qty=Math.max(1,N(x.qty||1)),buy=N(x.buy||x.cost||0),list=N(x.listPrice||0),market=N(x.marketPrice||0),checked=x.marketCheckedAt||x.marketAsOf||null,sellBy=x.sellBy||x.sellByAt||x.date||null,eventDate=x.date||null,marketAge=hoursOld(checked),gross=list*qty,cost=buy>0?buy:N(x.buy1||0)*qty,profit=gross-cost;let action='DRŽET';if(!list)action='NACENIT';else if(market&&marketAge!==null&&marketAge<=36&&list>market*1.12)action='PROVĚŘIT CENU';else if(days(sellBy)!==null&&days(sellBy)<=7)action='PRODAT BRZY';return{kind:'Vstupenka',title:x.event||x.name||x.title||'Vstupenka',due:eventDate,days:days(eventDate),sellBy,sellDays:days(sellBy),buy:cost,qty,list,market,marketAge,profit,action,workflow:U(x.workflow||'HOLD')}});}
function positionRows(s){const direct=A(s.xtbReport?.positions);const hub=A(s.xtbHub?.positions);return (direct.length?direct:hub).map(x=>{const ticker=x.ticker||x.symbol||x.name||'Pozice',value=N(x.valueCzk||x.marketValueCzk||x.value||0),pnl=N(x.profitCzk||x.pnlCzk||x.profit||0),pct=N(x.profitPct||x.pnlPct||x.returnPct||0),action=U(x.action||x.recommendation||'');return{ticker,value,pnl,pct,action}}).sort((a,b)=>Math.abs(b.value)-Math.abs(a.value));}
function xtbMeta(s){const positions=positionRows(s),count=N(s.xtbHub?.positionCount||s.xtbReport?.positionCount||positions.length),value=N(s.xtbReport?.czkValue||s.xtbHub?.valueCzk||positions.reduce((a,x)=>a+x.value,0)),asOf=s.xtbReport?.asOf||s.xtbHub?.asOf||null,ageHours=hoursOld(asOf),stale=ageHours===null||ageHours>36;return {count,value,asOf,ageHours,stale,positions:positions.slice(0,6)};}
function monthlyDuties(){const now=new Date(),day=now.getDate(),last=new Date(now.getFullYear(),now.getMonth()+1,0).getDate();return [
 {title:'Koncepty faktur vydaných',dueDay:1},
 {title:'Aktualizace karty zakázky',dueDay:20},
 {title:'Fakturace na dodavatele',dueDay:25},
 {title:'Cesták + docházka',dueDay:last}
].map(x=>({...x,delta:x.dueDay-day,status:day>x.dueDay?'po termínu':day===x.dueDay?'dnes':x.dueDay-day<=3?'brzy':'čeká'}));}

export function financeTickets438(s=store.get()){
 const xtb=xtbMeta(s),tickets=ticketRows(s),capital=tickets.reduce((a,x)=>a+x.buy,0),priced=tickets.filter(x=>x.list>0),urgent=tickets.filter(x=>x.sellDays!==null&&x.sellDays<=7).sort((a,b)=>(a.sellDays??999)-(b.sellDays??999)),review=tickets.filter(x=>['NACENIT','PROVĚŘIT CENU','PRODAT BRZY'].includes(x.action)).sort((a,b)=>(a.sellDays??999)-(b.sellDays??999));
 return {xtb,tickets:{active:tickets.length,capital,priced:priced.length,urgent:urgent.slice(0,5),review:review.slice(0,6),potentialProfit:tickets.reduce((a,x)=>a+x.profit,0)}};
}
export function work438(s=store.get()){
 const tasks=taskRows(s),waiting=waitingRows(s),overdue=tasks.filter(x=>x.days!==null&&x.days<0).sort((a,b)=>(a.days??0)-(b.days??0)),today=tasks.filter(x=>x.days===0),follow=waiting.filter(x=>x.days!==null&&x.days<=1).sort((a,b)=>(a.days??999)-(b.days??999)),projects=A(s.projects),changes=A(s.changeOrders||s.zl),duties=monthlyDuties();
 return {tasks:tasks.length,overdue:overdue.slice(0,5),today:today.slice(0,5),waiting:waiting.length,follow:follow.slice(0,5),projects:projects.length,changes:changes.length,duties};
}
function why(x){
 if(x.kind==='XTB')return 'Investiční rozhodnutí bez čerstvých dat je zbytečné riziko.';
 if(x.kind==='Vstupenka'){if(x.action==='PRODAT BRZY')return 'Blíží se sell-by termín; čas snižuje prostor pro bezpečný prodej.';if(x.action==='PROVĚŘIT CENU')return 'Tvoje nabídka je proti čerstvému trhu vysoko a může zbytečně stát.';return 'Chybí cena, takže kapitál nemá aktivní prodejní plán.';}
 if(x.kind==='Ředitel')return x.days<0?'Pravidelný ředitelský termín už je po splatnosti.':'Pravidelný ředitelský termín je právě teď.';
 if(x.kind==='Čekám')return 'Je čas na follow-up; další čekání může blokovat rozhodnutí nebo zakázku.';
 if(x.kind==='Úkol')return x.days<0?'Úkol je po termínu a dál vytváří otevřený závazek.':'Úkol patří na dnešek.';
 return 'Má vyšší kombinaci urgence a dopadu než ostatní otevřené položky.';
}
function nextStep(x){
 if(x.kind==='XTB')return 'Obnovit XTB import a teprve potom rozhodovat BUY / HOLD / SELL.';
 if(x.kind==='Vstupenka')return x.action==='NACENIT'?'Doplnit aktuální market a nastavit prodejní cenu.':x.action==='PROVĚŘIT CENU'?'Porovnat aktuální market a navrhnout novou cenu.':'Prověřit cenu a prodejní deadline.';
 if(x.kind==='Čekám')return 'Poslat stručný follow-up nebo si potvrdit další termín.';
 if(x.kind==='Ředitel')return 'Uzavřít povinnost nebo potvrdit, že už je hotová.';
 return 'Otevřít úkol a udělat první konkrétní krok.';
}
function navFor(x){if(x.kind==='XTB')return 'money';if(x.kind==='Vstupenka')return 'tickets';return 'today';}
function enrich(x){return {...x,why:why(x),nextStep:nextStep(x),nav:navFor(x)};}
export function mission438(s=store.get()){
 const finance=financeTickets438(s),work=work438(s),candidates=[
  ...work.overdue.map(x=>({...x,score:110+Math.min(20,Math.abs(x.days||0))})),
  ...work.today.map(x=>({...x,score:108})),
  ...work.follow.map(x=>({...x,score:100})),
  ...work.duties.filter(x=>['po termínu','dnes','brzy'].includes(x.status)).map(x=>({kind:'Ředitel',title:x.title,days:x.delta,score:x.status==='po termínu'?105:x.status==='dnes'?103:92})),
  ...finance.tickets.review.map(x=>({...x,score:x.action==='PRODAT BRZY'?98:x.action==='PROVĚŘIT CENU'?90:86}))
 ];
 if(finance.xtb.stale)candidates.push({kind:'XTB',title:'Obnovit XTB data před rozhodnutím',days:null,score:96});
 const seen=new Set(),ranked=candidates.sort((a,b)=>b.score-a.score).filter(x=>{const k=`${x.kind}|${x.title}`;if(seen.has(k))return false;seen.add(k);return true}).map(enrich),top=ranked.slice(0,3),later=ranked.slice(3,6);
 return {top,later,finance,work,status:top.some(x=>x.score>=105)?'ZÁSAH':top.length?'ŘÍDIT':'KLID'};
}

const dueText=x=>x.days===null||x.days===undefined?'':` · ${x.days<0?`${Math.abs(x.days)} d po termínu`:x.days===0?'dnes':`za ${x.days} d`}`;
const row=x=>`<div class="row"><div><b>${h(x.title)}</b><div class="muted">${h(x.kind||'')}${dueText(x)}</div></div>${x.action?`<b>${h(x.action)}</b>`:''}</div>`;
const missionRow=(x,i)=>`<div class="card"><div class="eyebrow">#${i+1} · ${h(x.kind||'PRIORITA')}</div><h3>${h(x.title)}</h3><p class="muted"><b>Proč teď:</b> ${h(x.why)}</p><p class="muted"><b>První krok:</b> ${h(x.nextStep)}</p>${x.action?`<div class="decision-note"><b>${h(x.action)}</b></div>`:''}</div>`;
const laterRow=x=>`<div class="row"><div><b>${h(x.title)}</b><div class="muted">${h(x.kind||'')}${dueText(x)} · může počkat</div></div></div>`;
const xtbRow=x=>`<div class="row"><div><b>${h(x.ticker)}</b><div class="muted">${money(x.value)} · P/L ${money(x.pnl)}${x.pct?` · ${x.pct.toFixed(1)} %`:''}</div></div>${x.action?`<b>${h(x.action)}</b>`:''}</div>`;
const ticketRow=x=>`<div class="row"><div><b>${h(x.title)}</b><div class="muted">${x.qty} ks · náklad ${money(x.buy)}${x.list?` · list ${money(x.list)}`:''}${x.market?` · market ${money(x.market)}`:''}${x.marketAge!==null?` · data ${x.marketAge} h`:''}</div></div><b>${h(x.action)}</b></div>`;

async function showFinance(){const {value:x,ms}=measure('financeTickets438',()=>financeTickets438());const stale=x.xtb.stale?'<div class="decision-note warn">XTB data jsou starší než 36 h nebo chybí. Před BUY/SELL rozhodnutím nejdřív obnov import.</div>':'';const body=`<div class="metric-strip"><div class="metric"><span>XTB pozic</span><b>${x.xtb.count}</b></div><div class="metric"><span>XTB hodnota</span><b>${money(x.xtb.value)}</b></div><div class="metric"><span>Aktivní vstupenky</span><b>${x.tickets.active}</b></div><div class="metric"><span>Kapitál ve vstupenkách</span><b>${money(x.tickets.capital)}</b></div></div>${stale}<div class="card"><div class="eyebrow">XTB / NEJVĚTŠÍ POZICE</div>${x.xtb.positions.map(xtbRow).join('')||'<div class="empty">V importu nejsou detailní pozice.</div>'}</div><div class="card"><div class="eyebrow">VSTUPENKY / CO PROVĚŘIT</div>${x.tickets.review.map(ticketRow).join('')||'<div class="empty">Nic urgentního k přecenění.</div>'}</div><div class="decision-note">Výpočet ${ms} ms. Vše je pouze doporučení; žádný obchod ani repricing se nespouští automaticky.</div>`;const choice=await modal('Peníze + vstupenky / Safe 43.9',body,[{label:'Otevřít Peníze',value:'money'},{label:'Otevřít Vstupenky',value:'tickets'},{label:'Zavřít',value:null,primary:true}]);if(choice)window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:choice}));}
async function showWork(){const {value:x,ms}=measure('work438',()=>work438());const body=`<div class="metric-strip"><div class="metric"><span>Otevřené úkoly</span><b>${x.tasks}</b></div><div class="metric"><span>Waiting For</span><b>${x.waiting}</b></div><div class="metric"><span>Zakázky</span><b>${x.projects}</b></div><div class="metric"><span>ZL</span><b>${x.changes}</b></div></div><div class="card"><div class="eyebrow">TERMÍNY ŘEDITELE</div>${x.duties.map(d=>`<div class="row"><span>${h(d.title)} · ${d.dueDay}. den</span><b class="${d.status==='po termínu'?'bad':d.status==='dnes'||d.status==='brzy'?'warn':''}">${h(d.status)}</b></div>`).join('')}</div><div class="card"><div class="eyebrow">PO TERMÍNU / DNES</div>${[...x.overdue,...x.today].map(row).join('')||'<div class="empty">Bez kritických termínů.</div>'}</div><div class="card"><div class="eyebrow">WAITING FOR K FOLLOW-UP</div>${x.follow.map(row).join('')||'<div class="empty">Nikdo nečeká na akutní follow-up.</div>'}</div><div class="decision-note">Výpočet ${ms} ms. Žádný background refresh neběží.</div>`;await modal('Work Command Center / Safe 43.9',body,[{label:'Zavřít',value:null,primary:true}]);}
async function showMission(){const {value:x,ms}=measure('mission438',()=>mission438());const body=`<div class="metric-strip"><div class="metric"><span>Režim</span><b>${h(x.status)}</b></div><div class="metric"><span>XTB data</span><b>${x.finance.xtb.stale?'OBNOVIT':'OK'}</b></div><div class="metric"><span>Vstupenky k revizi</span><b>${x.finance.tickets.review.length}</b></div><div class="metric"><span>Waiting For</span><b>${x.work.waiting}</b></div></div><div class="eyebrow">TOP 3 TEĎ</div>${x.top.map(missionRow).join('')||'<div class="empty">Nic kritického.</div>'}<div class="card"><div class="eyebrow">CO MŮŽE POČKAT</div>${x.later.map(laterRow).join('')||'<div class="empty">Další priority teď nejsou.</div>'}</div><div class="decision-note">Mission Control se spočítal za ${ms} ms pouze po kliknutí. Bezpečnost: nic se samo neobchoduje, nepřecenňuje, neposílá ani nemaže.</div>`;const actions=x.top.map((p,i)=>({label:`Otevřít #${i+1}`,value:`p${i}`}));actions.push({label:'Zavřít',value:null,primary:true});const choice=await modal('Mission Control / Safe 43.9',body,actions);if(choice?.startsWith('p')){const p=x.top[Number(choice.slice(1))];if(p?.nav)window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:p.nav}));}}

export function openSafeIntelligence438(mode){if(mode==='finance')return showFinance();if(mode==='work')return showWork();return showMission();}
