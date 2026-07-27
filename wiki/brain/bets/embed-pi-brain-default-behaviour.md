---
kind: bet
status: delivered
confidence: medium
appetite: big
prd: brain/prds/embed-pi-brain-default-behaviour.md
adr: brain/adrs/embed-pi-brain-default-behaviour.md
sources:
  - sources/doc/2026-07-27--pi-brain-embed-plan-md.md
---

# Bet — Embed pi-brain as default pi behaviour

## What we are betting on

We can make pi-brain install once as a global pi package and become the ambient memory layer for every pi session that has a brain home, without forking the harness, while keeping unrelated-repo sessions nearly free.

## Why now

- pi-brain has reached a stable `v0.2.0` with upstream sync, smarter autonomy, and guardrails in place.
- The extension API in pi now exposes every hook we need: `before_agent_start`, `session_start`, `resources_discover`, `pi.setActiveTools()`, and `session_before_compact`.
- The current clone-everything model is a distribution bottleneck; it prevents pi-brain from feeling like a default behaviour.
- A source plan exists with clear phases and a no-fork constraint, so the shape risk is bounded.

## Appetite

**Big.** We will ship this as a sequence of patch releases rather than one large release, but the total initiative spans multiple behavioural changes and a major documentation/model shift.

## Success looks like

### Whole-initiative success

- A fresh pi-brain clone contains no `.ts`, `skills/`, `prompts/`, `themes/`, `tools/templates/`, or `extensions/` directories.
- `/brain` renders and `brain_capture` works after `pi install @misabegovic/pi-brain` and a content-only clone.
- A session in a directory with no brain home pays approximately the same token cost as stock pi.
- A session with a brain home is brain-aware by default, without running `/brain:auto`.
- Existing clones migrate cleanly via `tools/migrate-clone.mjs` with `--dry-run` support.
- The final consolidation release is tagged `v0.3.0`.

### Per-phase release sequence

| Phase | Release | Exit criteria |
|-------|---------|---------------|
| 0 | v0.2.1 | Baseline fixtures committed; token-cost numbers recorded for brain-home-autonomy-on, brain-home-autonomy-off, and unrelated-repo. |
| 1 | v0.2.2 | `resolveResource` works; templates resolve from package; new clones are content-only; migration script round-trips on a copy of a real brain. |
| 2 | v0.2.3 | Global install loads in an unrelated directory; tool tiers active; unrelated-repo turn cost within ~2% of stock pi. |
| 3 | v0.2.4 | Tier-1 weave active for every brain-home session; `/brain:auto` still escalates meaningfully; tier-1 cost measured and under ~400 tokens. |
| 4 | v0.2.5 | Compaction harvest writes one batched inbox item per compaction; heuristic extraction produces acceptable noise over testing. |
| 5 | v0.2.6 *(optional)* | Constraint-gate and relevant-record prototypes exist behind feature flags; decision made on whether to keep, revise, or drop them. |
| 1.5 | v0.2.2-patch | `/brain:update` hybrid path: package update first, GitHub-fetch fallback; stub message retired once both paths are verified. |
| 6 | v0.3.0 | Extension refactored into `extensions/pi-brain/`; README/GETTING_STARTED rewritten for install-once model; tests extended. |

### Cut-loss signals

- `pi install` from a git ref does not load `skills`/`prompts`/`themes` from the `pi` manifest — this invalidates Phase 1's premise.
- A trivial turn in an unrelated repo costs meaningfully more than stock pi after Phase 2.
- Compaction harvest floods the inbox with junk and users stop reading it.
- Any phase cannot be rolled back by pinning the previous tag.

## Related

- [PRD — Embed pi-brain as default pi behaviour](../prds/embed-pi-brain-default-behaviour.md)
- [ADR — Embed pi-brain as default pi behaviour](../adrs/embed-pi-brain-default-behaviour.md)
- Source: [pi-brain embed plan](../../../sources/doc/2026-07-27--pi-brain-embed-plan-md.md)
