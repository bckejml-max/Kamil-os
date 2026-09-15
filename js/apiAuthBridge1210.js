const VERSION='1210.0.0';
const nativeFetch=globalThis.fetch?.bind(globalThis);
const sameOriginApi=input=>{try{const raw=typeof input==='string'?input:input?.url;if(!raw)return false;const u=new URL(raw,location.href);return u.origin===location.origin&&u.pathname.startsWith('/api/')}catch{return false}};
function accessToken(){try{for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i)||'';if(!/^sb-[a-z0-9]+-auth-token$/i.test(key))continue;const value=JSON.parse(localStorage.getItem(key)||'null');const token=value?.access_token||value?.currentSession?.access_token||value?.session?.access_token;if(typeof token==='string'&&token.length>20)return token}}catch{}return null}
if(nativeFetch&&!globalThis.__KAMIL_API_AUTH_BRIDGE1210__){
 globalThis.__KAMIL_API_AUTH_BRIDGE1210__={version:VERSION};
 globalThis.fetch=(input,init={})=>{
  if(!sameOriginApi(input))return nativeFetch(input,init);
  const headers=new Headers(init?.headers||(typeof input!=='string'?input?.headers:undefined)||{});
  if(!headers.has('Authorization')){const token=accessToken();if(token)headers.set('Authorization',`Bearer ${token}`)}
  return nativeFetch(input,{...init,headers});
 };
}
