import {decisionSnapshot30,decisionDelta30} from './js/decisionDelta30.js';
const assert=(x,m)=>{if(!x)throw new Error(m)};
const t0=new Date('2026-08-20T10:00:00+02:00'),t1=new Date('2026-08-20T12:00:00+02:00');

const before=[
 {domain:'money',id:'WDAY',title:'WDAY · PROVĚŘIT',priority:69,action:'REVIEW',reason:'Pozice je pod nákupem.',when:'Držet bez automatického průměrování',buyRule:'Přikoupit jen po potvrzení teze.',sellRule:'Exit při porušení teze.',target:'money'},
 {domain:'tickets',id:'T1',title:'Koncert · UPRAVIT CENU',priority:90,action:'REPRICE',reason:'Akce se blíží.',when:'Zkontrolovat dnes',buyRule:'Nepřikupovat.',sellRule:'Snižovat cenu.',target:'tickets'},
 {domain:'home',id:'task:old',title:'Starý úkol',priority:82,reason:'Úkol za 2 dny',target:'home'}
];
const baseline=decisionSnapshot30(before,t0),baselineJson=JSON.stringify(baseline),beforeJson=JSON.stringify(before);
const current=[
 {domain:'money',id:'WDAY',title:'WDAY · REDUKOVAT',priority:90,action:'TRIM',reason:'Zisk už stojí za ochranu.',when:'Zvážit část prodat teď',buyRule:'Nepřikupovat po růstu.',sellRule:'Odprodat část.',target:'money'},
 {domain:'tickets',id:'T1',title:'Koncert · UPRAVIT CENU',priority:90,action:'REPRICE',reason:'Akce se blíží.',when:'Zkontrolovat dnes',buyRule:'Nepřikupovat.',sellRule:'Být mezi nejlevnějšími.',target:'tickets'},
 {domain:'home',id:'task:new',title:'Nový termín',priority:76,reason:'Nová osobní věc',target:'home'}
];
const out=decisionDelta30(current,baseline,t1);
assert(JSON.stringify(baseline)===baselineJson&&JSON.stringify(before)===beforeJson,'Decision Delta must not mutate inputs');
assert(out.initialized&&out.baselineAt===baseline.at,'baseline preserved');
const action=out.items.find(x=>x.key==='money|WDAY');assert(action?.type==='ACTION'&&action.detail.includes('REVIEW → TRIM')&&action.priority>=92,'action change must dominate');
const trigger=out.items.find(x=>x.key==='tickets|T1');assert(trigger?.type==='TRIGGER'&&trigger.detail.includes('Změnilo se pravidlo'),'trigger change detected');
const fresh=out.items.find(x=>x.key==='home|task:new');assert(fresh?.type==='NEW','new decision detected');
const dropped=out.items.find(x=>x.key==='home|task:old');assert(dropped?.type==='OUT'&&dropped.detail.includes('neznamená')&&dropped.detail.includes('vyřešená'),'dropped decision must explicitly say it is not automatically resolved');
assert(out.attention>=2,'meaningful changes counted');

const noBase=decisionDelta30(current,null,t1);assert(!noBase.initialized&&!noBase.items.length&&noBase.current.items.length===3,'missing baseline initializes safely');
const same=decisionDelta30(before,baseline,t1);assert(same.initialized&&same.items.length===0&&same.headline.includes('nezměnila'),'identical decisions produce no delta');
console.log('DECISION DELTA 30.5 TEST PASS');
