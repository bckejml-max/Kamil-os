import {store} from './state.js';
import {h,modal} from './utils.js';
import {commanderBlockerResolver594} from './commanderBlocker594.js';

const U=v=>String(v||'').toUpperCase();

function classify(top){
 if(!top)return{kind:'NONE',label:'Bez akce',title:'Teď není co odblokovat',detail:'Commander nemá konkrétní známý blocker.',target:null};
 const text=U(`${top.name||''} ${top.text||''} ${top.status||''} ${top.when||''}`);
 if(top.source==='REALITY')return{kind:'REALITY',label:'Otevřít kontrolu reality',title:'Porovnej plán → receipt → realitu',detail:top.text,target:'reality'};
 if(/XTB IMPORT|XTB|SIZING|KONCENTR|VÝSLED|EARNINGS|PORTFOL/.test(text))return{kind:'XTB_RECHECK',label:'Otevřít XTB recheck',title:'Doplň nebo ověř XTB data',detail:top.text,target:'recheck'};
 if(/MARKET CENU|TICKET|VSTUPEN|REPRICE|FLOOR|DEADLINE|DATUM AKCE/.test(text))return{kind:'TICKET_RECHECK',label:'Otevřít ticket recheck',title:'Doplň nebo ověř ticket market data',detail:top.text,target:'recheck'};
 return{kind:'RECHECK',label:'Otevřít recheck',title:'Vyřeš nejbližší ověřovací krok',detail:top.text,target:'recheck'};
}

export function commanderNextAction595(s=store.get()){
 const started=performance.now(),blockers=commanderBlockerResolver594(s),action=classify(blockers.top);
 const result={blocked:blockers.blocked,action,top:blockers.top,decision:blockers.decision,summary:blockers.blocked?`${action.title}: ${action.detail}`:'Žádný známý blocker; další ruční krok určuje Commander.'};
 if(typeof window!=='undefined')window.__KAMIL_NEXT_ACTION_595_LAST__={ms:Math.round((performance.now()-started)*10)/10,at:Date.now(),blocked:result.blocked,kind:action.kind,target:action.target};
 return result;
}

export async function openCommanderNextAction595(){
 const x=commanderNextAction595(),body=`<div class="metric-strip"><div class="metric"><span>Blokováno</span><b class="${x.blocked?'bad':'good'}">${x.blocked?'ANO':'NE'}</b></div><div class="metric"><span>Další krok</span><b>${h(x.action.kind)}</b></div><div class="metric"><span>Commander</span><b>${h(x.decision.mode)}</b></div></div><div class="card"><div class="eyebrow">COMMANDER NEXT ACTION 59.5</div><h2>${h(x.action.title)}</h2><p>${h(x.action.detail)}</p>${x.top?`<p><b>${h(x.top.when)}</b> · ${h(x.top.name)}</p>`:''}</div><div class="decision-note">59.5 pouze naviguje na správnou existující kontrolu. Nic automaticky neobchoduje, neprodává, nepřecenňuje ani neupravuje portfolio či ticket data.</div>`;
 const actions=x.action.target?[{label:x.action.label,value:x.action.target,primary:true},{label:'Ověřit po opravě 59.6',value:'rerun'},{label:'Zavřít',value:null}]:[{label:'Ověřit po opravě 59.6',value:'rerun',primary:true},{label:'Zavřít',value:null}];
 const choice=await modal('XTB + vstupenky / Commander Next Action 59.5',body,actions);
 if(choice==='reality'||choice==='recheck'){
  const r=await import('./commanderFixRerun596.js');r.armFixRerun596();
  if(choice==='reality'){const m=await import('./postExecutionReality593.js');return m.openPostExecutionReality593()}
  const m=await import('./recheckTriggers562.js');return m.openRecheckTriggers562();
 }
 if(choice==='rerun'){const m=await import('./commanderFixRerun596.js');return m.openCommanderFixRerun596()}
 return choice;
}
