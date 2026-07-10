# Sourced — Topics to Fetch

This is the master list of topics the discovery feed pulls from. Edit this file,
then hand it back to me and I'll sync it into the prototype.

There are **two tiers**:

1. **Filters** — shown as clickable pills in the UI *and* fetched.
2. **Fetch-only** — pulled into the feed (they feed the random "Featured"
   rotation, so reloads surface them) but **not** shown as pills, to keep the
   filter bar uncluttered.

Format is simple: `Label — search term`. The label is only used if it's promoted
to a filter; the search term is what actually gets queried across the sources.
To make any fetch-only topic a visible filter, just move its line up into the
Filters section (or tell me which ones to promote).

---

## Filters (shown as pills + fetched)

Kept to two lines — the trendiest / most-searched only. Everything else moved
to **Fetch-only** below (still pulled into the feed, just not a pill).

- Featured — design
- Brutalist — brutalist
- Typography — typography
- Maximalist — maximalist
- Risograph — risograph
- Y2K — y2k
- Retro-futurism — retro futurism
- Collage — collage
- Fashion — fashion
- Photography — photography
- Posters — poster
- Branding — brand identity

---

## Fetch-only topics (fetched, not shown as pills)

### Disciplines (demoted from filters — still fetched)
- ux design
- web design
- graphic design
- art
- ceramics
- sportswear
- music
- album cover
- book design
- magazine
- editorial
- monochrome
- texture

### Graphic & brand
- logo design
- visual identity
- packaging design
- signage
- wayfinding
- infographic

### Type & lettering
- lettering
- type specimen
- calligraphy
- typeface design

### Product & digital
- ui design
- app design
- product design
- wireframe
- interaction design
- dashboard design

### Fashion & apparel
- streetwear
- textile design
- fashion editorial
- lookbook
- knitwear
- footwear

### Art & craft
- painting
- illustration
- printmaking
- collage
- sculpture
- glasswork
- woodwork

### Photography
- film photography
- portrait photography
- still life
- documentary photography
- fashion photography

### Editorial & print
- book cover
- zine
- newspaper design
- layout

### Music & culture
- record cover
- gig poster
- music video

### Architecture & space
- architecture
- interior design
- furniture
- exhibition design
- landscape

### Movements & aesthetics
*(Brutalist, Maximalist, Risograph, Retro-futurism, Y2K are now filters above.)*
- bauhaus
- swiss design
- modernism
- art deco
- minimalism
- vaporwave
- memphis design
- art nouveau
- postmodern

---

## How it's wired

- **Filters** live in the `CAT_Q` object in `sourced-prototype.html`.
- **Fetch-only topics** live in the `FEATURED_SEEDS` array; one is picked at
  random on each page load (and the feed is shuffled), so content stays fresh
  and the whole topic range gets surfaced over time.
- Add or remove freely here, then send it over and I'll regenerate both lists.
