import {loadTicketCloud660} from './ticketCloud660.js';
import {store} from './state.js';
import {h} from './utils.js';
import {buildTicketDataReadiness217} from './ticketDataReadinessModel217.js';

const stateIcon=k=>k==='explicitBlock'?'⛔':k==='payoutHistory'?'💸':'✓';
export async function appendTicketDataReadiness217(host=document.querySelector('#ticketIntelView')){
 if(!host||host.querySelector('[data-ticket-data-readiness217]'))return;
 const cloud=await loadTicketCloud660();if(!cloud?.ok)return;
 const watchlist=store.get()?.ticketBook?.watchlist||[];
 const desk=buildTicketDataReadiness217({inventory:cloud.inventory||[],latest:cloud.latest||new Map(),watchlist});
 const sec=document.createElement('section');sec.dataset.ticketDataReadiness217='1';sec.className='card';sec.style.margin='18px 0';
 sec.innerHTML=`<div class="eyebrow">OS 217 · TICKET DATA READINESS CENTER</div><h2>Co doplnit jako první, aby se odemklo nejvíc BUY rozhodnutí</h2><p class="muted">Seskupuje všechny VERIFY / DATA NEEDED / BLOCK příčiny a řadí je podle dopadu. Jedna kontrola tak může odemknout víc eventů najednou.</p><div class="metric-strip"><div class="metric"><span>Datové úkoly</span><b>${desk.summary.tasks}</b></div><div class="metric"><span>Dotčené eventy</span><b>${desk.summary.events}</b></div><div class="metric"><span>Akční úkoly</span><b>${desk.summary.actionable}</b></div><div class="metric"><span>Potenc. odemčení</span><b>${desk.summary.potentialUnlocks}</b></div></div>${desk.rows.slice(0,8).map((v,i)=>`<div class="card" style="margin-top:12px"><div style="display:flex;justify-content:space-between;gap:14px"><div><b>#${i+1} ${stateIcon(v.key)} ${h(v.label)}</b><div class="muted">Priorita ${v.priority}/100 · ${v.count} event${v.count===1?'':'ů'} · max Opportunity ${v.maxScore}/100</div></div><b>${v.key==='explicitBlock'?'BLOCK':v.unlockable?`ODEMKNOUT ${v.unlockable}`:'—'}</b></div><div class="muted" style="margin-top:8px"><b>Další krok:</b> ${h(v.next)}</div><div style="margin-top:8px">${v.events.slice(0,4).map(e=>`<span class="pill" style="margin:0 6px 6px 0">${h(e.name)} · ${e.score}</span>`).join('')}${v.events.length>4?`<span class="muted">+${v.events.length-4} dalších</span>`:''}</div></div>`).join('')||'<div class="card" style="margin-top:12px"><b>✓ Data readiness je čistý</b><p class="muted" style="margin-bottom:0">Aktuálně nejsou žádné BUY blokace, které by šly odemknout doplněním dat.</p></div>'}`;
 host.prepend(sec);window.__KAMIL_TICKET_DATA_READINESS217__=desk;
}
