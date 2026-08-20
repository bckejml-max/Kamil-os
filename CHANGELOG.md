# Kamil OS 25.11 — Project Health

## 25.11.0 — Health score for every active project
- **Práce** dostala nový Project Health cockpit se skóre 0–100 pro každou aktivní zakázku
- skóre vychází pouze z uloženého rizika, deadline, otevřených úkolů po termínu, odpovědné osoby a existence konkrétního dalšího kroku
- projekty se řadí od nejhoršího zdraví, takže nejrizikovější zakázka je vidět jako první
- chybějící externí nebo finanční fakta se nepředpokládají a skóre je označeno jako pravidlové vyhodnocení uložených dat
- přidán deep-link přímo do detailu projektu, samostatný test, CI coverage a PWA cache; schema zůstává v36

# Kamil OS 25.10 — Delegation Center

## 25.10.0 — Follow-up control without taking work back
- **Práce** dostala nový **DELEGATION CENTER**, který používá existující data `Čekám na` bez migrace schématu nebo změny Supabase/localStorage klíčů
- aktivní delegace se řadí podle kontrolního termínu a stáří do stavů **Po termínu / Dnes / Bez kontroly / Brzy / Čeká**
- položka po follow-up termínu dostává prioritu **FOLLOW-UP**, zatímco staré čekání bez kontrolního termínu se označí **NAPLÁNOVAT**; budoucí termín se zbytečně neeskaluje
- kliknutí **Follow-up zapsán** pouze zaznamená skutečně provedený kontakt a nastaví další kontrolu za 3 dny; aplikace nic neposílá ani neeskaluje automaticky
- přidány bezpečné one-click akce **Zítra**, **+3 dny** a **Vyřešeno**; hotové položky zmizí z aktivní fronty, ale původní data zůstávají v historii stavu
- dnešní zaznamenaný kontakt snižuje opakovanou prioritu, aby Director OS ani Delegation Center zbytečně nehonily stejný follow-up znovu ve stejný den
- přidány moduly `delegation25.js` a `delegationUi25.js`, samostatný `delegation_center_test.mjs`, rozšířený static QA gate, GitHub Actions a PWA cache
- viditelná verze, manifest a service-worker shell sjednoceny na **25.10.0**; schema zůstává v36

# Kamil OS 25.3 — Ticket Event Command Center

## 25.3.0 — One event across sectors and positions
- Vstupenky nově seskupují více sektorů / pozic stejné akce do jednoho **EVENT PORTFOLIO** pohledu, aniž by se měnila nebo migrovala původní data
- seskupení používá explicitní `eventKey` / `eventId`, pokud existuje; jinak konzervativně kombinuje datum a rozpoznaný název akce po odstranění seat/sector suffixu
- event karta ukazuje neprodané a prodané kusy, kapitál v riziku, počet dílčích pozic a nejvyšší platný verdikt
- kliknutí otevře **EVENT COMMAND CENTER** s celkovým nákladem, realizovanými tržbami, realizovaným P/L, payout stavem a cenovým plánem zbytku
- projektovaný výstup se počítá pouze z pozic se skutečně uloženou listingovou cenou; nezaceněné kusy jsou explicitně vyčíslené a žádná cena se nevymýšlí
- detail zachovává každou původní pozici / sektor samostatně, včetně vlastního workflow, strategie, prodeje a live/pravidlového rozhodnutí
- přidaný modul `ticketEvents25.js`, samostatné `ticketEvents25.css` a nový automatický test agregace kapitálu, kusů, realizovaného P/L a bezpečné práce s chybějící cenou
- PWA shell a viditelná verze sjednoceny na 25.3

# Kamil OS 25.2 — XTB Position Detail

## 25.2.0 — One decision page per holding
- každá aktivní XTB pozice má nově tlačítko **Detail** a vlastní rozhodovací stránku uvnitř Peněz
- detail spojuje hodnotu pozice, P/L, váhu účtu, množství, importovanou open price a případnou aktuální cenu z čerstvé intelligence
- na jednom místě ukazuje **verdikt, confidence, zdroj, kdy jednat, kdy nakoupit a kdy prodat**; pravidlový fallback se stále jasně odlišuje od živé analýzy
- execution část přebírá konkrétní velikost kroku a cíl kapitálu z Trade Planneru včetně FX/účtové poznámky; nic automaticky neobchoduje
- živé veřejné zdrojové odkazy se zobrazují jen pokud je intelligence skutečně dodala; neplatné nebo domyšlené URL se nezobrazují
- historie pozice bezpečně spojuje dostupný XTB trade journal a skutečné uživatelské auditní akce vztahující se k tickeru; při absenci historie nic nevymýšlí
- detail zachovává možnost upravit ruční pravidlo nebo potvrdit prodej a po prodeji se korektně vrátí do portfolia
- nový modul `xtbDetail25.js`, samostatné `xtbDetail25.css`, integrační coverage pro source provenance/history/planner sizing a rozšířený QA/PWA release gate

# Kamil OS 25.1 — Decision Feed

## 25.1.0 — Current priorities plus real change history
- stránka **Dnes** dostala nový **DECISION FEED** přímo pod TOP 5 rozhodnutími
- feed kombinuje tři nejvyšší právě platná rozhodnutí s timestampovanou historií skutečných změn z existujícího auditu
- čerstvý XTB intelligence refresh a ticket intelligence refresh se zobrazují jako samostatné historické události pouze tehdy, když opravdu existuje jejich `liveAsOf` / `intelligenceAsOf`
- systém nevyrábí falešnou historii při každém renderu a kvůli feedu nic nového nezapisuje do Supabase ani localStorage
- aktuální rozhodnutí jsou jasně označená jako **AKTUÁLNÍ**, historické položky jako **INTELLIGENCE** nebo **AKCE**, včetně relativního času
- položky s bezpečně odvoditelným cílem lze jedním klikem otevřít ve správném modulu; nejasné auditní události zůstávají pouze informativní
- feed je omezený na 10 položek, deduplikuje duplicity a zachovává pravidlo, že live doporučení musí mít skutečný timestamp a pravidlový fallback se netváří jako historická událost
- rozšířený integrační test ověřuje kombinaci aktuálních rozhodnutí, XTB/ticket intelligence a reálné auditní historie; QA/PWA shell sjednoceny na 25.1

# Kamil OS 25.0 — Today Decision Command Center

## 25.0.0 — One queue across work, money and tickets
- stránka **Dnes** už není jen soubor modulových karet; nahoře vznikla jednotná **TOP 5 ROZHODNUTÍ** fronta
- rozhodovací fronta kombinuje pracovní signály, projektová rizika, XTB BUY/HOLD/TRIM/SELL/REVIEW, ticketová rozhodnutí, čekání a Inbox
- vše se řadí podle jedné priority 0–100 a zobrazuje zdroj a confidence, pokud je dostupná živá intelligence
- čerstvá XTB/ticket intelligence se propisuje do Dnes přes stejnou bezpečnou live/pravidlovou vrstvu; stará nebo chybějící data zůstávají pravidlovým fallbackem
- první rozhodnutí dostává přímé tlačítko **Řešit teď**, ostatní lze otevřít rovnou do správného modulu nebo projektu
- fronta je omezená na pět položek, deduplikuje stejné projekty/signály a má konzervativní kalendářový signál při výrazně zaplněných následujících 48 hodinách
- zachované jsou podpůrné bloky pro úkoly, kalendář, XTB, vstupenky, projekty, čekání a radar; nový vršek jen mění pořadí pozornosti, ne data
- nový modul `today25.js`, samostatné `today25.css`, integrační test cross-domain řazení a rozšířený QA/PWA release gate

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
