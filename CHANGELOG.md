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

## 22.3.1 — Cloud Hardened
- ověřeno proti reálnému produkčnímu Supabase schématu a datům
- explicitní a serverem potvrzené `updated_at` při každém cloud save
- DB trigger garantuje fresh `updated_at` i pro jiné klienty
- zpřesněná detekce konfliktu lokální vs cloud
- produkční SECURITY DEFINER helper už není spustitelný z anon/authenticated klienta

## 22.3.4 — Reliability
- pending cloud queue se zapisuje okamžitě při každé cloudové změně
- zavření aplikace během debounce okna už nemůže způsobit ztrátu lokální změny
- `cloud:false` refresh kalendáře/XTB už nezvedá dirty flag ani audit
- durable queue se flushne před lokální refreshí data hubů
- PWA má 192/512 PNG ikony včetně maskable režimu
- sjednocena viditelná verze 22.3.4

## 22.3.4 — Release Candidate
- ochrana proti dvojkliku/dvojímu Enteru u command akcí
- idempotentní SOLD workflow
- unikátní ID každé splátky dluhu
- před zavřením aplikace se dirty stav znovu uloží do durable pending queue
- integrační QA command/search → state → ticket/debt/task workflow

## 22.3.4 — Release Gate
- validace a bezpečná oprava struktury stavu
- import poškozené zálohy se zablokuje
- opravitelné problémy zálohy se ukážou před importem
- startup preflight a lokální release status
- cloud konflikt ukazuje rozdíly v počtech hlavních datových oblastí
- nový release-gate automatický test
