# Kamil OS 25.16 — Documents & Expiry Center

## 25.16.0 — Personal expiry radar
- nová osobní sekce **Doklady & expirace** ve Více
- eviduje občanku, pas, řidičský průkaz, STK, dálniční známku, revize, záruky, servisní termíny a další vlastní expirace
- používá stejný `personalAdmin.items` registr jako ostatní osobní moduly, takže nevzniká duplicitní databáze
- radar rozlišuje po expiraci, do 30 / 60 / 90 dní a položky bez zadaného termínu
- lze uložit držitele/objekt, číslo, vydavatele, skutečnou expiraci a vlastní datum, od kterého se má položka připomínat
- Kamil OS nevymýšlí zákonné lhůty, nic automaticky neobjednává ani neobnovuje
- přidány výpočetní a statické testy, GitHub QA a PWA cache
- viditelná verze, manifest a service-worker shell sjednoceny na **25.16.0**; schema zůstává v36 a Supabase/localStorage konfigurace se nemění
