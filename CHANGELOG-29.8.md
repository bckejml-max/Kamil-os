# Kamil OS 29.8 — Portfolio Risk Map

## Nové
- Vysvětlitelná mapa rizika XTB portfolia se skóre 0–100.
- Koncentrace největší pozice, Top 3 a efektivní počet pozic.
- Alokační riziko pro široké ETF / dluhopisy / satelity proti uloženému cíli z Portfolio Rebalanceru.
- Známé tematické koncentrace pouze tam, kde je lze konzervativně odvodit z názvu/tickeru.
- Přehled koncentrace podle měny XTB účtu.
- Přímý skok z Risk Map zpět na Rebalancer pro snížení rizika novým vkladem.

## Bezpečnost a pravdivost
- Ručně potvrzené prodané XTB pozice se nezapočítávají do novějšího XTB importu.
- Pokud chybí skutečný FX kurz, globální skóre a globální součet se vůbec nevytvoří; dostupné zůstávají lokální pohledy po měnách.
- Měna účtu je výslovně odlišena od ekonomické měnové expozice podkladového aktiva.
- Kamil OS nevyrábí úplnou sektorovou taxonomii z názvů pozic.
- Skóre je deterministické a ukazuje konkrétní bodové drivery.

## Release
- Verze 29.8.0, schema zůstává 42.
- Engine je bez DOM/browser závislostí pro budoucí mobilní shell.
- PWA cache a manifest obsahují Risk Map.
- Samostatný engine test, integrační test, static QA a release gate.
