import {store} from './state.js';
import {modal} from './utils.js';
import {personalSettings647,openPersonalSettings647,openPersonalDataHealth647} from './personalSettings647.js';

const openCount=(arr=[])=>arr.filter(x=>!['DONE','CLOSED','ARCHIVED','RESOLVED'].includes(String(x?.status||'').toUpperCase())).length;
const nav=v=>window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:v}));
const areaLabel=id=>id==='family'?'Rodina':id==='home'?'Domov':id==='money'?'Peníze':id==='admin'?'Administrativa':'Bez zvýhodnění';

export async function openPersonalMore640(){
 const s=store.get(),health=personalSettings647(s),goals=openCount(s.personalGoals?.items||[]),inbox=openCount(s.personalInbox?.items||[]),admin=openCount(s.personalAdmin?.items||[]);
 const body=`<div class="card"><div class="eyebrow">VÍCE</div><h2>Nastavení a stav osobních dat</h2><div class="row"><span>Osobní cíle</span><b>${goals}</b></div><div class="row"><span>Osobní inbox</span><b>${inbox}</b></div><div class="row"><span>Administrativa</span><b>${admin}</b></div><div class="row"><span>Pokrytí osobních dat</span><b>${health.coverage}%</b></div><div class="row"><span>K aktualizaci</span><b>${health.missing}</b></div><div class="row"><span>Cloud</span><b>${health.cloud?'Připojen':'Jen toto zařízení'}</b></div><div class="row"><span>Preferovaná oblast</span><b>${areaLabel(health.priorityArea)}</b></div></div><div class="decision-note">Tady jsou jen servisní věci: synchronizace, export, poslední změny a jemné nastavení priorit.</div>`;
 const choice=await modal('Kamil OS / Více',body,[{label:'Stav osobních dat',value:'health',primary:true},{label:'Nastavit prioritu',value:'settings'},{label:'Dokumenty a data',value:'documents'},{label:'Zavřít',value:null}]);
 if(choice==='health')return openPersonalDataHealth647();if(choice==='settings')return openPersonalSettings647();if(choice==='documents')return nav('more');return choice;
}
