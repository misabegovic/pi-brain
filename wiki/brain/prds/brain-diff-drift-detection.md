---
kind: initiative
status: living
confidence: low
appetite: medium
team: brain
repos: [brain]
enola_intent:
  page:
    type: initiative
    status: living
---

# PRD — `/brain:diff` drift detection

## Problem

pi-brain can now generate code from intent via `/brain:build`, but once the code is applied to a target repo, it drifts. Manual edits, refactors, and bug fixes change the code without updating the spec. The brain loses track of whether the code still reflects the intent.

Users need a way to detect when code has diverged from the approved intent and decide what to do about it.

## Appetite

Medium. One focused build phase: compare generated intent-derived code against actual target repo code and surface differences.

## Solution

Add a `/brain:diff <scope> <target>` command that detects drift between intent and code.

### Inputs

- Approved intent blocks in `wiki/<scope>/{prds,adrs,bets,records}/`.
- Existing generated code in `wiki/<scope>/ai-suggestions/build/<target>/` (for repo-agnostic clones).
- Actual code in the target repo (for onboarded or converted repos).

### Behavior

1. Regenerate the expected code from intent blocks using the same renderer as `/brain:build`.
2. Load the actual code from the target location.
3. Compute a structural diff (not just text-line diff):
   - Missing types/functions/interfaces.
   - Extra fields or methods not in intent.
   - Type mismatches.
   - Missing invariants or constraints.
4. Produce a drift report in `wiki/<scope>/ai-suggestions/drift/<target>.md` or the inbox.

### Output format

```markdown
# Drift report — brain/types

## Matched
- IntentBlock `IntentBlock` → `generated.ts` ✓

## Missing in code
- IntentBlock `Task` has no generated interface.

## Divergent
- `IntentBlock.type` is `string` in intent but `IntentBlockType` in code.

## Recommended actions
- Update intent block to match code.
- Regenerate code from intent.
- Capture an inbox task for manual review.
```

### `/brain:sync-code` (future, not this bet)

A later bet will add `/brain:sync-code` to reconcile drift automatically. This bet only detects and reports.

## No-gos

- No auto-rewrite of intent or code in this bet.
- No support for arbitrary file formats beyond TypeScript in v1.
- No semantic understanding of business logic; focus on structural signatures.

## Rabbit holes

- Building a full semantic diff engine.
- Trying to detect drift in prose-only PRDs.
- Auto-applying fixes without approval.

## Related

- [wiki/brain/epics/regenerative-intent.md](../epics/regenerative-intent.md)
- [wiki/brain/bets/structured-intent-and-build.md](../bets/structured-intent-and-build.md)
- [wiki/brain/constraints/adr-before-structural-changes.md](../constraints/adr-before-structural-changes.md)
