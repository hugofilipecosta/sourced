# Sourced — Source Research Log

Weekly autonomous research notes on candidate image/visual-content sources to
extend the `PROVIDERS` map in `index.html`. Each entry is logged whether it
passed or failed. See `sources.md` for the sources actually integrated, and
`CLAUDE.md` for architecture/conventions.

---

## 2026-10-05

**Environment note:** this run's sandbox blocked outbound `CONNECT` to
essentially every external API/docs domain tested, including the domains of
sources already live in `index.html` (`api.are.na`, `api.vam.ac.uk`,
`api.artic.edu`, `api.tumblr.com`, `collectionapi.metmuseum.org` all came
back `connect_rejected` from the egress proxy) — this is a general sandbox
policy, not something about the candidates. So CORS/response-shape claims
below come from documentation and third-party API-health aggregators
(`public-api.org`), **not** from a live request made this run. Treat any
"CORS: unconfirmed" line as needing a real-browser check before it's used to
justify shipping an adapter. For comparison, the same aggregator reports
Art Institute of Chicago (already live, key `ai`) as explicitly
"CORS enabled" — so the aggregator is a reasonably trustworthy signal when it
does commit to an answer, which makes it notable that none of the candidates
below got a confirmed "yes" this run.

Candidates considered, in rough order of promise:

### Europeana (Search API) — **lead, not yet verified**
- **Base:** `https://api.europeana.eu/record/v2/search.json`
- **What it is:** aggregator API in front of 4,000+ European museums,
  libraries and archives (Rijksmuseum, Bauhaus-related archives, national
  design/decorative-arts museums, etc.), filterable by media type
  (`qf=TYPE:IMAGE`) and reusability/rights (`reusability=open` → CC0 / CC-BY
  / Public Domain Mark only).
- **License:** mixed per item, but filterable to open licenses only via the
  `reusability` param — exact license still needs surfacing per result if we
  show attribution.
- **Key:** free, documented as self-service signup. **CORS:** docs state
  "Europeana supports CORS for all the APIs it offers," which is more
  specific than anything found for the other candidates — but unverified by
  a live request this run.
- **Daily-rotation value:** genuinely new territory — European design
  movements (Dutch, Nordic, Bauhaus-adjacent) that the current AIC/V&A/Met/
  Are.na/Tumblr mix barely touches, and a large enough pool to survive the
  `FEATURED_SEEDS` rotation without repeating.
- **Verdict:** best lead this run, but licensing is per-item (more complex
  mapping than a single-license source) and CORS isn't empirically confirmed.
  **Not building the adapter yet** — want a real-browser CORS check and a
  look at actual search-result shape first. Flagging for next run or a human
  to spot-check.

### Cooper Hewitt, Smithsonian Design Museum API — **promising fit, unconfirmed**
- **Base:** `https://api.collection.cooperhewitt.org/rest/`
- **What it is:** the Smithsonian's dedicated **design** museum — posters,
  textiles, wallpaper, product design, graphic design. The most
  on-the-nose "design-forward" fit of anything researched this run.
- **License:** collection metadata is CC0; image rights are separate/mixed
  per object and need checking per-result.
- **Key:** free `access_token`, self-service per docs.
- **CORS:** third-party health check lists it as "Unknown" (i.e., not
  confirmed either way) — this run's sandbox couldn't test it directly
  (`connect_rejected` to `api.collection.cooperhewitt.org`).
- **Daily-rotation value:** would be high if CORS works — nothing else in
  the current mix is a dedicated design museum.
- **Verdict:** hold. Strong content fit, but CORS is the one hard gate
  (criterion 4) and it's unconfirmed. Worth a manual browser test before
  committing to an adapter.

### Rijksmuseum API — **decent fit, unconfirmed**
- **Base:** `https://www.rijksmuseum.nl/api/{lang}/collection`
- **What it is:** Dutch national museum — strong prints/posters, fashion,
  decorative arts holdings alongside fine art. Public-domain mark on images,
  CC0 data.
- **Key:** free, self-service.
- **CORS:** "Unknown" per health aggregator; sandbox couldn't reach
  `data.rijksmuseum.nl` / `www.rijksmuseum.nl` this run to confirm.
- **Daily-rotation value:** medium — some overlap with V&A (decorative
  arts/fashion) but Dutch design/graphics specifically isn't covered yet.
- **Verdict:** hold, same reason as Cooper Hewitt — need a live CORS check.

### Smithsonian Open Access API (`api.si.edu`) — **fail-leaning**
- **Base:** `https://api.si.edu/openaccess/api/v1.0`
- **What it is:** umbrella API across *all* Smithsonian units (art, design,
  natural history, aerospace, American history...), CC0.
- **Key:** free via api.data.gov.
- **CORS:** unconfirmed; sandbox couldn't reach it this run.
- **Verdict:** reject for now — same noise problem as Wikimedia (`wk`,
  already off by default): to get only the design-forward slice (Cooper
  Hewitt's records live inside this same umbrella) you'd need heavy
  unit-filtering, and the dedicated Cooper Hewitt API above is the cleaner
  way to get that specific content if CORS checks out there.

### Harvard Art Museums API — **fail**
- **Base:** `https://api.harvardartmuseums.org`
- **What it is:** strong collection, including modern/design-adjacent work.
- **Key:** free, email-delivered.
- **CORS:** unconfirmed.
- **Dealbreaker:** the docs explicitly say image URLs for rights-restricted
  objects are excluded for most API users, and **most 20th/21st-century
  works are rights-restricted** — which is exactly the poster/graphic-design
  era this app cares about most. Even with working CORS, the realistic
  content pulled back would skew pre-20th-century and overlap heavily with
  AIC/Met.
- **Verdict:** reject — content-relevance problem (criterion 1/5), not just
  an access problem.

### NYPL Digital Collections API — **fail (access friction), content ok**
- **Base:** `https://api.repo.nypl.org`
- **What it is:** posters, ephemera, menus, maps — genuinely interesting
  design-adjacent material, public-domain heavy.
- **Key/access:** v2 requires a developer account + token (not a bare
  query-param key) and MODS-based response shape, heavier integration lift
  than the other candidates. CORS unconfirmed.
- **Verdict:** not rejected outright on content, but not clearly easier or
  better than the Europeana/Cooper Hewitt leads above — parking it, not
  worth the adapter effort over those unless they both fall through.

### MoMA — **fail**
- `api.moma.org` is internal — restricted to MoMA staff/partners, no public
  key issuance. The public alternative (MoMA's GitHub collection dataset) is
  metadata-only CC0 with **no images at all**. Fails criterion 2/4 outright
  — there's no way to pull images from MoMA programmatically as an outside
  developer today.

### Behance API — **fail**
- Effectively dead since a platform migration years ago; the old developer
  key page no longer issues keys and there's no replacement on adobe.io yet.
  Fails criterion 2 (no real API access).

### Dribbble API (v2) — **fail**
- Requires OAuth2 app registration, and Dribbble has not been approving new
  API applications for a long time. Not accessible for a new integration.
  Fails criterion 2.

### Walters Art Museum API — **fail**
- Real API, real CC0 images — but the collection is ancient/medieval/19th-
  century fine art and illuminated manuscripts, not design-forward. Same
  rationale as the already-rejected Cleveland Museum of Art in `sources.md`.
  Fails criterion 1, and would be redundant with AIC/Met's existing
  fine-art holdings (criterion 5).

---

**No adapter shipped this run.** Two candidates (Europeana, Cooper Hewitt)
are genuinely promising and worth a real-browser CORS/shape check before the
next run builds an adapter — flagging both for a human to spot-check, or for
next week's run if this sandbox has broader egress access by then.
