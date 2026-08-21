import {store} from './state.js';
import {uid} from './utils.js';

const SNAPSHOT='external-investments-2026-07-24';
const DEFINITIONS=[
 {key:'efekta-dip-sp500',title:'Efekta DIP · iShares Core S&P 500 UCITS ETF',provider:'Efekta',accountType:'DIP',instrument:'iShares Core S&P 500 UCITS ETF',isin:'IE00B5BMR087',value:1276.96,currency:'EUR',monthlyContributionCzk:3000,liquid:false,kind:'INVESTMENT',allocationClass:'broad',note:'S&P 500 mimo XTB; počítat do celkového investičního majetku.'},
 {key:'efekta-real-estate',title:'Efekta · Real Estate Fund Class CZK',provider:'Efekta',accountType:'Investice',instrument:'EFEKTA Real Estate Fund Class CZK',isin:'LI0294389098',value:11000,currency:'CZK',monthlyContributionCzk:0,liquid:false,kind:'INVESTMENT',allocationClass:'real-estate',note:'Další investice mimo XTB.'}
];
const norm=v=>String(v||'').toLocaleLowerCase('cs-CZ').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
function findExisting(items,d){return items.find(x=>x.externalInvestmentKey===d.key)||items.find(x=>norm(`${x.title||''} ${x.provider||''} ${x.isin||''}`).includes(norm(d.isin)))}
const fill=(target,key,value)=>{if(target[key]===undefined||target[key]===null||target[key]==='')target[key]=value};
function apply(target,d,{isNew=false}={}){
 const sourceWasSeed=target.externalInvestmentKey===d.key,userEdited=sourceWasSeed&&target.updatedAt&&target.seededAt&&new Date(target.updatedAt)>new Date(target.seededAt);
 target.externalInvestmentKey=d.key;target.externalInvestmentSnapshot=SNAPSHOT;target.side=target.side||'ASSET';target.status=target.status||'ACTIVE';target.kind=target.kind||d.kind;target.seededAt=target.seededAt||new Date().toISOString();
 if(isNew||(sourceWasSeed&&!userEdited)){target.title=d.title;target.provider=d.provider;target.accountType=d.accountType;target.instrument=d.instrument;target.isin=d.isin;target.allocationClass=d.allocationClass;target.liquid=d.liquid;target.note=target.note||d.note;target.monthlyContributionCzk=Number.isFinite(Number(target.monthlyContributionCzk))?Number(target.monthlyContributionCzk):d.monthlyContributionCzk;target.value=d.value;target.currency=d.currency;return}
 fill(target,'title',d.title);fill(target,'provider',d.provider);fill(target,'accountType',d.accountType);fill(target,'instrument',d.instrument);fill(target,'isin',d.isin);fill(target,'allocationClass',d.allocationClass);if(target.liquid===undefined)target.liquid=d.liquid;fill(target,'note',d.note);if(!Number.isFinite(Number(target.monthlyContributionCzk)))target.monthlyContributionCzk=d.monthlyContributionCzk;if(!Number.isFinite(Number(target.value)))target.value=d.value;fill(target,'currency',d.currency);
}
export function externalInvestmentSeedStatus33(state=store.get()){const items=Array.isArray(state?.netWorthBook?.items)?state.netWorthBook.items:[],matched=DEFINITIONS.filter(d=>findExisting(items,d)).length;return {snapshot:SNAPSHOT,total:DEFINITIONS.length,matched,missing:Math.max(0,DEFINITIONS.length-matched),ready:state?.meta?.externalInvestmentSnapshot===SNAPSHOT&&matched===DEFINITIONS.length}}
export function ensureExternalInvestments33(){const before=externalInvestmentSeedStatus33(store.get());if(before.ready)return false;store.mutate('Načteny dříve evidované investice mimo XTB',s=>{s.meta=s.meta||{};s.netWorthBook=s.netWorthBook||{items:[],history:[]};s.netWorthBook.items=Array.isArray(s.netWorthBook.items)?s.netWorthBook.items:[];for(const d of DEFINITIONS){let x=findExisting(s.netWorthBook.items,d),isNew=false;if(!x){x={id:uid('networth'),createdAt:new Date().toISOString()};s.netWorthBook.items.push(x);isNew=true}apply(x,d,{isNew})}s.meta.externalInvestmentSnapshot=SNAPSHOT;s.meta.externalInvestmentSnapshotAt=new Date().toISOString()});return true}
export const externalInvestments33Info={snapshot:SNAPSHOT,total:DEFINITIONS.length,policy:'read-only import until explicit ensureExternalInvestments33(); newer user edits win over seed data'};
