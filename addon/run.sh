#!/usr/bin/env bash
set -e

OPTS=/data/options.json

export AULA_MCP_DIR="/data"
export AULA_MCP_NO_KEYCHAIN=1
export AULA_MCP_ALLOW_REMOTE=1
export AULA_MCP_HOST="0.0.0.0"
export AULA_MCP_PORT="7878"

AULA_MCP_KEY_VAL=$(jq -r '.aula_mcp_key // empty' "$OPTS" 2>/dev/null || true)
[ -n "$AULA_MCP_KEY_VAL" ] && export AULA_MCP_KEY="$AULA_MCP_KEY_VAL"

MITID_USERNAME=$(jq -r '.mitid_username // empty' "$OPTS" 2>/dev/null || true)

echo "--- Aula MCP: startup health check ---"
if bun /app/apps/cli/src/index.ts doctor; then
  echo "--- Health check passed ---"
else
  echo "--- Health check failed ---"
  if [ -n "$MITID_USERNAME" ]; then
    echo "--- Logging in as '$MITID_USERNAME' ---"
    echo "--- Open Settings → Add-ons → Aula MCP → Log tab and scan the QR code with the MitID app ---"
    bun /app/apps/cli/src/index.ts login --username "$MITID_USERNAME" || \
      echo "--- Login failed — server will start but Aula tools will not work until you log in ---"
  else
    echo "--- Set 'mitid_username' in the Configuration tab and restart the addon to enable auto-login ---"
  fi
fi

echo "--- Starting MCP server on :$AULA_MCP_PORT ---"
exec bun /app/packages/mcp-server/src/server.ts
