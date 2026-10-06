# Stage 02.5: Redline, Architectural Intelligence

**Status:** presented 2026-10-06 for approval. Supersedes the Redline description in [`stage-02-visual-directions.md`](./stage-02-visual-directions.md) where they differ.
**Specimen:** [`stage-02-5/redline.html`](./stage-02-5/redline.html), published as an artifact. It is built from **Al Aliah's own current listing photography and real listing data** from staging (6 Oct 2026), not stock or AI imagery.
**Selection recorded:** D-027 (Redline + two borrowings). This document is the design-system study that precedes `alaliah-design-system`.

---

## 1. The correction

| | Stage 02 Redline | Stage 02.5 Redline |
|---|---|---|
| Metaphor | Architectural *documentation*: the drawing sheet | Architectural *intelligence*: understanding a place and a property spatially |
| Where intelligence comes from | Visible apparatus: hairlines, title blocks, dimension marks | Composition: alignment, framing, hierarchy, data anchored where it is true, maps and images linked |
| Photography | Framed and contained | Leads. Images cross grid boundaries, bleed, and carry anchored information |
| Depth | Flat sheet | Layered: ground, image, data sheet, anchor, focus |
| Motion | Lines drawing themselves | Information revealed inside a place or property; map, list and image moving as one system |
| Crimson | Selection, plus line work | Selection, focus, navigation and the primary action only. **No decorative red lines** |

**Kept:** boundaries (as interaction states, not ornament), precision, mapping, measured information, structured data, selective crimson, architectural logic.

**Removed:** dimension lines, measurement ticks, coordinates, schematic title blocks on every module, CAD styling, the "presentation board" look.

**Added:** spatial composition, depth, image choreography, contrast, asymmetry, cinematic moments for place storytelling, and information pinned spatially to imagery and maps.

## 2. Five working principles

1. **Frame.** The grid governs, and images may break it by defined rules (§3). Composition, not decoration, signals precision.
2. **Anchor.** Information sits where it is true: a fact about a terrace is pinned to the terrace, a listing to its location on the map, a price to its card. Anchors only describe what is actually visible or recorded.
3. **Reveal.** Motion uncovers information inside a place or property (anchors appearing, a photo yielding to its facts). Nothing moves to look busy.
4. **Sync.** List, map and imagery behave as one system. Hovering a listing locates it, and selecting a place filters it.
5. **Signal.** Crimson means *selected, focused, here, or do this*. If removing a crimson element loses no information, it should not be crimson.

## 3. Composition system

### Grid
- 12 columns, with a fluid gutter from 16px (mobile) to 32px (wide), and a max content width of 1320px. Wider screens get more image, not more text width.
- **Text measure** never exceeds about 68 characters, even when the image beside it bleeds.

### Image placement rules
| Placement | Use | Rule |
|---|---|---|
| **Contained** | Cards, galleries, editorial inline | Fixed ratio (4:3 cards, 3:2 gallery), no bleed |
| **Edge bleed** | Property hero, editorial feature | Image runs off one page edge (left or right, mirrored in RTL). The text column stays on the grid |
| **Full bleed** | Community and brand moments only | Edge to edge. Requires Tier A or B photography at 2400px or more (§5) |
| **Cross-boundary** | Community pages | The image spans the join between a shade section and a sheet section, binding two moods into one place |

### Overlap rules
- A data sheet may overlap an image by up to a third of the sheet's height, never across faces, signage or the subject of the photo.
- Overlapping text sits on a **solid** surface (sheet or shade). No gradient scrims over photos.
- At most one overlap per viewport. Overlap is an accent, not a texture.

### Depth layers (z-order)
`ground` (sheet) → `image` → `data sheet` → `anchor` → `focus` (crimson state, active panel). Shadows exist only on data sheets that overlap imagery, as a single soft, low-offset shadow. Nothing else gets a shadow.

### Asymmetry
- Hero compositions are asymmetric (7/5 or 8/4 column splits), alternating sides between consecutive bleed moments.
- Search results stay symmetric and regular, because predictability is the usability feature there.

## 4. Density modes (same system, different intensity)

| | Search results | Property detail | Community page |
|---|---|---|---|
| Purpose | Compare, filter, locate | Evaluate, decide, enquire | Understand, feel, explore |
| Image scale | Small, uniform, contained | One edge-bleed hero, then a contained gallery | Full-bleed and cross-boundary |
| Data density | High: tabular figures, compact cards | Medium: one fact sheet, fully structured | Low: few figures, editorial pacing |
| Crimson budget | Selection and map sync, the primary filter state | Primary CTA, selected gallery image, active anchor | Navigation and active anchor only |
| Motion budget | Feedback only (≤ 250 ms), map sync | One reveal on entry (anchors), gallery transitions | One orchestrated entrance, gentle scroll-linked depth |
| Scroll | Native | Native | Smooth scroll allowed (Stage 04 decides) |
| Surfaces | Sheet | Sheet + one overlapping data sheet | Shade + sheet, alternating |

## 5. Photography system

### Tiers
| Tier | Source | Allowed placements |
|---|---|---|
| **A** | Commissioned place and architecture photography (Hard Light borrowing: time-of-day briefs) | All, including full bleed and cross-boundary |
| **B** | Professional listing photography (≥ 2400px, corrected verticals) | Edge-bleed property hero, gallery, cards |
| **C** | Agent and phone photography (current majority) | Contained placements only: cards, gallery, inline. **Never full bleed above 1280px viewport width** |
| **D** | Developer renders | Contained, always labelled "Developer render" |

### Findings from current listings (staging, 6 Oct 2026)
- Most listing photos are WhatsApp exports capped at **1280–1600px wide**. They work in cards and galleries, and soften visibly as full-bleed heroes on large screens. **Full-bleed and community moments need Tier A/B originals at 2400px or more.**
- Some current Tier C photos are strong. The Yas Island villa set has hard light and pergola shadows that already deliver the Hard Light borrowing at card and hero scale. The system should let good Tier C photos rise, not hide them.
- Wide-angle phone distortion (bent verticals) is the main quality gap. A photography guideline for agents (level phone, no ultra-wide indoors, daylight) would lift Tier C cheaply.

### Grading
Neutral, true-to-life daylight. No heavy filters, no teal-orange. The Hard Light borrowing applies only to Tier A community and brand imagery, as a time-of-day brief (noon glare, late light, blue hour), not a filter applied to listing photos.

### Anchors on imagery
- Each anchor describes only what is visible in the photo (e.g. "Pergola-shaded upper terrace").
- At most three anchors per image, revealed on entry, persistent on focus.
- Anchors are keyboard-reachable buttons with text equivalents beside the image for screen readers.

## 6. Maps
- Maps are styled in the system's tokens: sheet land, pale water, ink labels, crimson for *selected* only. Never vendor default styling.
- **Sync contract:** card hover/focus ↔ pin highlight; pin select ↔ card highlight and scroll into view; the community filter ↔ map boundary.
- A map callout shows the listing's photo, which connects imagery and location.
- **Dependency:** precise pins need per-listing coordinates (open-questions Q3). **Verified on staging:** 13 of 14 listings store `0,0`, and one Abu Dhabi listing stores `40.708, -74.011` (lower Manhattan, apparently a theme demo default). No listing has usable coordinates. Until the source provides them, pins sit at community level, which still supports community-level sync (as the specimen shows). The importer must reject `0,0` and out-of-UAE coordinates.

## 7. Type system study

### Principle: width contrast within one family
Redline gets editorial tension from **width and scale contrast inside a single grotesk family**: condensed, large display against normal-width text and slightly extended small data labels. This avoids a second "editorial serif" (cream-serif cluster) and avoids monospace data labels (another generated-design tell).

### Specimen stand-ins
Archivo (variable width 62–125) with Noto Kufi Arabic. These are chosen because they demonstrate the width behavior. They are not selections.

### Shortlist for licensing evaluation in Stage 02.5b
- **Latin:** families with true width ranges (condensed to extended) and tabular figures, e.g. GT America (Condensed/Standard/Extended), Söhne (with Schmal and Breit), Neue Haas Unica, or Archivo as the free fallback.
- **Arabic:** contemporary sans companions with matching weights, tested at matched optical size, e.g. Greta Arabic, 29LT Bukra, IBM Plex Sans Arabic as the free fallback.
- **Criteria:** width range; tabular lining figures; Arabic companion quality and weight match; web licence cost for traffic; variable-font availability; legibility at 13–15px UI sizes.

### Scale (indicative, 16px base)
Display XL 88–120px condensed / Display 56–72 / H1 40 / H2 28 / H3 21 / Body 17 / UI 15 / Label 13 (slightly extended) / Figures use the tabular-lining feature everywhere. Line-height falls as size rises (1.0 for display, 1.55 for body). Sentence case throughout, with no tracked all-caps labels.

### Numerals
Western digits in English. Whether the Arabic interface uses Arabic-Indic digits for prices is decided in Stage 03 alongside the multilingual plugin (W2).

## 8. Color tokens (indicative; final crimson awaits the logo master, Q1)

| Token | Value | Role | Contrast (WCAG) |
|---|---|---|---|
| `sheet` | #F2F4F4 | Ground (cool, not cream) | |
| `paper` | #FFFFFF | Data sheets, cards | |
| `ink` | #14191E | Primary text | 16.0 on sheet |
| `ink-2` | #4A545C | Secondary text | 7.0 on sheet |
| `ink-3` | #5F6A72 | Tertiary text, control borders | ≥ 4.5 on sheet and paper (the earlier #6E7880 failed at 4.08) |
| `line` | #CDD3D7 | Dividers only (decorative; **not** control borders) | 1.4 |
| `crimson` | #B0122C | Signal on light surfaces | 6.4 on sheet, 7.1 on paper |
| `crimson-tint` | #F6E0E4 | Selected row or area fill | crimson text on it 5.6 |
| `shade` | #0F1E25 | Hard Light moments (slate, not black) | |
| `on-shade` | #E8EEEF | Text on shade | 14.5 |
| `crimson-on-shade` | #F0566E | Signal on shade (brand crimson fails at 2.4 here) | 5.1 |
| `error` | #9A4A00 | Validation (burnt amber, never crimson) + icon + text | 6.3 on paper |
| `success` | #2B6A4A | Confirmations | 6.4 on paper |

**Crimson budget:** on light surfaces, about 1–3% of a viewport and never more than one crimson *fill* (the primary CTA) per view. Selection states use crimson outlines or tints, not fills.

## 9. Motion vocabulary (concept; Stage 04 sets the numbers)

| Verb | What it does | Where | Indicative duration |
|---|---|---|---|
| **Settle** | Image eases into its frame on entry (slight scale/position) | Community and property hero, once | 900–1200 ms |
| **Reveal** | Anchors and data emerge from the image in reading order | Hero images, once on entry, then on demand | 400–600 ms, staggered |
| **Anchor** | A pin or hotspot expands into its fact | Imagery, maps | 200–250 ms |
| **Sync** | Card ↔ pin ↔ callout respond together | Search, community map | 150–200 ms |
| **Focus** | Crimson state applied to the selected thing | Everywhere interactive | 150 ms |

- **Never:** scroll-jacking on search or property pages; looping ambient motion; motion on every card; parallax on Tier C images.
- **Reduced motion:** Settle and Reveal become instant, anchors are shown at rest, Sync keeps state changes without transitions.

## 10. Component vocabulary by surface
- **Search:** filter bar (purpose segments with live counts, more-filters sheet), result card (frame, price, purpose, structured title, bilingual community, beds/baths/area, data flags), map panel (community-level pins with counts, selected state, photo callout), result count, sort, empty state ("No homes match in Al Reem. Widen the price range or see nearby Al Maryah"), loading state (frames hold their size, so there is no layout shift).
- **Property detail:** edge-bleed hero with anchors, gallery rail, fact sheet (price, purpose, beds, baths, area, reference, last updated), enquiry panel (sticky on desktop, bottom bar on mobile), floor-plan module (with an honest empty state), location panel (map + community link), agent block, related listings.
- **Community:** shade header with bilingual name, cross-boundary image, editorial body, "On Al Aliah now" listing strip, map inset with community boundary, facts panel (only sourced facts), next-community navigation.
- **Shared:** header, footer, breadcrumbs, buttons (primary crimson fill, secondary ink outline, tertiary text), chips, tabs, accordions, forms (error colour separate from crimson), toasts, empty, loading and success states.

## 11. Bilingual rules (Rubric borrowing)
- Community names and section names appear in English and Arabic together, at matched optical size, as part of the composition rather than as a translation line.
- Arabic is never machine-translated for display. Names are verified (open item: official Arabic forms for Al Reef Downtown and similar development names).
- All compositions mirror for RTL: bleed sides, overlap sides and anchor label sides flip. Directional icons flip; non-directional ones do not.

## 12. Data-quality findings that shape the system
From the 11 Abu Dhabi listings on staging:
- **Missing size:** one listing has area 0. The card shows "Area not listed", never "0 sq ft".
- **Inconsistent types:** a "villa" categorised as apartment, a "studio" stored as 1 bedroom. The system needs QA flags in admin, and structured titles derived from data.
- **Sales-style titles** ("Exclusive Offer", "10% discount", "Invest Now") conflict with the brand voice. The specimen shows structured titles derived from the data. Whether listings carry a separate marketing headline is a Stage 03 content-model question.
- **No usable coordinates:** see §6.
- **No floor plans** are attached to the Abu Dhabi listings. The floor-plan module needs a designed "request a floor plan" state.
- **Single generic agent** ("Al Aliah International"). Agent-led trust (brief §40) needs real agent profiles.
- **Correction to the staging audit:** 11 of 14 listings are tagged Abu Dhabi and 3 Dubai. The earlier statement that current listings are Dubai projects overstated it (see open-questions B1).

## 13. Redline anti-patterns
- Decorative red lines, ticks, coordinates, CAD or blueprint styling.
- Crimson on more than one fill per view; crimson as a background; crimson for errors.
- Anchors that describe things not visible in the image, or invented distances and times.
- Full-bleed Tier C photos on large screens.
- Gradient scrims over photos for text legibility.
- Identical card treatments on every module. Cards exist for listings, not for every content block.

## 14. Risks
- **Photography is now load-bearing.** The corrected direction raises the value of Tier A/B imagery. Without it, community pages fall back to framed Tier C, which still works but is less cinematic. (Q2 budget is still open.)
- **Overlap and bleed can degrade into "trendy layout".** The rules in §3 must be enforced in templates, not left to editors (W3 editor lock-down).
- **Map quality** depends on coordinates (Q3) and a map provider choice.
- **Final crimson** may shift once the logo master arrives (Q1); token contrast must be rechecked.

## 15. Next step
Approve 02.5, then:
1. Create the `alaliah-design-system` skill from §§2–13 (D-003).
2. Run Stage 02.5b as needed: licensed type tests (Latin + Arabic) and crimson calibration against the logo master.
3. Proceed to Stage 03 (information architecture and page structure), using the three surfaces here as the reference density modes.
