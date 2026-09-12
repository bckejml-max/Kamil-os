import {ownEvent1100,ownObserver1100,schedule1100} from './runtimeOwnership1100.js';

const VERSION='501.0.2',OWNER='tickets.polish501';
let bound=false;
const active=()=>!!document.querySelector('#view-tickets.on,#view-tickets.active,[data-view-panel="tickets"].on,[data-view-panel="tickets"].active');

function parseCzk(text){const normalized=String(text||'').replace(/[\u00a0\u202f\s]/g,'');const match=normalized.match(/([0-9][0-9.,]*)Kč/i);if(!match)return 0;const numeric=match[1].replace(/\./g,'').replace(',','.');return Number(numeric)||0}
function fallbackCapital(host){const bought=host.querySelector(':scope > .td331-overview .td331-stat:nth-child(2)');return parseCzk(bought?.querySelector('small')?.textContent||'')}
function setText(el,text){if(el&&el.textContent!==text)el.textContent=text}
function polishRisk(host){const card=host.querySelector(':scope > .td331-overview [data-kpi-risk466]');if(!card)return;const modeled=Number(window.__KAMIL_TICKET_RISK438__?.var95||0),fallback=fallbackCapital(host),value=modeled||fallback;if(!value)return;setText(card.querySelector('b'),`${Math.round(value).toLocaleString('cs-CZ')} Kč`);setText(card.querySelector('small'),modeled?'heuristický downside proxy':'aktivně vložený kapitál')}
function polish(){if(!active())return false;document.documentElement.dataset.ticketPolish501='1';const host=document.querySelector('#ticketIntelView .td331');if(!host)return false;polishRisk(host);host.querySelectorAll('.td500-event-thumb').forEach(el=>{if(!el.title){const row=el.closest('[data-ticket-id]'),name=row?.querySelector('h3')?.textContent?.trim();if(name)el.title=name}});window.__KAMIL_TICKET_POLISH501__={version:VERSION,healthy:true,runtimeOwner:OWNER,at:Date.now()};return true}
function schedule(ms=160){schedule1100(OWNER,'polish',()=>{if(active())polish()},ms,{pauseWhenHidden:true})}
export function installTicketPolish501(){if(bound)return;bound=true;for(const event of ['kamil:view-change','kamil:ticket-desk331-updated','kamil:ticket-boot466-updated','kamil:ticket-risk438-updated','kamil:ticket-commander465-updated','kamil:ticket-refresh397-done'])ownEvent1100(OWNER,window,event,()=>schedule());const root=document.querySelector('#ticketIntelView');if(root)ownObserver1100(OWNER,root,{childList:true,subtree:true},()=>schedule(120));if(active())polish()}
