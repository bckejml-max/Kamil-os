# Kamil OS 42.1 Safe Boot

42.1 prioritizes responsiveness over eager hydration.

- Full Today analytics cannot start immediately after first paint anymore. A real minimum delay is enforced before idle hydration.
- Lazy feature groups wait before background boot instead of using requestIdleCallback immediately after startup.
- User navigation still loads the requested view immediately.
- The instant shell has a bounded app-interactive wait and cannot remain stuck forever waiting for background initialization.
- Snapshot/version keys are aligned with 42.1.

Goal: local shell and primary interactions stay responsive even on large profiles; heavy analytics are opt-in immediately via “Načíst detail teď” and otherwise hydrate later.