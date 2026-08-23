import {store} from './state.js';
import {h,money,modal} from './utils.js';

const A=v=>Array.isArray(v)?v:[];
const U=v=>String(v||'').toUpperCase();
const N=v=>Number(v||0);
const CLOSED=new Set(['DONE','CLOSED','ARCHIVED','RESOLVED','PAID','SOLD','CANCELLED','CANCELED']);
const open=x=>!CLOSED.has(U(x?.status||x?.workflow));
const title=x=>x?.title||x?.name||x?.subject||x?.label||'Položka';
const text=x=>`${x?.title||''} ${x?.name||''} ${x?.subject||''} ${x?.category||''} ${x?.kind||''} ${x?.type||''} ${x?.notes||''}`.toLowerCase();
const dateOf=x=>x?.due||x?.dueAt||x?.date||x?.start||x?.when||x?.expiresAt||x?.renewalAt||x?.nextAt||x?.followUpAt||null;
const days=v=>{const t=Date.parse(v||'');return Number.isFinite(t)?Math.ceil((t-Date.now())/86400000):null};
const due=x=>days(dateOf(x));
const dueLabel=d=>d===null?'bez termínu':d<0?`${Math.abs(d)} d po termínu`:d===0?'dnes':d===1?'zítra':`za ${d} d`;
const personal=x=>!/zak[aá]zk|faktur|dodavat|cest[aá]k|doch[aá]zk|pks|cpi|zbrojov|projektov[aá] karta|pracovn/i.test(text(x));
const moneyOf=x=>N(x?.amount||x?.price||x?.monthly||x?.cost||x?.value||0);
const sortDue=a=>[...a].sort((x,y)=>(due(x)??9999)-(due(y)??9999));
const pick=(a,re)=>A(a).filter(x=>re.test(text(x)));
const rows=(a,limit=5)=>sortDue(a).slice(0,limit).map(x=>({title:title(x),meta:dueLabel(due(x)),amount:moneyOf(x)}));

function sources(s={}){
 const tasks=A(s.tasks).filter(open).filter(personal),admin=A(s.personalAdmin?.items).filter(open),inbox=A(s.personalInbox?.items).filter(open),calendar=A(s.calendar?.events),assets=A(s.assetBook?.items),goals=A(s.personalGoals?.items).filter(open),spending=A(s.personalSpending?.transactions),family=A(s.familyHome?.members),delegations=A(s.delegations).filter(open).filter(personal),projects=A(s.projects).filter(open).filter(personal);
 return{tasks,admin,inbox,calendar,assets,goals,spending,family,delegations,projects};
}

export function personalLifeSuite621(s=store.get()){
 const x=sources(s),all=[...x.tasks,...x.admin,...x.inbox,...x.projects],now=new Date(),dow=now.getDay();
 const today=sortDue(all.filter(v=>{const d=due(v);return d!==null&&d<=1}));
 const familyCalendar=sortDue(x.calendar.filter(v=>{const d=due(v);return d!==null&&d>=0&&d<=60&&/rodin|narozen|výroč|vyroc|doktor|kontrol|očkov|ockov|návštěv|navstev|škol|skol|dítě|dite/i.test(text(v))}));
 const householdAdmin=pick(x.admin,/pojist|energie|elektr|plyn|voda|banka|úřad|urad|poplatek|smlouv|auto|stát|stat|občan|obcan|hypot|internet|telefon/);
 const billsRenewals=pick([...x.admin,...x.assets],/platb|faktur|splat|obnov|renew|pojist|předplat|predplat|tarif|poplatek|storno|výpově|vypove/);
 const maintenance=pick([...x.assets,...x.admin,...x.tasks],/servis|údržb|udrzb|reviz|filtr|tepel|čerpad|cerpad|rekuper|klima|auto|stk|komín|komin|kotl|zahrad|oprava/);
 const familyTodos=all.filter(v=>/rodin|domác|domac|partner|manžel|manzel|dítě|dite|rodič|rodic|děda|deda|babi/i.test(text(v)));
 const waiting=sortDue([...x.delegations,...x.inbox.filter(v=>/ček|cek|odpově|odpove|reklamac|vrác|vrac|servis|vyjádř|vyjadr/i.test(text(v)))]);
 const documents=pick([...x.admin,...x.assets],/doklad|smlouv|pojist|faktur|protokol|rodn|občank|obcank|pas|řidič|ridic|technick|záruč|zaruc|list/);
 const expiry=sortDue(pick([...x.admin,...x.assets],/expir|platnost|občank|obcank|pas|řidič|ridic|stk|pojist|reviz|záruk|zaruk|licenc/).filter(v=>due(v)!==null));
 const monthAgo=Date.now()-31*86400000,recentSpend=x.spending.filter(v=>{const t=Date.parse(v?.date||v?.at||'');return Number.isFinite(t)&&t>=monthAgo});
 const monthlySpend=recentSpend.reduce((a,v)=>a+Math.abs(N(v.amount)),0),fixedSpend=recentSpend.filter(v=>/nájem|najem|hypot|energie|pojist|internet|telefon|předplat|predplat/i.test(text(v))).reduce((a,v)=>a+Math.abs(N(v.amount)),0);
 const subscriptions=pick([...x.admin,...recentSpend],/netflix|spotify|youtube|icloud|google one|adobe|microsoft|game pass|playstation|předplat|predplat|subscription|měsíč|mesic/);
 const purchases=pick([...x.goals,...x.admin,...x.tasks],/koup|poří|pori|nákup|nakup|objedn|vybaven|spotřebič|spotrebic|nábytek|nabytek/);
 const homeProjects=pick([...x.projects,...x.tasks,...x.goals],/dům|dum|rekonstruk|zahrad|garáž|garaz|kuch|koupeln|ložnic|loznic|terasa|plot|bazén|bazen|domác/i);
 const personalInbox=sortDue(x.inbox);
 const healthAdmin=sortDue([...x.admin,...x.calendar,...x.tasks].filter(v=>/doktor|lékař|lekar|kontrol|očkov|ockov|recept|zub|dent|prevent|prohlídk|fyzi|lék|lek/i.test(text(v))));
 const weekend=sortDue(x.calendar.filter(v=>{const d=due(v);return d!==null&&d>=0&&d<=10})).slice(0,8);
 const wishlist=pick([...x.goals,...x.tasks,...x.admin],/výlet|vylet|restaur|film|kino|seriál|serial|hra|dovolen|cest|zkusit|wishlist|někdy|nekdy|místo|misto/);
 const overdue=all.filter(v=>{const d=due(v);return d!==null&&d<0}).length,soon=all.filter(v=>{const d=due(v);return d!==null&&d>=0&&d<=7}).length;
 const score=Math.max(0,100-overdue*12-Math.max(0,waiting.length-3)*4-Math.max(0,expiry.filter(v=>(due(v)??999)<=30).length)*6-Math.max(0,maintenance.filter(v=>(due(v)??999)<0).length)*8);
 const sundayReset={active:dow===0,open:all.length,overdue,waiting:waiting.length,next7:soon,summary:dow===0?'Je neděle: projdi resty, čekání a příštích 7 dní.':'Připraveno pro nedělní reset.'};
 const commanderCandidates=[
  ...today.map(v=>({score:(due(v)??0)<0?130:120,title:title(v),reason:`Termín ${dueLabel(due(v))}`,feature:'today'})),
  ...waiting.filter(v=>(due(v)??999)<=0).map(v=>({score:112,title:title(v),reason:'Čekání už potřebuje follow-up',feature:'waiting'})),
  ...expiry.filter(v=>(due(v)??999)<=30).map(v=>({score:105,title:title(v),reason:`Platnost ${dueLabel(due(v))}`,feature:'expiry'})),
  ...maintenance.filter(v=>(due(v)??999)<0).map(v=>({score:102,title:title(v),reason:'Údržba je po termínu',feature:'maintenance'})),
  ...billsRenewals.filter(v=>(due(v)??999)<=7).map(v=>({score:98,title:title(v),reason:`Platba / obnova ${dueLabel(due(v))}`,feature:'renewals'}))
 ].sort((a,b)=>b.score-a.score);
 const commander=commanderCandidates[0]||{score:40,title:'Nic osobního teď nehoří',reason:'Nejbližší osobní termíny jsou pod kontrolou.',feature:'today'};
 const features={
  today:{name:'Personal Today',subtitle:'Jen osobní věci na dnes',items:rows(today),count:today.length},
  familyCalendar:{name:'Family Calendar Radar',subtitle:'Rodinné akce a termíny',items:rows(familyCalendar),count:familyCalendar.length},
  admin:{name:'Household Admin Center',subtitle:'Smlouvy, banky, energie, auto a úřady',items:rows(householdAdmin),count:householdAdmin.length},
  renewals:{name:'Bills & Renewals Radar',subtitle:'Platby, obnovy a rušení',items:rows(billsRenewals),count:billsRenewals.length},
  maintenance:{name:'Home Maintenance Planner',subtitle:'Servis, revize a údržba',items:rows(maintenance),count:maintenance.length},
  familyTodos:{name:'Family To-Do Board',subtitle:'Rodinné a domácí úkoly',items:rows(familyTodos),count:familyTodos.length},
  waiting:{name:'Personal Waiting For',subtitle:'Na koho nebo co čekáš',items:rows(waiting),count:waiting.length},
  documents:{name:'Personal Documents Vault Index',subtitle:'Doklady a dokumenty',items:rows(documents),count:documents.length},
  expiry:{name:'Expiry Radar',subtitle:'Co brzy přestane platit',items:rows(expiry),count:expiry.length},
  finance:{name:'Family Finance Snapshot',subtitle:'Osobní měsíční cashflow',items:[{title:'Útrata za posledních 31 dní',meta:'podle uložených transakcí',amount:monthlySpend},{title:'Odhad fixních výdajů',meta:'rozpoznané pravidelné výdaje',amount:fixedSpend}],count:recentSpend.length},
  subscriptions:{name:'Subscription Killer',subtitle:'Pravidelné platby k prověření',items:rows(subscriptions),count:subscriptions.length},
  purchases:{name:'Big Purchase Planner',subtitle:'Větší nákupy a cíle',items:rows(purchases),count:purchases.length},
  homeProjects:{name:'Home Project Tracker',subtitle:'Dům, rekonstrukce a domácí projekty',items:rows(homeProjects),count:homeProjects.length},
  inbox:{name:'Personal Inbox Zero',subtitle:'Osobní otevřené vstupy',items:rows(personalInbox),count:personalInbox.length},
  healthAdmin:{name:'Family Health Admin',subtitle:'Pouze organizační termíny a kontroly',items:rows(healthAdmin),count:healthAdmin.length},
  weekend:{name:'Weekend Planner',subtitle:'Nejbližší volno a rodinný program',items:rows(weekend),count:weekend.length},
  wishlist:{name:'Free-Time Wishlist',subtitle:'Co někdy podniknout nebo zkusit',items:rows(wishlist),count:wishlist.length},
  scoreboard:{name:'Personal Life Scoreboard',subtitle:'Jednoduchý stav osobního života',items:[{title:'Life score',meta:overdue?'Máme resty po termínu':'Bez restů po termínu',amount:score},{title:'Do 7 dnů',meta:'osobní věci s termínem',amount:soon},{title:'Čekání',meta:'follow-up fronta',amount:waiting.length}],count:score},
  sunday:{name:'Sunday Reset',subtitle:sundayReset.summary,items:[{title:'Otevřené osobní věci',meta:'celkem',amount:all.length},{title:'Po termínu',meta:'vyřešit nebo přeplánovat',amount:overdue},{title:'Příštích 7 dní',meta:'připravit',amount:soon}],count:all.length},
  commander:{name:'Personal Life Commander',subtitle:'Nejlepší osobní věc, kterou udělat teď',items:[{title:commander.title,meta:commander.reason,amount:0}],count:1}
 };
 return{features,commander,score,overdue,soon,waiting:waiting.length,monthlySpend,fixedSpend,generatedAt:new Date().toISOString()};
}

const rowHtml=v=>`<div class="row"><div><b>${h(v.title)}</b><div class="muted">${h(v.meta||'')}</div></div>${v.amount?`<b>${typeof v.amount==='number'&&v.amount>1000?money(v.amount):h(String(v.amount))}</b>`:''}</div>`;

export async function openPersonalLifeFeature621(key){
 const x=personalLifeSuite621(),f=x.features[key]||x.features.commander;
 const body=`<div class="card"><div class="eyebrow">${h(f.name)}</div><h2>${h(f.subtitle)}</h2></div><div class="card">${f.items.length?f.items.map(rowHtml).join(''):'<div class="empty success-empty">Podle uložených dat tu teď nic není.</div>'}</div><div class="decision-note">62.1 je read-only analytická vrstva. Nic sama neplatí, neobjednává, neposílá ani nemaže.</div>`;
 return modal(`Kamil OS / ${f.name}`,body,[{label:'Zpět',value:null,primary:true}]);
}

export async function openPersonalLifeSuite621(){
 const t=performance.now(),x=personalLifeSuite621();
 if(typeof window!=='undefined')window.__KAMIL_PERSONAL_LIFE_621_LAST__={ms:Math.round((performance.now()-t)*10)/10,at:Date.now(),score:x.score,commander:x.commander.title,features:20};
 const f=x.features,featureRows=Object.entries(f).filter(([k])=>k!=='commander').map(([k,v])=>`<button class="btn" data-life-feature="${h(k)}">${h(v.name)} · ${h(String(v.count))}</button>`).join('');
 const body=`<div class="metric-strip"><div class="metric"><span>Life score</span><b>${x.score}/100</b></div><div class="metric"><span>Po termínu</span><b>${x.overdue}</b></div><div class="metric"><span>Do 7 dnů</span><b>${x.soon}</b></div><div class="metric"><span>Čekání</span><b>${x.waiting}</b></div></div><div class="card"><div class="eyebrow">PERSONAL LIFE COMMANDER 62.1</div><h2>${h(x.commander.title)}</h2><p>${h(x.commander.reason)}</p><button class="btn primary" data-life-feature="${h(x.commander.feature)}">Řešit tuto oblast</button></div><div class="card"><div class="eyebrow">20 OSOBNÍCH MODULŮ</div><div class="row-actions">${featureRows}</div></div><div class="decision-note">Personal Life Suite 60.2–62.1 sjednocuje osobní život, rodinu, domácnost, administrativu, finance domácnosti a volný čas. Tato obrazovka je read-only a pracuje jen s daty, která už Kamil OS obsahuje.</div>`;
 const choice=await modal('Kamil OS / Personal Life Suite 62.1',body,[{label:'Zavřít',value:null,primary:true}]);
 return choice;
}
