const qs=(s,r=document)=>r.querySelector(s);
const qsa=(s,r=document)=>[...r.querySelectorAll(s)];
const LABELS={today:['Dnes','⌂'],inbox:['Inbox','◎'],tickets:['Vstupenky','🎟'],betting:['Sázení','🎯'],family:['Rodina','♥'],home:['Domov','⌂'],money:['Peníze','Kč'],more:['Dokumenty','▤']};

function setLabel(btn,label,icon){
 if(!btn)return;
 const spans=btn.querySelectorAll('span');
 if(spans[0]&&icon)spans[0].textContent=icon;
 if(spans[1])spans[1].textContent=label;
 else if(spans[0])btn.innerHTML=`${spans[0].outerHTML}${label}`;
 else btn.textContent=label;
 btn.title=label;btn.setAttribute('aria-label',label);
}
function activateView(view){if(window.__KAMIL_NAVIGATION342__?.navigate)return window.__KAMIL_NAVIGATION342__.navigate(view,{source:'nav302'});window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:view}));return true}
function apply(){
 const main=qs('#mainNav'),bottom=qs('#bottomNav');if(!main||!bottom)return false;
 for(const [view,[label,icon]] of Object.entries(LABELS)){
  setLabel(qs(`#mainNav [data-view="${view}"]`),label,icon);
  setLabel(qs(`#bottomNav [data-view="${view}"]`),label,icon);
 }
 qsa('[data-nav302-hidden]').forEach(x=>x.removeAttribute('data-nav302-hidden'));
 main.dataset.nav302='passive';bottom.dataset.nav302='passive';
 return true;
}
export function installNavigation302(){
 // OS302 used to collapse Home/Family/Documents into a synthetic "Život" view.
 // Canonical OS527 navigation owns visibility and labels; this layer only repairs legacy labels.
 apply();window.addEventListener('kamil:view-change',apply);
 window.__KAMIL_NAV302__={version:527,refresh:apply,openLife:()=>activateView('family'),passive:true,canonicalNavigation:true};
}
