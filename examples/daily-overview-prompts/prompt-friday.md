# Friday prompt (week wrap-up)

Runs Friday morning. Pivots from "tomorrow is school" to "weekend + next Monday". Same shape as your original prompt, with `aula.posts.list` added.

**Important — anchor the dates before sending.** Your scheduler MUST replace `{{TODAY}}`, `{{NEXT_MONDAY}}`, and `{{NEXT_WEEK_ISOWEEK}}` with concrete values, otherwise the model will guess.

```text
Analysér data fra Aula og giv en ugeafslutning formateret som HTML til Telegram.

KONTEKST:
- I DAG er {{TODAY}}.
- NÆSTE MANDAG er {{NEXT_MONDAY}}.
- KOMMENDE ISO-UGE er {{NEXT_WEEK_ISOWEEK}} (fx "2026-W21").

DATA:
- Find alle børn (kald `aula.discover` én gang).
- Beskeder: `aula.messages.list_threads` (sidste 7 dage; fokusér på info om
  næste uge, weekend-arrangementer, eller noget der skal være klar mandag).
- Opslag (klassens nyhedsfeed): KALD ALTID `aula.posts.list` (limit=20).
  Aulas "Opslag"-feed (lærer-/skole-/klasse-info) — IKKE det samme som
  beskeder. Medtag alle opslag fra sidste 7 dage uden relevans-filter.
- Ugeplan: `aula.ugeplan.<provider>` for hvert barn med isoWeek for NÆSTE
  mandag (format "YYYY-Www"). Brug ugeplanen til at fremhæve vigtigste
  fokus/lektier for kommende uge.
- Kalender: `aula.calendar.events` med range="next_week" og profileIds.
  Filtrér client-side til mandag (og evt. weekend-events lørdag/søndag).

REGLER:
- TIDSZONE: Serveren returnerer allerede dansk tid (Europe/Copenhagen).
  Gør INGEN konvertering.
- FORMAT: <b>navne</b>, <code>tider</code>, <blockquote>vigtigt</blockquote>.
  Escape <, > og & i alt indhold fra Aula.

STRUKTUR:
<b>🏁 UGEAFSLUTNING & NÆSTE UGE</b>
<b>🚨 VIGTIGT FOR MANDAG</b>
<blockquote>[Ting man skal huske at have klar over weekenden — eller "Intet at huske 🟢".]</blockquote>

<b>📢 OPSLAG (sidste 7 dage)</b>
• <code>[dato]</code> <b>[titel]</b> — [1-linje sammenfatning]
[Gentag per opslag fra aula.posts.list. Udelad hele sektionen hvis tom.]

-----------------------------------------
[GENTAG PER BARN]:
<b>👤 [BARNETS NAVN]</b>
• <b>Opsamling:</b> [Vigtigste info fra ugen der gik]
• <b>Næste mandag:</b> <code>[Tid]</code> [Event/skema]
• <b>Husk:</b> [Evt. info om næste uges ugeplan]
```
