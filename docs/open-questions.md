# Open Questions & Risks

These are weak points and unresolved dependencies in the [master brief](./00-master-brief.md) that will cause rework if nobody resolves them. They are ordered by how much downstream work each one blocks. Architecture context: **WordPress-first** (decision D-004).

When an item is resolved, record the answer in [`decisions.md`](./decisions.md) and move it to *Resolved* below.

---

## Needed during Stage 02 (not blocking exploration)

### Q1. Original brand assets
Stage 02 exploration can start from the known identity (red architectural mark, uppercase wordmark). **Production** palette and logo refinement need the originals:

- the vector logo (AI/SVG/PDF) and every lockup in current use
- the current red as a specified value (Pantone / CMYK / HEX)
- any existing brand guidelines, the current website URL and social accounts

Until then, every color value in Stage 02 is **approximate and labeled as such**.

### Q2. Photography reality and budget
§23 rules out relying on developer renders, stock, or Dubai imagery. If commissioned architectural, community and agent photography is not budgeted, a direction built on large photographic moments will fail once real listing photos fill the templates. **Every Stage 02 direction must be shown with average listing photography, not only hero imagery** (brief §64, question 6).

### Q6. Brand crimson versus error red
Resolved in Stage 02 design-system work: brand crimson stays, and a distinct semantic validation/error color is defined, along with an error convention that uses icon + text and never color alone. Check crimson contrast on light and dark surfaces.

---

## Blocking Stage 03 (IA, search, listings)

### Q3. Property data source: the largest unknown
Required before the content model, search UX or importer can be designed:

- CRM name, API availability, or XML/JSON/CSV feed format, plus a **sample export**
- whether the CRM also syndicates to Property Finder / Bayut (which system is the record?)
- persistent listing IDs, statuses, agent IDs, image URLs
- **coordinate quality:** per-unit lat/lng, or only community/building level? This decides whether list + map is real or decorative.
- **tag completeness** for sea view, waterfront, balcony, payment plan, handover year. A filter backed by sparse data produces false zero-result states.
- update frequency (sets the importer schedule and cache strategy)

### Q4. Inventory size
Needed to size search depth and decide query architecture (Q-W4):

- total active listings, split into Buy, Rent, Commercial and Off-plan
- distribution by community
- historical/archived listing count (affects SEO for expired listing URLs)

### Q5. Differentiation from the portals
Confirmed direction: do not recreate Property Finder or Bayut. Search differentiates through advisory, community knowledge, project context, agents, editorial presentation and curated discovery. **Open part:** which advisory content exists at launch? Community guides, developer profiles and agent bios must be written. A differentiation strategy with no content behind it falls back to a weaker portal.

### Q9. Publishable trust data
§45 forbids invented metrics. Collect before designing trust components: brokerage licence / ORN, agent BRN numbers, verifiable transaction figures (if any), testimonials with permission, and formally agreed developer relationships.

---

## WordPress-specific architecture questions

### W1. Interactive layer technology
The capability brief assumed React (shadcn, Motion for React, Vercel React rules). In a custom WordPress theme, the realistic options for search, filters and map are:

- **(a) WordPress Interactivity API:** native, server-rendered first paint, small runtime. Fits the "custom theme" direction best.
- **(b) a React island** for the search app only: richer ecosystem, but extra bundle and hydration cost, plus two component models in one site.
- **(c) vanilla JS / Web Components:** smallest, more hand-built.

This choice decides whether `motion-framer`, `gsap-react`, `vercel-react-best-practices` and the shadcn MCP matter at all. (Motion and GSAP both have framework-free APIs, so motion work is not blocked either way.) **Decide in Stage 03, before any search component is built.**

### W2. Multilingual / RTL implementation
Options: WPML (commercial), Polylang, or WordPress multisite per language. The choice affects URL structure (`/ar/…`), `hreflang`, translated CPT and taxonomy slugs, importer behavior (does the feed carry Arabic fields?) and editor workflow. **Decide before Stage 03 IA is finalised**, even if Arabic launches later.

### W3. Theme and editor approach
- **A.** Block theme + custom blocks/patterns
- **B.** Classic/hybrid theme + ACF Blocks (ACF Pro is a paid licence)
- **C.** Hybrid with a tightly locked editor

The criterion is giving editors control over content (text, images, property selections, articles, community copy) without letting them redesign pages. Decide in Stage 03 once page templates are known.

### W4. Search storage and query strategy
Decide after Q3/Q4: taxonomies vs indexed meta vs a custom index table (e.g. a denormalised `wp_alaliah_property_index` with numeric columns for price, beds, area, lat/lng) vs a dedicated search service (needs justification under D-006). Avoid stacked `meta_query` range filters on `postmeta`, which degrade quickly.

### W5. Page transitions in a multi-page site
Stage 04 ideas like "fluid gallery transitions" and "structured page transitions" are harder in server-rendered WordPress. SPA-style routers (Barba.js, Swup) intercept navigation and commonly break plugin scripts, analytics page views, forms and the admin bar. The lower-risk route is the **cross-document View Transitions API** as progressive enhancement. **Stage 02 must not assume seamless app-like transitions between pages.**

### W6. Hosting, environments, ownership
Managed WordPress host or self-managed? Staging environment? Full-page caching vs uncached search/REST endpoints? Who applies core and plugin security updates after launch, and what is the paid-plugin budget (WPML, ACF Pro, forms, SEO)? **Also unknown: is the current Al Aliah site already WordPress?** It could not be checked from this environment because the host is blocked by egress policy.

### W7. Lead data handling
Store leads in WordPress, push them to the CRM only, or both? This needs to respect UAE data-protection obligations (PDPL), spam protection, and attribution data for analytics. Decide before the forms are built.

---

## Resolved

| Former item | Resolution |
|---|---|
| Q7: Framer cannot meet per-listing SEO | Resolved by **D-004** (WordPress-first: every entity has a server-rendered URL). |
| Q8: Natural-language search, parity or differentiation | Resolved by **D-008** (Phase 2, after structured search + chips + autocomplete). |
| Q10: Creating 20 skills up front | Resolved by **D-003** (create a skill only when its rules are decided). |
