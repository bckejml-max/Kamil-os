# Kamil OS 25.12 — Project Money

## 25.12.0 — Financial exposure by project
- Práce dostala nový **PROJECT MONEY** pohled nad aktivními zakázkami.
- U každého projektu lze ručně uložit pouze skutečně známé údaje: smluvní hodnotu, schválené změny, otevřené ZL/claimy, vyfakturováno, zaplaceno a známé náklady.
- Project Money počítá zajištěnou hodnotu, nevybranou fakturaci, schválenou hodnotu bez fakturace a celkovou otevřenou finanční expozici projektu.
- Projekty se řadí podle finančního rizika; samostatně je vidět počet projektů, kde finanční data úplně chybí.
- Prázdná pole zůstávají neznámá. Aplikace nevyrábí falešnou marži, budoucí náklady ani domnělé schválení ZL.
- Pokud je zaplacená částka vyšší než vyfakturovaná, systém čísla automaticky neopravuje a místo toho zobrazí datové upozornění.
- Data se ukládají jako volitelný objekt `project.money`; Supabase URL/key/tabulky, schema v36 i legacy localStorage klíče zůstávají beze změny.
- Přidány moduly `projectMoney25.js` a `projectMoneyUi25.js`, samostatný `project_money_test.mjs`, GitHub QA krok a PWA cache.
- Viditelná verze, manifest a service-worker shell sjednoceny na **25.12.0**.
