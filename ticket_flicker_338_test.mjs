import fs from 'node:fs';
import assert from 'node:assert/strict';

const page=fs.readFileSync('js/ticketPage100.js','utf8');
const codeOnly=page.replace(/\/\/.*$/gm,'');
assert.match(codeOnly,/ticketDesk331\.js/,'Ticket page must delegate to Ticket Desk 331');
assert.doesNotMatch(codeOnly,/renderTicketPage687|MutationObserver|appendTicket|enhanceTicket/,'Legacy ticket render/enhancer chain must stay retired');
assert.doesNotMatch(codeOnly,/\.refresh\?\.\(/,'Canonical adapter must not race Ticket Desk view-change refresh');
console.log('OS338 ticket renderer ownership guard OK');
