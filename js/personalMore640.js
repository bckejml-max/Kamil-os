import {store} from './state.js';
import {modal} from './utils.js';

const openCount=(arr=[])=>arr.filter(x=>!['DONE','CLOSED','ARCHIVED','RESOLVED'].includes(String(x?.status||'').toUpperCase())).length;
const nav=v=>window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:v}));

export async function openPersonalMore640(){
 const s=store.get(),goals=openCount(s.personalGoals?.items||[]),inbox=openCount(s.personalInbox?.items||[]),admin=openCount(s.personalAdmin?.items||[]);
 const body=`<div class="card"><div class="eyebrow">VÍCE</div><h2>Další osobní věci</h2><div class="row"><span>Osobní cíle</span><b>${goals}</b></div><div class="row"><span>Osobní inbox</span><b>${inbox}</b></div><div class="row"><span>Administrativa</span><b>${admin}</b></div><div class="row"><span>Cloud</span><b>${s.meta?.cloudMode==='cloud'?'Připojen':'Jen toto zařízení'}</b></div></div><div class="decision-note">Staré technické dashboardy zůstávají v repozitáři kvůli kompatibilitě, ale nejsou součástí hlavní osobní navigace 64.0.</div>`;
 const choice=await modal('Kamil OS / Více',body,[{label:'Dokumenty a data',value:'documents',primary:true},{label:'Domov',value:'home'},{label:'Rodina',value:'family'},{label:'Peníze',value:'money'},{label:'Zavřít',value:null}]);
 if(choice==='documents')return nav('more');if(choice==='home')return nav('home');if(choice==='family')return nav('tickets');if(choice==='money')return nav('money');return choice;
}
