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

# Kamil OS 24.3 — Project Command Center

## 24.3.0 — Project management
- Práce dostala skutečný projektový command center místo jednoduchých karet
- projekt má odpovědnou osobu, deadline, riziko, stav, další krok a poznámku
- detail projektu ukazuje otevřené a prošlé úkoly, termín, riziko, odpovědnost a další krok
- úkoly lze přímo navázat na konkrétní projekt a zakládat z jeho detailu
- rychlé založení úkolu nabízí výběr aktivního projektu
- projekt lze upravit nebo označit jako hotový bez mazání jeho úkolů
- intelligence nově počítá projektové riziko, deadline, chybějící další krok a prošlé projektové úkoly
- PWA shell, schema a QA gate sjednoceny na 24.3

# Kamil OS 24.2 — Faster Capture & Follow-up

## 24.2.0 — Quick capture + Waiting hub
- univerzální tlačítko **Přidat** v horní liště a klávesová zkratka `Ctrl+N`
- rychlé založení úkolu, čekání, projektu, pohledávky, vstupenkové pozice nebo Inbox položky
- nový samostatný hub **Čekám na** pod Více
- čekající položky se řadí podle stáří, lze je označit jako připomenuté nebo vyřešené
- intelligence zohledňuje stáří čekání i naplánovaný follow-up a posílá prioritu přímo do správného hubu
- globální vyhledávání umí najít a otevřít čekající položky
- příkazy `ukaž čekám na` / `co čeká` otevřou Waiting hub
- Dnes odkazuje na kompletní seznam čekajících položek
- rozšířený statický QA gate o capture modul a nové shell assety

# Kamil OS 24.1 — Personal Command Center

## 24.1.0 — UI/UX overhaul
- nový full-width desktop shell s levým sidebarem a samostatným workspace
- nový přihlašovací a password-recovery flow
- kompletně přestavěná stránka Dnes: priorita, úkoly, kalendář, finance, vstupenky, projekty, čekání a radar
- nová Práce: akční fronta, pozdější úkoly a projektové karty s dalším krokem
- nové Peníze: majetek, likvidita, struktura peněz, XTB a pohledávky
- nové Vstupenky: tabulkový portfolio pohled s workflow, P/L a ROI
- nové Více: Inbox, Pohledávky, Termíny, Záloha, Nastavení a Systém
- command palette už není závislá na legacy rendereru
- waiting/delegation položky vstupují do intelligence a mohou se zobrazit jako priorita
- responsive mobilní layout zůstává zachovaný
- PWA shell a manifest sjednoceny na 24.1

## 22.3 — Clean Product
- Kompletní odříznutí legacy UI a stovek historických rendererů.
- Modulární architektura: state, cloud, intelligence, rendering, commands.
- Jednotný State Manager pro lokální uložení, undo, audit a cloud save.
- Offline fronta pro neodeslané změny.
- Bezpečná detekce cloud/lokálního konfliktu bez automatického přepsání.
- Migrace starého stavu na schema v34 bez mazání legacy dat.
- Hlavní navigace pouze Dnes / Práce / Peníze / Vstupenky / Více.
- Inbox Zero, Dluhy, Termíny, Záloha, Nastavení a Systém jsou pod Více.
- Jedno hlavní doporučení + maximálně 3 další signály.
- Jednotný command/search řádek.
- Globální Undo.
- Backup / restore JSON.
- PWA update banner a verzovaný app shell.
- Mobilní bottom navigation.
