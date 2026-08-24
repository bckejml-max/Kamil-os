import fs from 'node:fs';
import assert from 'node:assert/strict';

const priority=fs.readFileSync(new URL('./js/personalTicketPriority672.js',import.meta.url),'utf8');
const today=fs.readFileSync(new URL('./js/personalToday640.js',import.meta.url),'utf8');
const best=fs.readFileSync(new URL('./js/personalOneBestMove673.js',import.meta.url),'utf8');

assert.match(priority,/dailyTicketPriority672/);
assert.match(priority,/SOLD_UNDELIVERED|deliverQty/);
assert.match(priority,/oneDailyDecision671/);
assert.match(priority,/DNEŠNÍ TICKETOVÉ ROZHODNUTÍ/);
assert.match(best,/dailyTicketPriority672/);
assert.match(best,/rankOneBestMove673/);
assert.match(today,/appendOneBestMove673/);
assert.doesNotMatch(today,/appendDailyTicketPriority672/);
console.log('Ticket Daily Priority 67.2 → One Best Move 67.3 smoke test OK');
