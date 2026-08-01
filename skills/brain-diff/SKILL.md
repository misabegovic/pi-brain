---
name: brain-diff
description: Detect drift between intent blocks and generated/target code. Use when the user says "diff", "drift", "check alignment", "/brain:diff", or after /brain:build output has been applied to a repo.
---

# brain-diff

Detect when code has diverged from approved intent blocks.

## Command

```
/brain:diff <scope> <target>
```

Example:

```
/brain:diff brain types
```

## How it works

1. Reads approved PRDs/ADRs in scope and extracts `data_model` blocks.
2. Regenerates the expected TypeScript interfaces.
3. Loads the existing generated file at `wiki/<scope>/ai-suggestions/build/<target>/generated.ts`.
4. Compares names, fields, types, and optionality.
5. Writes a drift report to `wiki/<scope>/ai-suggestions/drift/<target>.md`.

## Report categories

- **Missing in code** — declarations in intent but not in code.
- **Extra in code** — declarations in code but not in intent.
- **Type mismatch** — same field name but different type.
- **Optional mismatch** — optionality differs.

## Output rules

- Drift reports are suggestions; they live in `ai-suggestions/drift/`.
- Do not auto-rewrite intent or code based on a drift report.

## Enola guidance (optional)

If enola is enabled, run `brain_enola` with `operation: "diff"` to detect architecture drift alongside code drift. Include architecture deltas in the report when relevant. Skip silently if enola is unavailable.
- High-risk or ambiguous drift should be captured as an inbox task.

## Related

- [wiki/brain/bets/structured-intent-and-build.md](../../../wiki/brain/bets/structured-intent-and-build.md)
- [wiki/brain/bets/brain-diff-drift-detection.md](../../../wiki/brain/bets/brain-diff-drift-detection.md)
