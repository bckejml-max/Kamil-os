import {h} from './utils.js';
import {personalDailyAssistant650} from './personalAssistant650.js';
import {personalVault640} from './personalVault640.js';
import {dailyTicketPriority672} from './personalTicketPriority672.js';
import {openTicketCommander660} from './ticketCommander660.js';
import {rankOneBestMove673} from './oneBestMoveRank673.js';
export {rankOneBestMove673} from './oneBestMoveRank673.js';

const daysOld=v=>{const t=Date.parse(v||'');return Number.isFinite(t)?Math.floor((Date.now()-t)/86400000):null};

export function moneyPriority673(s){
 const v=personalVault640(s),bank=v.records.find(x=>x.recordType==='bank-data'),mortgage=v.records.find(x=>x.recordType==='mortgage'),bankAge=daysOld(bank?.asOf),mortgageAge=daysOld(mortgage?.asOf);
 if(!bank?.asOf)return{kind:'money',score:78,title:'Doplnit bankovní data',label:'PENÍZE',reason:'Nemám potvrzený aktuální bankovní snapshot.',cta:'Doplnit data',route:'money'};
 if(bankAge!==null&&bankAge>40)return{kind:'money',score:72,title:'Aktualizovat bankovní data',label:'PENÍZE',reason:`Poslední potvrzený stav je ${bankAge} dní starý.`,cta:'Aktualizovat',route:'money'};
 if(mortgage?.asOf&&mortgageAge!==null&&mortgageAge>120)return{kind:'money',score:58,title:'Aktualizovat hypotéku',label:'PENÍZE',reason:`Poslední známý zůstatek je ${mortgageAge} dní starý.`,cta:'Aktualizovat',route:'money'};
 return null;
}

export async function oneBestMove673(s){
 const personal=personalDailyAssistant650(s).primary,money=moneyPriority673(s);let ticket=null;
 try{ticket=await dailyTicketPriority672()}catch{}
 return rankOneBestMove673({personal,ticket,money});
}

function openMoney(){document.querySelector('[data-view="money"]')?.click()}
export async function appendOneBestMove673(host,s){
 if(!host)return null;host.querySelector('[data-one-best-move-673]')?.remove();const result=await oneBestMove673(s);if(!result.best||!host.isConnected)return result;
 const best=result.best;if(best.kind==='personal')return result;
 const card=document.createElement('section');card.className='card ux67-one-best';card.dataset.oneBestMove673='1';card.innerHTML=`<div class="eyebrow">NEJLEPŠÍ DALŠÍ KROK</div><div class="row"><div><b>${h(best.title)}</b><div class="muted">${h(best.reason||'')}</div></div><span class="ux64-status">${h(best.label||best.kind)}</span></div><button class="btn primary" data-one-best-open>${h(best.cta||'Otevřít')}</button>`;
 const hero=host.querySelector('.ux65-hero');hero?.parentNode?.insertBefore(card,hero.nextSibling);
 card.querySelector('[data-one-best-open]')?.addEventListener('click',()=>best.kind==='ticket'?openTicketCommander660():openMoney());
 const original=host.querySelector('.ux65-primary')?.closest('section');if(original){original.classList.add('ux67-demoted');original.insertAdjacentHTML('afterbegin','<div class="eyebrow">POTOM</div>')}
 if(typeof window!=='undefined')window.__KAMIL_ONE_BEST_MOVE_673__={at:Date.now(),kind:best.kind,title:best.title,score:best.score,alternatives:result.alternatives.length};return result;
}
