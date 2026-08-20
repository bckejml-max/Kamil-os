# Kamil OS 31.4 — Smart Sync Foundation

## Co přidává
- pure item-level diff engine pro stabilní osobní položky
- IndexedDB v2 se `sync_shadow` baseline a `sync_ops` outboxem
- monotónní per-device sekvenci změn
- operace `UPSERT` / `DELETE`
- cloudovou shadow tabulku `kamil_os_changes`
- lokální retry a rozpoznání již existujících operation ID
- stav Smart Sync ve Více → Systém

## Shadow-only bezpečnost
31.4 **nenahrazuje** současný cloud snapshot. `kamil_os_state` zůstává autoritativní a dosavadní conflict flow zůstává beze změny. Remote item-level operace se v 31.4 nikdy automaticky neaplikují do hlavního state.

Při načtení cloudového snapshotu se lokální Smart Sync baseline rebázne, aby cloud load nevypadal jako nová lokální změna.

## Privacy allowlist
Smart Sync 31.4 sleduje pouze:
- tasks
- personalAdmin
- tickets
- debts
- goals
- netWorth
- spending
- assets
- personalInbox

Mimo jsou zejména Vault, auth/session tokeny, Emergency File, raw OCR/obrázky a blokované password/secret/token/CVV/seed atributy.

## Supabase
Tabulka `kamil_os_changes` používá RLS podle `auth.uid()`. Browser role `authenticated` má pouze SELECT + INSERT; UPDATE a DELETE jsou zakázané. `anon` nemá práva. Snapshot tabulka a schema 42 se nemění.

## QA
- pure projection/diff/privacy unit test
- shadow-only static gate
- IndexedDB v2/outbox invariants
- Chromium E2E: baseline → skutečný `store.mutate` → PENDING UPSERT
- browser test, že secret `token` není v outbox payloadu
- canonical auth + Data Engine + celý legacy regression suite
- release gate 31.4
