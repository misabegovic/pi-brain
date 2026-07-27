#!/usr/bin/env bash
# clone-pi-brain — create a new content-only pi-brain clone for your project.
#
# With package-resolved resources, the installed pi-brain package provides
# skills, prompts, themes, tools, personas, and the extension. A clone only
# needs content, config, and project-specific docs.
#
# Usage:
#   bash tools/clone-pi-brain.sh <target-dir> [org-name]
#
# Example:
#   bash tools/clone-pi-brain.sh ~/projects/acme-brain "Acme Inc"

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATE_REPO="${PI_BRAIN_TEMPLATE:-${SCRIPT_DIR}/..}"
TARGET_DIR="${1:-}"
ORG_NAME="${2:-}"

if [[ -z "${TARGET_DIR}" ]]; then
  echo "Usage: bash tools/clone-pi-brain.sh <target-dir> [org-name]"
  echo ""
  echo "Environment:"
  echo "  PI_BRAIN_TEMPLATE  Path to the pi-brain template repo (default: parent of this script)"
  exit 1
fi

if [[ -e "${TARGET_DIR}" ]]; then
  echo "Error: target directory already exists: ${TARGET_DIR}"
  exit 1
fi

TARGET_DIR="$(mkdir -p "$(dirname "${TARGET_DIR}")" && cd "$(dirname "${TARGET_DIR}")" && pwd)/$(basename "${TARGET_DIR}")"
ORG_NAME="${ORG_NAME:-$(basename "${TARGET_DIR}")}"

mkdir -p "${TARGET_DIR}"
cd "${TARGET_DIR}"

# Content directories
mkdir -p wiki/_state sources log

# Project-specific config
cat > brain.config.yml <<EOF
# pi-brain configuration for ${ORG_NAME}.

org: "${ORG_NAME}"

active_repos: []

archived_repos: []

auto_connect: false

connectors:
  github:
    repos: []
  notion:
    pages: []
  slack:
    channels: []
  datadog:
    site: ""
  langfuse:
    host: ""
  structure:
    repos: []

template_version: "v0.3.0"
EOF

# Core wiki pages
cat > wiki/index.md <<'EOF'
---
kind: meta
status: living
confidence: high
---

# Home

Welcome to the pi-brain home for this project.
EOF

cat > wiki/_state/inbox.md <<'EOF'
---
kind: inbox
---

# Inbox

Queued items waiting to be digested.
EOF

cat > sources/README.md <<'EOF'
# sources

Immutable inputs for this pi-brain instance.
EOF

cat > log/log.md <<'EOF'
# Log

Append-only operations log for this pi-brain instance.
EOF

# Project-specific docs (copied from template as starting points)
cp "${TEMPLATE_REPO}/README.md" README.md
cp "${TEMPLATE_REPO}/GETTING_STARTED.md" GETTING_STARTED.md
cp "${TEMPLATE_REPO}/AGENTS.md" AGENTS.md
cp "${TEMPLATE_REPO}/.gitignore" .gitignore 2>/dev/null || true
cp "${TEMPLATE_REPO}/.env.example" .env.example 2>/dev/null || true

# Optional git init
if ! [[ -d ".git" ]]; then
  git init -q
fi

echo "Created content-only pi-brain clone at ${TARGET_DIR}"
echo ""
echo "Next steps:"
echo "  cd ${TARGET_DIR}"
echo "  pi install @misabegovic/pi-brain"
echo "  pi"
echo "  /brain:setup"
echo ""
echo "The installed package provides skills, prompts, themes, tools, and the extension."
