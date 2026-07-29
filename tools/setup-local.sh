#!/bin/bash
# setup-local.sh — bootstrap a local pi-brain development environment.
#
# Run from the root of a pi-brain clone:
#   bash tools/setup-local.sh

set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "🔧 Setting up pi-brain at $ROOT"

# Node
if ! command -v node >/dev/null 2>&1; then
  echo "❌ node is required but not installed."
  exit 1
fi

NODE_VERSION=$(node --version | sed 's/v//')
MAJOR=$(echo "$NODE_VERSION" | cut -d. -f1)
if [ "$MAJOR" -lt 18 ]; then
  echo "❌ node >= 18 is required (found $NODE_VERSION)."
  exit 1
fi
echo "✓ node $NODE_VERSION"

# pi
if ! command -v pi >/dev/null 2>&1; then
  echo "⚠️  pi is not on PATH. Install it: npm install -g @earendil-works/pi-coding-agent"
else
  echo "✓ pi $(pi --version)"
fi

# git hook
if [ -d "$ROOT/.git" ]; then
  HOOK_SOURCE="$ROOT/tools/git-hooks/pre-commit"
  HOOK_TARGET="$ROOT/.git/hooks/pre-commit"
  if [ ! -f "$HOOK_TARGET" ]; then
    cp "$HOOK_SOURCE" "$HOOK_TARGET"
    chmod +x "$HOOK_TARGET"
    echo "✓ installed pre-commit hook"
  else
    echo "✓ pre-commit hook already present"
  fi
else
  echo "⚠️  not a git repo; skipping hook install"
fi

# Health check
echo "🧠 Running brain-sync health check..."
node "$ROOT/tools/brain-sync.mjs"

echo ""
echo "Done. Open pi inside this directory and run /brain:setup if needed."
