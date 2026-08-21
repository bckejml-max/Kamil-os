import {store} from './state.js';
import {uid} from './utils.js';

const SNAPSHOT='external-investments-2026-07-24';
const DEFINITIONS=[
 {
  key:'efekta-dip-sp500',
  title:'Efekta DIP · iShares Core S&P 500 UCITS ETF',
  provider:'Efekta',
  accountType:'DIP',
  instrument:'iShares Core S&P 500 UCITS ETF',
  isin:'IE00B5BMR087',
  value:1276.96,
  currency:'EUR',
  monthlyContributionCzk:3000,
  liquid:false,
  kind:'INVESTMENT',
  allocationClass:'broad',
  note:'S&P 500 mimo XTB; počítat do celkového investičního majetku.'
 },
 {
  key:'efekta-real-estate',
  title:'Efekta · Real Estate Fund Class CZK',
  provider:'Efekta',
  accountType:'Investice',
  instrument:'EFEKTA Real Estate Fund Class CZK',
  isin:'LI0294389098',
  value:11000,
  currency:'CZK',
  monthlyContributionCzk:0,
  liquid:false,
  kind:'INVESTMENT',
  allocationClass:'real-estate',
  note:'Další investice mimo XTB.'
 }
];

const norm=v=>String(v||'').toLocaleLowerCase('cs-CZ').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();

function findExisting(items,d){
 return items.find(x=>x.externalInvestmentKey===d.key)||items.find(x=>norm(`${x.title||''} ${x.provider||''} ${x.isin||''}`).includes(norm(d.isin)));
}

function apply(target,d){
 const hasUserValue=target.externalInvestmentKey===d.key&&target.updatedAt&&target.seededAt&&new Date(target.updatedAt)>new Date(target.seededAt);
 target.externalInvestmentKey=d.key;
 target.externalInvestmentSnapshot=SNAPSHOT;
 target.side='ASSET';
 target.status=target.status||'ACTIVE';
 target.provider=d.provider;
 target.accountType=d.accountType;
 target.instrument=d.instrument;
 target.isin=d.isin;
 target.kind=d.kind;
 target.allocationClass=d.allocationClass;
 target.liquid=d.liquid;
 target.note=target.note||d.note;
 target.monthlyContributionCzk=Number.isFinite(Number(target.monthlyContributionCzk))?Number(target.monthlyContributionCzk):d.monthlyContributionCzk;
 if(!hasUserValue){
  target.title=d.title;
  target.value=d.value;
  target.currency=d.currency;
 }
 target.seededAt=target.seededAt||new Date().toISOString();
}

export function ensureExternalInvestments33(){
 const current=store.get();
 if(current?.meta?.externalInvestmentSnapshot===SNAPSHOT)return false;
 store.mutate('Doplněny investice mimo XTB',s=>{
  s.meta=s.meta||{};
  s.netWorthBook=s.netWorthBook||{items:[],history:[]};
  s.netWorthBook.items=Array.isArray(s.netWorthBook.items)?s.netWorthBook.items:[];
  for(const d of DEFINITIONS){
   let x=findExisting(s.netWorthBook.items,d);
   if(!x){x={id:uid('networth'),createdAt:new Date().toISOString()};s.netWorthBook.items.push(x)}
   apply(x,d);
  }
  s.meta.externalInvestmentSnapshot=SNAPSHOT;
  s.meta.externalInvestmentSnapshotAt=new Date().toISOString();
 },{undo:false});
 return true;
}

let applying=false;
const ensure=()=>{if(applying)return;applying=true;try{ensureExternalInvestments33()}finally{applying=false}};
store.subscribe(()=>queueMicrotask(ensure));
queueMicrotask(ensure);
