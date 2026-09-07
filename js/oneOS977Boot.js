import {installOneOS977} from './oneOS977.js';

const start=()=>{
 const run=()=>{try{installOneOS977()}catch(error){console.error('[OS977] consolidation install failed',error)}};
 if(window.__KAMIL_ONE_OS967__?.installed)run();
 else setTimeout(run,3000);
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
