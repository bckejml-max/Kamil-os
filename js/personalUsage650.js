const KEY='kamil-os-personal-usage-65';
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{"views":{},"actions":{}}')}catch{return{views:{},actions:{}}}};
const write=x=>{try{localStorage.setItem(KEY,JSON.stringify(x))}catch{}return x};
export function markPersonalUsage650(type,name){if(typeof localStorage==='undefined')return null;const x=read(),bucket=type==='view'?'views':'actions',key=String(name||'unknown');x[bucket]=x[bucket]||{};x[bucket][key]=Number(x[bucket][key]||0)+1;x.lastAt=new Date().toISOString();return write(x)}
export function personalUsage650(){const x=read(),rank=o=>Object.entries(o||{}).sort((a,b)=>b[1]-a[1]);return{...x,topViews:rank(x.views),topActions:rank(x.actions),key:KEY,localOnly:true}}
export function clearPersonalUsage650(){try{localStorage.removeItem(KEY)}catch{}return true}
