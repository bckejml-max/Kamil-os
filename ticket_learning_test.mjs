import assert from 'node:assert/strict';
import {ticketLearningAdvice,applyTicketLearning} from './js/ticketLearning25.js';

const sold=(id,name,buy,sell,qty=2)=>({id,name,buy,sell,fees:0,qty,workflow:'PAYOUT RECEIVED'});

const sparse={ticketBook:{history:[sold('1','Sparta Praha',1000,1300),sold('2','Sparta Praha',1000,800)],items:[]}};
const sparseAdvice=ticketLearningAdvice({name:'Sparta Praha'},sparse);
assert.equal(sparseAdvice.globalReady,false);
const sparseDecision=applyTicketLearning({name:'Sparta Praha'},sparse,{action:'BUY',priority:92,reason:'On-sale dnes',tone:'good'});
assert.equal(sparseDecision.action,'BUY','málo historie nesmí blokovat BUY');
assert.equal(sparseDecision.recommendedQty,undefined);

const weak={ticketBook:{history:[
 sold('1','Sparta Praha',1000,800,4),sold('2','Sparta derby',1200,850,4),sold('3','Fotbal liga',900,700,4),
 sold('4','Koncert O2',1000,1400,2),sold('5','Koncert music',1000,1450,2)
],items:[]}};
const weakAdvice=ticketLearningAdvice({name:'Sparta Praha'},weak);
assert.equal(weakAdvice.categoryReady,true);
assert.equal(weakAdvice.risk,'high');
assert.equal(weakAdvice.recommendedQty,2);
const weakDecision=applyTicketLearning({name:'Sparta Praha'},weak,{action:'BUY',priority:92,reason:'On-sale dnes',tone:'good'});
assert.equal(weakDecision.action,'REVIEW','slabá kategorie s dost vzorky má automatický BUY pouze zbrzdit');
assert.match(weakDecision.reason,/max 2 ks/);

const liveDecision=applyTicketLearning({name:'Sparta Praha'},weak,{action:'BUY',priority:95,reason:'Živý trh potvrzuje poptávku',tone:'good',live:true,source:'ŽIVĚ'});
assert.equal(liveDecision.action,'BUY','historie nesmí přepsat čerstvé live rozhodnutí');
assert.equal(liveDecision.recommendedQty,2,'historie smí live rozhodnutí omezit velikostí pozice');
assert.equal(liveDecision.source,'ŽIVĚ');

console.log('ticket learning engine OK');
