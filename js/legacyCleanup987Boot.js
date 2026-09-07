import {installLegacyCleanup987} from './legacyCleanup987.js';
const start=()=>{const run=()=>{try{installLegacyCleanup987()}catch(error){console.warn('[OS987] legacy cleanup install failed',error)}};if(window.__KAMIL_ONE_OS977__?.installed)run();else window.addEventListener('kamil:boot-budget343',()=>setTimeout(run,0),{once:true});setTimeout(()=>{if(!window.__KAMIL_LEGACY_CLEANUP987__?.installed)run()},3200)};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
