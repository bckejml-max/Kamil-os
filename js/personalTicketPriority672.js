import {h,money} from './utils.js';
import {loadTicketCloud660} from './ticketCloud660.js';
import {openTicketCommander660} from './ticketCommander660.js';
import {fulfillmentCommander671,oneDailyDecision671} from './ticketDecisionEngine671.js';

const tone=risk=>risk>=75?'critical':risk>=50?'warning':'success';
const actionLabel=code=>code==='LOWER'?'Zkontrolovat cenu':code==='LIST'?'Vystavit':code==='RAISE'?'Prověřit zdražení':code==='OFFICIAL_COMPETITION'?'Řešit konkurenci oficiálu':'Zkontrolovat';

export async function dailyTicketPriority672(){
 const cloud=await loadTicketCloud660();
 if(!cloud.ok)return null;
 const flow=fulfillmentCommander671(cloud);
 if(flow.deliverQty>0){
  const first=flow.deliver[0];
  return{kind:'delivery',priority:120,title:first?.event_name||'Prodané vstupenky',label:`DORUČIT ${flow.deliverQty} KS`,reason:'Prodané vstupenky čekají na předání kupujícímu.',risk:100,cta:'Doručit',payoutCzk:flow.payoutCzk};
 }
 const decision=oneDailyDecision671(cloud);
 if(!decision)return null;
 return{kind:'market',priority:decision.risk+(decision.code==='OFFICIAL_COMPETITION'?30:decision.code==='LOWER'?25:decision.code==='LIST'?18:0),title:decision.event,label:decision.label,reason:decision.reason,risk:decision.risk,code:decision.code,cta:actionLabel(decision.code),payoutCzk:flow.payoutCzk};
}

export async function appendDailyTicketPriority672(host){
 if(!host)return null;
 host.querySelector('[data-ticket-priority-672]')?.remove();
 const x=await dailyTicketPriority672();
 if(!x||!host.isConnected)return null;
 const shouldShow=x.kind==='delivery'||x.priority>=70;
 if(!shouldShow)return null;
 const card=document.createElement('section');
 card.className=`card ux67-ticket-priority ${tone(x.risk)}`;
 card.dataset.ticketPriority672='1';
 card.innerHTML=`<div class="eyebrow">DNEŠNÍ TICKETOVÉ ROZHODNUTÍ</div><div class="row"><div><b>${h(x.title)}</b><div class="muted">${h(x.reason)}</div></div><span class="tmw-rec ${tone(x.risk)}">${h(x.label)}</span></div><div class="row"><span>Risk score</span><b>${x.risk}/100</b></div>${x.payoutCzk>0?`<div class="row"><span>Čeká payout</span><b>${money(x.payoutCzk)}</b></div>`:''}<button class="btn primary" data-ticket-priority-open>${h(x.cta)}</button>`;
 const primary=host.querySelector('.ux65-primary')?.closest('section');
 const anchor=primary||host.querySelector('.ux65-context');
 if(anchor?.parentNode)anchor.parentNode.insertBefore(card,anchor);
 else host.appendChild(card);
 card.querySelector('[data-ticket-priority-open]')?.addEventListener('click',()=>openTicketCommander660());
 return x;
}
