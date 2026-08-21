const started=performance.now();
let firstView=false;
export function markPerf41(name,extra={}){
 try{
  const row={name,ms:Math.round(performance.now()-started),at:new Date().toISOString(),...extra};
  const all=JSON.parse(sessionStorage.getItem('kamil-os-perf41')||'[]');all.push(row);sessionStorage.setItem('kamil-os-perf41',JSON.stringify(all.slice(-40)));return row;
 }catch{return null}
}
export function markFirstView41(view){if(firstView)return;firstView=true;markPerf41('first-view',{view})}
export function perfSnapshot41(){try{return JSON.parse(sessionStorage.getItem('kamil-os-perf41')||'[]')}catch{return []}}
