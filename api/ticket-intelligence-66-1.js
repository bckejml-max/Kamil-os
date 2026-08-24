import secondaryHandler from './ticket-market-watch.js';
import {scanOfficialMarket} from './_official-market.js';

async function secondary(req){let status=200,payload=null;const res={status(v){status=v;return this},setHeader(){},json(v){payload=v;return this}};await secondaryHandler(req,res);return{status,payload}}
const n=x=>Number(x||0);
function withPrimaryPressure(item,result,official){const base=result?.recommendation||{},market=result?.market||{},ask=n(item.askEachCzk),buy=n(item.buyEachCzk),officialPrice=n(official?.lowestPriceCzk),baseAsk=n(base.recommendedAskCzk),days=base.daysToEvent;
 let recommended=baseAsk||n(market.p25PriceCzk)||n(market.medianPriceCzk)||n(market.marketPriceCzk)||null,code=base.code,label=base.label,reason=base.reason||'';
 const onSale=['AVAILABLE','LIMITED'].includes(official?.status);
 if(onSale&&officialPrice){const primaryCap=Math.max(1,Math.round(officialPrice*.99));if(!recommended||recommended>primaryCap)recommended=primaryCap;
  if(item.status==='LISTED'&&ask&&ask>officialPrice*1.03){code='LOWER';label='ZLEVNIT';reason=`Oficiální prodej je stále ${official.label.toLowerCase()} za cenu od ${officialPrice.toLocaleString('cs-CZ')} Kč, pod tvojí nabídkou.`}
  else if(item.status==='NOT_LISTED'&&buy&&officialPrice<buy*1.10){code='HOLD';label='DRŽET';reason=`Oficiální prodej je stále ${official.label.toLowerCase()} a nejnižší zachycená cena nedává bezpečný prostor proti nákupu.`}
  else reason=`${reason}${reason?' ':''}Oficiální prodej je stále ${official.label.toLowerCase()}${officialPrice?` od ${officialPrice.toLocaleString('cs-CZ')} Kč`:''}; doporučení respektuje primární trh.`
 } else if(official?.status==='SOLD_OUT'){reason=`${reason}${reason?' ':''}Oficiální prodej je vyprodaný, takže cenu teď řídí hlavně sekundární trh.`}
 else if(official?.status==='LIMITED'){reason=`${reason}${reason?' ':''}Oficiální dostupnost je omezená.`}
 else if(official?.status==='UNKNOWN'){reason=`${reason}${reason?' ':''}Stav oficiálního prodeje je nejistý a do ceny ho nezapočítávám.`}
 const qty=Math.max(1,n(item.qty)||1),profit=buy&&recommended?recommended-buy:null;
 return{...base,code,label,reason,recommendedAskCzk:recommended,projectedGrossProfitEachCzk:profit,projectedGrossProfitTotalCzk:profit===null?null:profit*qty,projectedGrossRoi:buy&&recommended?recommended/buy-1:null,daysToEvent:days};}
async function postedItems(req){let b=req.body;if(typeof b==='string'){try{b=JSON.parse(b)}catch{b=null}}if(!b&&typeof req.json==='function'){try{b=await req.json()}catch{}}return Array.isArray(b?.items)?b.items.slice(0,40):[]}
export default async function handler(req,res){if(req.method==='GET'){res.status(200).json({ok:true,version:'66.1',mode:'private-post-only',features:['viagogo-secondary','official-primary','primary-price-pressure','safe-official-url']});return}if(req.method!=='POST'){res.status(405).json({error:'Method not allowed'});return}
 try{const items=await postedItems(req),baseReq={...req,body:{items}},sec=await secondary(baseReq);if(sec.status!==200||!sec.payload?.ok){res.status(sec.status||500).json(sec.payload||{ok:false,error:'Secondary market failed'});return}
  const source=new Map(items.map(x=>[String(x.id),x])),results=[];for(let i=0;i<sec.payload.results.length;i+=4){const chunk=sec.payload.results.slice(i,i+4);const done=await Promise.all(chunk.map(async r=>{const item=source.get(String(r.id))||r,official=await scanOfficialMarket(item.officialUrl);return{...r,official,recommendation:withPrimaryPressure(item,r,official)}}));results.push(...done)}
  const summary={...sec.payload.summary,officialAvailable:results.filter(x=>x.official?.status==='AVAILABLE').length,officialLimited:results.filter(x=>x.official?.status==='LIMITED').length,officialSoldOut:results.filter(x=>x.official?.status==='SOLD_OUT').length,officialUnknown:results.filter(x=>x.official?.status==='UNKNOWN').length,officialNoSource:results.filter(x=>x.official?.status==='NO_SOURCE').length};
  res.setHeader('Cache-Control','no-store');res.status(200).json({ok:true,version:'66.1',checkedAt:new Date().toISOString(),summary,results});
 }catch(e){res.status(500).json({ok:false,error:String(e?.message||e),checkedAt:new Date().toISOString()})}}
