# Kamil OS 31.0 — Core v2 Foundation

## Co je nové
- jeden kanonický zdroj verze (`releaseMeta.js`); `config.js` už nemá historické číslo release
- Command Bar při nepochopeném vstupu **nic automaticky nezapisuje**; vytvoření úkolu vyžaduje explicitní potvrzení
- otázka **„Co se změnilo od minule?“** používá skutečný Decision Delta baseline místo obecného 30denního auditu
- nový **System Health 31** sleduje schema, velikost local state + pending sync, zálohu, PWA, síť a stáří XTB/ticket dat
- Supabase runtime je skutečně volitelný: SDK se načte až při existující cloud session, recovery flow nebo explicitním připojení cloudu
- shell už při čistém lokálním startu nestahuje Supabase SDK

## Security / reliability
- produkční Vercel přidává CSP, nosniff, frame deny, referrer policy a omezené browser permissions
- immutable Supabase tabulky a legacy localStorage klíče zůstávají beze změny
- state schema zůstává **42**
- Sensitive Vault, Decision Delta baseline a ostatní lokální meta se nepřesouvají do cloud state

## QA
- nový pure `systemHealth31.js` + unit test
- nový Core Hardening static test
- nový Chromium/Playwright E2E: local-first start, navigace, safe unknown command a System Health
- všechny dosavadní engine testy zůstávají v CI

## Release
- verze **31.0.0**
- PWA cache `kamil-os-31.0.0-shell-r1`
- nový runtime: `js/systemHealth31.js`, `js/systemHealthUi31.js`
