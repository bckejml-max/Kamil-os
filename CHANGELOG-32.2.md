# Kamil OS 32.2 — Copilot 2.0 Foundation

## Co se mění
Command Bar už nesmí provést známou zapisovací akci okamžitě. Pro splátky pohledávek, označení vstupenky jako prodané a přesun/vytvoření osobního úkolu na zítra platí jednotný tok:

**UNDERSTAND → PROPOSE → PREVIEW → CONFIRM → EXECUTE**

Navigace, vyhledávání a read-only osobní dotazy zůstávají okamžité.

## Bezpečnost zápisu
- návrh je čistá funkce a nemění state
- modal ukáže konkrétní změnu před provedením
- zápis vyžaduje explicitní tlačítko **Potvrdit změnu**
- po dobu preview zůstává state beze změny
- po zrušení zůstává state beze změny
- před provedením se návrh znovu sestaví z aktuálního state
- pokud se mezitím dotčená entita změnila, fingerprint nesedí a zápis se zruší
- samotné provedení dál používá standardní `store.mutate`, tedy undo/audit/sync cestu
- neznámý příkaz stále nic nezapisuje bez explicitního potvrzení vytvoření osobního úkolu

## Zachované ochrany
- schema zůstává 80
- Trust & Sync 32.0 zůstává beze změny
- Data Engine v3 32.1 zůstává dual-write a nedestruktivní
- klientský DELETE cloud historie zůstává zakázaný
- konflikt ani remote delete se nikdy auto-apply
- čistý local-first start dál nevyžaduje Supabase

## QA
- pure Copilot write proposal unit test
- static safety test proti návratu přímých `payment / sold / tomorrow` write větví
- Chromium E2E: splátka je 0 před preview, 0 po zrušení a 1 až po explicitním potvrzení
- kompletní legacy + Trust & Sync + Data Engine regresní sada
