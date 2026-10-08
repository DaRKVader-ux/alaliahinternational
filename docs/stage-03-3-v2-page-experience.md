# Stage 03.3 v2: Page experience

**Status:** v2 specimen revised 2026-10-08 from direct reference study, awaiting review (D-039). v1 is not approved and is kept only as a record. No theme work has started, and Arabic/RTL is deferred.

**Specimen:** `docs/stage-03-3-v2/index.html`, with `site.css`, `site.js`, `data.js`, `img/`, `logo/` and `vendor/`. Serve the folder (`python3 -m http.server` from `docs/stage-03-3-v2`). The dark bar at the top is specimen chrome, not website:
- **Page:** the four pages.
- **Listing:** ready villa, off-plan or sparse (property page only).
- **Permit:** placeholder or real data (property page only).
- **Replay intro.**
- **Desktop / Mobile 390.**
- **Notes:** the 4-motion rule and data notes per page.

## Refinement pass 2026-10-08: real map and five targeted fixes

The IA and art direction (D-040) are unchanged. This pass made five targeted changes and put a real map in place.

- **Map:** real OpenStreetMap vector tiles (OpenFreeMap "liberty" style) rendered by MapLibre 4.7.1. The set is bundled in `map/` by `tools/map/fetch_tiles.py`: 257 tiles, z8–13, plus glyphs, sprite and style.
  - **Coverage:** the tile box W54.25 S24.15 E54.80 N24.62, which is also the map's `maxBounds`, so no view can reach an unbundled tile.
  - **Labels:** English, else Latin transliteration. Road shields show their `ref`.
  - **Glyphs:** Latin plus the Arabic ranges. Some OSM features carry Arabic in `name:en`, and one missing glyph range blanks the whole tile.
  - **Verified:** a sweep of z10–13 across the box gives 240 tiles, all rendering, with no failed requests.
- **Pin positions:** taken from the OSM place labels in the tiles, so each pin sits just above the map's own label for that community.
  - Al Reef Downtown has no place label. Its pin uses the community's OSM points of interest.
  - Madinat Al Riyad moved about 15 km to the OSM position.
  - The OSM node for Khalifa City sits near Masdar. It is used as published.
- **Hero search:**
  - Purpose (Buy, Rent, Off-Plan) is a segmented control on the photo, on a solid dark plate.
  - One white bar holds Location, Type, Price and Search, at headline width.
  - Bedrooms moved to Filters.
  - The city note and the Popular row were removed: they repeated the tiles below, and one link went to an unfiltered search.
- **Mobile menu:**
  - One section opens at a time, and the opened heading moves to the top of the panel.
  - Rows are aligned (the UA button padding is removed).
  - Every link lands on what its label says: type routes, area searches filtered by location (with a count of what the link opens), and developer links that select that developer.
  - Counts are live from the data.
  - The menu button carries `aria-expanded`.
- **Search results:**
  - One row: Location, Property type, Price and All filters; Sort and a single Map toggle on the right.
  - Bedrooms, Completion and "Shortlisted only" are in All filters.
  - "Save this search" is a quiet action beside the count.
- **Property rail:**
  - The price shows "a year" inline, with a one-line summary (beds, baths, size, type) below it.
  - There is one primary action, then WhatsApp and Call.
  - The call-back form opens on request.
  - The office and the reference to quote sit in the card footer.
  - The decorative crimson top bar is removed.
  - On mobile the rail keeps only the call back and the office, because the bottom bar carries price and actions.
- **Developers:** the active developer sets the whole band.
  - **Backdrop:** a blurred wash of its project render under a solid 72% overlay, crossfading on change.
  - **Danube (no approved render):** its logo, faint, on dark.
  - **Layout:** the picker turns white for the active developer, and the heading and directory stay on white so the homepage keeps its light/dark rhythm.
  - **For review:** the backdrop is a full-bleed use of a developer render, which the design system limits to contained, labelled placements. It is blurred past recognition and the labelled render stays on the stage. This is a deliberate exception and needs approval.

**QA:**
- `tools/qa/check.mjs` on 9 routes: 0 console errors, no overflow from 1920 to 375 px, axe 0 at 1440 and 390.
- Axe 0 on 21 interactive states, including the Danube scene, the rail call back, the two-section menu, a selected map pin and the hidden map.

## Art-direction revision 2026-10-08 (D-040)

- Plus Jakarta Sans throughout.
- No gray section grounds; crimson is the behavioural signal.
- **Cards:** 22–24 px padding (18 px on mobile), in the order image → price and title → facts → View property → WhatsApp / Call.
- **Areas:** dark and data-backed (homes, off-plan projects, main property type, price from), with a crimson active state.
- **Developers:** an interactive showcase driven by selection; the logo directory is secondary.
- **Investing:** photo-backed with a data overlay.
- **Contact:** a crimson band, then a dark footer.
- **Maps:** MapLibre with an OpenStreetMap street-map style, bundled by `tools/map/fetch_tiles.py` (see the refinement pass above).

## Revision 2026-10-08: from the live references

Both reference sites were inspected directly. Observations, the comparison with v2, and what was adopted or deliberately not copied are in [`stage-03-3-v2-reference-study.md`](./stage-03-3-v2-reference-study.md). Changes in this revision:

- **Hero:** a white loader plate with a real load counter opens outward from a crimson redline; headline words rise out of their masks; the search settles from blur. The hero stays pinned while the next section slides over it.
- **Section headings:** word-by-word mask reveal on entry, CSS only.
- **Areas:** facilities-style entrance (from the right, blurred, staggered); the active panel takes about a third and its caption un-blurs.
- **Off-plan:** a featured project band (image, numbers, payment-plan bar, CTA) before the comparison rail.
- **Cards:** in-card photo browsing.
- **Navigation:** "List your property" in the header and menus; "Latest listings" in the Buy and Rent menus; CTA buttons on featured menu cards.
- **Mobile:** a quick bar (Search, Off-Plan, Shortlist, WhatsApp, Menu).
- **Search:** a Ready / Off-plan switch, an owner card among results, and popular searches.
- **Property:** a mortgage estimate on ready sales and an inline call-back form in the enquiry card.
- **Site-wide:** a call-back band and footer area counts.

## 1. Where the brief and the data collide

These limits come from the inventory, not the layout. Commissioned photography or more listings would change them; a redesign would not.

| Brief asks for | Reality on staging | What v2 does |
|---|---|---|
| Strong full-viewport hero imagery | Every listing photo is a phone export, at most 1,600 px wide (most 1,280). No Abu Dhabi place photography exists | Uses Al Aliah's own strongest listing photo (West Yas villa), credited and linked. It softens above 1,600 px and on retina screens. Commissioned photography (Q2) fixes this; the layout does not |
| `#FF8E47` for hover, icons and emphasis | 2.3:1 on white: it fails as text, as a focus ring and as a sole cue | Used only as a fill behind `#222` text, on dark surfaces, and as a hover accent paired with another cue (D-039) |
| Featured Developers with logos and project imagery | 17 logos on staging; only 2 verified developer→project links, both Dubai. One of the two projects (Bayz 102) has off-brand renders | Two developer cards (Binghatti → Aquarise; Danube → Bayz 102 with a designed no-image state) plus a 17-logo directory. Abu Dhabi has no developer link yet (C8) |
| Madhmoun permit near the buying facts | No verified permit for any listing (C9) | A compliance block, shown as a labelled placeholder; "Permit: none" shows the real-data state (block omitted) |
| Investment hotspots | No yields, price history or market data | Goal-led guidance from real listings and payment plans. It states plainly that yields need sourced data, and converts to "Get an investment shortlist" |
| Saadiyat in the Areas panels | No listings and no approved photography | Left out of the image panels; named as empty in the menu and filters |
| Premium collection | 11 Abu Dhabi listings; "luxury" breaks the brand voice | "Selected by our advisers: homes with room to live", three real homes chosen on space, each with a data-based reason |
| Area detail with off-plan and developers | Yas Island has one listing and no projects | The page is built on that thin inventory: one home, nearby Al Raha homes, the map, landmarks and an adviser form. Empty sections are omitted |

With the current inventory, the same homes appear in several homepage sections. This should resolve as listings grow; the sections are built to scale.

## 2. Direction

- **Property-led.** Real homes are the visual subject. Type is moderate (condensed display for prices and headings, Sofia Sans for reading) and supports the photos rather than replacing them.
- **Colour.** White ground, `#222` text and dark bands, and `#941F27` for the active signal and primary action. Orange appears on interaction. Neutral greys derive from `#222`, with no hue.
- **Redline as intelligence.** The crimson underline marks the current thing (tab, nav item, map community). There are no drafting lines or diagrams in place of photos. The map stays where it does work: search, location and area context.
- **Intensity.** Home and Area are Immersive, Property is Editorial, Search is Functional.

## 3. Navigation and mega menus

Buy, Rent, Off-Plan, Areas, Developers, About Us; then a shortlist heart, WhatsApp and a Contact button. Each mega menu has:
- columns with live counts;
- one featured card, whose photo swaps as you hover list items;
- a footer link to everything.

| Menu | Contents |
|---|---|
| Buy | By type, location (Abu Dhabi, Dubai off-plan), completion, budget; featured ready villa. "Penthouses: none listed now" stays honest instead of linking to nothing |
| Rent | By type, popular areas, annual budget; featured Yas villa |
| Off-Plan | Abu Dhabi and Dubai projects with handover dates; chips by developer, handover year and payment plan; featured Brabus Island |
| Areas | Abu Dhabi and Dubai with counts; area guide; featured Yas Island |
| Developers | The two developers with verified projects (logo, project, location, handover), four directory logos, "All 17 developers" |

Mobile: a full-screen menu with accordion sections, two-column link tiles, featured homes, and a fixed WhatsApp / Call / Contact bar.

## 4. Pages

### Homepage

The sequence runs discover → compare → understand → contact:

1. **Hero.** Full viewport, real photo, headline, then the search panel: Buy / Rent / Off-Plan; location combobox, type, bedrooms, price; live count on the button. Mobile shows location plus a Filters sheet.
2. **Start here.** Three image tiles: Buy, Rent, Off-Plan, with counts and price ranges.
3. **Homes you can view this week.** For sale / For rent tabs; property cards.
4. **Selected by our advisers.** A curated, image-led band: the list drives the large photo.
5. **Areas.** Image panels: one expands, the others compress. Abu Dhabi / Dubai switch. Mobile: a swipe deck where the centred card is active.
6. **Off-Plan.** Project cards unlike property cards: price, handover, payment plan as a proportional bar, units, then "Payment plan & brochure" and WhatsApp.
7. **Investing, but not sure where?** Four goals with live matches.
8. **Developers, through their projects.**
9. **Advice first, then the right listing.** Short positioning, four service paths, and a contact form with WhatsApp and Call.
10. **Footer.**

### Property card (conversion rules)

- **Content:**
  - a 4:3 photo with purpose tag, photo count, "Developer render" label where it applies, and a 44 px shortlist button;
  - price, structured title, location;
  - beds, baths and size ("Size not listed", never 0);
  - the reference.
- **Behaviour:** the whole card opens the listing. WhatsApp and Call are always visible, labelled and at least 44 px. Hover adds "View property", a slow crop and a title underline; nothing essential hides behind hover.

### Search / Buy

- Purpose switch, live count, sticky filter bar.
- Filters for location, type, bedrooms, price and completion, each with counts that respect the other filters.
- Removable chips, sort, a Shortlist filter, List / List-and-map, and Save search.
- **Card ↔ map sync:** hovering a card lights its community and pin; hovering a pin marks its cards; clicking a pin selects and shows a preview.
- Compare up to three homes: price, price per sq ft, space, status, payment plan and contact.
- **Empty state:** each filter with what removing it would return, plus Alert me and Ask an adviser.
- **Mobile:** a Filters sheet with a live "Show N homes" button, and a floating List / Map switch.
- Native scroll and CSS-speed feedback only.

### Property detail

- **Gallery mosaic.** The signature interaction: the clicked photo grows into a full-screen viewer, filterable by room where photos are tagged.
- **Overview.** Every structured field sits near the top: price, reference, beds, baths, built-up area, type, status, price per sq ft. Missing fields (plot area, furnishing) are omitted and the grid rebalances.
- **Off-plan.** An "Off-plan essentials" band directly under the facts: handover in large type, then the 10 / 75 / 15 plan as a bar and three steps with approximate AED amounts.
- **Madhmoun permit block.** Sits next to the buying facts.
- **Content sections:**
  - the description (boilerplate and licence lines removed);
  - rooms from the agent's text, where present;
  - amenities split into In the home / Building and community / Shared-or-private-to-confirm;
  - floor plan on request;
  - a community-level map;
  - the project module;
  - similar homes.
- **Contact.** A sticky enquiry card on desktop; a bottom bar (WhatsApp, Call, Enquire) on mobile.

### Area: Yas Island

- **Why Yas Island.** It has the strongest real place photography (West Yas).
- **Hero.** Full-viewport hero with the English and Arabic name, and a facts bar with See homes and WhatsApp.
- **Story.** A pinned three-photo story: the active photo widens as you scroll, the others compress.
- **Discovery.** Homes and nearby Al Raha homes; a map of the island and its neighbours with counts; real-estate facts from our listings; landmarks; a contact band; other areas.
- **Smooth scroll.** Lenis runs on this page only. There is no inner scroll area, and "Skip the story" jumps past it.

## 5. The 4-motion rule

| Component | Hide | Reveal | React | Move |
|---|---|---|---|---|
| Hero (once per session, ≈3.4 s, skippable) | Intro plate with the logo | Three photo panels, then the full photo; headline lines; search | Tabs and fields arrive in order | Side panels compress; the centre frame grows to full bleed; the photo settles from 1.4× |
| Hero on scroll | Headline fades | Next section | n/a | Photo compresses into a framed inset |
| Mega menu | Page dims | Panel unrolls (280 ms) | Item hover: orange edge | Featured photo crossfades |
| Area panels | Others compress and desaturate | Active area's name, counts and actions (after 380 ms) | Hover, focus, tap | Width (900 ms), image crop (1.4 s) |
| Selection | Previous photo | New photo wipes in | List item edge | Crop settles |
| Property card | Nothing essential | "View property" | Shortlist, hover, focus | Slow crop, arrow |
| Gallery | Mosaic | Viewer, strip | Room filters | Clicked photo grows into place |
| Area story | Other panels compress | Chapter text | Progress bar | Panel width by scroll |

UI feedback is 150–300 ms. Architecture moves at 900–1,400 ms. Reduced motion shows every final state: no intro, a static story, no Lenis.

## 6. Mobile

Mobile is designed rather than stacked:
- photo-first hero with a compact search;
- swipe rows for tiles, homes, areas and off-plan;
- 48 px contact buttons on every card;
- a filter sheet and a List / Map switch;
- a swipeable gallery and a 2-column fact grid;
- the off-plan plan as stacked steps;
- a permit block and a sticky contact bar;
- a static area story.

## 7. QA (2026-10-07)

`tools/qa/check.mjs` ran on eight routes (home, search sale/rent/off-plan, the three property states, area):
- 0 axe violations at 1440 and 390;
- 0 console errors;
- no horizontal overflow at 375–1920.

A separate axe pass ran on the five mega menus, the gallery viewer, the enquiry and compare dialogs, the filter popover and sheet, the mobile menu, the Dubai area panels and the empty state. After fixes it was clean.

## 8. Open questions for review

1. Hero intro: is 3.4 s once per session right, or should it be shorter?
2. Hero image: is our own listing photo acceptable until commissioned photography exists, or should a labelled developer render lead?
3. Featured developers are Dubai-only today. Show them on the homepage, or hold until an Abu Dhabi developer link is verified?
4. Off-Plan in search: projects and units together (current), or separate tabs?
5. Permit block: confirm Madhmoun for Abu Dhabi listings and the rule for Dubai listings.
6. Room fields (maid's, driver's, majlis): add them after approval (C7)?
7. Header Contact as a dark button with WhatsApp beside it: is that the right weight against the crimson search button?
