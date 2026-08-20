import fs from 'fs';
import {documentScanCandidate,documentRecordDraft,findDocumentDuplicate} from './js/documentScanner30.js';
const assert=(x,m)=>{if(!x)throw new Error(m)};

const raw=`Faktura\nACME Energie s.r.o.\nCelkem 2 490 Kč\nSplatnost 30.08.2026\nČíslo účtu 123456789/0100\nIBAN CZ1201000000001234567899\n`;
const scan=documentScanCandidate(raw,{name:'faktura_iban_CZ1201000000001234567899.png',type:'image/png',size:222222,method:'OCR'});
assert(scan.ok,'scan candidate');
const draft=documentRecordDraft(scan,{title:'Energie srpen',provider:'ACME Energie s.r.o.',amount:2490,currency:'CZK',dueDate:'2026-08-30'},new Date('2026-08-20T13:00:00Z'));
assert(draft.ok,'record draft');
const state={personalAdmin:{items:[{id:'scan-1',...draft.record,createdAt:'2026-08-20T13:00:00.000Z',updatedAt:'2026-08-20T13:00:00.000Z'}]}};
const json=JSON.stringify(state);
for(const secret of ['123456789/0100','CZ1201000000001234567899','faktura_iban_CZ1201000000001234567899.png'])assert(!json.includes(secret),'raw sensitive value leaked into persisted state: '+secret);
assert(state.personalAdmin.items[0].amount===2490&&state.personalAdmin.items[0].nextDue==='2026-08-30','confirmed metadata persisted');
const keys=Object.keys(state.personalAdmin.items[0].scanner30).sort();
assert(JSON.stringify(keys)===JSON.stringify(['confidence','documentType','fingerprint','scannedAt','sensitiveKinds','sourceExtension','sourceMethod','sourceSize','sourceType'].sort()),'scanner persistence whitelist changed unexpectedly');
assert(findDocumentDuplicate(state,scan)?.id==='scan-1','persisted fingerprint prevents accidental duplicate');

const engine=fs.readFileSync('js/documentScanner30.js','utf8'),ui=fs.readFileSync('js/documentScannerUi30.js','utf8');
for(const browser of ['document.','window.','localStorage','navigator.','fetch(','FormData','XMLHttpRequest','supabase','store.'])assert(!engine.includes(browser),'scanner engine must stay browser/network independent: '+browser);
for(const forbidden of ['rawText:','ocrText:','sourceName:','fileName:','filename:'])assert(!engine.includes(forbidden),'engine persistence privacy regression: '+forbidden);
assert(ui.includes("T.recognize(file,'ces+eng'")&&ui.includes('capture="environment"'),'mobile local OCR path missing');
assert(ui.includes('raw OCR text ani filename ne')&&ui.includes('při uložení se zahodí'),'UI must disclose raw-data discard');
assert(ui.includes('store.mutate')&&ui.includes('...draft.record'),'UI saves only reviewed draft record');
assert(!ui.includes('rawText,')&&!ui.includes('rawText:')&&!ui.includes('file,')&&!ui.includes('file:'),'UI must not persist raw scan payload');
console.log('DOCUMENT SCANNER 30.1 INTEGRATION PASS');
