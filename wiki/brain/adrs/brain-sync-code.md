---
kind: decision
status: accepted
confidence: low
enola_intent:
  page:
    type: decision
    status: accepted
---

# ADR — `/brain:sync-code` reconciliation

## Context

`/brain:diff` surfaces drift between intent and code. The next step is reconciliation: deciding whether to update intent or code and producing actionable proposals.

## Decision

pi-brain will add `/brain:sync-code <scope> <target>` that:

1. Reads the drift report (or re-runs the diff).
2. Generates one or more reconciliation proposals per drift item.
3. Writes proposals to `ai-suggestions/sync-code/<target>/`.
4. With `--apply`, applies code changes after interactive approval; intent changes are still proposed as revisions, not applied directly.

### Reconciliation options

For each drift item, generate options:

- Missing in code → regenerate code.
- Extra in code → add to intent OR remove from code.
- Type mismatch → update intent OR update code.
- Optional mismatch → update intent OR update code.

The command recommends one option based on a simple heuristic: prefer updating code when intent is newer, prefer updating intent when code has clearly evolved.

### Apply guardrails

- `--apply` only affects generated/target code files, not approved intent shelves.
- Intent updates go through the existing `/brain:revise` proposal flow.
- No commits are created.
- In non-TUI mode, `--apply` is rejected.

## Alternatives considered

1. **Auto-apply all drift fixes silently.**
   - *Rejected:* too risky; intent should remain authoritative and human-approved.

2. **Only update intent; never touch code.**
   - *Rejected:* incomplete; the user may want code regenerated from updated intent.

3. **Three-way merge with full conflict resolution.**
   - *Rejected:* too complex for v1; proposals are simpler and safer.

4. **Proposal-first with optional code apply.** (Chosen.)
   - *Pros:* keeps human in the loop, preserves intent authority, completes the loop.
   - *Cons:* requires user to review proposals; acceptable trade-off.

## Consequences

- Users can resolve drift without manual diffing.
- The build/diff/sync loop becomes a closed regenerative cycle.
- Future work can add heuristics to auto-apply low-risk code regenerations.

## Related

- [wiki/brain/prds/brain-sync-code.md](../prds/brain-sync-code.md)
- [wiki/brain/bets/brain-sync-code.md](../bets/brain-sync-code.md)
- [wiki/brain/epics/regenerative-intent.md](../epics/regenerative-intent.md)
- [wiki/brain/adrs/structured-intent-and-build.md](../adrs/structured-intent-and-build.md)
- [wiki/brain/adrs/brain-diff-drift-detection.md](../adrs/brain-diff-drift-detection.md)
- [wiki/brain/constraints/adr-before-structural-changes.md](../constraints/adr-before-structural-changes.md)
