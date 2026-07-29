---
title: "Wrap, Don't Replace: pi-brain Overrides of Basic pi Tools"
scope: brain
kind: adr
status: accepted
confidence: low
sources:
  - AGENTS.md
  - sources/pi-tool-wrapper-override-request.md
created: 2026-07-27
updated: 2026-07-27
author: pi-brain-agent
---

## Context

pi-brain extends the pi coding agent with brain-specific tools and commands registered through `extensions/pi-brain/`. A future improvement may require pi-brain to override or augment basic pi tools such as file read/write, command execution, or search. Replacing these tools outright would strip the agent of capabilities pi depends on and break the clone-as-substrate model (source: AGENTS.md).

## Decision

If pi-brain overrides basic tooling provided by the pi coding agent, it **MUST** wrap those tools rather than replace them.

1. **Preserve the base contract.** The wrapper exposes the same inputs, outputs, and failure modes as the underlying pi tool.
2. **Add brain behavior, don't remove agent behavior.** Wrappers may prepend/append pi-brain concerns — source capture, citation, confidence tracking, sync hooks — but the original action must still execute.
3. **Keep the base tool reachable.** The wrapper delegates to the original implementation; the original remains available if the wrapper is bypassed.
4. **Fail open.** If a brain-specific hook cannot run, the base operation still completes and the failure is surfaced as a warning, not a blocker.

## Consequences

- **Positive:** pi-brain clones remain portable and self-contained.
- **Positive:** Upgrading pi does not silently break basic agent capabilities.
- **Negative:** Wrappers add indirection and must be maintained when pi tool contracts change.
- **Negative:** Small runtime overhead per wrapped call.

## Related

- `AGENTS.md`
- (source: sources/pi-tool-wrapper-override-request.md)
- `extensions/pi-brain/tool-wrapper.ts`
