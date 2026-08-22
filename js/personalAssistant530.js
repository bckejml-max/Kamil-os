import {store} from './state.js';
import {h,money,modal,uid} from './utils.js';
import {personalFinance445} from './personalFinance445.js';
import {practical490} from './personalPractical490.js';
import {command500} from './personalCommand500.js';

const A=v=>Array.isArray(v)?v:[],N=v=>Number(v||0),U=v=>String(v||'').toUpperCase(),T=v=>String(v||'').trim();
const CLOSED=new Set(['DONE','CLOSED','ARCHIVED','RESOLVED','PAID','SOLD','CANCELLED','CANCELED']);
const WORK_RE=/zak[aá]zk|faktur|dodavat|cest[aá]k|doch[aá]zk|ředitel|reditel|pks|cpi|zbrojov|\bzl\b|projektov[aá] karta|pracovn/i;
const open=x=>!CLOSED.has(U(x?.status||x?.workflow));
const personal=x=>!WORK_RE.test(`${x?.title||''} ${x?.name||''} ${x?.area||''} ${x?.category||''} ${x?.project||''}`);
const first=(...v)=>v.find(x=>x!==undefined&&x!==null&&x!=='')??null;
const ts=v=>{const t=Date.parse(v||'');return Number.isFinite(t)?t:null};
const daysTo=v=>{const t=ts(v);return t===null?null:Math.ceil((t-Date.now())/86400000)};
const monthKey=v=>{const d=new Date(v||Date.now());return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`};
const personalTasks=s=>A(s.tasks).filter(open).filter(personal);
const spending=s=>A(s.personalSpending?.transactions).filter(personal);
const tickets=s=>A(s.ticketBook?.items).filter(x=>['HOLD','LISTED'].includes(U(x.workflow||'HOLD')));
const portfolio=s=>A(s.xtbReport?.positions);

export function capture501(text=''){
 const raw=T(text),lower=raw.toLowerCase();let kind='task';
 if(/\b(kč|czk|eur|usd|zaplat|koupil|výdaj|vydaj)\b/.test(lower))kind='expense';
 else if(/čekám|cekam|waiting|odpověď|odpoved/.test(lower))kind='waiting';
 else if(/poznám|poznam|note/.test(lower))kind='note';
 else if(/nakoup|koupit|shopping/.test(lower))kind='shopping';
 else if(/termín|termin|schůz|schuz|návštěv|navstev/.test(lower))kind='calendar';
 return{raw,kind,category:categorize502(raw)};
}

export function categorize502(text=''){
 const x=T(text).toLowerCase();
 if(/xtb|akci|etf|invest/.test(x))return'Finance';
 if(/ticket|vstupenk|koncert|fotbal|sparta/.test(x))return'Vstupenky';
 if(/auto|stk|pneu|servis/.test(x))return'Auto';
 if(/dům|dum|domov|energie|topen|rekup|klima/.test(x))return'Domov';
 if(/rodin|mia|manžel|manzel|oslava/.test(x))return'Rodina';
 if(/pojist|doklad|smlouv|úřad|urad/.test(x))return'Administrativa';
 return'Osobní';
}

export function complete503(s=store.get()){return personalTasks(s).slice(0,8).map(x=>({id:x.id,title:first(x.title,x.name,'Úkol'),status:x.status||'OPEN'}))}
export function snooze504(s=store.get()){return personalTasks(s).filter(x=>daysTo(first(x.due,x.dueAt,x.date))!==null).sort((a,b)=>(daysTo(first(a.due,a.dueAt,a.date))??999)-(daysTo(first(b.due,b.dueAt,b.date))??999)).slice(0,8)}
export function search505(s=store.get(),q=''){
 const needle=T(q).toLowerCase();if(!needle)return[];const rows=[];
 const add=(kind,arr)=>A(arr).filter(personal).forEach(x=>{const title=first(x.title,x.name,x.symbol,x.ticker,'Položka');if(`${title} ${x.category||''} ${x.note||''}`.toLowerCase().includes(needle))rows.push({kind,title,id:x.id||null})});
 add('Úkol',s.tasks);add('Doklad',s.personalAdmin?.items);add('Cíl',s.personalGoals?.items);add('Výdaj',s.personalSpending?.transactions);add('Vstupenka',s.ticketBook?.items);add('Inbox',s.personalInbox?.items);return rows.slice(0,30);
}

export function dailyBrief506(s=store.get()){const c=command500(s),p=practical490(s);return{main:c.next.main,next:c.next.next.slice(0,2),cash30:c.cash.commitments,calendar:c.calendar.count,missing:p.missing.missing.length}}
export function eveningClose507(s=store.get()){const tasks=personalTasks(s),today=tasks.filter(x=>(daysTo(first(x.due,x.dueAt,x.date))??99)<=0);return{openToday:today.length,carry:today.slice(0,5),done:A(s.audit).filter(x=>/hotovo|done|complete/i.test(x.label||'')).slice(0,5)}}
export function weeklyReset508(s=store.get()){const c=command500(s),p=practical490(s);return{focus:c.week.focus,ignore:c.week.ignore,commitments:p.commitments.total,missing:p.missing.missing.slice(0,3)}}
export function monthlyReset509(s=store.get()){const p=practical490(s),f=personalFinance445(s);return{savingsRate:p.savings.rate,investPlan:N(s.financePlan?.plannedInvestment),safeSpend:f.safeSpendNow||0,subs:p.subscriptions.potentialMonthly,netWorthDelta:p.netWorth.delta}}
export function yearProgress510(s=store.get()){const hist=A(s.netWorthBook?.history),now=N(first(s.netWorthBook?.netWorth,s.wealth?.netWorth,s.netWorth)),jan=hist.find(x=>String(x.date||x.at||'').startsWith(String(new Date().getFullYear())))||hist[0],start=N(first(jan?.netWorth,jan?.value,0));return{start,now,delta:now-start,percent:start?Math.round((now-start)/start*1000)/10:0}}

export function expenseInbox511(s=store.get()){return spending(s).filter(x=>!x.category||U(x.status)==='INBOX').slice(0,20)}
export function recurringDetector512(s=store.get()){
 const tx=spending(s),groups=new Map();for(const x of tx){const k=T(first(x.merchant,x.title,x.name)).toLowerCase();if(!k)continue;const a=groups.get(k)||[];a.push(x);groups.set(k,a)}
 return[...groups.entries()].filter(([,a])=>a.length>=2).map(([merchant,a])=>({merchant,count:a.length,avg:Math.round(a.reduce((z,x)=>z+N(x.amount),0)/a.length),likelyRecurring:a.length>=3})).sort((a,b)=>b.count-a.count);
}
export function anomaly513(s=store.get()){const tx=spending(s),vals=tx.map(x=>Math.abs(N(x.amount))).filter(Boolean);const avg=vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:0;return tx.filter(x=>Math.abs(N(x.amount))>Math.max(avg*2.5,5000)).map(x=>({title:first(x.title,x.merchant,'Výdaj'),amount:N(x.amount),ratio:avg?Math.round(Math.abs(N(x.amount))/avg*10)/10:0})).slice(0,10)}
export function budgetGuard514(s=store.get()){const tx=spending(s),m=monthKey(),spent=tx.filter(x=>monthKey(first(x.date,x.at))===m).reduce((a,x)=>a+Math.abs(N(x.amount)),0),day=new Date().getDate(),pace=day?spent/day:0,forecast=Math.round(pace*30),income=N(first(s.financePlan?.expectedIncome,s.monthlyIncome));return{spent,pace:Math.round(pace),forecast,income,status:income&&forecast>income?'RYCHLE':income&&forecast>income*.8?'HLÍDAT':'OK'}}
export function safePurchase515(s=store.get()){const f=personalFinance445(s),p=practical490(s);return{limit:Math.max(0,N(f.safeSpendNow)),commitments:p.commitments.d30,reserve:N(f.reserve),status:N(f.safeSpendNow)>0?'MŮŽEŠ UTRATIT':'NEUTRÁCET VĚTŠÍ ČÁSTKU'}}

export function contribution516(s=store.get()){const p=practical490(s),f=personalFinance445(s),surplus=Math.max(0,p.savings.saving),cap=Math.max(0,N(f.safeInvestNow));const suggested=Math.max(0,Math.min(cap,Math.round(surplus*.7/1000)*1000));return{suggested,current:N(s.financePlan?.plannedInvestment),safeNow:cap,surplus}}
export function drift517(s=store.get()){const rows=portfolio(s),total=rows.reduce((a,x)=>a+N(first(x.valueCZK,x.marketValue,x.value)),0);return rows.map(x=>{const v=N(first(x.valueCZK,x.marketValue,x.value)),w=total?v/total*100:0,target=N(first(x.targetWeight,x.target,x.weightTarget));return{name:first(x.symbol,x.ticker,x.name,'Pozice'),weight:Math.round(w*10)/10,target,drift:target?Math.round((w-target)*10)/10:0}}).sort((a,b)=>Math.abs(b.drift)-Math.abs(a.drift))}
export function profitLock518(s=store.get()){return portfolio(s).map(x=>{const value=N(first(x.valueCZK,x.marketValue,x.value)),profit=N(first(x.profitCZK,x.profit,x.pnl)),ret=value-profit>0?profit/(value-profit)*100:0;return{name:first(x.symbol,x.ticker,x.name,'Pozice'),profit,returnPct:Math.round(ret*10)/10,suggestion:ret>35?'ZVÁŽIT ČÁSTEČNÝ VÝBĚR':ret>20?'HLÍDAT ZISK':'DRŽET'}}).sort((a,b)=>b.returnPct-a.returnPct)}
export function reinvest519(s=store.get()){const cash=N(first(s.investmentCash,s.xtbReport?.cash,s.xtbHub?.cash));const d=drift517(s).filter(x=>x.target&&x.drift<0);return{cash,underweight:d.slice(0,3),note:'Pouze návrh alokace; žádný nákup se automaticky neprovede.'}}
export function investmentJournal520(s=store.get()){return A(s.tradeJournal?.trades).map(x=>({symbol:first(x.symbol,x.ticker),side:x.side,amount:N(first(x.amount,x.value)),reason:first(x.reason,x.note,'bez důvodu'),date:first(x.date,x.at)})).slice(0,30)}

export function ticketTimeline521(s=store.get()){return tickets(s).map(x=>{const d=daysTo(first(x.sellBy,x.eventDate,x.date));let action='DRŽET';if(d!==null&&d<=3)action='PRODAT / ZKONTROLOVAT CENU';else if(d!==null&&d<=10)action='PŘECENIT';else if(d!==null&&d<=30)action='HLÍDAT';return{name:first(x.name,x.title,'Vstupenka'),days:d,action}}).sort((a,b)=>(a.days??999)-(b.days??999))}
export function ticketBreakEven522(s=store.get()){return tickets(s).map(x=>{const buy=N(first(x.buy,x.buyPrice,x.cost)),fee=N(first(x.feeRate,.12));const breakEven=fee<1?Math.ceil(buy/(1-fee)):buy;return{name:first(x.name,x.title,'Vstupenka'),buy,breakEven}})}
export function ticketRotation523(s=store.get()){const p=practical490(s);return p.tickets.rows.map(x=>({...x,rotationScore:Math.round((x.roi||0)-(x.days!==null&&x.days<14?20:0))})).sort((a,b)=>a.rotationScore-b.rotationScore).slice(0,5)}
export function ticketHistory524(s=store.get()){const hist=A(s.ticketBook?.history),groups=new Map();for(const x of hist){const k=first(x.artist,x.team,x.eventType,x.venue,'Ostatní'),a=groups.get(k)||[];a.push(x);groups.set(k,a)}return[...groups.entries()].map(([group,a])=>({group,count:a.length,profit:a.reduce((z,x)=>z+N(first(x.profit,x.pnl)),0),roi:a.length?Math.round(a.reduce((z,x)=>z+N(x.roi),0)/a.length*10)/10:0})).sort((a,b)=>b.roi-a.roi)}
export function ticketLessons525(s=store.get()){const h=ticketHistory524(s);return{best:h.slice(0,3),worst:[...h].sort((a,b)=>a.roi-b.roi).slice(0,3),lesson:h[0]?`Nejlépe zatím vychází ${h[0].group}.`:'Zatím není dost historie.'}}

export function homeAssets526(s=store.get()){return A(s.assetBook?.items).filter(personal).map(x=>({id:x.id,title:first(x.title,x.name,'Majetek'),price:N(first(x.price,x.amount,x.cost)),bought:first(x.boughtAt,x.purchaseDate,x.date),warrantyEnd:first(x.warrantyEnd,x.warrantyUntil),service:first(x.nextService,x.serviceDue)}))}
export function warranty527(s=store.get()){return homeAssets526(s).map(x=>({...x,days:daysTo(x.warrantyEnd)})).filter(x=>x.days!==null&&x.days>=0&&x.days<=120).sort((a,b)=>a.days-b.days)}
export function homeForecast528(s=store.get()){const p=practical490(s),maint=A(s.maintenance?.items).filter(open).filter(personal).reduce((a,x)=>a+N(first(x.estimatedCost,x.amount,x.cost)),0);return{monthly:p.savings.cost,annualRecurring:p.savings.cost*12,maintenance:maint,total:p.savings.cost*12+maint}}
export function carDecision529(s=store.get()){const p=practical490(s),car=A(s.vehicleCosts?.items).reduce((a,x)=>a+N(first(x.amount,x.cost)),0),replacement=p.vehicleFund.target,gap=p.vehicleFund.gap;return{annualCost:car,replacementBudget:replacement,gap,status:replacement&&car>replacement*.15?'ZVÁŽIT VÝMĚNU':'DRŽET',reason:replacement&&car>replacement*.15?'Roční náklady přesahují 15 % náhrady':'Náklady zatím nevypadají kriticky'}}

export function assistant530(s=store.get(),question=''){
 const q=T(question).toLowerCase(),cmd=command500(s),safe=safePurchase515(s),contrib=contribution516(s),tl=ticketTimeline521(s),rot=ticketRotation523(s),p=practical490(s);
 if(/můžu|muzu|utrat|koupit/.test(q)){const m=q.match(/(\d[\d\s.]*)/),ask=m?N(m[1].replace(/[\s.]/g,'')):0;return{answer:ask?`${ask<=safe.limit?'Ano':'Ne'} — bezpečný limit je ${money(safe.limit)}.`:`Bezpečný limit pro větší nákup je ${money(safe.limit)}.`,route:'Finance'}}
 if(/kolik.*xtb|invest/.test(q))return{answer:`Doporučený příspěvek tento měsíc je přibližně ${money(contrib.suggested)}; maximum podle dnešní hotovosti ${money(contrib.safeNow)}.`,route:'Finance'};
 if(/vstupenk|ticket|prodat/.test(q)){const x=rot[0]||tl[0];return{answer:x?`Nejdřív prověř ${x.name}; ${x.action||`rotation score ${x.rotationScore}`}.`:'Nemám aktivní vstupenku k rozhodnutí.',route:'Vstupenky'}}
 if(/co.*dnes|řešit|resit|udělat|udelat/.test(q))return{answer:cmd.next.main?`Teď řeš: ${cmd.next.main.title}. ${cmd.next.main.reason||''}`:'Podle uložených dat dnes nic zásadního nehoří.',route:'Command'};
 return{answer:`Readiness ${cmd.readiness}/100, závazky do 30 dní ${money(p.commitments.d30)}, volný nákupní limit ${money(safe.limit)}. Zeptej se na dnešek, XTB, nákup nebo vstupenky.`,route:'Souhrn'};
}

export function suite530(s=store.get()){return{capture:capture501(''),complete:complete503(s),snooze:snooze504(s),daily:dailyBrief506(s),evening:eveningClose507(s),weekly:weeklyReset508(s),monthly:monthlyReset509(s),year:yearProgress510(s),expenses:expenseInbox511(s),recurring:recurringDetector512(s),anomalies:anomaly513(s),budget:budgetGuard514(s),purchase:safePurchase515(s),contribution:contribution516(s),drift:drift517(s),profitLock:profitLock518(s),reinvest:reinvest519(s),journal:investmentJournal520(s),ticketTimeline:ticketTimeline521(s),breakEven:ticketBreakEven522(s),rotation:ticketRotation523(s),ticketHistory:ticketHistory524(s),ticketLessons:ticketLessons525(s),assets:homeAssets526(s),warranty:warranty527(s),homeForecast:homeForecast528(s),car:carDecision529(s)}}

async function chooseWrite(title,body,buttons){return modal(title,body,[...buttons,{label:'Zrušit',value:null,primary:true}])}
export async function openQuickCapture501(){
 const raw=prompt('Co chceš rychle přidat?')||'';if(!T(raw))return;const x=capture501(raw);const ok=await chooseWrite('Quick Capture 50.1',`<div class="card"><div class="row"><span>Text</span><b>${h(raw)}</b></div><div class="row"><span>Typ</span><b>${h(x.kind)}</b></div><div class="row"><span>Kategorie</span><b>${h(x.category)}</b></div></div><div class="decision-note">Zápis proběhne až po potvrzení a bude mít Undo + audit.</div>`,[{label:'Potvrdit',value:'yes'}]);if(ok!=='yes')return;
 store.mutate('Quick Capture',s=>{if(x.kind==='expense'){s.personalSpending=s.personalSpending||{transactions:[]};s.personalSpending.transactions=A(s.personalSpending.transactions);s.personalSpending.transactions.unshift({id:uid('txn'),title:raw,category:x.category,status:'INBOX',at:new Date().toISOString()})}else{s.tasks=A(s.tasks);s.tasks.unshift({id:uid('task'),title:raw,category:x.category,status:'OPEN',createdAt:new Date().toISOString()})}});
}
export async function openComplete503(){const rows=complete503();if(!rows.length)return modal('Hotovo','<div class="empty">Žádný osobní úkol.</div>',[{label:'Zavřít',value:null,primary:true}]);const buttons=rows.map(x=>({label:x.title,value:x.id}));const id=await chooseWrite('Označit hotovo','<div class="decision-note">Vyber úkol. Změna se provede až po kliknutí.</div>',buttons);if(!id)return;store.mutate('Úkol hotovo',s=>{const x=A(s.tasks).find(t=>t.id===id);if(x){x.status='DONE';x.completedAt=new Date().toISOString()}})}
export async function openSnooze504(){const rows=snooze504();if(!rows.length)return modal('Odložit','<div class="empty">Žádný termín k odložení.</div>',[{label:'Zavřít',value:null,primary:true}]);const id=await chooseWrite('Odložit o 7 dní','<div class="decision-note">Vyber úkol. Termín se posune o 7 dní až po kliknutí.</div>',rows.map(x=>({label:first(x.title,x.name,'Úkol'),value:x.id})));if(!id)return;store.mutate('Odložit úkol o 7 dní',s=>{const x=A(s.tasks).find(t=>t.id===id);if(x){const base=ts(first(x.due,x.dueAt,x.date))||Date.now();x.due=new Date(base+7*86400000).toISOString().slice(0,10)}})}
export async function openAssistant530(){const q=prompt('Na co se chceš Kamil OS zeptat?')||'';if(!T(q))return;const t=performance.now(),x=assistant530(store.get(),q);window.__KAMIL_ASSISTANT_530_LAST__={ms:Math.round((performance.now()-t)*10)/10,at:Date.now()};await modal('Kamil OS / Osobní asistent 53.0',`<div class="card"><div class="eyebrow">DOTAZ</div><div class="row"><span>${h(q)}</span></div></div><div class="card"><div class="eyebrow">ODPOVĚĎ</div><div class="row"><b>${h(x.answer)}</b></div><div class="muted">Oblast: ${h(x.route)}</div></div><div class="decision-note">Asistent odpovídá z uložených osobních dat. Finanční kroky jsou pouze návrhy; nic automaticky neobchoduje ani neplatí.</div>`,[{label:'Zavřít',value:null,primary:true}])}
export async function openSuite530(){const t=performance.now(),x=suite530();window.__KAMIL_SUITE_530_LAST__={ms:Math.round((performance.now()-t)*10)/10,at:Date.now()};const body=`<div class="metric-strip"><div class="metric"><span>Safe purchase</span><b>${money(x.purchase.limit)}</b></div><div class="metric"><span>Investice / měsíc</span><b>${money(x.contribution.suggested)}</b></div><div class="metric"><span>Výdajové anomálie</span><b>${x.anomalies.length}</b></div><div class="metric"><span>Záruky / 120 dní</span><b>${x.warranty.length}</b></div></div><div class="card"><div class="eyebrow">DEN & TÝDEN</div><div class="row"><span>Dnešní hlavní krok</span><b>${h(x.daily.main?.title||'nic zásadního')}</b></div><div class="row"><span>Weekly focus</span><b>${x.weekly.focus.length}</b></div><div class="row"><span>Výdaje v inboxu</span><b>${x.expenses.length}</b></div></div><div class="card"><div class="eyebrow">PENÍZE & XTB</div><div class="row"><span>Budget pace</span><b>${h(x.budget.status)}</b></div><div class="row"><span>Portfolio drift</span><b>${x.drift[0]?`${h(x.drift[0].name)} ${x.drift[0].drift}%`:'—'}</b></div><div class="row"><span>Profit lock</span><b>${x.profitLock[0]?h(x.profitLock[0].suggestion):'—'}</b></div></div><div class="card"><div class="eyebrow">VSTUPENKY & DOMOV</div><div class="row"><span>Ticket k prověření</span><b>${x.rotation[0]?h(x.rotation[0].name):'—'}</b></div><div class="row"><span>Domov / 12 měsíců</span><b>${money(x.homeForecast.total)}</b></div><div class="row"><span>Auto</span><b>${h(x.car.status)}</b></div></div><div class="decision-note">Personal Assistant Suite 53.0: analytika je read-only. Quick Capture / Hotovo / Odložit zapisují jen po explicitním kliknutí a s Undo + auditem.</div>`;const choice=await modal('Kamil OS / Personal Assistant Suite 53.0',body,[{label:'Zeptat se asistenta',value:'ask'},{label:'Quick Capture',value:'capture'},{label:'Označit hotovo',value:'complete'},{label:'Odložit úkol',value:'snooze'},{label:'Zavřít',value:null,primary:true}]);if(choice==='ask')return openAssistant530();if(choice==='capture')return openQuickCapture501();if(choice==='complete')return openComplete503();if(choice==='snooze')return openSnooze504();}
