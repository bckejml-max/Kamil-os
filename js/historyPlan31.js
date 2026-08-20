const arr=v=>Array.isArray(v)?v:[];
const clean=(v,max=180)=>String(v??'').trim().slice(0,max);
const validDate=v=>{const t=new Date(v||0).getTime();return Number.isFinite(t)&&t>0?new Date(t).toISOString():null};
const stable=v=>{try{return JSON.stringify(v??null)}catch{return'null'}};
const hash=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(36)};
const LIMITS={decision:1000,networth:1000,ticket:2500,trade:4000,import:1000};

const sourceRows=(state,bucket)=>{
 if(bucket==='decision')return arr(state.decisionJournal?.items);
 if(bucket==='networth')return arr(state.netWorthBook?.history);
 if(bucket==='ticket')return arr(state.ticketBook?.history);
 if(bucket==='trade')return arr(state.tradeJournal?.trades);
 if(bucket==='import')return arr(state.importCenter?.history);
 return [];
};
const atOf=(bucket,x)=>validDate(x?.at||x?.createdAt||x?.updatedAt||x?.importedAt||x?.soldAt||x?.date||x?.asOf);
const idOf=(bucket,x,i)=>clean(x?.id||x?.key||x?.ticketId||x?.ticker||x?.symbol||'',220)||`${atOf(bucket,x)||'undated'}|${hash(stable(x))}|${i}`;

export function historyPlan31(state={}){
 const records=[],counts={};
 for(const bucket of Object.keys(LIMITS)){
  const rows=sourceRows(state,bucket).slice(0,LIMITS[bucket]);counts[bucket]=rows.length;
  rows.forEach((payload,i)=>{const id=idOf(bucket,payload,i),at=atOf(bucket,payload);records.push({key:`${bucket}|${id}`,bucket,id,at,payload})});
 }
 return {records,counts,total:records.length,limits:{...LIMITS},note:'31.3 pouze zrcadlí existující historii do IndexedDB. Z primárního state nic nemaže a nekopíruje raw dokumenty, Vault ani cloudové auth tokeny.'};
}

export const historyPlan31Note='IndexedDB mirror obsahuje jen vybrané historické kolekce. Aktivní osobní state zůstává v 31.3 beze změny.';
