# Kamil OS 32.0 — Trust & Sync

## Login hardening
- 60s cooldown pro magic link i reset hesla
- srozumitelná česká hláška pro Supabase 429 rate limit
- stabilní canonical redirect zůstává `https://kamil-os-smoke.vercel.app/`
- `shouldCreateUser:false` zůstává povinné
- po připojení je vidět stav `Cloud • připojeno`

## Cloud state hygiene
- schema se posouvá na **80** (navazuje na historický cloud schema 79)
- `undo` je nově device-local a do cloud payloadu se neposílá
- device-only `cloudMode`, `preflight` a Smart Sync device metadata se do cloudu neposílají
- při načtení cloudu se zachová lokální undo a UI state
- starší cloud payload se po bezpečném načtení automaticky normalizuje a znovu uloží
- cloud payload s vyšším schema než aplikace se odmítne bez přepsání dat
- offline queue už při flushi nepřepisuje celý právě načtený state

## Confirmed Merge
- Remote Change Inbox umí náhled lokální vs. vzdálené hodnoty
- vzdálená verze se aplikuje jen po explicitním potvrzení
- operace používá normální Kamil OS undo + audit + cloud writer
- volitelný auto režim umí přijmout pouze úplně nové nekonfliktní položky
- konflikty a vzdálené smazání se nikdy automaticky neaplikují

## QA
- cloud payload unit test
- auth cooldown/rate-limit test
- confirmed merge unit test
- Trust & Sync static safety gate
- browser E2E pro local-first auth cooldown a Smart Sync invariants
- kompletní legacy regression suite
