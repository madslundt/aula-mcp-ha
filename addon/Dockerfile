FROM oven/bun:1-debian

RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates git jq \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Clone source and install dependencies at build time.
# Re-install the addon in HA to pick up new releases.
RUN git clone https://github.com/madslundt/aula-mcp-ha.git . \
    && bun install

COPY run.sh /run.sh
RUN chmod +x /run.sh

CMD ["/run.sh"]
