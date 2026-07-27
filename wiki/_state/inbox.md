---
kind: inbox
---

# Inbox

Queued items waiting to be digested.

Items are appended below. The agent tends them on request.
### user-feedback-from-another-session-the-agent-was (2026-07-22)

- **kind:** insight
- **scope:** pi-brain
- **summary:** User feedback from another session: the agent was too eager to implement structural/repo changes before an ADR was approved. The user had to retroactively move an AI-suggestion ADR to approved, add a must constraint, and tighten AGENTS.md. They ask us to learn from this and make pi-brain stronger against eager implementation. Consider: stronger default AGENTS.md language, default constraints, skill instructions, session-start briefing, and autonomy gating.
- **status:** resolved — shaped into [ADR](../../brain/adrs/stronger-default-implementation-guardrails.md) and implemented. Record: [Record — Stronger default guardrails against eager implementation](../../brain/records/stronger-default-implementation-guardrails.md).
### user-need-a-nice-way-to-pull-pi-brain-template-p (2026-07-22)

- **kind:** task
- **scope:** brain
- **summary:** User need: a nice way to pull pi-brain template/product updates into existing clones. This likely involves new commands, tooling, or a documented workflow for merging upstream template changes without overwriting per-clone wiki/sources/state. Needs shaping before implementation.
- **status:** resolved — shaped into [Pitch — Upstream template sync](../../brain/pitches/upstream-template-sync.md), [PRD](../../brain/prds/upstream-template-sync.md), [ADR](../../brain/adrs/upstream-template-sync.md), [Bet](../../brain/bets/upstream-template-sync.md).
### investigated-potential-loop-between-brain-invest (2026-07-22)

- **kind:** insight
- **scope:** brain
- **summary:** Investigated potential loop between brain_investigate and brain_ingest. Finding: no code-level loop exists. /brain:investigate is a command that loads the brain-investigate skill, which uses read/brain_ask/brain_capture/brain_deepdive but never calls brain_ingest. brain_ingest appends an inbox item but does not trigger investigation. The only loop risk is behavioral/agent-driven if an agent autonomously chains investigate→ingest→investigate, but skills require explicit user requests and queue synthesis rather than auto-shaping. Conclusion: current design is safe; no ADR-level fix needed unless autonomy proves over-eager in practice.
- **status:** resolved — no code-level loop found; behavioral risk bounded by skill gating.
### user-feedback-from-another-session-autonomy-mode (2026-07-22)

- **kind:** insight
- **scope:** brain
- **summary:** User feedback from another session: autonomy mode + auto_connect produced ~20 ingest items in the inbox at session start (repo files, workflows, Gemfiles, wiki pages, GitHub Actions run). The agent correctly did not run /brain:tend without approval and offered to tend, archive stale, or leave. User asks if there is an improvement here. Possible angles: auto-connect batching/summarizing ingested sources into fewer inbox items; auto-archive/decay for stale auto-ingest items; autonomy levels (capture-only vs synthesize); clearer /brain:auto docs.
- **status:** resolved — implemented smarter autonomy: auto-connect ingestions are batched into one inbox item; stale batches are auto-groomed. Record: [Record — Smarter autonomy for pi-brain clones](../../brain/records/smarter-autonomy.md).
### refined-user-intent-for-autonomy-mode-make-it-fe (2026-07-22)

- **kind:** insight
- **scope:** brain
- **summary:** Refined user intent for autonomy mode: make it feel as hands-off as possible while nudging the agent to do important maintenance. Reduce inbox noise from auto-connect (batch/summarize), let auto mode handle low-risk synthesis and grooming, but keep expensive/structural work gated. Also: agent should be aware it is working in the brain setup so it follows brain instructions (session context/brain home identity). This is a UX redesign of autonomy, not a bug fix.
- **status:** resolved — implemented via smarter autonomy and brain identity prompt. Record: [Record — Smarter autonomy for pi-brain clones](../../brain/records/smarter-autonomy.md).
### autonomy-boundary-clarified-by-user-in-auto-mode (2026-07-22)

- **kind:** decision
- **scope:** brain
- **summary:** Autonomy boundary clarified by user: in auto mode, the agent must NOT silently write ADRs, reshape the wiki, or run expensive /brain:tend digest without asking. ALLOWED silently: batch auto-connect ingestions, auto-groom stale items, smart-tend low-risk items into ai-suggestions/, run brain_sync after captures, flag drift, suggest shape. Agent must also be aware it's in brain setup and follow brain instructions. This is the design brief for smarter autonomy.
- **status:** resolved — encoded in [ADR — Smarter autonomy boundaries](../../brain/adrs/smarter-autonomy.md) and implemented. Record: [Record — Smarter autonomy for pi-brain clones](../../brain/records/smarter-autonomy.md).
### bug-report-from-another-session-backfilling-upst (2026-07-23)

- **kind:** task
- **scope:** brain
- **summary:** Bug report from another session: backfilling upstream tools/brain-state.mjs and running brain_sync overwrites project-specific content in wiki/org/state.md, roadmap.md, and options.md with generic templates. User restored custom state page and used brain_validate + brain_views instead. Need to decide whether to patch upstream state runner or change maintenance workflow. This breaks the contract that project-specific synthesis pages should not be clobbered by generic templates.
- **status:** resolved — patched tools/brain-state.mjs to preserve custom content via marker comments. ADR: [ADR — brain-state must preserve custom content](../../brain/adrs/brain-state-preserves-custom-content.md). Record: [Record — brain-state preserves custom content](../../brain/records/brain-state-preserves-custom-content.md).
### user-asks-whether-to-create-the-first-version-re (2026-07-23)

- **kind:** task
- **scope:** brain
- **summary:** User asks whether to create the first version release (0.1.0) and first package for pi-brain. This aligns with the upstream-template-sync ADR which assumes tagged template versions. Need to decide: GitHub release vs npm package vs both; versioning scheme; what 0.1.0 includes; release notes; package publishing workflow. This is a product/release decision.
- **status:** resolved — created ADR and bet; cut GitHub release v0.1.0 and git tag. npm package prepared but not published due to missing auth. Record: [Record — pi-brain v0.1.0 release](../../brain/records/version-0-1-0.md).
### user-decided-to-abort-the-pi-brain-pi-mind-rebra (2026-07-23)

- **kind:** decision
- **scope:** brain
- **summary:** User decided to abort the pi-brain → pi-mind rebrand and keep pi-brain for now. Rationale: despite npm/GitHub naming collisions, the rebrand cost (command namespace change, file renames, docs, package migration, deprecation) outweighs the benefit at v0.1.0. Will continue with scoped npm package @misabegovic/pi-brain and revisit if the project grows or naming conflicts become a real problem. Rebrand ADR/bet were discarded.
### user-expectation-plain-language-requests-for-prd (2026-07-23)

- **kind:** task
- **scope:** brain
- **summary:** User expectation: plain-language requests for PRDs/ADRs/epics/bets should trigger proper /brain:shape forward mode, not dump drafts into ai-suggestions. Current skill language makes the agent default to ai-suggestions unless explicit /brain:shape command is used. Need ADR to change skill behavior so plain-language shape requests are treated as supervised forward-mode shape, with phase-end approval gates still applied.
- **status:** resolved — implemented. Plain-language shape requests now default to forward mode. ADR: [ADR — Plain-language shape requests default to forward mode](../../brain/adrs/plain-language-triggers-shape.md). Record: [Record — Plain-language shape requests default to forward mode](../../brain/records/plain-language-triggers-shape.md).
### user-requests-1-make-a-new-release-likely-v0-2-0 (2026-07-23)

- **kind:** task
- **scope:** brain
- **summary:** User requests: 1) make a new release (likely v0.2.0), and 2) make the /brain:update command aware of releases. This is implementation of the upstream-template-sync bet and a new release. Need to add /brain:update command that fetches upstream pi-brain releases/tags, diffs template-owned files, and offers interactive apply. Then cut v0.2.0 release.
- **status:** resolved — /brain:update implemented with release-aware version fetching; package.json bumped to 0.2.0. Record: [Record — Upstream template sync](../../brain/records/upstream-template-sync.md).
### auto-ingest-batch (2026-07-27)

- **kind:** auto-ingest
- **scope:** brain
- **summary:** Auto-ingested 1 source(s). Review at wiki/_state/auto-ingest-batch.json. Run /brain:tend to synthesize, or /brain:groom to archive if stale.

