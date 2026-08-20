import fs from 'fs';
const assert=(x,m)=>{if(!x)throw new Error(m)};
const {buildPersonalToday}=await import('./js/personalToday26.js');
const {decisionExplain30}=await import('./js/decisionExplain30.js');
const {decisionNext30}=await import('./js/decisionNext30.js');
const {decisionSnapshot30,decisionDelta30}=await import('./js/decisionDelta30.js');
const meta=fs.readFileSync('js/releaseMeta.js','utf8'),config=fs.readFileSync('js/config.js','utf8'),html=fs.readFileSync('index.html','utf8'),sw=fs.readFileSync('sw.js','utf8'),todayUi=fs.readFileSync('js/today29.js','utf8');
assert(meta.includes("APP_VERSION='30.5.0'")&&meta.includes("APP_RELEASE='30.5'"),'30.5 release metadata mismatch');
assert(config.includes('SCHEMA_VERSION = 42'),'30.5 schema mismatch');
assert(html.includes('./js/decisionExplainUi30.js')&&html.includes('Kamil OS 30.5'),'30.5 shell runtime/version missing');
assert(sw.includes('kamil-os-30.5.0-shell-r1')&&sw.includes('decisionDelta30.js'),'30.5 PWA Decision Delta runtime missing');
assert(todayUi.includes('decisionBaseline30')&&todayUi.includes('store.setMeta')&&!todayUi.includes('store.mutate'),'30.5 baseline must remain local meta only');
assert(todayUi.includes("from './releaseMeta.js'")&&!todayUi.includes("import {APP_VERSION} from './config.js'"),'30.5 Today must use canonical version');

const now=new Date('2026-08-20T10:00:00+02:00');
const base={financePlan:{currency:'CZK',cashNow:200000,reserveFloor:50000,cashflow:[]},tasks:[],personalAdmin:{items:[]},familyHome:{members:[]},assetBook:{items:[]},emergencyFile:{contacts:[],assets:[]},calendar:{events:[]},debtBook:{items:[]},audit:[],xtbStrategy:{closedTickers:{},overrides:{}},ticketBook:{items:[],watchlist:[]}};
const beforeState=structuredClone(base);beforeState.xtbHub={asOf:'2026-08-20T08:00:00Z',accounts:{czk:{currency:'CZK',value:100000,positions:[{ticker:'WDAY',name:'Workday',category:'STOCK',value:10000,net_profit_pct:-10}]}}};beforeState.ticketBook.items=[{id:'ticket-1',name:'Test koncert',workflow:'LISTED',date:'2026-08-26',qty:1,buy:1000,listPrice:1800,floorPrice:1200}];
const currentState=structuredClone(base);currentState.xtbHub={asOf:'2026-08-20T09:00:00Z',accounts:{czk:{currency:'CZK',value:100000,positions:[{ticker:'WDAY',name:'Workday',category:'STOCK',value:10000,net_profit_pct:30}]}}};currentState.ticketBook.items=[{id:'ticket-1',name:'Test koncert',workflow:'LISTED',date:'2026-08-22',qty:1,buy:1000,listPrice:1800,floorPrice:1200}];
const before=buildPersonalToday(beforeState,now),current=buildPersonalToday(currentState,now);for(const d of current){const e=decisionExplain30(d);assert(e.score===d.priority,'30.5 explainability regression');if(d.action)assert(decisionNext30(d).hasStructuredTrigger,'30.5 Next Trigger regression')}
const baseline=decisionSnapshot30(before,now),delta=decisionDelta30(current,baseline,new Date('2026-08-20T12:00:00+02:00'));const xd=delta.items.find(x=>x.key==='money|WDAY'),td=delta.items.find(x=>x.key==='tickets|ticket-1');assert(xd?.type==='ACTION'&&xd.detail.includes('REVIEW → TRIM'),'30.5 XTB Decision Delta regression');assert(td?.type==='ACTION'&&td.detail.includes('REPRICE → SELL'),'30.5 ticket Decision Delta regression');assert(delta.attention>=2,'30.5 meaningful changes must surface');
const empty=decisionDelta30(current,null,now);assert(!empty.initialized&&empty.items.length===0&&empty.current.items.length===current.length,'30.5 first baseline state unsafe');
console.log('KAMIL OS 30.5 RELEASE GATE PASS');
