import {installOneOS967} from './oneOS967.js';

const start=()=>{
 const run=()=>{try{installOneOS967()}catch(error){console.error('[OS967] One OS install failed',error)}};
 if(window.__KAMIL_BOOT_BUDGET343__?.complete)run();
 else window.addEventListener('kamil:boot-budget343',run,{once:true});
 setTimeout(()=>{if(!window.__KAMIL_ONE_OS967__?.installed)run()},2600);
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
