# Kamil OS 41.2.0

Performance release focused on startup latency without removing features or data.

- Navigation is served from the cached application shell immediately; network refresh happens in the background.
- Service-worker install cache is intentionally small so updates do not download the whole app before activation.
- Heavy money-only history is partitioned out of the startup state: XTB trade journal, imported spending transactions, Net Worth history, import history and investment timeline history.
- Cold history is hydrated only when Money is opened.
- Cloud payloads merge cold local history back in before sync, so partitioning does not delete cloud data.
- Ticket learning and Change Pulse remain hot on Today and are not moved to cold storage.
- Full CSS begins only after the first paint; the critical shell remains inline.
- Windows desktop build version is aligned to 41.2.0.
