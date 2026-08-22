import {store} from './state.js';
import {h,money,modal} from './utils.js';

const A=v=>Array.isArray(v)?v:[];
const N=v=>Number(v||0);
const U=v=>String(v||'').toUpperCase();
const CLOSED=new Set(['DONE','CLOSED','ARCHIVED','RESOLVED','PAID','CANCELLED','CANCELED']);
const open=x=>!CLOSED.has(U(x?.status||x?.workflow));
const WORK_RE=/zak[aá]zk|faktur|dodavat|cest[aá]k|doch[aá]zk|ředitel|reditel|pks|cpi|zbrojov|\bzl\b|projektov[aá] karta|pracovn/i;
const personal=x=>!WORK_RE.test(`${x?.title||''} ${x?.name||''} ${x?.area||''} ${x?.category||''} ${x?.project||''}`);
const ms=v=>{const t=Date.parse(v||'');return Number.isFinite(t)?t:null};
const days=v=>{const t=ms(v);if(t===null)return null;const a=new Date();a.setHours(0,0,0,0);const b=new Date(t);b.setHours(0,0,0,0);return Math.round((b-a)/86400000)};
const first=(...v)=>v.find(x=>x!==undefined&&x!==null&&x!=='')??null;
const measure=fn=>{const t=performance.now(),value=fn(),elapsed=Math.round((performance.now()-t)*10)/10;window.__KAMIL_FINANCE_445_LAST__={ms:elapsed,at:Date.now()};return{value,ms:elapsed}};

function billRows(s){return [...A(s.householdBills?.items),...A(s.recurringPayments),...A(s.bills),...A(s.subscriptions)].filter(open).filter(personal).map(x=>({title:first(x.title,x.name,x.type,'Výdaj'),amount:N(first(x.amount,x.price,x.monthly,x.cost)),due:first(x.due,x.nextPaymentAt,x.date),days:days(first(x.due,x.nextPaymentAt,x.date))}));}
function purchaseRows(s){return [...A(s.plannedPurchases),...A(s.purchasePlan?.items),...A(s.wishlist),...A(s.goals?.purchases)].filter(open).filter(personal).map(x=>({title:first(x.title,x.name,x.item,'Plánovaný nákup'),amount:N(first(x.amount,x.price,x.cost,x.budget)),due:first(x.due,x.targetDate,x.date),days:days(first(x.due,x.targetDate,x.date))})).filter(x=>x.amount>0);}
function xtb(s){const value=N(first(s.xtbReport?.czkValue,s.xtbHub?.valueCzk)),profit=N(s.xtbReport?.czkProfit),asOf=first(s.xtbReport?.asOf,s.xtbHub?.asOf),age=asOf&&ms(asOf)!==null?Math.round((Date.now()-ms(asOf))/3600000):null;return{value,profit,asOf,age,stale:age===null||age>36,positions:N(first(s.xtbReport?.positionCount,s.xtbHub?.positionCount))};}

export function personalFinance445(s=store.get()){
 const f=s.financePlan||{},cash=N(first(f.cashNow,s.cashNow,s.personalCash?.czk)),reserve=N(f.reserveFloor),plannedInvestment=N(f.plannedInvestment),expectedIncome=N(f.expectedIncome),bills=billRows(s),purchases=purchaseRows(s),portfolio=xtb(s);
 const monthlyCosts=bills.reduce((a,x)=>a+x.amount,0),upcomingPurchases=purchases.filter(x=>x.days===null||x.days<=30).reduce((a,x)=>a+x.amount,0);
 const freeBeforePlans=Math.max(0,cash-reserve-monthlyCosts-upcomingPurchases),safeInvestNow=Math.max(0,freeBeforePlans),safeSpendNow=Math.max(0,freeBeforePlans-plannedInvestment);
 const reserveGap=Math.max(0,reserve-cash),afterPlanned=cash-monthlyCosts-upcomingPurchases-plannedInvestment;
 const score=Math.max(0,100-(reserveGap?45:0)-(afterPlanned<reserve?25:0)-(portfolio.stale?10:0)-(upcomingPurchases>freeBeforePlans&&upcomingPurchases>0?10:0));
 const recommendation=reserveGap>0?'DOPLNIT REZERVU':safeInvestNow<=0?'TEĎ NEINVESTOVAT':plannedInvestment>safeInvestNow?'SNÍŽIT PLÁNOVANOU INVESTICI':'PLÁN JE KRYTÝ';
 return{cash,reserve,reserveGap,plannedInvestment,expectedIncome,bills,purchases,monthlyCosts,upcomingPurchases,safeInvestNow,safeSpendNow,afterPlanned,portfolio,score,recommendation};
}

const row=(title,value,detail='')=>`<div class="row"><div><b>${h(title)}</b>${detail?`<div class="muted">${h(detail)}</div>`:''}</div><b>${h(value)}</b></div>`;
export async function openPersonalFinance445(){
 const {value:x,ms}=measure(()=>personalFinance445());
 const body=`<div class="metric-strip"><div class="metric"><span>Finanční skóre</span><b>${x.score}/100</b></div><div class="metric"><span>Hotovost</span><b>${money(x.cash)}</b></div><div class="metric"><span>Bezpečně investovat teď</span><b>${money(x.safeInvestNow)}</b></div><div class="metric"><span>Volně utratit teď</span><b>${money(x.safeSpendNow)}</b></div></div><div class="card"><div class="eyebrow">CO TEĎ S PENĚZI</div>${row(x.recommendation,x.plannedInvestment?`plán ${money(x.plannedInvestment)}`:'bez nastavené investice',x.reserveGap?`Do rezervního minima chybí ${money(x.reserveGap)}.`:`Počítáno bez budoucího příjmu; očekávaný příjem ${money(x.expectedIncome)} je jen informace.`)}${row('Rezervní minimum',money(x.reserve))}${row('Domácí / pravidelné náklady',money(x.monthlyCosts))}${row('Plánované nákupy do 30 dní',money(x.upcomingPurchases))}${row('Po plánované investici',money(x.afterPlanned),x.afterPlanned>=x.reserve?'rezerva zůstává krytá':'klesne pod rezervní minimum')}</div><div class="card"><div class="eyebrow">XTB</div>${row('Hodnota portfolia',money(x.portfolio.value),`${x.portfolio.positions} pozic`)}${row('P/L',money(x.portfolio.profit))}${row('Stav dat',x.portfolio.stale?'OBNOVIT DATA':'OK',x.portfolio.age===null?'datum importu chybí':`import před ${x.portfolio.age} h`)}</div><div class="card"><div class="eyebrow">VĚTŠÍ PLÁNOVANÉ NÁKUPY</div>${x.purchases.slice(0,6).map(v=>row(v.title,money(v.amount),v.days===null?'bez termínu':v.days<0?`${Math.abs(v.days)} d po termínu`:v.days===0?'dnes':`za ${v.days} d`)).join('')||'<div class="empty">Žádný větší plánovaný nákup v uložených datech.</div>'}</div><div class="decision-note">Personal Finance Center 44.5 · ${ms} ms pouze po kliknutí. Bezpečný limit je konzervativní: hotovost − rezervní minimum − evidované pravidelné náklady − plánované nákupy. Budoucí příjem se do limitu nezapočítává. Žádné automatické obchody ani platby.</div>`;
 const choice=await modal('Moje finance / 44.5',body,[{label:'Peníze detail',value:'money'},{label:'Můj dnešek',value:'today'},{label:'Rodina & domov',value:'home'},{label:'Zavřít',value:null,primary:true}]);
 if(choice)window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:choice}));
}
