import {modal,h} from './utils.js';

const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const patterns=[
  /kolik.*(ticket|vstupenk)/,
  /kolik.*(cash|hotov|voln.*pen)/,
  /(nejlepsi|nejleps|top).*(byt|realit)/,
  /(co.*(ted|teď).*resit|co mam resit|priorit)/,
  /(strategie|strategy|weekly ceo|tydenni review|týdenní review)/
];
export function isStrategyQuestion790(q=''){const n=norm(q);return patterns.some(r=>r.test(n))}
function titleFor(q=''){const n=norm(q);if(/ticket|vstupenk/.test(n))return'Vstupenky';if(/cash|hotov|pen/.test(n))return'Volný cash';if(/byt|realit/.test(n))return'Reality';if(/strategie|strategy|weekly|tyden|týden/.test(n))return'Strategy & Control';return'Další nejlepší krok'}
export function renderStrategySuggestion790(q=''){
  if(!isStrategyQuestion790(q))return false;
  const box=document.querySelector('#commandResults');if(!box)return false;
  box.classList.remove('hidden');
  box.innerHTML=`<div class="search-row" data-strategy-command790><div><b>${h(titleFor(q))}</b><div class="muted">OS788 Strategy & Control · read-only odpověď z aktuálních dat</div></div><button class="btn" data-strategy-run790>Vyhodnotit</button></div>`;
  box.querySelector('[data-strategy-run790]')?.addEventListener('click',()=>{box.classList.add('hidden');void executeStrategyCommand790(q)});
  return true;
}
export async function executeStrategyCommand790(q=''){
  if(!isStrategyQuestion790(q))return false;
  try{
    const m=await import('./strategy788.js');
    const model=await m.buildStrategy788();
    const answer=m.universalAnswer786(q,model)||model.strategy?.monthFocus?.[0]?.reason||'Nemám dost aktuálních dat pro jistou odpověď.';
    await modal(`OS790 · ${titleFor(q)}`,`<div class="card"><div class="eyebrow">STRATEGY COMMAND</div><h2>${h(answer)}</h2><div class="row"><span>Decision confidence</span><b>${Number(model.confidence||0).toFixed(0)} %</b></div><div class="row"><span>Datové mezery</span><b>${Number(model.audit?.gaps?.length||model.audit?.issues?.length||0)}</b></div><p class="muted">Pouze read-only vyhodnocení. Žádná finanční, ticket ani betting akce se automaticky neprovedla.</p></div>`,[{label:'Otevřít Strategy & Control',value:'open'},{label:'Zavřít',value:null,primary:true}]).then(async choice=>{if(choice==='open')await m.openStrategy788()});
    return true;
  }catch(err){
    console.error('[OS790] strategy command failed',err);
    await modal('Strategy Command',`<div class="card"><h2>Strategy odpověď se nepodařila načíst.</h2><p class="muted">${h(err?.message||String(err||'Neznámá chyba'))}</p></div>`,[{label:'Zavřít',value:null,primary:true}]);
    return true;
  }
}
