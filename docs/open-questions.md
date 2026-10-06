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
*First pass:* the staging audit (D-016) will show whether listings already exist in WordPress and which plugin or importer creates them. That does not replace asking the client which CRM is the system of record.

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
*Partly answered (D-014):* production `alaliahinternational.com`, staging `alaliah.trigonsolutions.co`, WordPress as CMS. Still open: host type (managed vs cPanel/self-managed), full-page caching vs uncached search/REST endpoints, who applies core and plugin security updates after launch, and the paid-plugin budget (WPML, ACF Pro, forms, SEO). Whether production itself runs WordPress today will be confirmed by the staging audit if staging is a clone, or by a read-only check of production once egress allows it.

### W7. Lead data handling
Store leads in WordPress, push them to the CRM only, or both? This needs to respect UAE data-protection obligations (PDPL), spam protection, and attribution data for analytics. Decide before the forms are built.

---

## Environment & access risks (raised 2026-10-06)

### E1. Staging and production appear to share a host
Both hostnames resolve to **216.158.227.108**. If they are on the same server, and especially the same hosting account or system user, then Novamira's file and PHP-execution abilities on staging may technically reach production files or databases. "Production is read-only" would then be a policy only, not a technical boundary. **Need from the host or developer:** are staging and production separate system users with separate databases and DB users? Can Novamira's file access be confined to the staging document root? Until confirmed, `alaliah-environments` treats staging actions as potentially production-reaching.

### E2. Staging hygiene (if staging is a production clone)
A clone carries real personal data (users, leads, form entries) and live integrations. Risks: test submissions reaching the real CRM, emails sent to real clients or agents, scheduled imports writing to external systems, search engines indexing a duplicate site (SEO damage to production). The first audit checks these (`alaliah-environments` → Staging hygiene). Fixing any of them needs approval.

### E3. Backup verification
Not verifiable from here. Novamira may not expose backup tooling, and host-level backups (cPanel/JetBackup, managed-host snapshots) are outside WordPress. **Need:** the backup mechanism, retention, and a confirmed restore point for staging before major architectural work (D-016).

### E4. Network access from cloud sessions
The cloud environment's egress policy currently **denies both `alaliah.trigonsolutions.co` and `alaliahinternational.com`** (HTTP 403 at the proxy). Without them:
- Novamira cannot be reached, if its MCP endpoint is served from the staging domain (likely)
- browser QA against staging (D-019) is impossible
- read-only comparison with production is impossible

**Action (user):** add both domains to the environment's allowed domains.

### E5. Novamira as an attack surface
An MCP endpoint that can write files and execute PHP on a public host is high-value to attackers. **Need:** strong per-user credentials (not a shared admin password), HTTPS only, ideally an IP or token restriction, disabled when not in use, and never enabled on production without a separate decision.

---

## Resolved

| Former item | Resolution |
|---|---|
| Q7: Framer cannot meet per-listing SEO | Resolved by **D-004** (WordPress-first: every entity has a server-rendered URL). |
| Q8: Natural-language search, parity or differentiation | Resolved by **D-008** (Phase 2, after structured search + chips + autocomplete). |
| Q10: Creating 20 skills up front | Resolved by **D-003** (create a skill only when its rules are decided). |
