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
- [#2](https://github.com/hugofilipecosta/sourced/pull/2) — 2026-09-15, proposes **Europeana** (`eu`) as a new optional key-gated source; adapter drafted, CORS not independently curled (network egress blocked). Still awaiting human review/merge — not re-proposed here.

This file reconstructs the full history from both prior runs' branches (which
diverged from each other rather than stacking) so there's one coherent
record; if both PRs above merge separately, this file's history will need a
light manual reconcile, which is expected and left to the human reviewer.

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
     live check next run: (a) whether `collection.cooperhewitt.org` or
     `api.si.edu` is the better integration point, (b) real CORS behavior,
     (c) whether an OAuth2 token is a one-time setup or needs refreshing.
     Flagging for priority follow-up. **Resolved 2026-09-23 — see below.**

3. **Smithsonian Open Access API** (`https://api.si.edu`, keyed via
   `api.data.gov`) — the unified successor covering 19 Smithsonian museums
   including Cooper Hewitt, all CC0.
   - Access: free key via api.data.gov (the same gateway used by e.g. NASA's
     public APIs, which are commonly called directly from browser JS —
     reasonable but not independently confirmed CORS for this specific
     endpoint this run).
   - Design-forward: mixed — most of the 19 units are natural history/history
     museums, not design-forward; the design-relevant slice is really just
     the Cooper Hewitt portion of the corpus, which argues for evaluating
     Cooper Hewitt specifically (see above) rather than the whole unified
     API, to avoid diluting the feed with non-design Smithsonian content the
     way the "Openverse/Wikimedia are too noisy" precedent already warns
     against.
   - **Verdict: REJECT as a standalone add** (too broad/noisy for this use
     case) but keep the Cooper-Hewitt-via-si.edu question open per #2.

4. **Rijksmuseum API** (`https://www.rijksmuseum.nl/api/...` /
   `data.rijksmuseum.nl`) — Dutch national museum, 800k+ object records,
   600k+ public-domain images, prints/posters/design objects included.
   - Access: free key, Bearer-token auth per docs found.
   - CORS: not documented in the sources found this run ("unknown" per every
     aggregator that indexed it) — a real blocker for a browser-only static
     page until confirmed.
   - Non-redundant: partial at best — heavy overlap with AIC/V&A/Met in genre
     (public-domain fine art + some design objects from one national
     collection), and Europeana above already surfaces Dutch institutional
     content as part of its much broader net.
   - **Verdict: REJECT** — undocumented CORS plus meaningful overlap with
     what's already covered (directly and via Europeana) don't clear the
     bar this run.

5. **Flickr API** (`https://www.flickr.com/services/rest/`) — free key,
   supports JSONP (works around no-CORS, like the existing Tumblr adapter).
   Huge breadth including Flickr Commons (public-domain institutional
   photo archives) and design-focused groups/tags.
   - Design-forward: **fails on signal-to-noise** for the platform as a
     whole — Flickr is fundamentally a general-purpose photo host; anything
     design-relevant has to be cherry-picked by tag/group, which is exactly
     the kind of "noisy general-purpose media library" criterion #1 rules
     out (same reasoning as the existing Wikimedia off-by-default decision).
     Could revisit narrowly scoped to Flickr Commons only, but that's
     essentially "vintage institutional photos," redundant with the museum
     sources already integrated.
   - **Verdict: REJECT.**

6. **Digital Public Library of America (DPLA) API** — free key, aggregates
   US libraries/archives/museums.
   - Design-forward: weak — predominantly text documents, manuscripts,
     photographs of historical record rather than curated design/art
     objects; no strong graphic-design/poster signal the way Europeana's
     European design-museum contributors provide.
   - **Verdict: REJECT** — same aggregator idea as Europeana but with a
     materially weaker design signal in the underlying corpus.

7. **NYPL Digital Collections API** — free key.
   - Design-forward: weak for the same reason as DPLA — dominated by maps,
     manuscripts, and historical photographs rather than design/graphic-art
     material.
   - **Verdict: REJECT.** (Also now moot — see 2026-09-23 note: the NYPL
     Repo API is being deprecated August 2026 with no public replacement.)

8. **Internet Archive API/scraping API** — keyless, huge scale.
   - Design-forward: fails — general-purpose book/media archive, no
     curation signal at all; would be pure noise for this feed.
   - **Verdict: REJECT.**

### That run's proposal

Europeana (`eu`) passes all 5 criteria and was proposed as a new optional
(key-gated) source, following the same `keyGet()`-gated pattern as
Unsplash/Pexels/Pixabay — inactive until a key is present locally or via the
future `/api` proxy, so it ships with zero risk to the default experience.
See PR #2 (`research/weekly-source-scan-2026-09-15`) for the `index.html`
and `sources.md` changes — still open, awaiting human review as of this run.

---

## 2026-09-23

**Environment note:** same as the prior two runs — this sandbox's egress
proxy denies outbound `curl`/`WebFetch` to arbitrary third-party domains
(confirmed again this run: `api.europeana.eu`, `api.collection.cooperhewitt.org`,
`api.si.edu`, `www.brooklynmuseum.org`, `api.harvardartmuseums.org`,
`api.smk.dk`, `data.rijksmuseum.nl`, and `api.openverse.org` all returned
`connect_rejected` / policy-denied on the agent proxy). Research this run is
WebSearch-only (snippets of providers' own docs and third-party API
directories), same caveat as before. No new candidate reached "ship it"
confidence this run — see below.

No new adapter is proposed this run. `PROVIDERS`/`PROV_ORDER` in `index.html`
are unchanged from last run's read (Europeana from PR #2 is not yet merged).

### Carried-over open item, now resolved

**Cooper Hewitt, Smithsonian Design Museum API** (`https://api.collection.cooperhewitt.org/rest/`)
— flagged "DEFER, needs live CORS check" for two runs running. This run's
WebSearch turned up a third-party API index (publicapi.dev) that states
plainly: **"CORS: No"** for this API, consistent with the complete absence of
any browser-fetch usage example across every search result in any of the
three runs so far (only server-side Node/Python/PHP clients turn up). Taking
this as reliable enough to close the question without a live curl:
- **License:** collection metadata CC0; image rights per-object, not
  uniformly CC0 (unchanged finding from 2026-09-15).
- **Access:** free but non-trivial OAuth2 token setup (unchanged).
- **Verdict: REJECT for now** — without CORS, every request needs a
  server-side proxy. The design-museum content fit is still excellent (this
  remains, on paper, the single most on-brief source considered across all
  three runs), so this is a good candidate to revisit **if/when** the
  `api/` proxy is ever extended beyond LLM prompt generation to also hold
  image-source credentials/routing — explicitly out of scope for this
  agent to build (the brief is clear the proxy is prompt-generation-only
  and not to be touched), so left as a flagged idea for a human decision,
  not an action taken.

### New candidates considered

1. **Brooklyn Museum OpenCollection API** (`https://www.brooklynmuseum.org/opencollection/api`)
   - **Auth:** free self-serve API key (registration form). **CORS:** not
     documented anywhere findable this run — every code example found is
     server-side (PHP/Python), no browser-fetch usage turned up.
   - **License:** inconsistent per-item. Only pre-1923 US/foreign works are
     confirmed public domain; images the museum holds rights to are
     licensed CC BY 3.0 (usable), but a reported ~68,000 items are either
     "orphaned works" or otherwise rights-unclear, and the museum's own
     site copy leans on "noncommercial use with attribution," with paid
     licensing for commercial use of some images. That inconsistency —
     without a documented API filter to reliably select only the CC BY/PD
     subset (unlike Europeana's `reusability=open` or AIC's
     `is_public_domain`) — is a real risk of surfacing images Sourced
     shouldn't be feeding into commercial mood-board/prompt workflows.
   - **Content:** genuinely strong fit otherwise — decorative arts,
     photography, painting/sculpture across 100k+ catalogued objects, and
     would add a collection with a different curatorial voice than
     AIC/Met/V&A.
   - **Verdict: REJECT this run** — unconfirmed CORS plus no clean
     rights-filter parameter (the two things that made Europeana and AIC
     safe to integrate) leave this too risky to prototype blind. Worth a
     revisit if a live check ever confirms both.

2. **SFMOMA Collection API** (`sfmoma.org/api/collection/docs/`)
   - SFMOMA's own documentation page for the API currently states the
     service is **unavailable while undergoing maintenance/rework** — i.e.
     there's no live endpoint to integrate against right now regardless of
     CORS or licensing.
   - **Verdict: REJECT (criterion #2 — no functioning API at present).**
     Worth a status check in a future run in case it comes back; SFMOMA's
     collection (strong design, photography, architecture holdings) would
     otherwise have been a promising, genuinely non-redundant candidate.

3. **MoMA API** (`api.moma.org`)
   - MoMA does run a live REST API (objects/exhibitions/artists, JSON or
     XML) with real search endpoints, but its own docs state it is
     **restricted to MoMA staff and internal partners** — there is no
     public self-serve key.
   - MoMA separately publishes a **static open dataset on GitHub**
     (160k+ artworks, CC0) — but that dataset is collection *metadata*
     only; it does not reliably include usable hosted image URLs and isn't
     a queryable live API (no search/pagination/filtering endpoint, just
     flat CSV/JSON files), so it doesn't fit Sourced's `list(query, per,
     page)` fetch pattern at all.
   - **Verdict: REJECT (criterion #4 — no public key; and the CC0 fallback
     fails criterion #2 — not a real, queryable API for our purposes).**

4. **AIGA Design Archives** (`designarchives.aiga.org`)
   - The single most conceptually on-brief candidate considered this run —
     it's literally 20,000+ items from AIGA's national design competitions
     since 1924 (packaging, identity systems, typography, editorial,
     illustration). No official public API was found; the only
     programmatic access surfaced in search is an unofficial third-party
     scraper of AIGA's separate *designer directory* (not the archive
     collection itself, and scraping isn't a "real API" per criterion #2
     regardless).
   - **Verdict: REJECT (criterion #2 — no real API).** Flagging for
     awareness only, in case AIGA ever ships an official API — this would
     be an immediate strong candidate if so.

5. **Getty Museum Collection API** (`https://data.getty.edu/museum/collection/`)
   - **Auth:** keyless. **License:** Getty's Open Content Program releases
     public-domain object images free to download and reuse, no
     restrictions. **Content:** 250,000+ objects; Getty's photography
     holdings in particular are world-class and would be a genuinely new,
     design-adjacent editorial-photography vein.
   - **Structural concern:** the documented REST endpoints
     (`/museum/collection/<entity_type>/<entity_id>`) look like ID-based
     lookups against a Linked.Art/JSON-LD knowledge graph, not a
     query-string full-text search like AIC/V&A/Met's `?q=`-style
     endpoints — actual querying appears to go through a separate SPARQL
     endpoint, a meaningfully heavier integration (JSON-LD parsing,
     SPARQL query construction) than every other adapter in `PROVIDERS`,
     and CORS on either endpoint is unconfirmed.
   - **Redundancy concern:** much of the general collection (old master
     paintings, antiquities, manuscripts) would overlap the fine-art
     territory already covered by AIC/Met, similar to the SMK/Cleveland
     precedent — the photography collection specifically is the part that
     would add real daily-rotation variety, but the API doesn't appear to
     offer a way to scope a search to just that department.
   - **Verdict: DEFER, not rejected.** Worth a follow-up specifically to
     check (a) whether a browser-usable, query-string search endpoint
     exists anywhere in the Getty API surface (vs. SPARQL-only), and (b)
     live CORS headers, before deciding if the integration complexity is
     worth it for the photography-only slice.

### Also noted in passing (no action)

- **NYPL Digital Collections API** (rejected 2026-09-15 on weak
  design-signal grounds) is being **deprecated outright** — NYPL's own
  announcement states the Repo API shuts down August 2026 with no public
  replacement planned. Removing it from future consideration entirely
  rather than re-evaluating it.
- **Openverse** — re-confirmed still unreachable from this sandbox
  (`connect_rejected`), consistent with the standing "CORS disabled
  server-side" rejection in `sources.md`. No new information this run.

### Summary for next run

Two genuinely promising leads remain open and are the highest-value thing to
resolve first: **Europeana** (PR #2, needs a real CORS/query smoke test) and
**Getty's photography collection** (needs confirmation of a real search
endpoint, not just SPARQL). Cooper Hewitt is now closed out (no CORS,
proxy-only path, out of scope for now). Brooklyn Museum, SFMOMA, MoMA, and
AIGA are all closed out for concrete reasons (inconsistent licensing, API
down, key-gated to staff only, and no real API, respectively) rather than
left open.
