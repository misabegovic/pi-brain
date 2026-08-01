---
kind: decision
status: accepted
confidence: high
sources:
  - wiki/brain/adrs/optional-enola-integration.md
  - wiki/brain/ai-suggestions/refinement/integrate-enola-into-relevant-skills.md
---

# ADR — Enola-guided pi-brain skills

## Context

pi-brain has an optional enola architecture-intelligence integration (source: `wiki/brain/adrs/optional-enola-integration.md`). Today enola is used as:

- a gate on `/brain:build` and `/brain:sync-code`,
- a capture source in the autonomous refinement protocol,
- an on-demand command/tool for checks, baselines, drift, and impact.

Shaping, investigation, revision, and grooming decisions are often made without direct reference to the current architecture graph. This can lead to intent that contradicts the codebase (e.g., proposing a module split that ignores a high-coupling hotspot) or missing opportunities to cite architectural evidence.

## Decision

Integrate optional enola intelligence into the skills that shape, investigate, revise, and groom intent. Enola remains **opt-in**; every skill must degrade gracefully when enola is disabled, unconfigured, or not installed.

### Skills affected

1. **`brain-shape`**
   - Before drafting structural ADRs/PRDs, consult `/brain:enola-impact <module>` and `/brain:enola-check`.
   - Include enola-derived evidence in the "Consequences" or "Alternatives" sections.

2. **`brain-investigate`**
   - Use `/brain:enola-query` and `/brain:enola-impact` to locate coupling hotspots and god classes related to the question.

3. **`brain-revise`**
   - Run `/brain:enola-diff` to see if the codebase has drifted from the original decision's architecture assumptions.

4. **`brain-diff`**
   - Optionally compare enola receipts before and after a change set alongside code drift.

5. **`brain-collaborate` / `brain-rfc-contribute`**
   - Contributor agents may run enola queries and cite receipts in their reviews.

6. **`brain-groom`**
   - Run `/brain:enola-citations` to flag stale architecture citations.
   - Suggest re-baselining receipts when drift is detected.

7. **`brain-continue`**
   - Resume shaping/build tasks with current enola status in context.

### Implementation guardrails

- Each skill checks `enola.enabled` in `brain.config.yml` and catches missing binary/config.
- No skill fails because enola is unavailable.
- Any architecture claim in a wiki artifact cites the receipt: `enola receipt <repo> sha256:<digest> @ <commit>, <date>`.

## Alternatives considered

1. **Keep enola only for build/sync-code gates.**
   - Pros: Simpler, less skill surface to maintain.
   - Cons: Missed opportunity to ground intent in architecture; decisions remain hand-wavy.

2. **Make enola mandatory for structural shaping.**
   - Pros: Stronger guarantee that ADRs cite architecture.
   - Cons: Violates the optional-enola constraint; breaks clones that do not install enola.

3. **Add a separate `brain-architecture` skill instead of wiring into existing skills.**
   - Pros: Clean separation of concerns.
   - Cons: Humans would need to remember to invoke it; existing workflows would not naturally include it.

4. **Do nothing.**
   - Pros: Zero change.
   - Cons: Architecture drift and coupling hotspots continue to be discovered late.

## Consequences

- Shaping and investigation become evidence-based when enola is present.
- Skill prompts grow slightly; must keep them concise and avoid over-reliance on enola.
- More wiki artifacts will contain enola receipt citations, increasing the value of `/brain:enola-citations`.
- No required runtime dependency is added.

## Related

- [wiki/brain/adrs/optional-enola-integration.md](optional-enola-integration.md)
- [wiki/brain/epics/enola-integration.md](../epics/enola-integration.md)
- `skills/brain-enola/SKILL.md`
- [wiki/brain/ai-suggestions/refinement/integrate-enola-into-relevant-skills.md](../ai-suggestions/refinement/integrate-enola-into-relevant-skills.md)
