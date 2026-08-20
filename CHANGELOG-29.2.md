# Kamil OS 29.2 — Personal Next-Month Planner

## 29.2.0

- Na **Dnes** přibyl nový vstup **Příští měsíc**, který připraví plán dalšího kalendářního měsíce jen z reálně uložených dat.
- Známý cashflow používá celý 90denní timeline, ne pouze prvních deset řádků UI. Zobrazuje očekávaný start, minimum, konec, známé příjmy a známé výdaje v hlavní měně finančního plánu.
- Cizí měny se bez skutečného FX kurzu nepřepočítávají. Planner výslovně ukáže počet vynechaných cizoměnových položek místo falešného společného součtu.
- Termíny příštího měsíce se berou z Personal Timeline: osobní administrativa, doklady, smlouvy, servis, rodina, osobní kalendář, osobní úkoly a vstupenky.
- Aktivní cíle ukazují odděleně **uložený měsíční plán** a **pravidlově potřebné tempo**. Součty zůstávají po jednotlivých měnách.
- Neprodané ticket pozice s akcí v příštím měsíci se zobrazí jako příprava prodeje; ticket kapitál se agreguje pouze po jednotlivých měnách a jen z uložené nákupní ceny.
- Planner vytváří omezenou prioritní frontu „Připravit předem“ a každý bod vede do správné osobní části aplikace.
- `cashflow90()` nově bezpečně zpřístupňuje celý vypočtený timeline dalším read-only plánovacím vrstvám; persistovaný stav ani schema se nemění.
- Schema zůstává **v40**. Supabase konfigurace, tabulky i legacy localStorage klíče zůstávají beze změny.
- Planner nic automaticky neplatí, nepřevádí, neinvestuje ani neobchoduje.
- Přidán `js/nextMonthPlanner29.js`, `next_month_planner_29_test.mjs`, integrační coverage, static QA, GitHub Actions krok, PWA cache a verze **29.2.0**.
