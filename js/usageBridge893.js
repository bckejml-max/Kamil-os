export const USAGE_BRIDGE893_VERSION='893.0.0';
const MAP={today:'today',inbox:'inbox',tickets:'tickets',betting:'betting',family:'family',home:'home',money:'money',more:'documents'};
export function trackMainView893(view){
 const feature=MAP[String(view||'').toLowerCase()]||String(view||'').toLowerCase();
 if(!feature)return;
 import('./usage892.js').then(m=>m.recordUsage892(feature,{surface:'main-nav'})).catch(()=>{});
}
