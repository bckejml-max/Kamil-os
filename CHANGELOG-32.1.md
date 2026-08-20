# Kamil OS 32.1 — Data Engine v3

## Co přidává
- cloudový history dual-write pro Decision Journal, Net Worth, ticket historii, Trade Journal a Smart Import historii
- samostatnou tabulku `kamil_os_history` s primárním klíčem `(user_id, record_key)`
- idempotentní upsert historických záznamů
- cloudový počet a stav v **Více → Systém → History Data Engine**
- ruční akci **Zrcadlit a synchronizovat teď**

## Bezpečnost
- RLS podle `(select auth.uid()) = user_id`
- explicitní Data API grant pouze `SELECT, INSERT, UPDATE` pro `authenticated`
- `anon` má všechna oprávnění odebraná
- klient nemá `DELETE`
- cloud-history allowlist je pouze `decision / networth / ticket / trade / import`
- Vault, raw dokumenty a auth tokeny nejsou součástí history plánu
- čistý local-first start dál nenačítá Supabase SDK

## Migrace
32.1 je **dual-write release**. Hlavní `kamil_os_state` zůstává zdrojem pravdy a nic z něj nemažeme. Teprve po ověření reálného cloud backfillu a read pathu lze v některé z dalších verzí přesunout velké historické kolekce mimo hlavní JSON.

## QA
- Cloud History unit test
- Cloud History static safety test
- Chromium E2E pro Data Engine v3 a local-first lazy Supabase
- finální release gate 32.1
- kompletní starší regresní sada zůstává aktivní
