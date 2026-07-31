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

1. **Automatic checks before code generation.** ✅
   - `/brain:build` and `/brain:sync-code` run the configured enola check command first when enabled.
   - If a structural regression is detected, surface it and ask whether to proceed.

2. **Architecture-aware shaping and investigation.** ✅
   - `/brain:enola-impact <symbol>` and `brain_enola` `impact` operation show impact radius.
   - `/brain:enola-query <term>` searches enola output.
   - Intent artifacts can cite architectural constraints from enola output.

3. **Autonomous refinement protocol integration.** ✅
   - The refinement protocol prompt mentions `brain_enola_capture`.
   - New architectural regressions are captured as ai-suggestions.

4. **Baseline lifecycle management.** ✅
   - `/brain:enola-baseline` is exposed and documented.
   - `enola.auto_baseline` re-pins the baseline after `/brain:build` or `/brain:sync-code --apply`.

5. **Configuration and onboarding.** ✅
   - CLI-agnostic configuration via `enola.check_args`, `enola.baseline_args`, etc.
   - Setup instructions added to `GETTING_STARTED.md` and `skills/brain-enola/SKILL.md`.
   - Helpful error messages when enola is disabled or not installed.

6. **CI/PR integration.** ✅
   - `.github/workflows/enola.yml` is opt-in and gated on `enola.config.yml`.
   - PR template references enola check results.

7. **Testing.** ✅
   - `tests/enola.test.ts` covers disabled/enabled config paths, gate check, capture, impact, and custom args.

## Out of scope

- Replacing enola with a custom analyzer.
- Making enola a required dependency.
- Architecture auto-fix (only detection and reporting in v0.4.0).

## Acceptance

- `brain_enola` tool supports `check`, `baseline`, `query`, and `impact` with stable output.
- `/brain:build` and `/brain:sync-code` optionally gate on enola check when configured.
- `enola.auto_baseline` re-pins the baseline after successful code generation/apply.
- `brain_enola_capture` surfaces regressions as ai-suggestions.
- Autonomous refinement protocol mentions enola capture.
- CLI args are configurable to support different enola variants.
- CI workflow is opt-in and documented.
- Documentation and skill cover setup, configuration, and common workflows.
- `npm run validate` passes; 0 dead links; 0 orphans.

## Related

- [wiki/brain/adrs/optional-enola-integration.md](../adrs/optional-enola-integration.md)
- [wiki/brain/records/optional-enola-integration.md](../records/optional-enola-integration.md)
- `skills/brain-enola/SKILL.md`
- [wiki/brain/records/version-0-3-3.md](../records/version-0-3-3.md)
