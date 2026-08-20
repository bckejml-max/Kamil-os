# Kamil OS 31.4.1 — Shell Consistency Hotfix

## Oprava
- první HTML odpověď už ukazuje Kamil OS 31.4 / 31.4.1, ne staré 31.3
- auth obrazovka a sidebar mají správnou verzi ještě před spuštěním JavaScriptu
- meta description odpovídá Smart Sync Foundation
- PWA shell cache je otočená na `kamil-os-31.4.1-shell-r1`

## Guard
- Static QA i release gate nyní explicitně odmítnou `31.3.0` nebo `Kamil OS 31.3` v `index.html`
- release metadata, manifest, package a PWA cache musí sedět na 31.4.1

## Beze změny
- Kamil OS schema zůstává 42
- Smart Sync zůstává `SHADOW_ONLY`
- `kamil_os_state` zůstává autoritativní snapshot
- canonical auth redirect zůstává aktivní
- žádná změna Supabase dat, RLS ani sync payloadů
