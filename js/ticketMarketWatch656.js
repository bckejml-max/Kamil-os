import {modal,h} from './utils.js';

const PREF_KEY='kamil-ticket-market-prefs-656';
const SNAP_KEY='kamil-ticket-market-snapshot-656';
const HISTORY_KEY='kamil-ticket-market-history-656';
const REFRESH_MS=30*60*1000;
const STATUS={LISTED:'Nabízíš',NOT_LISTED:'Nenabízíš',SOLD_UNDELIVERED:'Prodáno / nedoručeno',SOLD_WAITING_PAYMENT:'Čekáš na peníze',PAID:'Peníze přijaty'};
const money=n=>Number.isFinite(Number(n))?new Intl.NumberFormat('cs-CZ',{style:'currency',currency:'CZK',maximumFractionDigits:0}).format(Number(n)):'—';
const safeJson=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||'')||fallback}catch{return fallback}};
const prefs=()=>safeJson(PREF_KEY,{});
const savePrefs=x=>localStorage.setItem(PREF_KEY,JSON.stringify(x||{}));
const cached=()=>safeJson(SNAP_KEY,null);
const saveSnapshot=x=>{
  if(!x?.ok)return;localStorage.setItem(SNAP_KEY,JSON.stringify(x));
  const hist=safeJson(HISTORY_KEY,{});for(const r of x.results||[]){if(!r.market?.priceCzk)continue;const rows=Array.isArray(hist[r.id])?hist[r.id]:[];if(rows.at(-1)?.checkedAt===r.market.checkedAt)continue;rows.push({checkedAt:r.market.checkedAt,priceCzk:r.market.priceCzk,confidence:r.market.confidence});hist[r.id]=rows.slice(-40)}localStorage.setItem(HISTORY_KEY,JSON.stringify(hist));
};
async function inventory(){const r=await fetch('./data/ticket_inventory_2026.json',{cache:'no-store'});if(!r.ok)throw new Error(`Inventář HTTP ${r.status}`);return r.json()}
function mergePrefs(items){const p=prefs();return items.map(x=>({...x,viagogoUrl:p[x.id]?.viagogoUrl||x.viagogoUrl||null,askEachCzk:Number(p[x.id]?.askEachCzk||0)||null}))}
async function liveScan(force=false){
  const c=cached();if(!force&&c?.checkedAt&&Date.now()-Date.parse(c.checkedAt)<REFRESH_MS)return c;
  const inv=await inventory(),items=mergePrefs(inv.items||[]);const r=await fetch('/api/ticket-market-watch',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({items})});if(!r.ok)throw new Error(`Market Watch HTTP ${r.status}`);const j=await r.json();if(!j.ok)throw new Error(j.error||'Market Watch selhal');saveSnapshot(j);return j;
}
const recClass=code=>code==='LOWER'?'critical':code==='RAISE'||code==='LIST'?'success':code==='SOURCE_MISSING'||code==='FETCH_ERROR'||code==='NO_PRICE'?'warning':'neutral';
const sourceLabel=r=>r.market?.confidence==='section'?'stejná sekce':r.market?.confidence==='event-floor'?'minimum celé akce':r.source?.status==='missing'?'chybí zdroj':'zdroj nečitelný';
const trendFor=id=>{const rows=safeJson(HISTORY_KEY,{})[id]||[];if(rows.length<2)return null;const a=rows.at(-2)?.priceCzk,b=rows.at(-1)?.priceCzk;if(!a||!b)return null;const pct=(b/a-1)*100;return{pct,label:Math.abs(pct)<1?'beze změny':pct>0?`+${pct.toFixed(0)} %`:`${pct.toFixed(0)} %`}};
async function editItem656(item){
  const p=prefs(),cur=p[item.id]||{};const body=`<label class="field"><span>Viagogo event URL</span><input id="tmwUrl" type="url" value="${h(cur.viagogoUrl||item.viagogoUrl||'')}" placeholder="https://www.viagogo.com/.../E-..."></label><label class="field"><span>Moje aktuální nabídková cena / ks (Kč)</span><input id="tmwAsk" type="number" min="0" step="1" value="${h(cur.askEachCzk||'')}"></label><p class="muted">OS cenu na Viagogo nikdy sám nezmění. Tohle číslo slouží jen pro doporučení ZLEVNIT / ZDRAŽIT / DRŽET.</p>`;
  const choice=await modal(`Trh: ${item.label}`,body,[{label:'Uložit',value:'save',primary:true},{label:'Zrušit',value:null}]);if(choice!=='save')return false;
  const url=document.querySelector('#tmwUrl')?.value?.trim()||'',ask=Number(document.querySelector('#tmwAsk')?.value||0)||null;
  if(url&&!/^https:\/\/(?:www\.)?viagogo\.com\//i.test(url)){await modal('Neplatný odkaz','<p>Odkaz musí vést na veřejnou event stránku viagogo.com.</p>',[{label:'OK',value:null,primary:true}]);return false}
  p[item.id]={viagogoUrl:url||null,askEachCzk:ask};savePrefs(p);localStorage.removeItem(SNAP_KEY);return true;
}
function watchedRow(r){
  const market=r.market?.priceCzk?money(r.market.priceCzk):'—',trend=trendFor(r.id),rec=r.recommendation||{};
  return `<article class="card tmw-row"><div class="row"><div><b>${h(r.label)}</b><div class="muted">${h(STATUS[r.status]||r.status)} · ${r.qty} ks · nákup ${money(r.buyEachCzk)}/ks</div></div><span class="tmw-rec ${recClass(rec.code)}">${h(rec.label||'SLEDOVAT')}</span></div><div class="row"><span>Viagogo trh</span><b>${market}</b></div><div class="row"><span>Srovnání</span><b>${h(sourceLabel(r))}${trend?` · ${h(trend.label)}`:''}</b></div>${r.askEachCzk?`<div class="row"><span>Moje cena</span><b>${money(r.askEachCzk)}</b></div>`:''}<p class="muted">${h(rec.reason||r.source?.message||'')}</p><button class="btn" data-tmw-edit="${h(r.id)}">${r.source?.status==='missing'?'Doplnit Viagogo odkaz':r.status==='LISTED'&&!r.askEachCzk?'Doplnit moji cenu':'Upravit sledování'}</button></article>`;
}
function fulfillmentRows(items){const rows=items.filter(x=>['SOLD_UNDELIVERED','SOLD_WAITING_PAYMENT'].includes(x.status));if(!rows.length)return'';return `<section class="card"><div class="eyebrow">PRODANÉ — UŽ NEREPRICOVAT</div>${rows.map(x=>`<div class="row"><div><b>${h(x.label)}</b><div class="muted">${x.qty} ks · ${h(STATUS[x.status])}</div></div><b>${x.soldEachCzk?money(x.soldEachCzk)+'/ks':'—'}</b></div>`).join('')}</section>`}
export async function openTicketMarketWatch656(force=false){
  let inv;try{inv=await inventory()}catch(e){return modal('Ticket Market Watch',`<p>Inventář se nepodařilo načíst: ${h(e.message)}</p>`,[{label:'Zavřít',value:null,primary:true}])}
  let snap;try{snap=await liveScan(force)}catch(e){snap=cached()||{ok:false,results:[],checkedAt:null,error:e.message}}
  const byId=new Map((snap.results||[]).map(x=>[x.id,x])),merged=mergePrefs(inv.items||[]),watch=merged.filter(x=>['LISTED','NOT_LISTED'].includes(x.status)).map(x=>byId.get(x.id)||{...x,source:{status:x.viagogoUrl?'error':'missing',message:x.viagogoUrl?'Poslední scan selhal.':'Chybí Viagogo URL'},recommendation:{code:x.viagogoUrl?'FETCH_ERROR':'SOURCE_MISSING',label:x.viagogoUrl?'OVĚŘIT ZDROJ':'DOPLNIT VIAGOGO ODKAZ',reason:x.viagogoUrl?'Zkus obnovit trh.':'Přidej konkrétní event stránku.'}});
  const checked=snap.checkedAt?new Date(snap.checkedAt).toLocaleString('cs-CZ'):'zatím neproběhl',coverage=watch.filter(x=>x.source?.status==='ok').length;
  const body=`<div class="card"><div class="eyebrow">TICKET MARKET WATCH 65.6</div><h2>Viagogo trh bez automatického prodeje</h2><div class="row"><span>Nabízíš</span><b>${watch.filter(x=>x.status==='LISTED').reduce((a,x)=>a+Number(x.qty||0),0)} ks</b></div><div class="row"><span>Nenabízíš</span><b>${watch.filter(x=>x.status==='NOT_LISTED').reduce((a,x)=>a+Number(x.qty||0),0)} ks</b></div><div class="row"><span>Živé zdroje</span><b>${coverage}/${watch.length}</b></div><div class="row"><span>Poslední kontrola</span><b>${h(checked)}</b></div><p class="muted">Kontrola běží při otevření OS a potom na pozadí každých 30 minut. OS pouze doporučuje — nikdy sám neupraví cenu, listing ani prodej.</p></div>${watch.map(watchedRow).join('')}${fulfillmentRows(merged)}`;
  const choice=await modal('Ticket Market Watch',body,[{label:'Obnovit Viagogo teď',value:'refresh',primary:true},{label:'Zavřít',value:null}]);
  document.querySelectorAll('[data-tmw-edit]').forEach(()=>{});
  if(choice==='refresh'){localStorage.removeItem(SNAP_KEY);return openTicketMarketWatch656(true)}return choice;
}
export async function openTicketMarketItem656(id){const inv=await inventory(),item=mergePrefs(inv.items||[]).find(x=>x.id===id);if(!item)return false;const changed=await editItem656(item);if(changed)return openTicketMarketWatch656(true);return false}
export function bindTicketMarketWatch656(){
  document.addEventListener('click',async e=>{const b=e.target?.closest?.('[data-tmw-edit]');if(!b)return;e.preventDefault();await openTicketMarketItem656(b.dataset.tmwEdit)});
}
let timer=null;
export function startTicketMarketAuto656(){
  bindTicketMarketWatch656();const run=()=>liveScan(false).catch(()=>null);setTimeout(run,3500);if(timer)clearInterval(timer);timer=setInterval(run,REFRESH_MS);
}
