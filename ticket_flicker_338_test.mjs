import fs from 'node:fs';
import assert from 'node:assert/strict';

const page=fs.readFileSync('js/ticketPage100.js','utf8');
assert.match(page,/ticketDesk331\.js/,'Ticket page must delegate to Ticket Desk 331');
assert.doesNotMatch(page,/renderTicketPage687|MutationObserver|appendTicket|enhanceTicket/,'Legacy ticket render/enhancer chain must stay retired');
assert.doesNotMatch(page,/\.refresh\?\.\(/,'Canonical adapter must not race Ticket Desk view-change refresh');
console.log('OS338 ticket renderer ownership guard OK');
