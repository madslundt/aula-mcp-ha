/**
 * Home Assistant / Node-RED function node — Friday morning Aula wrap-up.
 *
 * Computes today, next Monday, and the ISO week of next Monday in
 * Europe/Copenhagen so the LLM has explicit dates to anchor on.
 */

const COPENHAGEN = 'Europe/Copenhagen';

const today = new Date();
const nextMonday = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);

const fmtDanish = (d) =>
  new Intl.DateTimeFormat('da-DK', {
    timeZone: COPENHAGEN,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);

const isoWeek = (d) => {
  const [y, m, day] = new Intl.DateTimeFormat('en-CA', {
    timeZone: COPENHAGEN,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .format(d)
    .split('-')
    .map(Number);
  const dt = new Date(Date.UTC(y, m - 1, day));
  const dayNum = dt.getUTCDay() || 7;
  dt.setUTCDate(dt.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(dt.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((dt.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${dt.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
};

const TODAY = fmtDanish(today);
const NEXT_MONDAY = fmtDanish(nextMonday);
const NEXT_ISOWEEK = isoWeek(nextMonday);

const text = `Analysér data fra Aula og giv en ugeafslutning formateret som HTML til Telegram.

KONTEKST:
- I DAG er ${TODAY}.
- NÆSTE MANDAG er ${NEXT_MONDAY}.
- KOMMENDE ISO-UGE: ${NEXT_ISOWEEK}.

DATA:
- Find alle børn (kald 'aula.discover' én gang).
- Beskeder: 'aula.messages.list_threads' (sidste 7 dage; fokusér på info om
  næste uge, weekend-arrangementer, eller noget der skal være klar mandag).
- Opslag (klassens nyhedsfeed): KALD ALTID 'aula.posts.list' (limit=20).
  Aulas "Opslag"-feed — IKKE det samme som beskeder.

  MEDTAG KUN opslag der enten:
    • kræver handling fra forælder (tilmelding, RSVP, samtykke, deadline),
    • beskriver en ændring der påvirker kommende uge eller weekend
      (aflysning, ændret tid/sted, vikar, ekstra ting at medbringe),
    • handler om et arrangement i weekenden eller fra og med ${NEXT_MONDAY}.

  UDELAD ALTID:
    • Madplaner, ugesedler, almindelige nyhedsbreve,
    • Tilbageblik, "snap fra ugen", hilsner, generelle opdateringer,
    • Opslag om arrangementer eller deadlines der allerede er passeret,
    • Ren info uden noget for forælderen at handle på.

  TJEK DATO I OPSLAGET: hvis indholdet refererer til en konkret dato/
  begivenhed FØR ${TODAY}, udelad det — uanset hvor nyligt det blev
  postet.
- Ugeplan: 'aula.ugeplan.<provider>' for hvert barn med isoWeek="${NEXT_ISOWEEK}".
  Brug ugeplanen til at fremhæve vigtigste fokus/lektier for kommende uge —
  særligt ${NEXT_MONDAY}.
- Kalender: 'aula.calendar.events' med range="next_week" og profileIds.
  Filtrér client-side til kun ${NEXT_MONDAY} (og evt. weekend-events).

REGLER:
- KUN MANDAG + WEEKEND: Spring eksplicit alt over der hører til ${TODAY}
  eller tidligere.
- FORMAT: <b>navne</b>, <code>tider</code>, <blockquote>vigtigt</blockquote>.
  Escape <, > og & i alt indhold fra Aula.

STRUKTUR:
<b>🏁 UGEAFSLUTNING & NÆSTE UGE</b>
<b>🚨 HUSK OVER WEEKENDEN</b>
<blockquote>[Ting der skal være klar til ${NEXT_MONDAY} — eller "Intet at huske 🟢".]</blockquote>

<b>📢 OPSLAG</b>
• <code>[dato]</code> <b>[titel]</b> — [1-linje sammenfatning]
[Gentag per opslag. Udelad hele sektionen hvis tom.]

-----------------------------------------
[GENTAG PER BARN]:
<b>👤 [BARNETS NAVN]</b>
• <b>Opsamling:</b> [Vigtigste info fra ugen der gik]
• <b>Næste mandag (${NEXT_MONDAY}):</b> <code>[Tid]</code> [Event/skema]
• <b>Husk:</b> [Evt. info om næste uges ugeplan]`;

return { ...msg, text };
