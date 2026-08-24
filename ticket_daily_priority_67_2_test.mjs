import fs from 'node:fs';
import assert from 'node:assert/strict';

const priority=fs.readFileSync(new URL('./js/personalTicketPriority672.js',import.meta.url),'utf8');
const today=fs.readFileSync(new URL('./js/personalToday640.js',import.meta.url),'utf8');

assert.match(priority,/dailyTicketPriority672/);
assert.match(priority,/SOLD_UNDELIVERED|deliverQty/);
assert.match(priority,/oneDailyDecision671/);
assert.match(priority,/DNEŠNÍ TICKETOVÉ ROZHODNUTÍ/);
assert.match(today,/appendDailyTicketPriority672/);
assert.match(today,/ticketPriority:'loading'/);
console.log('Ticket Daily Priority 67.2 smoke test OK');
