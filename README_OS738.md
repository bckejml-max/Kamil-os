# OS738 Data Truth Audit

Adds a runtime audit over the canonical sources already used by Kamil OS. It reports ticket source truth (live cloud vs local fallback), incomplete ticket rows, property candidate completeness, money freshness, and a confidence score with concrete data gaps. It is lazy-loaded from Více so it does not affect normal boot performance.
