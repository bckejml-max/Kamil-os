import {store} from './state.js';
import {personalDataRecovery625} from './personalDataRecovery625.js';

const EVIDENCE={
 'recovered-home-insurance-2026':{score:82,label:'PRAVDĚPODOBNÉ',basis:'Návrh smlouvy + pozdější řešení krytí rekonstrukce s PVZP.',freshness:'2026-07',next:'Potvrdit, že smlouva 8000518999 je stále účinná a jak je krytá rekonstrukce.'},
 'recovered-electricity-eon-2026':{score:92,label:'POTVRZENO',basis:'Dohledaná smlouva na dobu určitou do 31.12.2027.',freshness:'2026',next:'Před 11.12.2027 rozhodnout o prodloužení / výpovědi.'},
 'recovered-life-kamil-allianz':{score:96,label:'POTVRZENO',basis:'Smluvní dokumentace + audit eviduje neuhrazenou platbu jako následně potvrzeně zaplacenou.',freshness:'2026-07-31',next:'Při příštím výpisu pouze ověřit pravidelnou platbu 915 Kč.'},
 'recovered-life-tereza-nn':{score:76,label:'PRAVDĚPODOBNÉ',basis:'Podepsaná/smluvní dokumentace NN Orange Risk a známé měsíční pojistné 574 Kč; chybí čerstvé potvrzení platby.',freshness:'2025-07',next:'Najít platbu NN v novějším bankovním výpisu nebo potvrzení pojišťovny.'},
 'recovered-auto-insurance':{score:35,label:'OVĚŘIT',basis:'Archiv obsahuje více návrhů (Allianz i PVZP), ale ne spolehlivé potvrzení aktuálně účinné smlouvy.',freshness:'2026-07',next:'Najít poslední zaplacené pojistné nebo zelenou kartu / potvrzení aktuální smlouvy.'},
 'recovered-bank-coverage':{score:88,label:'POTVRZENO DO 07/2026',basis:'Audit zdrojů a výpis 2026/7 potvrzují MONETA data do 31.07.2026.',freshness:'2026-07-31',next:'Srpen doplnit až po uzavření měsíce; ostatní banky zůstávají neúplné.'},
 'recovered-mortgage-2026-08':{score:86,label:'POTVRZENÝ SNAPSHOT',basis:'Modelový registr k 01.08.2026 uvádí jistinu a pravidelnou splátku.',freshness:'2026-08-01',next:'Po další splátce aktualizovat skutečný zůstatek jistiny.'},
 'recovered-home-vlasatice':{score:99,label:'POTVRZENO',basis:'Nemovitost potvrzují smlouvy i stavební dokumentace z 08/2026.',freshness:'2026-08',next:'Doplnit pouze aktuální tržní hodnotu, pokud ji chceme používat ve financích.'}
};

const decorate=v=>({...v,confidence:EVIDENCE[v.id]?.score||50,confidenceLabel:EVIDENCE[v.id]?.label||'OVĚŘIT',confidenceBasis:EVIDENCE[v.id]?.basis||'Archivní záznam bez dalšího potvrzení.',confidenceFreshness:EVIDENCE[v.id]?.freshness||null,confidenceNext:EVIDENCE[v.id]?.next||'Ověřit čerstvým zdrojem.'});

export function personalDataConfidence626(s=store.get()){
 const r=personalDataRecovery625(s),records=[...r.admin.filter(x=>String(x.id||'').startsWith('recovered-')),...r.assets.filter(x=>String(x.id||'').startsWith('recovered-'))].map(decorate).sort((a,b)=>b.confidence-a.confidence);
 const confirmed=records.filter(x=>x.confidence>=85),probable=records.filter(x=>x.confidence>=65&&x.confidence<85),verify=records.filter(x=>x.confidence<65);
 const average=records.length?Math.round(records.reduce((a,x)=>a+x.confidence,0)/records.length):0;
 return{records,confirmed,probable,verify,average,summary:`Datová důvěra ${average}/100 · potvrzeno ${confirmed.length} · pravděpodobné ${probable.length} · ověřit ${verify.length}`};
}
