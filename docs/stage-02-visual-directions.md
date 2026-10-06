# Stage 02: Visual Directions

**Status:** presented 2026-10-06 for selection. Nothing here is approved until recorded in [`decisions.md`](./decisions.md).
**Visual specimens:** [`stage-02/visual-directions.html`](./stage-02/visual-directions.html), published as an artifact. Typefaces in the specimens are stand-ins chosen to show *behavior*, not selections, and colors are indicative. The final crimson depends on the logo master (open-questions Q1).

---

## Ground rules applied to all three directions

1. **The photography reality test.** The staging audit found the current listing imagery is largely WhatsApp exports (`IMG-…-WA…`), and open-questions Q2 (commissioned photography budget) is unresolved. A direction that only works with commissioned architectural photography fails for ordinary inventory (brief §64, question 6). Each direction states how it behaves with average photos.
2. **Crimson has a job.** In every direction, crimson means something specific and is never ambient decoration. It is never the error color (Q6).
3. **The search page is the real test.** Each direction is described from the list + map page outward, not from the hero inward.
4. **Arabic is designed in, not translated later** (brief §43, W2). Each direction names its Arabic behavior.
5. **Known AI-design clusters are tested explicitly.** The `frontend-design` skill lists the looks generated design falls into: cream + serif + terracotta; near-black + a single hot accent; broadsheet hairlines; identical rounded SaaS cards; all-caps eyebrows, monospace labels and middle-dot meta strings. Each direction says which cluster it sits near and how it stays out.

---

# Direction 1: REDLINE

### A. Concept title
**Redline.** The plan view of Abu Dhabi property.

### B. Strategic summary
Make Al Aliah the brand that shows people exactly where they stand: every page reads as a precise, legible plan of a property decision, and crimson marks the thing being decided.

### C. Visual thesis
In architecture and surveying, the **redline** is the boundary drawn around a site: the plot being bought, built on or decided about. Redline turns plan-view logic into the brand system. It uses a measured grid derived from plot subdivision, line work that defines rather than decorates, figures set with technical precision, and maps treated as first-class content rather than a widget.

The system, not the photograph, does the heavy lifting. Images sit in fixed, measured frames, so an average listing photo still looks deliberate. Crimson appears only as the redline: the selected listing, the active filter, the community you are reading about, the pin you chose, the one primary action.

### D. Brand fit
- **Clarity** becomes literal: the brand's visual language is the language of plans, boundaries and measurement.
- **Access:** map-led discovery is native to the aesthetic, not bolted on.
- **Confidence:** precision signals competence without luxury posturing (Guide + Authority archetype).
- **Abu Dhabi is a planned city.** The 1970s grid and the island masterplans (Saadiyat, Yas, Reem, Maryah) are themselves plans, so the visual language is local, not imported.
- The existing logo is already an architectural red mark. Redline extends its logic instead of replacing it (refine, don't reinvent).

### E. Distinction
Competitors (OIA, Phoenix, Thimar, SkyBridge, CSP) use photo carousels over card grids. Portals use dense utilitarian lists with a map widget. In Redline, **the brand and the search interface are made of the same material** (plan, boundary, measurement), so Al Aliah's search pages look like Al Aliah rather than like a portal.

### F. Typography direction
- **Display:** a contemporary grotesk with architectural proportions and a range of widths. Set large with tight leading, in medium weight (neither ultra-bold nor hairline).
- **Body/UI:** the same family at text sizes. One family keeps the system disciplined.
- **Figures:** tabular, lining numerals *from the same family* for prices, areas and dates. No monospace data labels (an AI-design tell).
- **Casing:** sentence case throughout. No tracked all-caps eyebrows. Labels are short and plain.
- **Rhythm:** strict baseline grid. Type sizes step on a fixed scale tied to grid units.
- **Arabic:** a geometric, Kufi-influenced Arabic sans with matching stroke logic and weight range.
- **Feel:** sharp, measured, architectural, technical without being cold.

### G. Color strategy
- **Ground:** a cool drawing-sheet white (slight grey-blue bias). Explicitly **not cream or beige**.
- **Inks:** three to four graphite values for text, line work and dividers.
- **Crimson:** the redline. Selection, focus, current location, active filter, community boundaries on maps, and the single primary action per view. Target under 5% of any screen. A very pale crimson *site tint* fills selected areas on maps and the selected row.
- **Dark surfaces:** used only where they carry meaning (a dark map mode, the footer as a "title block"). Not a dark theme.
- **Hierarchy:** carried by ink weight and line weight. Color is reserved for state.
- **Cliché avoided:** no gold, no beige, no gradient washes. Red is semantic, not promotional.

### H. Image and art direction
- **Architecture:** elevations and facades shot straight-on, plus top-down aerials of islands, coast and masterplans. Plan view is the natural photographic match.
- **Property:** fixed aspect-ratio crops; photo paired with floor plan wherever one exists. Developer renders labelled as renders.
- **Average photos survive:** consistent frames, neutral grading and a data strip mean a WhatsApp listing photo reads as "documented", not "cheap".
- **People:** agents photographed in real settings (documentary, not studio glamour), credited by name.
- **Maps:** custom-styled, monochrome land and water, crimson boundaries. The map is a branded surface, not vendor default.
- **Never:** Dubai skyline, yachts, generic CGI towers.

### I. Layout character
- **Openness:** open but structured, with dense where data lives and open where narrative lives.
- **Grid:** a 12-column grid with visible logic. Occasional dimension lines and grid ticks act as *wayfinding* (they measure something real) and never as ornament.
- **Composition:** asymmetric, anchored to the grid.
- **Module logic:** every module carries a **title block**, after the corner panel on an architectural drawing: what it is, where, and when it was last updated, using real metadata (community, listing count, update date).
- **Hero:** a plan or aerial image, one statement, and search. Not a full-bleed lifestyle video.
- **Sections:** separated by measured space and rules, not alternating background colors.

### J. UI system character
- **Feel:** crisp, productized, data-led, quietly elegant.
- **Cards:** "sheets", meaning a framed image plus a data strip with tabular figures. Square corners or a 2px radius. Shadow only for lifted states.
- **Filters:** a measured control bar. Active filters render as crimson-outlined chips. Range controls show their scale.
- **Navigation:** compact, with the current section underlined by the redline.
- **Content modules:** title-blocked. Stats appear only when the number is real and sourced.

### K. Motion character
- **How it feels:** precise and line-led. Lines draw, boundaries trace, maps zoom from city to community to plot.
- **Restrained on:** search, filters and forms. Fast, functional feedback only (150–250 ms).
- **Impact on:** community intros (a boundary draws around the island) and the plan-to-photo transition into a property.
- **Scroll:** native scroll on search and property pages. Smooth scroll is possible on area and insight pages only.
- **Cinematic movement:** supports a cinematic *zoom* language (plan → site → unit) rather than parallax.

### L. Card behavior
- **Redline trace:** on hover/focus, a crimson boundary traces the card perimeter (about 250 ms) and the card is "selected".
- **Image-to-data:** the photo slides aside to reveal the floor-plan thumbnail and key specs.
- **Map sync:** hovering a card draws its plot boundary on the map, and selecting a pin traces the matching card.
- **Active-state morph:** a selected card gains crimson corner registration marks, which persist across the list.
- **Reduced motion:** a static crimson outline, with no trace animation.

### M. Inner-page system potential
| Page | How Redline scales |
|---|---|
| Homepage | The city as a plan: communities as bounded areas, search as the first tool |
| Properties archive | List + map is the native form. Strongest of the three directions here |
| Property detail | A "drawing sheet": gallery and floor plan side by side, a title block (reference, community, size, last updated), the agent as the named author |
| Areas / communities | Boundary map, real data panels, lifestyle photography in measured frames |
| Developers | A register: projects plotted on a map, active Al Aliah inventory |
| Insights / single post | Technical-editorial long form with figures, diagrams and sourced charts |
| Agents | Register entries with a communities-covered map and languages |
| List your property | A stepped survey: genuinely sequential, so numbered steps are honest |
| About / contact | Office location plan, licence details in a title block |
| Empty / loading / success states | Unmapped area, drawing in progress, and site confirmed. One shared vocabulary |

### N. Risks
- **Cold or clinical,** reading like an engineering consultancy rather than a property advisor.
- **Fake technicality:** meaningless dimension lines or invented coordinates would be decoration pretending to be data (truthfulness rule).
- **Broadsheet cluster:** hairline-heavy layouts drift toward the generic newspaper look, and thin lines can fail contrast.
- **Premium-development pages** may feel under-romanced.
- **Map dependence:** needs a well-styled map provider and coordinate data that may not exist (Q3).

### O. Why this is not AI-slop
The system comes from a real instrument in the subject's world (the site plan and its redline) and from the existing logo. Crimson has a semantic job. There is no cream, no serif italics, no monospace labels and no all-caps eyebrows. Its closest cluster, broadsheet hairlines, is avoided because line weights vary by meaning and modules are title-blocked, not newspaper-columned.

---

# Direction 2: HARD LIGHT

### A. Concept title
**Hard Light.** Abu Dhabi as light and shade.

### B. Strategic summary
Make Al Aliah feel unmistakably Abu Dhabi by building the visual world from the city's light: blinding midday, sharp shade, long blue evenings. Architecture photography carries the brand.

### C. Visual thesis
Abu Dhabi's defining visual condition is light. Midday is overexposed, shadows have razor edges, and shade structures (colonnades, screens, palm canopies) make life possible. Long evenings turn blue. Hard Light alternates **glare surfaces** (high-key, bright) and **shade surfaces** (deep, cool, saturated darks). Pages move like a walk from shade into sun.

Crimson behaves as a **solid material catching light**: thick, matte planes at structural moments (the open navigation panel, a section shell, the enquiry panel). It is never a thin accent line.

### D. Brand fit
- **Abu Dhabi ownership:** the strongest sense of place of the three, rooted in climate and architecture rather than landmarks.
- **Confidence and ambition:** a cinematic, premium presence that suits premium developments and international buyers.
- **Weaker on clarity:** atmosphere comes first and data second, so it pulls against the advisory archetype unless the utility layer is very disciplined.

### E. Distinction
Competitors use bright, flat, carousel-driven layouts. Hard Light is atmospheric and directional. Its danger is that the high-end real-estate market is full of cinematic, dark, photo-led sites. Its distinction depends entirely on *specific light*, not generic darkness.

### F. Typography direction
- **Display:** a heavy, compact grotesk with strong presence at very large sizes, set big over or beside imagery. Scale contrast is the drama.
- **Body/UI:** a neutral, highly legible sans. Quiet, so the display can be loud.
- **Weights:** extremes. Heavy display, regular body, with little in between.
- **Casing:** sentence case. Display headlines are short.
- **Rhythm:** large leaps between display and body. Generous spacing around display, tight within data.
- **Arabic:** a strong, contemporary Arabic display weight that can hold the same presence.
- **Feel:** bold, sculptural, confident, cinematic.

### G. Color strategy
- **Glare:** a bleached neutral white for high-key sections. Neutral, explicitly not cream.
- **Shade:** a deep, cool slate-teal family (the color of shadow on limestone at dusk). **Not near-black**, which avoids the "near-black + one hot accent" cluster.
- **Crimson:** a deeper, lacquer-like crimson used as solid planes at a few structural moments. Never as small accents scattered everywhere.
- **Mid-tones:** concrete and limestone greys from real materials.
- **Hierarchy:** carried by tonal blocks (glare versus shade), with crimson as the "you are here" plane.
- **Cliché avoided:** no gold and no black-and-gold. But tonal darkness plus red is close to the generic "night luxury" look, which demands discipline.

### H. Image and art direction
- **Requires commissioned photography:** architecture at hard noon with deep shadows, communities at golden and blue hour, time of day as a system.
- **Listings:** neutral daylight grading. These cannot carry the brand on their own, so in practice the brand lives in commissioned imagery and listings sit in a quieter utility layer.
- **People:** agents photographed in real light and shade.
- **Maps:** dark shade-toned base with crimson highlights.
- **Average-photo test: fails.** WhatsApp listing photos next to cinematic brand imagery look worse by comparison, not better.

### I. Layout character
- **Rhythm:** cinematic, with full-bleed image sections alternating with tight content bands.
- **Composition:** asymmetric overlaps of type on image and image on shade plate.
- **Hero:** a large image-led opener with one heavy line of display type.
- **Sections:** shells shift tone (glare to shade) to mark changes of subject.
- **Density:** open on brand pages, and it needs a separate dense "daylight utility" layout for search, which creates a two-mode system.

### J. UI system character
- **Feel:** layered, immersive, bold.
- **Cards:** image-led, with data on a solid shade plate (not a gradient scrim).
- **Filters:** a floating solid panel in shade tone.
- **Navigation:** minimal over imagery, opening into a crimson panel.
- **Content modules:** large, few per page.

### K. Motion character
- **How it feels:** slow and cinematic. Shade edges sweep across images, layers drift (controlled parallax), and images reveal through a moving shadow line.
- **Restrained on:** search results and forms. A strict boundary between cinematic and utility pages is mandatory.
- **Impact on:** homepage, area and project pages.
- **Scroll:** the direction that most wants smooth scrolling, and therefore the one most at risk of over-applying it.

### L. Card behavior
- **Light sweep:** on hover, a hard shade edge passes across the image (about 600 ms).
- **Content uncovering:** the shade plate slides up to reveal price, beds and area.
- **Layered media shift:** foreground and background move at different rates. This needs depth-separated imagery and is costly to produce well.
- **Reduced motion:** the plate is shown expanded, with no sweep.

### M. Inner-page system potential
| Page | How Hard Light scales |
|---|---|
| Homepage, areas, projects, about | Excellent: the direction was born here |
| Insights / single post | Good for features; ordinary articles need a quieter template |
| Properties archive, list + map | Weak: must switch to a utility mode, and the brand thins out exactly where users spend most time |
| Property detail | Strong if photography is strong, poor with average photos |
| Developers, agents | Workable with commissioned portraits and imagery |
| List your property, contact | Needs the utility mode; risk of feeling like a different site |
| Empty / loading / success states | Atmospheric states work, but must not slow functional pages |

### N. Risks
- **Photography dependency:** without commissioned imagery the direction collapses, and the brief already rules out relying on renders or stock.
- **Generic drift:** dark, cinematic, red-accented real-estate sites are common. One lapse and it reads as everyone else.
- **Two-mode inconsistency** between the brand and utility layers.
- **Performance:** heavy media, video temptation, parallax.
- **Contrast:** text over imagery, and crimson on dark shade, need careful checking.

### O. Why this is not AI-slop
It is rooted in a measurable local condition (light) rather than luxury signifiers: no gold, no marble, no beige. Shade is a colored tone, not tinted black, and crimson is a solid architectural plane rather than a neon pop. **Of the three, it sits closest to generic clusters** (near-black + accent; cinematic luxury). That is said plainly here so it can be judged on that basis.

---

# Direction 3: RUBRIC

### A. Concept title
**Rubric.** The reference work for UAE property, in two scripts.

### B. Strategic summary
Make Al Aliah the clearest voice in UAE property by building an editorial, typographic system in Arabic and English, where crimson marks what matters, as rubrication did in manuscripts.

### C. Visual thesis
**Rubrication**, writing headings, section openings and key words in red ink, is shared by Arabic and Latin manuscript traditions. It existed for navigation and emphasis: clarity. Rubric treats the website as an expertly edited reference work on Abu Dhabi and UAE property. Typography is the primary visual material. **Arabic and Latin are set as equals from day one:** community names, section names and key terms appear in both scripts on a bidirectional grid. Crimson is the ink of navigation: section markers, the current position, key figures. Photographs are captioned plates that inform (where, when, what).

### D. Brand fit
- **Knowledge pillar:** strongest of the three. The site *is* the advisor's reference shelf: indexes, registers, a glossary (freehold zones, off-plan terms, handover, service charges).
- **Access:** indexes and A–Z registers make discovery browsable, not only searchable.
- **Abu Dhabi identity** comes through language, not landmarks.
- **Arabic/RTL readiness** is built into the concept rather than added later.
- **Weaker on visual desire:** property is presented with authority more than glamour.

### E. Distinction
No identified competitor treats Arabic and English as a co-equal design system. Most UAE sites are English with an afterthought translation toggle. Rubric is the only direction whose differentiation **cannot be copied with a stock template**, because it rests on content and typesetting quality.

### F. Typography direction
- **Families:** a bilingual pairing *designed together* (a Latin family with a true Arabic companion), so both scripts share weight, colour and optical size.
- **Display:** large typographic headings, with both scripts at matched optical size. **No italic accent words** (an AI-design tell) and no decorative serif theatrics.
- **Body/UI:** a highly legible text face, comfortable measure (about 65 characters), generous leading for long reading.
- **Figures:** lining and tabular figures in data. Price and area figures are typeset, not just output.
- **Casing:** sentence case. Section markers are short rubric words, not tracked capitals.
- **Feel:** editorial, cultured, authoritative, calm.

### G. Color strategy
- **Ground:** a clean paper white with a neutral bias. **Not cream**, which keeps it out of the "cream + serif + terracotta" cluster.
- **Ink:** a true neutral ink for text, plus one mid-grey for secondary text.
- **Crimson:** rubric ink. Section markers, the current navigation position, key figures, the active index entry. Never fills, never banners.
- **Dark mode:** ink-on-dark like a well-made e-reader, with crimson lightened for contrast.
- **Hierarchy:** carried almost entirely by typography. Color marks navigation.
- **Cliché avoided:** no gold, no warm parchment, no terracotta.

### H. Image and art direction
- **Photographs as plates:** consistent formats, each with an informative caption (community, what is shown, date).
- **Average-photo test: passes** reasonably well. Captioning and consistent formatting give ordinary images context and dignity, though the direction is less image-led overall.
- **Maps:** index maps with numbered or lettered keys tied to the A–Z register.
- **People:** agents as authors, with bylines on insights and named advice on listings.
- **Diagrams:** explanatory illustration (payment-plan timelines, ownership zones) drawn in the same ink-and-rubric system.

### I. Layout character
- **Grid:** column-based editorial grid with **bidirectional mirroring**. Every layout is designed to flip for RTL.
- **Structure:** strong indexes, tables of contents and marginal notes. Margins carry real sources and side facts.
- **Hero:** a typographic statement in both scripts, plus search.
- **Density:** comfortable reading density, with dense, scannable index pages.
- **Sections:** marked by rubric headings, not boxes or colored bands.

### J. UI system character
- **Feel:** editorial-productized, calm, precise.
- **Cards:** "entries" with title, place in two scripts, figures and a small plate image.
- **Filters:** presented as an index (communities A–Z, types, price bands), with active entries in rubric.
- **Navigation:** a table-of-contents logic, with the current section marked in rubric.
- **Tabs and accordions:** section markers and footnote-like expansions.

### K. Motion character
- **How it feels:** typographic and calm. Lines of text reveal in reading order, the rubric marker slides to the active section, and entries expand in place.
- **Restrained:** almost everywhere. Little parallax, no cinematic sweeps.
- **Impact on:** the moment a place name resolves between scripts (English to Arabic) on area pages. Used once per page, not as a loop.
- **Scroll:** native scroll is natural. Smooth scroll adds little to this direction.

### L. Card behavior
- **Content uncovering:** an index entry expands in place to show specs and a larger plate.
- **Active-state morph:** the rubric marker moves to the hovered or selected entry.
- **Controlled stagger:** index lists settle in reading order (RTL-aware) on first load only.
- **Image reveal:** the plate image fades up on hover over a typographic entry.
- **Reduced motion:** entries expand instantly; markers jump without sliding.

### M. Inner-page system potential
| Page | How Rubric scales |
|---|---|
| Insights / single post, guides | Excellent: the direction's home ground |
| Areas / communities, developers | Excellent: register and index formats with bilingual names |
| About, agents, contact | Strong: bylines, credentials, plainly stated facts |
| Properties archive | Good as an index list; the map is secondary and less integrated than in Redline |
| Property detail | Strong on information hierarchy, weaker on visual desire for premium units |
| Homepage | Distinctive but quieter: depends on writing quality |
| List your property | Strong: a clear, sequential, bilingual form |
| Empty / loading / success states | Typographic states, very consistent |

### N. Risks
- **Arabic commitment now:** this only works with real, quality Arabic content. Place names alone become tokenism. It forces the multilingual decision (W2) early and adds translation cost and maintenance.
- **Publication, not platform:** it can read as a magazine rather than a property tool.
- **Lower visual desire** for premium developments and international buyers who expect imagery.
- **Typeface licensing:** quality bilingual families can be expensive.
- **Broadsheet and serif clusters:** editorial typesetting drifts toward generic newspaper or "cream serif" looks unless handled with discipline.

### O. Why this is not AI-slop
It rests on a historical device that literally means "red marks what matters" in both of the site's scripts. It requires real writing and real Arabic typesetting, which templates cannot fake. No italic accent words, no cream, no terracotta.

---

## Comparative evaluation

| Criterion | Redline | Hard Light | Rubric |
|---|---|---|---|
| **Distinctiveness** | High. Brand and search share one visual material; no local competitor does this | Medium. Distinct only through *specific* Abu Dhabi light; the cinematic-luxury genre is crowded | Very high. Bilingual co-equal typography is unique in the market |
| **Fit for Al Aliah** | Very high. Clarity, precision, advisory; extends the architectural red logo | Medium-high. Strong place and ambition, weaker clarity and advisory voice | High. Knowledge and Guide archetype; weaker on visual desire |
| **Motion potential** | High and purposeful: trace, draw, zoom (plan to site to unit) | Very high, cinematic, and the most at risk of motion as decoration | Moderate: typographic, calm, low risk |
| **Scalability to inner pages** | Very high. Built from the search page outward | Low-medium. Splits into brand and utility modes | High for content pages, medium for listings |
| **Usability for a real-estate platform** | Very high. Map-native, data-led, list + map is its natural form | Medium. Utility pages need a separate disciplined layer | High. Indexes and clear hierarchy; map less central |
| **Premium perception** | Medium-high. Premium through precision; needs strong photography on premium pages | Very high *with* commissioned photography; low without | Medium-high. Premium through authority and craft |
| **Risk of becoming generic** | Low-medium (broadsheet-hairline drift) | **High** (dark cinematic luxury drift) | Low-medium (newspaper or serif drift) |
| **WordPress implementation realism** | High. Custom theme + SVG line work; needs a styled map library | Medium. Heavy media pipeline, art direction per image, two layout modes | Medium. Needs the multilingual stack and bilingual fonts early, plus editorial discipline |
| **SEO / content friendliness** | High. Structured data pages (areas, developers, properties) map cleanly to templates | Medium. Image-heavy pages risk thin content and slow loads | Very high. Long-form, indexed, bilingual content is an SEO asset |
| **Long-term brand value** | High. A recognizable system that survives inventory changes and the Dubai/Abu Dhabi question (B1) | Medium. Value tied to a photography budget being sustained | High. Compounding content asset, but only if the writing is maintained |
| **Average listing-photo test** | **Passes.** The system frames ordinary photos | **Fails.** Ordinary photos look worse next to cinematic brand imagery | **Mostly passes.** Captions and plates give context |

## Recommendation

- **Strongest overall: Redline.** It is the only direction where brand expression and the property-discovery product use the same visual language. It scales from the list + map page outward, survives the current photography reality, and extends the existing architectural red mark instead of replacing it.
- **Safest: two answers, because "safe" means two things.**
  - **Lowest delivery and usability risk: Redline.**
  - **Least likely to surprise stakeholders: Hard Light.** It is safe in the wrong way: it is the closest of the three to what the market already does, and the one most dependent on a photography budget nobody has confirmed (Q2).
- **Boldest: Rubric.** Its boldness is strategic, not decorative: committing to Arabic and English as equals from launch and to editorial authority as the brand. That is bold because it requires sustained content investment, not because it looks loud.
- **Best balance of brand, product and award-level potential: Redline, with two specific borrowings and no more:**
  1. **From Rubric: bilingual place naming.** Community and section names set in both scripts as part of the type system. This makes RTL real from day one without committing to full bilingual content at launch.
  2. **From Hard Light: a time-of-day photography brief** for community pages only, to give area storytelling warmth where Redline is weakest.

  Anything beyond these two borrowings dilutes the system into a blend that says nothing. Each borrowing must use Redline's rules (grid, title block, crimson-as-selection).

### What stays open whatever the choice
- **Final crimson** requires the logo master and current brand red (Q1).
- **Photography budget** (Q2) changes how far any direction's imagery can go; Hard Light depends on it entirely.
- **Dubai vs Abu Dhabi positioning** (B1) affects imagery and naming in every direction.
- **Error color** is defined separately from crimson in the chosen direction's design system (Q6).

### Next step after selection
1. Record the choice in `decisions.md`.
2. Run Stage 02b, a design-system study for the chosen direction: type candidates tested in Latin and Arabic, crimson studies against the real logo red, grid and title-block rules, and a component vocabulary sampled on the three hardest surfaces (search results, property detail, community page).
3. On approval of 02b, create the `alaliah-design-system` skill (D-003).
