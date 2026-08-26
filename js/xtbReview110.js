import {store} from './state.js';
import {xtbBoard,actionLabel} from './live24.js';
import {h} from './utils.js';

const U=v=>String(v||'').toUpperCase();
const cleanTicker=t=>U(t).replace(/\.US$/,'').trim();
function decisionMap(){return new Map(xtbBoard(store.get()).map(x=>[U(x.p.ticker),{p:x.p,d:x.d}]))}
function reviewChecklist(p,d){const gain=Number(p.net_profit_pct||0),items=[];
 items.push('Ověřit poslední výsledky firmy a datum příštích earnings.');
 items.push('Zkontrolovat, jestli se od nákupu nezměnila investiční teze nebo hlavní riziko firmy.');
 if(gain<=-8)items.push(`Pozice je přibližně ${Math.round(gain)} % od nákupní úrovně — zjistit, jestli pokles vznikl jen cenou trhu, nebo zhoršením fundamentu.`);
 if(Number(p.weightPct||0)>=10)items.push(`Prověřit koncentraci: pozice tvoří přibližně ${Number(p.weightPct).toFixed(1)} % sledovaného portfolia.`);
 items.push('Porovnat aktuální cenu s vlastním důvodem nákupu; nepřikupovat jen proto, že je titul levnější.');
 return items;
}
function outcomeRows(p,d){const gain=Number(p.net_profit_pct||0);return [
  {label:'PŘIKOUPIT',tone:'good',text:'Teze stále platí, výsledky/fundament se nezhoršily a aktuální cena nabízí lepší poměr výnos/riziko.'},
  {label:'DRŽET',tone:'hold',text:'Teze platí, ale cena není dost atraktivní pro další nákup nebo už je pozice dost velká.'},
  {label:'PRODAT / REDUKOVAT',tone:'bad',text:gain<0?'Důvod poklesu je fundamentální, investiční teze se zhoršila nebo je riziko vyšší než při nákupu.':'Teze se zhoršila, koncentrace je příliš vysoká nebo je vhodné chránit významnou část zisku.'}
 ];}
function closeModal(){document.querySelector('[data-xtb-review-modal]')?.remove()}
function openReview(ticker,item){closeModal();const {p,d}=item,modal=document.createElement('div');modal.dataset.xtbReviewModal='1';modal.className='d110-review-backdrop';const checklist=reviewChecklist(p,d),outcomes=outcomeRows(p,d),symbol=cleanTicker(ticker);modal.innerHTML=`<section class="d110-review-modal"><header><div><div class="eyebrow">XTB · OVĚŘIT POZICI</div><h2>${h(ticker)}${p.name?` · ${h(p.name)}`:''}</h2></div><button class="d110-review-close" aria-label="Zavřít">×</button></header><div class="d110-review-why"><b>Proč teď ověřit</b><p>${h(d.reason||'OS nemá dostatečně silný a čerstvý signál pro automatické přikoupení nebo prodej.')}</p><small>Confidence ${Math.round(Number(d.confidence||d.priority||0))}/100</small></div><h3>Co konkrétně zkontrolovat</h3><div class="d110-review-list">${checklist.map((x,i)=>`<div><span>${i+1}</span><p>${h(x)}</p></div>`).join('')}</div><h3>Co změní verdikt</h3><div class="d110-review-outcomes">${outcomes.map(x=>`<article class="${x.tone}"><b>${x.label}</b><p>${h(x.text)}</p></article>`).join('')}</div><div class="d110-review-rules"><div><b>Nákupní pravidlo</b><p>${h(d.buyRule||'Přikupovat až po potvrzení teze a atraktivnějšího poměru cena/riziko.')}</p></div><div><b>Prodejní pravidlo</b><p>${h(d.sellRule||'Prodávat při porušení teze, ne jen kvůli běžnému kolísání ceny.')}</p></div></div><footer><a class="btn" href="https://finance.yahoo.com/quote/${encodeURIComponent(symbol)}" target="_blank" rel="noopener noreferrer">Otevřít tržní data</a><button class="btn primary" data-review-done>Rozumím</button></footer></section>`;document.body.appendChild(modal);modal.querySelector('.d110-review-close')?.addEventListener('click',closeModal);modal.querySelector('[data-review-done]')?.addEventListener('click',closeModal);modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});}
export function enhanceXtbReview110(){const map=decisionMap();for(const row of document.querySelectorAll('.d110-tr')){const ticker=U(row.querySelector('.d110-pos b')?.textContent),item=map.get(ticker);if(!item)continue;const action=row.querySelector('.d110-action');if(!action)continue;const label=actionLabel(item.d.action||'HOLD');if(label!=='PROVĚŘIT')continue;action.textContent='OVĚŘIT POZICI';action.title='Klikni pro důvod, checklist a podmínky pro PŘIKOUPIT / DRŽET / PRODAT.';action.classList.add('d110-review-action');action.setAttribute('role','button');action.setAttribute('tabindex','0');action.onclick=()=>openReview(ticker,item);action.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openReview(ticker,item)}}}window.__KAMIL_XTB_REVIEW110__={at:Date.now(),reviewable:[...map.entries()].filter(([,x])=>actionLabel(x.d.action)==='PROVĚŘIT').map(([ticker])=>ticker)};}
