# OS1050 Runtime cleanup — 50 kroků

Cíl: odstranit vrstvené bootstrapy bez ztráty kompatibility a vytvořit jeden měřitelný, single-flight runtime start.

## Boot architektura
1. Inventarizovat One OS boot řetězec.
2. Identifikovat OS967 bootstrap.
3. Identifikovat OS977 bootstrap.
4. Identifikovat OS987 bootstrap.
5. Identifikovat OS1037 bootstrap.
6. Identifikovat OS1047 bootstrap.
7. Odstranit vlastní DOM-ready řízení z OS967 wrapperu.
8. Odstranit vlastní DOM-ready řízení z OS977 wrapperu.
9. Odstranit vlastní DOM-ready řízení z OS987 wrapperu.
10. Odstranit vlastní DOM-ready řízení z OS1037 wrapperu.
11. Odstranit vlastní DOM-ready řízení z OS1047 wrapperu.
12. Odstranit fallback timer z OS967 wrapperu.
13. Odstranit fallback timer z OS977 wrapperu.
14. Odstranit fallback timer z OS987 wrapperu.
15. Odstranit fallback timer z OS1037 wrapperu.
16. Odstranit fallback timer z OS1047 wrapperu.
17. Zavést runtimeCoordinator1050.
18. Zavést jeden DOM-ready gate.
19. Zavést jeden boot-budget gate.
20. Zavést jediný bounded fallback timeout.
21. Spouštět OS967 jako první stage.
22. Spouštět OS977 až po OS967.
23. Spouštět OS987 až po OS977.
24. Spouštět OS1037 až po OS987.
25. Spouštět OS1047 až po OS1037.

## Single-flight a observabilita
26. Sdílet jediný boot Promise.
27. Zabránit paralelnímu dvojímu bootu.
28. Zabránit opakovanému scheduleru po dokončení.
29. Evidovat stav každé stage.
30. Evidovat chybu každé stage bez skrytého failu.
31. Evidovat startedAt.
32. Evidovat completedAt.
33. Vystavit runtimeHealth1050().
34. Emitovat kamil:runtime1050 event po dokončení.
35. Zakázat polling/setInterval v runtime koordinátoru.

## Betting re-entry cleanup
36. Odstranit pět přímých legacy Boot importů z bettingBootstrap543.
37. Připojit bettingBootstrap543 pouze na OS1050 koordinátor.
38. Odstranit 60ms click re-entry timer.
39. Nahradit jej microtaskem.
40. Omezit re-entry jen na navigační kliky.
41. Zavést singleton navigační handler.
42. Zachovat existující betting MutationObserver pouze pro první nalezení view.

## Guardy a QA
43. Přidat runtime_boot_guard.mjs.
44. Vynutit nulové timery/listenery ve všech pěti compatibility boot wrapperech.
45. Vynutit single-flight a timer/listener budget OS1050.
46. Aktualizovat OS967/977/987 guardy na canonical runtime.
47. Aktualizovat OS1037/1047 guardy na canonical runtime.
48. Přidat runtime guard do npm test:release.
49. Přidat browser test idempotence a compatibility wrapperů.
50. Přidat OS1050 test do unified Control Plane + Operations CI.

## Canonical pravidlo

Nová feature nesmí vytvářet vlastní `DOMContentLoaded` + fallback timer bootstrap vrstvu. Pokud patří do hlavního One OS runtime, musí být přidaná jako explicitní stage nebo lazy adapter pod OS1050. Compatibility `*Boot.js` soubory smějí pouze delegovat do canonical runtime a nesmějí vlastnit lifecycle listener, polling ani fallback timer.
