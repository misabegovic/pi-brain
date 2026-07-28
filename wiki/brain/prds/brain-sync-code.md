---
kind: initiative
status: living
confidence: low
appetite: medium
team: brain
repos: [brain]
---

# PRD — `/brain:sync-code` reconciliation

## Problem

`/brain:diff` detects drift between intent blocks and code, but it only reports. Users still have to manually decide whether to update the intent block or regenerate the code. This breaks the regenerative loop and leaves drift unresolved.

## Appetite

Medium. One focused build phase: add a reconciliation command that turns drift reports into concrete, reviewable proposals.

## Solution

Add `/brain:sync-code <scope> <target>` that reads drift and produces reconciliation proposals.

### Modes

- **Propose (default):** Write reconciliation proposals to `ai-suggestions/sync-code/<target>/`.
- **Apply (`--apply`):** Apply code changes directly, but only after user approval in interactive mode.

### Reconciliation actions

For each drift item:

1. **Missing in code** — propose regenerating the missing declaration from intent.
2. **Extra in code** — propose either:
   - Adding the missing field to intent (if it should have been specified).
   - Removing the extra declaration from code (if it is stale).
3. **Type mismatch** — propose either:
   - Update intent block type.
   - Update code type.
4. **Optional mismatch** — propose aligning optionality in intent or code.

### Proposal format

Each proposal is a file in `wiki/<scope>/ai-suggestions/sync-code/<target>/<id>.md`:

```markdown
# Sync proposal for IntentBlock

## Drift
Field `IntentBlock.type` type differs: intent=string, code=IntentBlockType.

## Options

### Option A — Update intent
Change intent block `IntentBlock` field `type` from `string` to `IntentBlockType`.

### Option B — Update code
Change generated code field `type` from `IntentBlockType` to `string`.

## Recommended
Option A.

## Source
wiki/brain/prds/structured-intent-and-build.md
```

### Apply behavior

When `--apply` is used:
- Code changes are written to the target location.
- Intent changes are written as revision proposals, not applied directly to approved shelves.
- A summary is captured in the inbox.

## No-gos

- No auto-rewrite of approved intent shelves.
- No auto-commit.
- No applying changes without interactive approval.
- No handling of non-structural drift (business logic changes).

## Rabbit holes

- Building a full three-way merge engine.
- Auto-resolving every mismatch.
- Supporting arbitrary file formats in v1.

## Related

- [wiki/brain/epics/regenerative-intent.md](../epics/regenerative-intent.md)
- [wiki/brain/bets/brain-diff-drift-detection.md](../bets/brain-diff-drift-detection.md)
- [wiki/brain/bets/structured-intent-and-build.md](../bets/structured-intent-and-build.md)
- [wiki/brain/constraints/adr-before-structural-changes.md](../constraints/adr-before-structural-changes.md)
