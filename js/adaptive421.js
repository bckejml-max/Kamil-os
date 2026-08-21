const KEY='kamil-os-adaptive-42-1';
const clamp=n=>Math.max(-20,Math.min(20,Number(n)||0));
const empty=()=>({version:1,bias:{},events:{},updatedAt:null});
const key=(source,kind)=>`${String(source||'unknown')}|${String(kind||'unknown')}`;

export function readAdaptive421(){
 try{return {...empty(),...(JSON.parse(localStorage.getItem(KEY)||'null')||{})}}catch{return empty()}
}
function write(next){
 const out={...empty(),...next,updatedAt:new Date().toISOString()};
 try{localStorage.setItem(KEY,JSON.stringify(out))}catch{}
 window.dispatchEvent(new CustomEvent('kamil:adaptive-change',{detail:out}));
 return out;
}
export function adaptiveBias421(source,kind){
 const s=readAdaptive421();return clamp(s.bias?.[key(source,kind)]||0);
}
export function feedbackAdaptive421(source,kind,delta){
 const s=readAdaptive421(),k=key(source,kind),bias={...(s.bias||{})};
 bias[k]=clamp((bias[k]||0)+Number(delta||0));
 return write({...s,bias});
}
export function trackAdaptive421(type,label=''){ 
 const s=readAdaptive421(),events={...(s.events||{})},k=`${type}:${label||'all'}`;events[k]=Number(events[k]||0)+1;write({...s,events});return events[k];
}
export function adaptiveSummary421(){
 const s=readAdaptive421(),entries=Object.entries(s.bias||{}).filter(([,v])=>v).sort((a,b)=>Math.abs(b[1])-Math.abs(a[1]));
 const positive=entries.filter(([,v])=>v>0).slice(0,3).map(([k,v])=>({key:k,bias:v}));
 const negative=entries.filter(([,v])=>v<0).slice(0,3).map(([k,v])=>({key:k,bias:v}));
 const actions=Object.entries(s.events||{}).reduce((n,[,v])=>n+Number(v||0),0);
 return {positive,negative,actions,trained:entries.length,updatedAt:s.updatedAt};
}
export function resetAdaptive421(){try{localStorage.removeItem(KEY)}catch{}window.dispatchEvent(new CustomEvent('kamil:adaptive-change',{detail:empty()}));}
