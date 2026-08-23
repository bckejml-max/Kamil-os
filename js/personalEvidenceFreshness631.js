import {evidenceLedger630} from './personalEvidenceLedger630.js';

const WINDOWS={
 'recovered-auto-insurance':30,
 'recovered-bank-coverage':40,
 'recovered-mortgage-2026-08':40,
 'recovered-home-insurance-2026':90,
 'recovered-life-tereza-nn':180,
 'recovered-life-kamil-allianz':180,
 'recovered-electricity-eon-2026':180,
 'recovered-home-vlasatice':365
};

const DAY=86400000;
const asMs=v=>{const n=Date.parse(v||'');return Number.isFinite(n)?n:null};
const windowDays=id=>WINDOWS[id]||120;

export function evidenceFreshnessItem631(item,now=Date.now()){
 const confirmed=asMs(item?.confirmedAt),maxDays=windowDays(item?.id),ageDays=confirmed==null?Infinity:Math.max(0,Math.floor((now-confirmed)/DAY));
 const nextReviewAt=confirmed==null?null:new Date(confirmed+maxDays*DAY).toISOString();
 const status=ageDays>maxDays?'STALE':ageDays>=Math.floor(maxDays*.75)?'DUE_SOON':'FRESH';
 const label=status==='STALE'?'STARÉ':status==='DUE_SOON'?'BRZY OBNOVIT':'ČERSTVÉ';
 return{...item,ageDays,maxDays,nextReviewAt,freshnessStatus:status,freshnessLabel:label,isFresh:status!=='STALE'};
}

export function personalEvidenceFreshness631(now=Date.now()){
 const ledger=evidenceLedger630(),items=ledger.items.map(v=>evidenceFreshnessItem631(v,now)).sort((a,b)=>{
  const rank={STALE:0,DUE_SOON:1,FRESH:2};return rank[a.freshnessStatus]-rank[b.freshnessStatus]||b.ageDays-a.ageDays;
 });
 const stale=items.filter(v=>v.freshnessStatus==='STALE'),dueSoon=items.filter(v=>v.freshnessStatus==='DUE_SOON'),fresh=items.filter(v=>v.freshnessStatus==='FRESH');
 return{items,stale,dueSoon,fresh,count:items.length,needsReview:stale.length+dueSoon.length,summary:`Evidence Freshness · čerstvé ${fresh.length} · brzy obnovit ${dueSoon.length} · staré ${stale.length}`};
}

export function evidenceFreshnessById631(id,now=Date.now()){
 return personalEvidenceFreshness631(now).items.find(v=>v.id===id)||null;
}
