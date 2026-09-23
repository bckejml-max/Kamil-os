import {store} from './state.js';
import {ticketEventPortfolio32} from './ticketPortfolio32.js';
import {ownEvent1100} from './runtimeOwnership1100.js';
import {session} from './cloud.js';
import {loadProductAdvancedStyles} from './productAdvancedStyles.js';
import {openPersonalAction641} from './personalActionExecution641.js';

const OWNER='product.ticketOverview';
const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const money=v=>new Intl.NumberFormat('cs-CZ',{style:'currency',currency:'CZK',maximumFractionDigits:0}).format(Number(v||0));
const upper=v=>String(v||'').toUpperCase();

function data(){
 const s=store.get(),p=ticketEventPortfolio32(s),items=s.ticketBook?.items||[];
 const transfer=items.filter(x=>['SOLD_UNDELIVERED','TRANSFER_REQUIRED','SOLD_WAITING_TRANSFER'].includes(upper(x.market_status||x.workflow)));
 const payout=items.filter(x=>['PAYOUT_WAIT','SOLD_WAITING_PAYMENT','WAITING_PAYOUT'].includes(upper(x.market_status||x.workflow)));
 const ticketTasks=(s.tasks||[]).filter(x=>!['DONE','CLOSED','ARCHIVED','RESOLVED','CANCELLED','CANCELED'].includes(upper(x.status))).filter(x=>upper(x.area)==='TICKETS'||upper(x.category)==='VIAGOGO').sort((a,b)=>Number(b.priority||0)-Number(a.priority||0));
 const attention=[];
 if(transfer.length)attention.push({tone:'bad',title:transfer.length+' prodejů čeká na převod',detail:'Prodáno, ale předání kupujícímu ještě není dokončené.',action:'sync'});
 if(p.missingListed)attention.push({tone:'warn',title:p.missingListed+' listingů nemá cenu',detail:'Bez skutečné list ceny OS neumí hlídat prodej správně.',action:'advanced'});
 if(p.staleMarket)attention.push({tone:'warn',title:p.staleMarket+' eventů má starý market',detail:'Aktualizuj tržní cenu před dalším rozhodnutím.',action:'advanced'});
 if(payout.length)attention.push({tone:'warn',title:payout.length+' prodejů čeká na payout',detail:'Zkontroluj stav platby z marketplace.',action:'sync'});
 for(const t of ticketTasks.slice(0,4))attention.push({tone:Number(t.priority||0)>=90?'bad':'warn',title:t.title||'Ticket úkol',detail:t.notes||'Otevřený ticketový úkol.',action:'task',taskId:t.id});
 return {s,p,items,transfer,payout,ticketTasks,attention:attention.slice(0,6)};
}
function attentionHtml(rows){if(!rows.length)return '<div class="pr1300-empty">Žádný transfer, payout ani pricing problém teď nehoří.</div>';return '<div class="pr1300-attention">'+rows.map(x=>'<button type="button" data-ticket-action="'+x.action+'" '+(x.taskId?'data-ticket-task-id="'+esc(x.taskId)+'"':'')+'><i class="pr1300-dot '+x.tone+'"></i><span><b>'+esc(x.title)+'</b><small>'+esc(x.detail)+'</small></span><em>řešit →</em></button>').join('')+'</div>'}
function eventRows(events){if(!events.length)return '<div class="pr1300-empty">Žádné aktivní vstupenky.</div>';return events.slice(0,8).map(x=>'<div class="pr1300-row"><div class="pr1300-row-main"><b>'+esc(x.name)+'</b><small>'+x.qty+' ks · kapitál '+money(x.capitalAtRisk)+' · '+esc(x.nextAction||'sledovat')+'</small></div><div class="pr1300-row-side '+(x.priority>=85?'bad':x.priority>=70?'warn':'')+'">'+x.priority+'/100</div></div>').join('')}

export function renderTicketOverview(){
 const host=document.querySelector('#ticketIntelView');if(!host)return false;if(host.dataset.productAdvanced==='1')return true;const d=data(),top=d.p.top,hasAttention=d.attention.length>0,hasEvents=d.p.events.length>0;
 const attentionBlock=hasAttention?'<section class="pr1300-panel"><div class="pr1300-panel-head"><h2>Teď řešit</h2><button class="pr1300-btn" type="button" data-ticket-advanced>Ticket desk</button></div>'+attentionHtml(d.attention)+'</section>':'';
 const eventsBlock=hasEvents?'<section class="pr1300-panel"><div class="pr1300-panel-head"><h3>Aktivní eventy</h3><span>nejvyšší priorita nahoře</span></div>'+eventRows(d.p.events)+'</section>':'';
 const clearBlock=!hasAttention&&!hasEvents?'<section class="pr1300-panel pr1327-ticket-clear"><div class="pr1300-panel-head"><h2>Portfolio je klidné</h2><button class="pr1300-btn" type="button" data-ticket-advanced>Ticket desk</button></div><div class="pr1300-empty">Žádný transfer, payout, pricing problém ani aktivní event teď nevyžaduje zásah.</div></section>':'';
 host.innerHTML='<div class="pr1300-shell" data-ticket-overview>' +
 '<div class="pr1300-head"><div><div class="pr1300-kicker">Vstupenky</div><h1>Co je potřeba udělat s tickety.</h1><p>Nejdřív transfery, payouty a otevřené případy. Aktivní eventy až potom.</p></div><span class="pr1300-status '+(d.transfer.length?'bad':hasAttention?'warn':'good')+'">'+(hasAttention?d.attention.length+' k řešení':'klid')+'</span></div>' +
 '<section class="pr1320-now"><div><div class="pr1300-kicker">Teď</div><h2>'+esc(d.attention[0]?.title||top?.name||'Nic urgentního')+'</h2><p>'+esc(d.attention[0]?.detail||top?.nextAction||'Aktivní portfolio teď nevyžaduje okamžitý zásah.')+'</p></div><div class="pr1320-now-actions"><button class="pr1300-btn primary" type="button" data-ticket-sync>Synchronizovat Viagogo</button></div></section>' +
 '<div class="pr1320-meta"><span>Eventy: '+d.p.totalEvents+'</span><span>Kusy: '+d.p.queue.activeQty+'</span><span>Transfer: '+d.transfer.length+'</span><span>Kapitál: '+money(d.p.totalCapital)+'</span></div>' +
 attentionBlock + eventsBlock + clearBlock +
 '<div class="pr1300-actions"><button class="pr1300-btn" type="button" data-ticket-task>＋ Úkol k ticketům</button></div></div>';
 if(!host.dataset.ticketOverviewBound){host.dataset.ticketOverviewBound='1';ownEvent1100(OWNER,host,'click',async e=>{if(e.target.closest('[data-ticket-task]')){window.dispatchEvent(new CustomEvent('kamil:capture',{detail:'ticket-task'}));return}const taskBtn=e.target.closest('[data-ticket-task-id]');if(taskBtn){const item=(store.get().tasks||[]).find(x=>String(x.id)===taskBtn.dataset.ticketTaskId);if(item)await openPersonalAction641({id:'task:'+item.id,kind:'task',title:item.title||'Ticket úkol',why:item.notes||'Aktuální ticketová záležitost.',next:'Vyřešit nebo posunout další krok.',route:'tickets'});return}if(e.target.closest('[data-ticket-sync]')||e.target.closest('[data-ticket-action="sync"]')){if(!await session()){window.dispatchEvent(new CustomEvent('kamil:cloud-login'));return}const m=await import('./ticketGmailSync429.js');await m.syncTicketGmail429?.();renderTicketOverview();return}if(e.target.closest('[data-ticket-advanced]')||e.target.closest('[data-ticket-action="advanced"]')){host.dataset.productAdvanced='1';await loadProductAdvancedStyles(['./ticket68.css','./globalFintech137.css','./ticketWorkspace210.css','./ticketDesk353.css','./ticketDesk355.css','./ticketDesk356.css']);const m=await import('./ticketAdvanced100.js');await m.renderTicketPage100?.()}})}

 window.__KAMIL_TICKET_OVERVIEW__={healthy:true,events:d.p.totalEvents,transfer:d.transfer.length,attention:d.attention.length,at:Date.now()};return true;
}