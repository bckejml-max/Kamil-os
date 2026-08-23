import {store} from './state.js';
import {h,modal} from './utils.js';
import {commanderBlockerResolver594} from './commanderBlocker594.js';

const KEY='kamil-os-commander-rerun-596';
const sig=x=>x?`${x.source||''}|${x.key||''}|${x.status||''}|${x.when||''}|${x.text||''}`:'NONE';
const snapshot=s=>{const x=commanderBlockerResolver594(s);return{at:Date.now(),blocked:x.blocked,top:x.top?{source:x.top.source,key:x.top.key,name:x.top.name,status:x.top.status,when:x.top.when,text:x.top.text}:null,decisionMode:x.decision?.mode||null,signature:sig(x.top)}};

export function armFixRerun596(s=store.get()){
 const snap=snapshot(s);
 try{sessionStorage.setItem(KEY,JSON.stringify(snap))}catch{}
 if(typeof window!=='undefined')window.__KAMIL_FIX_RERUN_596_ARMED__={at:snap.at,signature:snap.signature};
 return snap;
}

export function commanderFixRerun596(s=store.get(),before=null){
 const started=performance.now(),current=snapshot(s);let baseline=before;
 if(!baseline){try{baseline=JSON.parse(sessionStorage.getItem(KEY)||'null')}catch{baseline=null}}
 let status='NO_BASELINE',summary='Nejdřív otevři doporučenou kontrolu přes 59.5, aby bylo s čím porovnávat.';
 if(baseline){
  if(baseline.blocked&&!current.blocked){status='CLEARED';summary='Blocker zmizel. Oprava nebo nová data odblokovala Commander.'}
  else if(baseline.signature!==current.signature||baseline.decisionMode!==current.decisionMode){status='CHANGED';summary='Stav se změnil. Commander má po přepočtu jiný blocker nebo režim.'}
  else{status='SAME';summary='Blocker je stále stejný. Doplnění zatím nestačilo k odblokování.'}
 }
 const result={status,summary,before:baseline,current};
 if(typeof window!=='undefined')window.__KAMIL_FIX_RERUN_596_LAST__={ms:Math.round((performance.now()-started)*10)/10,at:Date.now(),status,before:baseline?.signature||null,current:current.signature};
 return result;
}

const cls=s=>s==='CLEARED'?'good':s==='SAME'?'bad':'warn';
const label=s=>({CLEARED:'VYŘEŠENO',CHANGED:'ZMĚNĚNO',SAME:'STEJNÉ',NO_BASELINE:'CHYBÍ START'})[s]||s;

export async function openCommanderFixRerun596(){
 const x=commanderFixRerun596(),before=x.before?.top,current=x.current?.top;
 const body=`<div class="metric-strip"><div class="metric"><span>Výsledek</span><b class="${cls(x.status)}">${h(label(x.status))}</b></div><div class="metric"><span>Předtím</span><b>${h(x.before?.decisionMode||'—')}</b></div><div class="metric"><span>Teď</span><b>${h(x.current?.decisionMode||'—')}</b></div></div><div class="card"><div class="eyebrow">FIX & RE-RUN 59.6</div><h2>${h(x.summary)}</h2></div><div class="card"><div class="eyebrow">PŘED → TEĎ</div><div class="intel-row"><div class="intel-main"><b>Před opravou</b><span>${h(before?`${before.when}: ${before.text}`:'Bez uloženého startovního blockeru.')}</span></div></div><div class="intel-row"><div class="intel-main"><b>Po přepočtu</b><span>${h(current?`${current.when}: ${current.text}`:'Žádný známý blocker.')}</span></div></div></div><div class="decision-note">59.6 pouze znovu čte aktuální uložený stav a porovnává ho s explicitně zapamatovaným blockerem z 59.5. Nic neopravuje, neobchoduje, neprodává ani nepřecenňuje automaticky.</div>`;
 const actions=x.status==='SAME'||x.status==='CHANGED'?[{label:'Co ještě chybí 59.7',value:'guide',primary:true},{label:'Znovu přepočítat',value:'rerun'},{label:'Zavřít',value:null}]:[{label:'Znovu přepočítat',value:'rerun',primary:true},{label:'Zavřít',value:null}];
 const choice=await modal('XTB + vstupenky / Fix & Re-run 59.6',body,actions);
 if(choice==='guide'){const m=await import('./commanderGuidedResolution597.js');return m.openCommanderGuidedResolution597()}
 if(choice==='rerun')return openCommanderFixRerun596();
 return choice;
}
