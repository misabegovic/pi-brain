/**
 * template-owned: the one list of paths a pi-brain release owns.
 *
 * A clone's content (wiki/, sources/, log/, brain.config.yml) is never in this
 * list. Both the GitHub-release update fallback (extensions/pi-brain/template-update.ts)
 * and tools/migrate-clone.mjs read it, so they cannot disagree about what the
 * template owns. tests/template-update.test.ts fails when a file under tools/
 * is not covered here.
 */
export const TEMPLATE_OWNED_PATHS = [
  "AGENTS.md",
  "GETTING_STARTED.md",
  "README.md",
  "extensions",
  "skills",
  "prompts",
  "themes",
  "tools/templates",
  "tools/connectors",
  "tools/lib",
  "tools/git-hooks",
  "tools/brain-convert.mjs",
  "tools/brain-ingest-repo.mjs",
  "tools/brain-intent.mjs",
  "tools/brain-links.mjs",
  "tools/brain-projects.mjs",
  "tools/brain-state.mjs",
  "tools/brain-sync.mjs",
  "tools/clone-pi-brain.sh",
  "tools/migrate-clone.mjs",
  "tools/run-tasks.mjs",
  "tools/setup-local.sh",
  ".github",
  "personas",
];
