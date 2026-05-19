/**
 * Home Assistant / Node-RED function node — Mon–Thu morning Aula digest.
 *
 * Computes today + tomorrow + ISO week of tomorrow in Europe/Copenhagen
 * and inlines them into the prompt so the LLM has an unambiguous date
 * anchor. Without that, the model guesses "tomorrow" from whatever date
 * is most prominent in the fetched data and today's ugeplan leaks in.
 */

const COPENHAGEN = 'Europe/Copenhagen';

const today = new Date();
const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

/** "tirsdag 19. maj 2026" — Danish weekday + day + month + year. */
const fmtDanish = (d) =>
  new Intl.DateTimeFormat('da-DK', {
    timeZone: COPENHAGEN,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);

/** ISO week of a Date in Copenhagen time, formatted "YYYY-Www". */
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
  const weekNo = Math.ceil(((dt - yearStart) / 86400000 + 1) / 7);
  return `${dt.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
};

const TODAY = fmtDanish(today);
const TOMORROW = fmtDanish(tomorrow);
const ISOWEEK = isoWeek(tomorrow);

const text = `Analysér data fra Aula og giv et dagligt overblik formateret som HTML til Telegram.

KONTEKST:
- I DAG er ${TODAY}.
- I MORGEN er ${TOMORROW}.
- ISO-uge for i morgen: ${ISOWEEK}.

DATA:
- Find alle børn (kald 'aula.discover' én gang — brug manifestens childIds,
  profileIds, institutionCodes og institutionProfileIds som angivet i usage).
- Beskeder: 'aula.messages.list_threads' (sidste 7 dage; filtrér hårdt efter
  handling/ændring — aflysninger, tidsændringer, ekstra ting at medbringe,
  tilladelser eller eksplicit svar nødvendigt).
- Opslag (klassens nyhedsfeed): KALD ALTID 'aula.posts.list' (limit=20).
  Dette er Aulas "Opslag"-feed (lærer-/skole-/klasse-info), IKKE det samme
  som beskeder. Medtag alle opslag fra sidste 7 dage — også "info-opslag"
  som "Orientering til forældre", "Madplan", arrangementer osv. Foretag IKKE
  en relevans-vurdering på opslag.
- Ugeplan: 'aula.ugeplan.<provider>' for hvert barn (provider fra discover's
  capabilities.ugeplan.tools[0]). Brug isoWeek="${ISOWEEK}" og filtrér output
  til kun ${TOMORROW} (spring weekend og andre dage over).
- Kalender: 'aula.calendar.events' med range="tomorrow" og profileIds per barn.

REGLER:
- TIDSZONE: Serveren returnerer allerede dansk tid (Europe/Copenhagen).
  Gør INGEN konvertering — vis tider som de er.
- KUN I MORGEN: Alt indhold (kalender, ugeplan, "VIGTIGT") skal handle om
  ${TOMORROW}. Spring eksplicit alt over der hører til ${TODAY} eller
  tidligere. Ugeplaner returneres ofte for hele ugen — find kun den dag
  der matcher ${TOMORROW} og brug KUN den dags indhold. Hvis et element
  ikke kan dateres til ${TOMORROW}, udelad det.
- FORMAT: <b>navne</b>, <code>tider</code>, <blockquote>vigtigt</blockquote>.
  Escape <, > og & i alt indhold fra Aula.

STRUKTUR:
<b>📅 DAGLIGT OVERBLIK — ${TOMORROW}</b>
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
• [Ugeplan-highlight for ${TOMORROW}]`;

return { ...msg, text };
