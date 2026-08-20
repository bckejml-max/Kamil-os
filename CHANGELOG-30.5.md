# Kamil OS 30.5 — Decision Delta

## Co je nové

- karta **Co se změnilo** už není jen auditní historie za 14 dní
- nově porovnává aktuální rozhodovací Top s posledním potvrzeným snapshotem
- umí rozlišit **změnu akce** (např. REVIEW → TRIM / REPRICE → SELL), **růst nebo pokles priority**, **nové rozhodnutí**, **změnu skutečného triggeru** a **vypadnutí z Top priorit**
- změna akce má nejvyšší význam; vypadnutí z Top priorit se záměrně neoznačuje jako „vyřešeno“
- tlačítko **Zkontrolováno** posune lokální baseline až ve chvíli, kdy uživatel změny skutečně viděl
- při prvním spuštění 30.5 se automaticky uloží výchozí snapshot jen na daném zařízení

## Bezpečnost a data

- Decision Delta engine je čistý a read-only
- baseline se ukládá pouze do lokálního meta úložiště, ne do cloudového state, auditu ani undo historie
- state schema zůstává **42**
- žádný důvod změny, cena, termín ani trigger se nevymýšlí; engine porovnává jen skutečná pole rozhodnutí
- původní auditní historie zůstává v datech, jen karta Dnes ji už nepoužívá jako náhradu za změnu rozhodnutí

## Další oprava

- Dnes / Osobní Autopilot nově bere číslo verze z kanonického `releaseMeta.js`, takže v interní hlavičce už nemůže zůstat historické `29.8.0`

## Release

- verze: **30.5.0**
- state schema: **42** beze změny
- PWA cache: `kamil-os-30.5.0-shell-r1`
- nový modul: `js/decisionDelta30.js`
- nové unit + integration testy a release gate 30.5
