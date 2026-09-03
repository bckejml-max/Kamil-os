import {bettingSourceMutation691} from './bettingDomGuard691.js';

const STORAGE_KEY='kamil_betting_confirmed_542';
const VERSION='542.1.0';

const parseNumber=value=>{
 const m=String(value||'').replace(/\s/g,'').replace(',','.').match(/-?\d+(?:\.\d+)?/);
 return m?Number(m[0]):null;
};
const round=(value,digits=2)=>Number.isFinite(value)?Number(value.toFixed(digits)):null;
const escapeHtml=value=>String(value??'').replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));

function readConfirmed(){
 try{
  const parsed=JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');
  return parsed&&typeof parsed==='object'&&!Array.isArray(parsed)?parsed:{};
 }catch{return{}}
}
function writeConfirmed(value){
 try{localStorage.setItem(STORAGE_KEY,JSON.stringify(value));return true}catch{return false}
}
function normalize(value){return String(value||'').replace(/\s+/g,' ').trim().toLowerCase()}
function cleanStrongText(card){
 const strong=card.querySelector('.bet144-pickmain strong');if(!strong)return'';
 const clone=strong.cloneNode(true);clone.querySelectorAll('.bet560-corr,.bet564-urgency,.bet565-flag').forEach(x=>x.remove());
 return clone.textContent||'';
}
function fingerprint(card){
 const title=cleanStrongText(card);
 const detail=card.querySelector('.bet144-pickmain span')?.textContent||'';
 return normalize(`${title}|${detail}`);
}
function metric(card,label){
 const nodes=[...card.querySelectorAll('.bet144-stat')];
 const node=nodes.find(item=>normalize(item.querySelector('span')?.textContent)===normalize(label));
 return parseNumber(node?.querySelector('b')?.textContent);
}
function currentOdds(card){
 const text=cleanStrongText(card);
 const match=text.match(/@\s*([0-9]+(?:[,.][0-9]+)?)/);
 return match?Number(match[1].replace(',','.')):null;
}
function pickInfo(card){
 const modelPct=metric(card,'Model');
 const fair=metric(card,'Fair');
 const edge=metric(card,'Edge');
 const ev=metric(card,'EV');
 const odds=currentOdds(card);
 const p=Number.isFinite(modelPct)?modelPct/100:(Number.isFinite(fair)&&fair>1?1/fair:null);
 const evFloor=Number.isFinite(p)&&p>0?1.05/p:null;
 const edgeFloor=Number.isFinite(p)&&p>.04?1/(p-.04):null;
 const minOdds=Number.isFinite(evFloor)&&Number.isFinite(edgeFloor)?Math.max(evFloor,edgeFloor):null;
 const score=Math.max(0,Math.min(100,50+(Number(ev)||0)*1.7+(Number(edge)||0)*2.1));
 const confidence=Math.round(score);
 let units=.5;
 if(Number(ev)>=12&&Number(edge)>=7)units=1.5;
 else if(Number(ev)>=8&&Number(edge)>=5.5)units=1;
 else if(Number(ev)>=5&&Number(edge)>=4)units=.5;
 if(confidence>=85&&Number(ev)>=15&&Number(edge)>=8)units=2;
 const grade=confidence>=88?'A+':confidence>=78?'A':confidence>=68?'B+':'B';
 return{odds,modelPct,fair,edge,ev,minOdds:round(minOdds,2),confidence,units,grade};
}
function ensureStyles(){
 if(document.querySelector('style[data-bet542]'))return;
 const style=document.createElement('style');
 style.dataset.betting542='1';
 style.dataset.bet542='1';
 style.textContent=`
 .bet542-command{display:grid;grid-template-columns:minmax(220px,.72fr) minmax(0,1.9fr);gap:12px;padding:14px;border:1px solid rgba(103,167,255,.18);border-radius:16px;background:linear-gradient(135deg,rgba(14,34,52,.96),rgba(7,20,32,.97));box-shadow:0 14px 36px rgba(0,0,0,.14)}
 .bet542-verdict{display:flex;flex-direction:column;justify-content:center;min-height:126px;padding:18px;border:1px solid rgba(78,224,139,.18);border-radius:13px;background:radial-gradient(circle at 15% 0%,rgba(78,224,139,.14),transparent 58%),rgba(6,20,31,.7)}
 .bet542-kicker{font-size:9px;font-weight:900;letter-spacing:.12em;color:#7e98ad;text-transform:uppercase}.bet542-verdict strong{margin-top:8px;font-size:27px;letter-spacing:-.04em;color:#eff8f3}.bet542-verdict span{margin-top:6px;color:#8ba2b5;font-size:11px;line-height:1.45}
 .bet542-top{display:grid;gap:7px}.bet542-tophead{display:flex;align-items:center;justify-content:space-between;gap:10px;color:#8ca3b6;font-size:10px;font-weight:900;letter-spacing:.08em;text-transform:uppercase}
 .bet542-toplist{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}.bet542-mini{min-width:0;padding:11px;border:1px solid rgba(145,174,202,.12);border-radius:11px;background:rgba(4,14,23,.38)}.bet542-mini b{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#e8f2f8;font-size:11.5px}.bet542-mini small{display:block;margin-top:5px;color:#7690a4;font-size:9px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.bet542-minirow{display:flex;justify-content:space-between;gap:8px;margin-top:9px;color:#9fb4c5;font-size:9.5px}.bet542-minirow strong{color:#69e39a;font-size:10px}
 .bet542-actionrail{grid-column:1/-1;display:grid;grid-template-columns:repeat(3,minmax(90px,auto)) minmax(126px,auto);gap:7px;margin-top:2px}.bet542-decision{display:flex;flex-direction:column;justify-content:center;min-height:42px;padding:7px 9px;border:1px solid rgba(145,174,202,.09);border-radius:9px;background:rgba(4,14,23,.3)}.bet542-decision span{font-size:8px;color:#6f889c;text-transform:uppercase;letter-spacing:.055em}.bet542-decision b{margin-top:3px;color:#dce8f1;font-size:12px}.bet542-confirm{min-height:42px;border:1px solid rgba(78,224,139,.27);border-radius:9px;background:rgba(78,224,139,.12);color:#9ae9b7;font-size:10px;font-weight:900;cursor:pointer}.bet542-confirm:hover{background:rgba(78,224,139,.18)}
 .bet542-confirmed-note{padding:9px 11px;border:1px solid rgba(103,167,255,.12);border-radius:10px;background:rgba(103,167,255,.045);color:#829bb0;font-size:9.5px}.bet542-empty{grid-column:1/-1;display:grid;place-items:center;min-height:86px;color:#7890a4;font-size:11px;border:1px dashed rgba(145,174,202,.14);border-radius:11px}
 @media(max-width:900px){.bet542-command{grid-template-columns:1fr}.bet542-verdict{min-height:104px}.bet542-toplist{grid-template-columns:1fr}.bet542-actionrail{grid-template-columns:repeat(3,1fr)}.bet542-confirm{grid-column:1/-1}}
 @media(max-width:520px){.bet542-command{padding:10px}.bet542-actionrail{grid-template-columns:1fr 1fr}.bet542-actionrail .bet542-decision:nth-child(3),.bet542-confirm{grid-column:1/-1}.bet542-verdict strong{font-size:23px}}
 `;
 document.head.appendChild(style);
}
function ensureCommander(root){
 let node=root.querySelector('[data-bet542-command]');
 if(node)return node;
 const metrics=root.querySelector('.bet144-metrics');
 const scanner=root.querySelector('.bet144-scanner');
 if(!metrics||!scanner)return null;
 node=document.createElement('section');
 node.className='bet542-command';
 node.dataset.bet542Command='1';
 metrics.insertAdjacentElement('afterend',node);
 return node;
}
function visibleCards(root){
 const confirmed=readConfirmed();
 const cards=[...root.querySelectorAll('.bet144-scanbody .bet144-pick')];
 for(const card of cards){
  const key=fingerprint(card);
  if(confirmed[key])card.remove();
 }
 return [...root.querySelectorAll('.bet144-scanbody .bet144-pick')];
}
function renderCommander(root){
 const node=ensureCommander(root);
 if(!node)return;
 const cards=visibleCards(root);
 const scan=window.__KAMIL_VALUE_SCAN_144__||{};
 const loading=scan.loading===true;
 const top=cards.slice().sort((a,b)=>(pickInfo(b).ev||0)-(pickInfo(a).ev||0)).slice(0,3);
 let verdict='DNES NIC';
 let sub='Žádný ověřený value tip zatím nesplňuje filtry.';
 if(loading){verdict=cards.length?`DNES ${cards.length} TIP${cards.length===1?'':'Y'}`:'SKENUJI…';sub=cards.length?'Průběžné výsledky už splňují EV i edge filtr.':'Čekám na ověřené výsledky modelu.'}
 else if(cards.length){verdict=`DNES ${cards.length} ${cards.length===1?'SÁZKA':cards.length<5?'SÁZKY':'SÁZEK'}`;sub='Seřazeno podle EV. Ověř kurz proti minimálnímu kurzu a potvrď až po skutečném vsazení.'}
 const mini=top.length?top.map((card,index)=>{
  const info=pickInfo(card);
  const title=cleanStrongText(card)||'Value tip';
  const detail=card.querySelector('.bet144-pickmain span')?.textContent||'';
  return `<article class="bet542-mini"><b>${index+1}. ${escapeHtml(title)}</b><small>${escapeHtml(detail)}</small><div class="bet542-minirow"><span>${info.grade} · ${info.confidence}/100</span><strong>${info.units}u · min ${info.minOdds?.toFixed(2)||'—'}</strong></div></article>`;
 }).join(''):'<div class="bet542-empty">TOP 3 se objeví po value skenu.</div>';
 node.innerHTML=`<div class="bet542-verdict"><div class="bet542-kicker">BETTING COMMANDER · OS542</div><strong>${escapeHtml(verdict)}</strong><span>${escapeHtml(sub)}</span></div><div class="bet542-top"><div class="bet542-tophead"><span>TOP 3 dnešní value</span><span>${cards.length} aktivních</span></div><div class="bet542-toplist">${mini}</div></div>`;
}
function enhanceCards(root){
 const cards=visibleCards(root);
 for(const card of cards){
  if(card.querySelector('[data-bet542-actions]'))continue;
  const info=pickInfo(card);
  const key=fingerprint(card);
  const rail=document.createElement('div');
  rail.className='bet542-actionrail';
  rail.dataset.bet542Actions='1';
  rail.innerHTML=`<div class="bet542-decision"><span>Min. kurz</span><b>${info.minOdds?.toFixed(2)||'—'}</b></div><div class="bet542-decision"><span>Stake</span><b>${info.units}u</b></div><div class="bet542-decision"><span>Confidence</span><b>${info.grade} · ${info.confidence}/100</b></div><button class="bet542-confirm" type="button">✓ VSADIL JSEM</button>`;
  rail.querySelector('button')?.addEventListener('click',()=>{
   const confirmed=readConfirmed();
   confirmed[key]={at:new Date().toISOString(),title:cleanStrongText(card),detail:card.querySelector('.bet144-pickmain span')?.textContent||'',odds:info.odds,minOdds:info.minOdds,units:info.units,confidence:info.confidence};
   writeConfirmed(confirmed);
   card.remove();
   renderCommander(root);
   const scanner=root.querySelector('.bet144-scanner');
   if(scanner&&!scanner.querySelector('.bet144-pick'))scanner.insertAdjacentHTML('afterend','<div class="bet542-confirmed-note">✓ Potvrzený tip je uložený lokálně v Kamil OS a nebude se znovu zobrazovat jako aktivní doporučení na tomto zařízení.</div>');
  });
  card.appendChild(rail);
 }
}
let scheduled=false;
function refresh(){
 if(scheduled)return;
 scheduled=true;
 requestAnimationFrame(()=>{
  scheduled=false;
  const root=document.querySelector('#bettingView');
  if(!root)return;
  enhanceCards(root);
  renderCommander(root);
  window.__KAMIL_BETTING_COMMANDER542__={version:VERSION,healthy:true,confirmed:Object.keys(readConfirmed()).length,at:Date.now()};
 });
}
export function installBettingCommander542(){
 ensureStyles();
 refresh();
 const root=document.querySelector('#bettingView');
 if(!root)return;
 if(root.__bet542Observer)return;
 const observer=new MutationObserver(records=>{if(bettingSourceMutation691(records))refresh()});
 observer.observe(root,{childList:true,subtree:true});
 root.__bet542Observer=observer;
 window.addEventListener('storage',event=>{if(event.key===STORAGE_KEY)refresh()});
}

installBettingCommander542();