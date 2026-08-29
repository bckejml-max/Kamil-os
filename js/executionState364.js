const VERSION=364;
const KEY='kamil-os-execution-state-364';
const STATES={NOW:'Udělej teď',WAITING:'Čekám',RECHECK:'Zkontrolovat později',IGNORE:'Ignorovat'};
const parse=(x,f={})=>{try{return JSON.parse(x)||f}catch{return f}};
let overrides=parse(localStorage.getItem(KEY),{}),model={version:VERSION,groups:{NOW:[],WAITING:[],RECHECK:[],IGNORE:[]},counts:{NOW:0,WAITING:0,RECHECK:0,IGNORE:0},queue:[],at:null};
const id=x=>`${x?.refType||x?.key||'item'}:${x?.refId||x?.title||''}`;
function automatic(x){const text=`${x?.title||''} ${x?.reason||''}`.toLowerCase(),score=Number(x?.score)||0;if(/čekám|čekame|odpověď|odpoved|waiting|awaiting|blok|blocked/.test(text))return'WAITING';if(score>=95||x?.refType==='manager-duty'||/po termínu|dnes|urgent/.test(text))return'NOW';if(['ticket','investment'].includes(x?.refType)||/review|zkontrol|cena|pozici/.test(text))return'RECHECK';if(score<65)return'IGNORE';return'NOW'}
function classify(x){const key=id(x),manual=overrides[key];return{...x,executionId:key,executionState:STATES[manual]?manual:automatic(x),manual:!!STATES[manual]}}
function build(){const api=window.__KAMIL_FOCUS_QUEUE335__,queue=(api?.model?.queue||[]).map(classify),groups={NOW:[],WAITING:[],RECHECK:[],IGNORE:[]};queue.forEach(x=>groups[x.executionState].push(x));const counts=Object.fromEntries(Object.entries(groups).map(([k,v])=>[k,v.length]));model={version:VERSION,groups,counts,queue,now:groups.NOW[0]||null,at:new Date().toISOString(),sourceVersion:api?.model?.version||null};publish();return model}
function setState(executionId,state){if(!STATES[state])return false;overrides[executionId]=state;try{localStorage.setItem(KEY,JSON.stringify(overrides))}catch{}build();window.dispatchEvent(new CustomEvent('kamil:execution-state364-updated',{detail:{executionId,state}}));return true}
function clearState(executionId){delete overrides[executionId];try{localStorage.setItem(KEY,JSON.stringify(overrides))}catch{}build();window.dispatchEvent(new CustomEvent('kamil:execution-state364-updated',{detail:{executionId,state:null}}));return true}
function publish(){window.__KAMIL_EXECUTION_STATE364__={version:VERSION,healthy:true,model,states:STATES,refresh:build,setState,clearState,at:Date.now()}}
let timer=0,bound=false;const schedule=()=>{clearTimeout(timer);timer=setTimeout(build,70)};
export function installExecutionState364(){document.documentElement.dataset.executionState364='1';if(!bound){bound=true;window.addEventListener('kamil:manager341-updated',schedule);window.addEventListener('kamil:view-change',schedule)}schedule();setTimeout(schedule,700)}
