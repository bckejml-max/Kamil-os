# Kamil OS 25.4 — Ticket Lessons

## 25.4.0 — Learn from realized resale history
- Vstupenky dostaly nový panel **TICKET LESSONS**, který používá pouze realizované obchody s nenulovou hodnotou `sell`; otevřené a neprodané pozice se do výsledků nezapočítávají.
- panel ukazuje realizovaný P/L historie, ROI realizovaných obchodů, win rate a nejlepší / nejhorší skutečně uzavřený obchod.
- realizované výsledky se konzervativně seskupují do kategorií Fotbal, Koncerty, Combat a Ostatní, aby bylo vidět, kde historicky vzniká nebo mizí zisk.
- u každé kategorie se počítá realizovaný zisk, win rate a průměrný počet kusů na obchod.
- Lessons hledají praktické signály z velikosti pozice: pokud větší balíky mají horší průměrný výsledek než malé pozice, systém doporučí menší počáteční zásobu a dokupování až po potvrzení poptávky.
- systém umí upozornit na vysoký podíl ztrátových realizovaných obchodů a v takovém případě doporučí selektivnější BUY radar místo agresivnějšího nakupování.
- výstup je explicitně označený jako zpětný pohled, nikoli živá predikce trhu; žádné tržní ceny nebo budoucí výsledky se nedopočítávají.
- přidaný modul `ticketLessons25.js`, samostatný automatický test, rozšířený statický QA gate a PWA cache.
- datové schéma, Supabase tabulky i legacy storage keys zůstávají beze změny; verze je 25.4.0.
