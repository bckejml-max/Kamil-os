# Kamil OS 31.5 — Remote Change Inbox

31.5 navazuje na Smart Sync 31.4 a poprvé bezpečně ukazuje, co se v item-level shadow journalu změnilo na jiném zařízení.

## Co přidává
- `Remote Change Inbox` ve **Více → Systém**.
- Cloudové čtení posledních operací z jiných `device_id`.
- Seskupení na nejnovější operaci pro každou položku.
- Read-only klasifikaci:
  - `Konflikt` — lokální a vzdálený payload se liší,
  - `Nová vzdálená položka` — lokálně neexistuje,
  - `Vzdálené smazání` — lokálně ještě existuje,
  - `Už shodné` — není potřeba zásah.
- Přehled změněných top-level polí bez automatického merge.
- Lokální označení `přečteno` v IndexedDB meta; nejde do hlavního state ani do cloudu.

## Bezpečnost
- `kamil_os_state` zůstává autoritativní.
- 31.5 **nikdy automaticky neaplikuje** vzdálené UPSERT/DELETE.
- Remote Inbox cloud cesta je pouze `SELECT`; klient pro inbox nepoužívá INSERT/UPDATE/DELETE/UPSERT.
- Stažený payload se před porovnáním znovu sanitizuje stejným privacy allow/deny pravidlem jako Smart Sync.
- Vault, Emergency File, auth tokeny, raw OCR/obrázky a secret/password/token/CVV/seed klíče nejsou součástí porovnání.
- V čistě lokálním režimu se kvůli Remote Inboxu Supabase SDK nestahuje.
- Schema zůstává **42**, IndexedDB zůstává **v2**.

## QA
- Pure classifier test pro konflikt / remote-new / remote-delete / same.
- Test latest-per-entity collapse a lokálního `seen` stavu.
- Privacy test proti cloudovému payloadu s blokovaným tokenem.
- Static gate potvrzuje SELECT-only remote fetch a zákaz mutace hlavního state.
- Chromium ověřuje, že Remote Inbox je vidět v System view a local-first start stále nestahuje Supabase SDK.
- Celý starší regression suite zůstává součástí release gate.
