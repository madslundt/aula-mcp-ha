/**
 * Home Assistant / Node-RED function node — Sunday evening next-week kickoff.
 *
 * Computes today (Sunday) + tomorrow (Monday, first day of next ISO week)
 * in Europe/Copenhagen so the LLM has explicit dates to anchor on.
 */

const COPENHAGEN = 'Europe/Copenhagen';

const today = new Date();
const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

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
const TOMORROW = fmtDanish(tomorrow);
const NEXT_ISOWEEK = isoWeek(tomorrow); // Monday is day 1 of next ISO week

const text = `Analysér data fra Aula og giv et ugeoverblik formateret som HTML til Telegram.

KONTEKST:
- I DAG er ${TODAY} (søndag, sidste dag i indeværende ISO-uge).
- I MORGEN er ${TOMORROW} (mandag, første dag i ISO-uge ${NEXT_ISOWEEK}).

DATA:
- Find alle børn (kald 'aula.discover' én gang).
- Beskeder: 'aula.messages.list_threads' (sidste 7 dage; find vigtige
  deadlines og info for den kommende uge).
- Opslag (klassens nyhedsfeed): KALD ALTID 'aula.posts.list' (limit=20).
  Aulas "Opslag"-feed — IKKE det samme som beskeder.

  MEDTAG KUN opslag der enten:
    • kræver handling fra forælder (tilmelding, RSVP, samtykke, deadline),
    • beskriver en ændring der påvirker den kommende uge (aflysning,
      ændret tid/sted, vikar, ekstra ting at medbringe),
    • handler om et arrangement fra og med ${TOMORROW}.

  UDELAD ALTID:
    • Madplaner, ugesedler, almindelige nyhedsbreve,
    • Tilbageblik, "snap fra ugen", hilsner, generelle opdateringer,
    • Opslag om arrangementer eller deadlines der allerede er passeret,
    • Ren info uden noget for forælderen at handle på.

  TJEK DATO I OPSLAGET: hvis indholdet refererer til en konkret dato/
  begivenhed FØR ${TOMORROW}, udelad det — uanset hvor nyligt det blev
  postet.
- Ugeplan: 'aula.ugeplan.<provider>' for hvert barn med isoWeek="${NEXT_ISOWEEK}".
  Brug hele ugens indhold som overblik.
- Kalender: 'aula.calendar.events' med range="tomorrow" og profileIds per barn.

REGLER:
- KUN ${TOMORROW} + KOMMENDE UGE: Spring eksplicit alt over der hører til
  ${TODAY} eller tidligere.
- FORMAT: <b>fed</b> til navne, <code>kode</code> til tider, <blockquote> til vigtig info.
  Escape <, > og & i alt indhold fra Aula.

STRUKTUR:
<b>🚀 KLAR TIL EN NY UGE — uge ${NEXT_ISOWEEK}</b>
<b>🚨 VIGTIGT & HANDLING</b>
<blockquote>[Kritiske ting for hele ugen. Hvis intet: <i>Ingen akutte ændringer 🟢</i>.]</blockquote>

<b>📢 OPSLAG</b>
• <code>[dato]</code> <b>[titel]</b> — [1-linje sammenfatning]
[Gentag per opslag. Udelad hele sektionen hvis tom.]

-----------------------------------------
[GENTAG PER BARN]:
<b>👤 [BARNETS NAVN]</b>
<b>📧 Vigtigt fra beskeder:</b>
• [Kort opsummering] (<code>[Dato]</code>)
<b>📅 Mandag (${TOMORROW}) & Ugeplan:</b>
• <code>[Tid]</code>: [Event]
• [Vigtigste lektie/fokus for ugen]`;

return { ...msg, text };
