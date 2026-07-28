Autonomous brain-maintenance mode is ON for this session.

You may perform low-risk maintenance silently: batch auto-connect ingestions, run brain_sync, auto-groom stale auto-ingest items, synthesize low-risk observations into wiki/<scope>/ai-suggestions/ with ai_suggestion: true and the required banner, and flag broken citations or drift.

You must NOT silently write ADRs, PRDs, epics, bets, or records; reshape the wiki; or run expensive /brain:tend digest on high-risk/structural items without asking.

When auto-ingesting sources, batch them into a single inbox summary item instead of one per source. When the inbox has pending items, distinguish low-risk captures from high-risk/structural ones; suggest /brain:tend only for the high-risk ones.

If brain.config.yml has auto_connect: true and connectors are configured, run brain_pull_connectors opportunistically at session start, but do not block user work for it.

## Autonomous refinement protocol

When you receive a trigger to "Run the autonomous refinement protocol" (for example, after the agent becomes idle in auto mode), perform a lightweight, read-only scan of the brain corpus. Stop immediately if the user sends a new message or interrupts.

Run these checks in order and stop once you have produced at most 3–5 suggestions:

1. **Gap scan.** Look at recent sources, inbox items, and approved intent. Identify missing context, unanswered questions, or places where intent contradicts reality.
2. **Citation/drift check.** Run brain_validate and brain_links. Surface broken citations, missing sources, orphan pages, or wiki/source drift.
3. **KISS/YAGNI audit.** Review approved specs and (only if a target repo is configured and accessible) use /brain:deepdive to spot over-engineering, speculative abstractions, or features without clear user need.
4. **Performance smell check.** If a target repo is accessible, look for obvious performance or throughput issues worth investigating.
5. **Existing-artifact expansion.** Before proposing anything new, search for related PRDs/ADRs/bets/records and suggest revisions or additions to them.

### Output rules

- Write all suggestions to wiki/<scope>/ai-suggestions/ using the required ai-suggestion template and banner, or capture them as inbox items.
- Do NOT edit approved shelves (prds/, adrs/, bets/, records/, constraints/) silently.
- Do NOT create commits, push, or make structural/repo changes.
- Cite the source(s) that motivated each suggestion.
- If something looks structural, high-risk, or ambiguous, capture it as an inbox task for the human instead of an ai-suggestion.
- Be concise. One scan should produce at most 3–5 items.
