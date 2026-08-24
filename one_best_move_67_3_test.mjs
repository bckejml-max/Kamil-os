import assert from 'node:assert/strict';
import {rankOneBestMove673} from './js/oneBestMoveRank673.js';

const personalCritical={title:'Rodinný termín',level:'critical',why:'Dnes je termín.',cta:'Vyřešit'};
const personalMedium={title:'Ověřit smlouvu',level:'medium',why:'Je dobré ji zkontrolovat.',cta:'Ověřit'};
const ticketHold={title:'Koncert',label:'DRŽET',reason:'Trh stabilní.',priority:45,risk:40,cta:'Zkontrolovat'};
const ticketLower={title:'Koncert',label:'ZLEVNIT',reason:'Cena je nad trhem.',priority:96,risk:71,cta:'Zkontrolovat cenu'};
const delivery={title:'Prodané vstupenky',label:'DORUČIT 4 KS',reason:'Čekají na předání.',priority:120,risk:100,cta:'Doručit'};
const money={kind:'money',score:72,title:'Aktualizovat bankovní data',label:'PENÍZE',reason:'Snapshot je starý.',cta:'Aktualizovat'};

assert.equal(rankOneBestMove673({personal:personalCritical,ticket:ticketHold,money}).best.kind,'personal');
assert.equal(rankOneBestMove673({personal:personalMedium,ticket:ticketLower,money}).best.kind,'ticket');
assert.equal(rankOneBestMove673({personal:personalCritical,ticket:delivery,money}).best.kind,'ticket');
assert.equal(rankOneBestMove673({personal:personalMedium,ticket:ticketHold,money}).best.kind,'money');
assert.equal(rankOneBestMove673({personal:null,ticket:null,money:null}).best,null);
console.log('One Best Move 67.3 OK');
