# Kamil OS 26.1 — Personal Obligations → Cashflow

## 26.1.0 — Known personal bills now affect liquidity decisions
- **Cashflow 90 dní** nově automaticky zahrnuje aktivní položky z Personal Admin, pokud mají skutečně zadanou částku a konkrétní `nextDue`.
- Podporuje jednorázové, měsíční, čtvrtletní, pololetní a roční závazky; opakování se projektuje pouze z uložené periodicity, nic se nevymýšlí.
- Závazek po termínu se konzervativně započítá do dnešního dne, aby výhled nepředstíral vyšší disponibilní hotovost.
- Osobní položky se započítávají jen v hlavní měně finančního plánu. Položky v jiné měně se bez skutečného FX kurzu ignorují a UI ukazuje jejich počet.
- UI Cashflow rozlišuje zdroje **ruční plán / pohledávka / osobní závazek** a ukazuje také neúplné osobní položky bez částky nebo termínu.
- Rozšířený `cashflow90_test.mjs` ověřuje opakované osobní závazky, roční pojistku, bezpečné ignorování cizí měny a konzervativní práci se závazkem po termínu.
- Žádné finanční transakce se neprovádějí automaticky a nedošlo ke změně Supabase URL/key/table, localStorage klíčů ani datového schématu; schema zůstává **v37**.
