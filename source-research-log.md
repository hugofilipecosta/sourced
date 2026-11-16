# Sourced — Image Source Research Log

Weekly notes from the autonomous research agent that scouts new image/visual
sources for the `PROVIDERS` map in `index.html`. See `CLAUDE.md` for the
criteria and process. Entries are append-only, newest heading at the top.

---

## 2026-11-16

**Methodology note (read first):** this run's sandboxed network only allows
egress to a small host allowlist (GitHub, npm/pypi, Anthropic, a few others).
Direct `curl`/`WebFetch` calls to every candidate API below (api.smk.dk,
collection.cooperhewitt.org, rijksmuseum.nl, api.europeana.eu,
collection.sciencemuseumgroup.org.uk, api.si.edu) were attempted and all
failed at the DNS/connect level — confirmed via the agent-proxy status
endpoint, not a fluke. So **no CORS header could be verified empirically this
run**; everything below on CORS is inferred from documentation and
third-party reports found via search, not a live browser/`curl` check. This
is exactly the kind of gap that made Openverse look promising before turning
out CORS-blocked, so I'm treating it as a hard blocker on drafting adapter
code this week rather than guessing. Flagging this explicitly for whoever
picks this up with normal network access — a 2-minute `fetch()` from a
browser console against the two endpoints below would resolve it.

Current roster checked against (from `index.html` `PROVIDERS`/`PROV_ORDER`):
keyless/on — Are.na (`ch`), Tumblr (`tb`), Art Institute of Chicago (`ai`),
V&A (`va`), Met (`me`); optional/keyed — Unsplash (`un`), Pexels (`px`),
Pixabay (`pb`); off — Wikimedia (`wk`).

### Top candidates (promising, not yet draftable)

**SMK — Statens Museum for Kunst (Danish National Gallery)** — `api.smk.dk/api/v1`
- License: **CC0** for the large majority of digitized works (SMK has published
  open-access images since 2012); per-object rights are returned in the record,
  same filterable pattern already used for AIC's `is_public_domain`.
- Access: documentation and a third-party API survey (live-tested July 2026)
  both indicate **no API key / no signup required** — a real, if not
  airtight, signal for keyless access. Swagger docs at `api.smk.dk` describe a
  REST/JSON search endpoint (`/art/search`) with `keys` (query), `offset`,
  `rows`, and filters for image presence / public-domain status — same shape
  Sourced already parses for AIC/V&A.
- **New ground vs. current roster:** this is the one clear gap — nothing in
  the current 8 sources specifically surfaces Danish/Nordic modernist art,
  design and decorative-arts holdings. Scandinavian minimalism is a heavily
  referenced aesthetic in contemporary design taste and isn't represented at
  all today. Geographically it also diversifies a roster that's currently
  Are.na (global but US-heavy blogs), Tumblr (US), AIC (Chicago), V&A (UK),
  Met (NY) — all Anglo-American institutions. Genuinely useful for daily
  `FEATURED_SEEDS` rotation variety, not redundant.
- **Verdict: PROMISING, blocked on verification.** Content fit, license, and
  likely-keyless access are all good; CORS is the one open question. Exact
  JSON field names for the image URL / artist / title (e.g. whether the
  thumbnail field is literally `image_thumbnail` as one source snippet
  suggested) also need a live response to confirm before writing a
  `norm()` mapper with any confidence — I won't invent field names and ship
  code I can't test. **Recommended next step:** live-verify CORS + pull one
  real search response, then this is very likely a same-day adapter write
  (it fits the existing museum-adapter pattern in `index.html` almost
  exactly — see `P_VAM`/`P_AIC`).

**Cooper Hewitt, Smithsonian Design Museum** — `api.collection.cooperhewitt.org`
- This is literally *the* design museum (furniture, textiles, wallpaper,
  product/industrial design, posters, graphic design) — about as direct a hit
  on criterion 1 as exists, and genuinely new territory: none of the current
  sources are product/industrial-design-specific the way this is.
- License: metadata mostly CC0; **image rights vary per object** and are
  returned in the record (same `is_public_domain`-style filter pattern as AIC).
  Museum's own terms-of-use page leans "personal/educational/non-commercial"
  for the site as a whole, which is softer than I'd like for certain — worth
  a second look before shipping, though the open-data/CC0-flagged objects
  specifically should be fine.
- Access: official docs say **no registration required** for basic
  rate-limited use, but the actual REST methods (e.g.
  `cooperhewitt.search.objects`) take an `access_token` parameter regardless,
  and the docs describe OAuth2 implicit-grant flow for a real token — so this
  is murkier than a clean "keyless" story. In practice this likely needs a
  registered key, which is acceptable per criterion 4(b) (Sourced's
  `api/prompt.js` proxy pattern could hold it server-side) but is more
  integration work than a true one-line keyless adapter.
- **Verdict: PROMISING, needs auth-flow + CORS verification**, and the
  commercial-use terms-of-use language is worth a closer read before
  committing. Best candidate for someone with real network access to spend
  15 minutes confirming end-to-end (register a key, hit `search.objects` from
  a browser, check the response headers and the `license`/rights field on a
  few objects).

### Considered and rejected this run

- **Rijksmuseum** (`rijksmuseum.nl` API) — CC0, free key, good docs. Rejected
  for **redundancy**: it's overwhelmingly Dutch Golden Age *paintings*, which
  duplicates the fine-art territory AIC/V&A/Met already cover well, without
  adding a distinct design angle the way SMK's Nordic-design holdings would.
  Needs a key for what would be a "more of the same" addition — not worth the
  integration cost.
- **Europeana** — free key, CORS reportedly supported per official FAQ (not
  independently verified this run). Rejected for this run on **complexity vs.
  payoff**: it's a 60M+ record aggregator across hundreds of institutions with
  wildly inconsistent per-item licensing (the API returns a rights field per
  object, including plenty of rights-reserved items that would need careful
  filtering via `reusability=open`). Worth revisiting if a future run wants
  to invest in a more careful aggregator adapter, but it's not a quick,
  well-vetted single-source add.
- **Smithsonian Open Access** (`api.si.edu`) — requires a free `api.data.gov`
  key (not keyless as sometimes advertised). Rejected for **redundancy and
  noise**: it's a 5M+ object firehose across all 19 Smithsonian museums
  (natural history, aerospace, etc.), and the one genuinely design-forward
  slice of it — Cooper Hewitt — is better integrated directly (see above)
  than filtered out of the general firehose. Same "too noisy" problem that
  got Wikimedia turned off.
- **Harvard Art Museums** — free key required, CORS support unconfirmed/
  conflicting in what's publicly documented, and content is general fine-art
  holdings that would duplicate AIC/Met/V&A rather than add new ground.
  Rejected for redundancy.
- **Science Museum Group (UK)** — genuinely interesting for industrial design
  / engineering-object photography, but documentation flags **images as not
  cleared for commercial use** in at least some cases. Given Sourced turns
  curated images into generation prompts (a commercial-adjacent use), that's
  a licensing risk worth avoiding rather than threading a needle on. Rejected
  on criterion 3.
- **DPLA (Digital Public Library of America)** — free key, but it's a library/
  archive aggregator (photos, maps, manuscripts, clip art) with inconsistent
  per-item rights and no particular design/art-forward curation signal.
  Rejected: doesn't clearly meet criterion 1, and is redundant with the
  broader-aggregator concerns already raised for Europeana.
- **Behance API** — confirmed effectively **shut down**: Adobe's public
  Behance API has not been accepting new clients and multiple 2026 sources
  describe it as retired. Not usable regardless of fit. Rejected.
- **Dribbble API** — even where the v2 API is reachable, shots are individual
  designers' copyrighted work with no open/CC license for redistribution —
  Dribbble's own terms govern display, not reuse in a third-party curation
  feed. Fails criterion 3 regardless of API access. Rejected.
- **Cleveland Museum of Art** — already rejected in a prior round per
  `sources.md` (too fine-art-heavy); re-confirmed, no reason to revisit.
- Briefly surfaced via a general "keyless museum APIs" roundup but not deeply
  vetted this run — flagged for a future pass rather than evaluated fully:
  **Yale LUX** (Yale's cross-collection search, unclear design-forward
  fraction), **Wellcome Collection** (strong API, but medical/science-history
  imagery, not design/art-forward), **Harvard LibraryCloud** (library catalog
  metadata, not an images-first source), **Getty Vocabularies** (controlled
  vocabularies only — not an image source at all, excluded on criterion 1),
  **Auckland War Memorial Museum** (general natural-history + ethnographic
  museum collection — some design/craft objects likely buried in it, but not
  design-forward enough on its face to justify the integration without
  closer review).

### Bottom line

No candidate clearly and convincingly passed all 5 criteria with what could
actually be verified from this sandboxed session, so no adapter code or
`sources.md` change is included in this PR — per the standing instruction not
to force a low-quality addition. **SMK is the strongest lead**, and the one a
follow-up session with real network access should spend time on first:
likely-keyless, CC0, and clear new ground. **Cooper Hewitt** is the strongest
content fit but has a murkier auth story and a terms-of-use wrinkle worth
reading closely. Both are good candidates to re-run through this process next
week with live verification instead of documentation-only research.
