---
kind: decision
status: accepted
confidence: medium
---

# ADR — Optional enola architecture intelligence integration

## Context

pi-brain helps agents maintain intent and generate code for target repositories. As target repos grow, agents can introduce structural regressions — dependency cycles, unexpected coupling, module boundary violations — that tests and linters do not catch. [enola](https://github.com/enola-labs/enola) is an architectural regression testing tool that extracts a deterministic code graph, pins a baseline, and reports structural deltas after a change.

We need a decision on whether and how to integrate enola without making it a hard dependency or breaking existing users.

## Decision

pi-brain will offer an **optional** enola integration. It is enabled per brain clone via `brain.config.yml` and is invisible when disabled.

### What is provided

- `brain_enola` tool with operations: `check`, `baseline`, `query`.
- `brain_enola_capture` tool to run a check and save regressions as an ai-suggestion.
- Commands: `/brain:enola-status`, `/brain:enola-check`, `/brain:enola-capture`, `/brain:enola-baseline`, `/brain:enola-query <term>`.
- `readEnolaConfig()` reads `enola.enabled`, `enola.target_repo`, `enola.binary`, `enola.gate_build`, and `enola.gate_sync_code` from `brain.config.yml`.
- Optional gates: `/brain:build` and `/brain:sync-code` can run `enola check` first and block on structural regressions when configured.
- A GitHub Actions workflow `.github/workflows/enola.yml` that only runs when `enola.config.yml` is present in the repo root.
- A skill `skills/brain-enola/SKILL.md` documenting the integration.

### Why optional?

- Not all pi-brain users need architecture intelligence.
- enola is a separate binary; requiring it would complicate installation.
- Keeping it opt-in preserves pi-brain's local-first, minimal-dependency character.

### Why enola?

- It answers a question pi-brain currently cannot: "what did this change do to the structure of the system?"
- It integrates with agents via CLI and MCP, fitting pi-brain's tool-based model.
- Its baseline/delta model aligns with pi-brain's intent-as-living-substrate philosophy.

## Alternatives considered

1. **No enola integration.**
   - *Rejected:* misses an opportunity to help users catch structural regressions at the moment they're cheap to fix.

2. **Mandatory enola dependency.**
   - *Rejected:* adds installation friction and breaks users who do not want or need it.

3. **Build our own architecture graph analyzer.**
   - *Rejected:* reinvents a specialized tool; enola already does this well and is actively maintained.

## Consequences

- Users can enable enola when they want architecture regression detection.
- The integration adds no runtime dependency on enola in package.json.
- CI for pi-brain itself can opt into enola by adding `enola.config.yml`.
- Future work could wire enola into `/brain:build` and `/brain:sync-code` as an automatic pre-check.

## Related

- [wiki/brain/records/optional-enola-integration.md](../records/optional-enola-integration.md)
- `skills/brain-enola/SKILL.md`
- https://github.com/enola-labs/enola
