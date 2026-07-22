---
name: brain-connect
description: Run the configured pull connectors (GitHub, etc.) to snapshot external sources into sources/. Use when the user says "pull connectors", "sync GitHub", or "fetch repo snapshots".
---

# brain-connect

Pull connectors are deterministic snapshot writers. They read external systems and write immutable markdown files into `sources/<connector>/`. They never write to the wiki or run LLMs.

## Command

```
/brain:connect
```

## Tool

### `brain_pull_connectors`

Runs `tools/connectors/run.mjs`, which in turn runs each enabled connector.

## Current connectors

### GitHub

`tools/connectors/github.mjs`

- Reads `active_repos` and `connectors.github.repos` from `brain.config.yml`.
- Expects slugs like `owner/repo`.
- Uses `GITHUB_TOKEN` from `.env` for higher rate limits and private repos.
- Writes `sources/github/YYYY-MM-DD--<owner>-<repo>.md` with metadata, README, and file tree.


## Auto-connect

If `brain.config.yml` has `auto_connect: true`, autonomous mode may run connectors opportunistically at session start. This is still pull-only, read-only, and writes immutable snapshots to `sources/<connector>/`. It does not block manual work.
## After pulling

1. Read the generated source files.
2. Capture insights or hand off to `/brain:shape` if you see a pitch or pre-existing decision.
3. Run `brain_sync` to refresh the index.

## Rules

- Connectors are read-only on the remote side.
- Snapshots are immutable: each pull writes a new file with a date prefix.
- Never auto-synthesize connector output without user approval.
