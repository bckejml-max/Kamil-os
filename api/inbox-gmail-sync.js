const json=(res,status,body)=>{res.statusCode=status;res.setHeader('content-type','application/json; charset=utf-8');res.setHeader('cache-control','private, no-store, max-age=0');res.end(JSON.stringify(body))};
const SUPABASE_URL=process.env.SUPABASE_URL||'https://tswqfbkmxywxxczsoddr.supabase.co';
const SUPABASE_KEY=process.env.SUPABASE_ANON_KEY||process.env.SUPABASE_KEY||'sb_publishable_kLy9FrQ7cpNEVhvqcCEsfw_MFVqBlFg';
const clean=v=>String(v||'').replace(/\s+/g,' ').trim();
const norm=v=>clean(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const lowerHeaders=msg=>Object.fromEntries((msg?.payload?.headers||[]).map(h=>[String(h?.name||'').toLowerCase(),String(h?.value||'')]));
const BOT_RE=/(?:^|[<\s])(?:no-?reply|noreply|mailer-daemon|notifications?|newsletter|news|marketing|updates?)@|list-unsubscribe|facebook|instagram|linkedin|google alerts/i;
const PAY_RE=/faktur|invoice|splatn|uhrad|platb|payment due|amount due|zaplat|vyuct|vyúčt|nedoplat|bankovni spojeni|bankovní spojení/i;
const DOC_RE=/podepi|signature|signatur|smlouv|contract|dokument|document|priloh|příloh|attachment|doklad|formular|formulář|vypln|doloz|dolož|potvrzeni|potvrzení/i;
const DEADLINE_RE=/termin|termín|deadline|nejpozdeji|nejpozději|due (?:on|by)|expires?|platnost|konci|končí|do\s+\d{1,2}[.\/-]\d{1,2}|by\s+(?:mon|tue|wed|thu|fri|sat|sun)/i;
const REPLY_RE=/odpov|reply|dejte vedet|dejte vědět|let me know|muzete|můžete|prosim (?:o|potvr)|prosím (?:o|potvr)|please (?:confirm|reply|let us know)|can you|could you|would you|potrebujeme|potřebujeme|potrebuji|potřebuji|need you|your response/i;
const DO_RE=/action required|vyzaduje|vyžaduje|je treba|je třeba|potreba|potřeba|zaslete|zašlete|send us|please provide|doplnit|doplnte|doplňte|confirm|potvrdte|potvrďte|urgent|required action/i;
function classify({subject,snippet,from,unread,bulk}){
 const text=`${subject} ${snippet}`,automated=bulk||BOT_RE.test(`${from} ${subject}`),question=text.includes('?');
 if(PAY_RE.test(text))return{bucket:'pay',confidence:'high',why:'Mail vypadá jako platba / faktura / splatnost.'};
 if(DOC_RE.test(text))return{bucket:'document',confidence:'high',why:'Mail vyžaduje dokument, podpis nebo doložení podkladu.'};
 if(DEADLINE_RE.test(text))return{bucket:'deadline',confidence:'medium',why:'Mail obsahuje termín nebo časově omezený krok.'};
 if(!automated&&(question||REPLY_RE.test(text)))return{bucket:'reply',confidence:'medium',why:'Mail pravděpodobně čeká na tvoji odpověď.'};
 if(DO_RE.test(text))return{bucket:'do',confidence:'medium',why:'Mail obsahuje konkrétní požadavek nebo další krok.'};
 if(!automated&&unread)return{bucket:'reply',confidence:'low',why:'Nový přímý mail; OS doporučuje ověřit, zda vyžaduje odpověď.'};
 return null;
}
async function supabaseUser(req){
 const auth=String(req.headers?.authorization||'');if(!auth.startsWith('Bearer '))return null;
 const r=await fetch(`${SUPABASE_URL}/auth/v1/user`,{headers:{authorization:auth,apikey:SUPABASE_KEY}});if(!r.ok)return null;
 const user=await r.json();return user?.id?user:null;
}
async function googleToken(){
 const id=process.env.GOOGLE_CLIENT_ID,secret=process.env.GOOGLE_CLIENT_SECRET,refresh=process.env.GOOGLE_REFRESH_TOKEN;if(!id||!secret||!refresh)return null;
 const r=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:id,client_secret:secret,refresh_token:refresh,grant_type:'refresh_token'})});
 if(!r.ok)throw new Error(`Google token HTTP ${r.status}`);const j=await r.json();return j.access_token||null;
}
async function gmail(path,access){const r=await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/${path}`,{headers:{authorization:`Bearer ${access}`}});if(!r.ok)throw new Error(`Gmail HTTP ${r.status}`);return r.json()}
function ownerAllowed(user,profile){
 const userEmail=norm(user?.email),mailEmail=norm(profile?.emailAddress),allow=String(process.env.INBOX_GMAIL_ALLOWED_EMAILS||'').split(',').map(norm).filter(Boolean);
 return !!userEmail&&(userEmail===mailEmail||allow.includes(userEmail));
}
function parseMessage(msg){
 const hs=lowerHeaders(msg),subject=clean(hs.subject||'(bez předmětu)'),from=clean(hs.from||''),snippet=clean(msg?.snippet||'').slice(0,260),unread=(msg?.labelIds||[]).includes('UNREAD'),bulk=!!hs['list-unsubscribe']||/bulk|list/i.test(hs.precedence||''),decision=classify({subject,snippet,from,unread,bulk});if(!decision)return null;
 const receivedAt=msg?.internalDate?new Date(Number(msg.internalDate)).toISOString():null,messageId=clean(hs['message-id']||'');
 return{id:String(msg.id||''),threadId:String(msg.threadId||''),messageId,subject,from,snippet,receivedAt,unread,...decision};
}
export default async function handler(req,res){
 if(req.method!=='POST')return json(res,405,{ok:false,error:'METHOD_NOT_ALLOWED'});
 try{
  const user=await supabaseUser(req);if(!user)return json(res,401,{ok:false,error:'AUTH_REQUIRED'});
  const access=await googleToken();if(!access)return json(res,200,{ok:true,configured:false,authorized:true,scanned:0,messages:[]});
  const profile=await gmail('profile',access);if(!ownerAllowed(user,profile))return json(res,403,{ok:false,error:'GMAIL_ACCOUNT_NOT_AUTHORIZED'});
  const q=encodeURIComponent('in:inbox newer_than:21d -category:promotions -category:social');
  const list=await gmail(`messages?q=${q}&maxResults=50`,access),ids=(list.messages||[]).map(x=>x.id).filter(Boolean).slice(0,50),rows=[];
  const metadata='format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date&metadataHeaders=Message-ID&metadataHeaders=List-Unsubscribe&metadataHeaders=Precedence';
  for(let i=0;i<ids.length;i+=8){const batch=await Promise.all(ids.slice(i,i+8).map(id=>gmail(`messages/${encodeURIComponent(id)}?${metadata}`,access)));for(const msg of batch){const row=parseMessage(msg);if(row)rows.push(row)}}
  rows.sort((a,b)=>String(b.receivedAt||'').localeCompare(String(a.receivedAt||'')));
  return json(res,200,{ok:true,configured:true,authorized:true,mailbox:profile.emailAddress||null,scanned:ids.length,count:rows.length,messages:rows.slice(0,30),checkedAt:new Date().toISOString()});
 }catch(error){return json(res,500,{ok:false,error:String(error?.message||error)})}
}
