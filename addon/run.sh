#!/usr/bin/env bash
set -e

# /data is the HA addon's persistent storage (survives restarts and updates).
export AULA_MCP_DIR="/data"
export AULA_MCP_NO_KEYCHAIN=1
export AULA_MCP_ALLOW_REMOTE=1
export AULA_MCP_HOST="0.0.0.0"
export AULA_MCP_PORT="7878"

# Optional encryption key from the addon config UI.
AULA_MCP_KEY_VAL=$(jq -r '.aula_mcp_key // empty' /data/options.json 2>/dev/null || true)
[ -n "$AULA_MCP_KEY_VAL" ] && export AULA_MCP_KEY="$AULA_MCP_KEY_VAL"

exec bun /app/packages/mcp-server/src/server.ts
