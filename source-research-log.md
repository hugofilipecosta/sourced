# Source Research Log

Weekly automated research notes on candidate image/visual-content sources for
Sourced's `PROVIDERS` map. Each dated section lists every candidate considered
that week, pass or fail, against the five criteria: (1) design/art-forward
content, (2) real API, (3) permissive licensing, (4) keyless+CORS or a
free-key source worth extending the serverless proxy for, (5) not redundant
with what's already integrated — including whether it would add genuine
day-to-day variety to the rotating Featured seed pool.

Currently integrated (read from `PROVIDERS`/`PROV_ORDER` in `index.html` at
time of writing): Are.na (`ch`), Tumblr (`tb`), Art Institute of Chicago
(`ai`), V&A (`va`), Met (`me`) — always on; Unsplash (`un`), Pexels (`px`),
Pixabay (`pb`) — optional/keyed; Wikimedia (`wk`) — off by default.

**Open PRs from prior runs (not yet merged as of this run):**
- [#1](https://github.com/hugofilipecosta/sourced/pull/1) — 2026-09-07, log-only, no candidate passed.
- [#2](https://github.com/hugofilipecosta/sourced/pull/2) — 2026-09-15, proposes **Europeana** (`eu`) as a new optional key-gated source; adapter drafted, CORS not independently curled (network egress blocked). Still awaiting human review/merge. **See the 2026-09-28 entry below — new information this run casts doubt on the CORS assumption this PR was drafted on; flagging for the reviewer before merging.**
- [#3](https://github.com/hugofilipecosta/sourced/pull/3) — 2026-09-23, log-only, no candidate passed. Closed out Cooper Hewitt (no CORS) and left Europeana + Getty photography as the two open leads.

This file reconstructs the full history from prior runs' branches (which
diverged from each other rather than stacking) so there's one coherent
record; if the open PRs above merge separately, this file's history will
need a light manual reconcile, which is expected and left to the human
reviewer.

---

## 2026-09-07

No adapter proposed this run. One strong candidate (Europeana) surfaced but
is being held for a follow-up verification pass rather than shipped on
unverified assumptions — see reasoning below. Full candidate list:

### Europeana Search API — provisional pass, held for verification
- **Base:** `https://api.europeana.eu/record/v2/search.json`
- **Auth:** free API key (self-serve since the May 2025 migration to
  Europeana's account portal) — not keyless, but a normal free-key source
  like Unsplash/Pexels/Pixabay.
- **CORS:** Europeana's own docs state CORS is supported on all their APIs
  (JSONP is also offered as a legacy fallback), so this should be directly
  callable from a static page without a proxy.
- **License:** per-item; filterable with `reusability=open`, which restricts
  results to Public Domain / CC0 / CC BY / CC BY-SA. Sourced already surfaces
  curator/attribution on hover, so CC BY / CC BY-SA items are usable, not
  just CC0/PD — worth carrying the exact license string through to the item
  so attribution can stay accurate.
- **Content:** Europeana aggregates ~4,000 European libraries, archives, and
  museums, and — notably — runs its own dedicated **Poster**, **Textile**,
  and **Fashion** topic collections (the Fashion strand alone aggregates
  700k+ objects from the V&A, Les Arts Décoratifs, MoMu Antwerp, and fashion
  house archives). That is genuinely new, non-US/UK-centric ground versus
  the current mix (AIC/Met are American, V&A is British, Are.na/Tumblr are
  platform-agnostic) and would meaningfully widen the daily rotation —
  different countries' design heritage surfacing on different days, not a
  reshuffle of what's already in the pool.
- **Why not shipped this run:** every `*.europeana.eu` / `*.eanadev.org`
  domain is unreachable from this sandbox's network egress policy, so I
  could not do a live smoke test. Two things need confirming with a real
  request before an adapter is safe to write: (a) the actual CORS response
  headers on a browser-origin request (docs say yes, but AIC/V&A-style
  reliability needs a real check, not just documentation), and (b) a facet
  or query strategy that reliably keeps results inside the design/art/
  poster/textile/fashion lane rather than Europeana's full general-purpose
  breadth (manuscripts, coins, natural-history specimens, etc.) — the same
  noise problem that got Wikimedia rejected. `qf=TYPE:IMAGE` filters to
  images but not to *design-forward* images.
- **Recommendation:** next run (or a human with 10 minutes and a browser
  console), do `fetch('https://api.europeana.eu/record/v2/search.json?wskey=KEY&query=poster&reusability=open&qf=TYPE:IMAGE')`
  from an actual page origin, inspect the CORS headers, and check whether
  scoping to `qf=europeana_collectionName:*` or the poster/textile/fashion
  topic-collection IDs keeps results clean. If both check out, this is a
  same-day adapter (same shape as `P_AIC`/`P_VAM`, license carried per item).

### Cooper Hewitt, Smithsonian Design Museum API — strong candidate, held for verification
- **Base:** `https://api.collection.cooperhewitt.org/rest/`
- **Auth:** free self-serve OAuth2 access token (not a simple query-string
  key, but same tier of friction as the existing optional sources).
- **License:** collection *metadata* is CC0; **image** rights are per-object
  and not uniformly CC0 — would need the same kind of public-domain filter
  AIC applies (`is_public_domain`), but I couldn't confirm the exact field
  name for image usage rights from documentation alone.
- **Content:** this is about as good as criterion #1 gets — it's literally
  the Smithsonian's dedicated design museum (textiles, wallcoverings,
  furniture, product design, posters, drawings), and would be genuinely new
  ground (Cooper Hewitt's holdings don't meaningfully overlap V&A's or
  AIC's design departments) with real daily-rotation upside.
- **Why not shipped this run:** `collection.cooperhewitt.org` and
  `api.collection.cooperhewitt.org` are both unreachable from this sandbox,
  so CORS support could not be verified — no browser-fetch example or CORS
  discussion turned up in search either, only server-side/Node/Python
  clients. Shipping an adapter on an unverified CORS assumption risks a
  silently-broken source. Also need the per-object rights field name
  confirmed via a live response before the public-domain filter can be
  written correctly.
- **Recommendation:** same as Europeana — worth a real network test before
  writing the adapter. If CORS turns out to be missing, this is a good
  candidate to eventually route through an extended `api/` proxy, since the
  design-museum fit is strong enough to justify it.

### Statens Museum for Kunst (SMK) API — reject
- **Base:** `https://api.smk.dk/api/v1/art/search`
- **Auth:** keyless; **License:** CC0 for public-domain works; generally
  described as a browser-friendly, CORS-enabled API (frequently used in
  cultural-heritage-API tutorials/hackathons for exactly that reason).
- **Verdict:** rejected on criterion #1/#5, not access. SMK's own
  documentation describes its holdings as the Royal Collection of Painting &
  Sculpture (~10,500 works) plus the Royal Collection of Graphic Art — i.e.
  it's Denmark's national **fine-art** gallery, not an applied-arts/design
  museum. That's the same redundancy problem that already got Cleveland
  Museum of Art rejected ("too fine-art-heavy for design inspiration") — it
  wouldn't widen the design lane, just add more paintings alongside AIC/Met.

### Rijksmuseum API (Rijksstudio) — reject
- **Base:** `https://data.rijksmuseum.nl` (formerly `www.rijksmuseum.nl/api`)
- **Auth:** free API key; **License:** CC0 for public-domain works.
- **Verdict:** rejected on criterion #4. Documentation and third-party
  client libraries consistently note the API does **not** send CORS
  headers — it's designed for server-side use, so every request would need
  to go through a backend proxy, a materially bigger lift than "hold one
  extra key server-side." Content is also mostly Dutch Golden Age painting,
  overlapping with AIC/Met/V&A rather than opening new ground.

### Harvard Art Museums API — reject
- **Base:** `https://api.harvardartmuseums.org`
- **Auth:** free API key (2,500 calls/day limit); CORS unconfirmed.
- **Verdict:** rejected on criterion #3. Harvard's own terms restrict API
  use to **non-commercial purposes only**, and individual image records
  carry a further per-object access level (public vs. restricted). That's a
  materially more restrictive license than every other integrated source,
  and a bad fit for a tool whose output (curated mood boards → generation
  prompts) may end up in commercial use by the curators using Sourced.

---

## 2026-09-15

**Environment note:** this run's sandbox blocks outbound `curl`/`WebFetch` to
arbitrary third-party domains (org egress policy), so live endpoint checks
(exact CORS headers, live JSON shape) could not be independently curled this
week. Findings below are based on WebSearch snippets of each provider's own
docs/FAQ pages plus general knowledge of established API gateways, and are
flagged as such where relevant. Recommend the human reviewer do one live
`fetch()` smoke test of the Europeana adapter below (with a real `wskey`)
before merging.

### Candidates considered

1. **Europeana** — `https://api.europeana.eu/record/v2/search.json`
   - License: per-item, but the Search API can be filtered to
     `reusability=open` (Europeana's own composite flag for CC0 / Public
     Domain Mark / unrestricted CC-BY-type reuse), so we only pull items
     Europeana itself marks as openly reusable.
   - Access: free API key (`wskey`, self-serve signup) — not keyless. CORS:
     Europeana's own API FAQ states "Europeana supports CORS for all the
     APIs that they offer" (JSONP is offered too but deprecated in favor of
     CORS) — a first-party claim, not independently curled this run.
   - Design-forward: strong. Europeana aggregates ~50M objects from
     thousands of European libraries, museums and archives, with deep
     holdings of exactly the kind of material Sourced wants: WWI/WWII and
     interwar propaganda + advertising posters, Art Nouveau and Bauhaus-era
     graphic design, early European typography and book design, textile and
     industrial design archives from national design museums across many
     countries. Filterable to `TYPE:IMAGE` to drop text/video/sound records.
   - Non-redundant: **yes, meaningfully**. Everything currently integrated is
     either a single UK/US institution (V&A, AIC, Met), a general-purpose
     curation platform (Are.na, Tumblr), or generic stock photography
     (Unsplash/Pexels/Pixabay). Europeana is the only pan-European,
     multi-institution aggregator in the mix — it's a different *shape* of
     source (thousands of contributing institutions, not one), which
     directly serves the standing daily-rotation-variety principle: the
     underlying corpus is large and geographically/stylistically distinct
     enough that rotating seed terms through it will keep surfacing genuinely
     new visual territory (e.g. Dutch/German/French/Nordic design archives)
     rather than repeating what AIC/V&A/Met already cover.
   - Risk/open questions: free-tier rate limits (historically on the order of
     low thousands of requests/day, exact current limits not independently
     confirmed this run) — fine for a per-user browser key or a lightly-used
     proxy, worth re-checking under real traffic. Also needs a place to hold
     the key: same open question as Unsplash/Pexels/Pixabay today (local key
     entry, or the future `/api` proxy).
   - **Verdict: PASS all 5 criteria — adapter drafted this run**, see PR #2.

2. **Cooper Hewitt, Smithsonian Design Museum API**
   (`https://api.collection.cooperhewitt.org/rest/`) — the single most
   on-the-nose fit conceptually: it *is* a design museum (product design,
   textiles, wallcoverings, drawings, prints), collection metadata released
   under CC0.
   - Access: not a simple free-signup key like AIC/V&A — requires creating a
     Cooper Hewitt account and an OAuth2 access token per their "how to"
     docs. Workable (a one-time baked token, same pattern as the Tumblr
     consumer key), but heavier friction than the other museum sources.
   - CORS: not confirmed either way this run (couldn't curl it).
   - Risk: search results (not fetchable this run) suggested some API
     parameters/behavior have shifted since Smithsonian's 2020 unified
     "Smithsonian Open Access" (`api.si.edu`, api.data.gov-gated) launch,
     which now also carries Cooper Hewitt's collection. Unclear this run
     whether the standalone `collection.cooperhewitt.org` API is still the
     recommended path vs. going through `api.si.edu` instead.
   - **Verdict: DEFER, not rejected.** Genuinely promising (design-museum
     content is exactly on-brief, and would widen daily rotation with
     product/textile/wallpaper design not covered by V&A alone) but needs a
     live check next run. **Resolved 2026-09-23 — see below.**

3. **Smithsonian Open Access API** (`https://api.si.edu`, keyed via
   `api.data.gov`) — the unified successor covering 19 Smithsonian museums
   including Cooper Hewitt, all CC0.
   - Design-forward: mixed — most of the 19 units are natural history/history
     museums, not design-forward; the design-relevant slice is really just
     the Cooper Hewitt portion of the corpus, which argues for evaluating
     Cooper Hewitt specifically rather than the whole unified API, to avoid
     diluting the feed the way the "Openverse/Wikimedia are too noisy"
     precedent already warns against.
   - **Verdict: REJECT as a standalone add** (too broad/noisy for this use
     case) but keep the Cooper-Hewitt-via-si.edu question open per #2.

4. **Rijksmuseum API** — undocumented CORS plus meaningful overlap with
   what's already covered (directly and via Europeana). **Verdict: REJECT.**

5. **Flickr API** — fails on signal-to-noise for the platform as a whole;
   general-purpose photo host, same reasoning as the existing Wikimedia
   off-by-default decision. **Verdict: REJECT.**

6. **Digital Public Library of America (DPLA) API** — weak design signal,
   predominantly text documents/manuscripts/historical-record photographs.
   **Verdict: REJECT.**

7. **NYPL Digital Collections API** — weak design signal for the same
   reason as DPLA. **Verdict: REJECT.**

8. **Internet Archive API/scraping API** — general-purpose book/media
   archive, no curation signal. **Verdict: REJECT.**

### That run's proposal

Europeana (`eu`) passes all 5 criteria and was proposed as a new optional
(key-gated) source, following the same `keyGet()`-gated pattern as
Unsplash/Pexels/Pixabay — inactive until a key is present locally or via the
future `/api` proxy, so it ships with zero risk to the default experience.
See PR #2 (`research/weekly-source-scan-2026-09-15`) for the `index.html`
and `sources.md` changes — still open, awaiting human review as of this run.

---

## 2026-09-23

**Environment note:** same as the prior run — this sandbox's egress proxy
denies outbound `curl`/`WebFetch` to arbitrary third-party domains
(confirmed again this run: `api.europeana.eu`, `api.collection.cooperhewitt.org`,
`api.si.edu`, `www.brooklynmuseum.org`, `api.harvardartmuseums.org`,
`api.smk.dk`, `data.rijksmuseum.nl`, and `api.openverse.org` all returned
`connect_rejected` / policy-denied on the agent proxy). Research this run is
WebSearch-only. No new candidate reached "ship it" confidence this run.

No new adapter is proposed this run. `PROVIDERS`/`PROV_ORDER` in `index.html`
are unchanged from last run's read (Europeana from PR #2 is not yet merged).

### Carried-over open item, now resolved

**Cooper Hewitt, Smithsonian Design Museum API** — flagged "DEFER, needs live
CORS check" for two runs running. This run's WebSearch turned up a
third-party API index (publicapi.dev) that states plainly: **"CORS: No"**
for this API, consistent with the complete absence of any browser-fetch
usage example across every search result in any run so far.
- **Verdict: REJECT for now** — without CORS, every request needs a
  server-side proxy, explicitly out of scope for this agent to build. Good
  candidate to revisit if the `api/` proxy is ever extended to hold
  image-source credentials — a human decision, not an action for this run.

### New candidates considered

1. **Brooklyn Museum OpenCollection API** — unconfirmed CORS plus no clean
   rights-filter parameter (inconsistent per-item licensing, ~68,000 items
   rights-unclear). **Verdict: REJECT this run.**
2. **SFMOMA Collection API** — the API itself is currently down for
   maintenance/rework per SFMOMA's own docs page. **Verdict: REJECT
   (criterion #2 — no functioning API at present).**
3. **MoMA API** (`api.moma.org`) — restricted to MoMA staff/internal
   partners, no public key; the separate CC0 GitHub dataset is static
   metadata only, not a queryable live API. **Verdict: REJECT (criteria
   #2 and #4).**
4. **AIGA Design Archives** — no official public API found (only an
   unofficial scraper of an unrelated designer-directory page).
   **Verdict: REJECT (criterion #2).** Flagged for awareness — would be an
   immediate strong candidate if AIGA ever ships an official API.
5. **Getty Museum Collection API** (`https://data.getty.edu/museum/collection/`)
   - Keyless; CC0 Open Content Program; 250,000+ objects, world-class
     photography holdings.
   - Structural concern: the documented REST endpoints look like ID-based
     lookups against a Linked.Art/JSON-LD knowledge graph, not a
     query-string full-text search like AIC/V&A/Met's `?q=`-style
     endpoints — actual querying appears to go through a separate SPARQL
     endpoint, meaningfully heavier integration than every other adapter in
     `PROVIDERS`, and CORS on either endpoint is unconfirmed.
   - Redundancy concern: much of the general collection (old master
     paintings, antiquities, manuscripts) would overlap AIC/Met; the
     photography collection specifically is the part that would add real
     daily-rotation variety, but the API doesn't appear to offer a way to
     scope a search to just that department.
   - **Verdict: DEFER, not rejected.** Worth a follow-up specifically to
     check whether a browser-usable, query-string search endpoint exists
     anywhere in the Getty API surface (vs. SPARQL-only), and live CORS
     headers. **Carried over to 2026-09-28 — see below; still unresolved.**

### Also noted in passing (no action)

- **NYPL Digital Collections API** — NYPL's own announcement states the
  Repo API shuts down August 2026 with no public replacement. Removing it
  from future consideration entirely.
- **Openverse** — re-confirmed still unreachable from this sandbox,
  consistent with the standing "CORS disabled server-side" rejection in
  `sources.md`.

### Summary for next run

Two genuinely promising leads remain open: **Europeana** (PR #2, needs a real
CORS/query smoke test) and **Getty's photography collection** (needs
confirmation of a real search endpoint, not just SPARQL).

---

## 2026-09-28

**Environment note:** same standing constraint, fourth run in a row — this
sandbox's egress proxy denies outbound `curl`/`WebFetch` to arbitrary
third-party domains. Confirmed again this run via a direct proxy-status
check (`$HTTPS_PROXY/__agentproxy/status`): `api.europeana.eu` logged as
`connect_rejected` (gateway 403 to CONNECT), and `WebFetch` calls to
`europeana.atlassian.net`, `data.getty.edu`, `www.loc.gov`, and
`libraryofcongress.github.io` all returned `EGRESS_BLOCKED` outright — so
even the newer `WebFetch` tool available to this session can't reach
arbitrary provider docs, only `WebSearch` (which hits an allowlisted search
backend) works for source research. Live CORS verification remains
impossible from this environment; everything below is WebSearch-snippet
based, same caveat as the last three runs.

**No new adapter is proposed this run** — nothing cleared the "ship it" bar
with independently-verifiable CORS, consistent with the standing rule not to
force an addition. `PROVIDERS`/`PROV_ORDER` in `index.html` are unchanged
from last run's read.

### Important update on the open Europeana PR (#2)

This run turned up a **contradicting signal** on Europeana's CORS support
that the reviewer of PR #2 should weigh before merging. Previous runs relied
on Europeana's own API FAQ, which states CORS is supported for all their
APIs. This run, a WebSearch for browser-fetch usage of the Europeana API
surfaced a third-party CORS-troubleshooting write-up (corsfix.com) whose
summary states plainly that **"the Europeana API does not support CORS, so
direct browser requests may fail due to CORS restrictions"** and recommends
routing through a backend/proxy. That is a direct contradiction of the
FAQ-based assumption PR #2's adapter was drafted on. I could not adjudicate
between the two claims this run (both `europeana.eu` and the FAQ's
Atlassian-hosted page are blocked from this sandbox), so I'm not touching PR
#2 myself — but flagging this clearly: **before merging PR #2, do one real
`fetch()` from an actual page origin and inspect the response headers.** If
CORS is in fact missing, the Europeana adapter would need to move behind the
`api/` proxy rather than calling the API directly from the browser, which is
a materially different (bigger) change than what's currently in that PR.

### Getty Museum Collection API — carried over, still unresolved

Re-searched this run (`data.getty.edu/museum/collection/docs/`). No new
information beyond what 2026-09-23 already found: search results
consistently describe the API as built on a Linked Data/JSON-LD knowledge
graph with a SPARQL endpoint for custom queries, and no search result
surfaced a documented `?q=`-style REST search endpoint or any browser-fetch
CORS example. Status unchanged: **DEFER.** This is now the third run this
lead has gone unresolved without a way to independently verify it from this
sandbox — flagging that a human with unrestricted network access is the
fastest way to close this out, one way or the other.

### New candidates considered

1. **Library of Congress (`loc.gov`) JSON API** — `https://www.loc.gov/search/`,
   `https://www.loc.gov/collections/` (append `&fmt=json`)
   - **Auth:** confirmed keyless — LOC's own docs state the JSON/YAML API
     requires no API key or authentication at all, the most permissive
     access tier of anything considered across all four runs.
   - **License:** per-item rights statements (LOC carries a `rights`/
     "no known restrictions" field per record, similar in spirit to AIC's
     `is_public_domain`); the collections most relevant here (WPA posters,
     WWI posters, Spanish Civil War posters, Prints & Photographs Division
     holdings) are overwhelmingly public-domain US government/historical
     material.
   - **Content — genuinely strong fit:** LOC maintains dedicated, named
     poster collections (Posters: WPA, Posters: WWI, Posters: Spanish Civil
     War, Posters: Performing Arts, Posters: Artist) plus the broader Prints
     & Photographs Division (FSA/OWI documentary photography, historic
     advertising, graphic design ephemera). This is squarely
     poster/graphic-design/editorial-photography territory per criterion
     #1, and it's a *different visual register* than anything currently
     integrated — 20th-century American political/propaganda/theatrical
     graphic design, distinct from V&A's British design-museum holdings,
     AIC/Met's fine-art-adjacent collections, and Are.na/Tumblr's
     contemporary platform content. That's a real, non-overlapping
     contribution to the daily-rotation variety the standing principle
     asks about, not a reshuffle of existing ground.
   - **Structural fit:** the `/search` and `/collections/{name}` endpoints
     accept a free-text `q=` param and `fmt=json`, paginate, and return an
     `image_url` array per result plus `title`/`contributor`/`date` fields
     — the same query-string-search shape as `P_AIC`/`P_VAM`/`P_MET`, so an
     adapter would follow the existing pattern directly rather than needing
     new integration machinery (unlike Getty's SPARQL problem above).
   - **Why not shipped this run:** CORS is the one thing I could not confirm.
     LOC's docs, tutorials, and third-party discussions found this run all
     describe the API as intended for public web use but none explicitly
     state or demonstrate a browser-side `fetch()` call with CORS headers
     — every code example found is server-side. Given AIC/V&A/Met all *do*
     support this pattern and it's undocumented either way for LOC, this is
     a "likely but unverified" case, not a confirmed pass — same bar applied
     to Europeana/Cooper Hewitt/Getty in prior runs.
   - **Verdict: PROVISIONAL PASS, held for CORS verification.** This is now
     the strongest new lead surfaced since Europeana — genuinely
     design-forward, keyless (simpler than Europeana's key requirement),
     non-redundant, and structurally a drop-in adapter. Recommend this be
     the first thing checked with real network access: `fetch('https://www.loc.gov/search/?q=poster&fo=json')`
     from a real page origin and inspect the response headers.

2. **Museum of Applied Arts & Sciences (MAAS / Powerhouse Museum, Sydney)**
   — `https://api.maas.museum` (REST) / `https://api.maas.museum/search`
   (Elasticsearch-backed search proxy)
   - **Content:** MAAS's own description of its collection scope explicitly
     includes "design, industry, decorative arts" alongside science/tech/
     transport — genuinely design-forward material, and Australian in
     origin, which would be new geographic/cultural territory (everything
     currently integrated is US/UK/platform-agnostic).
   - **Auth:** unclear from documentation found this run — no explicit
     mention of an API key requirement, but also not confirmed keyless;
     `api.maas.museum/docs` exists but wasn't reachable to confirm.
   - **License:** not confirmed this run — MAAS's own messaging is
     open-data-friendly in spirit ("where possible their data should be
     public") but no specific CC license string for images was found,
     unlike AIC's explicit CC0/public-domain flag or Europeana's
     `reusability=open`.
   - **Verdict: DEFER, not rejected.** Promising on content and geography,
     but too many open questions (auth model, per-image license, CORS) to
     evaluate further without live access. Lower priority than LOC and
     Getty for a follow-up check, since the design-forward slice is mixed
     in with a larger science/technology/transport collection that would
     need query-time filtering to stay on-brief.

3. **Science Museum Group API** (`api.sciencemuseumgroup.org.uk` /
   `collection.sciencemuseumgroup.org.uk`)
   - **Content:** the museum group's own description of its collection is
     "science, technology, engineering, medicine, transport and media"
     across five UK science/technology museums (Science Museum London,
     Science and Industry Museum Manchester, National Railway Museum,
     National Science and Media Museum, Locomotion). This is not a
     design-forward collection in the way V&A or Cooper Hewitt are — it's
     scientific instruments, engineering artifacts, and transport, with
     design/graphic material at most a minor slice.
   - **License:** metadata fields are CC0, but "imagery and photography:
     the licensing and copyright varies per image" — the same kind of
     inconsistent per-image licensing that already got Brooklyn Museum
     rejected, with no confirmed API filter to select only the openly
     licensed subset.
   - **Verdict: REJECT.** Fails criterion #1 (this is a science/technology
     museum group, not a design/art one — closer in spirit to "generic
     institutional archive" than to V&A/Cooper Hewitt) and criterion #3
     (inconsistent per-image licensing, no clean filter). Not a good use of
     integration effort even before touching the CORS question.

### Summary for next run

Three open leads now, in priority order for the next run's live-verification
pass if network access ever allows it: **Library of Congress** (new this
run, keyless, strongest structural fit — highest priority), **Europeana**
(PR #2 — now flagged with a contradicting CORS signal that needs resolving
one way or the other before merge, not just a smoke test), and **Getty's
photography collection** (third run running with no new information — needs
either a resolution or should be downgraded to closed-pending-info next
time if a fourth run also turns up nothing new). MAAS is a lower-priority
DEFER pending basic auth/license/CORS facts. Science Museum Group and Cooper
Hewitt are closed out for concrete reasons and shouldn't be re-litigated
absent new information (e.g. an API redesign).
