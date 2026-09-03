import {store} from './state.js';

const VERSION=610;
const A=v=>Array.isArray(v)?v:[];
const N=v=>Number.isFinite(Number(v))?Number(v):0;
const U=v=>String(v||'').toUpperCase();
const ACTIVE=new Set(['HOLD','LISTED','ACTIVE','NOT_LISTED','']);
const money=v=>`${Math.round(N(v)).toLocaleString('cs-CZ')} Kč`;
function css(){if(document.querySelector('link[data-upgrade610-css]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href='./upgrade610.css';l.dataset.upgrade610Css='1';document.head.appendChild(l)}
function buyTotal(x){const q=Math.max(1,N(x.qty||x.quantity||1));return N(x.buyTotalCzk||x.buy_total_czk||x.buy)||N(x.buy_each_czk||x.buyEachCzk)*q}
function model(){
 const s=store.get(),rows=A(s.ticketBook?.items||s.ticket_inventory).filter(x=>ACTIVE.has(U(x.workflow||x.status))),groups=new Map();let invested=0;
 for(const x of rows){const value=buyTotal(x);invested+=value;const key=x.eventId||x.name||x.event||'Nezařazeno';groups.set(key,(groups.get(key)||0)+value)}
 const ranked=[...groups.entries()].map(([name,value])=>({name,value,pct:invested?value/invested*100:0})).sort((a,b)=>b.value-a.value),top=ranked[0]||null,decision=window.__KAMIL_TICKET_DECISION369__?.model||null,counts=decision?.counts||{};
 const cap=invested*.20,room=top?Math.max(0,cap-top.value):cap;
 return{invested,active:rows.length,groups:ranked,top,eventCapPct:20,room,overCap:!!top&&top.pct>20,counts:{buy:N(counts.BUY),sell:N(counts.SELL),lower:N(counts.LOWER),hold:N(counts.HOLD)}}
}
function card(m){return `<section class="os610-card" data-ticket-risk-summary610><div class="os610-head"><div><small>OS610 · TICKET RISK / EXPOSURE</small><h3>Kolik ticket kapitálu je koncentrované</h3><p>Rychlý pohled z lokálních pozic. Detailní ticket engine zůstává ve Vstupenkách.</p></div><span class="os610-badge">event cap ${m.eventCapPct} %</span></div><div class="os610-risk-row"><div><small>Aktivně investováno</small><b>${money(m.invested)}</b></div><div><small>Aktivní pozice</small><b>${m.active}</b></div><div><small>Největší event</small><b class="${m.overCap?'os610-bad':''}">${m.top?`${m.top.pct.toFixed(0)} %`:'—'}</b></div><div><small>Akční verdicts</small><b>${m.counts.buy} BUY · ${m.counts.sell+m.counts.lower} EXIT/PRICE</b></div></div>${m.top?`<div class="os610-delta" style="margin-top:10px">Největší koncentrace: ${m.top.name} · ${money(m.top.value)}. ${m.overCap?'Je nad 20% event limitem.':'Je pod 20% event limitem.'}</div>`:''}<div class="os610-history-actions"><button type="button" class="os610-btn" data-ticket-risk-open610>Otevřít detail Vstupenek</button></div></section>`}
function mount(){const root=document.querySelector('[data-command-center467-root]');if(!root)return false;let host=root.querySelector('[data-ticket-risk-summary610-host]');if(!host){host=document.createElement('div');host.dataset.ticketRiskSummary610Host='1';const personal=root.querySelector('[data-personal-upgrade600-host]');personal?personal.after(host):root.appendChild(host)}const m=model(),wrap=document.createElement('div');wrap.innerHTML=card(m);const next=wrap.firstElementChild,old=host.querySelector('[data-ticket-risk-summary610]');if(old)old.replaceWith(next);else host.appendChild(next);next.querySelector('[data-ticket-risk-open610]')?.addEventListener('click',()=>window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:'tickets'})));window.__KAMIL_TICKET_RISK_SUMMARY610__={version:VERSION,healthy:true,model:m,refresh:mount,at:Date.now()};return true}
export function installTicketRiskSummary610(){css();const ok=mount();window.addEventListener('kamil:ticket-decision369-updated',()=>setTimeout(mount,35),{passive:true});store.subscribe?.(()=>setTimeout(mount,70));return ok}
window.addEventListener('kamil:focus610',e=>{if(e.detail?.focus!=='ticket-risk')return;window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:'tickets'}))});
