import {APP_VERSION,SCHEMA_VERSION} from './config.js';
import {store,validateState} from './state.js';

export function runPreflight(){
 const s=store.get(),checks=[];
 const add=(name,ok,detail='')=>checks.push({name,ok:!!ok,detail});
 const v=validateState(s);
 add('Struktura dat',v.ok,v.fatal.join('; ')||v.issues.join('; '));
 add('Schema',Number(s.meta?.schemaVersion)===SCHEMA_VERSION,`v${s.meta?.schemaVersion||0} / očekáváno v${SCHEMA_VERSION}`);
 add('Osobní administrativa',Array.isArray(s.personalAdmin?.items));
 add('Rodina',Array.isArray(s.familyHome?.members));
 add('Emergency File kontakty',Array.isArray(s.emergencyFile?.contacts));
 add('Emergency File položky',Array.isArray(s.emergencyFile?.assets));
 add('Personal Inbox',Array.isArray(s.personalInbox?.items));
 add('Asset Book',Array.isArray(s.assetBook?.items));
 add('Osobní úkoly',Array.isArray(s.tasks));
 add('Vstupenky',Array.isArray(s.ticketBook?.items));
 add('Pohledávky',Array.isArray(s.debtBook?.items));
 add('Undo',Array.isArray(s.undo));
 add('Audit',Array.isArray(s.audit));
 add('LocalStorage',typeof localStorage!=='undefined');
 add('Service Worker',typeof navigator!=='undefined'&&'serviceWorker'in navigator);
 return {ok:checks.every(x=>x.ok),version:APP_VERSION,checks,at:new Date().toISOString()};
}
