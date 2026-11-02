# Sourced — Weekly Image Source Research Log

Autonomous weekly research run. See the routine prompt for the full
criteria (design-forward content, real API, permissive license, keyless+CORS
or free-key-via-proxy, non-redundant). Findings are appended per run, most
recent first is NOT enforced — entries are chronological, oldest first.

---

## 2026-11-02

First run. Current integrated sources (from `index.html` `PROVIDERS`/`PROV_ORDER`
and `sources.md`): Are.na (`ch`), Tumblr (`tb`), Art Institute of Chicago (`ai`),
V&A (`va`), Met (`me`) — on by default; Unsplash/Pexels/Pixabay (`un`/`px`/`pb`)
— optional, key-gated; Wikimedia (`wk`) — off by default, too noisy.

**Environment note:** this run could not make live outbound calls to candidate
API hosts (curl and WebFetch are restricted to an allowlist in this sandbox —
only `WebSearch` worked). So nothing below was verified with an actual request/
response or a real CORS header check. That's a meaningful gap for any "keyless
+ CORS" claim — treat every CORS verdict below as **unconfirmed, pending a real
browser/curl test** before any adapter lands. I'm flagging this explicitly
rather than guessing or drafting code against an unverified endpoint.

### Candidates considered

**Cooper Hewitt, Smithsonian Design Museum** — `https://api.collection.cooperhewitt.org/rest/` (legacy REST, OAuth2 access token) or a newer GraphQL endpoint per `apidocs.cooperhewitt.org`.
- License: per-object; `cc0: true` flagged on CC0 objects, full-res "original" image asset published only for CC0 items — clean to filter on, like AIC's `is_public_domain`.
- Access: free access token (register for one), not keyless. Acceptable under criterion 4b.
- Content fit: **excellent** — this is literally the Smithsonian's design museum: posters, typography, textiles, furniture, product/industrial design, grouped by maker. Best content-fit candidate found this run, by a wide margin.
- New ground: yes — nothing currently integrated is a dedicated design-museum collection; V&A is the closest comp but this would widen daily-rotation variety with a different maker pool (American/Smithsonian-affiliated designers vs. V&A's UK-weighted holdings).
- **Open risk:** CORS support is undocumented everywhere I could find (official docs silent, third-party API directories list it as "Unknown"). Docs also live scattered across several numbered mirror subdomains (`www-4.collection.cooperhewitt.org`, `www-6...`) and the official GitHub data repo hasn't been pushed since 2018 — mild signal the service may be under-maintained, though the API itself still appears to resolve in docs.
- **Verdict: promising, NOT drafted this run.** Needs a real browser-context fetch test for CORS before writing the adapter. Top priority for next run / for a human to spot-check.

**Europeana** — `https://api.europeana.eu/record/v2/search.json` (REST/JSON).
- License: official FAQ says the Search/Record/Entity/IIIF APIs support CORS for all offered APIs (if confirmed, this would be the one clearly-keyless+CORS win here — it uses a shared `api2demo` key for testing, production wants a free registered key, which is still fine under 4a/4b either way). Filterable to open licenses via `reusability=open` (public domain, CC0, CC BY, CC BY-SA) plus `qf=TYPE:IMAGE`.
- Content fit: mixed. It aggregates 50M+ items across thousands of European cultural institutions — includes genuinely strong design territory (Europeana Fashion's 1M+ fashion objects/illustrations, Rijksmuseum and MAK Vienna design holdings reachable through it) but also huge volumes of manuscripts, newspapers, random archival photos that are not design-forward at all. Same shape of risk that got Wikimedia turned off by default.
- Mitigation: Sourced already handles this exact problem for AIC/V&A by scoping every fetch to a design-topic query term (see `topics.md`) rather than browsing raw. The same pattern (curated query + `reusability=open` + `TYPE:IMAGE`) could plausibly keep Europeana's signal-to-noise acceptable — but creator/maker attribution through an aggregator (`dataProvider` field) is likely to be institution-level rather than a named maker, which would reproduce the known "museum curators are actually artists" seam, possibly worse (institution-level, not even artist-level).
- New ground: yes, and meaningfully so for daily-rotation variety — it's the one candidate that would add genuinely new institutions/visual territory (dozens of European museums/archives) rather than one more single-collection source.
- **Verdict: promising, NOT drafted this run.** Needs (a) a live CORS check, (b) a scoped-query trial to confirm the design-topic-query mitigation actually keeps results relevant before committing to a `groupByCreator`-style adapter.

**Digital Public Library of America (DPLA)** — `https://api.dp.la/v2` (REST/JSON), free self-service key via `api_key` param.
- Content: general US cultural-heritage aggregator — photographs, manuscripts, maps, newspapers. No design-specific focus found.
- CORS: no information found either way.
- **Verdict: reject.** Same noise profile as Wikimedia (general-purpose breadth, not design-forward); fails criterion 1. Not worth a proxy slot ahead of Europeana, which covers similar aggregator ground with better documented CORS and an explicit fashion/design thread.

**National Gallery of Art (NGA) Open Data** — `github.com/NationalGalleryOfArt/opendata`.
- Format: a CSV dataset dump (daily-updated), not a live queryable API — image files aren't even included, just references.
- **Verdict: reject.** Fails criterion 2 outright (no real API).

**Rijksmuseum** — `data.rijksmuseum.nl` / Rijksstudio API.
- License: CC0 — good.
- Access: requires a free API key (acceptable under 4b).
- CORS: unknown, no official statement found.
- Content: strong decorative-arts/print/costume holdings, but overlaps heavily with the "single Western museum, grouped by maker" shape Sourced already has three of (AIC, V&A, Met) — doesn't widen the kind of territory those don't already cover the way Europeana's multi-institution aggregation would.
- **Verdict: reject for now** (redundant relative to Europeana, which would cover similar ground plus much more, at the same unconfirmed-CORS risk level). Not worth stacking a fourth single-museum source this run.

**Harvard Art Museums API** — requires free key (`apikey` query param), CORS unconfirmed.
- Content: general fine-art collection, not specifically design/graphic/poster-forward; same "single museum" shape as AIC/Met/V&A with no distinguishing design angle.
- **Verdict: reject.** Redundant; doesn't clear criterion 5.

**Smithsonian Open Access (general, api.data.gov)** — aggregates all Smithsonian units (natural history, air & space, etc. — not just Cooper Hewitt).
- **Verdict: reject as a separate source.** The design-relevant slice of this is already better scoped by going directly to Cooper Hewitt's own API; the general SI aggregator would pull in a lot of non-design-forward museum content (same noise concern as DPLA/Wikimedia).

**NYPL Digital Collections** — requires an auth token; a (dated, 2017) maintainer comment says the image server itself is not CORS-enabled. Content is broad historical photos/prints/manuscripts, not specifically design-forward.
- **Verdict: reject.** Unconfirmed-but-leaning-negative CORS plus insufficient design focus.

### This run's outcome

No adapter drafted. Two real candidates (Cooper Hewitt, Europeana) look worth
pursuing, but I'm not confident enough to write and propose adapter code
against endpoints I could not actually call from this environment — that
would mean asking a human to review code for an API behavior I never
observed. Next run (or a human spot-check in a normal browser/dev environment)
should start by hitting both with a real `fetch()` from a page origin and
checking `Access-Control-Allow-Origin` on the response, then re-evaluate.
