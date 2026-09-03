import {store} from './state.js';
import {norm,h,money} from './utils.js';
import {search as baseSearch} from './command.js';

const A=v=>Array.isArray(v)?v:[];
const S=()=>store.get?.()||{};
const fireFocus=(target,focus)=>window.dispatchEvent(new CustomEvent('kamil:focus610',{detail:{focus,target}}));
const openTarget=(target,focus=null)=>{window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:target||'today'}));if(focus)for(const ms of [120,420,900])setTimeout(()=>fireFocus(target,focus),ms)};
const addMatch=(out,q,kind,title,detail,target,id,focus)=>{if(norm(`${title} ${detail}`).includes(q))out.push({kind,title,detail,target,id,focus})};

export function searchExtended610(raw){
 const q=norm(raw);if(!q)return[];const s=S(),out=[];
 for(const x of A(s.propertyBook?.candidates))addMatch(out,q,'Reality 2.0',x.name||x.title||'Nemovitost',[x.location,x.purchasePrice||x.priceCzk||x.price?money(x.purchasePrice||x.priceCzk||x.price):'',x.monthlyRent||x.rentCzk?`nájem ${money(x.monthlyRent||x.rentCzk)}`:'',x.areaM2||x.sizeM2||x.floorArea||x.area?`${x.areaM2||x.sizeM2||x.floorArea||x.area} m²`:''].filter(Boolean).join(' · '),'money',x.id,'property-hub');
 for(const x of A(s.ticketBook?.watchlist))addMatch(out,q,'Vstupenky 2.0 · watchlist',x.name||x.event||x.title||'Sledovaná akce',[x.city,x.venue,x.date||x.eventDate].filter(Boolean).join(' · '),'tickets',x.id,'ticket-hub');
 for(const x of A(s.ticketBook?.opportunities||s.ticketOpportunities||s.ticket_market_opportunities))addMatch(out,q,'Vstupenky 2.0 · příležitost',x.name||x.event||x.title||'Příležitost',[x.city,x.category,x.maxBuyPrice||x.maxBuyPriceCzk?`max ${money(x.maxBuyPrice||x.maxBuyPriceCzk)}`:''].filter(Boolean).join(' · '),'tickets',x.id,'ticket-hub');
 for(const x of A(s.netWorthBook?.history))addMatch(out,q,'Historie majetku',x.title||x.label||`Snapshot ${x.asOf||x.date||''}`,[x.netKnown!=null?`netto ${money(x.netKnown)}`:'',x.knownAssets!=null?`aktiva ${money(x.knownAssets)}`:''].filter(Boolean).join(' · '),'money',x.id,'wealth-history');
 for(const x of A(s.personalSpending?.transactions).slice(0,250))addMatch(out,q,'Výdaj / transakce',x.merchant||x.title||x.name||x.category||'Transakce',[x.category,x.amount!=null?money(Math.abs(Number(x.amount||0))):'',x.date||x.bookedAt].filter(Boolean).join(' · '),'money',x.id,'spending');
 for(const x of A(s.personalInbox?.items))addMatch(out,q,'Inbox 2.0',x.title||x.subject||x.name||'Inbox položka',[x.category,x.description||x.notes||x.summary,x.due||x.deadline].filter(Boolean).join(' · '),'inbox',x.id,'inbox-hub');
 for(const x of A(s.inbox))addMatch(out,q,'Inbox 2.0',x.title||x.subject||x.name||'Inbox položka',[x.category,x.description||x.notes||x.summary,x.due||x.deadline].filter(Boolean).join(' · '),'inbox',x.id,'inbox-hub');
 for(const x of A(s.delegations))addMatch(out,q,'Waiting Center 2.0',x.title||x.name||x.waitingFor||'Čekající věc',[x.waitingOn||x.person||x.owner,x.expected||x.waitingForWhat,x.due||x.followUpAt].filter(Boolean).join(' · '),'inbox',x.id,'waiting-center');
 return out.slice(0,15)
}
function navIntent(raw){const q=norm(raw);const map=[
 [['dnes 2.0','dnes 2','today 2.0','today 2','co mám dnes udělat','co mam dnes udelat','co dnes udělat','co dnes udelat','hlavní priorita','hlavni priorita','co je dnes priorita'],['today',null]],
 [['inbox 2.0','inbox 2','central inbox','centrální inbox','centralni inbox','co je v inboxu','co mě čeká v inboxu','co me ceka v inboxu'],['inbox','inbox-hub']],
 [['waiting center 2.0','waiting center 2','waiting center','čekání 2.0','cekani 2.0','čekání 2','cekani 2','na koho čekám','na koho cekam','co čekám','co cekam','follow-upy','follow upy','koho urgovat','co urgovat'],['inbox','waiting-center']],
 [['co musím odpovědět','co musim odpovedet','komu odpovědět','komu odpovedet','co odepsat','na co odpovědět','na co odpovedet'],['inbox','inbox-reply']],
 [['co musím zaplatit','co musim zaplatit','co zaplatit','jaké platby čekají','jake platby cekaji'],['inbox','inbox-pay']],
 [['jaké mám termíny','jake mam terminy','co má termín','co ma termin','blížící termíny','blizici terminy'],['inbox','inbox-deadline']],
 [['jaké dokumenty řešit','jake dokumenty resit','co doložit','co dolozit','co podepsat','dokumenty k vyřízení','dokumenty k vyrizeni'],['inbox','inbox-document']],
 [['ukaž reality','ukaz reality','ukaž byty','ukaz byty','investiční byty','investicni byty','reality 2.0','reality 2','property hub','porovnej byty','srovnej byty'],['money','property-hub']],
 [['hypoteční scénáře','hypotecni scenare','financování bytu','financovani bytu'],['money','property']],
 [['historie majetku','net worth historie','vývoj majetku','vyvoj majetku'],['money','wealth-history']],
 [['vstupenky 2.0','vstupenky 2','tickets 2.0','tickets 2','ticket command center','co koupit vstupenky','co koupit dnes','co zlevnit vstupenky','co prodat vstupenky','volný kapitál vstupenky','volny kapital vstupenky'],['tickets','ticket-hub']],
 [['ticket risk','riziko vstupenek','exposure vstupenek'],['tickets','ticket-risk']],
 [['rodinný týden','rodinny tyden','family hub'],['family','family-week']],
 [['sázky 2.0','sazky 2.0','sázky 2','sazky 2','betting 2.0','betting 2','betting command center','co vsadit','co mám vsadit','co mam vsadit'],['betting','betting-hub']]
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
