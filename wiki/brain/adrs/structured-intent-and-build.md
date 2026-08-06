---
kind: decision
status: accepted
confidence: low
enola_intent:
  page:
    type: decision
    status: accepted
---

# ADR — Structured intent and `/brain:build`

## Context

The `regenerative-intent` epic requires code to be derivable from intent. Current PRDs and ADRs are prose-only. We need a machine-readable representation of intent that:
- Lives alongside human-readable prose.
- Is simple to write and review.
- Can be extracted and rendered into code by the extension.

We also need a decision on the first build target and where generated code lands.

## Decision

pi-brain will use **YAML intent blocks inside markdown code fences** as the structured intent format. The first build target will be **TypeScript interfaces from `data_model` blocks**. Generated output lands in a draft location, never auto-committed.

### Intent block format

Blocks use a fenced code block with an `intent:<type>:<name>` info string:

```markdown
```intent:data_model:task
name: Task
fields:
  - name: id
    type: string
```
```

The extension extracts these blocks by scanning markdown files.

### Block types in this bet

- `data_model` — types/schemas with fields and primitive types.
- `api_surface` — reserved for future build targets; parsed but not generated in v1.
- `behavior` — reserved for future build targets.
- `invariant` — reserved for future build targets.

### Build command

`/brain:build <scope> <target>`

- `<scope>` is an active repo or `brain`/`org`.
- `<target>` selects the renderer. First target: `types`.

### Output location

- Repo-agnostic clones: `wiki/<scope>/ai-suggestions/build/<target>/` as draft files.
- Converted clones: `files/<path>` as draft edits, requiring explicit approval before commit.

### Traceability

Generated files include:
- A header comment citing the source PRD/ADR.
- A list of intent block names used.

## Alternatives considered

1. **Separate YAML files for intent.** Keep structured intent in `intent/<scope>/<artifact>.yaml` and prose in `wiki/`.
   - *Rejected:* splits intent across locations; harder to keep in sync.

2. **Frontmatter-only structured intent.** Put machine-readable fields in YAML frontmatter.
   - *Rejected:* frontmatter is too constrained for nested data models and behaviors.

3. **Inline annotations in prose.** Mark up prose with `@data_model` tags.
   - *Rejected:* fragile to parse; mixes authoring and machine concerns.

4. **YAML blocks inside markdown code fences.** (Chosen.)
   - *Pros:* keeps intent and prose together, familiar authoring experience, easy to extract, renders safely in markdown viewers.
   - *Cons:* requires discipline to maintain blocks; risk of drift between blocks and prose.

## Consequences

- PRD/ADR templates need intent block examples.
- `/brain:build` becomes the first regenerative code feature.
- Future build targets (API clients, tests) can reuse the same block extraction and renderer plumbing.
- Drift detection (`/brain:diff`) can compare generated files against their source blocks.

## Related

- [wiki/brain/prds/structured-intent-and-build.md](../prds/structured-intent-and-build.md)
- [wiki/brain/bets/structured-intent-and-build.md](../bets/structured-intent-and-build.md)
- [wiki/brain/epics/regenerative-intent.md](../epics/regenerative-intent.md)
- [wiki/brain/adrs/autonomous-refinement-protocol.md](../adrs/autonomous-refinement-protocol.md)
- [wiki/brain/adrs/multi-agent-intent-collaboration.md](../adrs/multi-agent-intent-collaboration.md)
- [wiki/brain/constraints/adr-before-structural-changes.md](../constraints/adr-before-structural-changes.md)
