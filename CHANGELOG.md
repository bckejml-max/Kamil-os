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

