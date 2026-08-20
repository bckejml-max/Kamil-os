# Kamil OS 25.18 — Personal Risk Center

## 25.18.0 — One personal risk queue
- nový **Personal Risk Center** spojuje zvýšená rizika z Household Bills, Insurance Center, Documents & Expiry a Family & Home
- jedna osobní položka se při překryvu zdrojů zobrazí jen jednou; důvody a domény se sloučí a použije se nejvyšší platná priorita
- radar rozlišuje **kritické / vysoké / střední** riziko a zvlášť ukazuje signály s evidovaným finančním dopadem
- **risk score 0–100** je pouze pravidlový indikátor z uložených termínů a stavů; není to pravděpodobnost škody ani odborný finanční, právní nebo pojistný posudek
- nízkorizikové budoucí položky se do fronty netlačí a chybějící fakta se nevymýšlí
- Personal Risk Center nic automaticky neplatí, neruší, neobjednává ani nesjednává
- přidány samostatné výpočetní a statické testy, GitHub QA, PWA cache a shell 25.18
- Supabase konfigurace, schema v36 a legacy storage keys zůstávají beze změny
