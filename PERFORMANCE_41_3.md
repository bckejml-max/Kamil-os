# Kamil OS 41.3 — Progressive Boot

Cíl: zrychlit vnímaný i skutečný start bez odstranění funkcí nebo historie.

## Startovací pořadí

1. `index.html` vykreslí kritický shell bez externího CSS.
2. `instantShell42.js` okamžitě ukáže poslední lokální snapshot nebo malý boot summary.
3. Před importem hlavní aplikace se `coldPartition42.compactLocalState42()` pokusí přesunout velké peněžní historie z hot `kamil-os-state` do lazy cold storage.
4. `app.js` startuje nad menším stavem.
5. `viewRuntime41` pro první obrazovku načte jen `todayLite43.js`.
6. Plný `today29.js` se hydratuje v idle čase nebo po kliknutí na „Načíst detail teď“.
7. Peněžní historie se hydratuje až při otevření Peněz.
8. Po startu se `store.persist` přepne na partition-aware zápis, aby se cold historie při každé další změně nevracela do hot localStorage.
9. Sync queue obsahuje jen pending marker; cloud při flush stejně používá aktuální `store.get()` a `cloudPayload32` před uploadem doplní cold historii.

## Data, která se nemažou

Cold storage drží:
- `tradeJournal.trades`
- `personalSpending.transactions`
- `netWorthBook.history`
- `importCenter.history`
- `investmentBook.history`

Ticket historie a audit zůstávají hot, protože jsou potřeba pro Ticket Learning a Change Pulse.

## Snapshot fix

41.3 odstraňuje `data-instant-shell` po startu aplikace a snapshot ukládá po události `kamil:today-full-ready`. Starší verze mohly kvůli markeru snapshot vůbec neuložit nebo uložit pouze dočasný shell.

## Diagnostika

Ve `Více` se lazy přidá karta **Výkon 41.3**. Ukazuje:
- čas instant shellu,
- app ready,
- plný Today,
- TTFB,
- velikost hot/cold storage a sync fronty.

Tlačítko „Optimalizovat lokální data“ pouze znovu provede partition compaction. Nic nemaže.

## Bezpečnostní invarianta

`cloudPayload32` vždy před cloudovým uložením volá `mergeColdState42`, takže oddělení lokálních historií nesmí způsobit jejich ztrátu v cloudovém snapshotu.
