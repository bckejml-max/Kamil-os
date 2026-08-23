import {store} from './state.js';
import {personalProofInbox628,previewProofImpact628} from './personalProofInbox628.js';

const KEY='kamil-os-personal-proof-review-629';
const safeParse=v=>{try{return JSON.parse(v||'{}')||{}}catch{return{}}};
const read=()=>typeof sessionStorage==='undefined'?{}:safeParse(sessionStorage.getItem(KEY));
const write=v=>{if(typeof sessionStorage!=='undefined')sessionStorage.setItem(KEY,JSON.stringify(v));return v};

const stageLabel=s=>s==='CONFIRMED'?'POTVRZENO UŽIVATELEM':s==='REVIEW'?'ZKONTROLOVAT':s==='FOUND'?'NALEZENO':'ČEKÁ NA DŮKAZ';

export function personalProofReview629(s=store.get()){
 const inbox=personalProofInbox628(s),saved=read();
 const items=inbox.items.map(v=>{const state=saved[v.id]||{};const stage=state.stage||'MISSING';const effective=stage==='CONFIRMED'?v.target:v.current;return{...v,stage,stageLabel:stageLabel(stage),proofNote:state.note||'',updatedAt:state.updatedAt||null,effectiveConfidence:effective,preview:previewProofImpact628(v.id,s)}});
 const confirmed=items.filter(v=>v.stage==='CONFIRMED'),review=items.filter(v=>v.stage==='REVIEW'),found=items.filter(v=>v.stage==='FOUND'),missing=items.filter(v=>v.stage==='MISSING');
 const average=items.length?Math.round(items.reduce((a,v)=>a+v.effectiveConfidence,0)/items.length):100;
 return{items,confirmed,review,found,missing,average,main:missing[0]||found[0]||review[0]||null,summary:`Proof Review · potvrzeno ${confirmed.length} · ke kontrole ${review.length+found.length} · chybí ${missing.length}`};
}

export function setProofStage629(id,stage,note=''){
 if(!['MISSING','FOUND','REVIEW','CONFIRMED'].includes(stage))throw new Error('Unsupported proof stage');
 const saved=read();saved[id]={stage,note:String(note||'').slice(0,500),updatedAt:new Date().toISOString()};write(saved);return saved[id];
}

export function clearProofReview629(id){const saved=read();delete saved[id];write(saved);return true;}
export function proofReviewStorageKey629(){return KEY;}
