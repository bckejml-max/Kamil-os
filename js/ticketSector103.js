import {cloudClient,session} from './cloud.js';
import {store} from './state.js';
import {formModal,h,money,toast} from './utils.js';
import {loadTicketCloud660} from './ticketCloud660.js';

const n=v=>Number(v||0);
const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
const ageHours=v=>{const t=Date.parse(v||'');return Number.isFinite(t)?Math.max(0,(Date.now()-t)/36e5):null};
const fresh=r=>{const a=ageHours(r?.verified_sector_price_checked_at);return a!==null&&a<=48&&n(r?.verified_sector_price_czk)>0};

function findInventoryForCard(card,inventory=[]){
  const text=norm(card.textContent),matches=inventory.filter(r=>text.includes(norm(r.event_name)));
  if(matches.length<=1)return matches[0]||null;
  return matches.find(r=>r.section&&text.includes(norm(r.section)))||matches[0]||null;
}
function marketMetric(card){
  return [...card.querySelectorAll('.metric')].find(x=>{const t=norm(x.querySelector('span')?.textContent);return t.includes('viagogo trh')||t.includes('viagogo api minimum')||t.includes('sektorova cena')})||null;
}
function ensureBadge(card,r){
  let b=card.querySelector('[data-sector103-badge]');if(!b){b=document.createElement('span');b.dataset.sector103Badge='1';b.className='tmw-rec neutral';(card.querySelector('.ticket-source-line')||card.querySelector('.row'))?.appendChild(b)}
  const p=n(r.verified_sector_price_czk),a=ageHours(r.verified_sector_price_checked_at);
  if(p&&fresh(r)){b.className='tmw-rec success';b.textContent=`SEKTOR OVĚŘEN · ${Math.round(a||0)} h`;b.title='Ručně ověřená cena stejného sektoru, platná maximálně 48 hodin pro rozhodovací engine.'}
  else if(p){b.className='tmw-rec neutral';b.textContent=`SEKTOR STALE · ${Math.round(a||0)} h`;b.title='Uložená sektorová cena je starší než 48 hodin a nesmí se považovat za live.'}
  else{b.className='tmw-rec critical';b.textContent='SEKTOR BEZ CENY';b.title='Chybí ověřená cena stejného sektoru.'}
}
function ensureButton(card,r,onSave){
  let b=card.querySelector('[data-sector103-edit]');if(b)return;
  const actions=card.querySelector('.ticket-page-actions')||card;
  b=document.createElement('button');b.type='button';b.className='btn';b.dataset.sector103Edit='1';b.textContent=n(r.verified_sector_price_czk)?'Aktualizovat sektorovou cenu':'Ověřit sektorovou cenu';
  b.onclick=async()=>{
    const old=n(r.verified_sector_price_czk)||'';
    const data=await formModal(`Sektorová cena: ${r.event_name}`,`<div class="decision-note"><b>Sektor ${h(r.section||'bez sekce')}</b><br>Sem vlož aktuální nejnižší srovnatelnou cenu za 1 ks ze stejného sektoru. Eventové minimum celé akce sem nepatří.</div><label class="field"><span>Cena za 1 ks (Kč)</span><input autofocus name="price" inputmode="decimal" value="${h(old)}" placeholder="např. 3490"></label><label class="field"><span>Zdroj</span><select name="source"><option value="viagogo">Viagogo</option><option value="stubhub">StubHub</option><option value="other">Jiný ověřený zdroj</option></select></label>`,{submitLabel:'Uložit ověřenou cenu'});
    if(!data)return;
    const price=Math.round(Number(String(data.price||'').replace(/\s/g,'').replace(',','.'))||0);if(price<=0){toast('Zadej platnou cenu za 1 ks.');return}
    const c=await cloudClient(),sess=await session();if(!c||!sess){toast('Cloud není připojený.');return}
    const checkedAt=new Date().toISOString(),source=String(data.source||'manual');
    const {error}=await c.from('ticket_inventory').update({verified_sector_price_czk:price,verified_sector_price_checked_at:checkedAt,verified_sector_price_source:source,updated_at:checkedAt}).eq('user_id',sess.user.id).eq('id',r.id);
    if(error){console.error(error);toast('Sektorovou cenu se nepodařilo uložit.');return}
    store.mutate('Ověřena sektorová cena vstupenky',s=>{const item=(s.ticketBook?.items||[]).find(x=>String(x.id)===String(r.id));if(item){item.marketPrice=price;item.marketPriceAsOf=checkedAt;item.marketPriceSource=`verified-sector:${source}`}}, {undo:true,cloud:true,audit:true});
    toast(`Sektor ${r.section||'—'} uložen: ${money(price)}`);await onSave();
  };
  actions.appendChild(b);
}
function addCoverage(host,inventory){
  const active=inventory.filter(r=>['LISTED','NOT_LISTED'].includes(r.market_status)),freshRows=active.filter(fresh),stale=active.filter(r=>n(r.verified_sector_price_czk)>0&&!fresh(r));
  let box=host.querySelector('[data-sector103-summary]');if(!box){box=document.createElement('section');box.dataset.sector103Summary='1';box.className='card';box.style.margin='16px 0';const hero=host.querySelector('.ticket-page-hero');hero?.after(box);if(!hero)host.prepend(box)}
  box.innerHTML=`<div class="eyebrow">TICKETS 103 · SECTOR PRICE</div><h2>Sektorová cenová pokrytost</h2><div class="metric-strip"><div class="metric"><span>Čerstvá ≤48 h</span><b>${freshRows.length}/${active.length}</b></div><div class="metric"><span>Stará</span><b>${stale.length}</b></div><div class="metric"><span>Bez sektoru</span><b>${Math.max(0,active.length-freshRows.length-stale.length)}</b></div></div><p class="muted">Čerstvá ověřená sektorová cena má přednost před eventovým API minimem. Event floor zůstává pouze orientační a nepoužívá se jako sektorový repricing.</p>`;
}
export async function enhanceTicketSector103(host=document.querySelector('#ticketIntelView')){
  if(!host)return{ok:false,reason:'NO_HOST'};const cloud=await loadTicketCloud660();if(!cloud?.ok)return{ok:false,reason:'NO_CLOUD'};
  addCoverage(host,cloud.inventory);
  const rerun=async()=>{await new Promise(r=>setTimeout(r,120));return enhanceTicketSector103(host)};
  let shown=0;
  for(const card of host.querySelectorAll('.ti66-row')){
    const r=findInventoryForCard(card,cloud.inventory);if(!r)continue;ensureBadge(card,r);ensureButton(card,r,rerun);
    const metric=marketMetric(card),p=n(r.verified_sector_price_czk),a=ageHours(r.verified_sector_price_checked_at);
    if(metric&&p){const label=metric.querySelector('span'),value=metric.querySelector('b');if(fresh(r)){if(label)label.textContent=`Sektorová cena ${r.section||''}`.trim();if(value){value.textContent=money(p);value.title=`Ověřeno ${Math.round(a||0)} h zpět · ${r.verified_sector_price_source||'manual'}`};shown++}else{if(!card.querySelector('[data-sector103-stale]')){const note=document.createElement('div');note.dataset.sector103Stale='1';note.className='muted';note.textContent=`Poslední sektorová cena ${money(p)} je ${Math.round(a||0)} h stará — obnov před repricingem.`;metric.after(note)}}}
  }
  const result={ok:true,freshShown:shown,at:new Date().toISOString()};window.__KAMIL_TICKET_SECTOR103__=result;return result;
}
