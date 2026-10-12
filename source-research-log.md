# Sourced — Source Research Log

Weekly automated research into new image/visual-content sources for the
`PROVIDERS` map. Each entry lists candidates considered that run (pass or
fail) against the five criteria: (1) design/art-forward content, (2) real
API, (3) permissive licensing, (4) keyless+CORS or key-is-acceptable, (5) not
redundant with existing sources + adds daily-rotation variety.

Currently integrated: Are.na (`ch`), Tumblr (`tb`), Art Institute of Chicago
(`ai`), V&A (`va`), Met (`me`), Unsplash (`un`), Pexels (`px`), Pixabay (`pb`),
Wikimedia (`wk`, off by default).

---

## 2026-10-12

**Environment note:** this run's outbound network access was limited to the
WebSearch tool — direct `curl`/`WebFetch` calls to third-party API hosts were
blocked by the sandbox's network policy (confirmed via the agent-proxy status
log: `connect_rejected` / gateway 403 for every external host tried, including
a sanity check against `api.artic.edu`, an already-integrated source). So no
CORS header or live-response verification in this log is empirical — it's
based on written documentation found via search. Flagged per-candidate below;
the human reviewer should verify with a real browser `fetch()` before trusting
any CORS claim here.

### Proposed this run

- **Europeana** — `https://api.europeana.eu/record/v2/search.json`
  Licensing: per-item, restricted here to the `REUSABILITY:open` tier (Public
  Domain / CC0 / CC BY / CC BY-SA); all *metadata* is CC0 regardless.
  Access: free API key (plain string in the query, not OAuth) from a Europeana
  account — same shape as the already-supported Unsplash/Pexels/Pixabay keys.
  Europeana's own API FAQ states it supports CORS for all its APIs (recommended
  over the JSONP fallback it also still offers).
  **Verdict: PASS, proposed.** It aggregates hundreds of European museums,
  libraries and design archives — many with strong design/graphic/fashion
  holdings (e.g. national design museums, fashion archives, poster
  collections) that none of the four already-integrated museum sources (AIC,
  V&A, Met, +Wikimedia off) cover. Institutionally curated metadata (not
  random user uploads), so it doesn't carry Wikimedia's noise problem. Given
  its breadth (100s of providers, many countries), it's a strong fit for the
  standing daily-rotation-variety principle — querying the same seed term on
  different days will keep surfacing different institutions rather than
  recycling the same handful of sources. Adapter drafted in `index.html`
  (key `eu`) and documented in `sources.md`, following the exact existing
  keyed-optional-source pattern (list/getColl/getCurator, `keyGet`, added to
  the "Connect image sources" keys modal). CORS support could not be
  independently verified this run (see environment note above) — this is the
  main open risk for the reviewer to close out before merging.

### Considered and rejected

- **Cooper Hewitt, Smithsonian Design Museum** —
  `https://api.collection.cooperhewitt.org/rest/` (REST/JSON+JSONP). Very
  strong design-forward content (it's literally the Smithsonian's design
  museum — posters, product design, textiles) and would have been a great
  fit on content grounds alone. **Rejected this run**: its docs describe the
  required `access_token` as an OAuth2 token tied to the registering user's
  account ("links your account to Cooper Hewitt"), explicitly warning it
  shouldn't be shared/exposed — a materially different risk profile from a
  disposable API key like Unsplash's, and not something that belongs baked
  into client-side JS or committed to a public repo the way Tumblr's consumer
  key is. Would need the backend proxy to hold it server-side. CORS support
  is also undocumented either way. Worth revisiting once the proxy exists.

- **Rijksmuseum** — `https://www.rijksmuseum.nl/api/...` /
  `data.rijksmuseum.nl`. Rijksstudio has excellent poster/print/decorative-arts
  holdings, CC0 licensing. **Rejected this run**: the legacy REST API (the one
  with a usable search endpoint) is marked deprecated in favor of a
  Linked-Open-Data API that's less obviously a drop-in JSON search endpoint;
  CORS is undocumented in what's publicly written; one government dataset
  listing even contradicts Rijksmuseum's own CC0 claim with "CC BY". Needs a
  closer read of current (post-migration) docs before it's a confident yes.

- **Harvard Art Museums** — `https://api.harvardartmuseums.org`. Good
  collection breadth (~250k objects), free key via email signup.
  **Rejected this run**: CORS undocumented; and on content, its collection
  skews toward the same "fine art object photographed in a museum" territory
  already well covered by AIC/Met — didn't find a clear design/graphic-arts
  angle that would add new ground the way Europeana or Cooper Hewitt would.

- **Smithsonian Open Access** (unified API, `https://api.si.edu/openaccess/...`,
  covers 19 Smithsonian units including Cooper Hewitt) — free key via
  api.data.gov. **Rejected this run**: CORS undocumented; and the unified API
  is very broad (natural history, aerospace, etc.) — would need careful
  `unit_code` scoping to the design-relevant units to avoid becoming a second
  "noisy" source like Wikimedia. Worth a closer, more scoped look in a future
  run (e.g. querying only `unit_code=CHSDM` for Cooper Hewitt's holdings
  through this API instead of its separate OAuth-gated legacy API).

- **Brooklyn Museum** — `https://www.brooklynmuseum.org/api/v2`. Strong
  costume/textile/design-adjacent collection. **Rejected this run**: licensing
  history is inconsistent across sources (older CC "non-commercial,
  no-derivatives" terms vs. a later partial CC0 release) and current terms
  weren't clearly confirmed; CORS undocumented; registration is also
  explicitly one-key-per-person and non-transferable, which reads as a worse
  fit for a shared/baked key than Europeana's.

- **Flickr API (Commons / license-filtered search)** —
  `https://www.flickr.com/services/rest/` (`flickr.photos.search`, JSONP
  bypasses CORS, like Tumblr). **Rejected this run**: Flickr Commons is mostly
  scanned historical-archive photos with inconsistent, often-sparse metadata —
  closer to Wikimedia's noise profile than to a curated design source. Could
  be revisited with very narrow tag/license filtering if a specific
  design-relevant Commons institution is identified, but a general search
  doesn't clear the "design-forward" bar.

- **Behance API** — registration flow appears to still exist, but multiple
  independent reports (including a maintained OAuth library marking its
  Behance backend deprecated) suggest Adobe has not reliably supported new
  third-party OAuth integrations for a while. **Rejected**: access reliability
  for a new app could not be confirmed, and building against it risks a dead
  adapter that silently returns nothing (like Openverse already does with
  CORS). Worth a one-off manual check if Adobe officially reopens it.

- **MoMA Collection / National Gallery of Art Open Data** — both publish open
  bulk datasets (CSV/JSON dumps on GitHub), not a live queryable REST API.
  **Rejected**: fails criterion 2 outright for this architecture (the
  `PROVIDERS` adapters all call a live search endpoint per query; a static
  dataset would need to be downloaded, hosted and indexed separately, which is
  a different and much larger project, not a drop-in provider).

No forced additions beyond Europeana — everything else above didn't clear all
five criteria with enough confidence this run.
