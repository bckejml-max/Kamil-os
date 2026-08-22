import {store} from './state.js';
import {h,modal} from './utils.js';
import {exactTodayPlan561} from './exactTodayPlan561.js';
import {xtbBuyZones,xtbProfitLadder,xtbEarningsRisk,ticketRepricingLadder,ticketMinimumSafePrice} from './marketSuite554.js';

const A=v=>Array.isArray(v)?v:[];
const N=v=>Number(v||0);
const U=v=>String(v||'').toUpperCase();
const fmtNum=v=>Number(v).toLocaleString('cs-CZ',{maximumFractionDigits:2});
const dateOnly=v=>{const d=new Date(v);return Number.isFinite(d.getTime())?d.toLocaleDateString('cs-CZ'):null};
const plusDays=(v,n)=>{const d=new Date(v);if(!Number.isFinite(d.getTime()))return null;d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)};
const unique=a=>[...new Set(a.filter(Boolean))];

function nextTicketMilestone(ladder){
 const days=ladder?.days;
 if(days===null||days===undefined)return null;
 const marks=[30,14,7,3,1];
 const next=marks.find(x=>days>x);
 if(next===undefined)return days>1?1:null;
 const inDays=Math.max(0,days-next);
 return{daysLeft:next,inDays};
}

function xtbTriggers(row,zones,profits,earnings){
 const out=[],zone=zones.get(U(row.ticker)),profit=profits.get(U(row.ticker)),earn=earnings.get(U(row.ticker)),texts=[...A(row.blockers),...A(row.warnings),...A(row.reasons)].join(' · ');
 if(row.ageHours===null||row.ageHours===undefined)out.push({kind:'DATA',when:'TEĎ',text:'Nahraj nový XTB import s platným časem dat.'});
 else if(row.ageHours>36)out.push({kind:'DATA',when:'TEĎ',text:`Nahraj nový XTB import; pro READY musí být data nejvýš 36 h stará (teď ${Math.round(row.ageHours)} h).`});
 if(/velikost kroku|sizing/i.test(texts))out.push({kind:'SIZING',when:'TEĎ',text:'Doplň spolehlivý sizing; bez počtu kusů nebo částky akční verdikt neprojde.'});
 if(/portfolia|koncentr/i.test(texts)&&U(row.originalAction||row.action)==='BUY')out.push({kind:'CONCENTRATION',when:'PODMÍNKA',text:'Přikupování znovu prověř až při váze pozice pod 10 % portfolia.'});
 if(earn?.days!==null&&earn?.days!==undefined&&earn.days>=0&&earn.days<=7){const after=plusDays(earn.date,1);out.push({kind:'EARNINGS',when:after?dateOnly(after):'PO VÝSLEDCÍCH',text:`Znovu vyhodnoť po výsledcích${earn.date?` (${dateOnly(earn.date)})`:''}; před earnings oknem nový BUY neber jako finální.`})}
 if(['HOLD','WAIT'].includes(U(row.verdict))){
  if(zone?.good)out.push({kind:'PRICE',when:'CENOVÝ TRIGGER',text:`Znovu prověř BUY při ceně ≤ ${fmtNum(zone.good)} (ideál ${zone.ideal?fmtNum(zone.ideal):'—'}, v měně instrumentu).`});
  if(profit?.next)out.push({kind:'PROFIT',when:'P/L TRIGGER',text:`Při dosažení +${profit.next.gain} % znovu prověř profit-lock; ladder navrhuje redukci ${profit.next.sellPct} %.`});
 }
 if(!out.length)out.push({kind:'SIGNAL',when:'PŘI NOVÝCH DATECH',text:'Znovu spusť verdikt po novém XTB importu nebo po změně market signálu.'});
 return unique(out.map(x=>JSON.stringify(x))).map(x=>JSON.parse(x));
}

function ticketTriggers(row,ladders,safeById){
 const out=[],ladder=ladders.get(row.id),safe=N(safeById.get(row.id)?.safePrice),texts=[...A(row.blockers),...A(row.warnings),...A(row.reasons)].join(' · '),age=row.marketAgeHours;
 if(/aktuální market cena/i.test(texts)||!N(row.market))out.push({kind:'MARKET',when:'TEĎ',text:'Doplň aktuální market cenu z ověřitelného zdroje.'});
 if(age===null||age===undefined||age>8)out.push({kind:'FRESHNESS',when:'TEĎ',text:`Aktualizuj market cenu; pro čistý akční verdikt musí být kontrola nejvýš 8 h stará${Number.isFinite(age)?` (teď ${Math.round(age)} h)`:''}.`});
 if(N(row.dataQuality)<70)out.push({kind:'QUALITY',when:'TEĎ',text:`Doplň ticket data tak, aby kvalita byla alespoň 70/100 (teď ${N(row.dataQuality)}/100).`});
 if(/deadline|datum akce/i.test(texts))out.push({kind:'DATE',when:'TEĎ',text:'Doplň prodejní deadline nebo datum akce.'});
 if(safe&&N(row.market)>0&&N(row.market)<safe)out.push({kind:'FLOOR',when:'CENOVÝ TRIGGER',text:`Akční prodej znovu prověř až při market ceně alespoň ${fmtNum(safe)} Kč / ks, nebo po novém ručním rozhodnutí o ztrátě.`});
 if(['HOLD','WAIT'].includes(U(row.verdict))){const m=nextTicketMilestone(ladder);if(m){out.push({kind:'LADDER',when:m.inDays===0?'TEĎ':`ZA ${m.inDays} D`,text:`Až bude ${m.daysLeft} dní do termínu, zkontroluj čerstvou market cenu a přepočítej repricing ladder.`})}}
 if(!out.length)out.push({kind:'SIGNAL',when:'PŘI NOVÉ CENĚ',text:'Znovu vyhodnoť při nové market ceně nebo v dalším bodu repricing ladderu.'});
 return unique(out.map(x=>JSON.stringify(x))).map(x=>JSON.parse(x));
}

export function recheckTriggers562(s=store.get()){
 const started=performance.now(),plan=exactTodayPlan561(s),zones=new Map(xtbBuyZones(s).map(x=>[U(x.ticker),x])),profits=new Map(xtbProfitLadder(s).map(x=>[U(x.ticker),x])),earnings=new Map(xtbEarningsRisk(s).map(x=>[U(x.ticker),x])),ladders=new Map(ticketRepricingLadder(s).map(x=>[x.id,x])),safeById=new Map(ticketMinimumSafePrice(s).map(x=>[x.id,x]));
 const source=[...plan.verify,...plan.wait],items=source.map(row=>{const triggers=row.domain==='XTB'?xtbTriggers(row,zones,profits,earnings):ticketTriggers(row,ladders,safeById),now=triggers.some(x=>x.when==='TEĎ');return{...row,triggers,primary:triggers[0],mode:now?'VERIFY_NOW':'WAIT_TRIGGER'};}).sort((a,b)=>(a.mode==='VERIFY_NOW'?0:1)-(b.mode==='VERIFY_NOW'?0:1)||a.confidence-b.confidence);
 const verifyNow=items.filter(x=>x.mode==='VERIFY_NOW'),waiting=items.filter(x=>x.mode==='WAIT_TRIGGER'),summary=verifyNow.length?`${verifyNow.length} market položek má konkrétní věc k ověření teď.`:waiting.length?`Teď nic neopravuj; čekej na ${waiting.length} konkrétní triggery.`:'Žádné čekající ani blokované market rozhodnutí.';
 const result={items,verifyNow,waiting,total:items.length,summary,generatedAt:new Date().toISOString()};
 window.__KAMIL_RECHECK_562_LAST__={ms:Math.round((performance.now()-started)*10)/10,at:Date.now(),verifyNow:verifyNow.length,waiting:waiting.length};
 return result;
}

const row=(x,mode)=>`<div class="intel-row"><div class="intel-main"><b>${h(x.name||x.ticker)}</b><span>${h(x.triggers.map(t=>`${t.when}: ${t.text}`).join(' · '))}</span></div><div class="row-actions"><span class="decision-action ${mode==='now'?'bad':'warn'}">${mode==='now'?'OVĚŘ TEĎ':'ČEKEJ NA TRIGGER'}</span><span class="status">${x.confidence}%</span></div></div>`;

export async function openRecheckTriggers562(){
 const x=recheckTriggers562(),body=`<div class="metric-strip"><div class="metric"><span>Ověř teď</span><b class="${x.verifyNow.length?'bad':'good'}">${x.verifyNow.length}</b></div><div class="metric"><span>Čeká na trigger</span><b>${x.waiting.length}</b></div><div class="metric"><span>Celkem</span><b>${x.total}</b></div></div><div class="card"><div class="eyebrow">RECHECK TRIGGERS 56.2</div><h2>${h(x.summary)}</h2><p>Každé OVĚŘ / ČEKEJ je převedené na konkrétní podmínku, kdy má smysl verdikt přepočítat.</p></div><div class="card"><div class="eyebrow">OVĚŘ TEĎ</div>${x.verifyNow.map(v=>row(v,'now')).join('')||'<div class="empty success-empty">Nic nepotřebuje okamžité doplnění dat.</div>'}</div><div class="card"><div class="eyebrow">ČEKEJ NA TRIGGER</div>${x.waiting.map(v=>row(v,'wait')).join('')||'<div class="empty">Žádný čekající trigger.</div>'}</div><div class="decision-note">56.2 nic nesleduje na pozadí a neposílá automatické obchody ani repricing. Triggery jsou pouze podmínky pro další ruční kontrolu nad uloženými daty.</div>`;
 return modal('XTB + vstupenky / Recheck Triggers 56.2',body,[{label:'Zavřít',value:null,primary:true}]);
}
