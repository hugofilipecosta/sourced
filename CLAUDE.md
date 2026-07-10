# Sourced — Project Memory (for Claude Code)

A curation / visual-discovery web app for designers and AI-curation professionals.
Tagline: **"Where taste gets credit."** Discover design & art imagery from open
collections, build a "collection" (mood board), and turn it into an
image-generation prompt.

## How this project is built (IMPORTANT)

- **The entire app is a single self-contained file: `index.html`.**
- It uses **React 18 + Babel Standalone from CDN** (no build step, no bundler).
  The JSX is inside one `<script type="text/babel">` block and is compiled in
  the browser at load time.
- To run: open `index.html`, or better `python3 -m http.server` then open it
  (some browsers block API calls from `file://`).
- **There is no `npm run build`.** To sanity-check the JSX compiles, extract the
  babel script and run esbuild on it:

  ```bash
  python3 -c "import re;s=open('index.html').read();m=re.search(r'<script type=\"text/babel\">(.*?)</script>',s,re.S);open('/tmp/c.jsx','w').write(m.group(1))"
  npx esbuild /tmp/c.jsx --loader:.jsx=jsx --bundle --external:react --external:react-dom --format=esm >/dev/null && echo OK
  ```
  (An old Vite/React scaffold lives in `_archive/` — gitignored, NOT the product.
  Its `node_modules/.bin/esbuild` can be reused for the check.)

## File layout

- `index.html` — the app (everything).
- `topics.md` — editable list of fetch topics (filters vs fetch-only).
- `sources.md` — editable list of image sources + how to add more.
- `README.md` — run + deploy notes.
- `_archive/` — old React scaffold + demo assets (gitignored, reference only).

## Architecture inside index.html

- **Source layer (`PROVIDERS` map / `PROV_ORDER`)** — the only code that knows
  each external API. Everything maps to Sourced domain terms:
  Channel→Collection, Block/Artwork→Item, User/Artist→Curator. Adding a source =
  one object in `PROVIDERS`.
  - **Keyless, always on:** Are.na (`ch`), Art Institute of Chicago (`ai`),
    V&A (`va`), Met (`me`).
  - **Tumblr (`tb`)** — designer/artist curation via JSONP (bypasses CORS).
    Uses a baked public **Consumer Key** (`TUMBLR_KEY` const). Move to env/proxy
    before shipping a public repo; rotate the secret (never used client-side).
  - **Off by default:** Wikimedia (`wk`, too noisy), Unsplash/Pexels/Pixabay
    (need keys; keys UI was removed — they only activate via stored keys or the
    future proxy).
- **Search** — `listCollections(query, limit, page, rankText)`: fan out to all
  providers, group by creator, then for a real query, **filter to relevant
  results and rank** by term/synonym overlap (`relevance`, `expandTerms`,
  `PROV_WEIGHT`); browse mode weights curated sources up + light shuffle.
  Typed words (incl. colours) are a **text meta-search**; pixel-colour matching
  is only via the advanced colour picker (`colorSearchCollections`).
- **Filters** — `CAT_Q` is the lens pool; `catsShown` is the stable best-10
  shown as pills. A thin filter (<3 results) **auto-replaces itself** from the
  pool (`triedRef`).
- **Era filter** — `discover_tune` icon button right of the pills opens a popup;
  `ERA_BUCKETS` set `YEAR_FROM`/`YEAR_TO`. Home floor is `HOME_FLOOR = 1920`.
- **Feed** — full-width responsive **stable masonry** (fixed JS columns by index,
  2→7 cols by width) so infinite scroll never reshuffles. Loader = animated
  Material Symbol `package_2`.
- **Collection / Curator pages** — `displayTitle()` cleans messy source titles
  (strips @handles/URLs/category labels/UUIDs). Cards show only the image +
  hover attribution; titles/desc only on detail pages.
- **Mood board → prompt** — select images with the `add` icon (→ `check`),
  floating bar → `PromptModal` (auto-generates on open, editable, Copy /
  Regenerate). `generatePromptLLM` calls Claude vision **browser-direct** if a
  key is stored; otherwise `draftPromptFromMetadata` (template, no images).
  `collectMeta` extracts titles/media/dates + **dominant colours** from pixels.
  Prompt rules: never include real names or category words as the subject; no
  stray lettering. Structure: Opening (subject+style) → Body (palette, light,
  composition, texture, era) → Connection (intent + technical modifiers).

## Brand / conventions

- Accent green `--amber: #00DB04` (fills/icons), `--accentText: #0A7A0C`
  (text/links, contrast-safe on the `#FAFAF8` paper). Ink `#15140F`.
- Fonts: **Lexend Deca** (UI + headings), **IBM Plex Mono** (metadata),
  **BBH Bartle** for the **logo only** (`.logo` class). Material Symbols Outlined
  for icons.
- Favicon is rendered at runtime from the `package_2` glyph onto a canvas.

## Known issues / open threads (priority order)

1. **Backend proxy (greenlit, not built):** a tiny serverless `/api` (Vercel)
   to (a) hold Unsplash/Pexels/Pixabay/Tumblr keys server-side so all sources
   work for everyone, (b) unblock **Openverse** (CORS-disabled in browser),
   (c) run the vision-model prompt call server-side. This is the biggest lever.
2. **Prompt/output quality** = #1 product priority. The metadata draft is a blind
   template; real quality needs the **vision model reading the images** (needs a
   key or the proxy). Next step after proxy: **CLIP embeddings + vector search**
   for true semantic + colour ranking; optional LLM query parsing.
3. **Museum "curators" are actually artists/makers** — a known seam from using
   museum APIs as stand-ins for user-curated collections.
4. The archived React app is NOT in sync with `index.html` (the single file is
   the product).

## Deploy

Static site. `git init` → push to GitHub → import to Vercel (Framework: Other,
no build). Hash routing, so no rewrites needed. See README.md.

## Original concept handoff

The founding decisions (positioning vs Pinterest/Cosmos/Are.na, the
attribution/payout model, V1/V2/V3 scope) are in the project's
`sourced-context.md` handoff if available — paste it into a session for full
background.
