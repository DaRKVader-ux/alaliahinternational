---
name: alaliah-design-system
description: Al Aliah "Redline" design system (principles, composition, intensity levels, type roles and the name-fit rule, colour tokens and crimson budget, photography tiers, the Site select card, map cartography, Room index, community story). Load before designing or building any page, template, component, map or visual asset, and before judging whether UI work matches the approved system.
---

# Al Aliah design system: Redline

**Status:** Stage 02 approved (D-027 to D-030). Sources, in priority order: `docs/decisions.md` → `docs/stage-02-5c-final-refinement.md` → `docs/stage-02-5b-refinement.md` → `docs/stage-02-5-redline.md`. Specimens: `docs/stage-02-5/redline.html`, `docs/stage-02-5b/system.html`, `docs/stage-02-5c/final.html`.
Brand equity and voice belong to `alaliah-brand-system`, accessibility to `alaliah-accessibility`, and final motion numbers to `alaliah-motion` (Stage 04). This skill owns tokens, composition and components. If a generic design skill disagrees, this skill wins (D-010).

**Provisional items:** the type families (T5, until a Stage 05 licence decision), the crimson value (Q1, logo master) and the motion durations (Stage 04).

## Idea
Architectural *intelligence*, not architectural documentation. Precision comes from composition, anchored information and a map-led sense of place. There are no drafting lines, ticks, coordinates or CAD styling.

## Five principles
1. **Frame.** The grid governs, and images break it only by the placement rules.
2. **Anchor.** Information sits where it is true: on the photo, the map or the card. Anchors describe only what is visible or recorded.
3. **Reveal.** Motion uncovers information. Nothing moves to look busy.
4. **Sync.** List, map and imagery act as one system.
5. **Signal.** Crimson means selected, focused, here, or do this. If removing a crimson element loses no information, it should not be crimson.

## Intensity levels (one system, three settings)
A template declares its level; components read it.

| | Functional | Editorial | Immersive |
|---|---|---|---|
| Templates | Search, filters, forms, account, list-your-property | Property, project, developer, agent, article | Homepage, community, select campaigns |
| Type scale | Ratio 1.2; display ≤ 44 px | Ratio 1.25; display ≤ 112 px | Ratio 1.333; statements up to 160 px |
| Section spacing | 32–56 px | 72–112 px | 120–200 px |
| Grid | Regular, symmetric | 7/5 and 8/4 offsets | Free asymmetry, cross-boundary images |
| Imagery | Contained 4:3 | One edge-bleed hero, contained gallery | Full bleed, cross-boundary, bleed bands |
| Surfaces | Sheet + paper | Sheet + paper, at most one shade Inversion | Sheet and shade alternating |
| Moments | Figure only | One per viewport, two quiet modules between | Several, with rhythm |
| Crimson | Selection, active filter, primary action | + active anchor, current image | + navigation, the story's redline |
| Motion | CSS only, ≤ 250 ms feedback | + one entry sequence, Flip in gallery | + ScrollTrigger chapters |
| Scroll | Native | Native | Native outside the story |
| JS budget (gzip) | ≤ 30 KB | ≤ 60 KB | ≤ 120 KB, these templates only |

Never changes across levels: tokens, type families, crimson-as-signal, the card, the map language, WCAG 2.2 AA.

**Moments** (rationed): Statement (display at 4–8× body, over low-detail image areas only), Bleed band (Tier A/B photos only, never Functional), Inversion (a shade section), Offset (asymmetric split, alternating sides, mirrored in RTL), Figure (one real, sourced number at display size).

## Composition
- 12 columns, gutter 16–32 px, max content width 1320 px. Text measure ≤ ~68 characters.
- **Image placements:** contained (cards 4:3, gallery 3:2), edge bleed (one edge, mirrored in RTL), full bleed (Immersive only, Tier A/B), cross-boundary (community pages).
- **Overlap:** a data sheet may overlap an image by up to a third of its height, never across faces, signage or the photo's subject. Text sits on solid surfaces only: **no gradient scrims**. At most one overlap per viewport.
- **Depth order:** ground → image → data sheet → anchor → focus. One soft shadow, only on a data sheet over imagery.

## Type (T5, working system; production licence decided in Stage 05)
| Role | Face | Use |
|---|---|---|
| Display | Sofia Sans Extra Condensed 700–800, line-height 0.86–0.9 | Places, figures, titles. "Compressed means place or figure" |
| Text / UI | Sofia Sans 400–600, body 17 px / 1.55, UI 15 px | Reading, controls |
| Label | Sofia Sans 13 px, 500, +0.03em, sentence case | Metadata. Never tracked all-caps |
| Arabic display | Reem Kufi 700, ≥ 28 px only | Names in the mirror lockup |
| Arabic text | Noto Kufi Arabic | All Arabic text below 28 px |

- **Figure-first:** large compressed number, small unit (`420,000 AED per year`). Tabular lining figures everywhere.
- **Mirror lockup:** English name start-aligned and Arabic end-aligned on one baseline row; for community and section names only.
- **Name-fit rule:**
  1. Bind "Al", "Bin", "Abu" and "Bani" to the next word.
  2. A display name may take two balanced lines, never three.
  3. Names of 19 characters or more step down one size, and no further.
  4. Arabic sits on the last Latin baseline at 0.42 of the Latin size. Arabic names over 14 characters take their own line, end-aligned.

  Compute the classes server-side.
- **Fallback:** T4 (Mona Sans, 75–125 width axis) if extended labels are needed. Do not use Anybody (T1) or the 02.5 Archivo stand-in.
- Self-host fonts from the theme (all OFL); no Google Fonts requests in production.

## Colour tokens (crimson final value pending Q1; recheck all pairs if it changes)
| Token | Value | Role | Contrast |
|---|---|---|---|
| `sheet` | #F2F4F4 | Ground (cool, never cream) | |
| `paper` | #FFFFFF | Cards, data sheets | |
| `ink` | #14191E | Primary text | 16.0 on sheet |
| `ink-2` | #4A545C | Secondary text | 7.0 on sheet |
| `ink-3` | #5F6A72 | Tertiary text, control borders | ≥ 4.5 on sheet and paper |
| `line` | #CDD3D7 | Dividers only, never control borders | 1.4 |
| `crimson` | #B0122C | Signal on light | 6.4 on sheet |
| `crimson-tint` | #F6E0E4 | Selected fill | crimson text 5.6 |
| `shade` | #0F1E25 | Inversion, Immersive | |
| `on-shade` | #E8EEEF | Text on shade | 14.5 |
| `crimson-on-shade` | #F0566E | Signal on shade (brand crimson fails at 2.4) | 5.1 |
| `error` | #9A4A00 | Validation, with icon and text; never crimson | 6.3 on paper |
| `success` | #2B6A4A | Confirmation | 6.4 on paper |

**Crimson budget:** about 1–3% of a light viewport, and at most one crimson *fill* per view: the page's contextual primary action. Selection uses outlines and tints. The global header Contact CTA is a solid **ink** button, never crimson (D-032).

## Photography tiers
| Tier | Source | Allowed |
|---|---|---|
| A | Commissioned place photography (time-of-day briefs) | Everything, including full bleed |
| B | Professional listing photos ≥ 2400 px, corrected verticals | Edge-bleed hero, gallery, cards |
| C | Agent and phone photos (most current listings, 1280–1600 px) | Contained only; never full bleed above a 1280 px viewport |
| D | Developer renders | Contained, always labelled "Developer render" |

Neutral daylight grading, with no filters.

## Site select card (listing card)
- **Anatomy:**
  - photo (4:3);
  - purpose label;
  - **price plate** (figure-first, on paper, anchored across the photo's bottom edge);
  - title (the link to the listing);
  - **site strip** (a band of the Redline map: community outline, plot marker, mirror-lockup name);
  - figure-first facts;
  - secondary line;
  - **Shortlist** toggle (`aria-pressed`, square glyph).
- **Hover / focus-within:**
  - the photo frame tightens 10 px;
  - the redline draws around the community in the strip *and* on the main map together (one duration, one easing);
  - the map callout shows;
  - the secondary line appears.

  No tilt, no 3D, no image zoom, no crimson card outline.
- **Shortlisted:**
  - a crimson plot-marker square on the photo;
  - the redline kept at a lower tint;
  - the plot marker turns crimson in the strip and on the map;
  - the secondary line reads "On your shortlist";
  - the tray updates.
- **Data rules:**
  - price per sq ft only for sales, and only when price and area both exist;
  - "Area not listed", never 0;
  - titles are structured from data, never sales slogans.
- Reverse sync: hovering a map community or cluster marks its cards.

## Map cartography
- **Layer order:** water → coastal shelf (two bands) → land with hairline coast → open space (neutral, no green) → building fabric (community zoom and closer) → roads (motorway, arterial, minor at street zoom; white with casing) → dashed community outlines → the redline (crimson 2.25 px + tint, drawn on) → listings → labels (halo in the surface colour).
- **Labels:**
  - community: display face, `ink`;
  - district: label face, `ink-3`;
  - water: label face, #3E5C66.

  All are ≥ 4.5:1. Show Arabic names from community zoom.
- **Symbols:** constant screen size at every zoom.
  - Clusters: ink discs in 3 sizes, crimson when active.
  - Plot: an ink square. Active plot: crimson with a price tag. Shortlisted plot: crimson outline.
- **Zooms:**
  - city: communities and clusters;
  - community: redline, plots, fabric, Arabic;
  - street: all price tags.
- Never vendor default styling. Production: MapLibre with a custom style; tile source per D-006.
- Plot-level pins need real coordinates (Q3). Until then, community level only. The importer rejects `0,0` and non-UAE coordinates.
- Native scroll on maps; never smooth-scroll inside a map.

## Property detail: Room index (optional enhanced-gallery mode)
- Used only when every photo carries a room tag. Otherwise the standard gallery is used.
- Sequence:
  1. Arrive once (≤ 1.2 s).
  2. Up to three hotspots describing only what is visible.
  3. Room chips with counts. A chip crossfades the hero, Flip-filters the rail (≤ 400 ms) and marks the related fact.
- Everything below the hero is plain Editorial.
- Reduced motion shows the final state.

## Community story (Immersive)
- **Chapters:** Approach, Arrive, Live, Homes. The last one draws the community redline and the live listing count, then hands over to the listing strip.
- **Scroll:** smooth scroll only inside the story, with a "Skip the story" link, and no scroll trap (the wheel returns to the page at both ends).
- **Production build:** prefer a ScrollTrigger-pinned section in normal document scroll (Stage 04 decision).
- **Pacing:** ScrollTrigger scrub; nothing autoplays; every chapter is readable at rest.
- **Images:** at most four, lazy after the first; Tier A for Approach.
- **Copy:** describes only what the photos show or the data says.
- **Reduced motion:** a static stacked sequence.

## Motion vocabulary (durations provisional until Stage 04)
| Verb | Use | Duration |
|---|---|---|
| Settle | Hero image into frame | 900–1200 ms, once |
| Reveal | Anchors and data in reading order | 400–600 ms |
| Anchor | Hotspot expands to its fact | 200–250 ms |
| Sync | Card, map and callout respond together | 150–200 ms; the redline draws in 420 ms |
| Focus | Crimson state | 150 ms |

Never: scroll-jacking on Functional or Editorial pages, looping ambient motion, motion on every card, or parallax on Tier C photos. Smallest tool first (D-011): CSS, then Motion, then GSAP.

## Bilingual and RTL
- English and Arabic names appear together as composition, not as a translation line. Arabic names are verified, never machine-translated.
- Mirror everything in RTL: bleed sides, overlap sides, anchor label sides, offsets. Use logical CSS properties only.
- Digits: Western in English; the Arabic interface decision is in Stage 03 (W2).

## Anti-patterns
- Decorative red lines, ticks, coordinates, blueprint or CAD styling.
- More than one crimson fill per view, crimson backgrounds, crimson for errors.
- Gradient scrims over photos.
- Full-bleed Tier C photos.
- Anchors or copy describing things not visible or not sourced; invented distances, times or statistics.
- Gold, navy or beige luxury palettes; cream grounds; editorial serifs; monospace data labels.
- Generic card hover tricks: tilt, 3D, image zoom.
- One card style for every content block.

## Before calling design work done
- Level declared; moments within that level's ration.
- Crimson audit: every crimson element carries meaning, with at most one fill.
- Name-fit rule applied to every display name; Arabic present where the mirror lockup applies.
- Image tier fits its placement.
- Then run `alaliah-accessibility` and `alaliah-visual-regression`.
