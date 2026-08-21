const {contextBridge,ipcRenderer}=require('electron');

const api={
  getState:()=>ipcRenderer.invoke('kamil-update:get-state'),
  check:()=>ipcRenderer.invoke('kamil-update:check'),
  download:()=>ipcRenderer.invoke('kamil-update:download'),
  install:()=>ipcRenderer.invoke('kamil-update:install'),
  onState:callback=>{const fn=(_event,state)=>callback(state);ipcRenderer.on('kamil-update:state',fn);return()=>ipcRenderer.removeListener('kamil-update:state',fn)}
};
contextBridge.exposeInMainWorld('kamilDesktopUpdates',api);

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

function mount(){
  if(document.getElementById('kamilDesktopUpdateBtn'))return;
  const btn=document.createElement('button');
  btn.id='kamilDesktopUpdateBtn';
  btn.type='button';
  Object.assign(btn.style,{position:'fixed',right:'16px',bottom:'16px',zIndex:'2147483647',border:'1px solid rgba(0,0,0,.12)',borderRadius:'12px',padding:'10px 14px',background:'#fff',color:'#111827',font:'600 12px system-ui,-apple-system,Segoe UI,sans-serif',boxShadow:'0 8px 28px rgba(0,0,0,.14)',cursor:'pointer',maxWidth:'260px'});
  document.body.appendChild(btn);
  let state={status:'idle'};
  const apply=next=>{
    state=next||state;
    btn.textContent=label(state);
    btn.title=state.message||'Aktualizace Kamil OS';
    btn.disabled=['checking','downloading'].includes(state.status);
    btn.style.opacity=btn.disabled?'.72':'1';
    btn.style.background=['available','downloaded'].includes(state.status)?'#111827':'#fff';
    btn.style.color=['available','downloaded'].includes(state.status)?'#fff':'#111827';
  };
  btn.addEventListener('click',async()=>{
    if(state.status==='available')await api.download();
    else if(state.status==='downloaded')await api.install();
    else await api.check();
  });
  api.getState().then(apply).catch(()=>apply({status:'error',message:'Kontrolu aktualizací se nepodařilo načíst.'}));
  api.onState(apply);
}

if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
