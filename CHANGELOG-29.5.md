# Kamil OS 29.5 — Spending Intelligence

## Nové
- Spending Intelligence nad skutečně importovanými bankovními/Revolut transakcemi.
- Výdaje, příjmy a převody jsou oddělené; převody mezi účty se nepočítají jako spotřeba.
- Porovnání aktuálního měsíce proti stejnému počtu kalendářních dní minulého měsíce.
- Přehled kategorií, největších obchodníků a nezařazených výdajů.
- Průměr dokončených měsíců pouze z dostupné historie.
- Pravidlová detekce opakujících se plateb podle obchodníka a podobné částky.
- Denní tempo výdajů a orientační měsíční tempo; projekce je výslovně označená jako odhad při zachování stejného tempa.

## Bezpečnost dat
- Používají se pouze uložené/importované transakce; bez transakcí panel nic nevymýšlí.
- CZK/EUR/USD se nikdy nesčítají do jednoho falešného celku.
- Schema zůstává v41, Supabase tabulky a storage klíče se nemění.
- Spending Intelligence je read-only analytika; neprovádí platby ani převody.

## QA
- samostatný engine test,
- integrační test Smart Import → Spending Intelligence,
- 29.5 static QA,
- release gate,
- PWA cache a manifest 29.5.0.
