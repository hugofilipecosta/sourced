# Sourced — Search & Query System Test Plan

Scope: the text search box, category pills, era filter, relevance ranking,
browse-mode ranking, provider fan-out, pagination/infinite scroll, and the
first-session experience on the Explore (home) page. Line references are to
`index.html` as of this plan's writing.

## 0. Known issues found while writing this plan

These surfaced from reading the actual implementation, not speculation — worth
fixing or consciously accepting before/alongside test execution.

| # | Issue | Where | Impact |
|---|---|---|---|
| 1 | **First-session results are randomized, not curated.** The default "Featured" tab query is `pick(FEATURED_SEEDS)` — a random pick from 19 unrelated seed terms — on every page load, combined with a random starting page (`SESSION_PAGE = 1 + random(3)`) and browse-mode's pure `Math.random()` shuffle (no relevance scoring at all in browse mode). | `index.html:504,507,811,835-838,560` | Directly causes the "inconsistent first results" complaint — this is by design, not a bug, but likely the wrong default for a first impression. |
| 2 | **Stale active-pill display.** Typing a query does not clear/reset `cat`, so an old category pill stays visually highlighted even though the typed query (which takes precedence per line 836) is what's actually driving results. | `index.html:809,879,836` | User-visible confusion (reproduced live — see session screenshot): looks like results are filtered to a category they're not filtered to. |
| 3 | **Advanced colour search has no UI.** `advColor`/`hexIn`/`applyHex`/`isHex`/`normHex` and `colorSearchCollections` are fully wired into the search-reset effect, but no `.colorrow`/`.swatch` markup or hex input exists anywhere in the JSX to ever set them. | `index.html:39-40,182-185,573-590,814,839` | Feature is dead/unreachable code — `color` is always `""`, so `colorSearchCollections` never runs today. |
| 4 | **Possible race condition on rapid era changes.** `YEAR_FROM`/`YEAR_TO` are module-level `let`s (not React state, not request-scoped), mutated by `setYears()` and read by provider `.search()`/`.list()` filters at response time. If a second era change happens while a first request is still in flight, the first request's results get filtered against the *second* era's bounds when it resolves, not the era active when it was issued. | `index.html:507-509,840,843-855` | Wrong/inconsistent year-filtering under fast interaction; `reqRef`/`rid` guards against stale item lists overwriting newer ones, but does *not* guard against this specific mutation-timing issue. |
| 5 | **Search state isn't in the URL.** Query, active pill, and era are plain component state, not reflected in `location.hash`. | `useRoute()`, `index.html:742` | Refresh or share of a search/filter result silently drops back to the random default (issue #1 compounds this). |

## 1. Test environment / setup

- Run via `python3 -m http.server` (per README), not `file://`, so provider
  fetches aren't blocked.
- Have devtools Network tab open filtered to XHR/fetch to inspect the 8 live
  provider calls (`ch, tb, ai, va, me, un, px, pb` — `PROV_ORDER`,
  `index.html:452`).
- Test with at least: a fresh/incognito session (no `localStorage`), and a
  returning session (existing `sourced.key.*` entries) since `un`/`px`/`pb`
  behave differently with/without a stored key (`keyGet`, `index.html:223`).
- Repeat every test at 3+ viewport widths given the responsive column logic
  (`colCountFor`, `index.html:821-822`): ≤480 (2 col), 821–1200 (4 col), and
  ≥2101 (7 col) at minimum.

## 2. Text search (debounce, precedence, relevance)

| ID | Test | Steps | Expected |
|---|---|---|---|
| S1 | Debounce timing | Type a query character by character at normal typing speed | No request fires until 350ms after the last keystroke (`index.html:830`); only one final request for the settled text, not one per keystroke |
| S2 | Debounce cancel on fast edit | Type "poster", then within 350ms change to "posters" | Only the final "posters" query is ever sent; the "poster" timer is cleared, not raced |
| S3 | Query overrides active pill | Click "Surreal", then type "graphic design" in the search box | Results reflect "graphic design" (via `textQ`/`rankQ` precedence, line 836,838) — **but flag issue #2**: the "Surreal" pill remains visually active. Decide if this is acceptable or needs a fix (recommend: reset `cat` to a neutral/"Featured" state on typing, or add a distinct "custom search" pill state) |
| S4 | Clearing the query | Type a query, then delete all characters | Falls back to `catQ` (if a pill is active) or `featuredQ`/`"design"` (line 836) — verify results actually refresh to that fallback, not just an empty state |
| S5 | Relevance ranking kicks in with a real query | Search "typography" | `rankQ` is non-null → `listCollections` ranking branch runs (line 551-557): results should visibly skew toward typography-relevant items; open Network tab and confirm `hits.length>=8` branch vs. fallback-to-all-`scored` branch behavior when a query is very narrow |
| S6 | Synonym expansion | Search "riso" | `expandTerms` (line 537) should expand via `SYN.risograph` (line 532) style entries — confirm results include items whose text matches expanded synonyms, not just the literal typed word. **Note:** "riso" itself isn't a `SYN` key (only `risograph` maps to `["risograph","riso"]`) — verify this asymmetric case explicitly, it may not expand as expected |
| S7 | Colour word as text, not pixel search | Search "green" | Per the explicit design comment (line 832-833), this is a **text** meta-search (matches `SYN.green` terms in titles/alt text), not pixel-based — confirm results are text-relevant greens, not necessarily visually green images, and confirm this matches user expectations (may itself be worth a UX review) |
| S8 | No-match query | Search a nonsense string, e.g. "zzxxqqnonsense" | `hits.length` stays 0 → pool falls back to all `scored` (unranked) items (line 555) rather than an empty result; confirm the empty-state UI (`"nothing here yet — try a different search"`, line 893) only shows when literally zero items return across all providers, not just zero relevant ones — verify this is the actual intended behavior |
| S9 | Query with only stopwords/whitespace | Search "   " (spaces only) | `.trim()` (line 836) should treat as empty, falling back exactly like S4 |

## 3. Category pills

| ID | Test | Steps | Expected |
|---|---|---|---|
| P1 | Basic pill switch | Click each visible pill in turn | Input/query clear (line 883), `cat` updates, new browse/rank fetch fires, previous items are replaced (not appended) |
| P2 | Thin-filter auto-replace | Click a pill likely to return <3 results with no query active | Per line 848-853: after first load, if `<3` items and this `cat` hasn't been tried, it's silently swapped for an untried `CAT_Q` entry not currently shown, and `cat` follows the swap. Confirm: (a) it only swaps once per pill (via `triedRef`), (b) the swap is visually smooth/not jarring, (c) it doesn't loop if the *replacement* is also thin |
| P3 | Featured is browse-mode, not ranked | Select "Featured" explicitly after another pill | `catQ` is `null` for Featured (line 835) → falls to `featuredQ`/`"design"` and **no** `rankQ` → pure browse-mode shuffle (line 560), not relevance-ranked. Confirm this is the intended difference vs. other pills (which do set `catQ`→`rankQ`) |
| P4 | Pill + typed query interaction | See S3 above | Cross-reference with issue #2 |
| P5 | `catsShown` pool coverage | Force P2 repeatedly (or inspect `CAT_Q`, line 467-471) across many sessions | Every one of the 18 non-Featured lenses should be reachable eventually, either directly or via auto-replace; none should be permanently unreachable |

## 4. Era filter (advanced search)

| ID | Test | Steps | Expected |
|---|---|---|---|
| E1 | Open/close era modal | Click the `discover_tune` icon | Modal opens (`searchOpen`, line 884,901-913); closing without picking an era leaves `eraIdx=-1` (Any) unaffected |
| E2 | Apply an era | Pick "1960s–70s", close modal | `YEAR_FROM/YEAR_TO` set to 1960/1979 (line 840), refetch fires (era is in the effect's deps, line 855), results should visibly skew to that period where providers expose dates (AIC/V&A/Met) |
| E3 | Toggle same era off | Click the same active era button again | `eraIdx` resets to -1 → `setYears()` resets to `HOME_FLOOR`/null (line 840) |
| E4 | Home floor default | With no era picked, no query, Featured tab | `YEAR_FROM=1920` should still be applied to provider filtering (line 507-509) — confirm pre-1920 content never appears by default |
| E5 | **Race condition (issue #4)** | Open era modal, pick "1900s–50s", close (fires request A), *immediately* reopen and pick "2020s+" before A's network response returns (throttle network in devtools to make this reliable) | Determine actual behavior: does request A's result set get (incorrectly) filtered against 2020s bounds when it lands? This is the key thing to confirm/deny with real network timing, not just code reading |
| E6 | Era + category combo | Apply an era, then switch pills a few times | Era persists across pill switches (not reset by `cat` change) since `eraIdx` isn't touched by pill `onClick` — confirm this is intended |

## 5. Colour search

| ID | Test | Steps | Expected |
|---|---|---|---|
| C1 | Locate the feature | Try to find any UI to pick a colour swatch or enter a hex value | **Expected finding: none exists** (issue #3). Confirm this with the user/PM — is it meant to be re-added, or should the dead code (`advColor` etc.) be removed? Either way this is currently a gap, not a testable feature |

## 6. Provider fan-out & partial failure handling

| ID | Test | Steps | Expected |
|---|---|---|---|
| F1 | Single provider down | Block one provider's domain (devtools request blocking) for `ch`, then separately for `ai`, `va`, `me` | `Promise.allSettled` (line 546) means a failed provider contributes `[]`, not a thrown error — page should still populate from the remaining 7 sources, not show the global error state |
| F2 | All providers down | Block all of `PROV_ORDER`'s domains | `merged.length===0` throws (line 550) → `status:"error"` → `ErrorState` with Retry button (line 892); confirm Retry (`nonce` bump, line 892→855 deps) actually re-attempts rather than looping the same failure silently |
| F3 | Keyless sources only vs. keyed | Test once with no stored keys, once with `un`/`px`/`pb` keys set via `keyGet` | Confirm result mix changes appropriately (more variety with keys), and that missing keys degrade gracefully (those providers just contribute nothing, per each provider's own key-check) rather than erroring the whole fan-out |
| F4 | Interleaving/merge fairness | With all providers healthy, inspect the first 24 merged items' `provider` field | Round-robin interleave logic (line 548-549: `while(added)... for(const l of lists)`) should mean no single provider dominates the first page purely because it returned more items per-call; cross-check against `PROV_WEIGHT` expectations in browse mode (line 560) |

## 7. Pagination / infinite scroll

| ID | Test | Steps | Expected |
|---|---|---|---|
| I1 | Scroll-triggered load | Scroll to ~900px from bottom (line 868 threshold) | `loadMore` fires once, not repeatedly, while `more` is true (guard at line 858) |
| I2 | Dedup across pages | Load several pages via scroll | `seen` Set by `id` (line 861) should prevent duplicate cards even if a provider returns overlapping items across pages |
| I3 | End-of-results | Keep scrolling a narrow query until a page returns nothing new | `end=true` sets (line 862), loader disappears, no further requests fire (guard at line 858/867) |
| I4 | Scroll during colour search | N/A per issue #3, but if re-added: confirm `color` short-circuits `loadMore` entirely (line 858) since colour search loads all 24 upfront (`setEnd(true)`, line 846) |
| I5 | Rapid re-query while `more` is in flight | Trigger `loadMore`, then immediately change the query/pill before it resolves | `reqRef`/`rid` guard (line 843,846,854) should discard the stale in-flight response; confirm no flash of wrong-query content or item-count mismatch |

## 8. First-session quality (the reported issue)

| ID | Test | Steps | Expected today | Recommended target |
|---|---|---|---|---|
| Q1 | Reload the home page 10x in a fresh session each time | Hard refresh / new incognito each time, record the `featuredQ` effectively used (inspect via Network request query params) | Different seed term almost every time out of 19 options (issue #1) — visibly different topics (ceramics vs. sportswear vs. album covers) | Should converge on a small, hand-picked rotation (or a single strong default) so first impression is consistently on-brand |
| Q2 | Reload the home page 10x, same query each time (once Q1 is addressed) | Same as above | Different starting page (1–3) each time (`SESSION_PAGE`) | Page should default to 1 for first-session/first-load; randomize page only for later organic reloads if freshness is still wanted |
| Q3 | Compare Featured-tab ranking vs. a real search | Load Featured tab; separately search "design" explicitly | Featured tab = unranked browse shuffle; explicit "design" search = relevance-ranked | Consider whether the *default* landing view should actually run through the ranked path (with a fixed rankText) instead of pure browse-mode, so quality is never left entirely to `Math.random()` |

## 9. Cross-cutting / regression

| ID | Test | Steps | Expected |
|---|---|---|---|
| X1 | Navigate to a collection detail page after filtering | Apply era + a pill on Explore, click into a collection | Check whether `getCollection`'s "related" fetch (`index.html:562-564`) is unexpectedly filtered by the *leftover* `YEAR_FROM/YEAR_TO` from Explore (module-level globals, not reset on route change) — decide if that's correct or a bug |
| X2 | Back-navigation state | Filter/search on Explore, click into a collection, click "Go back" | Confirm whether search/pill/era state is preserved or reset (component remounts vs. persists) — currently `Explore`'s state is local to the component instance, so a remount (e.g. via route change) will reset to defaults |
| X3 | Resize during active results | Load results, then resize the window across the `colCountFor` breakpoints | Columns redistribute (line 827-828 recomputes on every `colCount`/`items` change) — confirm this full-redistribution-on-resize is visually acceptable and distinct from the "no reshuffle on infinite-scroll append" guarantee, which only applies to appends, not resizes |
| X4 | Loading/error/empty visual states | Force each of `status: loading/error/idle-empty` | Skeleton grid (line 888-891), `ErrorState` w/ Retry (892), and the "nothing here yet" empty copy (893) each render correctly and don't overlap/flash into one another |

## Priority for fixing (suggested)

1. Issue #1 (first-session randomness) — directly reported, highest user-visible impact.
2. Issue #2 (stale active pill) — reproduced live, cheap fix (clear/neutralize `cat` on typing).
3. Issue #4 (era race condition) — needs E5 run first to confirm it's real before prioritizing a fix.
4. Issue #3 (dead colour-search code) — product decision (restore UI vs. delete dead code), not urgent.
5. Issue #5 (no URL state) — larger scope, only worth it if shareable/bookmarkable search matters to the roadmap.
