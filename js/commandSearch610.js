import {store} from './state.js';
import {norm,h,money} from './utils.js';
import {search as baseSearch} from './command.js';

const A=v=>Array.isArray(v)?v:[];
const S=()=>store.get?.()||{};
const openTarget=(target,focus=null)=>{window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:target||'today'}));if(focus)setTimeout(()=>window.dispatchEvent(new CustomEvent('kamil:focus610',{detail:{focus,target}})),120)};
const addMatch=(out,q,kind,title,detail,target,id,focus)=>{if(norm(`${title} ${detail}`).includes(q))out.push({kind,title,detail,target,id,focus})};

export function searchExtended610(raw){
 const q=norm(raw);if(!q)return[];const s=S(),out=[];
 for(const x of A(s.propertyBook?.candidates))addMatch(out,q,'Investiční byt',x.name||x.title||'Nemovitost',[x.location,x.purchasePrice||x.priceCzk||x.price?money(x.purchasePrice||x.priceCzk||x.price):'',x.monthlyRent||x.rentCzk?`nájem ${money(x.monthlyRent||x.rentCzk)}`:''].filter(Boolean).join(' · '),'money',x.id,'property');
 for(const x of A(s.ticketBook?.watchlist))addMatch(out,q,'Ticket watchlist',x.name||x.event||x.title||'Sledovaná akce',[x.city,x.venue,x.date||x.eventDate].filter(Boolean).join(' · '),'tickets',x.id,'ticket-risk');
 for(const x of A(s.ticketBook?.opportunities||s.ticketOpportunities||s.ticket_market_opportunities))addMatch(out,q,'Ticket příležitost',x.name||x.event||x.title||'Příležitost',[x.city,x.category,x.maxBuyPrice||x.maxBuyPriceCzk?`max ${money(x.maxBuyPrice||x.maxBuyPriceCzk)}`:''].filter(Boolean).join(' · '),'tickets',x.id,'ticket-risk');
 for(const x of A(s.netWorthBook?.history))addMatch(out,q,'Historie majetku',x.title||x.label||`Snapshot ${x.asOf||x.date||''}`,[x.netKnown!=null?`netto ${money(x.netKnown)}`:'',x.knownAssets!=null?`aktiva ${money(x.knownAssets)}`:''].filter(Boolean).join(' · '),'money',x.id,'wealth-history');
 for(const x of A(s.personalSpending?.transactions).slice(0,250))addMatch(out,q,'Výdaj / transakce',x.merchant||x.title||x.name||x.category||'Transakce',[x.category,x.amount!=null?money(Math.abs(Number(x.amount||0))):'',x.date||x.bookedAt].filter(Boolean).join(' · '),'money',x.id,'spending');
 for(const x of A(s.delegations))addMatch(out,q,'Čekám na',x.title||x.name||x.waitingFor||'Čekající věc',[x.waitingFor,x.due||x.followUpAt].filter(Boolean).join(' · '),'today',x.id,'waiting');
 return out.slice(0,15)
}
function navIntent(raw){const q=norm(raw);const map=[
 [['ukaž reality','ukaz reality','ukaž byty','ukaz byty','investiční byty','investicni byty'],['money','property']],
 [['historie majetku','net worth historie','vývoj majetku','vyvoj majetku'],['money','wealth-history']],
 [['ticket risk','riziko vstupenek','exposure vstupenek'],['tickets','ticket-risk']],
 [['rodinný týden','rodinny tyden','family hub'],['family','family-week']]
 ];
 for(const [terms,target] of map)if(terms.includes(q))return{target:target[0],focus:target[1]};return null
}
function renderRows(rows){const box=document.querySelector('#commandResults');if(!box)return false;box.classList.remove('hidden');box.innerHTML=rows.map((x,i)=>`<div class="os610-search-row"><div><b>${h(x.title)}</b><small>${h(x.kind)}${x.detail?` · ${h(x.detail)}`:''}</small></div><button class="btn" data-os610-search="${i}">Otevřít</button></div>`).join('');box.querySelectorAll('[data-os610-search]').forEach(b=>b.addEventListener('click',()=>{const x=rows[Number(b.dataset.os610Search)];box.classList.add('hidden');openTarget(x.target,x.focus)}));return true}
export function renderExtendedResults610(raw){
 if(!String(raw||'').trim())return false;if(baseSearch(raw).length)return false;const rows=searchExtended610(raw);if(!rows.length)return false;return renderRows(rows)
}
export function executeExtendedCommand610(raw){
 const nav=navIntent(raw);if(nav){openTarget(nav.target,nav.focus);return true}
 if(baseSearch(raw).length)return false;const rows=searchExtended610(raw);if(rows.length===1){openTarget(rows[0].target,rows[0].focus);return true}if(rows.length>1){renderRows(rows);return true}return false
}
export function installCommandSearch610(){
 if(document.querySelector('link[data-upgrade610-css]'))return true;const l=document.createElement('link');l.rel='stylesheet';l.href='./upgrade610.css';l.dataset.upgrade610Css='1';document.head.appendChild(l);return true
}
