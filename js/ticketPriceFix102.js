import {loadTicketCloud660} from './ticketCloud660.js';
import {money} from './utils.js';

const n=v=>Number(v||0);
const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();

function findInventoryForCard(card,inventory=[]){
  const text=norm(card.textContent);
  const matches=inventory.filter(r=>text.includes(norm(r.event_name)));
  if(matches.length<=1)return matches[0]||null;
  return matches.find(r=>r.section&&text.includes(norm(r.section)))||matches[0]||null;
}
function marketMetric(card){
  return [...card.querySelectorAll('.metric')].find(x=>norm(x.querySelector('span')?.textContent).includes('viagogo trh'))||null;
}
function addFloorBadge(card){
  if(card.querySelector('[data-api-floor102]'))return;
  const line=card.querySelector('.ticket-source-line');
  if(!line)return;
  const badge=document.createElement('span');
  badge.dataset.apiFloor102='1';
  badge.className='tmw-rec neutral';
  badge.textContent='API FLOOR · NE PRO REPRICING';
  badge.title='Minimum celé akce z oficiálního Viagogo API. Není to sektorová resale cena.';
  line.appendChild(badge);
}

export async function applyTicketPriceFix102(host=document.querySelector('#ticketIntelView')){
  if(!host)return {ok:false,reason:'NO_HOST'};
  const cloud=await loadTicketCloud660();
  if(!cloud?.ok)return {ok:false,reason:'NO_CLOUD'};
  let marketShown=0,officialShown=0,missing=0;
  for(const card of host.querySelectorAll('.ti66-row')){
    const r=findInventoryForCard(card,cloud.inventory);
    if(!r)continue;
    const metric=marketMetric(card);
    if(!metric)continue;
    const label=metric.querySelector('span'),value=metric.querySelector('b');
    const src=cloud.sources?.get(r.id)?.viagogo||cloud.rawLatest?.get(r.id)||null;
    const market=n(src?.market_price_czk),official=n(src?.official_price_czk);
    if(market){
      if(label)label.textContent='Viagogo trh';
      if(value)value.textContent=money(market);
      marketShown++;
      continue;
    }
    if(official){
      if(label)label.textContent='Viagogo API minimum';
      if(value){value.textContent=money(official);value.title='Minimum celé akce z oficiálního Viagogo API; ne sektorová cena.';}
      addFloorBadge(card);
      officialShown++;
      continue;
    }
    missing++;
  }
  const result={ok:true,marketShown,officialShown,missing,at:new Date().toISOString()};
  window.__KAMIL_TICKET_PRICE_FIX102__=result;
  return result;
}
