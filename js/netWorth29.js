const n=v=>Number(v||0);
const finite=v=>Number.isFinite(Number(v));
const ccy=v=>String(v||'CZK').toUpperCase();
const active=x=>!['ARCHIVED','PAID','CLOSED'].includes(String(x?.status||'ACTIVE').toUpperCase());
const flow=x=>String(x?.workflow||'HOLD').toUpperCase();
const todayKey=d=>{const x=new Date(d);return Number.isFinite(x.getTime())?x.toISOString().slice(0,10):null};
const yearKey=d=>(todayKey(d)||'').slice(0,4);
const debtPaid=x=>(x?.payments||[]).reduce((sum,p)=>sum+(Number(p?.amount)||0),0);
const debtRemaining=x=>Math.max(0,(Number(x?.amount)||0)-debtPaid(x));

function bucket(map,currency){
 const k=ccy(currency);return map[k]||(map[k]={currency:k,assets:0,liabilities:0,net:0,liquidAssets:0,illiquidAssets:0,automaticAssets:0,manualAssets:0,manualLiabilities:0,sources:[]});
}
function add(map,{currency='CZK',side='ASSET',value=0,liquid=false,manual=false,label='',kind='OTHER',basis='EXPLICIT'}){
 const amount=Math.max(0,n(value));if(!finite(value)||amount<=0)return;
 const b=bucket(map,currency),isLiability=side==='LIABILITY';
 if(isLiability){b.liabilities+=amount;if(manual)b.manualLiabilities+=amount}else{b.assets+=amount;if(liquid)b.liquidAssets+=amount;else b.illiquidAssets+=amount;if(manual)b.manualAssets+=amount;else b.automaticAssets+=amount}
 b.net=b.assets-b.liabilities;b.sources.push({label,kind,side:isLiability?'LIABILITY':'ASSET',value:amount,currency:b.currency,liquid:!!liquid,manual:!!manual,basis});
}
function fxMap(s){return [s?.xtbHub?.report?.fx,s?.xtb?.marketEstimate?.fx,s?.marketEstimate?.fx].filter(x=>x&&typeof x==='object')}
export function netWorthFxRate(s,from,to='CZK'){
 const a=ccy(from),b=ccy(to);if(a===b)return 1;
 for(const m of fxMap(s)){
  const direct=m[`${a}${b}`],reverse=m[`${b}${a}`],dv=Number(direct?.price??direct),rv=Number(reverse?.price??reverse);
  if(Number.isFinite(dv)&&dv>0)return dv;if(Number.isFinite(rv)&&rv>0)return 1/rv;
 }
 return null;
}
function addXtb(s,map){
 const accounts=Object.values(s?.xtbHub?.accounts||{}).filter(x=>x&&finite(x.value)&&n(x.value)>0&&x.currency);
 if(accounts.length){for(const x of accounts)add(map,{currency:x.currency,value:x.value,liquid:true,label:`XTB ${ccy(x.currency)} účet`,kind:'XTB',basis:'ACCOUNT_VALUE'});return}
 add(map,{currency:'CZK',value:s?.xtbReport?.czkValue,liquid:true,label:'XTB CZK účet',kind:'XTB',basis:'ACCOUNT_VALUE'});
 add(map,{currency:'EUR',value:s?.xtbReport?.eurValue,liquid:true,label:'XTB EUR účet',kind:'XTB',basis:'ACCOUNT_VALUE'});
}
function addReceivables(s,map){for(const x of s?.debtBook?.items||[]){if(!active(x))continue;const rem=debtRemaining(x);add(map,{currency:x.currency||'CZK',value:rem,liquid:false,label:`Pohledávka · ${x.person||x.reason||'bez názvu'}`,kind:'RECEIVABLE',basis:'REMAINING'})}}
function addTickets(s,map){
 for(const x of s?.ticketBook?.items||[]){const f=flow(x),currency=x.currency||'CZK';
  if(['HOLD','LISTED'].includes(f))add(map,{currency,value:x.buy,liquid:false,label:`Vstupenky · ${x.name||'akce'}`,kind:'TICKET_INVENTORY',basis:'PURCHASE_COST'});
  else if(f==='PAYOUT WAIT'&&n(x.sell)>0)add(map,{currency,value:x.sell,liquid:false,label:`Čekající payout · ${x.name||'akce'}`,kind:'TICKET_PAYOUT',basis:'RECORDED_SELL'});
 }
}
function addManual(s,map){for(const x of s?.netWorthBook?.items||[]){if(!active(x)||!finite(x.value)||n(x.value)<=0)continue;add(map,{currency:x.currency||'CZK',side:String(x.side||'ASSET').toUpperCase()==='LIABILITY'?'LIABILITY':'ASSET',value:x.value,liquid:x.liquid===true,manual:true,label:x.title||'Ruční položka',kind:x.kind||'OTHER',basis:'MANUAL_VALUE'})}}
function aggregateBase(s,byCurrency,baseCurrency){
 const rows=Object.values(byCurrency).filter(x=>x.assets>0||x.liabilities>0),missing=[],rates={},totals={assets:0,liabilities:0,net:0};
 for(const row of rows){const rate=netWorthFxRate(s,row.currency,baseCurrency);if(rate===null){missing.push(row.currency);continue}rates[row.currency]=rate;totals.assets+=row.assets*rate;totals.liabilities+=row.liabilities*rate;totals.net+=row.net*rate}
 return {currency:baseCurrency,complete:missing.length===0,missingCurrencies:missing,rates,assets:missing.length?null:totals.assets,liabilities:missing.length?null:totals.liabilities,net:missing.length?null:totals.net};
}
function normalizeHistory(s){return (s?.netWorthBook?.history||[]).filter(x=>x&&todayKey(x.at)&&x.byCurrency&&typeof x.byCurrency==='object').slice().sort((a,b)=>new Date(b.at)-new Date(a.at))}
function deltaMap(current,snapshot){
 if(!snapshot)return null;const currencies=[...new Set([...Object.keys(current),...Object.keys(snapshot.byCurrency||{})])].sort(),out={};
 for(const c of currencies){const now=n(current[c]?.net),before=n(snapshot.byCurrency?.[c]?.net??snapshot.byCurrency?.[c]);out[c]={currency:c,current:now,previous:before,delta:now-before,pct:before!==0?((now-before)/Math.abs(before))*100:null}}
 return out;
}
function historyComparisons(history,current,now){
 const day=todayKey(now),year=yearKey(now),prior=history.find(x=>todayKey(x.at)<day)||null,yearRows=history.filter(x=>yearKey(x.at)===year).slice().sort((a,b)=>new Date(a.at)-new Date(b.at)),ytdBase=yearRows[0]||null;
 return {lastSnapshot:history[0]||null,priorSnapshot:prior,deltaFromPrior:deltaMap(current,prior),ytdBase,ytdDelta:ytdBase?deltaMap(current,ytdBase):null};
}
export function trueNetWorth(s={},now=new Date()){
 const byCurrency={},baseCurrency=ccy(s?.financePlan?.currency||'CZK');
 add(byCurrency,{currency:baseCurrency,value:s?.financePlan?.cashNow,liquid:true,label:'Hotovost / účty v plánu',kind:'CASH',basis:'FINANCE_PLAN'});
 addXtb(s,byCurrency);addReceivables(s,byCurrency);addTickets(s,byCurrency);addManual(s,byCurrency);
 for(const b of Object.values(byCurrency)){b.net=b.assets-b.liabilities;b.sources.sort((a,b)=>b.value-a.value||a.label.localeCompare(b.label,'cs'))}
 const base=aggregateBase(s,byCurrency,baseCurrency),history=normalizeHistory(s),comparisons=historyComparisons(history,byCurrency,now),manualLiabilities=(s?.netWorthBook?.items||[]).filter(x=>active(x)&&String(x.side||'ASSET').toUpperCase()==='LIABILITY').length,staleManual=(s?.netWorthBook?.items||[]).filter(x=>active(x)&&x.updatedAt&&((new Date(now)-new Date(x.updatedAt))/86400000)>90).length;
 const hasTicketBookValue=Object.values(byCurrency).some(x=>x.sources.some(y=>y.kind==='TICKET_INVENTORY')),gaps=[];
 if(!manualLiabilities)gaps.push('Nejsou uložené žádné ruční závazky. Pokud máš hypotéku, úvěr nebo kreditku, doplň je, jinak čisté jmění bude nadhodnocené.');
 if(base.missingCurrencies.length)gaps.push(`Chybí skutečný FX kurz pro ${base.missingCurrencies.join(', ')} → ${baseCurrency}; společný součet proto nezobrazuji.`);
 if(hasTicketBookValue)gaps.push('Aktivní vstupenky jsou oceněné pořizovací cenou, nikoli odhadovanou budoucí prodejní cenou.');
 if(staleManual)gaps.push(`${staleManual} ruční ${staleManual===1?'ocenění je':'ocenění jsou'} starší než 90 dní.`);
 return {asOf:new Date(now).toISOString(),baseCurrency,byCurrency,currencies:Object.keys(byCurrency).sort(),base,history,comparisons,gaps,coverage:{manualItems:(s?.netWorthBook?.items||[]).filter(active).length,manualLiabilities,historySnapshots:history.length},note:'True Net Worth používá pouze explicitně uložené hodnoty. Hotovost, XTB a pohledávky bere z existujících dat; vstupenky drží v pořizovací ceně a ruční majetek/závazky jen v zadané hodnotě. Měny se nikdy nesčítají bez skutečného FX kurzu.'};
}
export function netWorthSnapshot(s={},now=new Date()){
 const r=trueNetWorth(s,now),byCurrency={};for(const [c,v] of Object.entries(r.byCurrency))byCurrency[c]={assets:v.assets,liabilities:v.liabilities,net:v.net};
 return {id:`networth-${todayKey(now)}`,at:new Date(now).toISOString(),date:todayKey(now),byCurrency,baseCurrency:r.baseCurrency,baseNet:r.base.complete?r.base.net:null,baseComplete:r.base.complete};
}
export function upsertNetWorthSnapshot(s,now=new Date()){
 s.netWorthBook=s.netWorthBook||{items:[],history:[]};s.netWorthBook.history=Array.isArray(s.netWorthBook.history)?s.netWorthBook.history:[];const snap=netWorthSnapshot(s,now),i=s.netWorthBook.history.findIndex(x=>todayKey(x.at||x.date)===snap.date);if(i>=0)s.netWorthBook.history[i]=snap;else s.netWorthBook.history.unshift(snap);s.netWorthBook.history=s.netWorthBook.history.sort((a,b)=>new Date(b.at)-new Date(a.at)).slice(0,120);return snap;
}
