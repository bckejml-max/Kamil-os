const clone=v=>{try{return structuredClone(v)}catch{return JSON.parse(JSON.stringify(v??{}))}};
const num=v=>Number.isFinite(Number(v))?Number(v):0;

export function cloudSchema32(payload,currentSchema){
 const remote=num(payload?.meta?.schemaVersion),current=num(currentSchema);
 return {remote,current,future:remote>current,older:remote>0&&remote<current,missing:remote===0,compatible:remote<=current};
}

export function cloudPayload32(state,currentSchema){
 const out=clone(state&&typeof state==='object'?state:{});
 out.meta=out.meta&&typeof out.meta==='object'?out.meta:{};
 out.meta.schemaVersion=num(currentSchema)||num(out.meta.schemaVersion);
 delete out.meta.cloudMode;
 delete out.meta.preflight;
 delete out.meta.smartSyncDevice31;
 out.undo=[];
 return out;
}

export function cloudPayloadNeedsNormalize32(payload,currentSchema){
 const schema=cloudSchema32(payload,currentSchema);
 return schema.remote!==schema.current||(Array.isArray(payload?.undo)&&payload.undo.length>0)||!!payload?.meta?.cloudMode||!!payload?.meta?.preflight||!!payload?.meta?.smartSyncDevice31;
}

export function mergeCloudIntoDevice32(localState,cloudState,currentSchema){
 const local=clone(localState&&typeof localState==='object'?localState:{}),cloud=clone(cloudState&&typeof cloudState==='object'?cloudState:{}),localUndo=Array.isArray(local.undo)?local.undo:[],localUi=local.ui&&typeof local.ui==='object'?local.ui:{};
 cloud.undo=localUndo;
 cloud.ui={...(cloud.ui&&typeof cloud.ui==='object'?cloud.ui:{}),...localUi};
 cloud.meta=cloud.meta&&typeof cloud.meta==='object'?cloud.meta:{};
 cloud.meta.schemaVersion=num(currentSchema)||num(cloud.meta.schemaVersion);
 return cloud;
}

export const cloudPayload32Info={localOnly:['undo','meta.cloudMode','meta.preflight','meta.smartSyncDevice31'],goal:'keep cloud snapshots compact and device-neutral'};
