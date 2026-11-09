# Sourced — Weekly Image Source Research Log

Automated weekly research into new image/visual-content sources for the
`PROVIDERS` map in `index.html`. See `CLAUDE.md` for architecture and
`sources.md` for the current source list. Criteria used each run: (1)
genuinely design/art-forward content, (2) real API (not scrape-only), (3)
permissive licensing for this use case, (4) keyless+CORS, or key-gated but
proxy-worthy, (5) not redundant with what's already integrated — and whether
it would meaningfully widen the daily-rotating Featured feed
(`FEATURED_SEEDS` / `featuredQ`), not just duplicate existing territory.

---

## 2026-11-09

**Note on this run's constraints:** this session's outbound network policy
blocked direct verification (`curl`, `WebFetch`) of *every* external API
domain tested — including `api.artic.edu`, one of Sourced's own existing,
already-working providers, as a sanity check. So no CORS header could be
empirically confirmed or denied for any candidate below; everything is from
documentation/community sources via web search only. Given that, nothing
below was drafted into code this run — a candidate needs an actual
`fetch()` test from a browser (or at least a `curl -I` from an
unconstrained network) before it's safe to wire in as keyless+CORS. Flagging
this for a human to either unblock outbound network access for future runs,
or spot-check the flagged candidates below manually.

### Candidates considered

1. **SMK Open API (Statens Museum for Kunst / National Gallery of Denmark)**
   — `https://api.smk.dk/api/v1/art/search`. Keyless per third-party dev
   listings (no official CORS statement found). License: SMK publishes most
   collection data/images for free reuse where rights allow. **Verdict:
   reject.** Collection is overwhelmingly Danish/European fine-art paintings
   and a large prints-on-paper archive — no dedicated design/poster
   collection surfaced in research. Same territory as AIC/V&A/Met already
   cover; wouldn't meaningfully widen daily-rotation variety.

2. **Cooper Hewitt, Smithsonian Design Museum (via Smithsonian Open Access,
   `api.si.edu/openaccess/api/v1.0`, free key via api.data.gov)** — exactly
   the kind of design-forward content (posters, textiles, product/industrial
   design) Sourced wants. **Verdict: reject.** Cooper Hewitt's own developer
   docs state collection *data* is CC0 but explicitly *excludes images* from
   that grant — i.e. the images themselves aren't reliably openly licensed
   through this API. One secondary source also flagged the Open Access
   `/content/:id` endpoint as inconsistent about returning image URLs at
   all. An image-first curation app can't build on an API whose images
   aren't dependably there or dependably licensed. Worth re-checking if
   Smithsonian changes that policy.

3. **Rijksmuseum API** — `data.rijksmuseum.nl` / `www.rijksmuseum.nl/api`.
   Needs a free key via a Rijksstudio account (not keyless). Images:
   public-domain / CC0-leaning per the museum's own reuse policy — good.
   **Verdict: reject (for now).** Content is predominantly Dutch Golden Age
   painting; doesn't add new design-forward ground over AIC/V&A/Met, and the
   key requirement adds proxy work that isn't justified by the content gain.

4. **Harvard Art Museums API** — `api.harvardartmuseums.org`. Needs a free
   key. **Verdict: reject.** Per Harvard's own licensing docs, image reuse
   rights are non-uniform across the collection — plenty of objects are
   display-only / rights-restricted, with no way to resolve a usable image
   URL for those via this key tier. Fails the "reasonably permissive
   licensing" bar as a blanket source; would need per-item rights filtering
   Sourced doesn't currently do for any provider.

5. **Europeana API** — `api.europeana.eu`. Needs a free key. Aggregates
   thousands of European cultural institutions, can filter to
   `reusability=open` and large images, and has a dedicated Art History
   sub-collection (claimed 125k+ items). Genuinely could widen daily
   rotation (lots of European poster/graphic-design-adjacent holdings
   reachable via its facets). **Verdict: hold, not drafted.** CORS
   unconfirmed this run; per-item licensing still varies even inside
   "reusability=open" in practice (mixes CC0 through CC-BY-SA); and it's a
   bigger integration (facet tuning to avoid noise) than this run could
   verify live. Good candidate to revisit with live testing — tentatively
   the most promising "needs the proxy" candidate of the week.

6. **DPLA (Digital Public Library of America) API** — `api.dp.la`. Needs a
   free key. **Verdict: reject.** DPLA doesn't host images itself — it
   returns metadata plus a thumbnail/link back to each contributing
   institution, with rights set per-item in a free-text `rights` field. No
   reliable blanket license; would need per-item rights parsing with no
   guarantee of a usable image URL. Same structural problem as Cooper
   Hewitt, worse (no CC0 floor at all).

7. **NYPL Digital Collections API** — `api.repo.nypl.org` (v2). Needs a
   free token (email signup). Collection includes a large body of vintage
   posters, maps, ephemera, and illustration — genuinely design-forward and
   distinct from anything currently integrated (closest thing Sourced has
   to historic poster/graphic-ephemera content). Can filter to
   `publicDomainOnly=true`. **Verdict: hold, most promising lead — not
   drafted this run.** Could not confirm CORS (docs page itself couldn't be
   reached from this sandbox), and public-domain filtering needs to be
   paired with checking which of NYPL's four rights-statement tiers map to
   actually-reusable images before trusting it as a blanket source. Good
   first thing to live-test next run.

8. **Internet Archive `advancedsearch.php`** — `archive.org/advancedsearch.php`.
   Keyless, JSON output, no auth needed per multiple third-party sources.
   **Verdict: reject.** Despite being keyless, the Archive is an extremely
   heterogeneous general-purpose library (books, software, audio, random
   uploads) with no collection-level curation signal comparable to a
   museum's "is_public_domain"/maker-grouped records — closest prior art is
   Wikimedia Commons, which Sourced already rejected/disabled for exactly
   this noise problem. Could be reconsidered *only* if scoped to a small
   allowlist of specific, pre-vetted poster/ephemera sub-collections (e.g.
   a known Library of Congress or Boston Public Library poster collection
   identifier on archive.org) rather than open-ended query search — not
   attempted this run.

### Bottom line

No candidate this week clearly and convincingly passed all 5 criteria, and
this run's sandbox couldn't verify CORS for anything regardless. No new
provider adapter was drafted. Top two to prioritize next run, in order:
**NYPL Digital Collections** (design-forward, distinct content — needs a
live CORS check and rights-tier mapping) and **Europeana** (widest reach,
but needs the proxy and facet tuning to control noise).
