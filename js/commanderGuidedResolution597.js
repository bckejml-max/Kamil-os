import {store} from './state.js';
import {h,modal} from './utils.js';
import {commanderFixRerun596} from './commanderFixRerun596.js';

const U=v=>String(v||'').toUpperCase();

function guidance(x){
 const top=x.current?.top;
 if(x.status==='CLEARED')return{kind:'DONE',title:'Hotovo — blocker je pryč',why:'Aktuální přepočet už původní blocker nevidí.',next:'Vrať se do Commanderu a pokračuj podle nového verdiktu.',target:null,label:'Zavřít'};
 if(!top)return{kind:'UNKNOWN',title:'Chybí aktuální blocker',why:'Přepočet nevrátil konkrétní blocker, ale stav není označen jako vyřešený.',next:'Otevři znovu Fix & Re-run a ověř aktuální uložená data.',target:'rerun',label:'Znovu přepočítat'};
 const text=U(`${top.name||''} ${top.text||''} ${top.status||''} ${top.when||''}`);
 if(top.source==='REALITY')return{kind:'REALITY',title:'Chybí potvrzení skutečně provedené akce',why:top.text,next:'Porovnej ruční execution receipt s čerstvým zdrojovým stavem. Dokud nesedí množství, cena nebo existence pozice/listingu, Commander zůstane blokovaný.',target:'reality',label:'Otevřít reality check'};
 if(/XTB IMPORT|IMPORT|36 H|ČERSTV|DAT/.test(text))return{kind:'XTB_DATA',title:'Chybí čerstvá XTB data',why:top.text,next:'Nahraj nový XTB export/import s platným časem a potom spusť Fix & Re-run znovu.',target:'recheck',label:'Otevřít XTB recheck'};
 if(/SIZING|POČTU KUS|ČÁSTK/.test(text))return{kind:'SIZING',title:'Chybí přesná velikost kroku',why:top.text,next:'Doplň počet kusů nebo částku pro zamýšlenou akci. Bez sizingu OS nesmí označit BUY/SELL krok jako připravený.',target:'recheck',label:'Otevřít sizing kontrolu'};
 if(/KONCENTR|VÁZE POZICE|PORTFOL/.test(text))return{kind:'CONCENTRATION',title:'Blokuje tě koncentrace portfolia',why:top.text,next:'Nepřikupuj, dokud váha pozice nesplní limit z recheck pravidla, nebo dokud nové portfolio údaje neukážou bezpečnější stav.',target:'recheck',label:'Otevřít portfolio kontrolu'};
 if(/VÝSLED|EARNINGS/.test(text))return{kind:'EARNINGS',title:'Čeká se na výsledky firmy',why:top.text,next:'Po výsledcích obnov XTB data a spusť Commander znovu. Před earnings oknem nový BUY není finální krok.',target:'recheck',label:'Otevřít earnings recheck'};
 if(/MARKET CENU|8 H|KVALIT|TICKET|VSTUPEN/.test(text))return{kind:'TICKET_DATA',title:'Chybí čerstvá data ke vstupence',why:top.text,next:'Doplň aktuální market cenu, čas kontroly a případně kvalitu dat. Potom znovu spusť Fix & Re-run.',target:'recheck',label:'Otevřít ticket recheck'};
 if(/FLOOR|CENOVÝ TRIGGER/.test(text))return{kind:'PRICE_FLOOR',title:'Cena ještě nesplňuje bezpečný práh',why:top.text,next:'Teď nic nepřecenňuj pod bezpečný floor. Vyčkej na uvedený cenový trigger nebo udělej nové vědomé rozhodnutí o ztrátě.',target:'recheck',label:'Otevřít cenový trigger'};
 return{kind:'RECHECK',title:'Ještě chybí jeden ověřovací krok',why:top.text,next:'Otevři recheck, doplň přesně uvedený údaj a potom spusť Fix & Re-run znovu.',target:'recheck',label:'Otevřít recheck'};
}

export function commanderGuidedResolution597(s=store.get(),before=null){
 const started=performance.now(),rerun=commanderFixRerun596(s,before),guide=guidance(rerun);
 const result={status:rerun.status,guide,rerun,summary:`${guide.title}. ${guide.next}`};
 if(typeof window!=='undefined')window.__KAMIL_GUIDED_597_LAST__={ms:Math.round((performance.now()-started)*10)/10,at:Date.now(),status:rerun.status,kind:guide.kind,target:guide.target};
 return result;
}

export async function openCommanderGuidedResolution597(){
 const x=commanderGuidedResolution597(),g=x.guide;
 const body=`<div class="metric-strip"><div class="metric"><span>Stav</span><b>${h(x.status)}</b></div><div class="metric"><span>Typ</span><b>${h(g.kind)}</b></div></div><div class="card"><div class="eyebrow">GUIDED RESOLUTION 59.7</div><h2>${h(g.title)}</h2><p><b>Proč:</b> ${h(g.why)}</p><p><b>Co teď:</b> ${h(g.next)}</p></div><div class="decision-note">59.7 pouze vysvětluje nejkratší ruční cestu k odstranění aktuálního blockeru. Nic automaticky nemění v XTB, u vstupenek ani v uložených datech.</div>`;
 const actions=g.target?[{label:g.label,value:g.target,primary:true},{label:'Zavřít',value:null}]:[{label:'Zavřít',value:null,primary:true}];
 const choice=await modal('XTB + vstupenky / Guided Resolution 59.7',body,actions);
 if(choice==='rerun'){const m=await import('./commanderFixRerun596.js');return m.openCommanderFixRerun596()}
 if(choice==='reality'){const m=await import('./postExecutionReality593.js');return m.openPostExecutionReality593()}
 if(choice==='recheck'){const m=await import('./recheckTriggers562.js');return m.openRecheckTriggers562()}
 return choice;
}
