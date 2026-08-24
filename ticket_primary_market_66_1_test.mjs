import assert from 'node:assert/strict';
import {classifyOfficialText} from './api/_official-market.js';
import {withPrimaryPressure} from './api/ticket-intelligence-66-1.js';

assert.equal(classifyOfficialText('Koupit vstupenku Cena 1 250 Kč').status,'AVAILABLE');
assert.equal(classifyOfficialText('Limited availability – last tickets').status,'LIMITED');
assert.equal(classifyOfficialText('Tato akce je vyprodáno').status,'SOLD_OUT');
assert.equal(classifyOfficialText('Informace o akci bez prodejního stavu').status,'UNKNOWN');

const base={market:{marketPriceCzk:3000,p25PriceCzk:2900},recommendation:{code:'HOLD',label:'DRŽET',reason:'Sekundární trh.',recommendedAskCzk:2870,daysToEvent:20}};
const lower=withPrimaryPressure({status:'LISTED',askEachCzk:2800,buyEachCzk:1500,qty:2},base,{status:'AVAILABLE',label:'DOSTUPNÉ',lowestPriceCzk:2000});
assert.equal(lower.code,'LOWER');assert.equal(lower.recommendedAskCzk,1980);assert.match(lower.reason,/Oficiální prodej/);
const sold=withPrimaryPressure({status:'LISTED',askEachCzk:2800,buyEachCzk:1500,qty:2},base,{status:'SOLD_OUT',label:'VYPRODÁNO',lowestPriceCzk:1200});
assert.equal(sold.recommendedAskCzk,2870);assert.match(sold.reason,/vyprodaný/);
const wait=withPrimaryPressure({status:'NOT_LISTED',buyEachCzk:1900,qty:2},base,{status:'AVAILABLE',label:'DOSTUPNÉ',lowestPriceCzk:2000});
assert.equal(wait.code,'HOLD');
console.log('PRIMARY MARKET 66.1 PASS');
