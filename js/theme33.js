const KEY='kamil-os-theme33';
const root=document.documentElement;

function stored(){try{return localStorage.getItem(KEY)}catch{return null}}
function apply(theme,{persist=false}={}){
 const light=theme!=='dark';
 root.classList.toggle('theme-light',light);
 root.dataset.theme=light?'light':'dark';
 root.style.colorScheme=light?'light':'dark';
 const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.setAttribute('content',light?'#f5f7fa':'#080b10');
 const btn=document.querySelector('#themeToggle33');if(btn){btn.setAttribute('aria-pressed',String(light));btn.title=light?'Přepnout na tmavé pozadí':'Přepnout na bílé pozadí';btn.innerHTML=`<span>${light?'☀':'☾'}</span><span class="theme-label33">${light?'Bílé':'Tmavé'}</span>`}
 if(persist)try{localStorage.setItem(KEY,light?'light':'dark')}catch{}
}
function ensureButton(){
 const actions=document.querySelector('.top-actions');if(!actions||document.querySelector('#themeToggle33'))return;
 const btn=document.createElement('button');btn.id='themeToggle33';btn.className='btn theme-toggle33';btn.type='button';btn.setAttribute('aria-label','Přepnout vzhled Kamil OS');btn.addEventListener('click',()=>apply(root.classList.contains('theme-light')?'dark':'light',{persist:true}));
 actions.insertBefore(btn,actions.firstChild);apply(root.classList.contains('theme-light')?'light':'dark');
}

apply(stored()||'light');
function start(){ensureButton();window.addEventListener('kamil:navigate',ensureButton)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
