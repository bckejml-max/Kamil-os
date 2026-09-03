const LEDGER_STORE='kamil_betting_ledger_543';
const SNAP_STORE='kamil_betting_snapshots_545';
const VERSION='560.0.0';
const MAX_EXPOSURE_PCT=0.08;
const MAX_EVENT_PICKS=2;

const money=v=>`${Math.round(Number(v||0)).toLocaleString('cs-CZ')} Kč`;
const pct=v=>`${Number(v||0).toLocaleString('cs-CZ',{minimumFractionDigits:1,maximumFractionDigits:1})} %`;
const num=v=>{const n=Number(String(v??'').replace(',','.').replace(/[^0-9.+-]/g,''));return Number.isFinite(n)?n:null};
const esc=v=>String(v??'').replace(/[&<>'\"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[ch]));
function readJson(key,fallback){try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}}
function writeJson(key,value){localStorage.setItem(key,JSON.stringify(value))}
function ledger(){const s=readJson(LEDGER_STORE,{bets:[],bankrollCzk:0,unitCzk:0});s.bets=Array.isArray(s.bets)?s.bets:[];return s}
function fingerprint(card){const title=card.querySelector('.bet144-pickmain strong')?.textContent?.trim()||'';const detail=card.querySelector('.bet144-pickmain span')?.textContent?.trim()||'';return `${detail}|${title.replace(/@\s*[0-9.,]+/,'')}`.toLowerCase()}
function cardData(card){
 const title=card.querySelector('.bet144-pickmain strong')?.textContent?.trim()||'';
 const detail=card.querySelector('.bet144-pickmain span')?.textContent?.trim()||'';
 const stats=Object.fromEntries([...card.querySelectorAll('.bet144-stat')].map(x=>[(x.querySelector('span')?.textContent||'').trim(),num(x.querySelector('b')?.textContent)]));
 const decisions=Object.fromEntries([...card.querySelectorAll('.bet542-decision')].map(x=>[(x.querySelector('span')?.textContent||'').trim(),num(x.querySelector('b')?.textContent)]));
 const odds=num(title.match(/@\s*([0-9]+(?:[,.][0-9]+)?)/)?.[1]);
 const parts=detail.split('·').map(x=>x.trim());
 return{key:fingerprint(card),title:title.replace(/^🟢\s*/,'').replace(/\s*@\s*[0-9.,]+\s*$/,''),event:parts[0]||detail,market:parts[1]||'Sázka',source:parts[2]||'model',odds,modelPct:stats.Model,edgePp:stats.Edge,evPct:stats.EV,fair:stats.Fair,minOdds:decisions['Min. kurz'],baseUnits:decisions.Stake,confidence:decisions.Confidence};
}
function settledHistory(){return ledger().bets.filter(b=>['WIN','LOSS','VOID'].includes(String(b.status||'').toUpperCase()))}
function calibration(){
 const settled=settledHistory().filter(b=>Number.isFinite(Number(b.modelProbability))&&['WIN','LOSS'].includes(String(b.status||'').toUpperCase()));
 if(!settled.length)return{n:0,brier:null,gap:null,buckets:[]};
 let brier=0,gap=0;const buckets={};
 for(const b of settled){const p=Number(b.modelProbability),y=String(b.status).toUpperCase()==='WIN'?1:0;brier+=(p-y)**2;gap+=Math.abs(p-y);const k=`${Math.floor(p*10)*10}-${Math.min(100,Math.floor(p*10)*10+9)}%`;const r=buckets[k]||(buckets[k]={label:k,n:0,p:0,y:0});r.n++;r.p+=p;r.y+=y}
 return{n:settled.length,brier:brier/settled.length,gap:gap/settled.length,buckets:Object.values(buckets).map(r=>({...r,forecast:r.p/r.n,actual:r.y/r.n}))};
}
function calibrationFactor(){const c=calibration();if(c.n<20)return 1;if(c.brier<=0.20)return 1.05;if(c.brier<=0.24)return 1;if(c.brier<=0.28)return 0.8;return 0.6}
function baseUnits(d){if(Number(d.evPct)>=15&&Number(d.edgePp)>=8)return 2;if(Number(d.evPct)>=12&&Number(d.edgePp)>=7)return 1.5;if(Number(d.evPct)>=8&&Number(d.edgePp)>=5.5)return 1;return 0.5}
function currentExposure(){return ledger().bets.filter(b=>String(b.status||'OPEN').toUpperCase()==='OPEN').reduce((s,b)=>s+Number(b.stakeCzk||0),0)}
function stakeFor(d,eventRank=1){
 const s=ledger(),bank=Number(s.bankrollCzk||0),unit=Number(s.unitCzk||0);
 let units=(Number(d.baseUnits)||baseUnits(d))*calibrationFactor();
 if(eventRank===2)units*=0.5;if(eventRank>MAX_EVENT_PICKS)units=0;
 units=Math.max(0,Math.round(units*4)/4);
 const raw=unit?units*unit:0;
 const maxExposure=bank?bank*MAX_EXPOSURE_PCT:Infinity;
 const room=Math.max(0,maxExposure-currentExposure());
 const stake=bank?Math.min(raw,room):raw;
 return{units,stakeCzk:Math.max(0,Math.floor(stake/10)*10),blocked:units===0||(bank>0&&room<=0),room,maxExposure};
}
function snapshotCards(cards){
 const store=readJson(SNAP_STORE,{items:{},updatedAt:null});store.items=store.items||{};const now=new Date().toISOString();
 for(const card of cards){const d=cardData(card);if(!d.key||!d.odds)continue;const row=store.items[d.key]||(store.items[d.key]={key:d.key,event:d.event,market:d.market,title:d.title,observations:[]});const last=row.observations[row.observations.length-1];if(!last||Number(last.odds)!==Number(d.odds)||Date.now()-Date.parse(last.at)>10*60*1000)row.observations.push({at:now,odds:d.odds});if(row.observations.length>100)row.observations=row.observations.slice(-100);row.lastSeenAt=now;row.lastObservedOdds=d.odds;}
 store.updatedAt=now;writeJson(SNAP_STORE,store);
 return store;
}
function enrichLedgerWithClv(){
 const state=ledger(),snap=readJson(SNAP_STORE,{items:{}}),items=Object.values(snap.items||{});let changed=false;
 for(const b of state.bets){const text=`${b.event||''}|${b.selection||b.label||''}`.toLowerCase();const hit=items.find(x=>text.includes(String(x.event||'').toLowerCase())&&String(x.title||'')&&text.includes(String(x.title||'').toLowerCase()));if(!hit)continue;const close=Number(hit.lastObservedOdds);if(!close)continue;if(Number(b.lastObservedOdds)!==close){b.lastObservedOdds=close;b.lastOddsObservedAt=hit.lastSeenAt;changed=true}if(['WIN','LOSS','VOID'].includes(String(b.status||'').toUpperCase())&&!b.closingOddsCandidate){b.closingOddsCandidate=close;b.clvCandidatePct=Number(b.odds)&&close?Number(((Number(b.odds)/close-1)*100).toFixed(2)):null;changed=true}}
 if(changed)writeJson(LEDGER_STORE,state);
}
function rankCards(cards){
 const rows=cards.map(card=>({card,d:cardData(card)})).filter(x=>x.d.odds&&Number.isFinite(Number(x.d.evPct))).sort((a,b)=>Number(b.d.evPct)-Number(a.d.evPct));
 const eventCounts={};
 return rows.map(row=>{const k=row.d.event.toLowerCase();eventCounts[k]=(eventCounts[k]||0)+1;const stake=stakeFor(row.d,eventCounts[k]);return{...row,eventRank:eventCounts[k],stake}});
}
function ensureStyles(){if(document.querySelector('style[data-bet560]'))return;const s=document.createElement('style');s.dataset.bet560='1';s.textContent=`
.bet560{display:grid;gap:10px;padding:14px;border:1px solid rgba(99,179,237,.18);border-radius:15px;background:linear-gradient(140deg,rgba(10,28,44,.86),rgba(5,18,30,.9))}.bet560-head{display:flex;justify-content:space-between;gap:10px;align-items:center}.bet560-head h3{margin:0;font-size:15px}.bet560-verdict{font-size:12px;font-weight:900;color:#9fd7ff}.bet560-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:7px}.bet560-kpi{padding:9px;border-radius:9px;background:rgba(150,175,198,.05)}.bet560-kpi span{display:block;font-size:8px;color:#7890a5;text-transform:uppercase}.bet560-kpi b{display:block;margin-top:3px;font-size:12px;color:#e4eef6}.bet560-list{display:grid;gap:6px}.bet560-row{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:9px;align-items:center;padding:8px;border-radius:9px;background:rgba(150,175,198,.035)}.bet560-row b{display:block;font-size:10px;color:#dce8f1}.bet560-row small{display:block;margin-top:2px;font-size:8px;color:#71899d}.bet560-stake{font-weight:900;color:#8fe0ad;font-size:10px}.bet560-block{color:#f0c979}.bet560-tag{font-size:8px;padding:4px 6px;border-radius:6px;background:rgba(96,165,250,.08);color:#9ebbd4}.bet560-cal{font-size:9px;color:#7f96a9}.bet560-corr{margin-left:6px;padding:3px 5px;border-radius:6px;font-size:8px;font-weight:800;background:rgba(240,183,77,.09);color:#e8c97f}.bet560-card-stake{margin-top:6px;font-size:9px;font-weight:900;color:#8fe0ad}.bet560-card-stake.blocked{color:#e8c97f}@media(max-width:700px){.bet560-kpis{grid-template-columns:repeat(2,1fr)}.bet560-row{grid-template-columns:1fr auto}.bet560-row .bet560-tag{display:none}}
`;document.head.appendChild(s)}
function decorateCards(ranked){
 for(const row of ranked){const card=row.card;card.dataset.bet560Key=row.d.key;let note=card.querySelector('.bet560-card-stake');if(!note){note=document.createElement('div');note.className='bet560-card-stake';card.querySelector('.bet144-pickmain')?.appendChild(note)}
  if(row.stake.blocked||row.eventRank>MAX_EVENT_PICKS){note.className='bet560-card-stake blocked';note.textContent=row.eventRank>MAX_EVENT_PICKS?'⚠ Korelace: SKIP':'⚠ Limit expozice: SKIP';}
  else note.textContent=`Doporučený vklad: ${row.stake.units.toFixed(2)}u${row.stake.stakeCzk?` · ${money(row.stake.stakeCzk)}`:''}`;
  const btn=card.querySelector('.bet542-confirm');if(btn){btn.disabled=row.stake.blocked||row.eventRank>MAX_EVENT_PICKS;btn.dataset.bet560Stake=String(row.stake.stakeCzk||0);btn.dataset.bet560Units=String(row.stake.units||0)}
  if(row.eventRank===2&&!card.querySelector('.bet560-corr')){const t=document.createElement('span');t.className='bet560-corr';t.textContent='korelace ×0,5';card.querySelector('.bet144-pickmain strong')?.appendChild(t)}
 }
}
function commanderHtml(ranked){
 const allowed=ranked.filter(r=>!r.stake.blocked&&r.eventRank<=MAX_EVENT_PICKS).slice(0,3),s=ledger(),c=calibration();const total=allowed.reduce((x,r)=>x+r.stake.stakeCzk,0);const snap=readJson(SNAP_STORE,{items:{}});const snapshotCount=Object.values(snap.items||{}).reduce((x,r)=>x+(r.observations?.length||0),0);
 const rows=allowed.length?allowed.map((r,i)=>`<div class="bet560-row"><div><b>#${i+1} ${esc(r.d.title)} @ ${Number(r.d.odds).toFixed(2)}</b><small>${esc(r.d.event)} · EV ${pct(r.d.evPct)} · edge ${Number(r.d.edgePp||0).toFixed(1)} pp</small></div><span class="bet560-stake">${r.stake.stakeCzk?money(r.stake.stakeCzk):r.stake.units.toFixed(2)+'u'}</span><span class="bet560-tag">${r.eventRank===2?'½ korelace':'BET'}</span></div>`).join(''):'<div class="bet560-cal">Aktuálně žádná schválená sázka.</div>';
 const verdict=allowed.length?`DNES VSADIT ${allowed.length}`:'DNES NIC';
 return `<section class="bet560" data-bet560><div class="bet560-head"><h3>🧠 Daily Betting Commander · OS560</h3><span class="bet560-verdict">${verdict}</span></div><div class="bet560-kpis"><div class="bet560-kpi"><span>Celkový vklad</span><b>${total?money(total):'0 Kč'}</b></div><div class="bet560-kpi"><span>Bankroll / 1u</span><b>${s.bankrollCzk?money(s.bankrollCzk):'nenastaven'} / ${s.unitCzk?money(s.unitCzk):'—'}</b></div><div class="bet560-kpi"><span>Calibration</span><b>${c.n?`Brier ${c.brier.toFixed(3)}`:'čekám na historii'}</b></div><div class="bet560-kpi"><span>Odds snapshots</span><b>${snapshotCount}</b></div></div><div class="bet560-list">${rows}</div><div class="bet560-cal">Staking: bankroll + 1u + EV/edge + historie modelu · max expozice ${Math.round(MAX_EXPOSURE_PCT*100)} % bankrollu · max ${MAX_EVENT_PICKS} korelované tipy na zápas. CLV používá poslední zachycený předzápasový kurz; plný 24/7 closing vyžaduje serverový scheduler.</div></section>`;
}
function render(){const root=document.querySelector('#bettingView');if(!root)return;const cards=[...root.querySelectorAll('.bet144-pick')];snapshotCards(cards);enrichLedgerWithClv();const ranked=rankCards(cards);decorateCards(ranked);const html=commanderHtml(ranked);const old=root.querySelector('[data-bet560]');if(old)old.outerHTML=html;else{const anchor=root.querySelector('[data-bet542-command]')||root.querySelector('.bet144-metrics');anchor?.insertAdjacentHTML('afterend',html)}window.__KAMIL_BETTING_INTELLIGENCE560__={version:VERSION,picks:ranked.length,approved:ranked.filter(r=>!r.stake.blocked&&r.eventRank<=MAX_EVENT_PICKS).length,calibration:calibration(),at:Date.now()}}
function captureStake(event){const btn=event.target?.closest?.('.bet542-confirm');if(!btn||btn.disabled)return;const card=btn.closest('.bet144-pick');if(!card)return;const d=cardData(card),stakeCzk=Number(btn.dataset.bet560Stake||0),units=Number(btn.dataset.bet560Units||0);setTimeout(()=>{const state=ledger();const candidates=state.bets.filter(b=>String(b.status||'OPEN').toUpperCase()==='OPEN');const b=candidates.slice().reverse().find(x=>String(x.label||x.selection||'').toLowerCase().includes(d.title.toLowerCase())||String(x.event||'').toLowerCase().includes(d.event.toLowerCase()));if(b){b.stakeCzk=stakeCzk||b.stakeCzk||0;b.units=units||b.units;b.event=d.event;b.market=b.market||d.market;b.modelProbability=b.modelProbability||(d.modelPct!=null?Number(d.modelPct)/100:null);b.edgePctPoints=b.edgePctPoints??d.edgePp;b.evPct=b.evPct??d.evPct;b.lastObservedOdds=d.odds;b.lastOddsObservedAt=new Date().toISOString();writeJson(LEDGER_STORE,state)}render()},80)}
let timer=null;
export function installBettingIntelligence560(){ensureStyles();const root=document.querySelector('#bettingView');if(!root)return false;if(!root.__bet560Observer){let scheduled=false;const o=new MutationObserver(()=>{if(scheduled)return;scheduled=true;setTimeout(()=>{scheduled=false;render()},120)});o.observe(root,{childList:true,subtree:true});root.__bet560Observer=o;root.addEventListener('click',captureStake,true)}render();if(!timer)timer=setInterval(render,60*1000);return true}
installBettingIntelligence560();
