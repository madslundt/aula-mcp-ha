# Daily Aula overview prompts (Danish, Telegram HTML)

Three scheduled prompts that turn `aula-mcp` data into a daily Telegram digest in Danish.

| Schedule        | HA / Node-RED function node                                      | Purpose                                          |
|-----------------|------------------------------------------------------------------|--------------------------------------------------|
| Mon–Thu, AM     | [`prompt-weekday.js`](./prompt-weekday.js)                       | Tomorrow's school day + heads-up for day after   |
| Friday, AM      | [`prompt-week-end.js`](./prompt-week-end.js)                     | Week wrap-up + what to prep over the weekend     |
| Sunday, evening | [`prompt-week-start.js`](./prompt-week-start.js)                 | Full next-week overview, Monday-focused          |

Each `.js` file is a drop-in function-node body for Home Assistant's "Run JavaScript function" / Node-RED's `function` node. The script computes today's date, the relevant target date (tomorrow / next Monday), and the relevant ISO week in `Europe/Copenhagen`, then inlines them into the prompt so the LLM doesn't have to guess what "tomorrow" is.

## Why three prompts?

The data window changes with the day:

- On a weekday, tomorrow is a school day and always falls in the **same ISO week** as today, so one `aula.ugeplan.*` call covers it.
- On Friday, tomorrow is Saturday — there's no school content to show. The interesting horizon is **next Monday** and weekend events, so the calendar query and ugeplan target **next week's `isoWeek`**.
- On Sunday, "tomorrow" is Monday — already in **next ISO week**. The digest scans the whole upcoming week, not just the next day.

Using one generic prompt across all three would either miss the weekend bridge (no Sunday prep) or noisily show empty Saturday/Sunday rows.

## Setup

1. Run aula-mcp locally and authenticate once (`pnpm --filter @aula-mcp/cli dev login`).
2. Start the server (`pnpm --filter @aula-mcp/mcp-server dev`).
3. Point your scheduler (cron / n8n / Apple Shortcuts / GitHub Actions) at Claude with the appropriate prompt for that day of the week.
4. Pipe the HTML output to Telegram's `sendMessage` with `parse_mode=HTML`.

## Design rules shared across all three

- **First call is always `aula.discover`** — its `usage` block tells the agent which IDs go where and which ugeplan provider this family actually uses (the server lists alternates; only `tools[0]` should be called per child).
- **No client-side timezone math.** The MCP server (`packages/mcp-server/src/calendar-range.ts`) already returns Europe/Copenhagen times with the correct dynamic offset (CET in winter, CEST in summer). A hard-coded "+2 timer" is wrong half the year.
- **`profileIds` vs `childIds`:** calendar tools want `children[].institution.id`; ugeplan/opgaver/ugebrev/huskelisten want `children[].id` + `children[].institution.code`. Mixing them is the most common bug.
- **Messages have no server-side date filter.** `aula.messages.list_threads` only paginates; the agent must filter "last 7 days" + "requires action" client-side. "Action" is defined in each prompt to keep output stable across days.
- **Posts ≠ messages.** Class-wide announcements like "Orientering til forældre" come from `aula.posts.list` (teacher news feed), not from `messages.list_threads`. Both channels must be queried — querying only one drops half the digest.
- **`aula.posts.list` scoping** is handled by the server: it fans out across every group the guardian belongs to (`parent=group&groupId=<N>`) and merges results — the only mode that returns already-read posts. Each post is enriched with `_institutionCode` so prompts can attribute posts to the right child via `children[].institution.code`.
- **Step-up auth:** `aula.messages.get_thread` can return `step_up_required` for sensitive threads. The agent should fall back to the subject/preview and label it as MitID-locked rather than fail the whole digest.
- **HTML safety:** Aula content can contain `<`, `>`, `&`. Escape them before injecting into Telegram HTML tags or `sendMessage` will reject the message.
- **Stable per-child ordering** (alphabetical by first name) so morning skim diffs day-to-day.
- **Never emit empty `<blockquote>`.** When there is nothing important, write `Ingenting i dag 🟢`.
