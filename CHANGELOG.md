# Kamil OS 24.9 — Ticket Sell Cockpit

## 24.9.0 — Inventory risk before margin
- nový **VSTUPENKY / SELL COCKPIT** shrnuje aktivní ticketovou zásobu před detailním radarem
- ukazuje počet neprodaných kusů, kapitál v riziku, nejbližší akci a pokrytí aktivních pozic skutečným cenovým plánem
- zvýrazňuje počet urgentních pozic a tři nejvyšší prodejní priority podle stejné živé/pravidlové decision vrstvy jako zbytek Kamil OS
- projektovaný výstup a profit se počítá jen pro pozice, které mají explicitní živou nebo uloženou cenu; nezaceněné pozice se do odhadu nepřimíchají
- cockpit nepoužívá žádnou domyšlenou tržní cenu a nic automaticky nelistuje ani neprodává
- nový modul `ticketCockpit24.js`, integrační test zásoby/rizika/projekce a PWA cache

# Kamil OS 24.8 — XTB Trade Planner

## 24.8.0 — From verdict to executable plan
- nový **XTB / TRADE PLANNER** převádí BUY / TRIM / SELL / REVIEW verdikty do konkrétnějšího návrhu velikosti kroku
- u TRIM/SELL používá živé nebo ruční `trimQty` / `trimAmount`, pokud existují; jinak konzervativně dopočítá redukci podle váhy pozice a typu aktiva
- u BUY používá plánovanou investici a alokační mezeru; pokud investiční rozpočet chybí, částku nevymýšlí
- po redukci navrhuje bezpečný cíl kapitálu: přednostně dorovnání širokého globálního jádra, potom dluhopisů nebo nejvyšší BUY priority
- planner upozorňuje na rozdílnou měnu zdrojového a cílového účtu a výslovně zakazuje automatickou FX migraci jen kvůli přesunu pozice
- každý návrh zobrazuje confidence, zdroj verdiktu, velikost kroku, důvod a měnové doporučení
- planner nic neobchoduje; při chybějících datech raději ponechá částku neurčenou
- nový modul `xtbPlanner24.js`, rozšířené integrační testy, QA gate a PWA cache

# Kamil OS 24.7 — XTB Portfolio Audit

## 24.7.0 — Allocation & concentration control
- Peníze dostaly nový **XTB / PORTFOLIO AUDIT** nad právě drženými pozicemi
- audit počítá podíl širokých akciových ETF, dluhopisů a satelitních pozic a porovnává je s cílovými pásmy
- zobrazuje největší jednotlivou pozici a konzervativní tematické součty pro známé koncentrace (např. zdravotnictví a čipy / AI)
- nové **skóre alokace 0–100** penalizuje příliš malé globální jádro, nízkou dluhopisovou složku a vysokou koncentraci jedné pozice nebo tématu
- sekce **Další nový vklad** navrhuje, kterou část portfolia má nový kapitál primárně dorovnávat; nejde o live tržní doporučení
- audit používá stejné ruční označení prodaných pozic jako Decision Cockpit, takže už prodaná pozice neznečišťuje alokaci
- přidaný samostatný modul `xtbAudit24.js`, integrační test mixu a koncentrace a PWA cache pro nový modul
- PWA shell a QA gate sjednoceny na 24.7

# Kamil OS 24.5 — Buy / Sell Intelligence

## 24.5.0 — XTB + Ticket decision cockpit
- XTB má nově rozhodovací tabuli pro každou importovanou pozici: **PŘIKOUPIT / DRŽET / REDUKOVAT / PRODAT / PROVĚŘIT**
- u každé XTB pozice je zvlášť pravidlo **kdy nakoupit** a **kdy prodat**, včetně váhy pozice a P/L
- XTB pravidla jsou automatická, ale lze je ručně přepsat pro konkrétní ticker; ruční override se ukládá do stavu a cloudu
- aplikace upozorňuje na stáří XTB importu, aby stará data nevypadala jako live doporučení
- XTB rozhodnutí s vysokou prioritou vstupují do hlavního Radaru na Dnes
- Vstupenky dostaly samostatný **SELL / HOLD radar** s pravidly podle času do akce, workflow, tržní ceny, floor ceny a sell-by termínu
- u vstupenky lze uložit tržní cenu/ks, floor cenu/ks, max cenu pro další nákup a nejpozdější termín prodeje
- přidaný **BUY radar** na budoucí presale/on-sale příležitosti s max nákupní cenou a cílovým resale
- ticket intelligence vstupuje do hlavního Radaru stejně jako XTB
- schema posunuto na v36; PWA shell a QA gate sjednoceny na 24.5

# Kamil OS 24.4 — Passwordless Daily Use

## 24.4.0 — Open instantly + richer task control
- Kamil OS se při běžném otevření spustí rovnou bez hesla
- existující Supabase session se dál použije pro cloud sync, ale bez session aplikace normálně funguje lokálně
- cloudová data nejsou kvůli pohodlí otevřená anonymním návštěvníkům
- Nastavení jasně ukazuje režim CLOUD / LOKÁLNÍ a cloud lze volitelně připojit nebo odpojit
- úkoly mají nově odpovědnou osobu, lze je kompletně upravit a kdykoliv přiřadit k projektu
- projektový detail umí připojit už existující otevřený úkol
- projektové úkoly dědí odpovědnost projektu a lze je dál individuálně upravit
- vizuálně dotažený projektový command center a stav lokálního režimu
- PWA shell a QA gate sjednoceny na 24.4
