export const CLOUD_HISTORY_BUCKETS_32=['decision','networth','ticket','trade','import'];
const ALLOWED=new Set(CLOUD_HISTORY_BUCKETS_32);
export function cloudHistoryRows32(records=[],userId='',version='32.1.0',updatedAt=new Date().toISOString()){
 const uid=String(userId||'').trim();if(!uid)return [];
 return (Array.isArray(records)?records:[]).filter(x=>x?.key&&ALLOWED.has(String(x.bucket||''))).map(x=>({user_id:uid,record_key:String(x.key),bucket:String(x.bucket),happened_at:x.at||null,payload:x.payload??{},source_version:String(version||'32.1.0'),updated_at:updatedAt}));
}
export const cloudHistoryPlan32Info={buckets:[...CLOUD_HISTORY_BUCKETS_32],mode:'DUAL_WRITE',deleteEnabled:false};
