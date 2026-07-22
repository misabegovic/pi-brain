---
kind: decision
status: accepted
confidence: medium
---

# ADR — Stronger default guardrails against eager implementation

## Context

In a user session in another pi-brain clone, the agent implemented structural repo changes before an ADR was approved. The user had to retroactively move an AI-suggested ADR to the approved shelf, add a `must` constraint, and tighten `AGENTS.md`. They then asked the pi-brain product template to ship stronger defaults so the failure mode is harder to hit.

The pi-brain template warned against autonomous implementation but did not ship a default constraint or explicit "stop and shape" language for structural changes. This made the breach easy.

## Decision

pi-brain ships with default guardrails that make agents pause and route structural/repo changes through `/brain:shape` instead of executing them directly. The guardrails are visible in three places:

1. **AGENTS.md** — explicit "do not execute" language for structural changes and a default checklist before any repo mutation.
2. **Default constraints** — a shipped `must` constraint requiring an approved ADR before structural changes to the brain home or target repos. `brain:setup` creates it in new clones.
3. **Skill/prompt reinforcement** — `brain`, `brain-shape`, and `brain-setup` skills repeat the rule, and the `/brain-home` prompt surfaces it at session start.

The default constraint applies to the brain home and to any repo the brain maintains. It can be retired if a project explicitly agrees it no longer applies.

## Alternatives considered

1. **Do nothing.** Leave each clone owner to add constraints after a breach.
   - Rejected: it repeats the observed failure in every new clone.
2. **Tighten AGENTS.md only.** Add strong language but no default constraints.
   - Rejected: constraints are the concrete check during `/brain:shape`; without a default file, the agent has nothing to enforce.
3. **Extension-level enforcement.** Add code to `extensions/pi-brain.ts` that detects structural edits and warns/blocks.
   - Rejected for now: hard to implement reliably and risk of false positives. Revisit if softer guardrails prove insufficient.

## Consequences

- New pi-brain clones inherit a `must` constraint and stop-by-default behavior.
- Agents are expected to say "this looks structural; let's shape it first" rather than edit files.
- The template becomes more opinionated, which matches its goal of being reliable working memory.
- Existing clones upgrading to the new template can adopt or retire the new constraints.

## Related

- [sources/brain/feedback/eager-implementation-session-snippet.md](../../../../sources/brain/feedback/eager-implementation-session-snippet.md)
- [wiki/brain/feedback/eager-implementation-contract-breach.md](../../feedback/eager-implementation-contract-breach.md)
- [wiki/brain/constraints/adr-before-structural-changes.md](../../constraints/adr-before-structural-changes.md)
- [AGENTS.md](../../../../AGENTS.md)
- [skills/brain/SKILL.md](../../../../skills/brain/SKILL.md)
- [skills/brain-shape/SKILL.md](../../../../skills/brain-shape/SKILL.md)
- [skills/brain-setup/SKILL.md](../../../../skills/brain-setup/SKILL.md)
- [prompts/brain-home.md](../../../../prompts/brain-home.md)
