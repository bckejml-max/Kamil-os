import {store} from './state.js';
import {personalVault640} from './personalVault640.js';
import {personalActions640} from './personalActions640.js';

const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const money=v=>new Intl.NumberFormat('cs-CZ',{style:'currency',currency:'CZK',maximumFractionDigits:0}).format(Number(v||0));
const date=v=>{const t=Date.parse(v||'');return Number.isFinite(t)?new Date(t).toLocaleDateString('cs-CZ'):'—'};

export function answerPersonalQuestion640(question,s=store.get()){
 const q=norm(question),v=personalVault640(s),actions=personalActions640(s);
 const insurance=v.insurance,knownInsurance=insurance.filter(x=>Number(x.monthlyAmount||x.annualAmount)>0),unknownInsurance=insurance.filter(x=>!Number(x.monthlyAmount||x.annualAmount));
 if((q.includes('pojist')||q.includes('pojistk'))&&(q.includes('kolik')||q.includes('roc')||q.includes('mesic')||q.includes('stoji'))){
  const lines=knownInsurance.map(x=>`${x.title}: ${x.monthlyAmount?`${money(x.monthlyAmount)}/měs.`:`${money(x.annualAmount)}/rok`}`);
  if(unknownInsurance.length)lines.push(`Nezapočítáno: ${unknownInsurance.map(x=>x.title).join(', ')} — částka není spolehlivě známá.`);
  return{title:`Známé pojistky: ${money(v.insuranceAnnual)} ročně`,body:`To je přibližně ${money(v.insuranceAnnual/12)} měsíčně.`,lines};
 }
 if(q.includes('hypot')){
  const x=v.records.find(r=>r.recordType==='mortgage');return x?{title:`Hypotéka: ${money(x.balance)}`,body:`Známá splátka ${money(x.monthlyAmount)}/měs. · stav k ${date(x.asOf)}.`,lines:[x.nextAction]}:{title:'Hypotéku v osobních datech nemám.',body:'Doplň aktuální zůstatek a splátku.',lines:[]};
 }
 if(q.includes('elektr')||q.includes('eon')){
  const x=v.records.find(r=>r.recordType==='utility');return x?{title:x.title,body:`Smlouva do ${date(x.validUntil)}.`,lines:[x.noticeBy?`Rozhodnutí nejpozději ${date(x.noticeBy)}.`:'',x.nextAction].filter(Boolean)}:{title:'Elektřinu v osobních datech nemám.',body:'',lines:[]};
 }
 if(q.includes('konci')||q.includes('platnost')||q.includes('obnov')||q.includes('vyprsi')){
  const rows=v.records.filter(x=>x.validUntil||x.noticeBy||x.reviewAt).sort((a,b)=>Date.parse(a.noticeBy||a.validUntil||a.reviewAt)-Date.parse(b.noticeBy||b.validUntil||b.reviewAt));
  return{title:rows.length?'Nejbližší známé termíny':'Nemám známý termín k ukázání.',body:'',lines:rows.slice(0,6).map(x=>`${x.title}: ${date(x.noticeBy||x.validUntil||x.reviewAt)}`)};
 }
 if(q.includes('chybi')||q.includes('overit')||q.includes('nejist')||q.includes('data')){
  return{title:`K ověření: ${v.action.length}`,body:`Pokrytí osobních dat je ${v.coverage} %.`,lines:v.action.slice(0,6).map(x=>`${x.title}: ${x.nextAction}`)};
 }
 if(q.includes('kolik platim')||q.includes('fixni')||q.includes('mesicne')||q.includes('mesicni')){
  return{title:`Známé pravidelné závazky: ${money(v.monthlyKnown)}/měs.`,body:'Součet zahrnuje jen částky, které máme spolehlivě uložené.',lines:v.records.filter(x=>x.monthlyAmount||x.annualAmount).map(x=>`${x.title}: ${x.monthlyAmount?`${money(x.monthlyAmount)}/měs.`:`${money(x.annualAmount)}/rok`}`)};
 }
 if(q.includes('dnes')||q.includes('co mam')||q.includes('resit')||q.includes('priorit')){
  return{title:actions.summary,body:'',lines:actions.top3.map((x,i)=>`${i+1}. ${x.title} — ${x.why}`)};
 }
 const cloud=s.meta?.cloudMode==='cloud'?'Cloud je připojený.':'Data jsou zatím jen na tomto zařízení.';
 return{title:'Můžu odpovídat z Personal Data Vaultu.',body:`${v.summary}. ${cloud}`,lines:['Zkus: „Kolik mě stojí pojistky ročně?“','„Co mi končí?“','„Co mám dnes řešit?“','„Kolik platím měsíčně?“']};
}
