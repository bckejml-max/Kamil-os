import {modal,formModal,h} from './utils.js';
import {loadTicketCloud660,replaceTicketInventory660} from './ticketCloud660.js';
import {loadTicketRecoveryHistory185,saveTicketRecoverySnapshot185,getTicketRecoverySnapshot185} from './ticketRecovery185.js';
import {syncTicketRecoveryVault186} from './ticketRecoveryCloud186.js';
import {buildTicketRecoveryDiff189,ticketRecoveryDiffLabel189,TICKET_RECOVERY_DIFF_VERSION_189} from './ticketRecoveryDiffModel189.js';

export {buildTicketRecoveryDiff189,ticketRecoveryDiffLabel189,TICKET_RECOVERY_DIFF_VERSION_189};
function escRow(row){return h(ticketRecoveryDiffLabel189(row));}
function diffHtml(diff){
 const group=(title,items,render)=>items.length?`<section class="card"><h3>${title} (${items.length})</h3>${items.slice(0,30).map(render).join('')}</section>`:'';
 return `<div class="metric-strip"><div class="metric"><span>Přidá</span><b>${diff.summary.added}</b></div><div class="metric"><span>Změní</span><b>${diff.summary.changed}</b></div><div class="metric"><span>Odebere</span><b>${diff.summary.removed}</b></div><div class="metric"><span>CHRÁNĚNO</span><b>${diff.summary.protected}</b></div></div>
 <div class="decision-note"><b>OS 189 bezpečnost:</b> prodané, čekající na payout a vyplacené záznamy se při obnově nepřepíšou zpět do aktivního stavu.</div>
 ${group('Přidané',diff.added,x=>`<p>+ ${escRow(x.after)}</p>`)}
 ${group('Změněné',diff.changed,x=>`<p>~ ${escRow(x.before)} → ${escRow(x.after)}${x.statusChanged?' <b>· změna stavu</b>':''}</p>`)}
 ${group('Odebrané',diff.removed,x=>`<p>− ${escRow(x.before)}</p>`)}
 ${group('Chráněné proti přepsání',diff.protected,x=>`<p>🔒 ${escRow(x)}</p>`)}
 ${!(diff.summary.added+diff.summary.changed+diff.summary.removed)?'<p class="muted">Snapshot odpovídá aktuálním datům. Není co měnit.</p>':''}`;
}

export async function openTicketRecoveryDiff189(){
 try{await syncTicketRecoveryVault186();}catch{}
 const history=loadTicketRecoveryHistory185({syncCloud:false});
 if(!history.ok||!history.snapshots.length){await modal('Recovery Diff','<p>Nemám žádný recovery bod k porovnání.</p>',[{label:'OK',value:null,primary:true}]);return false;}
 const options=history.snapshots.map((s,i)=>`<option value="${h(s.id)}">${i+1}. ${h(s.fileName||s.kind||'Recovery')} · ${h(new Date(s.createdAt).toLocaleString('cs-CZ'))}</option>`).join('');
 const chosen=await formModal('OS 189 · Recovery Diff',`<label class="field"><span>Vyber recovery bod</span><select name="snapshotId">${options}</select></label><p class="muted">Nejdřív zobrazím přesně co se změní. Nic se zatím neobnovuje.</p>`,{submitLabel:'Zobrazit rozdíl'});
 if(!chosen?.snapshotId)return false;
 const snap=getTicketRecoverySnapshot185(chosen.snapshotId,{storage:globalThis.localStorage});if(!snap.ok)return false;
 const cloud=await loadTicketCloud660();if(!cloud.ok){await modal('Recovery Diff','<p>Aktuální ticket inventář nejde načíst z cloudu.</p>',[{label:'OK',value:null,primary:true}]);return false;}
 const diff=buildTicketRecoveryDiff189(cloud.inventory||[],snap.snapshot.rows||[]);
 const action=await modal(`Recovery Diff · ${snap.summary.fileName||'snapshot'}`,diffHtml(diff),[{label:'Zavřít',value:'close'},{label:'Obnovit tento bod',value:'restore',primary:true}]);
 if(action!=='restore')return false;
 saveTicketRecoverySnapshot185(cloud.inventory||[],{kind:'pre-restore-189',fileName:'Před OS 189 obnovou',note:`Automatická pojistka před obnovou ${snap.snapshot.id}`});
 const out=await replaceTicketInventory660(snap.snapshot.rows||[]);
 if(!out?.ok){await modal('Obnova selhala',`<p>${h(out?.error?.message||'Data se nepodařilo obnovit.')}</p>`,[{label:'OK',value:null,primary:true}]);return false;}
 await modal('Obnova hotová',`<p>Recovery bod byl obnoven. Před obnovou vznikl nový ochranný snapshot a prodané/payout záznamy zůstaly chráněné.</p>`,[{label:'OK',value:null,primary:true}]);
 globalThis.dispatchEvent?.(new CustomEvent('ticket-recovery-restored-189',{detail:{snapshotId:snap.snapshot.id,diff:diff.summary}}));
 return true;
}

export function installTicketRecoveryDiff189(){
 if(!globalThis.document||globalThis.__ticketRecoveryDiff189)return;globalThis.__ticketRecoveryDiff189=true;
 const paint=()=>{for(const recovery of document.querySelectorAll('[data-ticket-recovery]')){if(recovery.parentElement?.querySelector('[data-ticket-recovery-diff-189]'))continue;const b=document.createElement('button');b.type='button';b.className='btn';b.setAttribute('data-ticket-recovery-diff-189','1');b.textContent='Recovery diff';b.addEventListener('click',()=>openTicketRecoveryDiff189().catch(console.error));recovery.insertAdjacentElement('afterend',b);}};
 new MutationObserver(paint).observe(document.body,{childList:true,subtree:true});paint();
}
