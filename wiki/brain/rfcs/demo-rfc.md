---
kind: rfc
status: archived
confidence: low
scope: brain
---

# RFC — Demo: Should pi-brain ship a default TUI theme?

## Question

Should pi-brain include a warm, low-contrast default TUI theme so that new clones feel visually cohesive out of the box?

## Context

- `themes/pi-brain.json` already exists and is referenced in documentation.
- The current theme is described as warm and low-contrast, but it is not automatically activated for new clones.
- Other pi extensions often ship with a default theme that users can override.

## Options

1. **Ship the theme as default.** New pi-brain clones activate `pi-brain.json` automatically unless the user chooses another theme.
2. **Keep it optional.** Document the theme but do not activate it automatically; users opt in via `brain.config.yml`.
3. **Do nothing.** Leave theme management entirely to the user.

## Contributions

### human — 2026-07-29

Demo human contribution: I lean toward option 2. A default theme is nice, but automatically changing pi's appearance in an existing project could surprise users. Making it a one-line opt-in in `brain.config.yml` feels safer.

### 2026-07-29 — agent (brain-tech-lead)

**Task:** Add a short agent perspective: which option best balances user surprise with onboarding delight, and what guardrails would you add?

Agent perspective (simulated via `/brain:rfc-contribute brain demo-rfc brain-tech-lead "..."`):

Option 2 is the right default. A TUI theme is a presentation-layer concern, and pi-brain's core value is knowledge management, not visual design. Automatically changing the terminal appearance in an existing project creates a "who moved my cheese" moment and can conflict with a user's existing theme or accessibility setup.

Guardrails I would add:
- `brain.config.yml` has an explicit `theme:` field that defaults to `none`.
- `brain:setup` asks the user whether to activate the bundled theme.
- The bundled theme is documented as a one-line opt-in, not a default.
- If we ever make it default-on, do so in a major version with release notes.

