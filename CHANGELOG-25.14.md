# Kamil OS 25.14 — Insurance Center

## 25.14.0 — All personal insurance in one place
- nový **Insurance Center** ve Více používá existující Personal Admin registr a filtruje pouze aktivní položky typu Pojištění
- u pojistky lze uložit typ, pojištěnou osobu / majetek, pojišťovnu, číslo smlouvy, kontakt, pojistné, periodicitu, pojistný limit, spoluúčast, další platbu, výročí/expiraci, výpovědní termín a autopay
- radar zvýrazňuje prošlou expiraci, blížící se výročí a výpovědní lhůtu; chybějící evidenční údaje označuje jako DOPLNIT
- systém výslovně nehodnotí odbornou dostatečnost pojistného krytí a nevymýšlí chybějící limity ani termíny
- pojistné náklady se agregují **po jednotlivých měnách**, takže CZK/EUR/USD se nikdy nesčítají do falešného společného součtu
- archivace pojistky zachová historická data a pouze ji odstraní z aktivního radaru
- přidány `insurance25.js`, `insuranceUi25.js`, výpočetní a statický test, GitHub QA a PWA cache
- verze sjednocena na **25.14.0**, schema zůstává **v36** a Supabase/localStorage konfigurace se nemění
