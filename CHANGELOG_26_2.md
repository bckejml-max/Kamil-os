# Kamil OS 26.2 — Renewal & Savings Radar

## 26.2.0 — Prevent silent renewals and missed cancellation windows
- nový **Renewal & Savings Radar** analyzuje aktivní osobní smluvní závazky z Personal Adminu a řadí je podle skutečně uloženého výpovědního termínu, výročí, periodicity a autopay stavu
- rozlišuje **PO TERMÍNU / ROZHODNOUT / PROVĚŘIT / DOPLNIT DATA / HLÍDAT** a nevytváří žádný automatický zásah do smlouvy
- tichá automatická platba blízko výročí nebo výpovědního okna dostává vyšší prioritu, aby se smlouva neprodloužila jen kvůli zapomenutí
- opakované předplatné, energie nebo pojištění bez uloženého výročí či výpovědní lhůty se označí jako **datová mezera**, ne jako domyšlený termín
- více aktivních závazků u stejného poskytovatele se pouze označí k prověření; systém je automaticky neoznačuje za duplicitu
- známý roční spend k prověření se počítá po jednotlivých měnách; CZK/EUR/USD se nikdy nesčítají a tento spend se výslovně netváří jako odhad úspory
- Radar je vložen přímo na hlavní **Domov** a nejurgentnější smluvní okno může vstoupit do osobního **Top 5 rozhodnutí** bez duplikace již existujícího osobního risk signálu
- přidán samostatný `renewal_radar_test.mjs`, static QA coverage, GitHub Actions krok a PWA cache
- verze aplikace, manifest a service worker jsou sjednocené na **26.2.0**; schema zůstává **v37** a Supabase/localStorage konfigurace se nemění
