# Kamil OS1100 Runtime Architecture Contract

OS1100 makes runtime ownership explicit. New long-lived browser resources must have an owner and a deterministic cleanup path.

## Rules

1. Every long-lived listener, timer, observer or subscription must have a stable owner id.
2. Features should use `globalThis.__KAMIL_RUNTIME1100__` helpers instead of creating duplicate local lifecycle infrastructure.
3. Repeated renders must not add another copy of the same subscription.
4. Use keyed scheduling to coalesce repeated refresh/render requests.
5. A feature leaving its active domain must be disposable through `disposeOwner()` or `disposeDomain()`.
6. Polling is prohibited unless an event-driven alternative is impossible and the interval is documented.
7. Background work must be cancelable when its view/domain is inactive.
8. One user action must not create unbounded event chains or overlapping refreshes.
9. New features may not regress repository runtime budgets.
10. Runtime diagnostics must remain inspectable via `__KAMIL_RUNTIME1100__.snapshot()`.

## Canonical domains

- `core` - shell, navigation and shared runtime only
- `tickets` - Ticket Desk and resale workflows
- `betting` - betting/odds/settlement workflows
- `finance` - money, portfolio and investment workflows
- `control` - control plane, operations and diagnostics

## API

- `ownEvent(owner, target, type, handler, options)`
- `schedule(owner, key, fn, delay)`
- `scheduleMicrotask(owner, key, fn)`
- `cancel(owner, key)`
- `ownObserver(owner, observer)`
- `ownCleanup(owner, cleanup)`
- `disposeOwner(owner)`
- `disposeDomain(domain)`
- `activateDomain(domain, owners)`
- `snapshot()`

## Runtime budgets

OS1100 starts with a non-regression ceiling and ratchets it down during cleanup work. The architectural target is:

- `setTimeout`: <= 375
- `addEventListener`: <= 700
- `setInterval`: 0
- zero growth after repeated navigation cycles
- no inactive heavy domain doing recurring work

The static inventory is enforced by `runtime_inventory_1100_guard.mjs`. Runtime leak/soak browser coverage is the next enforcement layer as domain owners are migrated to OS1100.
