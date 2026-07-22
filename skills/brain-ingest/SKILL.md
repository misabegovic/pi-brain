---
name: brain-ingest
description: Ingest a repo, document, conversation, or web URL into the current pi-brain clone's sources/ and queue synthesis work.
---

# brain-ingest

You are inside a **pi-brain clone**. This skill writes immutable snapshots into `sources/` and queues synthesis work in `wiki/_state/inbox.md`.

## When to use

- The user says "/in <path>", "add this doc", "capture this conversation", or "track this URL".
- You spot a pitch or pre-existing decision in an ingested source and need to hand off to `/brain:shape`.

For repositories you intend to actively maintain as a pi-brain project, use `/brain:ingest-repo` instead. That command keeps the code outside the brain and only stores a lightweight metadata snapshot.

## Inputs

```
/brain:in <path-or-url> [kind] [summary]
```

- `path-or-url`: a local file, directory, or `http(s)://` URL.
- `kind` (optional): `repo`, `doc`, `conversation`, `web`. Auto-detected if omitted.
  - Directory → `repo`
  - File → `doc`
  - URL → `web`
- `summary` (optional): one-line description of what this source is.

## Tool

### `brain_ingest`

- `source` (required): path or URL.
- `kind` (optional): `repo`, `doc`, `conversation`, `web`.
- `summary` (optional): one-line summary.

The tool:

1. Writes a timestamped, slugged markdown file under `sources/<kind>/`.
2. For files, stores the content inside a code block.
3. For directories, recursively collects text files up to a size budget and stores them under per-file headings.
4. For URLs, attempts to fetch the page content (best-effort, capped at 500 KB); if fetching fails, it still records the URL and metadata.
5. Appends an inbox item suggesting synthesis.

## After ingestion

1. Read the generated source file.
2. Decide if it contains:
   - A **pitch** → hand off to `/brain:shape <scope> <pitch>`.
   - A **pre-existing decision** → hand off to `/brain:shape <scope> --record <description>`.
   - General signal → capture insights into the wiki or inbox.
3. Run `brain_sync` when done.

## Rules

- **Sources are immutable.** `brain_ingest` never overwrites an existing source file; each ingestion creates a new timestamped snapshot.
- **Synthesis belongs in wiki/.** Do not turn sources into wiki pages directly; digest them.
- **Cite sources.** Any wiki claim derived from an ingested source should reference the source file path.
- **Queue, don't auto-shape.** Unless the user explicitly asks, only queue synthesis work in the inbox; let `/brain:tend` or `/brain:shape` handle the expensive authoring.
