export const USAGE892_VERSION='892.0.0';
const KEY='kamil.os.usage.892';
const MAX=1000;
const A=v=>Array.isArray(v)?v:[];
export function readUsage892(){try{return A(JSON.parse(localStorage.getItem(KEY)||'[]'))}catch{return[]}}
export function recordUsage892(feature,meta={}){try{const rows=readUsage892();rows.push({id:`u-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,at:new Date().toISOString(),feature:String(feature||'unknown'),meta});localStorage.setItem(KEY,JSON.stringify(rows.slice(-MAX)));return rows[rows.length-1]}catch{return null}}
export function usageSummary892(days=30){const cut=Date.now()-days*86400000,rows=readUsage892().filter(x=>Date.parse(x.at)>=cut),by={};for(const x of rows)by[x.feature]=(by[x.feature]||0)+1;return{days,total:rows.length,by,top:Object.entries(by).sort((a,b)=>b[1]-a[1]).slice(0,12),unusedCandidates:['copilot','strategy','audit','truth','operator','tickets','betting','family','home','documents','health'].filter(x=>!by[x])}}
