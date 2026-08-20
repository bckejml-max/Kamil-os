import {documentScanCandidate,documentRecordDraft,findDocumentDuplicate,documentScanner30Note} from './js/documentScanner30.js';
const assert=(x,m)=>{if(!x)throw new Error(m)};

const raw=`Číslo smlouvy: 123456789\nAllianz pojišťovna a.s.\nPojistná smlouva\nPojistné celkem 1 250 Kč\nSplatnost 25.08.2026\nIBAN CZ6508000000192000145399\nVariabilní symbol 987654321\n`;
let scan=documentScanCandidate(raw,{name:'rodne_cislo_8501011234.jpg',type:'image/jpeg',size:123456,method:'OCR'});
assert(scan.ok&&scan.candidate.type==='INSURANCE'&&scan.candidate.category==='INSURANCE','insurance classification');
assert(scan.candidate.amount===1250&&scan.candidate.currency==='CZK','actual amount/currency parsed');
assert(scan.candidate.dueDate==='2026-08-25','due date with same-line context parsed');
assert(scan.candidate.sensitiveKinds.includes('CONTRACT_NUMBER')&&scan.candidate.sensitiveKinds.includes('IBAN')&&scan.candidate.sensitiveKinds.includes('VARIABLE_SYMBOL'),'sensitive markers detected');
const candidateJson=JSON.stringify(scan.candidate);
for(const secret of ['123456789','CZ6508000000192000145399','987654321','8501011234'])assert(!candidateJson.includes(secret),'sensitive value leaked into candidate: '+secret);
assert(!('name' in scan.candidate.source)&&scan.candidate.source.extension==='.jpg','raw filename must not be retained');
assert(scan.candidate.title.includes('Allianz')&&!scan.candidate.title.includes('Číslo smlouvy'),'sensitive first line must not become title');
assert(scan.candidate.provider.includes('Allianz'),'safe provider extracted');
assert(scan.candidate.fingerprint.startsWith('scan30-'),'safe duplicate fingerprint exists');

const crossLine=documentScanCandidate('Faktura\n31.08.2026\nSplatnost\nCelkem 500 Kč',{type:'text/plain',method:'PASTE'});
assert(crossLine.ok&&crossLine.candidate.dueDate===null&&crossLine.candidate.otherDates.includes('2026-08-31'),'following line must not retroactively classify date');

const contract=documentScanCandidate('Smlouva o předplatném\nACME s.r.o.\nCelkem 499 Kč',{type:'text/plain',method:'PASTE'});
assert(contract.candidate.type==='CONTRACT'&&contract.candidate.category==='SUBSCRIPTION','contract maps to subscription register');

let draft=documentRecordDraft(scan,{},new Date('2026-08-20T12:00:00Z'));
assert(draft.ok&&draft.record.nextDue==='2026-08-25'&&draft.record.amount===1250,'draft carries confirmed defaults');
let recordJson=JSON.stringify(draft.record);
for(const secret of ['123456789','CZ6508000000192000145399','987654321','rodne_cislo_8501011234.jpg'])assert(!recordJson.includes(secret),'sensitive/raw source leaked into record: '+secret);
assert(!('sourceName' in draft.record.scanner30)&&draft.record.scanner30.sourceExtension==='.jpg','stored scanner metadata excludes filename');
assert(draft.record.scanner30.scannedAt==='2026-08-20T12:00:00.000Z','deterministic scannedAt uses provided now');

draft=documentRecordDraft(scan,{amount:null,dueDate:'',expiryDate:'',renewalDate:'',provider:''},new Date('2026-08-20T12:00:00Z'));
assert(draft.record.amount===null&&draft.record.nextDue===null&&draft.record.renewalDate===null&&draft.record.provider==='','manual confirmation can remove parser guesses');
assert(!JSON.stringify(draft.record).includes('NaN'),'malformed values never serialize NaN');

const active={personalAdmin:{items:[{id:'a',title:'A',status:'ACTIVE',scanner30:{fingerprint:scan.candidate.fingerprint}}]}};
assert(findDocumentDuplicate(active,scan)?.id==='a','active duplicate detected');
const archived={personalAdmin:{items:[{id:'a',title:'A',status:'ARCHIVED',scanner30:{fingerprint:scan.candidate.fingerprint}}]}};
assert(findDocumentDuplicate(archived,scan)===null,'archived duplicate does not block import');
assert(documentScanCandidate('   ').code==='NO_TEXT','empty OCR is safe error');
assert(documentScanner30Note.includes('raw OCR text')&&documentScanner30Note.includes('filename')&&documentScanner30Note.includes('bez potvrzení'),'privacy note complete');

console.log('DOCUMENT SCANNER 30.1 TEST PASS');
