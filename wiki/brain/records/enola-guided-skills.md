---
kind: record
status: delivered
scope: brain
confidence: high
sources:
  - wiki/brain/adrs/enola-guided-skills.md
enola_intent:
  page:
    type: record
    status: delivered
    scope:
    - brain
    anchors:
    - repo: pi-brain
      path: wiki/brain/adrs/enola-guided-skills.md
---

# Record — Enola-guided pi-brain skills

## What changed

Integrated optional enola architecture intelligence into the skills that shape, investigate, revise, and groom intent. Enola remains fully optional and every skill degrades gracefully when enola is disabled or not installed.

## Affected skills

- `skills/brain-shape/SKILL.md` — consult enola impact/check before structural decisions.
- `skills/brain-investigate/SKILL.md` — use enola query/impact for root-cause analysis.
- `skills/brain-revise/SKILL.md` — use enola diff to detect architecture drift from original decisions.
- `skills/brain-diff/SKILL.md` — include architecture drift alongside code drift.
- `skills/brain-collaborate/SKILL.md` — tech-lead agent may use enola in multi-perspective reviews.
- `skills/brain-rfc-contribute/SKILL.md` — RFC reviewers may cite enola evidence.
- `skills/brain-groom/SKILL.md` — check enola citations and drift during grooming.
- `skills/brain-continue/SKILL.md` — check enola diff when resuming code-affecting work.
- `skills/brain-enola/SKILL.md` — updated config example, CI note, and cross-skill usage section.

## Verification

- `npm run validate` passes.
- `brain_links` reports 0 dead links / 0 orphans.
- `brain_enola_capture` reports no structural regressions.

## Related

- [wiki/brain/adrs/enola-guided-skills.md](../adrs/enola-guided-skills.md)
- [wiki/brain/adrs/optional-enola-integration.md](../adrs/optional-enola-integration.md)
- [wiki/brain/epics/enola-integration.md](../epics/enola-integration.md)
- [wiki/brain/ai-suggestions/refinement/integrate-enola-into-relevant-skills.md](../ai-suggestions/refinement/integrate-enola-into-relevant-skills.md)
