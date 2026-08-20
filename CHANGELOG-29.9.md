# Kamil OS 29.9 — Ticket Profit & ROI Ledger

## Co přidává
- nový Ticket Profit & ROI panel ve Vstupenkách
- realizovaný P/L a ROI pouze ze skutečně uložených prodejů
- samostatně vyplacené tržby, čekající payout a historie s neznámým settlementem
- otevřený kapitál a listingový objem vedené odděleně od realizovaného výsledku
- přehled posledních realizovaných obchodů a nejvýdělečnějších realizovaných akcí
- souhrny po jednotlivých měnách bez falešného mixed-currency total

## Bezpečnost dat
- HOLD/LISTED pozice se do realizovaného P/L nikdy nepočítají, i kdyby v nich zůstal starý `sell`
- SOLD/PAYOUT pozice bez skutečné prodejní částky jsou datová mezera, ne nulový prodej
- listingová ani cílová cena není realizovaný příjem ani zisk
- current ticket record má přednost před duplicitním historickým snapshotem stejného ID
- engine je bez DOM/browser závislostí a je připravený pro pozdější mobilní shell

## Release
- viditelná verze 29.9.0
- schema zůstává 42
- release číslo je nově oddělené od cloudové konfigurace v `releaseStamp29.js`, takže běžné releasy nemusí upravovat cloud config
- PWA cache `kamil-os-29.9.0-shell-r1`
- engine test, integrační test, static QA a release gate
