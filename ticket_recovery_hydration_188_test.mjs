import fs from 'node:fs';
import assert from 'node:assert/strict';

const hydration=fs.readFileSync(new URL('./js/ticketRecoveryHydration188.js',import.meta.url),'utf8');
const page=fs.readFileSync(new URL('./js/ticketPage100.js',import.meta.url),'utf8');
const desk=fs.readFileSync(new URL('./js/ticketDesk331.js',import.meta.url),'utf8');

assert.match(hydration,/TICKET_RECOVERY_HYDRATION_VERSION_188=188/);
assert.match(hydration,/await syncTicketRecoveryVault186\(\)/);
assert.match(hydration,/return await openTicketRecoveryCenter185\(\)/);
assert.ok(hydration.indexOf('await syncTicketRecoveryVault186()')<hydration.indexOf('return await openTicketRecoveryCenter185()'),'cloud hydration must finish before recovery opens');
assert.match(hydration,/\[data-ticket-recovery\]/);
assert.match(hydration,/stopImmediatePropagation\(\)/);
assert.match(page,/import\('\.\/ticketDesk331\.js'\)/);
assert.doesNotMatch(page,/installTicketRecoveryHydration188\(\)/);
assert.match(desk,/openTicketRecoveryCenter185/);
assert.match(desk,/data-recovery/);
console.log('OS 188 TICKET RECOVERY HYDRATION COMPATIBILITY PASS');
