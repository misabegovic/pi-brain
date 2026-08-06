---
title: Learn from projects/tt/brain enola integration and strengthen pi-brain's
kind: refinement
status: closed
confidence: high
source: comparison with projects/tt/brain enola architecture-graph substrate
enola_intent:
  page:
    type: refinement
    status: closed
---

# Learn from projects/tt/brain enola integration and strengthen pi-brain's

## Observation

pi-brain now has an optional enola integration (tool, commands, build/sync-code gates, auto-baseline, capture). `projects/tt/brain` has a more mature enola integration called the "architecture-graph substrate". Comparing the two surfaces concrete improvements pi-brain could adopt without breaking its optional, low-dependency design.

## How projects/tt/brain uses enola

- **Native enola config**: `mcp-arch.yaml` at the brain root lists a multi-repo cluster (`../teamtailor`, `../cli`, `../copilot-agent`, etc.), ignore globs, and output settings.
- **Receipts as state**: `wiki/_state/enola/receipts.json` records per-repo snapshot metadata (snapshot_id, enola_version, git commit, fact_count, content_digest).
- **Determinism handling**: `brain.py enola generate` computes order-independent `content_digest` hashes over `facts.jsonl` because upstream `snapshot_id` proved nondeterministic for TypeScript repos with duplicate candidate import paths.
- **Drift detection**: `brain.py enola diff` compares live receipts against recorded ones and reports repo-level fact-count deltas.
- **Citation verification**: `brain.py enola citations` scans wiki prose for `enola receipt <repo> sha256:... @ <commit>, <date>` citations and verdicts them as `ok`, `stale`, or `malformed`.
- **Skill integration**: `/sync` runs architecture drift, `/shape` consults the graph in Phase 1, `/ask coverage:` compares wiki pages against the graph inventory, and groom flags stale/malformed citations.
- **MCP registration**: the enola server is registered beside `brain-mcp` so any sibling repo can reach it.
- **Skip-when-absent**: all graph-dependent checks exit 0 with a one-line message if the binary, config, or state is missing, so remote CI never depends on enola.

## How pi-brain's integration differs today

- Config lives in `brain.config.yml` as flat keys; only a single `target_repo` is supported.
- No receipt state is persisted; checks run on demand and only look at exit code.
- No drift detection or citation verification.
- No multi-repo cluster support.
- No content-digest determinism guard.
- Enola is wired into `/brain:build`, `/brain:sync-code`, and the autonomous refinement protocol, but not into `/brain:shape`, `/brain:investigate`, or coverage workflows.

## Suggested improvements for pi-brain

1. **Persist receipts in `wiki/_state/enola/receipts.json`.**
   - Record per-repo snapshot metadata including a content digest.
   - This makes architecture claims citable and verifiable.

2. **Adopt `mcp-arch.yaml` for cluster config (optional).**
   - Keep `target_repo` for simple single-repo cases.
   - If `mcp-arch.yaml` exists, use it; otherwise fall back to `target_repo`.

3. **Add content-digest drift detection.**
   - When generating a snapshot, hash sorted fact content so nondeterministic upstream IDs do not create false drift.
   - Add `/brain:enola-diff` or `brain_enola diff` to report changes.

4. **Add citation verification.**
   - Define a citation format (e.g., `enola receipt <repo> sha256:<digest> @ <commit>, <date>`).
   - Add `brain_enola citations` to verdict citations in wiki prose.

5. **Integrate into shape/investigate/coverage workflows.**
   - Update `skills/brain-shape/SKILL.md` and `skills/brain-investigate/SKILL.md` to consult enola when available.
   - Add a coverage command that compares wiki pages to the graph inventory.

6. **Record enola version in receipts and support skip-when-absent in CI.**
   - Make `.github/workflows/enola.yml` robust to missing binary or config.

## Acceptance

- Receipts are generated and stored when enola is enabled and configured.
- Drift detection works across single or multi-repo configs.
- Citation verification correctly flags stale and malformed citations.
- All graph-dependent commands degrade gracefully when enola is absent.
- `npm run validate` passes; 0 dead links; 0 orphans.
