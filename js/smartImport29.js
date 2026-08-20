const norm=v=>String(v??'').replace(/^\uFEFF/,'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('cs-CZ').replace(/[^a-z0-9%]+/g,' ').trim();
const compact=v=>norm(v).replace(/\s+/g,'');
const has=v=>v!==null&&v!==undefined&&String(v).trim()!=='';
const hash=s=>{let h=2166136261;for(const ch of String(s)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return (h>>>0).toString(36)};
const id=(prefix,key)=>`${prefix}-${hash(key)}`;
const SOURCE_LABELS={SPENDING:'Bankovní transakce',REVOLUT:'Revolut',XTB:'XTB pozice',TICKETS:'Vstupenky',ADMIN:'Osobní administrativa'};

function splitLine(line,delimiter){
 const out=[];let cur='',quoted=false;
 for(let i=0;i<line.length;i++){
  const ch=line[i];
  if(ch==='"'){
   if(quoted&&line[i+1]==='"'){cur+='"';i++;continue}
   quoted=!quoted;continue;
  }
  if(ch===delimiter&&!quoted){out.push(cur.trim());cur='';continue}
  cur+=ch;
 }
 out.push(cur.trim());return out;
}
function delimiterScore(line,d){let quoted=false,count=0;for(let i=0;i<line.length;i++){const ch=line[i];if(ch==='"'){if(quoted&&line[i+1]==='"'){i++;continue}quoted=!quoted}else if(ch===d&&!quoted)count++;}return count;}
function detectDelimiter(line){return ['\t',';',','].map(d=>[d,delimiterScore(line,d)]).sort((a,b)=>b[1]-a[1])[0]?.[0]||';'}

export function parseDelimited(text=''){
 const clean=String(text||'').replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n').trim();
 if(!clean)return {headers:[],rows:[],delimiter:null};
 if(clean[0]==='['||clean[0]==='{'){
  try{
   const raw=JSON.parse(clean),arr=Array.isArray(raw)?raw:(raw.rows||raw.data||raw.transactions||raw.positions||raw.items||[]);
   if(Array.isArray(arr)&&arr.every(x=>x&&typeof x==='object'&&!Array.isArray(x))){
    const headers=[...new Set(arr.flatMap(x=>Object.keys(x)))];
    return {headers,rows:arr.map((x,i)=>({...x,__row:i+2})),delimiter:'json'};
   }
  }catch{}
 }
 const lines=clean.split('\n').filter(x=>x.trim());if(!lines.length)return {headers:[],rows:[],delimiter:null};
 const delimiter=detectDelimiter(lines[0]),headers=splitLine(lines[0],delimiter).map(x=>x.trim()),keys=headers.map((x,i)=>norm(x)||`column ${i+1}`),rows=[];
 for(let i=1;i<lines.length;i++){
  const values=splitLine(lines[i],delimiter);if(values.every(v=>!has(v)))continue;
  const row={__row:i+1};for(let j=0;j<keys.length;j++)row[keys[j]]=values[j]??'';rows.push(row);
 }
 return {headers,rows,delimiter};
}

const aliases={
 date:['date','datum','completed date','completion date','created date','booking date','transaction date','time','datum transakce'],
 description:['description','popis','merchant','merchant name','beneficiary','counterparty','name','nazev','title','reference','note','poznamka'],
 amount:['amount','castka','částka','value','hodnota','total','total amount','net amount'],
 debit:['debit','outflow','withdrawal','odchozi','výdaj','vydaj'],credit:['credit','inflow','deposit','prichozi','příjem','prijem'],
 currency:['currency','mena','měna','ccy'],type:['type','typ','transaction type'],category:['category','kategorie','asset class','instrument type'],
 ticker:['ticker','symbol','instrument','instrument symbol','isin'],volume:['volume','quantity','qty','kusy','shares','units'],
 profitPct:['net profit %','profit %','p l %','p/l %','return %','profit pct'],
 event:['event','event name','akce','nazev akce','název akce','match','concert'],sector:['sector','section','sektor','block','tribuna'],
 buy:['buy','buy price','purchase price','nakup','nákup','cost','cost price'],listPrice:['list price','listing price','sell price','prodejni cena','prodejní cena'],workflow:['workflow','status'],
 provider:['provider','dodavatel','supplier','vendor','company','spolecnost','společnost'],cadence:['cadence','periodicity','periodicita','frequency','frekvence'],nextDue:['next due','due date','splatnost','dalsi splatnost','další splatnost']
};
function get(row,names){for(const a of names){const k=norm(a);if(Object.prototype.hasOwnProperty.call(row,k)&&has(row[k]))return row[k]}return null}
export function parseAmount(v){
 if(!has(v))return null;let s=String(v).trim().replace(/\u00a0/g,' ').replace(/[A-Za-zKč€$£]/g,'').replace(/\s/g,'');let neg=false;
 if(/^\(.*\)$/.test(s)){neg=true;s=s.slice(1,-1)}
 if(s.endsWith('-')){neg=true;s=s.slice(0,-1)}
 const comma=s.lastIndexOf(','),dot=s.lastIndexOf('.');
 if(comma>=0&&dot>=0){const dec=comma>dot?',':'.',th=dec===','?'.':',';s=s.split(th).join('').replace(dec,'.')}
 else if(comma>=0){const digits=s.length-comma-1;s=digits>0&&digits<=2?s.replace(/\./g,'').replace(',','.'):s.replace(/,/g,'')}
 else if(dot>=0){const digits=s.length-dot-1;if(!(digits>0&&digits<=2))s=s.replace(/\./g,'')}
 s=s.replace(/[^0-9+\-.]/g,'');const n=Number(s);return Number.isFinite(n)?(neg?-Math.abs(n):n):null;
}
export function parseDate(v){
 if(!has(v))return null;const s=String(v).trim();let m;
 if((m=s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/))){const d=new Date(Number(m[1]),Number(m[2])-1,Number(m[3]));return Number.isFinite(d.getTime())?`${m[1]}-${String(m[2]).padStart(2,'0')}-${String(m[3]).padStart(2,'0')}`:null}
 if((m=s.match(/^(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})/))){const d=new Date(Number(m[3]),Number(m[2])-1,Number(m[1]));return Number.isFinite(d.getTime())?`${m[3]}-${String(m[2]).padStart(2,'0')}-${String(m[1]).padStart(2,'0')}`:null}
 const d=new Date(s);return Number.isFinite(d.getTime())?d.toISOString().slice(0,10):null;
}
function currency(v,fallback='CZK'){const c=String(v||fallback).toUpperCase().replace(/[^A-Z]/g,'');return c.length===3?c:fallback}
function cadence(v){const n=norm(v);if(n.includes('week')||n.includes('tyden'))return 'WEEKLY';if(n.includes('quarter')||n.includes('ctvrt'))return 'QUARTERLY';if(n.includes('semi')||n.includes('half')||n.includes('pololet'))return 'SEMIANNUAL';if(n.includes('year')||n.includes('rok')||n.includes('annual'))return 'YEARLY';if(n.includes('month')||n.includes('mesic'))return 'MONTHLY';return 'ONCE'}
function spendingCategory(description,type=''){
 const s=norm(`${description} ${type}`);if(/hypotek|najem|rent|energie|electric|gas|water|vodar|internet/.test(s))return 'BYDLENÍ';if(/lidl|albert|tesco|kaufland|rohlik|restaurant|restaur|food|mcdonald|kfc|cafe|coffee/.test(s))return 'JÍDLO';if(/shell|omv|benzin|fuel|uber|bolt|parking|parkov|train|vlak|bus|doprava/.test(s))return 'DOPRAVA';if(/netflix|spotify|icloud|google one|subscription|predplat/.test(s))return 'PŘEDPLATNÉ';if(/lekarn|pharmacy|doctor|health|zdrav/.test(s))return 'ZDRAVÍ';if(/transfer|prevod|převod|exchange|směna|smena/.test(s))return 'PŘEVOD';return 'NEZAŘAZENO';
}
function forcedSource(v){const x=String(v||'AUTO').toUpperCase();return ['SPENDING','REVOLUT','XTB','TICKETS','ADMIN'].includes(x)?x:null}
export function detectImportSource(headers=[],fileName='',forced='AUTO'){
 const f=forcedSource(forced);if(f)return f;
 const h=headers.map(norm),joined=h.join('|'),name=norm(fileName);
 if(/revolut/.test(name)||h.includes('completed date')||h.includes('started date'))return 'REVOLUT';
 if((/ticker|symbol|instrument/.test(joined))&&(/market value|volume|quantity|net profit|p l/.test(joined)))return 'XTB';
 if(/event|akce|sector|sektor/.test(joined)&&/qty|quantity|kusy|buy|purchase/.test(joined))return 'TICKETS';
 if(/provider|dodavatel|cadence|periodicita|next due|splatnost/.test(joined))return 'ADMIN';
 if(/amount|castka|debit|credit|outflow|inflow/.test(joined)&&/date|datum/.test(joined))return 'SPENDING';
 return 'SPENDING';
}
function spendingCandidate(row,source){
 const date=parseDate(get(row,aliases.date)),description=String(get(row,aliases.description)||'Transakce').trim(),ccy=currency(get(row,aliases.currency));let amount=parseAmount(get(row,aliases.amount));
 if(amount===null){const cr=parseAmount(get(row,aliases.credit))||0,db=parseAmount(get(row,aliases.debit))||0;if(cr||db)amount=Math.abs(cr)-Math.abs(db)}
 if(!date||amount===null)return {error:'Chybí platné datum nebo částka.'};
 const type=get(row,aliases.type)||'',key=`spending|${date}|${amount.toFixed(2)}|${ccy}|${compact(description)}`;
 return {kind:'SPENDING',key,data:{id:id('txn',key),date,description,amount,currency:ccy,category:spendingCategory(description,type),source,importKey:key,importedAt:null}};
}
function xtbCandidate(row){
 const ticker=String(get(row,aliases.ticker)||'').trim().toUpperCase(),name=String(get(row,aliases.description)||ticker).trim(),ccy=currency(get(row,aliases.currency)),value=parseAmount(get(row,['market value','position value','value','hodnota','amount','castka'])),volume=parseAmount(get(row,aliases.volume)),profit=parseAmount(get(row,aliases.profitPct));
 if(!ticker||value===null)return {error:'Chybí ticker/symbol nebo hodnota pozice.'};
 const rawCategory=String(get(row,aliases.category)||'').toUpperCase(),category=/ETF/.test(rawCategory)?'ETF':/BOND/.test(rawCategory)?'BOND':'STOCK',key=`xtb|${ccy}|${ticker}`;
 return {kind:'XTB',key,data:{ticker,name,category,currency:ccy,value,volume:volume===null?null:volume,net_profit_pct:profit===null?null:profit,importKey:key,importSource:'SMART_IMPORT'}};
}
function ticketCandidate(row){
 const name=String(get(row,aliases.event)||get(row,aliases.description)||'').trim(),date=parseDate(get(row,aliases.date)),sector=String(get(row,aliases.sector)||'').trim(),qty=Math.max(1,Math.round(parseAmount(get(row,aliases.volume))||1)),buy=parseAmount(get(row,aliases.buy)),listPrice=parseAmount(get(row,aliases.listPrice)),ccy=currency(get(row,aliases.currency)),wf=String(get(row,aliases.workflow)||'HOLD').toUpperCase();
 if(!name||!date)return {error:'Chybí název akce nebo datum.'};const workflow=['HOLD','LISTED','SOLD'].includes(wf)?wf:'HOLD',key=`ticket|${date}|${compact(name)}|${compact(sector)}|${qty}`;
 return {kind:'TICKETS',key,data:{id:id('ticket',key),name,date,sector:sector||null,qty,buy:buy===null?0:buy,listPrice:listPrice!==null&&listPrice>0?listPrice:null,currency:ccy,workflow,importKey:key,importSource:'SMART_IMPORT'}};
}
function adminCandidate(row){
 const title=String(get(row,['title','name','nazev','název','description','popis'])||'').trim(),provider=String(get(row,aliases.provider)||'').trim(),amount=parseAmount(get(row,aliases.amount)),ccy=currency(get(row,aliases.currency)),due=parseDate(get(row,aliases.nextDue)||get(row,aliases.date)),cad=cadence(get(row,aliases.cadence)),cat=String(get(row,aliases.category)||'PAYMENT').toUpperCase();
 if(!title)return {error:'Chybí název položky.'};const category=['PAYMENT','SUBSCRIPTION','UTILITY','LOAN','HOME','FEE','INSURANCE','VEHICLE','DOCUMENT','OTHER'].includes(cat)?cat:'PAYMENT',key=`admin|${compact(title)}|${compact(provider)}`;
 return {kind:'ADMIN',key,data:{id:id('personal',key),title,provider:provider||null,amount:amount===null?null:Math.abs(amount),currency:ccy,cadence:cad,nextDue:due,status:'ACTIVE',category,importKey:key,importSource:'SMART_IMPORT'}};
}

export function previewImport(text,{fileName='',source='AUTO'}={}){
 const parsed=parseDelimited(text),detected=detectImportSource(parsed.headers,fileName,source),accepted=[],rejected=[],warnings=[];
 if(!parsed.rows.length)return {source:detected,label:SOURCE_LABELS[detected]||detected,fileName,headers:parsed.headers,accepted,rejected:[{row:0,error:'Soubor neobsahuje datové řádky.'}],warnings,delimiter:parsed.delimiter};
 for(const row of parsed.rows){let c;if(detected==='XTB')c=xtbCandidate(row);else if(detected==='TICKETS')c=ticketCandidate(row);else if(detected==='ADMIN')c=adminCandidate(row);else c=spendingCandidate(row,detected);if(c.error)rejected.push({row:row.__row||0,error:c.error});else accepted.push({...c,row:row.__row||0});}
 if(rejected.length)warnings.push(`${rejected.length} řádků nelze bezpečně použít a zůstane mimo import.`);
 if(detected==='SPENDING'||detected==='REVOLUT')warnings.push('Kategorie výdajů jsou pouze průhledná pravidlová předvolba; po importu je lze upravit.');
 if(detected==='XTB')warnings.push('Import XTB aktualizuje jen pozice ze souboru. Žádný obchod se neprovede.');
 return {source:detected,label:SOURCE_LABELS[detected]||detected,fileName,headers:parsed.headers,accepted,rejected,warnings,delimiter:parsed.delimiter};
}
function existingKeys(state,kind){
 if(kind==='SPENDING')return new Set((state.personalSpending?.transactions||[]).map(x=>x.importKey||`spending|${x.date}|${Number(x.amount||0).toFixed(2)}|${currency(x.currency)}|${compact(x.description)}`));
 if(kind==='TICKETS')return new Set((state.ticketBook?.items||[]).map(x=>x.importKey||`ticket|${parseDate(x.date)}|${compact(x.name)}|${compact(x.sector)}|${Math.max(1,Number(x.qty||1))}`));
 if(kind==='ADMIN')return new Set((state.personalAdmin?.items||[]).map(x=>x.importKey||`admin|${compact(x.title)}|${compact(x.provider)}`));
 if(kind==='XTB'){const out=new Set();for(const a of Object.values(state.xtbHub?.accounts||{}))for(const p of a?.positions||[])out.add(p.importKey||`xtb|${currency(p.currency||a.currency)}|${String(p.ticker||p.symbol||'').toUpperCase()}`);return out}
 return new Set();
}
export function buildImportPlan(state={},preview={accepted:[]}){
 const groups={};for(const c of preview.accepted||[]){groups[c.kind]=groups[c.kind]||[];groups[c.kind].push(c)}
 const apply=[],duplicates=[];for(const [kind,items] of Object.entries(groups)){const seen=existingKeys(state,kind);for(const c of items){if(seen.has(c.key)){duplicates.push(c);continue}seen.add(c.key);apply.push(c)}}
 const byKind={};for(const c of apply)byKind[c.kind]=(byKind[c.kind]||0)+1;
 return {source:preview.source,fileName:preview.fileName||'',apply,duplicates,rejected:preview.rejected||[],warnings:preview.warnings||[],byKind,total:apply.length,duplicateCount:duplicates.length};
}
function applyXtb(state,items,at){
 state.xtbHub=state.xtbHub||{};state.xtbHub.accounts=state.xtbHub.accounts||{};
 for(const c of items){const p={...c.data,importedAt:at},ccy=p.currency;let key=Object.keys(state.xtbHub.accounts).find(k=>currency(state.xtbHub.accounts[k]?.currency)===ccy);if(!key){key=`smart-import-${ccy.toLowerCase()}`;state.xtbHub.accounts[key]={currency:ccy,value:0,positions:[],source:'SMART_IMPORT'}}const account=state.xtbHub.accounts[key];account.positions=Array.isArray(account.positions)?account.positions:[];const i=account.positions.findIndex(x=>String(x.ticker||x.symbol||'').toUpperCase()===p.ticker);if(i>=0)account.positions[i]={...account.positions[i],...p};else account.positions.push(p);account.value=account.positions.reduce((z,x)=>z+(Number(x.value)||0),0)}
 state.xtbHub.asOf=at;state.xtbHub.source='SMART_IMPORT';state.xtbHub.positionCount=Object.values(state.xtbHub.accounts).reduce((z,a)=>z+(a?.positions?.length||0),0);
}
export function applyImportPlan(state,plan,{at=new Date().toISOString()}={}){
 state.personalSpending=state.personalSpending||{transactions:[]};state.personalSpending.transactions=Array.isArray(state.personalSpending.transactions)?state.personalSpending.transactions:[];
 state.ticketBook=state.ticketBook||{items:[],watchlist:[]};state.ticketBook.items=Array.isArray(state.ticketBook.items)?state.ticketBook.items:[];
 state.personalAdmin=state.personalAdmin||{items:[]};state.personalAdmin.items=Array.isArray(state.personalAdmin.items)?state.personalAdmin.items:[];
 const xtb=[];for(const c of plan.apply||[]){const data={...c.data,importedAt:at};if(c.kind==='SPENDING')state.personalSpending.transactions.push(data);else if(c.kind==='TICKETS')state.ticketBook.items.push(data);else if(c.kind==='ADMIN')state.personalAdmin.items.push(data);else if(c.kind==='XTB')xtb.push(c)}if(xtb.length)applyXtb(state,xtb,at);
 state.importCenter=state.importCenter||{history:[]};state.importCenter.history=Array.isArray(state.importCenter.history)?state.importCenter.history:[];const historyKey=`${at}|${plan.source}|${plan.fileName}|${plan.total}`;state.importCenter.history.unshift({id:id('import',historyKey),at,source:plan.source,fileName:plan.fileName||null,imported:plan.total,duplicates:plan.duplicateCount||0,rejected:(plan.rejected||[]).length,byKind:{...(plan.byKind||{})}});state.importCenter.history=state.importCenter.history.slice(0,50);
 return {imported:plan.total,duplicates:plan.duplicateCount||0,rejected:(plan.rejected||[]).length,byKind:{...(plan.byKind||{})}};
}
export const smartImportSafetyNote='Import je vždy dvoukrokový: nejdřív náhled, potom výslovné potvrzení. Neplatné řádky se zahodí, duplicity se znovu nevloží, různé měny se nesčítají a žádný XTB ani ticket obchod se automaticky neprovede.';
