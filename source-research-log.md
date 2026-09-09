# Source Research Log

Weekly automated research notes on candidate image/visual-content sources for
Sourced's `PROVIDERS` map. Each dated section lists every candidate considered
that week, pass or fail, against the five criteria: (1) design/art-forward
content, (2) real API, (3) permissive licensing, (4) keyless+CORS or a
free-key source worth extending the serverless proxy for, (5) not redundant
with what's already integrated — including whether it would add genuine
day-to-day variety to the rotating Featured seed pool.

Currently integrated: Are.na (`ch`), Tumblr (`tb`), Art Institute of Chicago
(`ai`), V&A (`va`), Met (`me`) — always on; Unsplash (`un`), Pexels (`px`),
Pixabay (`pb`) — optional/keyed; Wikimedia (`wk`) — off by default.

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

**Open action item for next run:** if the sandbox's network egress allows it,
do the live CORS/field-name checks flagged above for Europeana and Cooper
Hewitt before anything else — both are strong enough on paper that a
successful check should turn directly into an adapter PR.
