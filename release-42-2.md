# Kamil OS 42.2 — Stability First

- Enforces a real 18-second startup grace window before Today extras may import heavy legacy UI modules.
- Stops background notification scheduling from importing heavy UI bundles unless browser notifications are actually granted.
- Delays risk-badge work and runs it through browser idle time.
- Reduces warm startup work to the lightweight risk engine only and moves it behind a 30-second grace window.
- Adds static performance guards so these startup protections cannot silently regress.

Goal: remove the remaining "opens, then freezes" behavior before adding more features.
