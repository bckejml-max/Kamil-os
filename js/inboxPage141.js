import {installInboxHub660,renderInboxLocal660,renderInboxHub660} from './inboxHub660.js';

export function renderInboxPage141(){
 installInboxHub660();
 const local=renderInboxLocal660();
 void renderInboxHub660().catch(error=>console.warn('[inbox141:remote]',error));
 window.__KAMIL_INBOX141__={healthy:!!local,core:'inbox660-local-first',enrichment:'same-layout-remote',owned:true,at:Date.now()};
 return !!local;
}
