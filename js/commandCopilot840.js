import {h,modal} from './utils.js';
import {autocomplete791,contextualFollowups795,answer840} from './copilot840.js';
import {buildCopilot842,recordFeedback842} from './copilotFeedback842.js';
const KEY='kamil.command.history.840';
const SHORTCUTS={
 '/today':'co mám teď řešit',
 '/cash':'kolik mám volný cash',
 '/tickets':'kolik mám ve vstupenkách',
 '/property':'nejlepší byt',
 '/bets':'riziko sázek',
 '/week':'weekly ceo review'
};
const readHistory=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return[]}};
const saveHistory=q=>{try{const n=[q,...readHistory().filter(x=>x!==q)].slice(0,20);localStorage.setItem(KEY,JSON.stringify(n))}catch{}};
const normalizeShortcut=q=>SHORTCUTS[String(q||'').trim().toLowerCase()]||String(q||'').trim();
export function canHandleCopilot841(q=''){
 const raw=String(q||'').trim(),n=raw.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 if(SHORTCUTS[raw.toLowerCase()])return true;
 return /(kolik.*(cash|hotov|vstupenk|ticket|majet)|ktery.*(byt|realit)|nejlepsi.*(byt|realit)|co mam.*(ted|dnes)|co mám.*(teď|dnes)|mam dnes|mám dnes|nejvetsi riz|největší riz|weekly|strategie|strategy|stop.*(rule|saz)|ticket.*(prodat|expoz)|cilov.*cen|cílov.*cen|riziko.*saz|30\s*minut)/i.test(n);
}
function renderSuggestions(input){
 const box=document.querySelector('#commandResults');if(!box)return;
 const q=String(input?.value||'').trim(),items=autocomplete791(q);
 if(!items.length){box.classList.add('hidden');return;}
 box.classList.remove('hidden');
 box.innerHTML=items.map((x,i)=>`<button class="search-row" data-copilot-suggestion840="${i}"><div><b>${h(x.key?`${x.key} · ${x.label}`:x.label)}</b><div class="muted">OS842 Copilot návrh</div></div></button>`).join('');
 box.querySelectorAll('[data-copilot-suggestion840]').forEach((el,i)=>el.addEventListener('click',()=>{input.value=items[i].query;input.focus()}));
}
function constrainedAnswer841(q,model){
 const n=String(q||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 if(/30\s*minut/.test(n)){
  const noSpend=/nechci.*(utracet|utratit)|bez.*(utraceni|nakupu)|neutracet/.test(n);
  const candidates=[...(model.notifications||[])].filter(x=>!noSpend||!['MONEY','TICKETS','BETTING'].includes(String(x.area||'').toUpperCase()));
  const x=candidates[0]||model.nextBest;
  return x?`Na příštích 30 minut: ${x.title||x.action}. ${x.detail||x.reason||''}`:'Na 30 minut teď nemám dost kvalitních dat pro lepší doporučení.';
 }
 if(/riziko.*saz|saz.*riziko|betting.*risk/.test(n)){
  const b=model.control?.betting;
  if(!b)return'Nemám dost betting dat pro posouzení rizika.';
  return b.stop?`Betting STOP: ${b.stopReason}.`:`Betting stop rule není aktivní; korelovaných skupin je ${b.correlated?.length||0}.`;
 }
 if(/weekly/.test(n)){
  const w=model.weekly||{};
  return `Weekly review: cash ${Math.round(Number(w.money?.cash||0)).toLocaleString('cs-CZ')} Kč, pracovní overdue ${Number(w.work?.overdue||0)}, datová confidence ${Number(w.data?.confidence||0).toFixed(0)} %.`;
 }
 return null;
}
async function feedbackChoice842(choice,{raw,answer,item}){
 if(choice==='up'){recordFeedback842({query:raw,answer,item,vote:'up',reason:'useful'});return true;}
 if(choice!=='down')return false;
 const reason=await modal('Co bylo špatně?',`<div class="card"><div class="eyebrow">OS842 · FEEDBACK</div><p>Vyber hlavní důvod. Feedback upravuje jen jemné pořadí, ne bezpečnostní pravidla.</p></div>`,[{label:'Nerelevantní',value:'irrelevant'},{label:'Špatná data',value:'bad_data'},{label:'Špatná priorita',value:'bad_priority'},{label:'Příliš obecné',value:'too_generic'},{label:'Jiné',value:'other'},{label:'Zrušit',value:null}]);
 if(reason)recordFeedback842({query:raw,answer,item,vote:'down',reason});
 return true;
}
async function run(raw){
 const q=normalizeShortcut(raw);saveHistory(raw);
 try{
  const model=await buildCopilot842();
  const answer=constrainedAnswer841(q,model)||answer840(q,model);
  if(!answer)return false;
  const follow=contextualFollowups795(q),item=model.nextBest||null;
  const body=`<div class="card"><div class="eyebrow">OS840 · COPILOT · OS842 FEEDBACK</div><h2>${h(answer)}</h2><div class="row"><span>Confidence</span><b>${Number(model.confidence.overall||0).toFixed(0)} %</b></div><div class="row"><span>OS Health</span><b>${Number(model.health||0).toFixed(0)} %</b></div><div class="row"><span>Feedback historie</span><b>${Number(model.feedback842?.count||0)}</b></div><p class="muted">Read-only odpověď. Feedback může změnit pořadí maximálně o ±5 bodů.</p></div><div class="card"><div class="eyebrow">NAVAZUJÍCÍ DOTAZY</div>${follow.map(x=>`<div class="row"><span>${h(x)}</span></div>`).join('')}</div>`;
  const choice=await modal('Kamil OS Copilot',body,[{label:'👍 Užitečné',value:'up',primary:true},{label:'👎 Neužitečné',value:'down'},{label:'Otevřít Copilot & Control',value:'open'},{label:'Zavřít',value:null}]);
  if(choice==='open'){const m=await import('./copilotFeedback842.js');return m.openCopilot842()}
  if(choice==='up'||choice==='down')return feedbackChoice842(choice,{raw,answer,item});
  return true;
 }catch(err){console.error('[OS842] copilot command failed',err);return false;}
}
export function installCommandCopilot840(){
 if(window.__KAMIL_COMMAND_COPILOT840__)return;
 document.addEventListener('input',e=>{if(e.target?.matches?.('#commandInput'))renderSuggestions(e.target)},true);
 document.addEventListener('keydown',e=>{
  const el=e.target?.closest?.('#commandInput');if(!el||e.key!=='Enter')return;
  const raw=String(el.value||'').trim();if(!raw||!canHandleCopilot841(raw))return;
  e.preventDefault();e.stopImmediatePropagation();el.value='';document.querySelector('#commandResults')?.classList.add('hidden');
  void run(raw).then(handled=>{if(!handled){void modal('Kamil OS Copilot','<div class="card"><h2>Copilot odpověď se nepodařila načíst.</h2><p class="muted">Původní Command Bar zůstává funkční pro ostatní dotazy.</p></div>',[{label:'Zavřít',value:null,primary:true}])}});
 },true);
 window.__KAMIL_COMMAND_COPILOT840__={installed:true,readOnly:true,polish:'841',feedbackRelease:'842',feedback:true,history:readHistory,at:Date.now()};
}
