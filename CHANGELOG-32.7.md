# Kamil OS 32.7 — Financial Command

## Proč
XTB data, money routing, realizované prodeje a rodinný cashflow existovaly v různých vrstvách, ale nebyly vidět jako jeden rozhodovací systém.

## Peníze
- nový **XTB & rozhodovací centrum** blok je první finanční karta v pohledu Peníze
- hotovostní hard floor se vyhodnotí před novým XTB vkladem
- plánovaný rozpočet se rozdělí na `do rezervy` a `do XTB`; jde pouze o návrh
- cílová rezerva používá uložený wealth profile / 4M cashflow baseline
- pokud existuje historie uzavřených měsíců, má přednost před fallback baseline

## XTB
- viditelný aktuální počet pozic a účty
- nahoře jsou nejvyšší rozhodovací priority z existujícího XTB decision engine
- realizovaná historie ukazuje počet obchodů, win/loss, realizovaný P/L, vážené ROI, nejlepší/nejhorší a poslední exity
- historický výsledek není automatická investiční instrukce

## Cashflow
- připravená podpora privátní `wealthProfile.cashflow.history`
- veřejný repozitář neobsahuje osobní bankovní historii ani konkrétní soukromé finanční částky

## Safety
- `ROUTING_PROPOSAL_ONLY`
- `autoTrade:false`
- Kamil OS nepřevádí peníze ani neposílá pokyny brokerovi
- cash floor vždy předchází novému XTB vkladu
- 32.6 stale-market ticket pricing firewall zůstává beze změny
- schema zůstává 80
