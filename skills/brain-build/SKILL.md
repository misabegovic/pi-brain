---
name: brain-build
description: Generate code from approved intent blocks. Use when the user says "build from intent", "generate code from spec", "/brain:build", or when an approved PRD/ADR contains data_model blocks.
---

# brain-build

Generate code from structured intent blocks in approved PRDs and ADRs.

## Command

```
/brain:build <scope> <target>
```

Example:

```
/brain:build brain types
```

## Supported targets

- `types` — TypeScript interfaces from `data_model` blocks.

## Intent block format

Add blocks to PRDs or ADRs using fenced code blocks with an `intent:<type>:<name>` info string:

```markdown
```intent:data_model:task
name: Task
fields:
  - name: id
    type: string
  - name: title
    type: string
  - name: completed
    type: boolean
```
```

## Output

Generated code is written to:

```
wiki/<scope>/ai-suggestions/build/<target>/generated.ts
```

Review the output before applying it. The generated file includes header comments citing the source PRDs/ADRs.

## Guardrails

- Only approved shelves (`prds/`, `adrs/`, `bets/`, `records/`) are scanned for intent blocks.
- Generated output is a suggestion, not a committed change.
- Always cite the source intent in generated files.
