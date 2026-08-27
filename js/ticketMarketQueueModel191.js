export const TICKET_MARKET_QUEUE_VERSION_191=191;
const daysUntil=date=>{const t=Date.parse(String(date||''));return Number.isFinite(t)?Math.ceil((t-Date.now())/86400000):null};
const status=x=>String(x?.market_status||x?.marketStatus||'').toUpperCase();
const name=x=>String(x?.event_name||x?.eventName||x?.name||x?.id||'Vstupenka');

export function buildTicketMarketQueue191(inventory=[],sources=new Map()){
 const actions=[];
 for(const row of inventory||[]){
  const st=status(row);if(!['LISTED','NOT_LISTED'].includes(st))continue;
  const src=sources?.get?.(row.id)||{},cons=src?.consensus||{};
  const viagogoUrl=row?.viagogo_url||row?.viagogoUrl||null,stubhubUrl=row?.stubhub_url||row?.stubhubUrl||cons?.stubhub_url||null,official=row?.official_url||row?.officialUrl||null;
  const days=daysUntil(row?.event_date||row?.eventDate),ask=Number(row?.ask_each_czk??row?.askEachCzk??0)||null;
  if(st==='NOT_LISTED')actions.push({ticketId:row.id,priority:days!==null&&days<=14?95:82,code:'LIST_NOW',title:`Zalistovat: ${name(row)}`,reason:days===null?'Vstupenka není zalistovaná.':`${days} dní do akce a vstupenka není zalistovaná.`,market:viagogoUrl?'Viagogo':'Viagogo / StubHub'});
  if(st==='LISTED'&&!stubhubUrl)actions.push({ticketId:row.id,priority:days!==null&&days<=14?88:72,code:'FIND_STUBHUB',title:`Najít StubHub: ${name(row)}`,reason:'Aktivní listing nemá ověřený druhý resale market.',market:'StubHub'});
  if(st==='LISTED'&&stubhubUrl)actions.push({ticketId:row.id,priority:days!==null&&days<=7?92:70,code:'COMPARE_MARKETS',title:`Porovnat markety: ${name(row)}`,reason:'Viagogo běží a StubHub event je známý — porovnej cenu, payout a transfer podmínky.',market:'Viagogo + StubHub'});
  if(!official)actions.push({ticketId:row.id,priority:60,code:'FIND_OFFICIAL',title:`Doplnit oficiální prodej: ${name(row)}`,reason:'Bez oficiálního zdroje nevíme, jestli je sektor/event sold out.',market:'Official'});
  if(st==='LISTED'&&!ask)actions.push({ticketId:row.id,priority:96,code:'MISSING_ASK',title:`Doplnit ask cenu: ${name(row)}`,reason:'Listing je aktivní, ale OS nezná tvoji prodejní cenu.',market:'Listing'});
  if(days!==null&&days<=3&&st==='LISTED')actions.push({ticketId:row.id,priority:99,code:'FINAL_REPRICE',title:`Finální repricing: ${name(row)}`,reason:`Do akce zbývají jen ${Math.max(0,days)} dny.`,market:'All'});
 }
 const dedupe=[...new Map(actions.map(x=>[`${x.ticketId}:${x.code}`,x])).values()];
 dedupe.sort((a,b)=>b.priority-a.priority||a.title.localeCompare(b.title,'cs'));
 return{version:191,actions:dedupe,top:dedupe.slice(0,8),counts:{total:dedupe.length,urgent:dedupe.filter(x=>x.priority>=90).length,list:dedupe.filter(x=>x.code==='LIST_NOW').length,crossCheck:dedupe.filter(x=>x.code==='COMPARE_MARKETS'||x.code==='FIND_STUBHUB').length}};
}
