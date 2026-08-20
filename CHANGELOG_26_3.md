# Kamil OS 26.3 — Scenario Simulator

## 26.3.0 — Test personal money decisions before touching real data
- nový **Scenario Simulator** v Penězích simuluje mimořádný výdaj, novou investici nebo mimořádný příjem
- porovnává stav před/po přes Cashflow 90 dní a Capital Allocation: minimum hotovosti, rezervní headroom, další bezpečný kapitál a konečný 90denní zůstatek
- scénář snižující likviditu pod rezervní minimum nebo vytvářející nekrytou část už naplánované investice dostane verdikt **NEDĚLAT**
- těsné pásmo nad rezervou dostane **OPATRNĚ**; příjem může explicitně ukázat zlepšení rizikového výhledu
- termín mimo 90denní horizont je označen jako mimo rozsah místo falešného dopadu
- cizí měna se bez skutečného FX kurzu odmítne; žádný automatický přepočet se nevymýšlí
- engine pracuje jen s dočasnou kopií state a nemá přístup ke `store.mutate`; UI nic neukládá ani neprovádí
- přidány rychlé scénáře 25 / 50 / 100 tisíc, samostatný výpočetní test, static QA, GitHub Actions a PWA cache
- schema zůstává **v37**; Supabase URL/key/table a legacy storage klíče se nemění
