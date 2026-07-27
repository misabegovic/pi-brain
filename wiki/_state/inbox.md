---
kind: inbox
---

# Inbox

Queued items waiting to be digested.

Items are appended below. The agent tends them on request.
### auto-ingest-batch (undefined)

- **kind:** auto-ingest
- **scope:** brain
- **summary:** Auto-ingested 2 source(s). Review at wiki/_state/auto-ingest-batch.json. Run /brain:tend to synthesize, or /brain:groom to archive if stale.
### workflow-insight-gh-pr-create-body-n-renders-the (2026-07-27)

- **kind:** insight
- **scope:** brain
- **summary:** Workflow insight: `gh pr create --body "...\n..."` renders the literal string `\n` in the GitHub PR description. To get real line breaks, build the description in a file and use `gh api repos/<owner>/<repo>/pulls/<n> --method PATCH --input <json>` with the body encoded as JSON (e.g., via `jq -n --arg body "$(cat body.txt)" '{body:$body}'). Applied to fix PR #8 description.

