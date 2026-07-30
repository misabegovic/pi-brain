# Getting started with pi-brain

A quick checklist for using pi-brain on a real project.

## 1. Install the pi-brain package once

```bash
pi install @misabegovic/pi-brain
```

This gives every pi session the brain extension, skills, prompts, themes, templates, personas, and tools.

## 2. Choose your setup

- [ ] **Create a content-only clone** for a new brain.
  ```bash
  bash tools/clone-pi-brain.sh ~/projects/my-project-brain "My Org"
  cd ~/projects/my-project-brain
  ```
- [ ] **Or convert** an existing repo so the code lives inside the brain.
  ```bash
  cd my-existing-project
  /brain:convert files --dry-run   # preview
  /brain:convert files             # apply
  ```
- [ ] **Or onboard** an external repo and keep the brain repo-agnostic.
  ```bash
  /brain:ingest-repo /path/to/repo my-project
  # or
  /brain:ingest-repo https://github.com/org/repo.git my-project
  ```

## 3. Bootstrap the environment

- [ ] Run the local setup script.
  ```bash
  bash tools/setup-local.sh
  ```
- [ ] Validate the local setup.
  ```bash
  npm run validate
  ```
- [ ] Configure a provider API key so pi can use an LLM.
  - Set `GOOGLE_API_KEY`, `ANTHROPIC_API_KEY`, etc. in `.env` or via `/login`.
- [ ] Decide on delivery mode.
  - Solo/local-first: set `LOCAL_FIRST="true"` in `.env` (default). Land small commits directly.
  - Team/CI mode: set `LOCAL_FIRST="false"`. Open a PR per bet, using `.github/pull_request_template.md`.

## 3. Configure the brain

- [ ] Edit `brain.config.yml`:
  - set `org`
  - add active repos/scopes
  - enable connectors and list repos/pages/channels if needed
  - set `auto_connect: true` only if you want connectors to run opportunistically
- [ ] Run `/brain:setup` if you want the wizard.

## 4. Seed the permanent layer

- [ ] Run `/brain:projects` to confirm your scopes.
- [ ] Run `/brain:deepdive` on key parts of the repo to build context.
- [ ] Capture initial constraints in `wiki/<scope>/constraints/`.
- [ ] Create records for parts of the system you already understand.
  ```bash
  /brain:shape <scope> --record <description>
  ```

## 5. Start shaping work

- [ ] Capture a pitch or note.
  ```bash
  /brain:capture "We should decouple the billing service from notifications"
  ```
- [ ] Shape it when ready.
  ```bash
  /brain:shape <scope> decouple billing from notifications
  ```
- [ ] Review the PRD, ADR, bet, and constraint check.
- [ ] Approve or iterate. Approved artifacts move to the commitment layer.

## 6. Deliver and record

- [ ] Implement the approved bet in the project repo.
  - Local-first: commit with title `<scope>: <verb> <description>` and reference the ADR/PRD/bet in the body.
  - Team mode: open a PR using `.github/pull_request_template.md`; write a short natural summary and link inline to the ADR/PRD/bet/record in the pi-brain clone. Do not include sensitive data, session URLs, or env vars.
- [ ] For external target repos, push the decision record to the pi-brain remote **before** opening the target-repo PR.
- [ ] After merge, create/update the record in `wiki/<scope>/records/`.
- [ ] Mark the original ADR/PRD as superseded or archived if needed.

## 7. Generate and sync code from intent

If your PRD/ADR uses YAML intent blocks, pi-brain can generate and track code:

- [ ] Build from approved intent.
  ```bash
  /brain:build <scope> <types|interfaces|...>
  ```
- [ ] Check for drift between intent and existing code.
  ```bash
  /brain:diff <scope> <types|...>
  ```
- [ ] Reconcile drift with proposals.
  ```bash
  /brain:sync-code <scope> <types|...>
  ```
- [ ] Propose revisions to intent based on new evidence.
  ```bash
  /brain:revise <scope> <artifact-slug>
  ```

## 8. Maintain the brain

- [ ] Run `/brain:tend` to digest the inbox.
- [ ] Run `/brain:links` to find orphans, dead links, and suggestions.
- [ ] Run `/brain:groom` to decay confidence, archive stale pages, and compact commitments into records.
- [ ] Run `/brain:state` to regenerate state/roadmap/options pages.
- [ ] Run `/brain:sync` before committing to validate and regenerate `wiki/index.md`.
- [ ] Run `/brain:update` to update pi-brain. It tries the package path first (`pi install @misabegovic/pi-brain@latest`) and falls back to the legacy GitHub diff/apply flow if needed.
- [ ] Run `node tools/migrate-clone.mjs <clone-path> --dry-run` to migrate an existing full-repo clone to the content-only, package-resolved model.

## Experimental features

- `PI_BRAIN_EXPERIMENTAL_CONTEXT=1` enables relevant-record injection on every turn. Prototype only — measure quality before relying on it.

## Troubleshooting

- **No pi-brain home found:** run `/brain:setup` or set `PI_BRAIN_HOME`.
- **LLM not responding:** check that your provider API key is set.
- **Pre-commit hook fails:** run `node tools/brain-sync.mjs` manually and fix frontmatter errors.
- **Missing skills/prompts/themes after install:** verify `pi install @misabegovic/pi-brain` succeeded and that the package manifest is loaded.
