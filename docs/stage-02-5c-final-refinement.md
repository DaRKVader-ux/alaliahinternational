# Stage 02.5c: Redline Final Refinement

**Status:** completed 2026-10-06. Closes Stage 02. Refines [`stage-02-5b-refinement.md`](./stage-02-5b-refinement.md) in three areas only; where they differ, this document wins.
**Specimen:** [`stage-02-5c/final.html`](./stage-02-5c/final.html), published as an artifact (https://claude.ai/artifact/6jPsJw6YpQ1xdZWjnZxRPr, private until shared). It uses Al Aliah listing photos and staging data (6 Oct 2026). The map geometry is stylised.
**Approved before this pass (D-029):** the three intensity levels, the Site select interaction model with a separate Shortlist, the Room index as an optional enhanced-gallery mode, the community-story rules, and the overall map direction. T1 was not approved as the production type system.

---

## 1. Typography: long names

### Test
Ten real Abu Dhabi names, from "Al Raha" (7 characters) to "Saadiyat Cultural District" (26), were set in three display systems. They were tested at three real slots (Immersive statement, Editorial heading, Functional card and map label) and in a same-width ladder.

| | T1 · Anybody 58 | T4 · Mona Sans 75 | T5 · Sofia Sans Extra Condensed |
|---|---|---|---|
| Average width of the ten names at 100 px | 460 px | 541 px | 465 px |
| "Mohammed Bin Zayed City" at 100 px | 751 px | 909 px | 778 px |
| Ladder result (same slot, same rule) | 10 of 10 in one line (2 stepped down) | 8 of 10 in one line; "Saadiyat Island" and "Madinat Al Riyad" break | 10 of 10 in one line (2 stepped down) |
| Character at length | Quirky compressed forms; dense over four words | Civic, bold, wider; least compressed | Plain, sturdy, compressed; reads calmly at length |
| Width range | One axis, 50 to 150 | One axis, 75 to 125 | Separate families: Extra Condensed to normal; **no extended** |
| Text face | Anybody 100, not calm at body size | Mona Sans 100 | Sofia Sans |

**Finding:** compression was never T1's problem. T1 and T5 are almost the same width. What fails in T1 is character: the compressed letterforms get mannered over long names, and the normal width is not a calm reading face.

### Recommendation: T5, Sofia Sans, as the working type system (provisional)
- **Display:** Sofia Sans Extra Condensed, weight 700 to 800, for places, figures and titles.
- **Text and UI:** Sofia Sans, weight 400 to 600.
- **Labels:** Sofia Sans at 13 px, weight 500, letter-spacing 0.03em, in sentence case. This is the one cost against T1: there is no extended width, so labels are separated by size, weight and colour instead of width.
- **Arabic:** unchanged. Reem Kufi for display (≥ 28 px) and Noto Kufi Arabic for text.
- **Fallback:** T4 (Mona Sans) if extended labels prove more important than compression.
- **Not final for production.** A licensed grotesk with a true compressed width (Stage 05, budget) can replace T5 without changing any role.

### The name-fit rule (applies whatever the face)
1. **Bind particles.** "Al", "Bin", "Abu" and "Bani" never end a line ("Madinat / Al Riyad"). Server-side: a filter replaces the following space with a no-break space.
2. **Balance two lines.** A display name may take two balanced lines at full size (`text-wrap: balance`). Never three.
3. **Step down once.** Names of 19 characters or more drop one scale step, and no further.
4. **Arabic rides the last line.** The Arabic name sits on the final Latin baseline, end-aligned, at 0.42 of the Latin size. Arabic names over 14 characters take their own line below, still end-aligned.

Rules 1 and 3 are length classes computed server-side, so there is no JavaScript and no layout shift.

## 2. Property card: Site select, refined

The 02.5b card behaved correctly but looked like a polished generic listing card, with an image on top and data below. The refinement makes the card carry Redline's own devices.

| Part | What it is | Why it is Al Aliah |
|---|---|---|
| **Price plate** | Figure-first price on a paper plate anchored across the photo's bottom edge | Redline's *Anchor* principle applied to the most important fact |
| **Site strip** | A full-width band of the Redline map inside the card: community outline, plot marker, mirror-lockup name (English start, Arabic end) | Every card shows *where*, in the map's own language, not a text label |
| **The redline** | Hover or focus draws one crimson boundary around the community, in the strip and on the main map at the same time (420 ms, same easing) | Crimson marks the *place*, never the card edge. The 02.5b crimson card outline is removed |
| **Frame** | On hover or focus the photo's frame tightens by 10 px, showing paper around it | A framing gesture instead of the generic zoom |
| **Plot marker** | Shortlisting uses the map's symbol: a crimson square on the photo, on the Shortlist button and on the map | One symbol for "kept" across card, button and map |
| **Facts** | Figure-first: compressed numbers, small units ("5 bedrooms") | Same typographic device as prices and the map |

**Kept from 02.5b (approved):** the title link opens the listing; Shortlist is a separate toggle (`aria-pressed`); map sync both ways (card to map, and map community or cluster to cards); the shortlist tray; price per sq ft for sales only; "Area not listed" instead of 0.
**States:** rest (dashed outline in the strip), hover or focus (redline drawn, frame tightens, secondary line shows), shortlisted (redline stays at lower tint, crimson plot marker on photo and strip, "On your shortlist"), reduced motion (state changes without transitions).

## 3. Map art direction: a Redline cartography

### Layer order (bottom to top)
| Layer | Token | Treatment |
|---|---|---|
| Water | `m-water` #D6E3E7 | Flat pale slate |
| Coastal shelf | `m-shelf-2` #CEDDE1, `m-shelf` #C7D7DC | Two depth bands that follow every coast |
| Land | `m-land` #F2F4F4, coast `m-coast` #AEBBC1 | Sheet with a hairline coast |
| Open space | `m-open` #E6EBEA | Neutral tint, **no green** |
| Building fabric | `m-fabric` #DCE2E4 | From community zoom only |
| Roads | `m-road` #FFF on `m-road-casing` #C5CED2 | Motorway (4.5 px cased), arterial (2 px cased), minor (1 px, street zoom only) |
| Communities | `ink-3` dashed hairline | Tint on hover |
| The redline | `crimson` 2.25 px + `crimson-tint` | Active community, drawn on; kept at lower tint when it holds a shortlisted home |
| Listings | Clusters and plots | Constant screen size at every zoom |
| Labels | See below | Always on top, with a 3 px halo in the surface colour |

### Label hierarchy
| Level | Example | Setting | Colour | Contrast |
|---|---|---|---|---|
| Community | Al Raha (+ Arabic from community zoom) | Display face, 15 px | `ink` | 16.0 on land |
| District | Abu Dhabi Island | Label face, 11.5 px | `ink-3` | 5.0 on land |
| Water | Arabian Gulf | Label face, 13 px | `m-water-label` #3E5C66 | 5.6 on water |

**Fix carried from 02.5b:** its context labels used #7E8A91 at 3.2:1, which fails the 4.5:1 text minimum. The district level now uses `ink-3`.

### Symbols (constant size, authored in screen pixels)
Clusters are ink discs in three sizes (1, 2 to 5, 6 or more) and turn crimson when active. A plot is an ink square. An active plot is a crimson square with a figure-first price tag. A shortlisted plot is a crimson outline. An active community gets the drawn redline.

### Zooms
- **City:** communities with clusters.
- **Community:** the redline, plots, building fabric and Arabic names.
- **Street:** price tags on every plot, plus minor roads.

### Production translation (Stage 05)
The layers map one to one onto a MapLibre style: fill layers for water, land, open space and fabric; line layers for the shelf (coast line, wide blurred stroke), roads (casing + fill) and communities; symbol layers for labels and listings, with the redline as a feature-state line layer. The tile source is decision D-006 (Stage 03). Plot-level pins still need coordinates (Q3).

## 4. Verification
- **Rendering:** 1440 and 390 px with no console errors and no horizontal overflow. Ladder measurements are read from the rendered page.
- **Accessibility:** axe (WCAG 2.2 AA tags) reports 0 violations at 390 and 1440 px.
- **Fixed during the pass:**
  - Redline draw-on: non-scaling strokes broke `pathLength` dashes. The stroke now scales by the zoom factor instead.
  - Arabic names over 14 characters were squeezing the Latin column, so they drop to their own line.
  - The map's root role was `img` while it contained focusable plots; it is now `group`.

## 5. Next
- Create `alaliah-design-system` from 02.5, 02.5b and this document (done with this pass).
- Begin Stage 03 with information architecture.
