const n=v=>Number(v||0);
const upper=v=>String(v||'').toUpperCase();
const clamp=(v,min=0,max=100)=>Math.max(min,Math.min(max,Number(v)||0));
const round=(v,d=2)=>{const k=10**d;return Math.round((Number(v)||0)*k)/k};

function trimShare32(position,decision){
 const action=upper(decision?.action),gain=n(position?.net_profit_pct),weight=n(position?.weightPct);
 if(action==='SELL')return 1;
 let share=.25;
 if(weight>=20)share=.5;else if(weight>=15)share=.4;else if(weight>=12)share=.33;
 if(gain>=60)share=Math.max(share,.4);else if(gain>=40)share=Math.max(share,.3);
 return Math.max(.2,Math.min(.6,share));
}
function tranchePlan32(position,decision){
 if(upper(decision?.action)!=='BUY')return null;
 const etf=upper(position?.category)==='ETF',gain=n(position?.net_profit_pct);
 const parts=etf?[40,30,30]:gain<=-12?[30,30,40]:[35,30,35];
 return {count:3,partsPct:parts,rule:etf?'Rozdělit plánovaný nákup do 3 kroků; další tranše nepřidávat jen proto, že cena klesá.':'Tři kroky; další tranše až po potvrzení teze nebo novém katalyzátoru.'};
}
function evidenceSummary32(evidence=[]){
 const rows=(Array.isArray(evidence)?evidence:[]).filter(Boolean).sort((a,b)=>Date.parse(b.asOf||0)-Date.parse(a.asOf||0)),latest=rows[0]||null,now=Date.now(),fresh=latest&&Date.parse(latest.freshUntil||0)>=now;
 return {count:rows.length,latest,fresh:!!fresh,forms:rows.slice(0,3).map(x=>x.form).filter(Boolean),sourceUrls:rows.slice(0,3).flatMap(x=>x.sourceUrls||[]).filter((x,i,a)=>a.indexOf(x)===i)};
}

export function tuneXtbDecision32(position={},decision={},state={},evidence=[]){
 const action=upper(decision?.action||'HOLD'),value=n(position.value),volume=n(position.volume),share=trimShare32(position,decision),ev=evidenceSummary32(evidence),dataAt=state.xtbHub?.asOf||state.xtbReport?.asOf||null,dataAgeHours=dataAt?Math.max(0,(Date.now()-Date.parse(dataAt))/3600000):null,stale=dataAgeHours===null||dataAgeHours>48;
 const trimQty=['TRIM','SELL'].includes(action)&&volume>0?round(volume*share,4):null,trimAmount=['TRIM','SELL'].includes(action)&&value>0?Math.round(value*share):null,tranches=tranchePlan32(position,decision),requiresReview=!!(ev.latest&&['BUY','TRIM','SELL','REVIEW'].includes(action));
 let executionLabel='Bez obchodu';
 if(action==='SELL')executionLabel='Plný exit po potvrzení dat a teze';
 else if(action==='TRIM')executionLabel=`Redukce cca ${Math.round(share*100)} % pozice`;
 else if(action==='BUY')executionLabel='Nákup rozdělit do 3 tranší';
 else if(action==='REVIEW')executionLabel='Neobchodovat před dokončením review';
 const executionBlocked=stale&&['BUY','TRIM','SELL'].includes(action);
 return {...decision,
  execution:{label:executionLabel,trimPct:['TRIM','SELL'].includes(action)?Math.round(share*100):null,trimQty,trimAmount,tranches,blocked:executionBlocked,blockReason:executionBlocked?'XTB import je starší než 48 hodin. Před obchodem obnov data.':null},
  evidence:ev,
  reviewBeforeTrade:requiresReview,
  reviewReason:requiresReview?`Je dostupné nové oficiální SEC podání${ev.latest?.form?` (${ev.latest.form})`:''}; před změnou pozice otevři zdroj.`:null,
  dataAgeHours:dataAgeHours===null?null:round(dataAgeHours,1),
  tuningConfidence:clamp(decision?.confidence??(decision?.source==='RUČNĚ'?85:55))
 };
}

export function xtbTuningSummary32(board=[]){
 const rows=Array.isArray(board)?board:[],blocked=rows.filter(x=>x.d?.execution?.blocked).length,review=rows.filter(x=>x.d?.reviewBeforeTrade).length,actionable=rows.filter(x=>['BUY','TRIM','SELL','REVIEW'].includes(upper(x.d?.action))).length,evidence=rows.filter(x=>x.d?.evidence?.count>0).length;
 return {positions:rows.length,actionable,blocked,review,evidence,contract:'NO_AUTO_TRADE'};
}
