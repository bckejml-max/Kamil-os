# Kamil OS 25.6 — Cashflow 90 dní

## Nové
- Peníze nově obsahují 90denní cashflow výhled.
- Lze přidávat jednorázové, týdenní a měsíční příjmy nebo výdaje s konkrétním prvním datem.
- Výhled ukazuje stav za 90 dní, nejnižší očekávaný zůstatek, součet příjmů a výdajů a datum případného porušení rezervního minima.
- Aktivní pohledávky se započítají pouze tehdy, když mají konkrétní datum splatnosti.

## Bezpečnost dat a rozhodování
- Neznámé budoucí příjmy ani výdaje se nedopočítávají.
- Cashflow nic automaticky neposílá, neinvestuje ani neobchoduje.
- Existující `financePlan` zůstává zpětně kompatibilní; nové položky jsou volitelné pole `financePlan.cashflow`.
- Supabase URL, key, tabulky, schema version i legacy localStorage klíče zůstávají beze změny.

## QA
- Přidán `cashflow90_test.mjs` pro opakované toky, pohledávku s datem, konečný zůstatek a ochranu proti vymyšleným tokům.
- Test je součástí GitHub QA workflow.
- PWA cache obsahuje výpočetní i UI cashflow modul.
