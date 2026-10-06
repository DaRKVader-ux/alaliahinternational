# Stage 02.5b: Redline System Refinement

**Status:** presented 2026-10-06 for approval. Refines [`stage-02-5-redline.md`](./stage-02-5-redline.md) without redesigning it. Where the two differ, this document wins.
**Specimen:** [`stage-02-5b/system.html`](./stage-02-5b/system.html), published as an artifact (https://claude.ai/artifact/1Q9beuTM3q2qunhPShatnY, private until shared). Built from Al Aliah's own listing photos and staging data. Typefaces are free stand-ins for the licensed shortlist below.
**Scope:** design-system only. No page designs, no WordPress work. Stops for approval before Stage 03.

---

## 1. Typography: an ownable pairing

### What was wrong with 02.5
Archivo + Noto Kufi was legible but anonymous: a neutral grotesk any portal could use, and an Arabic face chosen for coverage rather than character.

### Three candidate pairings (rendered in the specimen)
| | T1 · Compressed + Kufi | T2 · Extended + Geometric | T3 · Cut + Plex |
|---|---|---|---|
| Latin display | **Anybody** at narrow widths (50–70): tall, compressed, architectural | **Syne** Bold/ExtraBold: wide, idiosyncratic | **Funnel Display**: cut-in joins, contemporary |
| Latin text/UI | Anybody at normal width (≈100); labels at wide width (≈120) | Instrument Sans | Funnel Sans |
| Arabic display | **Reem Kufi**: geometric Kufi, built from straight strokes and right angles | Alexandria (geometric, wide) | IBM Plex Sans Arabic Bold |
| Arabic text | Noto Kufi Arabic | Alexandria | IBM Plex Sans Arabic |
| Character | Architectural, vertical, civic | Gallery, art-space, expressive | Product, contemporary, crisp |
| Risk | Compressed display needs short names; long names wrap | Syne reads "creative studio" more than "advisory"; the extended width costs space in Arabic-length strings | Least distinctive of the three; Funnel's cuts become a gimmick at large sizes |

### Recommendation: T1, Compressed + Kufi
- **One Latin family across a width axis** turns Redline's width-contrast principle into an identity. Compressed display for places and figures, normal text, slightly extended labels. Nobody in the competitor set does this.
- **Geometric Kufi for Arabic display** is architecture-derived: square and geometric Kufic is the script historically built into brick and tile. That gives the Arabic side real character instead of a translation layer, and pairs with the vertical, compressed Latin.
- **Text-size legibility stays with plainer faces:** Anybody at normal width for Latin text and Noto Kufi Arabic for Arabic text. Reem Kufi is display-only (≥ 28 px).

### Licensed path (Stage 05 decision, budget-dependent)
The stand-ins are free. A licensed upgrade keeps the same structure:
- **Latin:** a grotesk with real width range and tabular figures, e.g. Söhne + Söhne Schmal/Breit, or GT America Compressed/Standard/Extended.
- **Arabic:** a geometric Kufi display paired with a modern Arabic text sans, e.g. 29LT Bukra or Greta Arabic for text. Test candidates at matched optical size against the Latin.
- If no licence is bought, T1's free fonts are production-viable (all are OFL on Google Fonts and can be self-hosted from the theme).

### Signature typographic devices (T1)
1. **Mirror lockup.** The English name is start-aligned, the Arabic end-aligned, on one shared baseline row. The two scripts read toward the outer edges of the same line. Used for community and section names only.
2. **Figure-first numbers.** Key figures are set compressed and large with a small, normal-width unit (`420,000 AED/yr`). Tabular lining figures everywhere.
3. **Width as hierarchy.** Compressed means *place or figure*, normal means *reading*, extended means *label or metadata*. No tracked all-caps, and no second display family.

### Scale (T1, 16 px base; per intensity in §7)
Display 160 / 112 / 72 · Heading 44 / 30 / 22 · Body 17 · UI 15 · Label 13. Display line-height 0.86, body 1.55. Compressed display wdth 56–62; labels wdth 118–122.

## 2. Visual hierarchy: controlled moments

A uniformly clean system reads as a prototype. Hierarchy now comes from a small set of named **moments** that break the calm on purpose, used sparingly.

| Moment | What it does | Rule |
|---|---|---|
| **Statement** | Display type at 4–8× body size; may cross an image edge | One per viewport; only on a low-detail image area (sky, wall) or solid surface |
| **Bleed band** | An image runs edge to edge between text sections | Tier A/B photography only (≥ 2,400 px); never on Functional pages |
| **Inversion** | A shade section interrupts sheet sections | At most one per Editorial page; any number in Immersive storytelling |
| **Offset** | Content shifts to an asymmetric 8/4 or 4/8 split | Alternate sides between consecutive offsets; mirror in RTL |
| **Figure** | One number at display size carries a module | The number must be real and sourced; never decorative statistics |

**Rhythm rule:** a moment needs quiet around it. In Editorial pages, allow at most one moment per viewport and at least two quiet modules between moments. Functional pages use no moments except the Figure, for the result count or price.

## 3. Signature property card: "Site select"

The card, its data, crimson selection and map context respond as one unit. There is no tilt and no 3D.

| State | Image | Data | Crimson | Map |
|---|---|---|---|---|
| Rest | Framed 4:3 | Price (figure-first), title, mirror-lockup place, beds/baths/area | None | Community shown in the card's **locator** (a micro-map in the data strip) |
| Hover / focus | Frame lifts 8 px inside its box; image eases up to reveal the locator strip | Secondary line appears (price per sq ft when both values exist; otherwise nothing) | Thin crimson boundary traces the card (≤ 250 ms) | Matching community and pin highlight on the main map; a photo callout appears |
| Shortlisted (via the Shortlist toggle) | Stays lifted | "On your shortlist" replaces the secondary line | Crimson boundary persists, plus the locator dot turns crimson | Pin becomes a crimson plot marker with price tag |
| Shortlist tray | — | Count + thumbnails dock at the bottom of the results | Count badge in crimson | "Show shortlist on map" filters pins |

- The **locator** is the identity element: every card carries its place, not just a text label.
- **Derived data only:** price per sq ft is computed from listed price and area. It is hidden when either is missing, and never shown for rentals as a "yield".
- **Two actions, kept apart.** The card opens the listing (its title is the link). Shortlisting is a separate toggle button in the data strip (`aria-pressed`). Making the whole card the shortlist toggle was tested and rejected: users expect a card to open the home, and a card cannot be both a link and a toggle.
- **Keyboard:** focus anywhere in the card shows the same boundary and map sync as hover; Enter/Space on Shortlist toggles it.
- **Reduced motion:** no lift or trace; states change instantly.

## 4. Map art direction

Vendor default styling is never used. The map is a Redline surface built from the same tokens.

| Element | Treatment |
|---|---|
| Land | `sheet` (#F2F4F4); no terrain shading |
| Water | Pale slate (#D6E3E7), one darker depth band along coasts |
| Roads | Only arterial roads, thin white strokes; minor roads hidden below street zoom |
| Labels | T1 compressed for community names, mirror lockup at community zoom; ink-3 for context places |
| Community areas | Hairline ink-3 outline, transparent fill; **hover** tint; **active** crimson 2 px boundary + crimson-tint fill. The redline appears only as the selected state. |
| Clusters (city zoom) | Ink disc with count, sized in three steps (1, 2–5, 6+) |
| Listing pins (community/street zoom) | **Plot marker**: a small ink square with white border (a plot, not a teardrop) |
| Active pin | Crimson plot marker + price tag (figure-first) |
| Shortlisted pins | Crimson outline square |
| Attribution | Kept, small, ink-3 |

**Zoom behavior:** city shows communities with counts; community shows clusters splitting into plots; street shows plots with price tags on hover. **Recommended stack:** MapLibre GL with a custom style JSON on vector tiles. The tile source (self-hosted Protomaps/OpenMapTiles vs a hosted provider) is a D-006 decision in Stage 03.

**Data dependency:** plot-level pins need real coordinates. Staging has none (open-questions Q3). Until the feed provides them, the map runs at community zoom only.

## 5. Property-detail signature moment: "Room index"

One premium sequence at the top of the page. Everything below it stays plain and fast.

1. **Arrive (once, ≤ 1.2 s).** The hero photo settles into its edge-bleed frame while the fact sheet slides in from the opposite edge. Price and the mirror-lockup community name land last.
2. **Reveal.** Two or three hotspots appear on the hero in reading order, each describing only what is visible.
3. **Room index.** Chips under the hero list the rooms photographed, with counts (Living 1, Kitchen 1, Bedrooms 2, Terraces 3…). Choosing a chip:
   - crossfades the hero to that room's first photo;
   - re-flows the gallery rail to that room's photos (FLIP animation, ≤ 400 ms);
   - marks the related fact in the fact sheet with a crimson marker (Bedrooms → "5 bedrooms").
4. **Then plain.** Below the gallery: facts, floor plan, location, agent, similar homes, all at Editorial intensity with no further motion.

**Data dependency:** photos need room tags. The current listings have none, so the specimen tags them by hand. The `trigon-alaliah-core` media model needs a per-photo room field (Stage 03 content model), filled at upload or by the importer.

## 6. Community emotional layer

Community pages are where Redline becomes cinematic, inside strict limits.

**Story structure (scroll-driven chapters):**
1. **Approach:** a framed photo opens to full bleed as the mirror-lockup name resolves.
2. **Arrive:** a street-level photo with one line about what is visible.
3. **Live:** a courtyard or home detail with one line.
4. **Homes:** the map draws the community's redline boundary and the live listing count; the story hands over to the listing strip.

**Rules**
- **Smooth scroll is scoped.** Lenis runs only inside the immersive story; the rest of the page keeps native scroll. A "Skip the story" link sits at the start.
- **No scroll trap.** At either end of the story, the wheel passes back to the page (tested). Touch uses native scroll throughout.
- **Production build (Stage 04 decision):** the specimen uses a nested scroll panel, which keeps the rest of this page native. In production, prefer a pinned section in normal document scroll (ScrollTrigger pin and scrub) so keyboard, find-in-page and anchors behave normally; Lenis then runs page-wide on Immersive templates only, with the map and listing strip excluded (`data-lenis-prevent`). Both stay within D-011 (one scroll system per page).
- **GSAP ScrollTrigger scrubs** chapter progress; nothing autoplays. Each chapter is fully readable at rest.
- **Copy describes only what the photos show or what the data says.** Unsourced lifestyle claims are not allowed.
- **Photography:** Tier A originals for the Approach chapter in production. The specimen uses current Tier C photos, which shows the structure works and also shows why commissioned photography matters.
- **Reduced motion:** chapters render as a static stacked sequence with no smooth scroll.
- **Performance:** at most four images in the story, lazy-loaded after the first; GSAP and Lenis load only on Immersive templates.

## 7. Three intensity levels

One token set, three settings. A template declares its level, and components read it.

| | **Functional** | **Editorial** | **Immersive** |
|---|---|---|---|
| Used on | Search, filters, forms, account, list-your-property | Property, project, developer, agent, article | Homepage, community, select campaigns |
| Type scale | Ratio 1.2; display ≤ 44 px | Ratio 1.25; display ≤ 112 px | Ratio 1.333 + Statement up to 160 px |
| Width axis | Normal; compressed for figures only | Compressed for titles and figures | Full range: compressed statements, extended labels |
| Section spacing | 32–56 px | 72–112 px | 120–200 px |
| Grid | Regular, symmetric | 7/5 and 8/4 offsets | Free asymmetry, cross-boundary images |
| Imagery | Contained 4:3 only | One edge-bleed hero + contained gallery | Full bleed, cross-boundary, bleed bands |
| Surfaces | Sheet + paper | Sheet + paper, one Inversion max | Sheet + shade alternating |
| Moments | Figure only | One per viewport | Several, with rhythm |
| Crimson | Selection, active filter, primary action | + active anchor and current image | + navigation and the story's redline boundary |
| Motion | CSS only, ≤ 250 ms feedback | + one entry sequence; Flip for gallery | + GSAP ScrollTrigger chapters; Lenis scoped to the story |
| Scroll | Native | Native | Native outside the story; Lenis inside it |
| JS budget (gzip) | ≤ 30 KB | ≤ 60 KB | ≤ 120 KB, loaded only on these templates |

**What never changes across levels:** tokens, the T1 families, crimson-as-signal, the card, the map language, and accessibility (WCAG 2.2 AA at every level).

## 8. Open items carried forward
- **Q1:** final crimson against the logo master (recheck all contrast pairs).
- **Q2:** Tier A photography budget. Immersive pages depend on it.
- **Q3:** coordinates, and per-photo room tags, from the data source.
- **D-006:** map tile source and provider.
- **Type licence:** budget decision (T1 free stand-ins are production-viable).

## 9. On approval
1. Create `alaliah-design-system` from `stage-02-5-redline.md` + this document (D-003).
2. Record the T1 typography and intensity levels as decisions.
3. Begin Stage 03 (information architecture and page structure).
