const {contextBridge,ipcRenderer}=require('electron');

const api={
  getState:()=>ipcRenderer.invoke('kamil-update:get-state'),
  check:()=>ipcRenderer.invoke('kamil-update:check'),
  download:()=>ipcRenderer.invoke('kamil-update:download'),
  install:()=>ipcRenderer.invoke('kamil-update:install'),
  onState:callback=>{const fn=(_event,state)=>callback(state);ipcRenderer.on('kamil-update:state',fn);return()=>ipcRenderer.removeListener('kamil-update:state',fn)}
};
contextBridge.exposeInMainWorld('kamilDesktopUpdates',api);
contextBridge.exposeInMainWorld('kamilDesktop43',{runtime:true,platform:process.platform,version:process.versions.electron});

function label(state={}){
  const v=state.availableVersion||'';
  if(state.status==='checking')return 'Kontroluji aktualizaci…';
  if(state.status==='available')return `Aktualizovat na ${v||'novou verzi'}`;
  if(state.status==='downloading')return `Stahuji ${state.percent||0} %`;
  if(state.status==='downloaded')return 'Restartovat a aktualizovat';
  if(state.status==='up-to-date')return `Aktuální · ${state.version||''}`;
  if(state.status==='error')return 'Zkontrolovat aktualizace';
  return 'Aktualizace';
}

function mountUpdate(){
  if(document.getElementById('kamilDesktopUpdateBtn'))return;
  const btn=document.createElement('button');
  btn.id='kamilDesktopUpdateBtn';btn.type='button';
  Object.assign(btn.style,{position:'fixed',right:'16px',bottom:'16px',zIndex:'2147483647',border:'1px solid rgba(0,0,0,.12)',borderRadius:'12px',padding:'10px 14px',background:'#fff',color:'#111827',font:'600 12px system-ui,-apple-system,Segoe UI,sans-serif',boxShadow:'0 8px 28px rgba(0,0,0,.14)',cursor:'pointer',maxWidth:'260px'});
  document.body.appendChild(btn);let state={status:'idle'};
  const apply=next=>{state=next||state;btn.textContent=label(state);btn.title=state.message||'Aktualizace Kamil OS';btn.disabled=['checking','downloading'].includes(state.status);btn.style.opacity=btn.disabled?'.72':'1';btn.style.background=['available','downloaded'].includes(state.status)?'#111827':'#fff';btn.style.color=['available','downloaded'].includes(state.status)?'#fff':'#111827'};
  btn.addEventListener('click',async()=>{if(state.status==='available')await api.download();else if(state.status==='downloaded')await api.install();else await api.check()});
  api.getState().then(apply).catch(()=>apply({status:'error',message:'Kontrolu aktualizací se nepodařilo načíst.'}));api.onState(apply);
}

function mountPalette(){
  if(document.getElementById('kamilDesktop43Palette'))return;
  const wrap=document.createElement('div');wrap.id='kamilDesktop43Palette';
  Object.assign(wrap.style,{position:'fixed',inset:'0',zIndex:'2147483646',display:'none',alignItems:'flex-start',justifyContent:'center',paddingTop:'12vh',background:'rgba(15,23,42,.28)',backdropFilter:'blur(3px)'});
  wrap.innerHTML=`<div style="width:min(680px,92vw);background:#fff;color:#111827;border-radius:16px;box-shadow:0 24px 70px rgba(0,0,0,.28);padding:14px"><div style="font:700 12px system-ui;margin-bottom:8px">KAMIL OS DESKTOP COMMAND PALETTE · Ctrl+Alt+K</div><input id="k43DesktopCommand" placeholder="Napiš příkaz nebo hledání…" style="width:100%;padding:12px;border:1px solid #dbe1e8;border-radius:10px;font:14px system-ui"><div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap"><button data-k43="run" style="padding:9px 12px">Provést</button><button data-k43="task" style="padding:9px 12px">＋ Úkol</button><button data-k43="inbox" style="padding:9px 12px">Universal Inbox</button><button data-k43="close" style="padding:9px 12px">Zavřít</button></div></div>`;document.body.appendChild(wrap);
  const input=wrap.querySelector('#k43DesktopCommand');const close=()=>{wrap.style.display='none'};const open=()=>{wrap.style.display='flex';setTimeout(()=>input.focus(),0)};const run=()=>{const target=document.querySelector('#commandInput'),go=document.querySelector('#commandGo');if(target){target.value=input.value;target.dispatchEvent(new Event('input',{bubbles:true}));go?.click()}close()};
  wrap.addEventListener('click',e=>{if(e.target===wrap)close();const a=e.target?.dataset?.k43;if(a==='close')close();if(a==='run')run();if(a==='task'){document.querySelector('#quickAddBtn')?.click();close()}if(a==='inbox'){document.querySelector('[data-view="today"]')?.click();const target=document.querySelector('#lifeOs42');target?.scrollIntoView({behavior:'smooth',block:'start'});close()}});
  input.addEventListener('keydown',e=>{if(e.key==='Enter')run();if(e.key==='Escape')close()});
  window.addEventListener('keydown',e=>{if(e.ctrlKey&&e.altKey&&e.key.toLowerCase()==='k'){e.preventDefault();wrap.style.display==='none'?open():close()}});
  window.addEventListener('kamil:desktop-notify',e=>{try{if(Notification.permission==='granted')new Notification(e.detail?.title||'Kamil OS',{body:e.detail?.body||''})}catch{}});
}
function mount(){mountUpdate();mountPalette()}
if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
