# Kamil OS 29.4 — Smart Import Center

## Nové
- Bezpečný dvoukrokový import: náhled → výslovné potvrzení.
- CSV / TSV / JSON pro bankovní transakce a Revolut, XTB pozice, vstupenky a osobní administrativu.
- Automatické rozpoznání zdroje s možností ručního přepnutí.
- Transparentní pravidlové předkategorie výdajů; žádná AI kategorie se netváří jako jistota.
- Deduplikace importů a historie posledních importů.
- XTB snapshot umí aktualizovat změněnou existující pozici, ale shodný snapshot přeskočí.
- Součet importovaných XTB pozic se ukládá jako `positionValue`; existující celková hodnota účtu se při importu pozic nepřepisuje.
- Importované transakce jsou připravený datový základ pro Spending Intelligence.

## Bezpečnost a soukromí
- Žádný import se nezapíše před potvrzením uživatele.
- Neplatné řádky zůstávají mimo import.
- Různé měny se nesčítají do společného čísla.
- Import XTB ani vstupenek nikdy neprovede obchod.
- UI výslovně ukazuje, že importovaná data jsou součást běžného Kamil OS stavu a při připojeném cloudu se synchronizují do uživatelova Supabase účtu.
- Sensitive Vault zůstává oddělený.

## Data
- Schema 41 přidává `personalSpending.transactions` a `importCenter.history`.
- Starší stav se migruje bez ztráty legacy dat.
- Backup Guard, Preflight a cloud conflict summary pokrývají nová data.

## QA
- Samostatný Smart Import engine test.
- CSV, česká čísla/data, Revolut, JSON normalizace, XTB update/idempotence, ticket import a administrativa.
- 29.4 integrační gate ověřuje soužití s Monthly Review, Next-Month Plannerem a Year Ahead Radarem.
