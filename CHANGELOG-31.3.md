# Kamil OS 31.3 — Data Engine

## Co přidává
- lokální IndexedDB databázi `kamil-os-data-v2`
- nedestruktivní mirror vybraných dlouhých historií
- Decision Journal, Net Worth, ticket, trade a Smart Import history buckety
- deterministické klíče; opakované obchody stejného tickeru se nepřepisují
- automatický debounce mirror po změně state
- stav a ruční `Zrcadlit teď` ve Více → Systém

## Bezpečnost a kompatibilita
- primární state zůstává beze změny
- schema zůstává 42
- žádné `store.mutate`, `store.replace` ani mazání primárních dat z Data Engine vrstvy
- žádné raw dokumenty, Vault nebo auth tokeny v history planneru
- pokud IndexedDB není dostupné, Kamil OS pokračuje v původním režimu
- cloud sync a Backup Guard zůstávají beze změny

## Proč mirror-first
31.3 připravuje robustnější storage bez jednorázové rizikové migrace. IndexedDB začne zachytávat historii už nyní; teprve budoucí samostatná verze může po ověřené záloze a migraci bezpečně zmenšit hlavní JSON state.

## QA
- pure History Planner unit test
- statický non-destructive Data Engine gate
- test kolize dvou obchodů stejného tickeru
- Chromium E2E skutečný zápis/čtení z IndexedDB
- zachované recovery, security, finance, XTB, ticket a Decision testy
- release gate 31.3
