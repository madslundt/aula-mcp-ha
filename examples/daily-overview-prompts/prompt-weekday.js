/**
 * Home Assistant function node — Mon–Thu morning Aula digest.
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
  Aulas "Opslag"-feed med lærer-/skole-/klasse-info — IKKE det samme som
  beskeder.

  MEDTAG KUN opslag der enten:
    • kræver handling fra forælder (tilmelding, RSVP, samtykke,
      svar nødvendigt, deadline),
    • beskriver en ændring der påvirker kommende dage (aflysning,
      ændret tid/sted, vikar, ekstra ting at medbringe),
    • handler om et arrangement eller en begivenhed der ligger
      i morgen (${TOMORROW}) eller senere.

  UDELAD ALTID:
    • Madplaner, ugesedler, almindelige nyhedsbreve,
    • Tilbageblik, "snap fra ugen", hilsner, generelle opdateringer,
    • Opslag om arrangementer eller deadlines der allerede er
      passeret (selv hvis opslaget blev postet for nyligt),
    • Ren info uden noget for forælderen at handle på.

  TJEK DATO I OPSLAGET: hvis indholdet refererer til en konkret dato/
  begivenhed, og den dato er FØR ${TOMORROW}, udelad opslaget — uanset
  hvor nyligt det blev postet. Det er informationen om kommende uger
  der har værdi, ikke historik.

  ATTRIBUER opslag til det rigtige barn: hver post har '_institutionCode'
  (skolens kode). Match den mod children[].institution.code fra discover —
  vis opslaget under det barn der hører til samme institution. Hvis et
  opslag ikke matcher nogen institution (fx kommunale opslag), vis det
  under alle børn.
- Ugeplan: 'aula.ugeplan.<provider>' for hvert barn (provider fra discover's
  capabilities.ugeplan.tools[0]). Brug isoWeek="${ISOWEEK}" og filtrér output
  til kun ${TOMORROW} (spring weekend og andre dage over).
- Kalender: 'aula.calendar.events' med range="tomorrow" og profileIds per barn.

REGLER:
- TIDSZONE: Serveren returnerer allerede dansk tid (Europe/Copenhagen).
  Gør INGEN konvertering — vis tider som de er.
- KUN I MORGEN gælder for kalender, ugeplan og "VIGTIGT" — spring alt over
  der hører til ${TODAY} eller tidligere. Opslag derimod vises uden
  dato-filter ud over "sidste 7 dage".
- FORMAT: <b>navne</b>, <code>tider</code>, <blockquote>vigtigt</blockquote>.
  Escape <, > og & i alt indhold fra Aula.

STRUKTUR:
<b>📅 DAGLIGT OVERBLIK — ${TOMORROW}</b>
<b>🚨 VIGTIGT & HANDLING</b>
<blockquote>[Aflysninger eller "husk-ting" til i morgen — eller "Ingenting i dag 🟢".]</blockquote>

-----------------------------------------
[GENTAG PER BARN]:
<b>👤 [BARNETS NAVN]</b>
• <code>[Tid]</code>: [Kalender-event i morgen]
• [Besked-highlight]
• [Ugeplan-highlight for ${TOMORROW}]
<i>📢 Opslag:</i>
• <code>[dato]</code> <b>[titel]</b> — [1-linje sammenfatning]
[Gentag per opslag der hører til dette barn (matchet via _institutionCode).
 Nyeste først. Udelad hele "Opslag"-linjen hvis ingen.]`;

return { ...msg, text };
