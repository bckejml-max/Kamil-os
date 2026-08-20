# Kamil OS 25.13 — Personal Admin

## 25.13.0 — Personal obligations, insurance and household control
- hlavní rozvoj se přesouvá z pracovní administrativy směrem k osobnímu životu, domácnosti a rodinným závazkům
- ve **Více** vznikl nový **Osobní administrace** hub pro pojistky, pravidelné platby, předplatné, energie a služby, hypotéku/úvěry, doklady, auto, dům/domácnost, rodinné závazky, poplatky/daně a ostatní termíny
- každá položka může mít poskytovatele, skutečnou částku, měnu, periodicitu, další platbu/kontrolu, výročí nebo expiraci, výpovědní termín, autopay a poznámku
- radar řadí položky podle reálných termínů do stavů **ŘEŠIT / BRZY / DOPLNIT / OK** a upozorňuje i na důležité položky bez kontrolního termínu
- měsíční a roční opakované náklady se počítají pouze ze zadaných částek a vždy **odděleně podle měny**; CZK/EUR/USD se nikdy nesčítají do falešného společného součtu
- jednorázové částky se nezapočítávají do opakovaných měsíčních/ročních nákladů
- položky lze upravit nebo archivovat; aplikace nic automaticky neplatí, neruší smlouvy a nevymýšlí termíny ani částky
- data se ukládají pouze jako volitelný `personalAdmin.items` v existujícím stavu; Supabase URL/key/table, schema v36 a legacy localStorage klíče zůstávají beze změny
- přidány `personalAdmin25.js`, `personalAdminUi25.js`, `personal_admin_test.mjs`, statický release gate, GitHub Actions coverage a PWA offline cache
- viditelná verze, manifest a service-worker shell sjednoceny na **25.13.0**
