#!/usr/bin/env bash
# clone-pi-brain — create a new pi-brain clone for your project.
#
# Usage:
#   bash tools/clone-pi-brain.sh <target-dir> [org-name]
#
# Example:
#   bash tools/clone-pi-brain.sh ~/projects/acme-brain "Acme Inc"

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_REPO="${PI_BRAIN_TEMPLATE:-${SCRIPT_DIR}/..}"
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

echo "Cloning pi-brain template into ${TARGET_DIR}..."
git clone "${SOURCE_REPO}" "${TARGET_DIR}"

cd "${TARGET_DIR}"

# Rename the template origin so the user can add their own later
git remote rename origin template-upstream || true

echo "Setting org name to: ${ORG_NAME}"
# Simple sed replacement for the default org line in brain.config.yml
if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i '' "s/^org: .*/org: \"${ORG_NAME}\"/" brain.config.yml
else
  sed -i "s/^org: .*/org: \"${ORG_NAME}\"/" brain.config.yml
fi

# Optionally update README title
echo ""
echo "Next steps:"
echo "  cd ${TARGET_DIR}"
echo "  bash tools/setup-local.sh"
echo "  pi install ./"
echo ""
echo "You can also run /brain:setup from pi to reconfigure active repos and connectors."
