---
title: Integrate optional enola intelligence into relevant pi-brain skills
kind: refinement
status: closed
confidence: high
source: enola optional integration + skill architecture
---

# Integrate optional enola intelligence into relevant pi-brain skills

## Proposal

Extend enola from a build/sync-code gate and autonomous-refinement capture tool into a first-class input for skills that shape, investigate, revise, and groom intent. Enola remains **optional**: each skill checks `enola.enabled` (or catches missing binary/config) and degrades gracefully.

## Skills that should consult enola

1. **`brain-shape`**
   - Before drafting an ADR/PRD, run `/brain:enola-impact <proposed-module>` to see blast radius.
   - When proposing a structural change, run `/brain:enola-check` to confirm no new regressions.
   - Include enola insights in the "Alternatives" or "Consequences" section.

2. **`brain-investigate`**
   - Use `/brain:enola-query <symbol-or-module>` and `/brain:enola-impact <symbol>` to find coupling hotspots related to the bug/risk.
   - Surface god classes and complexity outliers as evidence.

3. **`brain-revise`**
   - When revising an ADR/PRD, re-run `/brain:enola-diff` to see if the codebase has drifted from the original decision's assumptions.
   - Flag revisions that touch high-coupling modules.

4. **`brain-diff`**
   - Add an optional architecture-diff mode that compares enola receipts before/after a change set.
   - Surface alongside code drift.

5. **`brain-collaborate`** / **`brain-rfc-contribute`**
   - Let contributor agents run enola queries to ground their reviews in current architecture.
   - Require/encourage citations like `enola receipt <repo> sha256:... @ <commit>`.

6. **`brain-groom`**
   - During grooming, run `/brain:enola-citations` to find stale architecture citations.
   - Suggest re-baselining receipts if drift is detected.

7. **`brain-continue`**
   - When continuing a build or shaping task, include current enola status in context.

## Implementation sketch

- Add a small helper `withEnola<T>(home, enabled, fn)` that only runs `fn` when enola is enabled and installed.
- Update each skill's `SKILL.md` with enola prompts/commands.
- Update `extensions/pi-brain/refinement.ts` prompt to mention the shape/investigate enola hooks.
- Add a `brain_enola` tool call pattern in the skill docs (not new code, just conventions).

## Guardrails

- Enola must stay optional: no required runtime dependency.
- Skills must not fail if enola is disabled or missing.
- Any enola-derived claim in a wiki artifact must cite the receipt (`enola receipt <repo> ...`).

## Acceptance

- Relevant skill docs updated.
- Example: running `/brain:shape` on a structural change suggests `/brain:enola-impact` when enola is enabled.
- `npm run validate` passes; corpus stays link-clean.
