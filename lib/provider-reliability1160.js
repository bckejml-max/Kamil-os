export const PROVIDER_TTLS_1172=Object.freeze({liveOdds:30_000,prematchOdds:5*60_000,financeQuote:2*60_000,ticketMarket:10*60_000,history:30*60_000});

export function providerError1160(code,provider,meta={}){const e=new Error(`${provider||'PROVIDER'}_${code}`);e.code=code;e.provider=provider||null;Object.assign(e,meta);return e}

export function parseJsonText1160(text,{provider='UPSTREAM',allowArray=false,allowNull=false}={}){const raw=String(text??'');if(!raw.trim())throw providerError1160('EMPTY_JSON',provider);let payload;try{payload=JSON.parse(raw)}catch{throw providerError1160('INVALID_JSON',provider)}if(payload===null&&!allowNull)throw providerError1160('JSON_NULL',provider);if(payload!==null&&typeof payload!=='object')throw providerError1160('JSON_SHAPE',provider);if(Array.isArray(payload)&&!allowArray)throw providerError1160('JSON_ARRAY_UNEXPECTED',provider);return payload}

export async function parseProviderJson1160(response,{provider='UPSTREAM',allowArray=false,allowNull=false,requireJsonContentType=true}={}){const type=String(response?.headers?.get?.('content-type')||'').toLowerCase();if(requireJsonContentType&&!type.includes('application/json')&&!type.includes('+json'))throw providerError1160('NON_JSON',provider,{contentType:type||null,upstreamStatus:Number(response?.status)||0});const text=await response.text();return parseJsonText1160(text,{provider,allowArray,allowNull})}

export function validateApiFootball1160(payload){if(!payload||typeof payload!=='object'||Array.isArray(payload)||!Array.isArray(payload.response))throw providerError1160('SCHEMA_API_FOOTBALL','API_FOOTBALL');return payload.response}

export function validateOddsApi1161(payload,{allowArray=true}={}){const list=Array.isArray(payload)?payload:Array.isArray(payload?.data)?payload.data:Array.isArray(payload?.events)?payload.events:null;if(!list&&!(allowArray&&Array.isArray(payload)))throw providerError1160('SCHEMA_ODDS_API','ODDS_API');return list||payload}

export function validateYahooChart1162(payload){const result=payload?.chart?.result;if(!Array.isArray(result)||!result[0]||!Array.isArray(result[0]?.timestamp)||!Array.isArray(result[0]?.indicators?.quote?.[0]?.close))throw providerError1160('SCHEMA_YAHOO_CHART','YAHOO');return result[0]}

export function providerOutcome1163({items,provider,fetchedAt=Date.now(),error=null}){if(error)return{ok:false,state:'failed',provider,error:String(error?.code||error?.message||error),items:[],fetchedAt:new Date(fetchedAt).toISOString()};if(!Array.isArray(items))throw providerError1160('ITEMS_NOT_ARRAY',provider);return{ok:true,state:items.length?'data':'empty',provider,items,fetchedAt:new Date(fetchedAt).toISOString()}}

export function shouldRetry1166(errorOrStatus){const status=Number(errorOrStatus?.status??errorOrStatus);if(status===429||status>=500)return true;const name=String(errorOrStatus?.name||'');const code=String(errorOrStatus?.code||'');return name==='AbortError'||name==='TypeError'||['ECONNRESET','ETIMEDOUT','EAI_AGAIN'].includes(code)}

export function retryDelay1167(attempt,{baseMs=150,maxMs=2_500,jitter=0.25,random=Math.random}={}){const raw=Math.min(maxMs,baseMs*(2**Math.max(0,attempt)));const factor=1-jitter+(random()*jitter*2);return Math.max(0,Math.round(raw*factor))}

export async function withProviderRetry1166(task,{retries=2,baseMs=150,sleep=ms=>new Promise(r=>setTimeout(r,ms)),random=Math.random}={}){let last;for(let attempt=0;attempt<=retries;attempt++){try{return await task(attempt)}catch(error){last=error;if(attempt>=retries||!shouldRetry1166(error))throw error;await sleep(retryDelay1167(attempt,{baseMs,random}))}}throw last}

export class CircuitBreaker1168{constructor({failureThreshold=3,cooldownMs=60_000,clock=()=>Date.now()}={}){this.failureThreshold=failureThreshold;this.cooldownMs=cooldownMs;this.clock=clock;this.failures=0;this.openedAt=0;this.state='closed'}canRequest(){if(this.state!=='open')return true;if(this.clock()-this.openedAt>=this.cooldownMs){this.state='half-open';return true}return false}success(){this.failures=0;this.openedAt=0;this.state='closed'}failure(){this.failures++;if(this.failures>=this.failureThreshold){this.state='open';this.openedAt=this.clock()}}snapshot(){return{state:this.state,failures:this.failures,openedAt:this.openedAt}}}

export async function recoveryProbe1169(breaker,probe){if(!breaker.canRequest())return{ok:false,skipped:true,state:breaker.state};try{const result=await probe();breaker.success();return{ok:true,result,state:breaker.state}}catch(error){breaker.failure();return{ok:false,error:String(error?.message||error),state:breaker.state}}}

const lastGood=new Map();
export function rememberLastGood1170(key,payload,{at=Date.now()}={}){lastGood.set(String(key),{payload,at});return payload}
export function lastKnownGood1170(key,{maxAgeMs=Infinity,now=Date.now()}={}){const row=lastGood.get(String(key));if(!row)return null;const ageMs=now-row.at;if(ageMs>maxAgeMs)return null;return{...row,ageMs,stale:ageMs>0}}

export function freshness1171(fetchedAt,ttlMs,{now=Date.now()}={}){const t=typeof fetchedAt==='number'?fetchedAt:Date.parse(String(fetchedAt||''));if(!Number.isFinite(t))return{fresh:false,stale:true,ageMs:Infinity,label:'unknown'};const ageMs=Math.max(0,now-t),fresh=ageMs<=ttlMs;return{fresh,stale:!fresh,ageMs,label:fresh?'live':'stale'}}
export function ttlFor1172(kind){return PROVIDER_TTLS_1172[kind]??60_000}
