---
name: brain-sync-code
description: Reconcile drift between intent blocks and generated code. Use when the user says "sync code", "reconcile drift", "apply drift fixes", "/brain:sync-code", or after running /brain:diff.
---

# brain-sync-code

Turn drift reports into actionable reconciliation proposals.

## Command

```
/brain:sync-code <scope> <target> [--apply]
```

Example:

```
/brain:sync-code brain types
/brain:sync-code brain types --apply
```

## How it works

1. Reads the existing drift report or re-runs the diff between intent blocks and generated code.
2. Generates one proposal file per drift item in `wiki/<scope>/ai-suggestions/sync-code/<target>/`.
3. Each proposal presents options: update intent or update code.
4. With `--apply`, code changes are written after interactive confirmation.

## Apply guardrails

- `--apply` only updates generated/target code files.
- Intent updates are never applied directly; use `/brain:revise` for those.
- `--apply` requires interactive mode (TUI or RPC with UI).
- No commits are created.

## Output

Proposals are AI suggestions; review them before applying. After applying code changes, run `/brain:diff` again to verify the drift is resolved.

## Related

- [wiki/brain/bets/brain-diff-drift-detection.md](../../../wiki/brain/bets/brain-diff-drift-detection.md)
- [wiki/brain/bets/brain-sync-code.md](../../../wiki/brain/bets/brain-sync-code.md)
