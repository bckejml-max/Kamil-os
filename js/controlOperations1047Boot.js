import {installControlOperations1047} from './controlOperations1047.js';
const start=()=>{const run=()=>{try{installControlOperations1047()}catch(error){console.warn('[OS1047] operations install failed',error)}};if(window.__KAMIL_CONTROL_PLANE1037__?.installed)run();else window.addEventListener('kamil:boot-budget343',()=>setTimeout(run,0),{once:true});setTimeout(()=>{if(!window.__KAMIL_CONTROL_OPERATIONS1047__?.installed)run()},4300)};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
