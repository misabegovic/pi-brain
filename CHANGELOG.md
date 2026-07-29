# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.3] - 2026-07-29

### Added

- Regenerative-intent commands: `/brain:build`, `/brain:diff`, `/brain:sync-code`, `/brain:revise`.
- Multi-agent collaboration commands: `/brain:collaborate`, `/brain:rfc-contribute`.
- Background task commands: `/brain:enqueue`, `/brain:run-tasks`, `/brain:tasks`.
- Autonomous refinement protocol and smarter autonomy controls.
- TypeScript dev tooling with strict checks.
- CI workflow running `npm run validate`.
- `npm run validate` script: TypeScript checks, tests, brain-sync, and brain-links.
- End-to-end tests for extension loading, commands, refinement TTL, and autonomy trust levels.
- Pre-push hook blocking direct pushes to `main`.
- `CONTRIBUTING.md` and improved `README.md` documentation.

### Fixed

- Link graph resolution for relative markdown links.
- Generated page link paths in `wiki/index.md` and `org/*` pages.
- Source and skill citation paths.

### Changed

- `LOCAL_FIRST` default in `.env.example` set to `"false"` for the product repo.

## [0.3.2] and earlier

- See the [GitHub releases page](https://github.com/misabegovic/pi-brain/releases) for earlier release notes.
