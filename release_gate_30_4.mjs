import fs from 'fs';
const assert=(x,m)=>{if(!x)throw new Error(m)};
const {buildPersonalToday}=await import('./js/personalToday26.js');
const {decisionExplain30}=await import('./js/decisionExplain30.js');
const {decisionNext30}=await import('./js/decisionNext30.js');
const meta=fs.readFileSync('js/releaseMeta.js','utf8'),config=fs.readFileSync('js/config.js','utf8'),html=fs.readFileSync('index.html','utf8'),sw=fs.readFileSync('sw.js','utf8');
assert(meta.includes("APP_VERSION='30.4.0'")&&meta.includes("APP_RELEASE='30.4'"),'30.4 release metadata mismatch');
assert(config.includes('SCHEMA_VERSION = 42'),'30.4 schema mismatch');
assert(html.includes('./js/decisionExplainUi30.js')&&html.includes('Kamil OS 30.4'),'30.4 shell runtime/version missing');
assert(sw.includes('kamil-os-30.4.0-shell-r1')&&sw.includes('decisionNext30.js'),'30.4 PWA Next Trigger runtime missing');

const now=new Date('2026-08-20T10:00:00+02:00');
const s={financePlan:{currency:'CZK',cashNow:200000,reserveFloor:50000,cashflow:[]},tasks:[{id:'personal',title:'Osobní úkol',area:'Osobní',status:'UDĚLAT',due:'2026-08-21'}],personalAdmin:{items:[]},familyHome:{members:[]},assetBook:{items:[]},emergencyFile:{contacts:[],assets:[]},calendar:{events:[]},debtBook:{items:[]},audit:[],xtbHub:{asOf:'2026-08-20T08:00:00Z',accounts:{czk:{currency:'CZK',value:100000,positions:[{ticker:'WDAY',name:'Workday',category:'STOCK',value:10000,net_profit_pct:45}]}}},xtbStrategy:{closedTickers:{},overrides:{}},ticketBook:{items:[{id:'ticket-1',name:'Test koncert',workflow:'LISTED',date:'2026-08-21',qty:1,buy:1000,listPrice:1800,floorPrice:1200}],watchlist:[]}};
const before=JSON.stringify(s),decisions=buildPersonalToday(s,now);assert(JSON.stringify(s)===before,'30.4 decision build mutated state');
for(const d of decisions){const e=decisionExplain30(d);assert(e.score===d.priority&&e.score>=0&&e.score<=100,'30.4 explanation changed score')}
const xtb=decisions.find(x=>x.id==='WDAY'),ticket=decisions.find(x=>x.id==='ticket-1'),personal=decisions.find(x=>x.title==='Osobní úkol');
assert(xtb?.when&&xtb?.buyRule&&xtb?.sellRule,'30.4 XTB trigger fields missing');assert(decisionNext30(xtb).rows.length===3,'30.4 XTB Next Trigger incomplete');
assert(ticket?.when&&ticket?.buyRule&&ticket?.sellRule,'30.4 ticket trigger fields missing');assert(decisionNext30(ticket).hasStructuredTrigger,'30.4 ticket Next Trigger missing');
assert(personal&&!decisionNext30(personal).hasStructuredTrigger,'30.4 must not invent personal trigger');
console.log('KAMIL OS 30.4 RELEASE GATE PASS');
