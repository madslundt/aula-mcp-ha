# Changelog

## [1.1.0](https://github.com/madslundt/aula-mcp-ha/compare/v1.0.0...v1.1.0) (2026-05-17)


### Features

* **aula-client:** integration plugins (EasyIQ, Meebook, Min Uddannelse, Systematic) ([26a6798](https://github.com/madslundt/aula-mcp-ha/commit/26a6798a641fb15784bd29c385c6eab7f00d5594))
* **cli:** aula doctor + transcript view/list/prune + --json + prompt timeout + locale cleanup ([25351c3](https://github.com/madslundt/aula-mcp-ha/commit/25351c32671431136c40d9bffc423a32584b1518))
* **integrations:** add EasyIQ Lektier widget (0142) ([#8](https://github.com/madslundt/aula-mcp-ha/issues/8)) ([106f4c8](https://github.com/madslundt/aula-mcp-ha/commit/106f4c80da1eea050ce89f135876209481d0e366))
* **integrations:** EasyIQ SkolePortal (widget 0128, PR scaarup/aula[#352](https://github.com/madslundt/aula-mcp-ha/issues/352)) ([e754f1b](https://github.com/madslundt/aula-mcp-ha/commit/e754f1b954dd1e7c9aaec4c66cc4b38ce7795c21))
* **mcp-server:** add legacy SSE transport for Home Assistant compatibility ([#18](https://github.com/madslundt/aula-mcp-ha/issues/18)) ([e6af96d](https://github.com/madslundt/aula-mcp-ha/commit/e6af96d181a73c4537bbd0c19b9842bacd3a4f1b))
* **mcp-server:** Hono + Streamable HTTP + aula.discover ([2466d2f](https://github.com/madslundt/aula-mcp-ha/commit/2466d2f71f2ee0c5d5992d8748d27dc3cc516918))
* **mcp:** widget detection, friendly calendar range, raw escape hatch, notifications + posts tools ([1ec1a5f](https://github.com/madslundt/aula-mcp-ha/commit/1ec1a5f4aa3bddeec8187a054df7a7b56f62b2fd))


### Bug Fixes

* **auth-correctness:** meta-refresh fallback, refresh race, fetch errors, cookie warnings, graceful shutdown, remote-bind guard ([e337e77](https://github.com/madslundt/aula-mcp-ha/commit/e337e7744840a35df70563207b287ca06e0fed31))
* critical issues from gap review ([53a9ea4](https://github.com/madslundt/aula-mcp-ha/commit/53a9ea4c86b8fb2c22b65614c5a71442ebc2e443))
* **login,mcp:** unblock end-to-end auth + ugeplan, sharpen MCP UX ([f711ca4](https://github.com/madslundt/aula-mcp-ha/commit/f711ca4b48ff495459c15f8b2b8dda838880e01e))
* **sse:** send absolute URL in SSE endpoint event for HA compatibility ([c4e71dc](https://github.com/madslundt/aula-mcp-ha/commit/c4e71dc11ee1ff9eeef3ea6a1875a00ea2215b0e))

## 1.0.0 (2026-05-13)


### Features

* **aula-client:** integration plugins (EasyIQ, Meebook, Min Uddannelse, Systematic) ([26a6798](https://github.com/Casperjuel/aula-mcp/commit/26a6798a641fb15784bd29c385c6eab7f00d5594))
* **cli:** aula doctor + transcript view/list/prune + --json + prompt timeout + locale cleanup ([25351c3](https://github.com/Casperjuel/aula-mcp/commit/25351c32671431136c40d9bffc423a32584b1518))
* **integrations:** add EasyIQ Lektier widget (0142) ([#8](https://github.com/Casperjuel/aula-mcp/issues/8)) ([106f4c8](https://github.com/Casperjuel/aula-mcp/commit/106f4c80da1eea050ce89f135876209481d0e366))
* **integrations:** EasyIQ SkolePortal (widget 0128, PR scaarup/aula[#352](https://github.com/Casperjuel/aula-mcp/issues/352)) ([e754f1b](https://github.com/Casperjuel/aula-mcp/commit/e754f1b954dd1e7c9aaec4c66cc4b38ce7795c21))
* **mcp-server:** Hono + Streamable HTTP + aula.discover ([2466d2f](https://github.com/Casperjuel/aula-mcp/commit/2466d2f71f2ee0c5d5992d8748d27dc3cc516918))
* **mcp:** widget detection, friendly calendar range, raw escape hatch, notifications + posts tools ([1ec1a5f](https://github.com/Casperjuel/aula-mcp/commit/1ec1a5f4aa3bddeec8187a054df7a7b56f62b2fd))


### Bug Fixes

* **auth-correctness:** meta-refresh fallback, refresh race, fetch errors, cookie warnings, graceful shutdown, remote-bind guard ([e337e77](https://github.com/Casperjuel/aula-mcp/commit/e337e7744840a35df70563207b287ca06e0fed31))
* critical issues from gap review ([53a9ea4](https://github.com/Casperjuel/aula-mcp/commit/53a9ea4c86b8fb2c22b65614c5a71442ebc2e443))
* **login,mcp:** unblock end-to-end auth + ugeplan, sharpen MCP UX ([f711ca4](https://github.com/Casperjuel/aula-mcp/commit/f711ca4b48ff495459c15f8b2b8dda838880e01e))
