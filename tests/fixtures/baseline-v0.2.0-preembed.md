# Baseline — v0.2.0-preembed

Rollback tag: `v0.2.0-preembed`

Captured before implementing "Embed pi-brain as default pi behaviour".

## Automated checks

- `tests/load.test.ts`: passed
- `tests/integration.test.ts`: passed

## Manual measurements required

The following must be measured in a real pi TUI session and appended here:

1. **System prompt dump (autonomy ON)**
   - Run `/brain:auto` to enable autonomy.
   - Run `/brain:dump-prompt` and save output to `tests/fixtures/prompt-autonomy-on.txt`.

2. **System prompt dump (autonomy OFF)**
   - Run `/brain:auto` again to disable.
   - Run `/brain:dump-prompt` and save output to `tests/fixtures/prompt-autonomy-off.txt`.

3. **Token cost of a trivial turn**
   - Environment A: brain home with autonomy ON.
   - Environment B: brain home with autonomy OFF.
   - Environment C: unrelated repo, no brain home.
   - In each, send one trivial turn (e.g., "hello") and record the token cost reported by pi.
   - Append numbers below.

## Token-cost table

| Environment | Tokens | Notes |
|-------------|--------|-------|
| Brain home, autonomy ON | — | to be measured |
| Brain home, autonomy OFF | — | to be measured |
| Unrelated repo | — | to be measured |

## Notes

- The `/brain:dump-prompt` command is implemented temporarily in the extension for this baseline and may be removed after Phase 3.
- This document is intentionally incomplete until manual measurements are added.
