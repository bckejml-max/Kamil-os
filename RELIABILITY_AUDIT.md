# Reliability Audit — 22.3.2

22.3.1 měla malé crash window mezi lokálním zápisem a debounce cloud-save pokusem.
22.3.2 zapisuje pending sync snapshot synchronně už v `Store.mutate()` a `Store.undo()`.

Cache refresh přes `cloud:false` už není považovaný za uživatelskou změnu.
Doplněny install ikony 192×192 a 512×512.
