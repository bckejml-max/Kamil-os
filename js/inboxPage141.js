import {renderPersonalInbox690} from './personalInbox690.js';
import {enhanceInboxVisual141} from './inboxDocumentsVisual141.js';
import {installInboxHub660,renderInboxHub660} from './inboxHub660.js';

export async function renderInboxPage141(){
 try{installInboxHub660();const ok=await renderInboxHub660();if(ok)return}catch(e){console.error('[inbox660]',e)}
 await renderPersonalInbox690();try{enhanceInboxVisual141()}catch(e){console.warn('[inbox141 fallback]',e)}
}
