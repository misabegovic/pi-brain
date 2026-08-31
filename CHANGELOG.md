# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

## [0.5.0] - 2026-08-31

- Added: workflow parity with the origin brain's enola surface. `/brain:enola-plan` reports the pre-edit contract (declared constraints and blast radius for intended paths), and the intent-first gate injects it beside the governing trail, so the first edit into a piece of work reads both the pages that govern it and the constraints that bind it. `/brain:enola-findings` lists snapshot findings grouped by explainer, joined against a judgment ledger; `/brain:enola-judge` records accepted/rejected/noise verdicts at `wiki/_state/enola-verdicts.json` — write-on-judgment, no pending state, so a judged finding is inherited rather than re-decided. Surfaces deliberately not wrapped are named in GETTING_STARTED (coverage is cross-repo, history is binary-served, trends are an unneeded fold), so absence reads as a decision rather than a gap.
- Verified against enola v0.4.11 and re-baselined (1,730 facts at v0.4.11; first pinned at v0.4.10 with 1,726 facts, re-pinned when upstream released v0.4.11 the same week): 1,726 facts against the 490 the v0.2.9 snapshot held, the growth being the `mdintent` compile of this repository's own wiki and the v0.4.8 `manifests` extractor reading `package.json`. The receipt carries `format_version: 1` per v0.4.10's documented artifact contract.
- Added: `enola-intent.yaml` declaring every direct dependency with a stated purpose (enola v0.4.8, rule H14). The intent explainer diffs the declaration against the measured manifests, so a dependency added without a purpose surfaces as a finding.
- Fixed: `enola check` exit 3 (baseline not comparable) is a non-verdict, not a regression. `runEnolaCheck` reports it as `declined` with the re-pin remedy named, and the build/sync gates proceed by name instead of blocking on a grade that was never reached. Previously every non-zero exit read as a structural regression, so a stale baseline blocked work with a message about regressions that did not exist.
- Added: the enola binary resolves env-first — `ENOLA_BINARY`, then `enola.binary`, then PATH — so a machine carrying several enola builds pins the right one per checkout, matching how the brain home resolves.
- Fixed: GETTING_STARTED's config example used a nested `enola:` block, which the flat-dotted-key parser silently reads as disabled; the example now shows the shape the parser reads, with the pitfall named. Its stale `--generate --explain` arg overrides are gone; the modern CLI defaults (`check`, `baseline pin`) apply unless overridden.
- Verified against enola v0.3.9 — the first release carrying the intent standard; the govern/intent surface no longer requires a dev build. GETTING_STARTED notes the minimum version.
- Added: the intent-first contract — the first write into each sibling repo per piece of work is blocked once with its governing pages (`enola govern`) surfaced, and a turn that moved sibling code without moving any wiki page carries an intent-debt accounting into the next turn's context. Config-gated via `intent_first` (default enabled); absent graph degrades to a named skip. Ported from the origin brain's adoption.
- Verified: the module-level dependency-cycle finding (pi-brain → commands → hooks → tools) is a directory-aggregation artifact — the file-level import graph is acyclic; verdict recorded at the extension entry point instead of refactoring healthy barrels.

- Simplified: one frontmatter/YAML helper lib for tools (`tools/lib/frontmatter.mjs`) replaces five diverging copies — the same fragmentation class that produced the vacuous enola tests; `runEnolaGovern` decomposed (cyclomatic 62 → helpers, graded by enola diff); the test script is one glob runner instead of 27 chained invocations; `computeFactsDigest` parses once and deep-sorts keys (the old top-level-only sort weakened the determinism claim); all enola artifact readers resolve through one artifact-dir resolver — `generate`/`diff` previously read receipts from the brain home while enola wrote them into the configured target repo.

- Intent compilation: every wiki page carries a derived `enola_intent:` block (`node tools/brain-intent.mjs`, idempotent; `--check` wired into `npm run validate`) — kind, scope, supersedes relations, and resolvable citations compile into knowledge nodes and page-to-code anchors when an enola build carrying the intent standard snapshots the brain home. Annotated ` (…)` citations never anchor. The generated `wiki/index.md` is excluded (it would oscillate with the links regen).
- The reverse query: `brain_enola` gains `operation: "govern"` and `/brain:enola-govern <target>` — which compiled pages govern a file or symbol (with relation trails); for a page path, which code its anchors cover. Empty states keep the counterparty rule: no compiled pages answers *not asked*, never *asked, none governs*.
- Cross-skill wiring: shape asks what governs the code before proposing changes; groom owns the dangling-anchor repair protocol; diff treats dangling anchors as drift signal.
- Fixed: the enola test helper wrote nested YAML the flat-dotted-key config reader never parsed, so every enabled-path assertion passed vacuously with `enabled: false`.

## [0.4.0] - 2026-08-01

### Added

- Optional enola architecture intelligence integration: `/brain:enola-status`, `/brain:enola-check`, `/brain:enola-capture`, `/brain:enola-generate`, `/brain:enola-diff`, `/brain:enola-citations`, `/brain:enola-baseline`, `/brain:enola-query`, `/brain:enola-impact`.
- Enola receipt state in `wiki/_state/enola/receipts.json` with content-digest drift detection.
- Enola citation verification for wiki prose.
- Enola gates for `/brain:build` and `/brain:sync-code` (`enola.gate_build`, `enola.gate_sync_code`).
- Enola auto-baseline after `/brain:build` and `/brain:sync-code --apply` (`enola.auto_baseline`).
- Enola capture in the autonomous refinement protocol.
- Enola-guided skill prompts: `brain-shape`, `brain-investigate`, `brain-revise`, `brain-diff`, `brain-collaborate`, `brain-rfc-contribute`, `brain-groom`, `brain-continue`.
- Skip-when-absent enola CI workflow.

### Changed

- Refactored `registerTools`, `registerCommands`, and `registerHooks` into domain-specific registrars.
- Extracted `extractSimpleYamlValue` into `extensions/pi-brain/yaml.ts`.

## [0.3.3] - 2026-07-30

### Added

- Regenerative-intent commands: `/brain:build`, `/brain:diff`, `/brain:sync-code`, `/brain:revise`.
- Multi-agent collaboration commands: `/brain:collaborate`, `/brain:rfc-contribute`.
- Background task commands: `/brain:enqueue`, `/brain:run-tasks`, `/brain:tasks`.
- Detached background execution: `/brain:run-tasks --detach`.
- Parallel background execution: `/brain:run-tasks --detach --parallel`.
- Generic background agents: `/brain:bg-agent <scope> <description>`.
- Atomic task claiming to prevent races between concurrent background workers.
- JSON-schema constrained sampling for all pi-brain tools (pi 0.83.0).
- Autonomous refinement protocol and smarter autonomy controls.
- TypeScript dev tooling with strict checks.
- CI workflow running `npm run validate`.
- `npm run validate` script: TypeScript checks, tests, brain-sync, and brain-links.
- Test suite covering extension loading, commands, refinement TTL, autonomy trust levels, background tasks, and constrained sampling.
- Pre-push hook blocking direct pushes to `main`.
- `CONTRIBUTING.md` and improved `README.md` documentation.

### Fixed

- Link graph resolution for relative markdown links.
- Generated page link paths in `wiki/index.md` and `org/*` pages.
- Source and skill citation paths.
- Background task state persistence when moving between queue directories.
- Background task runner recursion bug when invoked from node helper scripts.

### Changed

- `LOCAL_FIRST` default in `.env.example` set to `"false"` for the product repo.
- Updated `@earendil-works/pi-coding-agent` and `@earendil-works/pi-tui` to `^0.83.0`.

## [0.3.2] and earlier

- See the [GitHub releases page](https://github.com/misabegovic/pi-brain/releases) for earlier release notes.
