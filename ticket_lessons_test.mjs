const {ticketLessons}=await import('./js/ticketLessons25.js');
const assert=(x,m)=>{if(!x)throw new Error(m)};

const state={ticketBook:{
 history:[
  {id:'h1',name:'Sparta vs Slavia - 116',qty:2,buy:2000,sell:3200,fees:200},
  {id:'h2',name:'Sparta vs Teplice - D1',qty:6,buy:6000,sell:4800,fees:0},
  {id:'h3',name:'Bruno Mars - Amsterdam',qty:2,buy:3000,sell:5000,fees:200},
  {id:'h4',name:'ASAP - 415',qty:6,buy:9000,sell:7200,fees:0},
  {id:'open',name:'Future event',qty:4,buy:4000,sell:0,fees:0}
 ],
 items:[
  {id:'i1',name:'Clash 18',qty:2,buy:2000,sell:3000,fees:100,workflow:'PAYOUT RECEIVED'},
  {id:'i2',name:'Open listing',qty:5,buy:5000,sell:0,workflow:'LISTED'}
 ]
}};
const x=ticketLessons(state);
assert(x.trades===5,'only realized non-zero sell trades are counted');
assert(x.totalProfit===900,'realized profit must include fees and negative trades');
assert(Math.round(x.hitRate)===60,'win rate');
assert(x.categories.some(c=>c.category==='Fotbal'),'football classification');
assert(x.categories.some(c=>c.category==='Koncerty'),'concert classification');
assert(x.categories.some(c=>c.category==='Combat'),'combat classification');
assert(!x.categories.some(c=>c.category==='Ostatní'&&c.trades>0),'open trades must not leak into lessons');
assert(x.lessons.length>=1&&x.lessons.length<=3,'bounded actionable lessons');
assert(x.evidence.includes('Pouze realizované'),'evidence disclosure');
console.log('TICKET LESSONS QA PASS');
