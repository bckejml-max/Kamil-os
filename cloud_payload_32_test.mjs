import {cloudSchema32,cloudPayload32,cloudPayloadNeedsNormalize32,mergeCloudIntoDevice32} from './js/cloudPayload32.js';
const assert=(x,m)=>{if(!x)throw new Error(m)};
const old={meta:{schemaVersion:79,cloudMode:'cloud',preflight:{ok:true},smartSyncDevice31:'d1'},tasks:[{id:'a',title:'A'}],undo:[{label:'huge',state:{x:'x'.repeat(10000)}}],ui:{tab:'money'}};
const p=cloudPayload32(old,80);assert(p.meta.schemaVersion===80,'schema not normalized');assert(Array.isArray(p.undo)&&p.undo.length===0,'undo leaked to cloud');assert(!('cloudMode'in p.meta)&&!('preflight'in p.meta)&&!('smartSyncDevice31'in p.meta),'device meta leaked');assert(cloudPayloadNeedsNormalize32(old,80),'old payload should need normalize');
const local={meta:{schemaVersion:80},undo:[{label:'local undo'}],ui:{tab:'tickets'}},merged=mergeCloudIntoDevice32(local,{meta:{schemaVersion:79},tasks:[{id:'x'}],undo:[],ui:{tab:'today'}},80);assert(merged.undo[0].label==='local undo','device undo not preserved');assert(merged.ui.tab==='tickets','device UI not preserved');assert(merged.meta.schemaVersion===80,'merged schema wrong');
assert(cloudSchema32({meta:{schemaVersion:81}},80).future,'future schema guard missing');assert(!cloudSchema32({meta:{schemaVersion:79}},80).future,'older schema incorrectly future');
console.log('KAMIL OS 32.0 CLOUD PAYLOAD TEST PASS');
