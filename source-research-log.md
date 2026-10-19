# Sourced — Weekly Source Research Log

Automated weekly scan for new image/visual-content sources to extend the
`PROVIDERS` map in `index.html`. Every candidate is checked against the 5
criteria in the standing prompt (design/art-forward content, real API,
permissive licensing, keyless+CORS or key-via-proxy, and non-redundancy with
existing sources / genuine daily-rotation value for the Featured feed).

---

## 2026-10-19

**Environment note:** as in every prior run, this sandbox cannot make live
outbound HTTP requests to third-party APIs (`WebFetch` fails DNS resolution
for every external host tried this run, including `api.artic.edu` — a
source already confirmed working in production — so this is a sandbox
limitation, not a signal about any candidate's actual reachability). All
findings below are desk research (official docs, search results) with CORS
and live-response behavior flagged as unconfirmed where that's the case.
Nothing here should be read as a live verification.

### Housekeeping: 6 prior weekly PRs are still open and unmerged
PRs #1–#6 (2026-09-07 through 2026-10-12) are all still open against `main`,
none merged or closed. Two of them (#2 and #6) independently propose adding
**Europeana** as an optional source — that candidate has now cleared desk
research twice without a human decision. Flagging this backlog explicitly
since the weekly cadence is starting to stack up faster than it's being
reviewed; no action taken on it from this agent (never merges its own work).

### Getty Museum Collection API — **upgraded from DEFER to REJECT**
- **Base:** `https://data.getty.edu/museum/collection/`
- **License:** CC0 for most Open Content Program objects.
- **Auth:** keyless.
- This candidate has been open since the 2026-09-23 run, deferred twice
  pending confirmation of whether a real query-string search endpoint
  exists (vs. SPARQL-only). This run found Getty's own API docs
  (`data.getty.edu/museum/collection/docs/`) confirming the documented REST
  surface is **entity-type + ID lookup only** (`/object/{id}`,
  `/person/{id}`, etc.), plus a separate SPARQL endpoint for graph queries.
  No text-search REST route (no `?q=`-style endpoint) is documented.
- **Verdict: REJECT (criterion 2).** The `PROVIDERS` adapter pattern needs a
  `list(query, per, page)`-shaped search call; Getty's API doesn't expose
  one without building a SPARQL query generator, a materially different
  integration from every other adapter in the codebase. Closing this out
  rather than carrying it forward again — would reopen only if Getty ships
  a documented text-search REST endpoint.

### Digital Public Library of America (DPLA) — reject
- **Base:** `https://api.dp.la/v2`
- **Auth:** free API key (email-delivered). **License:** varies per
  contributing institution (DPLA aggregates ~4,000+ libraries/archives/
  museums), not a single clear license — would need per-item rights
  filtering, unconfirmed if the API exposes a clean machine-readable filter
  for "openly licensed only" the way AIC's `is_public_domain` does.
- **Format:** JSON-LD — a heavier parse than every other adapter's flat
  JSON.
- **CORS:** unconfirmed; JSONP mentioned in third-party docs as a historical
  fallback, which hints CORS may not be reliably present.
- **Redundancy:** DPLA is a cross-institution aggregator, conceptually the
  same role Europeana already fills (but for US institutions) — and
  Europeana has already cleared desk research twice without being merged.
  Adding a second large aggregator before the first is resolved doesn't
  widen anything; it just duplicates the open question.
- **Verdict: REJECT (criteria 3/4/5)** — inconsistent per-item licensing,
  unconfirmed CORS, and redundant with the still-pending Europeana proposal.

### Wellcome Collection API — reject
- **Base:** `https://api.wellcomecollection.org/catalogue/v2`
- **Auth:** keyless. **License:** CC0 for Wellcome-created content; mixed/
  per-item for everything else (official docs: "if it's data that has been
  created by us, it's CC0; if it's not created by us, then it isn't").
- **Content:** Wellcome Collection is "the free museum and library for the
  incurably curious" — its core holdings are medical/scientific history,
  anatomical illustration, and health-related ephemera. It does include
  poster and graphic-design-adjacent material (e.g. public health
  campaigns), but that's a minority slice of a collection whose primary
  identity is medical heritage, not design/art.
- **Verdict: REJECT (criterion 1/5).** Same shape of problem that already
  rejected Science Museum Group: a real, keyless, well-documented API
  attached to a collection that isn't design-forward as a whole, with no
  confirmed API filter to scope down to just the design-relevant subset.
  Not worth the integration effort to go digging for one subset.

### Letterform Archive — reject
- Conceptually the best-fit candidate by subject matter found this run —
  dedicated to typography, lettering, and graphic design ephemera, with a
  public online archive (`oa.letterformarchive.org`, opened to all users).
- **Verdict: REJECT (criterion 2).** No public API or data export was found
  in web search — only a web viewer for browsing the archive interactively.
  Same failure mode as AIGA Design Archives (rejected 2026-09-23): great
  subject-matter fit, no programmatic access. Flagging for awareness only,
  same as AIGA — would be an immediate strong candidate if they ever ship
  an API.

### Ingenium (Canada's national museums of science and innovation) — reject
- **Base:** `https://api.ingeniumcanada.org` (migrating to `ingenium.ca`)
- **Auth:** API key required for all endpoints.
- **Content:** agriculture/food, aviation/space, communications, domestic
  technology, transportation, medicine, natural resources, sciences — no
  design-specific department.
- **Verdict: REJECT (criterion 1).** Same profile as the already-rejected
  Science Museum Group — a real API attached to a science/technology/
  industrial museum group, not a design/art one. Would add noise, not
  design-forward daily-rotation variety.

### Still-open leads carried forward (no new information this run)
These have cleared desk research on content/licensing grounds across
multiple runs but remain blocked purely on **live CORS/reachability
verification**, which this sandbox still cannot perform:
- **Library of Congress** (`www.loc.gov/search/?q=...&fo=json`) — keyless,
  strongest structural fit (posters, photographs, prints — `fo=json` on
  nearly any search). Highest priority for a real-browser smoke test.
- **Cooper Hewitt / Smithsonian Design Museum** (`api.collection.
  cooperhewitt.org`) — dedicated design museum, real API since 2015, but
  unreachable from every sandbox this task has run in so far (4 runs now).
- **Smithsonian Open Access** (`api.si.edu/openaccess`, scoped to
  `unit_code=CHSDM` for Cooper Hewitt's holdings specifically) — an
  alternative path to the same Cooper Hewitt content via api.data.gov,
  worth checking in case its gateway has different CORS behavior than
  Cooper Hewitt's own domain.
- **MAAS / Powerhouse Museum (Sydney)** — lower priority; design-forward
  and would add real geographic variety, but auth model, per-image license,
  and CORS are all still unconfirmed.

**Recommendation for the human reviewer:** the single highest-leverage next
step for this whole research thread isn't more desk research — it's a
2-minute real-browser check (open devtools, `fetch()` each of the four URLs
above with a dummy query) to resolve CORS one way or the other. Several
runs of search-only research have already converged on the same shortlist.

No new provider adapter proposed this run — nothing cleared all 5 criteria
with the confidence the bar requires. `sources.md` unchanged.
