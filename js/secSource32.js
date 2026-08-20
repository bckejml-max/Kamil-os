export const SEC_SOURCE_32={provider:'SEC_EDGAR',tickerMapUrl:'https://www.sec.gov/files/company_tickers.json',submissionsBase:'https://data.sec.gov/submissions',maxTickers:16,lookbackDays:30,maxPerTicker:3,freshHours:72};
export const SEC_MATERIAL_FORMS_32=new Set(['8-K','10-Q','10-K','6-K','20-F','40-F']);
export const SEC_XTB_ALIASES_32={
 '1YD.DE':'AVGO',
 'BRYN.DE':'BRK-B'
};
const NAME_ALIASES_32=[
 [/\bbroadcom\b/i,'AVGO'],
 [/\bberkshire\b/i,'BRK-B']
];
const arr=v=>Array.isArray(v)?v:[];
const upper=v=>String(v??'').trim().toUpperCase();
const padCik=v=>String(Math.trunc(Number(v))).padStart(10,'0');
const stripAmendment=form=>String(form||'').toUpperCase().replace(/\/A$/,'');

export function secTicker32(raw){
 let s=upper(raw).replace(/\s+/g,'');
 if(s.endsWith('.US'))s=s.slice(0,-3);
 if(s.endsWith('_US'))s=s.slice(0,-3);
 if(s.endsWith('-US'))s=s.slice(0,-3);
 if(!/^[A-Z0-9.-]{1,12}$/.test(s))return null;
 return s;
}

export function secTickerForPosition32(position={}){
 const raw=upper(position?.ticker),alias=SEC_XTB_ALIASES_32[raw];
 if(alias)return alias;
 if(raw.endsWith('.US'))return secTicker32(raw);
 const name=String(position?.name||'');
 for(const [pattern,ticker] of NAME_ALIASES_32)if(pattern.test(name))return ticker;
 return null;
}

export function secRequestedTickers32(values,limit=SEC_SOURCE_32.maxTickers){
 const out=[];for(const raw of arr(values)){const t=secTicker32(raw);if(t&&!out.includes(t))out.push(t);if(out.length>=limit)break}return out;
}

export function secRequestedFromPositions32(positions,limit=SEC_SOURCE_32.maxTickers){
 const out=[];for(const p of arr(positions)){const t=secTickerForPosition32(p);if(t&&!out.includes(t))out.push(t);if(out.length>=limit)break}return out;
}

export function secTickerIndex32(json={}){
 const map=new Map();for(const row of Object.values(json||{})){const ticker=secTicker32(row?.ticker),cik=Number(row?.cik_str);if(!ticker||!Number.isInteger(cik)||cik<=0)continue;map.set(ticker,{ticker,cik,cik10:padCik(cik),title:String(row?.title||'').trim()})}return map;
}

export function secAcceptedIso32(raw,fallbackDate=null){
 const s=String(raw||'').trim();if(/^\d{14}$/.test(s)){const iso=`${s.slice(0,4)}-${s.slice(4,6)}-${s.slice(6,8)}T${s.slice(8,10)}:${s.slice(10,12)}:${s.slice(12,14)}Z`,t=Date.parse(iso);if(Number.isFinite(t))return new Date(t).toISOString()}
 const t=Date.parse(s);if(Number.isFinite(t))return new Date(t).toISOString();const f=Date.parse(String(fallbackDate||''));return Number.isFinite(f)?new Date(f).toISOString():null;
}

export function secFilingUrl32(cik,accessionNumber){
 const cikNum=Math.trunc(Number(cik)),accession=String(accessionNumber||'').trim();if(!Number.isInteger(cikNum)||cikNum<=0||!/^[0-9-]+$/.test(accession))return null;return `https://www.sec.gov/Archives/edgar/data/${cikNum}/${accession.replace(/-/g,'')}/${accession}-index.html`;
}

function formKind32(form){const base=stripAmendment(form);if(base==='8-K'||base==='6-K')return 'CURRENT_REPORT';if(['10-Q','10-K','20-F','40-F'].includes(base))return 'PERIODIC_REPORT';return 'FILING'}

export function secMaterialEvidence32(submissions={},ticker,{now=new Date(),lookbackDays=SEC_SOURCE_32.lookbackDays,maxPerTicker=SEC_SOURCE_32.maxPerTicker}={}){
 const recent=submissions?.filings?.recent||{},forms=arr(recent.form),filed=arr(recent.filingDate),accepted=arr(recent.acceptanceDateTime),accessions=arr(recent.accessionNumber),primary=arr(recent.primaryDocument),descriptions=arr(recent.primaryDocDescription),nowMs=new Date(now).getTime(),cutoff=Number.isFinite(nowMs)?nowMs-Math.max(1,Number(lookbackDays)||SEC_SOURCE_32.lookbackDays)*86400000:0,out=[];
 const cik=Number(submissions?.cik),companyName=String(submissions?.name||'').trim(),symbol=secTicker32(ticker);if(!symbol||!Number.isInteger(cik)||cik<=0)return out;
 for(let i=0;i<forms.length&&i<150;i++){
  const form=String(forms[i]||'').toUpperCase(),base=stripAmendment(form);if(!SEC_MATERIAL_FORMS_32.has(base))continue;
  const filedAt=secAcceptedIso32(filed[i]);if(!filedAt||Date.parse(filedAt)<cutoff)continue;
  const asOf=secAcceptedIso32(accepted[i],filedAt),sourceUrl=secFilingUrl32(cik,accessions[i]);if(!asOf||!sourceUrl)continue;
  const freshUntil=new Date(Date.parse(asOf)+SEC_SOURCE_32.freshHours*3600000).toISOString();
  out.push({id:`sec|${symbol}|${String(accessions[i]||'').replace(/[^0-9]/g,'')}`,provider:SEC_SOURCE_32.provider,evidenceKind:'REGULATORY_FILING',form,formKind:formKind32(form),ticker:symbol,cik,companyName,title:`${symbol} · ${form}${companyName?` · ${companyName}`:''}`,description:String(descriptions[i]||'').trim()||null,primaryDocument:String(primary[i]||'').trim()||null,accessionNumber:String(accessions[i]||'').trim(),filedAt,asOf,freshUntil,confidence:100,confidenceMeaning:'SOURCE_AUTHENTICITY',sourceUrl,sourceUrls:[sourceUrl]});
  if(out.length>=Math.max(1,Math.min(5,Number(maxPerTicker)||SEC_SOURCE_32.maxPerTicker)))break;
 }
 return out;
}

export function secSourceSummary32(evidence=[],requested=[]){
 const rows=arr(evidence),tickers=secRequestedTickers32(requested);return {provider:SEC_SOURCE_32.provider,requested:tickers.length,evidence:rows.length,covered:new Set(rows.map(x=>x?.ticker).filter(Boolean)).size,materialForms:[...SEC_MATERIAL_FORMS_32]};
}
