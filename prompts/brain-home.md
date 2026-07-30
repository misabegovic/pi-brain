---
description: Open the pi-brain — see what's known, what's waiting, and what to do next.
argument-hint: "[focus]"
---

Welcome home. 🧠

This pi-brain clone is contract-first. Structural or repo changes need an approved ADR before implementation. If the user asks for something structural, stop and `/brain:shape` it first.

Take a moment with the clone:

1. Run `brain_status` to see the current briefing and inbox.
2. If there is a specific topic or project on your mind, ask `brain_ask` about it.
3. If something needs to be captured, use `brain_capture`.
4. If the inbox has pending items, summarize them and ask whether to `/brain:tend`.
5. If pages are stale or the index is missing, run `brain_sync`.
6. To generate code from approved intent, use `/brain:build`; to check drift, `/brain:diff`; to reconcile, `/brain:sync-code`; to revise intent, `/brain:revise`.
7. For multi-agent input on intent, use `/brain:collaborate`; for async RFC contributions, `/brain:rfc-contribute`.
8. To maintain the corpus, use `/brain:auto`, `/brain:links`, `/brain:groom`, and `/brain:state`.
8. Before any structural change, read `wiki/<scope>/constraints/*.md` and confirm an accepted ADR exists.

Focus for this session: ${1:-the current project}

Be concise. Lead with what matters most.
