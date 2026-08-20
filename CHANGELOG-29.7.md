# Kamil OS 29.7 — Portfolio Rebalancer

## Nové
- Rebalancer v Penězích pro nový investiční vklad bez automatického prodeje stávajících pozic.
- Cílová alokace pro široké ETF / dluhopisy / satelity.
- Optimalizace rozdělení nového vkladu tak, aby po nákupu byla odchylka od cíle co nejmenší.
- Přesná částka nákupu v měně účtu; orientační počet kusů jen pokud ho lze odvodit z importované hodnoty a množství.
- Volitelný preferovaný ticker pro každou alokační třídu.

## Bezpečnost a pravdivost
- Žádný automatický prodej.
- Pokud nový vklad nedokáže srovnat převaženou část portfolia, UI ukáže zbytkovou odchylku místo falešného perfektního výsledku.
- Více satelitních akcií se nerozděluje naslepo; bez preference je vyžadována ruční volba tickeru.
- Měny se nesčítají bez skutečně dostupného FX kurzu. Chybějící FX zablokuje celý plán.
- Ručně potvrzená prodaná XTB pozice se ignoruje do skutečně novějšího XTB importu.
- Orientační počet kusů není živá cena a je jako takový označený.

## Release
- Verze 29.7.0, schema zůstává 42.
- PWA cache obsahuje engine i UI rebalanceru.
- Samostatný engine test, integrační test, static QA a release gate.
