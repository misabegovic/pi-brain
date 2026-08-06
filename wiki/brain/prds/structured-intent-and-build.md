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

# PRD — Structured intent and `/brain:build`

## Problem

pi-brain intent artifacts (PRDs, ADRs, bets, records) are prose documents. The agent can read and reason from them, but it cannot reliably generate or update code from them because the intent is not machine-readable. This forces the agent to re-interpret intent every implementation and makes drift invisible.

The regenerative-intent vision requires intent to be the source of truth from which code can be derived.

## Appetite

Medium. One focused build phase: define a structured intent block format, update templates, and prove code generation for one target (TypeScript types from data models).

## Solution

Add machine-readable **intent blocks** to PRDs and ADRs, and a `/brain:build` command that turns those blocks into code.

### Intent blocks

Blocks are YAML sections inside markdown code fences with a special marker. They live alongside prose and are extracted by the extension.

Supported block types in this bet:

- `data_model` — defines types/schemas.
- `api_surface` — defines functions/endpoints.
- `behavior` — defines operations/workflows.
- `invariant` — defines rules/constraints.

Example in a PRD:

```markdown
## Data model

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

### `/brain:build`

Command: `/brain:build <scope> <target>`

Example: `/brain:build brain types`

Behavior:
1. Collect approved PRDs/ADRs in scope.
2. Extract intent blocks of the requested target type.
3. Render blocks through a target-specific template.
4. Write generated output to a temporary/draft location:
   - For repo-agnostic clones: `ai-suggestions/build/<scope>/<target>/`
   - For converted clones: `files/<path>` as a draft edit, not committed.
5. Cite the source PRD/ADR in generated file headers.

### First target: TypeScript data models

The first proof target generates TypeScript interfaces from `data_model` blocks.

```intent:data_model:intent_block
name: IntentBlock
fields:
  - name: type
    type: string
    description: Block type (data_model, api_surface, behavior, invariant)
  - name: name
    type: string
    description: Stable identifier for the block
  - name: source
    type: string
    description: Path to the source PRD/ADR
  - name: data
    type: json
    description: Parsed block payload
```

Example output:

```typescript
// Generated from wiki/brain/prds/example.md
// Do not edit manually; run /brain:build brain types

export interface Task {
  id: string;
  title: string;
  completed: boolean;
}
```

## No-gos

- No multi-language support in this bet (only TypeScript types).
- No auto-commit or auto-merge.
- No bidirectional sync from code back to intent (that's `/brain:diff`).
- No generation from prose-only PRDs; structured blocks are required.
- No replacement of human `/brain:shape` — build output is a suggestion.

## Rabbit holes

- Inventing a full schema language or DSL.
- Trying to generate perfect code from partial intent.
- Supporting every possible TypeScript feature in v1.

## Related

- [wiki/brain/epics/regenerative-intent.md](../epics/regenerative-intent.md)
- [wiki/brain/bets/autonomous-refinement-protocol.md](../bets/autonomous-refinement-protocol.md)
- [wiki/brain/bets/multi-agent-intent-collaboration.md](../bets/multi-agent-intent-collaboration.md)
- [wiki/brain/constraints/adr-before-structural-changes.md](../constraints/adr-before-structural-changes.md)
