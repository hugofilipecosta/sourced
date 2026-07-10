# Sourced — Image Sources

The live feed aggregates these sources. Each is **keyless** and sends permissive
CORS on reads (so the prototype can fetch directly, even from a `file://` page).
Their names are kept internal and never shown in the UI.

Edit this file, hand it back, and I'll sync it into the prototype. In code they
live in the `PROVIDERS` map and `PROV_ORDER` array inside `sourced-prototype.html`.

---

## Active sources

### 1. Community channels  ·  key: `ch`
- **Base:** `https://api.are.na/v2`
- **Provides:** user-owned channels → collections with real curator handles.
  The most design-forward source.
- **Image field:** block `image.large` / `image.display`
- **Key:** none · **CORS:** yes · **License:** per-channel (varies)

### 2. Design museum  ·  key: `va`
- **Base:** `https://api.vam.ac.uk/v2`
- **Provides:** posters, graphics, typography, textiles, furniture, fashion —
  grouped by maker/creator.
- **Image field:** IIIF `framemark.vam.ac.uk/.../full/843,/0/default.jpg`
- **Key:** none · **CORS:** yes · **License:** mostly public domain

### 3. Art & graphics collection  ·  key: `ai`
- **Base:** `https://api.artic.edu/api/v1`
- **Provides:** public-domain artworks, strong graphics/photography holdings,
  grouped by artist.
- **Image field:** IIIF `artic.edu/iiif/2/{image_id}/full/843,/0/default.jpg`
- **Key:** none · **CORS:** yes · **License:** CC0 / public domain

**Feed order (interleave priority):** `ch`, `va`, `ai`
The merged feed is then shuffled and a random results page is requested each
load, so content stays fresh on reload.

---

## Optional sources (active when you add a key)

Add keys via **Advanced → connect image sources**. Keys are stored only in your
browser. These work from the browser once a key is present.

### Tumblr  ·  key: `tb`  (recommended)
- **Base:** `https://api.tumblr.com/v2` · **Key:** free OAuth consumer key
- **Provides:** designer/artist curation via tagged photo posts; grouped by blog.
- Uses **JSONP** (Tumblr has no CORS); ranked high alongside Are.na.


### 4. Unsplash  ·  key: `un`
- **Base:** `https://api.unsplash.com` · **Key:** Access Key (free) · grouped by photographer

### 5. Pexels  ·  key: `px`
- **Base:** `https://api.pexels.com/v1` · **Key:** API key (free) · grouped by photographer

### 6. Pixabay  ·  key: `pb`
- **Base:** `https://pixabay.com/api` · **Key:** API key (free) · grouped by uploader

---

## Compute source (not images)

### Vision model  ·  Claude
- **Endpoint:** `https://api.anthropic.com/v1/messages`
- **Use:** turns a selected set of images into one generation prompt.
- **Key:** your own, entered in the browser and stored only locally
  (browser-direct call). Not used for fetching images.

---

## Considered but not used

- **Cleveland Museum of Art** — removed: too fine-art-heavy for design inspiration.
- **Wikimedia Commons** — defined in code but **off by default**: too much random
  content (concert photos, snapshots) for a design/art curation feed.
- **Openverse** — still unusable from a static file: its API has **CORS disabled**
  server-side, so the browser can't call it regardless of key. Needs a backend
  or CORS proxy to enable.
- **Unsplash / Pexels / Pixabay** — now supported as optional sources above
  (key entered via the ⚙, stored locally). Don't share the file with your keys in it.

---

## To add a new source

Give me, per source:
1. Base URL of a **keyless, CORS-enabled** search endpoint
2. How to get the **image URL** from a result
3. How to get **title**, **creator/maker**, and a **link back** (optional)
4. Where it should sit in the feed order

I'll write the adapter and slot it into `PROVIDERS` / `PROV_ORDER`.
