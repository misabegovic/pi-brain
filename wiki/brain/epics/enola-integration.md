---
kind: epic
status: accepted
confidence: high
appetite: 2 weeks
---

# Epic — Full enola integration for pi-brain v0.4.0

## Goal

Make enola a first-class architectural intelligence layer inside pi-brain. By v0.4.0, pi-brain should be able to understand, baseline, check, and reason about the structure of any configured target repository before, during, and after code generation.

## Problem

pi-brain can generate and sync code from intent, but it has no built-in awareness of whether a change improves or harms the target repo's architecture. Agents can accidentally introduce dependency cycles, tighten coupling, or violate module boundaries. These regressions are invisible to tests and linters and expensive to fix later.

## Approach

Build on the optional enola integration introduced in v0.3.3 (PR #68). Expand it from a standalone tool into a workflow participant:

1. **Automatic checks before code generation.**
   - `/brain:build` and `/brain:sync-code` run `enola check` first when enabled.
   - If a structural regression is detected, surface it and ask whether to proceed.

2. **Architecture-aware shaping and investigation.**
   - `/brain:investigate` and `/brain:shape` can query enola for dependency graphs, impact radius, and module boundaries.
   - Intent artifacts can cite architectural constraints from enola output.

3. **Autonomous refinement protocol integration.**
   - The refinement protocol can enqueue periodic `enola check` tasks.
   - New architectural regressions become inbox items or ai-suggestions.

4. **Baseline lifecycle management.**
   - `/brain:enola-baseline` is exposed and documented.
   - Baselines can be pinned automatically after successful merges.
   - A baseline diff is included in PR records.

5. **Configuration and onboarding.**
   - Provide an `enola.config.yml` template.
   - Add setup instructions to `GETTING_STARTED.md` and `skills/brain-enola/SKILL.md`.
   - Support enola installation detection and helpful error messages.

6. **CI/PR integration.**
   - `.github/workflows/enola.yml` is production-ready and documented.
   - PR template references enola check results.

7. **Testing and dogfooding.**
   - Run enola on pi-brain itself and commit a baseline.
   - Add integration tests that mock enola CLI output.

## Out of scope

- Replacing enola with a custom analyzer.
- Making enola a required dependency.
- Architecture auto-fix (only detection and reporting in v0.4.0).

## Acceptance

- `brain_enola` tool supports `check`, `baseline`, and `query` with stable output.
- `/brain:build` and `/brain:sync-code` optionally gate on enola check when configured.
- Autonomous refinement protocol can enqueue enola checks.
- CI workflow runs green on pi-brain itself when `enola.config.yml` is present.
- Documentation and skill cover setup, configuration, and common workflows.
- `npm run validate` passes; 0 dead links; 0 orphans.

## Related

- [wiki/brain/adrs/optional-enola-integration.md](../adrs/optional-enola-integration.md)
- [wiki/brain/records/optional-enola-integration.md](../records/optional-enola-integration.md)
- `skills/brain-enola/SKILL.md`
- [wiki/brain/records/version-0-3-3.md](../records/version-0-3-3.md)
