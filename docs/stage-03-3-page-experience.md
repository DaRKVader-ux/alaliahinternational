# Stage 03.3: High-fidelity page experience

**Status:** awaiting visual approval. Nothing here is a decision until approved (D-038). No theme work has started.

**Specimen:** `docs/stage-03-3/specimen.html` (with `specimen.js` and `img/`). Open it directly or serve the folder (`python3 -m http.server` from `docs/stage-03-3`). The bar at the top switches page, listing state (rich or sparse), Desktop or Mobile 390, an RTL check, and per-page notes.

Routes: `#home`, `#search`, `#search/rent`, `#property/rich`, `#property/sparse`, `#area`.

## 1. Material

- **Data:** the 11 Abu Dhabi staging listings, the 17 developers, the two verified projects, and the 02.5c geography. Counts, prices, sizes, handover and payment plans come from staging fields. Nothing is invented. Where data is missing, the page says so.
- **Photography:** 47 staging listing photos, all Tier C (phone and WhatsApp exports, 1280–1600 px). The specimen copies are EXIF-stripped, capped at 1280 px, and pixelated where they showed number plates (4 photos) or a third-party sign's phone number (1 photo).
- **Not used:**
  - the staging area hero images (aerial renders, stock-like and possibly AI imagery);
  - the Bayz 102 renders (black-and-gold interiors, a Burj Khalifa skyline with a flying car);
  - the 31094 renders that carry BRABUS branding (one unbranded aerial render is used, labelled "Developer render");
  - any image from outside the staging library.
- **Typesetting:** the wordmark is typeset until the logo master arrives (Q1). Fonts load from Google Fonts in the specimen only; production self-hosts them.

## 2. Composition logic

| Page | Level | Idea |
|---|---|---|
| Homepage | Immersive | A searchable map of Abu Dhabi opens the site, not a photo with a search box on it |
| Search / Buy | Functional | List and map act as one system; the Site select card carries the identity |
| Property detail | Editorial | One signature interaction (room index), then quiet, honest modules |
| Area: Al Raha | Immersive | A four-chapter pinned story in normal document scroll, then plain discovery |

### Homepage
The sequence is not hero, cards, stats, testimonials, CTA:

1. **Search the map.** A statement, plus the search sheet anchored across the map edge. The sheet holds the page's one crimson fill. Purpose, community and filters update the live count and the map clusters. Choosing a community draws its redline. One contained, anchored photo shows a real home, because Tier C photos cannot go full bleed.
2. **Homes, by what you need.** Buy, Rent and Off-plan as tabs over Site select cards, in a 7/5 offset.
3. **Abu Dhabi, community by community.** An inversion section: a type-led index of mirror lockups, live counts and "from" prices, beside a sticky map plate. Dubai sits in a second tab, contextual only (D-032).
4. **Off-plan, read properly.** Price, handover and payment plan as one comparable row, with the payment plan drawn as a proportional bar. Gaps read "Not confirmed" or "Ask for the payment plan".
5. **Who builds it.** All 17 developers as a type wall. Only the two with verified projects carry a count. There are no logos: 12 of the 17 are flagged for quality.
6. **Local expertise.** A statement and four advisory paths. There are no statistics or testimonials, because none are sourced (Q9).
7. **Conversion points.** Each section's action is contextual: search, talk it through with an adviser, list your property.

### Search / Buy
- Filter counts respect the other active filters. Options with zero results stay visible but quiet.
- Every active filter becomes a removable chip.
- **List–map sync:** hover or focus a card, and its community draws on the map with a callout. Hover a community, and its cards are marked. Click a cluster, and the results filter to it.
- **Empty state:** names the blocking filter and how many homes removing each one would return, and offers an alert. Try Community → Saadiyat Island.
- **Missing data:** "Area not listed" (never 0); off-plan renders are labelled; positions stay at community level, since there are no coordinates (Q3).
- **Shortlist:** the toggle on each card, a crimson plot marker, and a tray.

### Property detail
- **Opening:** a contained photo with the data sheet overlapping it by about a column (the system's one permitted overlap). The sheet holds the price, the structured title, the mirror lockup, figures, "Request a viewing", call, WhatsApp, shortlist and the reference.
- **Signature: the room index.**
  - The photo settles once.
  - Up to three hotspots name only what is visible.
  - Room chips with counts filter the gallery and mark the related fact.
- **Rich (31521, Yas Island):**
  - 16 photos, hand-tagged by room for this specimen;
  - amenities, plus the agent's room list;
  - a floor-plan module (marked placeholder: no plans exist);
  - location;
  - a project module (marked demo);
  - similar homes.
- **Sparse (AA-1004, migrated):**
  - with no room tags, the page falls back to the standard gallery;
  - portrait photos are shown whole, not cropped;
  - with no floor plans, project or developer, those modules are absent rather than faked;
  - the map stays at community level.
- **Agent contacts:** private by default (03.2 closing correction), so the page offers a form, WhatsApp and call actions without showing numbers.

### Area: Al Raha
- **Why Al Raha:** it has the richest real material: three listings, townhouse streets and waterfront apartments.
- **The story:** four chapters (Approach, Arrive, Live, Homes) pinned in normal document scroll.
  - There is no inner scroll area, so nothing traps the wheel or touch, and "Skip the story" jumps past it.
  - The last chapter draws the redline and states the live count.
- **After the story:**
  - four "at a glance" figures, all derived from listings;
  - homes as Site select cards;
  - projects and developers, which say plainly that none are listed;
  - a city-zoom "Around Al Raha" map with live counts;
  - a closing action.

## 3. Responsive behaviour

The specimen uses container queries at 760 and 1120 px, so the Mobile 390 frame renders the real mobile layout.

- **Header:** collapses to wordmark, shortlist and a Menu dialog.
- **Homepage:**
  - the statement stacks above the search sheet, which stacks above the map;
  - the anchored photo and legend drop;
  - the homes become a swipe row;
  - the community index becomes a list with the map plate above.
- **Search:**
  - a one-line chip rail;
  - a full filter sheet with a live "Show N homes" action;
  - a sticky List / Map switch.
- **Property:**
  - a full-width photo with swipe and a chip rail;
  - the price sheet follows;
  - a sticky bar keeps the price and "Request a viewing" in reach.
- **Area:** the story becomes a static stacked sequence on mobile and under reduced motion.

## 4. Interactions and motion

"Architecture moves slowly. UI moves quickly." Durations are provisional until Stage 04, and the Stage 04 system is not built here.

| Where | Motion |
|---|---|
| Card, map, callout | Sync 150–200 ms; the redline draws in 420 ms |
| Property hero | Settles once (clip reveal, 1.1 s); hotspots reveal in reading order |
| Room chips | The gallery filters (≤ 400 ms) |
| Area story | Chapter crossfades and the redline draw, tied to scroll position |
| Search, filters, forms | CSS feedback ≤ 250 ms; native scroll, no smooth scroll |

Nothing loops or autoplays. Reduced motion shows final states.

## 5. QA (2026-10-07)

`tools/qa/check.mjs` on all six routes found:
- 0 axe violations at 1440 and 390;
- 0 console errors;
- no horizontal overflow at 1920, 1440, 1024, 768, 390 or 375.

The RTL check ran on four pages at 1440 and 390:
- the layout mirrors, with no overflow;
- maps and map-anchored elements stay unmirrored.

Under reduced motion, the Area story renders static.

## 6. Data findings (no scope expansion; see open-questions C1–C5)

- **C1. Room tags (data-model gap).** The room index needs a room tag on every gallery image. The 03.2 model has none. This matters only if the room index is approved.
- **C2. Licence and permit numbers in descriptions.** They are not shown until they are verified into the permit fields.
- **C3. Legacy description boilerplate.** "Discover luxury living…" breaks the brand voice; editorial rewrite needed.
- **C4. Legacy listing anomalies:**
  - amenity noise (a back yard and a garden on a tower apartment);
  - 31571 linked as a WPResidence sub-unit of the Dubai project 32101 (ignored);
  - "West Yas" appears only in free text;
  - 31023 is typed as an apartment but shows a villa.
- **C5. Photo privacy.** Listing photos show number plates and third-party phone numbers, so they need a pre-publication check.

## 7. Open visual questions

1. **Homepage opening:** is a map-led opening right for Al Aliah, or should a real photo lead once Tier A photography exists?
2. **Statement size:** at 1440, does the statement compete with the search sheet?
3. **Live counts:** they are honest but small (5 to buy). Show them on the homepage, or only on the map?
4. **Developer wall:** does it help, or should it be a short list? 15 of the 17 names have no listings.
5. **Search layout:**
   - two card columns beside the map, or three without it;
   - Off-plan as its own purpose, or a completion filter under Buy (current).
6. **Room index:** approve it as the property signature, accepting the room-tag requirement (C1)?
7. **Area story length:** four chapters for a community with three listings, or a shorter story (Approach + Homes) for small communities?
8. **Arabic place names:** they need native verification (W2). Is the Reem Kufi / Noto Kufi split at 28 px right in practice?
9. **Commissioned photography:** Tier A photography would change the homepage opening and the Area Approach chapter most (time-of-day street and waterfront). Is there a budget (Q2)?
