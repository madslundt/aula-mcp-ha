# Weekday prompt (Monday–Thursday)

Runs each morning Mon–Thu. Mirrors your original prompt structure — minimal, per-child digest — with the class news-feed (`aula.posts.list`) added so "Orientering til forældre"-style announcements get captured.

**Important — anchor the date before sending the prompt.** Your scheduler (n8n / cron / Shortcut) MUST replace `{{TODAY}}` and `{{TOMORROW}}` with concrete dates before the LLM sees the prompt, otherwise the model will guess and leak today's content into tomorrow's digest. In n8n: `{{$now.format("yyyy-MM-dd, EEEE")}}` for today and `{{$now.plus({days:1}).format("yyyy-MM-dd, EEEE")}}` for tomorrow.

```text
Analysér data fra Aula og giv et dagligt overblik formateret som HTML til Telegram.

KONTEKST:
- I DAG er {{TODAY}}.
- I MORGEN er {{TOMORROW}}.

DATA:
- Find alle børn (kald `aula.discover` én gang — brug manifestens childIds,
  profileIds, institutionCodes og institutionProfileIds som angivet i usage).
- Beskeder: `aula.messages.list_threads` (sidste 7 dage; filtrér hårdt efter
  handling/ændring — aflysninger, tidsændringer, ekstra ting at medbringe,
  tilladelser eller eksplicit svar nødvendigt).
- Opslag (klassens nyhedsfeed): KALD ALTID `aula.posts.list` (limit=20).
  Dette er Aulas "Opslag"-feed (lærer-/skole-/klasse-info), IKKE det samme
  som beskeder. Medtag alle opslag fra sidste 7 dage — også "info-opslag"
  som "Orientering til forældre", "Madplan", arrangementer osv. Foretag IKKE
  en relevans-vurdering på opslag.
- Ugeplan: `aula.ugeplan.<provider>` for hvert barn (provider fra discover's
  capabilities.ugeplan.tools[0]). Beregn isoWeek for i morgen og filtrér til
  i morgen + overmorgen (spring weekend over).
- Kalender: `aula.calendar.events` med range="tomorrow" og profileIds per barn.

REGLER:
- TIDSZONE: Serveren returnerer allerede dansk tid (Europe/Copenhagen).
  Gør INGEN konvertering — vis tider som de er.
- KUN I MORGEN: Alt indhold (kalender, ugeplan, "VIGTIGT") skal handle om
  {{TOMORROW}}. Spring eksplicit alt over der hører til {{TODAY}} eller
  tidligere. Ugeplaner returneres ofte for hele ugen — find den dag der
  matcher {{TOMORROW}} og brug KUN den dags indhold. Hvis et element ikke
  kan dateres til {{TOMORROW}}, udelad det.
- FORMAT: <b>navne</b>, <code>tider</code>, <blockquote>vigtigt</blockquote>.
  Escape <, > og & i alt indhold fra Aula.

STRUKTUR:
<b>📅 DAGLIGT OVERBLIK</b>
<b>🚨 VIGTIGT & HANDLING</b>
<blockquote>[Aflysninger eller "husk-ting" til i morgen — eller "Ingenting i dag 🟢".]</blockquote>

<b>📢 OPSLAG (sidste 7 dage)</b>
• <code>[dato]</code> <b>[titel]</b> — [1-linje sammenfatning]
[Gentag per opslag fra aula.posts.list. Nyeste først. Udelad hele sektionen
 hvis listen er tom.]

-----------------------------------------
[GENTAG PER BARN]:
<b>👤 [BARNETS NAVN]</b>
• <code>[Tid]</code>: [Kalender-event i morgen]
• [Besked-highlight]
• [Ugeplan-highlight for i morgen]
```

## Why each step is there

- **Discover first**: tells the LLM which IDs go where. Without it, calls to `aula.posts.list` and `aula.calendar.events` use the wrong IDs and silently return empty.
- **`aula.posts.list` with no `institutionProfileIds`**: defaults to the guardian's full scope (all schools) — see the tool default. Pass an explicit subset only when you want to narrow.
- **No relevance filter on posts**: orientations and info posts don't always reference tomorrow — but you still want to see them. Messages keep the action-required filter because the inbox is noisier.
- **No timezone conversion**: the server returns Europe/Copenhagen with the correct dynamic offset (CET/CEST). A hard-coded `+2 timer` is wrong half the year.
