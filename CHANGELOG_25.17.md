# Kamil OS 25.17 — Family & Home Center

## 25.17.0 — Family dates and household obligations
- přidán osobní **Rodina & domov** cockpit ve stránce Více
- rodinní členové jsou evidovaní ve volitelném `familyHome.members`; existující pracovní ani finanční data se nemění
- narozeniny a výročí se převádějí na příští skutečný roční termín; výpočet bezpečně řeší i 29. únor
- domácí povinnosti se neduplikují: centrum čte existující `personalAdmin.items` kategorií **Dům / domácnost** a **Rodina**
- radar rozlišuje po termínu, do 7/30/90 dní a chybějící termín; žádné datum se nevymýšlí
- přehled příštích 60 dní vytahuje pouze skutečně uložené narozeniny a výročí
- volitelné propojení člena rodiny s pojistkou/dokladem je pouze evidence podle přesné shody jména; absence shody není interpretována jako chybějící pojistka nebo doklad
- nic se automaticky neobjednává, neplatí ani neruší
- přidány `familyHome25.js`, `familyHomeUi25.js`, výpočetní a statický QA test, CI krok a PWA cache
- viditelná verze, manifest a service-worker shell sjednoceny na **25.17.0**; Supabase konfigurace, schema `v36` a legacy storage keys zůstávají beze změny
