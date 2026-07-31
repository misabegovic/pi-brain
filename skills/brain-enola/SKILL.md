---
name: brain-enola
description: Optional enola architecture intelligence integration for pi-brain. Use when the user asks about enola, architecture regressions, dependency cycles, or structural codebase analysis.
---

# brain-enola

You are wearing the optional enola skill. enola is an architectural regression testing tool that extracts a deterministic graph of modules, symbols, and dependencies from source code, pins a baseline, and reports structural deltas after a change.

## When to use

- The user asks "does this change introduce an architecture regression?"
- The user wants to know about dependency cycles, coupling, or module boundaries.
- The user mentions enola or asks to configure it.
- Before or after a `/brain:build` or `/brain:sync-code` that touches target-repo code.

## Configuration

Add an `enola` section to `brain.config.yml`:

```yml
enola:
  enabled: true
  target_repo: ./path/to/target/repo    # optional; defaults to the brain home
  binary: enola                          # optional; path to enola binary
  check_args: "check"                   # optional; default: "check"
  baseline_args: "baseline pin"         # optional; default: "baseline pin"
  query_args: "check"                   # optional; default: "check"
  impact_args: "check"                  # optional; default: "check"
  gate_build: true                       # optional; run enola check before /brain:build
  gate_sync_code: true                   # optional; run enola check before /brain:sync-code
  auto_baseline: true                    # optional; re-pin baseline after build/sync-code apply
```

If your enola variant uses different commands, override `check_args`, `baseline_args`, etc. For example, the MCP-style enola binary uses `--generate --explain` for checks.

## Tools

### `brain_enola`

- `operation: "check"` — run `enola check` on the configured target repo.
- `operation: "baseline"` — pin the architecture baseline.
- `operation: "generate"` — generate enola snapshot and record a receipt in `wiki/_state/enola/receipts.json`.
- `operation: "diff"` — compare the current snapshot to recorded receipts and report drift.
- `operation: "citations"` — check wiki prose for `enola receipt ...` citations and verdict them ok/stale/unknown-repo.
- `operation: "query"` with `query: "symbol-or-module"` — search current enola output.
- `operation: "impact"` with `query: "symbol-or-module"` — show impact radius with surrounding context.

If enola is not enabled or not installed, the tool returns a helpful message instead of failing.

## Commands the human can type

- `/brain:enola-status` — show current configuration.
- `/brain:enola-check`
- `/brain:enola-capture` — run check and save regressions as an ai-suggestion.
- `/brain:enola-generate` — generate snapshot and record receipt.
- `/brain:enola-diff` — compare current snapshot to recorded receipts.
- `/brain:enola-citations` — check enola receipt citations in wiki prose.
- `/brain:enola-baseline`
- `/brain:enola-query <term>`
- `/brain:enola-impact <symbol>` — show impact radius for a symbol or module.

## Receipts and citations

When you run `/brain:enola-generate`, pi-brain records per-repo snapshot metadata in `wiki/_state/enola/receipts.json`. You can cite a receipt in wiki prose like:

```markdown
enola receipt pi-brain `sha256:72d38a9e…` @ `0f1c75b`, 2026-07-31
```

Then `/brain:enola-citations` will verdict the citation against the recorded state.

## CI

If `enola.config.yml` exists in the repo root, the `.github/workflows/enola.yml` job runs `enola check` on every push/PR. It is skipped otherwise.

## Safety

- enola integration is fully optional.
- No mandatory dependency on enola in package.json.
- The tool degrades gracefully when enola is absent.
