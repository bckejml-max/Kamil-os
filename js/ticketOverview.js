import {store} from './state.js';
import {ticketEventPortfolio32} from './ticketPortfolio32.js';
import {ownEvent1100} from './runtimeOwnership1100.js';
import {session} from './cloud.js';
import {loadProductAdvancedStyles} from './productAdvancedStyles.js';

const OWNER='product.ticketOverview';
const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const money=v=>new Intl.NumberFormat('cs-CZ',{style:'currency',currency:'CZK',maximumFractionDigits:0}).format(Number(v||0));
const upper=v=>String(v||'').toUpperCase();

function data(){
 const s=store.get(),p=ticketEventPortfolio32(s),items=s.ticketBook?.items||[];
 const transfer=items.filter(x=>['SOLD_UNDELIVERED','TRANSFER_REQUIRED','SOLD_WAITING_TRANSFER'].includes(upper(x.market_status||x.workflow)));
 const payout=items.filter(x=>['PAYOUT_WAIT','SOLD_WAITING_PAYMENT','WAITING_PAYOUT'].includes(upper(x.market_status||x.workflow)));
 const attention=[];
 if(transfer.length)attention.push({tone:'bad',title:transfer.length+' prodejů čeká na převod',detail:'Prodáno, ale předání kupujícímu ještě není dokončené.',action:'sync'});
 if(p.missingListed)attention.push({tone:'warn',title:p.missingListed+' listingů nemá cenu',detail:'Bez skutečné list ceny OS neumí hlídat prodej správně.',action:'advanced'});
 if(p.staleMarket)attention.push({tone:'warn',title:p.staleMarket+' eventů má starý market',detail:'Aktualizuj tržní cenu před dalším rozhodnutím.',action:'advanced'});
 if(payout.length)attention.push({tone:'warn',title:payout.length+' prodejů čeká na payout',detail:'Zkontroluj stav platby z marketplace.',action:'sync'});
 return {s,p,items,transfer,payout,attention:attention.slice(0,4)};
}
function attentionHtml(rows){if(!rows.length)return '<div class="pr1300-empty">Žádný transfer, payout ani pricing problém teď nehoří.</div>';return '<div class="pr1300-attention">'+rows.map(x=>'<button type="button" data-ticket-action="'+x.action+'"><i class="pr1300-dot '+x.tone+'"></i><span><b>'+esc(x.title)+'</b><small>'+esc(x.detail)+'</small></span><em>řešit →</em></button>').join('')+'</div>'}
function eventRows(events){if(!events.length)return '<div class="pr1300-empty">Žádné aktivní vstupenky.</div>';return events.slice(0,8).map(x=>'<div class="pr1300-row"><div class="pr1300-row-main"><b>'+esc(x.name)+'</b><small>'+x.qty+' ks · kapitál '+money(x.capitalAtRisk)+' · '+esc(x.nextAction||'sledovat')+'</small></div><div class="pr1300-row-side '+(x.priority>=85?'bad':x.priority>=70?'warn':'')+'">'+x.priority+'/100</div></div>').join('')}

export function renderTicketOverview(){
 const host=document.querySelector('#ticketIntelView');if(!host)return false;const d=data(),top=d.p.top;
 host.innerHTML='<div class="pr1300-shell" data-ticket-overview>' +
 '<div class="pr1300-head"><div><div class="pr1300-kicker">Vstupenky</div><h1>Co je prodané, co čeká na převod a kde leží kapitál.</h1><p>Výchozí obrazovka je provozní seznam. Predikce a pokročilý market desk jsou až druhý krok.</p></div><span class="pr1300-status '+(d.transfer.length?'bad':d.attention.length?'warn':'good')+'">'+(d.attention.length?d.attention.length+' k řešení':'klid')+'</span></div>' +
 '<section class="pr1300-hero"><div><div class="pr1300-kicker">Nejdůležitější event</div><h2>'+esc(top?.name||'Žádný aktivní event')+'</h2><p>'+esc(top?.nextAction||'Není potřeba žádný další krok.')+'</p></div><div class="pr1300-hero-value"><b>'+money(d.p.totalCapital)+'</b><span>kapitál v aktivních vstupenkách</span></div></section>' +
 '<div class="pr1300-kpis"><div class="pr1300-kpi"><span>Eventy</span><b>'+d.p.totalEvents+'</b><small>aktivní portfolio</small></div><div class="pr1300-kpi"><span>Kusy</span><b>'+d.p.queue.activeQty+'</b><small>aktivní vstupenky</small></div><div class="pr1300-kpi"><span>Čeká transfer</span><b>'+d.transfer.length+'</b><small>nejvyšší provozní priorita</small></div><div class="pr1300-kpi"><span>Chybí vstup</span><b>'+d.p.queue.needsInput+'</b><small>cena / market / transfer stav</small></div></div>' +
 '<div class="pr1300-actions"><button class="pr1300-btn primary" type="button" data-ticket-sync>Synchronizovat Viagogo</button><button class="pr1300-btn" type="button" data-ticket-task>＋ Úkol k ticketům</button><button class="pr1300-btn" type="button" data-ticket-advanced>Pokročilý ticket desk</button></div>' +
 '<div class="pr1300-grid"><section class="pr1300-panel"><div class="pr1300-panel-head"><h2>Potřebuje pozornost</h2><span>transfer · payout · pricing</span></div>'+attentionHtml(d.attention)+'</section><section class="pr1300-panel"><div class="pr1300-panel-head"><h3>Aktivní eventy</h3><span>nejvyšší priorita nahoře</span></div>'+eventRows(d.p.events)+'</section></div></div>';
 if(!host.dataset.ticketOverviewBound){host.dataset.ticketOverviewBound='1';ownEvent1100(OWNER,host,'click',async e=>{if(e.target.closest('[data-ticket-task]')){window.dispatchEvent(new CustomEvent('kamil:capture',{detail:'ticket-task'}));return}if(e.target.closest('[data-ticket-sync]')||e.target.closest('[data-ticket-action="sync"]')){if(!await session()){window.dispatchEvent(new CustomEvent('kamil:cloud-login'));return}const m=await import('./ticketGmailSync429.js');await m.syncTicketGmail429?.();renderTicketOverview();return}if(e.target.closest('[data-ticket-advanced]')||e.target.closest('[data-ticket-action="advanced"]')){host.dataset.productAdvanced='1';await loadProductAdvancedStyles(['./ticket68.css','./globalFintech137.css','./ticketWorkspace210.css','./ticketDesk353.css','./ticketDesk355.css','./ticketDesk356.css']);const m=await import('./ticketAdvanced100.js');await m.renderTicketPage100?.()}})}
 window.__KAMIL_TICKET_OVERVIEW__={healthy:true,events:d.p.totalEvents,transfer:d.transfer.length,attention:d.attention.length,at:Date.now()};return true;
}