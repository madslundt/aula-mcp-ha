# Sunday prompt (next-week kickoff)

Runs Sunday evening. "Tomorrow" is Monday — already in next ISO week. Same shape as your original prompt, with `aula.posts.list` added.

**Important — anchor the dates before sending.** Your scheduler MUST replace `{{TODAY}}`, `{{TOMORROW}}` (Monday), and `{{NEXT_WEEK_ISOWEEK}}` with concrete values.

```text
Analysér data fra Aula og giv et ugeoverblik formateret som HTML til Telegram.

KONTEKST:
- I DAG er {{TODAY}} (søndag).
- I MORGEN er {{TOMORROW}} (mandag, første dag i ISO-uge {{NEXT_WEEK_ISOWEEK}}).

DATA:
- Find alle børn (kald `aula.discover` én gang).
- Beskeder: `aula.messages.list_threads` (sidste 7 dage; find vigtige
  deadlines og info for den kommende uge).
- Opslag (klassens nyhedsfeed): KALD ALTID `aula.posts.list` (limit=20).
  Aulas "Opslag"-feed (lærer-/skole-/klasse-info) — IKKE det samme som
  beskeder. Medtag alle opslag fra sidste 7 dage uden relevans-filter.
- Ugeplan: `aula.ugeplan.<provider>` for hvert barn med isoWeek for i morgen
  (mandag — som ligger i NÆSTE ISO-uge da søndag er sidste dag i indeværende).
  Brug hele ugens indhold som overblik.
- Kalender: `aula.calendar.events` med range="tomorrow" og profileIds.

REGLER:
- TIDSZONE: Serveren returnerer allerede dansk tid (Europe/Copenhagen).
  Gør INGEN konvertering.
- FORMAT: <b>fed</b> til navne, <code>kode</code> til tider, <blockquote> til vigtig info.
  Escape <, > og & i alt indhold fra Aula.

STRUKTUR:
<b>🚀 KLAR TIL EN NY UGE</b>
<b>🚨 VIGTIGT & HANDLING</b>
<blockquote>[Kritiske ting for hele ugen. Hvis intet: <i>Ingen akutte ændringer 🟢</i>.]</blockquote>

<b>📢 OPSLAG (sidste 7 dage)</b>
• <code>[dato]</code> <b>[titel]</b> — [1-linje sammenfatning]
[Gentag per opslag fra aula.posts.list. Udelad hele sektionen hvis tom.]

-----------------------------------------
[GENTAG PER BARN]:
<b>👤 [BARNETS NAVN]</b>
<b>📧 Vigtigt fra beskeder:</b>
• [Kort opsummering] (<code>[Dato]</code>)
<b>📅 Mandag & Ugeplan:</b>
• <code>[Tid]</code>: [Event]
• [Vigtigste lektie/fokus for ugen]
```
