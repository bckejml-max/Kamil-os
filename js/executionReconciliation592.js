import {store} from './state.js';
import {h,modal} from './utils.js';
import {actionFingerprint591,latestExecutionReceipt591,receiptRefreshInstruction591} from './executionReceipt591.js';

const A=v=>Array.isArray(v)?v:[];
const U=v=>String(v||'').toUpperCase();
const first=(...v)=>v.find(x=>x!==undefined&&x!==null&&x!=='')??null;
const num=v=>{if(v===null||v===undefined||v==='')return null;const n=Number(v);return Number.isFinite(n)?n:null};
const positive=v=>{const n=num(v);return n!==null&&n>0?n:null};
const approx=(a,b,t=.001)=>{const x=num(a),y=num(b);if(x===null||y===null)return false;return Math.abs(x-y)<=Math.max(.0001,Math.abs(y)*t)};
const parse=raw=>{try{return JSON.parse(raw||'{}')||{}}catch{return{}}};
const fmtQty=v=>num(v)===null?'—':Number(v).toLocaleString('cs-CZ',{maximumFractionDigits:4});
const fmtPrice=(v,c='CZK')=>{const n=num(v);if(n===null)return'—';try{return new Intl.NumberFormat('cs-CZ',{style:'currency',currency:U(c||'CZK'),maximumFractionDigits:U(c)==='CZK'?0:2}).format(n)}catch{return`${n.toLocaleString('cs-CZ')} ${U(c||'CZK')}`}};
const labels={CONFIRMED:'POTVRZENO',PARTIAL:'ČÁSTEČNĚ',MISMATCH:'NESOUHLASÍ',WAIT_REFRESH:'ČEKÁ NA REFRESH'};
const tones={CONFIRMED:'good',PARTIAL:'warn',MISMATCH:'bad',WAIT_REFRESH:'warn'};

function actionForReceipt(r={}){
 if(U(r.domain)==='XTB')return{domain:'XTB',ticker:r.ticker||String(r.key||'').replace(/^XTB:/,'')};
 return{domain:'TICKET',id:first(r.idRef,String(r.key||'').replace(/^TICKET:/,''))};
}
function result(receipt,code,reason,expected,observed,nextStep,before,current,sourceChanged){
 return{receiptId:receipt.id||null,key:receipt.key||null,domain:U(receipt.domain),verdict:U(receipt.verdict),instruction:receipt.instruction||receipt.key||'Ruční market akce',at:receipt.at||null,currency:U(receipt.currency||'CZK'),actualQty:num(receipt.actualQty),actualPrice:num(receipt.actualPrice),code,status:labels[code],tone:tones[code],reason,expected,observed,nextStep,before,current,sourceChanged};
}
function wait(receipt,before,current){
 const action=actionForReceipt(receipt),next=receiptRefreshInstruction591(action);
 return result(receipt,'WAIT_REFRESH','Zdrojová data jsou stále stejná jako při potvrzení ruční akce.','Nový import / aktualizovaný ticket stav','Zdrojový fingerprint se nezměnil.',next,before,current,false);
}
function xtbReceipt(receipt,before,current,sourceChanged){
 if(!sourceChanged)return wait(receipt,before,current);
 const action=U(receipt.verdict),beforeQty=num(before.qty),rawCurrent=num(current.qty),currentQty=rawCurrent===null&&['SELL','TRIM'].includes(action)?0:rawCurrent,actual=positive(receipt.actualQty);
 const refresh=`XTB data se změnila (${first(current.hubAsOf,current.reportAsOf,'nový stav')}).`;
 if(beforeQty===null||currentQty===null)return result(receipt,'PARTIAL','Nová XTB data existují, ale import neobsahuje dost údajů o množství pro přesné spárování.',actual?`${action} ${fmtQty(actual)} ks`:`Směr ${action}`,`${refresh} Množství před/po nelze spolehlivě určit.`,'Ověř historii obchodu v XTB nebo nahraj import s množstvím pozice; do té doby stejný krok neopakuj.',before,current,true);
 if(action==='BUY'){
  if(actual!==null){const expected=beforeQty+actual;if(currentQty>=expected||approx(currentQty,expected))return result(receipt,'CONFIRMED',`Nový import obsahuje alespoň očekávané navýšení o ${fmtQty(actual)} ks.`,`≥ ${fmtQty(expected)} ks`,`${fmtQty(currentQty)} ks`,'Receipt je potvrzen novým XTB stavem. Commander může rozhodovat z aktualizované pozice.',before,current,true);if(currentQty>beforeQty)return result(receipt,'PARTIAL','Pozice vzrostla správným směrem, ale méně než uvádí execution receipt.',`${fmtQty(beforeQty)} → ${fmtQty(expected)} ks`,`${fmtQty(beforeQty)} → ${fmtQty(currentQty)} ks`,'Ověř skutečně provedené množství a nový XTB import; stejný BUY zatím neopakuj.',before,current,true)}
  else if(currentQty>beforeQty)return result(receipt,'PARTIAL','Import potvrzuje navýšení pozice, ale receipt nemá skutečné množství, takže velikost nelze přesně spárovat.','Vyšší množství než před akcí',`${fmtQty(beforeQty)} → ${fmtQty(currentQty)} ks`,'Ověř execution množství; poté můžeš receipt případně opravit přes Undo a nový check-in.',before,current,true);
  return result(receipt,'MISMATCH','XTB zdroj se obnovil, ale množství pozice nepotvrzuje ručně zaznamenaný BUY.',actual?`Alespoň ${fmtQty(beforeQty+actual)} ks`:`Více než ${fmtQty(beforeQty)} ks`,`${fmtQty(currentQty)} ks`,'Zkontroluj XTB historii obchodu/import. Stejný BUY znovu neprováděj, dokud není jasný skutečný stav.',before,current,true);
 }
 if(['SELL','TRIM'].includes(action)){
  if(actual!==null){const expected=Math.max(0,beforeQty-actual);if(currentQty<=expected||approx(currentQty,expected))return result(receipt,'CONFIRMED',`Nový import obsahuje alespoň očekávanou redukci o ${fmtQty(actual)} ks.`,`≤ ${fmtQty(expected)} ks`,`${fmtQty(currentQty)} ks`,'Receipt je potvrzen novým XTB stavem. Commander může rozhodovat z aktualizované pozice.',before,current,true);if(currentQty<beforeQty)return result(receipt,'PARTIAL','Pozice klesla správným směrem, ale méně než uvádí execution receipt.',`${fmtQty(beforeQty)} → ${fmtQty(expected)} ks`,`${fmtQty(beforeQty)} → ${fmtQty(currentQty)} ks`,'Ověř skutečně prodané množství a nový XTB import; další SELL/TRIM zatím neopakuj.',before,current,true)}
  else if(currentQty<beforeQty)return result(receipt,'PARTIAL','Import potvrzuje redukci pozice, ale receipt nemá skutečné množství, takže velikost nelze přesně spárovat.','Nižší množství než před akcí',`${fmtQty(beforeQty)} → ${fmtQty(currentQty)} ks`,'Ověř execution množství; poté můžeš receipt případně opravit přes Undo a nový check-in.',before,current,true);
  return result(receipt,'MISMATCH','XTB zdroj se obnovil, ale množství pozice nepotvrzuje ručně zaznamenaný prodej/redukci.',actual?`Nejvýše ${fmtQty(Math.max(0,beforeQty-actual))} ks`:`Méně než ${fmtQty(beforeQty)} ks`,`${fmtQty(currentQty)} ks`,'Zkontroluj XTB historii obchodu/import. Stejný SELL/TRIM znovu neprováděj, dokud není jasný skutečný stav.',before,current,true);
 }
 return result(receipt,'PARTIAL',`XTB fingerprint se změnil, ale verdict ${action||'—'} nemá v 59.2 bezpečné pravidlo pro automatické spárování.`,`Ručně ověřit ${action||'akci'}`,refresh,'Porovnej receipt s historií XTB; do té doby stejnou akci neopakuj.',before,current,true);
}
function ticketReceipt(receipt,before,current,sourceChanged){
 if(!sourceChanged)return wait(receipt,before,current);
 const action=U(receipt.verdict),beforeQty=num(before.qty),rawCurrent=num(current.qty),workflow=U(current.workflow),closed=['SOLD','PAYOUT WAIT','PAYOUT RECEIVED'].includes(workflow),currentQty=rawCurrent===null&&action==='SELL'&&closed?0:rawCurrent,actual=positive(receipt.actualQty),beforeList=num(before.listPrice),currentList=num(current.listPrice),actualPrice=positive(receipt.actualPrice);
 if(action==='SELL'){
  if(closed)return result(receipt,'CONFIRMED','Ticket workflow už potvrzuje uzavřený prodej.','SOLD / payout stav',workflow,'Receipt je potvrzen ticket stavem. Commander může pracovat s novým inventory.',before,current,true);
  if(beforeQty===null||currentQty===null)return result(receipt,'PARTIAL','Ticket data se změnila, ale inventory množství není dostatečné pro přesné spárování.',actual?`Prodat ${fmtQty(actual)} ks`:'Snížit inventory',`Inventory ${fmtQty(currentQty)} ks`,'Ověř skutečný počet zbývajících kusů na prodejní platformě; stejný SELL zatím neopakuj.',before,current,true);
  if(actual!==null){const expected=Math.max(0,beforeQty-actual);if(currentQty<=expected||approx(currentQty,expected))return result(receipt,'CONFIRMED',`Inventory kleslo alespoň o zaznamenaných ${fmtQty(actual)} ks.`,`≤ ${fmtQty(expected)} ks`,`${fmtQty(currentQty)} ks`,'Receipt je potvrzen novým ticket inventory.',before,current,true);if(currentQty<beforeQty)return result(receipt,'PARTIAL','Inventory kleslo, ale méně než uvádí execution receipt.',`${fmtQty(beforeQty)} → ${fmtQty(expected)} ks`,`${fmtQty(beforeQty)} → ${fmtQty(currentQty)} ks`,'Ověř počet skutečně prodaných kusů; další SELL zatím neopakuj.',before,current,true)}
  else if(currentQty<beforeQty)return result(receipt,'PARTIAL','Inventory potvrzuje prodej, ale receipt nemá skutečné množství.','Nižší inventory než před akcí',`${fmtQty(beforeQty)} → ${fmtQty(currentQty)} ks`,'Doplň/ověř skutečně prodané množství.',before,current,true);
  return result(receipt,'MISMATCH','Ticket data se obnovila, ale inventory nepotvrzuje zaznamenaný prodej.',actual?`Nejvýše ${fmtQty(Math.max(0,beforeQty-actual))} ks`:`Méně než ${fmtQty(beforeQty)} ks`,`${fmtQty(currentQty)} ks`,'Zkontroluj prodejní platformu. Stejný SELL znovu neprováděj, dokud není jasný skutečný stav.',before,current,true);
 }
 if(action==='REPRICE'){
  if(beforeList===null||currentList===null)return result(receipt,'PARTIAL','Ticket data se změnila, ale list price není dostupná pro přesné spárování.',actualPrice?fmtPrice(actualPrice,receipt.currency):'Nová list price',`List price ${fmtPrice(currentList,receipt.currency)}`,'Doplň skutečnou list cenu; do té doby další repricing neopakuj.',before,current,true);
  if(actualPrice!==null){const down=actualPrice<beforeList,up=actualPrice>beforeList,reached=approx(currentList,actualPrice,.0005)||(down&&currentList<=actualPrice)||(up&&currentList>=actualPrice);if(reached)return result(receipt,'CONFIRMED','Aktuální list price dosáhla zaznamenané ceny nebo se posunula ještě dál stejným směrem.',down?`≤ ${fmtPrice(actualPrice,receipt.currency)}`:up?`≥ ${fmtPrice(actualPrice,receipt.currency)}`:fmtPrice(actualPrice,receipt.currency),fmtPrice(currentList,receipt.currency),'Receipt je potvrzen aktuální list cenou.',before,current,true);const moved=(down&&currentList<beforeList)||(up&&currentList>beforeList);if(moved)return result(receipt,'PARTIAL','List price se změnila správným směrem, ale nedosáhla zaznamenané execution ceny.',`${fmtPrice(beforeList,receipt.currency)} → ${fmtPrice(actualPrice,receipt.currency)}`,`${fmtPrice(beforeList,receipt.currency)} → ${fmtPrice(currentList,receipt.currency)}`,'Ověř skutečnou cenu na platformě; další repricing zatím neopakuj.',before,current,true)}
  else if(!approx(currentList,beforeList))return result(receipt,'PARTIAL','List price se změnila, ale receipt nemá skutečnou cenu pro přesné spárování.','Změněná list price',`${fmtPrice(beforeList,receipt.currency)} → ${fmtPrice(currentList,receipt.currency)}`,'Ověř skutečnou execution cenu.',before,current,true);
  return result(receipt,'MISMATCH','Ticket zdroj se obnovil, ale list price nepotvrzuje zaznamenaný repricing.',actualPrice?fmtPrice(actualPrice,receipt.currency):'Jiná list price než před akcí',fmtPrice(currentList,receipt.currency),'Zkontroluj listing na prodejní platformě. Stejný REPRICE znovu neprováděj, dokud není jasný skutečný stav.',before,current,true);
 }
 if(action==='LIST'){
  if(workflow==='LISTED')return result(receipt,'CONFIRMED','Ticket je v nových datech vedený jako LISTED.','LISTED',workflow,'Receipt je potvrzen ticket stavem.',before,current,true);
  return result(receipt,'MISMATCH','Ticket data se změnila, ale workflow nepotvrzuje vystavení nabídky.','LISTED',workflow||'—','Zkontroluj listing na prodejní platformě; LIST znovu neopakuj bez ověření.',before,current,true);
 }
 if(action==='BUY'){
  if(beforeQty!==null&&currentQty!==null&&actual!==null){const expected=beforeQty+actual;if(currentQty>=expected||approx(currentQty,expected))return result(receipt,'CONFIRMED','Inventory obsahuje alespoň zaznamenaný nákup.',`≥ ${fmtQty(expected)} ks`,`${fmtQty(currentQty)} ks`,'Receipt je potvrzen novým inventory.',before,current,true);if(currentQty>beforeQty)return result(receipt,'PARTIAL','Inventory vzrostlo, ale méně než uvádí receipt.',`${fmtQty(beforeQty)} → ${fmtQty(expected)} ks`,`${fmtQty(beforeQty)} → ${fmtQty(currentQty)} ks`,'Ověř skutečně nakoupené množství.',before,current,true)}
  return result(receipt,'MISMATCH','Ticket data se změnila, ale inventory nepotvrzuje zaznamenaný nákup.','Vyšší inventory',`${fmtQty(currentQty)} ks`,'Zkontroluj nákup/inventory; stejný BUY zatím neopakuj.',before,current,true);
 }
 return result(receipt,'PARTIAL',`Ticket fingerprint se změnil, ale verdict ${action||'—'} nemá bezpečné pravidlo pro automatické spárování.`,`Ručně ověřit ${action||'akci'}`,'Ticket data se změnila.','Porovnej receipt s prodejní platformou; do té doby stejnou akci neopakuj.',before,current,true);
}

export function reconcileReceipt592(s=store.get(),receipt={}){
 const action=actionForReceipt(receipt),before=parse(receipt.fingerprint),currentRaw=actionFingerprint591(s,action),current=parse(currentRaw),sourceChanged=String(receipt.fingerprint||'')!==String(currentRaw||'');
 return U(receipt.domain)==='XTB'?xtbReceipt(receipt,before,current,sourceChanged):ticketReceipt(receipt,before,current,sourceChanged);
}
export function unresolvedExecutionReceipt592(s=store.get(),action={}){
 const receipt=latestExecutionReceipt591(s,action);if(!receipt)return null;const row=reconcileReceipt592(s,receipt);return row.code==='CONFIRMED'?null:row;
}
export function executionReconciliation592(s=store.get()){
 const started=performance.now(),latest=new Map();for(const receipt of A(s.marketExecutionHistory?.receipts))if(receipt?.key)latest.set(receipt.key,receipt);
 const rows=[...latest.values()].sort((a,b)=>Date.parse(b.at||0)-Date.parse(a.at||0)).map(r=>reconcileReceipt592(s,r)),counts={confirmed:rows.filter(x=>x.code==='CONFIRMED').length,partial:rows.filter(x=>x.code==='PARTIAL').length,mismatch:rows.filter(x=>x.code==='MISMATCH').length,waiting:rows.filter(x=>x.code==='WAIT_REFRESH').length};
 const summary=!rows.length?'Zatím není žádný ruční execution receipt.':counts.mismatch?`${counts.mismatch} ručně potvrzená akce nesouhlasí s novými zdrojovými daty.`:counts.partial?`${counts.partial} ručně potvrzená akce je jen částečně doložená.`:counts.waiting?`${counts.waiting} ručně potvrzená akce čeká na refresh zdrojových dat.`:'Všechny poslední ruční akce odpovídají novým zdrojovým datům.';
 const out={rows,counts,summary,total:rows.length,generatedAt:new Date().toISOString()};if(typeof window!=='undefined')window.__KAMIL_EXECUTION_RECONCILIATION_592_LAST__={ms:Math.round((performance.now()-started)*10)/10,at:Date.now(),total:rows.length,...counts};return out;
}

const rowHtml=x=>`<div class="intel-row"><div class="intel-main"><b>${h(x.instruction)}</b><span>${h(`${x.reason} · očekáváno: ${x.expected} · zjištěno: ${x.observed}`)}</span><span>${h(x.nextStep)}</span></div><div class="row-actions"><span class="decision-action ${x.tone}">${h(x.status)}</span></div></div>`;
export async function openExecutionReconciliation592(){
 const x=executionReconciliation592(),body=`<div class="metric-strip"><div class="metric"><span>Potvrzeno</span><b class="good">${x.counts.confirmed}</b></div><div class="metric"><span>Částečně</span><b class="warn">${x.counts.partial}</b></div><div class="metric"><span>Nesouhlasí</span><b class="bad">${x.counts.mismatch}</b></div><div class="metric"><span>Čeká na refresh</span><b>${x.counts.waiting}</b></div></div><div class="card"><div class="eyebrow">EXECUTION RECONCILIATION 59.2</div><h2>${h(x.summary)}</h2><p>59.2 porovnává poslední receipt pro každý XTB ticker / ticket s novým uloženým stavem. XTB execution cenu z portfolio importu neověřuje, protože by to nebylo spolehlivé.</p></div><div class="card"><div class="eyebrow">POSLEDNÍ RUČNÍ AKCE</div>${x.rows.slice(0,12).map(rowHtml).join('')||'<div class="empty">Zatím není co párovat.</div>'}</div><div class="decision-note">59.2 je read-only kontrola. Nic neobchoduje, neprodává, nepřecenňuje ani nepřepisuje receipt. ČÁSTEČNĚ / NESOUHLASÍ / ČEKÁ NA REFRESH drží stejnou akci v ověřovacím režimu, aby se omylem neprovedla dvakrát.</div>`;
 return modal('XTB + vstupenky / Execution Reconciliation 59.2',body,[{label:'Zavřít',value:null,primary:true}]);
}
