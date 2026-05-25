# Deferred Items — Phase 01 Foundations

Pre-existing issues or out-of-scope discoveries logged during plan execution. Not blockers; revisit at phase/milestone boundaries.

## Tooling

- **gsd-tools `state update-progress` writes stale `percent` value.** Tool returned `{ "percent": 20, "bar": "[██░░░░░░░░] 20%" }` to stdout but actually wrote `percent: 0` to STATE.md frontmatter and left the inline progress bar at `[░░░░░░░░░░] 0%`. Likely a bug in `gsd-tools.cjs` — the computed value is correct but the file-write step doesn't propagate it. Workaround: not in scope for this plan; manually correct if needed at end of phase. Discovered: plan 01-01 finalization (2026-05-25).
- **gsd-tools `state advance-plan` wrote inline `Status: Ready to execute` after completion.** The state line now reads "Ready to execute" for plan 02, which is correct semantically (the orchestrator will spawn the next executor for plan 02). Just noting for awareness.
