# Sourced — Weekly Source Research Log

Automated weekly scan for new image/visual-content sources per the criteria in
the agent's standing brief (design-forward content, real API, permissive
license, keyless+CORS or free-key-via-proxy, non-redundant with existing
sources). One dated section per run. "No new candidates" weeks are logged too,
so this is a visible record that the scan actually ran.

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

Currently integrated (for reference, read from `PROVIDERS`/`PROV_ORDER` in
`index.html` at scan time): Are.na (`ch`), Tumblr (`tb`), Art Institute of
Chicago (`ai`), V&A (`va`), Met (`me`), Unsplash (`un`), Pexels (`px`),
Pixabay (`pb`); Wikimedia (`wk`) defined but off by default.

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
   - **Verdict: PASS all 5 criteria — adapter drafted this run** (see below).

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
     Flagging for priority follow-up.

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
   - **Verdict: REJECT.**

8. **Internet Archive API/scraping API** — keyless, huge scale.
   - Design-forward: fails — general-purpose book/media archive, no
     curation signal at all; would be pure noise for this feed.
   - **Verdict: REJECT.**

### This run's proposal

Europeana (`eu`) passes all 5 criteria and is proposed as a new optional
(key-gated) source, following the same `keyGet()`-gated pattern as
Unsplash/Pexels/Pixabay — inactive until a key is present locally or via the
future `/api` proxy, so it ships with zero risk to the default experience.
See the accompanying `index.html` and `sources.md` changes in this PR.
