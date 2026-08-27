const q=s=>document.querySelector(s);
function polish228(){
 const root=document.documentElement;root.dataset.productionChrome228='1';
 const sync=q('#syncStatus');if(sync){sync.setAttribute('aria-hidden','true');sync.tabIndex=-1;sync.removeAttribute('role')}
 const input=q('#commandInput');if(input){input.placeholder='Hledej nebo se zeptej…';input.setAttribute('aria-label','Hledej nebo se zeptej v Kamil OS')}
 const go=q('#commandGo');if(go){go.textContent='↵';go.setAttribute('aria-label','Spustit hledání');go.title='Spustit hledání · Enter';go.dataset.production228='1'}
 const undo=q('#undoBtn');if(undo){undo.title='Vrátit poslední změnu · Ctrl Z'}
 const kicker=q('.page-kicker');if(kicker){const page=q('#pageTitle');if(page&&page.parentElement===kicker){[...kicker.childNodes].filter(n=>n.nodeType===Node.TEXT_NODE).forEach(n=>n.remove())}}
}
export function installProductionChrome228(){polish228();window.addEventListener('kamil:view-change',polish228);window.__KAMIL_PRODUCTION_CHROME228__={version:228,polish:polish228}}
