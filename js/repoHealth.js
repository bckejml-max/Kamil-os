let cache=null;
export async function loadRepoHealth741(){
 if(cache)return cache;
 const r=await fetch('./repo-health.json',{cache:'no-store'});if(!r.ok)throw new Error('Repo health '+r.status);
 cache=await r.json();return cache;
}
export function repoHealthSummary741(x={}){
 return {files:Number(x.totalFiles||0),runtime:Number(x.js||0)+Number(x.mjs||0),css:Number(x.css||0),e2e:Number(x.e2e||0),guards:Number(x.guards||0),numbered:Number(x.numberedRuntime||0),canonicalCssKb:Math.round(Number(x.canonicalCssBytes||0)/1024)};
}
