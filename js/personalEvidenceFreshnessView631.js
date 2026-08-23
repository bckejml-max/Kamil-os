import {h,modal} from './utils.js';
import {personalEvidenceFreshness631} from './personalEvidenceFreshness631.js';

const row=v=>`<div class="row"><div><b>${h(v.title||v.id)}</b><div class="muted">Potvrzeno ${h(String(v.confirmedAt||'—').slice(0,10))} · stáří ${v.ageDays} dní · obnova po ${v.maxDays} dnech</div></div><b>${h(v.freshnessLabel)}</b></div>`;

export async function openPersonalEvidenceFreshness631(){
 const x=personalEvidenceFreshness631();
 if(typeof window!=='undefined')window.__KAMIL_EVIDENCE_FRESHNESS_631_LAST__={at:Date.now(),count:x.count,fresh:x.fresh.length,dueSoon:x.dueSoon.length,stale:x.stale.length};
 const body=`<div class="metric-strip"><div class="metric"><span>Čerstvé</span><b>${x.fresh.length}</b></div><div class="metric"><span>Brzy obnovit</span><b>${x.dueSoon.length}</b></div><div class="metric"><span>Staré</span><b>${x.stale.length}</b></div></div><div class="card"><div class="eyebrow">EVIDENCE FRESHNESS RADAR 63.1</div><h2>${h(x.summary)}</h2>${x.items.length?x.items.map(row).join(''):'<div class="empty success-empty">Zatím není žádný potvrzený důkaz v Evidence Ledgeru.</div>'}</div><div class="decision-note">Starý důkaz se nemaže z historie. Jen přestane zvyšovat effective confidence, dokud není znovu potvrzen čerstvým podkladem.</div>`;
 return modal('Kamil OS / Evidence Freshness 63.1',body,[{label:'Zavřít',value:null,primary:true}]);
}
