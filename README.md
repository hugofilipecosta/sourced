# Sourced

**Where taste gets credit.** A curation engine for designers and AI-curation
professionals — build a mood board from live design imagery and turn it into a
generation prompt.

The whole app is a single static file: **`index.html`**. No build step, no keys
required. Just open it, or deploy it anywhere that serves static files.

## Run locally

Double-click `index.html`, or serve it (better — some browsers restrict API
calls from `file://`):

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## What it does

- **Aggregated feed** from multiple keyless sources (community channels + open
  design/art collections + Wikimedia), interleaved and shuffled, **1920s and
  newer**. Fresh content every reload, with infinite scroll.
- **Smart search** — e.g. `green typography posters` parses the colour out and
  returns colour-ranked typography posters.
- **Advanced search** — pick an era (1900s–50s, then two-decade bands to today)
  and a colour (picker or hex).
- **Real colour + visual matching** computed in-browser from actual pixels.
- **Mood board → prompt** — select images (the `+`), then generate one
  image-generation prompt with a vision model (your own key, stored locally).
- **Optional extra sources** (⚙ in the header) — add free Unsplash / Pexels /
  Pixabay keys to widen the feed. Stored only in your browser.

## Editable control files

- **`topics.md`** — the master list of topics to fetch (filters vs fetch-only).
- **`sources.md`** — every image source, how it's wired, and how to add more.

Edit either and hand it back to sync the changes into `index.html`.

## Deploy

### GitHub
```bash
cd "Sourced"
git init
git add .
git commit -m "Sourced prototype"
git branch -M main
git remote add origin https://github.com/<you>/sourced.git
git push -u origin main
```

### Vercel
1. Go to vercel.com/new and import the repo.
2. Framework Preset: **Other** (it's a static site — no build command, output
   directory is the root). The app uses hash routing, so no rewrites needed.
3. Deploy. Your live URL serves `index.html`.

(The old React scaffold lives in `_archive/` and is gitignored — kept for
reference, not part of the deploy.)

---

Built with AI assistance.
