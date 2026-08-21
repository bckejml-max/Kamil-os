# Kamil OS 32.8 — Daily Profit Brief

## Cíl
Udělá z pohledu **Dnes** jednu prioritizovanou finanční frontu místo více překrývajících se karet.

## Co je nové
- jeden `Daily Profit Brief` pro hotovost, XTB a resale vstupenky
- cash floor / rezerva má vždy přednost před novým XTB vkladem
- XTB akce se řadí podle existujícího decision engine
- ticket akce používají event-level market intelligence a stale-market firewall
- stručná datová provenance: stáří XTB, počet uzavřených cashflow měsíců a ticket market freshness
- přímé kliknutí z briefu do `Peníze` nebo `Vstupenky`

## Safety
- read-only brief
- no auto-trade
- no auto-price
- no money movement
- max. 6 viditelných akcí
- schema zůstává 80

## Regression
32.7 Financial Command, 32.6 Ticket Market Intelligence a 32.5 FX-safe contribution planning zůstávají zachované.
