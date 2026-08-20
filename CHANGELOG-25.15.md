# Kamil OS 25.15 — Household Bills Center

## 25.15.0 — Personal payment cockpit
- přidaný **Household Bills Center** ve Více nad existujícími daty `personalAdmin.items`; nevzniká druhá paralelní evidence plateb
- zahrnuje osobní platby, předplatná, energie/služby, úvěry/hypotéku, domácnost a poplatky; pojištění zůstává v Insurance Center
- radar řadí platby podle prošlé splatnosti, termínu dnes, do 7 dní a do 30 dní a zvýrazňuje ruční platby, které vyžadují pozornost
- měsíční a roční náklady se agregují **striktně po měnách**; CZK/EUR/USD se nikdy implicitně nepřevádějí ani nesčítají
- tlačítko **Zaplaceno** pouze zaznamená uživatelské potvrzení a u opakované platby bezpečně posune existující datum o jednu periodu; nic bankovně neplatí
- posun termínu bezpečně zvládá konce měsíců a přestupné datum; u jednorázové položky se žádný další termín nevymýšlí
- přidány `householdBills25.js`, `householdBillsUi25.js`, výpočetní a statický QA test, GitHub Actions coverage a PWA cache
- aplikace, manifest a service worker sjednoceny na **25.15.0**; Supabase konfigurace, schema v36 a legacy storage keys zůstávají beze změny
