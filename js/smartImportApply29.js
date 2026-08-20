const currency=(v,fallback='CZK')=>{const c=String(v||fallback).toUpperCase().replace(/[^A-Z]/g,'');return c.length===3?c:fallback};
const hash=s=>{let h=2166136261;for(const ch of String(s)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return (h>>>0).toString(36)};
const id=(prefix,key)=>`${prefix}-${hash(key)}`;

function applyXtbSafely(state,items,at){
 state.xtbHub=state.xtbHub||{};state.xtbHub.accounts=state.xtbHub.accounts||{};
 for(const c of items){
  const p={...c.data,importedAt:at},ccy=currency(p.currency);
  let key=Object.keys(state.xtbHub.accounts).find(k=>currency(state.xtbHub.accounts[k]?.currency)===ccy),created=false;
  if(!key){key=`smart-import-${ccy.toLowerCase()}`;state.xtbHub.accounts[key]={currency:ccy,value:0,positions:[],source:'SMART_IMPORT'};created=true}
  const account=state.xtbHub.accounts[key];account.positions=Array.isArray(account.positions)?account.positions:[];
  const i=account.positions.findIndex(x=>String(x.ticker||x.symbol||'').toUpperCase()===p.ticker);
  if(i>=0)account.positions[i]={...account.positions[i],...p};else account.positions.push(p);
  const positionValue=account.positions.reduce((z,x)=>z+(Number(x.value)||0),0);account.positionValue=positionValue;
  if(created||account.source==='SMART_IMPORT')account.value=positionValue;
 }
 state.xtbHub.asOf=at;state.xtbHub.positionCount=Object.values(state.xtbHub.accounts).reduce((z,a)=>z+(a?.positions?.length||0),0);
}

export function applySmartImport(state,plan,{at=new Date().toISOString()}={}){
 state.personalSpending=state.personalSpending||{transactions:[]};state.personalSpending.transactions=Array.isArray(state.personalSpending.transactions)?state.personalSpending.transactions:[];
 state.ticketBook=state.ticketBook||{items:[],watchlist:[]};state.ticketBook.items=Array.isArray(state.ticketBook.items)?state.ticketBook.items:[];
 state.personalAdmin=state.personalAdmin||{items:[]};state.personalAdmin.items=Array.isArray(state.personalAdmin.items)?state.personalAdmin.items:[];
 const xtb=[];
 for(const c of plan.apply||[]){const data={...c.data,importedAt:at};if(c.kind==='SPENDING')state.personalSpending.transactions.push(data);else if(c.kind==='TICKETS')state.ticketBook.items.push(data);else if(c.kind==='ADMIN')state.personalAdmin.items.push(data);else if(c.kind==='XTB')xtb.push(c)}
 if(xtb.length)applyXtbSafely(state,xtb,at);
 state.importCenter=state.importCenter||{history:[]};state.importCenter.history=Array.isArray(state.importCenter.history)?state.importCenter.history:[];
 const historyKey=`${at}|${plan.source}|${plan.fileName}|${plan.total}`;state.importCenter.history.unshift({id:id('import',historyKey),at,source:plan.source,fileName:plan.fileName||null,imported:plan.total,duplicates:plan.duplicateCount||0,rejected:(plan.rejected||[]).length,byKind:{...(plan.byKind||{})}});state.importCenter.history=state.importCenter.history.slice(0,50);
 return {imported:plan.total,duplicates:plan.duplicateCount||0,rejected:(plan.rejected||[]).length,byKind:{...(plan.byKind||{})}};
}

export const xtbImportSafety='CSV pozic nikdy nepřepisuje existující celkovou hodnotu XTB účtu, protože soubor pozic nemusí obsahovat hotovost. Součet importovaných pozic se drží zvlášť jako positionValue.';
