# Kamil OS 25.8 — Action Plan

## Co je nové
- Capital Allocation se převádí do konkrétního pořadí dalších kroků.
- Ochrana rezervy a urgentní ticket zásoba mají přednost před novým investováním.
- XTB Trade Planner, ticket BUY limit a volná hotovost se zobrazují jako kroky UDĚLAT TEĎ / PROVĚŘIT / POČKAT.
- Každý krok má bezpečný deep-link do Peněz nebo Vstupenek.

## Bezpečnost
- Action Plan nic automaticky neposílá, neobchoduje a nekupuje ani neprodává vstupenky.
- Živé ticket BUY doporučení zůstává pouze ručně potvrzovaným review krokem.
- Pokud nejsou data nebo důvod dostatečné, plán explicitně doporučí počkat místo vytvoření falešné akce.
- Supabase konfigurace, schema version a legacy storage keys zůstávají beze změny.

## QA
- `action_plan_test.mjs` ověřuje prioritu ochrany rezervy a zákaz automatické exekuce.
- GitHub QA workflow spouští nový test.
- Statický QA zachovává všechny dosavadní kontroly a přidává Action Plan shell/PWA gate.
- Verze aplikace a PWA cache: 25.8.0.
