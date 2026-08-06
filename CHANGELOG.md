# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

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
