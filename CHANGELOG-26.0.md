# Kamil OS 26.0 — Personal OS

## 26.0.0 — Personal-only reframe
- hlavní navigace je nově **Dnes / Peníze / Vstupenky / Domov / Více**; pracovní UI a runtime moduly se už nenačítají
- starší pracovní data se nemažou a zůstávají součástí stavu/zálohy pro bezpečnou zpětnou kompatibilitu
- **Dnes** je přepsané na osobní briefing: Top 5 rozhodnutí z osobních rizik, cashflow, XTB, vstupenek a skutečně uložených osobních termínů
- nový **Domov** sjednocuje Platby, Pojištění, Smlouvy, Doklady, Auto, Dům, Rodinu, Personal Risk a 90denní Timeline
- 90denní timeline zahrnuje osobní administrativu, rodinná data, vstupenky, osobní úkoly a jen kalendářové události explicitně označené jako osobní
- nový **Personal Money** počítá známé měsíční/roční životní náklady po měnách; CZK/EUR/USD se nikdy nesčítají ani automaticky nepřepočítávají
- Ctrl+K je osobní Search Everything přes osobní administrativu, rodinu, XTB, vstupenky a pohledávky; pracovní projekty nejsou ve výsledcích
- čísla pojistných smluv a dokladů nejsou v globálním search indexu a v UI jsou standardně maskovaná
- schema zvýšeno aditivně na **v37**: formalizuje `personalAdmin.items`, `familyHome.members` a `personalSettings.maskSensitive`; Supabase URL/key/table ani legacy localStorage klíče se nemění
- cloud conflict dialog nově porovnává osobní administrativu, rodinu, osobní úkoly, vstupenky a pohledávky
- rychlé přidání je personal-only: osobní úkol, domácnost/smlouva, pohledávka nebo vstupenka
- **Více** je zjednodušené pouze na Zálohu / Nastavení / Systém
- PWA shell, manifest, README, integrační testy, nový Personal OS 26 test a release gate jsou aktualizované pro 26.0
