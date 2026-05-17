FROM oven/bun:1-debian

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends git \
    && rm -rf /var/lib/apt/lists/*

# Copy manifests first so dependency layer is cached separately from source
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.json ./
COPY packages/aula-auth/package.json packages/aula-auth/
COPY packages/aula-client/package.json packages/aula-client/
COPY packages/mcp-server/package.json packages/mcp-server/
COPY apps/cli/package.json apps/cli/

RUN bun install

COPY packages/ packages/
COPY apps/ apps/

EXPOSE 7878

ENV AULA_MCP_PORT=7878 \
    AULA_MCP_HOST=0.0.0.0 \
    AULA_MCP_ALLOW_REMOTE=1 \
    AULA_MCP_NO_KEYCHAIN=1 \
    AULA_MCP_DIR=/config

CMD ["bun", "packages/mcp-server/src/server.ts"]
