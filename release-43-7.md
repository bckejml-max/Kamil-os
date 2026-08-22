# Kamil OS 43.7 — Stability Memory

- Persists device-local stability history for noncritical lazy modules.
- Scores repeated slow loads and failures on a bounded 0–20 scale.
- Automatically keeps risky modules COLD or BLOCKED from background work before they can cause repeated stalls.
- Explicit user navigation remains allowed and may load a previously deferred module.
- Successful quarantine recovery lowers the learned risk score.
- System diagnostics shows per-module score, mode, samples, failures and successes, plus a memory reset.
- Preserves Safe Boot, Responsive Scheduler, Adaptive Loader, Cold Load, Auto Quarantine and Self-Healing.
- Aligns web, PWA and desktop metadata at 43.7.0.
- Production rollback restored on 2026-08-22 after OS50 client freeze.
