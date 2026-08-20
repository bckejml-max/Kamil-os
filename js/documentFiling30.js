const DAY=86400000;
const CATEGORY_META={
 PAYMENT:{label:'Platby',homeMode:'payments'},
 INSURANCE:{label:'Pojištění',homeMode:'insurance'},
 DOCUMENT:{label:'Doklady',homeMode:'documents'},
 SUBSCRIPTION:{label:'Smlouvy a předplatná',homeMode:'contracts'},
 OTHER:{label:'Osobní administrativa',homeMode:'contracts'}
};
const active=x=>String(x?.status||'ACTIVE').toUpperCase()!=='ARCHIVED';
const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('cs-CZ').replace(/\s+/g,' ').trim();
const finite=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v));
const safeCategory=v=>CATEGORY_META[String(v||'').toUpperCase()]?String(v).toUpperCase():'OTHER';
const dateKey=v=>{if(v===null||v===undefined||v==='')return null;const s=String(v),d=/^\d{4}-\d{2}-\d{2}$/.test(s)?new Date(`${s}T12:00:00`):new Date(v);return Number.isFinite(d.getTime())?`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`:null};
const dayDiff=(v,now=new Date())=>{const a=dateKey(v),b=dateKey(now);if(!a||!b)return null;return Math.round((new Date(`${a}T12:00:00`)-new Date(`${b}T12:00:00`))/DAY)};
const relevantDate=x=>dateKey(x?.nextDue)||dateKey(x?.document?.expiryDate)||dateKey(x?.noticeDate)||dateKey(x?.renewalDate)||dateKey(x?.endDate)||null;

function trackingRows(record,now){
 const rows=[],add=(kind,label,value)=>{const date=dateKey(value);if(!date)return;rows.push({kind,label,date,days:dayDiff(date,now)})};
 const category=safeCategory(record?.category);
 if(category==='PAYMENT')add('DUE','Splatnost',record?.nextDue);
 else if(category==='DOCUMENT'){
  add('EXPIRY','Expirace / kontrola',record?.document?.expiryDate||record?.renewalDate||record?.endDate);
  add('REMINDER','Vlastní předstih',record?.document?.reminderDate);
 }else if(category==='INSURANCE'){
  add('NOTICE','Výpověď nejpozději',record?.noticeDate);
  add('RENEWAL','Výročí / konec',record?.renewalDate||record?.insurance?.renewalDate||record?.endDate||record?.insurance?.endDate);
  add('DUE','Další platba / kontrola',record?.nextDue);
 }else if(category==='SUBSCRIPTION'){
  add('NOTICE','Výpověď nejpozději',record?.noticeDate);
  add('RENEWAL','Výročí / konec',record?.renewalDate||record?.endDate);
  add('DUE','Další platba',record?.nextDue);
 }else{
  add('DUE','Další termín',record?.nextDue);add('RENEWAL','Výročí / konec',record?.renewalDate||record?.endDate);
 }
 const seen=new Set();return rows.filter(x=>{const k=`${x.kind}|${x.date}`;if(seen.has(k))return false;seen.add(k);return true}).sort((a,b)=>(a.days??99999)-(b.days??99999)||a.kind.localeCompare(b.kind));
}

function gaps(record,tracked){
 const category=safeCategory(record?.category),out=[];
 if(category==='PAYMENT'){
  if(!finite(record?.amount))out.push('Částka není potvrzená. Kamil OS ji nebude dopočítávat.');
  if(!tracked.some(x=>x.kind==='DUE'))out.push('Chybí potvrzená splatnost; žádný termín se nevymýšlí.');
 }else if(category==='DOCUMENT'){
  if(!tracked.some(x=>x.kind==='EXPIRY'))out.push('Chybí potvrzená expirace / kontrolní termín.');
  else if(!tracked.some(x=>x.kind==='REMINDER'))out.push('Předstih není nastavený. Můžeš zadat vlastní datum; Kamil OS žádnou lhůtu nevymýšlí.');
 }else if(category==='INSURANCE'){
  if(!tracked.some(x=>x.kind==='RENEWAL'))out.push('Chybí potvrzené výročí / konec pojištění.');
  if(!tracked.some(x=>x.kind==='NOTICE'))out.push('Výpovědní termín není uložený; Kamil OS ho z výročí neodvozuje.');
 }else if(category==='SUBSCRIPTION'){
  if(!tracked.some(x=>x.kind==='RENEWAL'))out.push('Chybí potvrzené výročí / konec smlouvy.');
  if(!tracked.some(x=>x.kind==='NOTICE'))out.push('Výpovědní termín není uložený; žádná smluvní lhůta se nevymýšlí.');
 }else out.push('Dokument je zařazený obecně. Pokud znáš správný registr, změň kategorii ručně.');
 return out;
}

function relatedScore(record,x){
 if(!x||x.id===record?.id||!active(x))return null;
 const category=safeCategory(record?.category);if(safeCategory(x.category)!==category)return null;
 let score=0;const reasons=[],provider=norm(record?.provider),otherProvider=norm(x.provider),title=norm(record?.title),otherTitle=norm(x.title);
 if(provider&&otherProvider&&provider===otherProvider){score+=55;reasons.push('stejný poskytovatel')}
 if(title&&otherTitle&&title===otherTitle){score+=35;reasons.push('stejný název')}
 const docType=String(record?.scanner30?.documentType||''),otherDocType=String(x?.scanner30?.documentType||'');if(docType&&otherDocType&&docType===otherDocType){score+=15;reasons.push('stejný typ skenu')}
 if(finite(record?.amount)&&finite(x.amount)&&Number(record.amount)===Number(x.amount)&&String(record.currency||'CZK').toUpperCase()===String(x.currency||'CZK').toUpperCase()){score+=10;reasons.push('stejná částka a měna')}
 const a=relevantDate(record),b=relevantDate(x);if(a&&b&&a===b){score+=10;reasons.push('stejný uložený termín')}
 score=Math.min(100,score);if(score<55)return null;
 return {id:x.id,title:x.title||'Existující položka',category,score,reasons};
}

export function documentFilingRecommendation(record={},s={},now=new Date()){
 const category=safeCategory(record.category),meta=CATEGORY_META[category],tracked=trackingRows(record,now),related=(s.personalAdmin?.items||[]).map(x=>relatedScore(record,x)).filter(Boolean).sort((a,b)=>b.score-a.score||String(a.title).localeCompare(String(b.title),'cs')||String(a.id).localeCompare(String(b.id))).slice(0,5),missing=gaps(record,tracked);
 const due90=tracked.filter(x=>x.days!==null&&x.days>=0&&x.days<=90),overdue=tracked.filter(x=>x.days!==null&&x.days<0);
 return {kind:'DOCUMENT_FILING_30',category,filing:{label:meta.label,target:'home',homeMode:meta.homeMode},tracked,related,gaps:missing,due90,overdue,canSetReminder:category==='DOCUMENT'&&tracked.some(x=>x.kind==='EXPIRY'),note:'Smart Filing používá jen potvrzená metadata. Související položky pouze navrhuje k ruční kontrole; nikdy je automaticky neslučuje a nevymýšlí právní ani smluvní lhůty.'};
}

export function documentReminderPatch(record={},requestedDate,now=new Date()){
 if(safeCategory(record.category)!=='DOCUMENT')return {ok:false,code:'NOT_DOCUMENT',message:'Vlastní předstih je určený jen pro evidovaný doklad / záruku.'};
 const date=dateKey(requestedDate);if(!date)return {ok:false,code:'INVALID_DATE',message:'Zadej platné datum připomínky.'};
 const expiry=dateKey(record?.document?.expiryDate||record?.renewalDate||record?.endDate);if(!expiry)return {ok:false,code:'NO_EXPIRY',message:'Nejdřív potvrď expiraci / kontrolní termín.'};
 const days=dayDiff(date,now);if(days!==null&&days<0)return {ok:false,code:'PAST_DATE',message:'Datum připomínky už je v minulosti.'};
 if(new Date(`${date}T12:00:00`)>new Date(`${expiry}T12:00:00`))return {ok:false,code:'AFTER_EXPIRY',message:'Připomínka musí být nejpozději v den expirace / kontroly.'};
 return {ok:true,patch:{document:{...(record.document||{}),reminderDate:date}},date,expiry,note:'Datum je výslovně zadané uživatelem. Kamil OS nepoužil žádnou přednastavenou právní ani servisní lhůtu.'};
}

export const documentFiling30Note='Zařazení a follow-up jsou pouze návrhy nad potvrzenými metadaty. Bez výslovného potvrzení se žádná položka nesloučí a žádná lhůta se nedopočítá.';
