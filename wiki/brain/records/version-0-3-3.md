---
kind: record
status: delivered
scope: brain
confidence: high
---

# Record — pi-brain v0.3.3 release

## What shipped

v0.3.3 delivers the regenerative-intent epic and follow-up cleanup:

- All nine regenerative-intent bets implemented and recorded.
- New commands: `/brain:build`, `/brain:diff`, `/brain:sync-code`, `/brain:revise`, `/brain:collaborate`, `/brain:rfc-contribute`, `/brain:enqueue`, `/brain:run-tasks`, `/brain:tasks`.
- Link graph fixed; `brain_links` reports 0 dead links and 0 orphans.
- TypeScript dev tooling added (`tsconfig.json`, `npm run check`, `npm test`).
- GitHub Actions CI workflow added.
- README, skills, prompts, and setup skill updated for the new commands and PR-first workflow.
- `.env.example` added.
- Delivery log updated through PR #22.

## Pull requests

- PR #12 through PR #22: regenerative-intent epic delivery, link graph fixes, TypeScript checks, CI, and command tests.
- PR #61: update pi dependencies to v0.83.0.
- PR #62: opt pi-brain tools into JSON-schema constrained sampling.
- PR #63: constrained-sampling follow-ups (literal union for capture kind, test, documentation).
- PR #64: test and harden the background task runner.
- PR #65: add detached background-task execution.
- PR #66: parallel background tasks and background agents.
- PR #67: update CHANGELOG for v0.3.3 release notes.
- PR #68: optional enola architecture intelligence integration.

## npm publication

- Published to npm as `@misabegovic/pi-brain@0.3.3`.

## Related

- [wiki/brain/epics/regenerative-intent.md](../epics/regenerative-intent.md)
- [wiki/brain/records/version-0-3-2.md](version-0-3-2.md)
- [wiki/brain/epics/enola-integration.md](../epics/enola-integration.md)
