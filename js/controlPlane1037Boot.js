import {installControlPlane1037} from './controlPlane1037.js';
const start=()=>{const run=()=>{try{installControlPlane1037()}catch(error){console.warn('[OS1037] control plane install failed',error)}};if(window.__KAMIL_ONE_OS977__?.installed)run();else window.addEventListener('kamil:boot-budget343',()=>setTimeout(run,0),{once:true});setTimeout(()=>{if(!window.__KAMIL_CONTROL_PLANE1037__?.installed)run()},3800)};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
