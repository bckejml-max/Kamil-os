import {store} from './state.js';

const NAV=[
 {view:'today',label:'Dnes',key:'1'},
 {view:'tickets',label:'Vstupenky',key:'2'},
 {view:'family',label:'Rodina',key:'3'},
 {view:'home',label:'Domov',key:'4'},
 {view:'money',label:'Peníze',key:'5'},
 {view:'more',label:'Dokumenty',key:'6'}
];
const LS_VIEW='kamil-os-last-view-232';
const LS_DENSITY='kamil-os-density-236';
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const q=s=>document.querySelector(s);

function ensureCss(){if(q('link[data-ux238]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href='./uxFoundation238.css';l.dataset.ux238='1';document.head.appendChild(l)}
function navigate(view){window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:view}))}
function currentView(){return q('[data-view].on')?.dataset?.view||'today'}
function saveView(view){if(NAV.some(x=>x.view===view))try{localStorage.setItem(LS_VIEW,view)}catch{}}

function paletteHtml(){return `<div class="ux238-palette" role="dialog" aria-modal="true" aria-label="Command Palette"><div class="ux238-palette-card"><div class="ux238-palette-head"><b>Command Palette</b><span>Esc zavře · Alt+1–6 navigace</span></div><input class="ux238-palette-input" placeholder="Hledej sekci nebo napiš příkaz…" autocomplete="off"><div class="ux238-palette-list"></div></div></div>`}
function renderPaletteList(host,term=''){
 const n=term.trim().toLocaleLowerCase('cs-CZ');
 const actions=[...NAV.map(x=>({kind:'nav',label:x.label,detail:`Alt+${x.key}`,view:x.view})),{kind:'action',label:'Přidat…',detail:'Ctrl+N',action:'add'},{kind:'action',label:'Kompaktní / pohodlné zobrazení',detail:'Shift+D',action:'density'}];
 const filtered=actions.filter(x=>!n||`${x.label} ${x.detail}`.toLocaleLowerCase('cs-CZ').includes(n));
 host.innerHTML=filtered.map((x,i)=>`<button type="button" class="ux238-palette-row" data-i="${i}"><span><b>${esc(x.label)}</b><small>${esc(x.detail)}</small></span><kbd>↵</kbd></button>`).join('')||`<button type="button" class="ux238-palette-row" data-command="1"><span><b>Spustit příkaz</b><small>${esc(term)}</small></span><kbd>↵</kbd></button>`;
 host._items=filtered;
}
function closePalette(){q('.ux238-palette')?.remove()}
function openPalette(seed=''){
 closePalette();document.body.insertAdjacentHTML('beforeend',paletteHtml());const root=q('.ux238-palette'),input=q('.ux238-palette-input'),list=q('.ux238-palette-list');
 const refresh=()=>renderPaletteList(list,input.value);input.value=seed;refresh();input.focus();input.select();
 root.addEventListener('mousedown',e=>{if(e.target===root)closePalette()});
 input.addEventListener('input',refresh);
 input.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();closePalette();return}if(e.key==='Enter'){e.preventDefault();const first=list.querySelector('.ux238-palette-row');first?.click()}});
 list.addEventListener('click',e=>{const b=e.target.closest('.ux238-palette-row');if(!b)return;if(b.dataset.command){const text=input.value.trim();closePalette();const target=q('#commandInput');if(target){target.value=text;target.dispatchEvent(new Event('input',{bubbles:true}));q('#commandGo')?.click()}return}const item=list._items?.[Number(b.dataset.i)];if(!item)return;closePalette();if(item.kind==='nav')navigate(item.view);else if(item.action==='add')openQuickAdd();else if(item.action==='density')toggleDensity()});
}

function quickAddHtml(){return `<div class="ux238-addmenu" role="dialog" aria-modal="true"><div class="ux238-add-card"><div class="ux238-add-head"><b>Přidat do Kamil OS</b><button type="button" data-close>×</button></div><div class="ux238-add-grid"><button data-type="task"><b>Úkol</b><span>Co máš udělat</span></button><button data-type="personal"><b>Osobní položka</b><span>Doklad, smlouva, domácnost</span></button><button data-type="debt"><b>Pohledávka</b><span>Peníze k inkasu</span></button><button data-type="ticket"><b>Vstupenka</b><span>Nákup nebo prodej</span></button></div></div></div>`}
function openQuickAdd(){
 q('.ux238-addmenu')?.remove();document.body.insertAdjacentHTML('beforeend',quickAddHtml());const root=q('.ux238-addmenu');
 root.addEventListener('click',e=>{if(e.target===root||e.target.closest('[data-close]')){root.remove();return}const b=e.target.closest('[data-type]');if(!b)return;const type=b.dataset.type;root.remove();window.dispatchEvent(new CustomEvent('kamil:capture',{detail:type}))});
}

function applyDensity(mode){const m=mode==='comfortable'?'comfortable':'compact';document.documentElement.dataset.density238=m;try{localStorage.setItem(LS_DENSITY,m)}catch{};return m}
function toggleDensity(){const next=document.documentElement.dataset.density238==='compact'?'comfortable':'compact';applyDensity(next)}

function drawerHtml(title,body){return `<aside class="ux238-drawer" role="dialog" aria-modal="true"><div class="ux238-drawer-head"><div><small>DETAIL</small><b>${esc(title||'Detail')}</b></div><button type="button" data-close aria-label="Zavřít">×</button></div><div class="ux238-drawer-body">${body||''}</div></aside><div class="ux238-drawer-backdrop"></div>`}
function closeDrawer(){q('.ux238-drawer')?.remove();q('.ux238-drawer-backdrop')?.remove()}
function openDrawer(detail={}){closeDrawer();document.body.insertAdjacentHTML('beforeend',drawerHtml(detail.title,detail.html||`<p>${esc(detail.text||'')}</p>`));q('.ux238-drawer [data-close]')?.addEventListener('click',closeDrawer);q('.ux238-drawer-backdrop')?.addEventListener('click',closeDrawer)}

function bindChrome(){
 document.addEventListener('click',e=>{const add=e.target.closest('#quickAddBtn');if(add){e.preventDefault();e.stopImmediatePropagation();openQuickAdd()}},true);
 window.addEventListener('kamil:view-change',e=>saveView(e.detail));
 window.addEventListener('kamil:detail-drawer',e=>openDrawer(e.detail||{}));
 document.addEventListener('keydown',e=>{
  const k=e.key.toLowerCase();
  if((e.ctrlKey||e.metaKey)&&k==='k'){e.preventDefault();e.stopImmediatePropagation();openPalette();return}
  if(e.key==='/'&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)){e.preventDefault();openPalette();return}
  if((e.ctrlKey||e.metaKey)&&k==='n'){e.preventDefault();e.stopImmediatePropagation();openQuickAdd();return}
  if(e.shiftKey&&!e.ctrlKey&&!e.metaKey&&k==='d'){e.preventDefault();toggleDensity();return}
  if(e.altKey&&!e.ctrlKey&&!e.metaKey){const item=NAV.find(x=>x.key===e.key);if(item){e.preventDefault();navigate(item.view)}}
  if(e.key==='Escape'){closePalette();q('.ux238-addmenu')?.remove();closeDrawer()}
 },true);
}

function restoreView(){let v='';try{v=localStorage.getItem(LS_VIEW)||''}catch{}if(v&&v!==currentView()&&NAV.some(x=>x.view===v))setTimeout(()=>navigate(v),80)}
export function installUxFoundation238(){
 ensureCss();let density='compact';try{density=localStorage.getItem(LS_DENSITY)||'compact'}catch{}applyDensity(density);bindChrome();restoreView();
 window.__KAMIL_UX_FOUNDATION238__={version:238,openPalette,openQuickAdd,openDrawer,closeDrawer,toggleDensity,navigation:NAV.map(x=>x.view)};
}
