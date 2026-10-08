# Stage 03.3 v2: Reference study (11 Tanjung, OIA Properties)

**Date:** 2026-10-08. **Method:** direct inspection of both live sites in Chromium at 1440 × 900 and 390 × 844. I read the computed CSS, loaded scripts, DOM structure and network requests, and took frame-by-frame screenshots of load, scroll and hover. Both sites load some scripts from CDNs that this container's network policy blocks (jsdelivr, cdnjs, unpkg). I served those files locally from npm at the exact versions each site requests, so the pages ran as a visitor sees them. No source code was copied into Al Aliah's files; this document records behaviour and structure only.

## 1. 11 Tanjung (https://11tanjung.com/)

**Stack, observed:**
- A custom WordPress theme ("kosong") with its own animation modules: Animatable, bezier, useFrame, lerp, follow-scroll-relative.
- **Lenis 1.1.8 smooth scroll site-wide** (the root element carries the `lenis` class). A 400 px wheel input eases over about 700 ms: 38 → 157 → 237 → 291 … → 396 px.
- The "pawe" preloader (0.1.x), Embla carousel 8.1.6, and a WebGL "image lens zoom" shader.
- **No GSAP.** All choreography is CSS transitions driven by a scroll-progress custom property (`--follow-scroll-relative-progress-y`) plus intersection flags.
- **Sound exists:** a looping birdsong MP3 in the nav, paused and muted by default, behind a "Sound: off" toggle with an animated waveform.
- Easing token: `--ease-in-out: cubic-bezier(0.5, 0, 0, 1)`; transitions also use an `--ease-out` curve.

### `.home.intro`: first load and scroll (4-motion rule)

The section is 200 lvh tall (135 lvh under 768 px), with its content `position: sticky; top: 0`.

| Phase | Hide | Reveal | React | Move |
|---|---|---|---|---|
| 1. Loader (≈2–10 s, network-bound) | n/a | A dark rounded plate with a percent counter (left) and "by Imperio" (right) | The counter rises 1 → 21 → 67 → 100 % | n/a |
| 2. Loaded (`data-pawe=idle`) | n/a | The logotype rises into the plate: translate 25 % → 0 and opacity, 0.5 s | n/a | n/a |
| 3. Loader exit (1.5 s, ease-in-out) | The plate collapses by `clip-path`: full → a 1 px horizontal line at 60 % of the time → a point at 100 % | The hero image, already behind it | n/a | The giant logotype stays centred over the image |
| 4. At rest | n/a | Corner overlays: location (top-left), phone and email (top-right), description (bottom-right), "Scroll to explore", "Sound: off". Each reveals word by word: `clip-path inset(0 0 100%)` + `translateY(100%)` → 0, 1000 ms per word, 50 ms stagger | Social buttons (right edge) | n/a |
| 5. Scroll, progress 0.5 → 0.55 | The giant logotype shrinks (scale 1 → 0.9), rises, then flies into the nav "notch" (0.75 s ease-in-out) | The nav notch with the small logo | n/a | Logo translate and scale |
| 6. Scroll, progress > 0.55 | n/a | Headline "A New / Standard / of Living": each part rises from translateY 100 % with blur 0.25 em → 0 and opacity, scale 0.6 → 1; staggered 0 / 0.1 / 0.2 s, 0.75 s ease-out | n/a | The headline drifts with scroll |
| 7. Progress > 0.8 | The headline fades out | The next section (`.home.explanation`), a coloured panel with a large rounded top edge, slides up **over** the pinned hero | n/a | The sticky hero stays put while the page covers it |

The hero image is **two layers**: a background and a cut-out foreground (trees and building). The logotype sits between them, so architecture occludes type: depth without 3D.

### `.home.facilities`

- **Structure:** five cards in a flex row, padded 1.25 em, each about one viewport tall, rounded, with full-bleed imagery (a slight parallax scale of 120 %).
- **Entrance (intersection):** each card starts 25 lvw to the right, with blur 16 px and opacity 0. They settle in order with a 0.1 s stagger per card, 1 s ease-out (measured: card 1 at 0.59 opacity / 237 px / blur 10.5 px while card 4 is still at 360 px). The heading reveals with the same word clip as the hero.
- **At rest:** all cards are **equal width**, captions hidden (blurred 16 px, offset 0.5 em, opacity 0).
- **Hover / focus / focus-within:** the active card's `flex-basis` goes 1.5 em → 33 %, so the others compress (measured 638 px vs 193 px). A bottom gradient fades in, and the caption un-blurs and rises (0.5 s ease-in-out). On leave the caption hides faster (0.3 s ease-in).
- **Mobile (< 1024 px):** the row becomes a vertical stack of five equal cards within one viewport (358 × 162 each). Tap does **not** expand a card, and captions stay hidden.

**Rest of the page:**
- explanation;
- three ring "circles" chapters;
- three full-screen "burst" chapters with the WebGL lens-zoom on images;
- unit types (Embla carousel) with floor-plan lightboxes;
- facilities;
- location ("where");
- footer.

Each section is a coloured rounded panel that slides over the previous one. The palette is warm bronze and cream, with an italic high-contrast serif display.

## 2. OIA Properties (https://www.oiaproperties.com/en)

**Stack, observed:**
- jQuery, **GSAP 3.12.2 + ScrollTrigger (12 triggers on the homepage)**, and four Swiper carousels (hero deals with fade autoplay; areas, autoplay; projects; hotspots, autoplay);
- select2, flatpickr, intl-tel-input, toastr, sweetalert and FingerprintJS;
- **no smooth scroll**.

### Header and mega menus
- **Header:** transparent over the hero, white on inner pages. Items: Sale, Rent, Projects, Developers, Areas, More; "Choose City" (Dubai, Abu Dhabi, Ras El Hekma – Egypt); an outlined "List Your Property" button; a language switch.
- **Mega menus:** a floating white panel, not full width, opening on hover. A link column on the left; one **featured image card with an orange "View …" button** on the right.
  - **Sale / Rent:** property types (Apartment, Villa, Townhouse, Residential Plots); two latest listings by title; a featured listing card.
  - **Projects:** 13 property types (their icons fail to load and show as "#"); "Latest Projects" (3); a featured project card.
  - **Developers:** grouped **Dubai** (6) and **Abu Dhabi** (6); a featured developer card.
  - **Areas:** grouped **Dubai** (6), **Abu Dhabi** (6) and **North Coast (Egypt)** (1); a featured area card ("View Area").

### Homepage section order
1. **Hero:**
   - full-bleed **rotating photo slideshow**, about 2.5 s per image: resort, Sheikh Zayed Mosque, Downtown Dubai, Dubai Frame;
   - the headline "Your Next Move, Invested ___" with a **rotating last word** (Smartly / Wisely / Confidently …);
   - **For Sale / For Rent / Projects** tabs;
   - one search bar: free text "City, Area, Community", Beds, Property Type, an orange Search button;
   - live totals: "967 listings | 374 Projects | 31 Areas".
2. **Explore Listings in UAE:** Sale / Rent / Projects tabs, a three-card carousel, "View More".
3. **Featured Projects in UAE:** a full-width fade carousel, one large image at a time, with the project name, an arrow and chips (type, size range, location).
4. **Featured Areas in UAE:** five equal vertical image strips, name at the top. Hover darkens the strip and shows "More Details ⊕". No counts or prices.
5. **Featured Developers:** an autoplaying logo strip.
6. **Premium Luxury Collections:** a 4 × 3 grid of tall project images, each with the project name and the **developer logo** over a dark gradient. It mixes UAE and Egypt.
7. **Featured Investment Hotspots:** a carousel of tall area images with names, a progress bar and arrows. No data on the tiles.
8. **Blogs:** one featured article plus two.
9. **"Need guidance? Request a call back!":** name, email, phone, Send (site-wide pre-footer).
10. **Footer:**
    - Key Areas **with listing counts** (Yas Island 176 …);
    - Key Developers;
    - Get Started;
    - social links.

### Card anatomy (listing)
- **Photo:** an in-card photo carousel (arrows on hover, dots), a "Sale" tag, a photo count and a heart.
- **Text:** price; a slogan-style title ("… | Call Now!"); location.
- **Facts:** type | beds | baths | sq ft.
- **Actions:** a full-width row of **Email · Call · WhatsApp** buttons.

### Listing, project, area, developer and property pages
- **Listings (`/properties/sale`):**
  - sticky search bar (text, Property Type, Price, Beds, Size, Filters, Search);
  - Grid toggle, **Any / Ready / Off Plan** segment and sort;
  - horizontal cards (image left);
  - right sidebar: a "Sell Or Rent Your Property" CTA, **paid developer banners**, and SEO link lists ("1 bedroom properties for sale …").
  - **No map.**
- **Project (Fahid Beach House):**
  - full-bleed hero: name, "By Aldar Properties", "From Price 1,800,000 AED | Apartments | Studio–3 BR", **Register Interest**;
  - description beside a dark "Register Your Interest" form;
  - **four fact boxes** (Developer, Payment plan 65/35, Handover 2029, Bedrooms);
  - gallery (Exterior / Interiors tabs, mosaic with "+3");
  - floor plans (tabs by unit type, carousel);
  - **payment plan tiles** (10 % on booking, 55 % during construction, 35 % on handover);
  - an amenities icon grid (29 items, unprioritised);
  - a gated brochure download;
  - an SEO essay with a form;
  - location;
  - FAQ.
  - About 10,400 px long.
- **Area (Yas Island):**
  - split hero (a dark text panel with "Find Projects", image right);
  - description beside an image carousel;
  - "Top Attractions" cards (photo, name, one line);
  - **Related Projects with type tabs** (cards with "From price", status badge, developer logo, "Register Interest" and "View More").
  - No listing count and no map.
- **Developer (Aldar):**
  - split hero: an orange "About Developer" block, **Projects 84**, **Price From 805,000 AED**, "Find Projects";
  - "Why choose …" (four numbered claims);
  - featured developments grid with "Discover Project".
- **Property:**
  - mosaic gallery (1 large + 2, "+8");
  - price, type / beds / baths / sq ft, title, address;
  - description with "Read More";
  - a details table;
  - an amenities icon grid;
  - a **mortgage calculator** (tabs UAE national / UAE resident / Non-resident; price, down payment, rate, term → monthly payment);
  - related properties.
  - **Sticky right card:** Call (orange) and WhatsApp (green) at the top, the agent's photo and name, then a "Free Consultations" form.

### Mobile
- Hero search reduced to one field.
- A **fixed bottom tab bar**: Home, Projects, Search, Properties, Menu.
- The menu is a full-screen accordion (Buy, Rent, Projects, Developers, Areas, More, each with "+") plus "List Your Property".
- Carousels become swipe rows. A cookie banner covers about a fifth of the screen until dismissed.

### Conversion paths observed
- Contact on every listing card (Email / Call / WhatsApp).
- "Register Interest" and forms on project pages (two per page).
- A call-back band on every page.
- Owner capture ("List Your Property" in the header, "Sell or Rent" in the listing sidebar).
- A gated brochure.
- A sticky agent card on property pages.

### Weak points observed
- Slogan titles on listings.
- Broken icons in the Projects menu.
- Egypt content inside "UAE" sections.
- Paid banners in search.
- No map anywhere.
- Area pages without counts or prices.
- A 29-icon amenity grid with no hierarchy.
- A rotating headline word.
- Very long project pages.
- A heavy cookie bar on mobile.

## 3. Comparison with v2 (`docs/stage-03-3-v2/`, artifact 5gQPenmL…)

| Area | v2 before this revision | Where v2 was weaker |
|---|---|---|
| Homepage impact | Real photo hero; a three-panel intro, then headline and search | The intro was a generic panel wipe with no loader logic, no word-level type choreography and no layering. Nothing carried the hero into the next section; it simply scrolled away |
| Motion choreography | GSAP fades (y + opacity) on headings and cards | One generic reveal everywhere. 11 Tanjung's word clip reveal and staged blur-to-sharp entrances make type feel built, not faded |
| Area storytelling | Panels with one area pre-expanded; mobile swipe deck | No entrance choreography, and captions were not tied to the active state. The pinned area story was solid |
| Navigation | Six items plus WhatsApp and Contact | No owner path ("List your property"). Mobile had no persistent navigation: once the hamburger scrolled away, so did WhatsApp |
| Mega menus | Counts, featured card with hover swap | No "latest" listings by name, no CTA button on the featured card, and the Developers menu showed only verified projects |
| Property discovery | Cards with photo count only | No in-card photo browsing (OIA lets you see several photos without leaving the grid). No Ready / Off-plan quick switch in search. No owner CTA or popular-search links among results |
| Card conversion | WhatsApp and Call | Comparable. OIA adds Email; ours keeps two larger buttons, which is better on mobile |
| Off-Plan | Comparison rail with payment bars | No single large, image-led project moment (OIA's Featured Projects band). The rail alone reads as a list |
| Developers | Two project cards plus a logo wall | No "projects with us" or "price from" on the wall; no Abu Dhabi / Dubai grouping (not possible: staging has no developer city field) |
| Property detail | All structured facts, off-plan essentials, permit block | No mortgage estimate for ready sales (OIA has one). The sticky card had no inline form, so every enquiry needed a dialog |
| Visual richness | Image-led but static between sections | Sections butt against each other. 11 Tanjung's "next panel slides over the pinned hero" gives depth at almost no cost |
| User guidance | Strong: counts, empty states, investment goals | Ahead of OIA. Missing: a site-wide call-back band and footer counts per area |

## 4. What the revision adopts, and what it deliberately leaves out

**Adopted (as logic, re-expressed in Al Aliah's identity):**
- **Loader, from 11 Tanjung's plate:**
  - a white plate with the Al Aliah mark and a load counter;
  - it exits along a single crimson horizontal line, the redline;
  - the plate opens outward from that line to reveal the photo. This is the opposite direction to 11 Tanjung's collapse, and it carries our own signal.
- **Word clip reveal** for the hero headline and section headings: a word-by-word clip-path rise, staggered.
- **Blur-to-sharp settle** for the hero search, area panels and facilities.
- **Sticky hero with the next section sliding over it.** Square edge, no rounded panel.
- **Facilities logic for Areas.**
  - Equal entrance from the right with blur, staggered.
  - The active panel takes about a third, and its caption un-blurs and rises.
  - One panel stays open at rest, unlike 11 Tanjung, so information shows without hover and on touch.
  - Mobile keeps the swipe deck. 11 Tanjung's vertical stack hides captions, which fails a property site.
- **Mobile bottom navigation, from OIA.** Search · Off-Plan · Shortlist · WhatsApp · Menu, on home, search and area pages; the property page keeps its own contact bar.
- **"Latest" listings** by name in the Buy and Rent mega menus.
- **Featured-card CTA buttons** in every mega menu.
- **"List your property"** owner path in the header and menus.
- **In-card photo browsing** on property cards (previous/next buttons and position dots, swipe on touch).
- **Ready / Off-plan segment** in the search bar.
- **An owner CTA card and popular-search links** among search results.
- **Featured off-plan band:** one large project image with its numbers and a CTA, before the comparison rail.
- **Mortgage estimate** on ready sale listings. Residency tabs; the rate is the visitor's own input; marked indicative.
- **Inline call-back form** in the property enquiry card.
- **Site-wide call-back band** and footer area counts.

**Deliberately not copied:**
- 11 Tanjung's **ambient sound**: an accessibility and focus cost with no benefit on a brokerage site.
- **Site-wide smooth scroll**: Lenis stays on the Area story only (brief).
- The **rounded-panel** visual language and italic serif.
- The **WebGL lens zoom**: performance cost, and it would distort Tier C photos.
- **Scroll-gated content**: the search never waits for scroll.
- **Two-layer cut-out depth**: our listing photos have no foreground plates, and fake cut-outs would be invented imagery.
- OIA's navy/orange look and **rotating hero slideshow and rotating word**: motion without information, and one image at a time is better for the hero's credited, linked property.
- **Slogan titles**, the **unprioritised icon grid**, **paid banners in search**, **Egypt inside UAE sections**, **gated brochure walls**, the duplicate forms on project pages, and **Email** as a third card button (two large buttons convert better on mobile).
- **Developer grouping by city**: staging has no developer city, and assigning one would be invented data.
