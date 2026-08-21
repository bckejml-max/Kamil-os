let runPromise=null;

export function renderSystemDiagnostics421(){
  if(runPromise)return runPromise;
  runPromise=Promise.allSettled([
    import('./recoveryShieldUi32.js'),
    import('./smartSyncUi31.js'),
    import('./remoteInboxUi31.js')
  ]).then(()=>{
    // These legacy diagnostic UIs render from the navigation signal.
    // Re-fire it only after every module has installed its listeners so an
    // explicit System click cannot race their lazy module startup.
    window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:'more'}));
    return true;
  }).finally(()=>{runPromise=null});
  return runPromise;
}
