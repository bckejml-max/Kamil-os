import {previewImport} from './smartImport29.js';
const has=v=>v!==null&&v!==undefined;
const cell=v=>{const s=typeof v==='object'&&v!==null?JSON.stringify(v):String(v??'');return `"${s.replace(/"/g,'""')}"`};
function jsonRows(text){try{const raw=JSON.parse(String(text||'').trim()),rows=Array.isArray(raw)?raw:(raw.rows||raw.data||raw.transactions||raw.positions||raw.items||[]);return Array.isArray(rows)&&rows.every(x=>x&&typeof x==='object'&&!Array.isArray(x))?rows:null}catch{return null}}
export function previewSmartImport(text,options={}){
 const trimmed=String(text||'').trim();if(!trimmed)return previewImport(trimmed,options);
 if(trimmed[0]!=='['&&trimmed[0]!=='{')return previewImport(trimmed,options);
 const rows=jsonRows(trimmed);if(!rows)return previewImport(trimmed,options);
 const headers=[...new Set(rows.flatMap(x=>Object.keys(x)))];if(!headers.length)return previewImport('',options);
 const tsv=[headers.map(cell).join('\t'),...rows.map(row=>headers.map(k=>cell(has(row[k])?row[k]:'')).join('\t'))].join('\n');
 return {...previewImport(tsv,options),inputFormat:'json'};
}
