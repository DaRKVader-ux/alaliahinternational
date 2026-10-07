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
*Measured in Stage 02.5:* the Abu Dhabi listing photos on staging are phone/WhatsApp exports capped at **1,280–1,600 px** wide. They work in cards and galleries and soften as full-bleed heroes. Redline's community and brand moments need originals at **2,400 px or more** (Tier A/B, `stage-02-5-redline.md` §5). The library holds **no Abu Dhabi place or community photography**; the only large place images are Dubai.

§23 rules out relying on developer renders, stock, or Dubai imagery. If commissioned architectural, community and agent photography is not budgeted, a direction built on large photographic moments will fail once real listing photos fill the templates. **Every Stage 02 direction must be shown with average listing photography, not only hero imagery** (brief §64, question 6).

### Q6. Brand crimson versus error red
Resolved in Stage 02 design-system work: brand crimson stays, and a distinct semantic validation/error color is defined, along with an error convention that uses icon + text and never color alone. Check crimson contrast on light and dark surfaces.

---

## Blocking Stage 03.2 (data architecture, search, listings)

**Primary blockers (D-032): Q3 and Q4.** Both answered 2026-10-06; the Stage 03.2 data-model report awaits approval.

### Q3. Property data source: **resolved 2026-10-06**
WordPress is the system of record; there is no external CRM, feed or portal integration (client confirmation, verified on staging: no import plugin, no sync jobs, no external IDs). See [`stage-03-2-data-model-report.md`](./stage-03-2-data-model-report.md) §2. Consequence: the D-004 importer becomes a one-time migration, and the WordPress admin becomes the listing editor. **Still missing from the data:** usable coordinates (none), listing references (none), developer and project links (none).

### Q4. Inventory size: **answered 2026-10-06**
14 published listings: 6 rent, 3 ready sale, 5 off-plan (3 of them Dubai project records), 0 commercial; 11 Abu Dhabi, 3 Dubai. Full breakdown in the Stage 03.2 report §3. Open: whether the business has inventory not yet entered into WordPress; that would change scale, not the model.

### Q5. Differentiation from the portals
Confirmed direction: do not recreate Property Finder or Bayut. Search differentiates through advisory, community knowledge, project context, agents, editorial presentation and curated discovery. **Open part:** which advisory content exists at launch? Community guides, developer profiles and agent bios must be written. A differentiation strategy with no content behind it falls back to a weaker portal.

### Q9. Publishable trust data
*Audit:* the 17 stored "reviews" are **theme demo testimonials** (one author, one mentions "Green Reality"). They were not seen on public pages but must never be published. No genuine testimonials exist in WordPress.

§45 forbids invented metrics. Collect before implementing trust components: brokerage licence / ORN, agent BRN numbers, verifiable transaction figures (if any), testimonials with permission, and formally agreed developer relationships. *D-032:* required verified content for implementation; **not a blocker** for IA or Stage 03 design.

### Q11. Developer ratings and reviews
The Developer page (Stage 03.1 §4) has a ratings module that is shown only with legitimate data: an independent external source, clearly attributed and stored with source, review count and retrieval date (D-032). Freshness follows each source's reliability, not a fixed expiry. Al Aliah never rates developers numerically. **Needed from the client:** whether any such source exists that they consider legitimate, and whether they are comfortable showing third-party scores next to developers they work with. Until then the module is omitted.

---

## WordPress-specific architecture questions

### W1. Interactive layer technology
The capability brief assumed React (shadcn, Motion for React, Vercel React rules). In a custom WordPress theme, the realistic options for search, filters and map are:

- **(a) WordPress Interactivity API:** native, server-rendered first paint, small runtime. Fits the "custom theme" direction best.
- **(b) a React island** for the search app only: richer ecosystem, but extra bundle and hydration cost, plus two component models in one site.
- **(c) vanilla JS / Web Components:** smallest, more hand-built.

This choice decides whether `motion-framer`, `gsap-react`, `vercel-react-best-practices` and the shadcn MCP matter at all. (Motion and GSAP both have framework-free APIs, so motion work is not blocked either way.) **Decide in Stage 03, before any search component is built.**

### W2. Multilingual / RTL implementation
*Audit:* no multilingual plugin is installed on the current site, so there are no existing Arabic URLs to preserve. The choice is open.

Options: WPML (commercial), Polylang, or WordPress multisite per language. The choice affects URL structure (`/ar/…`), `hreflang`, translated CPT and taxonomy slugs, importer behavior (does the feed carry Arabic fields?) and editor workflow. **Deferred to implementation planning (D-032).** It does not block Stage 03: the IA is Arabic-ready by construction (`/ar/` subdirectory, logical CSS, translatable slugs).

### W3. Theme and editor approach
*Foundation resolved by D-026: Option C (fully custom theme).* Still open: the **editor approach** inside it (block theme with custom blocks/patterns vs hybrid with a locked editor), decided in Stage 03.

*Earlier framing (D-022/D-025):* the theme foundation is one of **A** Hello Elementor + Trigon child, **B** Twenty Twenty-Five + Trigon child, **C** fully custom Trigon theme, decided after Stages 02–03. *Preliminary assessment, not a decision:* against the D-025 criteria, **C** scores highest. A keeps the Elementor ecosystem in the critical path. B inherits a core block theme whose templates and styles would be almost entirely overridden, while still exposing the site to changes when the parent updates. A custom theme can still use `theme.json`, block patterns and the block editor, so C does not mean giving up Gutenberg. The editor options below still apply within whichever foundation is chosen.

- **A.** Block theme + custom blocks/patterns
- **B.** Classic/hybrid theme + ACF Blocks (ACF Pro is a paid licence)
- **C.** Hybrid with a tightly locked editor

The criterion is giving editors control over content (text, images, property selections, articles, community copy) without letting them redesign pages. Decide in Stage 03 once page templates are known.

### W4. Search storage and query strategy
Decide after Q3/Q4: taxonomies vs indexed meta vs a custom index table (e.g. a denormalised `wp_alaliah_property_index` with numeric columns for price, beds, area, lat/lng) vs a dedicated search service (needs justification under D-006). Avoid stacked `meta_query` range filters on `postmeta`, which degrade quickly.

### W5. Page transitions in a multi-page site
Stage 04 ideas like "fluid gallery transitions" and "structured page transitions" are harder in server-rendered WordPress. SPA-style routers (Barba.js, Swup) intercept navigation and commonly break plugin scripts, analytics page views, forms and the admin bar. The lower-risk route is the **cross-document View Transitions API** as progressive enhancement. **Stage 02 must not assume seamless app-like transitions between pages.**

### W6. Hosting, environments, ownership
*Answered by audit ([`wordpress-environment-report.md`](./wordpress-environment-report.md)):* production runs WordPress (WPResidence child theme + Elementor). Both sites are on **one shared LiteSpeed host (DirectAdmin layout) in the same hosting account**, with host page cache (`advanced-cache.php`) and Imunify. MariaDB 10.11, PHP 8.2. Still open: whether to stay on shared hosting for the new build (performance for uncached search/REST endpoints), who applies security updates after launch (production shows spam indicators, P2), and the paid-plugin budget.

### W9. Legacy data and URL migration under Option C (raised by D-026)
Two consequences to plan in Stage 03, before any code:
1. **Post-type ownership.** Property, agent and developer data lives in WPResidence's `estate_*` post types and `wpestate` meta, registered by the WpResidence core plugin. `trigon-alaliah-core` must either (a) register its own post types and **migrate** the data, or (b) take over the existing `estate_*` names to keep data and URLs in place. Option (b) collides with the WpResidence core plugin while it is still active. Either way, current URLs (`/properties/…`, `/agents/…`, `/estate_developer/…`) need a redirect or preservation plan, even though production is currently `noindex` (P1).
2. **Legacy pages won't survive a theme switch as-is.** The 14 Elementor-built pages use WpResidence Elementor widgets, Studio templates and theme page templates that rely on the WPResidence theme being active. Switching the active theme to `alaliah-trigon` will break or blank them. Plan: rebuild pages in the new system, and keep them reachable only on staging while the legacy stack is still active.

### W8. Code licence and handover
WordPress themes and plugins that use WordPress APIs are generally distributed under **GPL-2.0-or-later**. Record the licence in the `trigon-alaliah-core` and `alaliah-trigon` headers, and agree with the client what "Trigon Solutions" authorship means for ownership, handover, repository access and support after launch. This is a contract question, not a code one. Decide before the first release.

### W7. Lead data handling
Store leads in WordPress, push them to the CRM only, or both? This needs to respect UAE data-protection obligations (PDPL), spam protection, and attribution data for analytics. Decide before the forms are built.

---

## Environment & access risks (raised 2026-10-06)

### E1. Staging is NOT isolated from production (confirmed 2026-10-06)
Same server, **same hosting account** (`/home/trigonso/domains/` contains both sites), and PHP `open_basedir` covers the whole account. Staging PHP, including every Novamira file and PHP ability, can technically reach production's files. Databases are separated by DB-user privileges. **"Production is read-only" is policy only.** Fix: separate account/system user, or restrict staging's `open_basedir` to its docroot (report R1). Until fixed, D-020 applies.

### E2. Staging hygiene: staging IS a production clone
Results ([`wordpress-environment-report.md`](./wordpress-environment-report.md) §1):
- **Email:** staging attempts real SMTP mail as `@alaliahinternational.com`. All 15 recent attempts failed on SMTP authentication. Fixing the credentials would mail real inboxes. No mail trap. (R4)
- **CRM:** Constant Contact is configured on all 3 forms but no account is connected, so nothing is pushed now.
- **Indexing:** `noindex` via `blog_public=0`, but **no HTTP auth**, so it is publicly reachable. (R6)
- **Environment type** reports `production`. (R5)
- **Copied production data:** Wordfence logins, hits, 2FA secret and passkey; 236 cookie-consent records; production admin accounts. (R7)
- Payments off, PayPal sandbox; no import or sync cron jobs.

Each fix needs approval.

### E3. Backup verification: exists, not verified restorable
Backuply Pro: weekly, rotation 2, **local only** on the same server as both sites. Latest archive 2026-10-01 (made on production, carried into staging). The archives are web-protected (HTTP 403). **No off-site copy, no tested restore**, host-level backups unknown. The D-016 gate is **not met** for major architectural work. Need: off-site copy plus one verified restore (R8).

**Update 2026-10-07:** a fresh Backuply backup made **on staging** (`wp_alaliah.trigonsolutions.co_2026-10-07_05-44-51`) was verified complete, listed for restore and covering database and files ([`stage-03-2-staging-validation.md`](./stage-03-2-staging-validation.md)). Accepted as the Stage 03.2 staging gate (D-036). Still local only (same server); no tested restore.

### E4. Network access: resolved 2026-10-06
Both hosts are now allowed. **Gotcha:** Node's built-in `fetch` ignores `HTTPS_PROXY`, so the Novamira proxy (`@automattic/mcp-wordpress-remote`) needs `NODE_USE_ENV_PROXY=1` in its MCP env, otherwise it still gets "Host not in allowlist". `www.alaliahinternational.com` is still blocked (only needed for diagnosing P2).

### E5. Novamira as an attack surface
An MCP endpoint that can write files and execute PHP on a public host is high-value to attackers. **Need:** strong per-user credentials (not a shared admin password), HTTPS only, ideally an IP or token restriction, disabled when not in use, and never enabled on production without a separate decision.

### E6. Production backups stored in the staging tree (later hosting/security cleanup)
The cloned `wp-content/backuply/backups-Cv3OcR/` on staging still holds three **production** Backuply archives (2026-09-17 ×2, 2026-10-01; about 540 MB each) with full production database copies, including users and personal data. They are behind deny-all (HTTP 403), on the same hosting account as production. **Do not remove during Stage 03.2.** Later task: owner decides keep or delete; deletion is a hosting/security cleanup with its own approval.

### E7. Legacy fingerprint moves with front-end traffic
Any front-end view of a legacy listing or developer page changes legacy post meta: Elementor writes `_elementor_page_assets` on first view, and Essential Addons (`_eael_post_view_count`) and WPResidence (`wpestate_total_views`, `wpestate_detailed_views`) count views. Confirmed 2026-10-07: two public GETs added two `_elementor_page_assets` rows. The in-run check (before/after one run) is unaffected unless a visit lands mid-run, which fails safe. Cross-session comparisons exclude these keys: they are tracked in a separate `volatile_meta` section (D-037).

### E8. Staging emits a UTF-8 BOM
REST and WP-CLI output on staging start with a byte-order mark (seen before `trigon-alaliah-core` was installed; the plugin's files have none). Some PHP file in the legacy stack starts with a BOM. Harmless for browsers; strict JSON clients can fail. Locate before the new theme ships.

---

## Content and data findings (raised by Stage 03.3)

No data or migration scope is expanded for these (D-038). Detail: [`stage-03-3-page-experience.md`](./stage-03-3-page-experience.md) §6.

### C1. Room tags for the room index
The property room index (Redline's optional enhanced gallery) needs a room tag on every gallery image. The 03.2 model stores none. The specimen tagged the 16 photos of 31521 by hand. Without tags, a listing falls back to the standard gallery. **Decide with the visual approval:** if the room index is approved, an attachment-level room field is added to `trigon-alaliah-core` and editors tag photos. If not, nothing changes.

### C2. Licence and permit numbers in free-text descriptions
Legacy descriptions carry a trade licence number and ADM permit numbers inside the text. The specimen does not show them. They should be verified into the permit fields and removed from the description text during editorial review.

### C3. Description voice
Legacy descriptions use boilerplate the brand rejects ("Discover luxury living…", "perfect home"). Listings need an editorial rewrite before launch; the structured titles already replace the slogans.

### C4. Legacy listing anomalies
- Amenity noise: a back yard and a garden on a tower apartment. This reinforces keeping the amenity map unexecuted until reviewed.
- 31571 (Al Raha villa for rent) is linked in WPResidence as a sub-unit of 32101 (a Dubai project). The specimen ignores the link; it is not migrated.
- "West Yas" appears only in description text, so sub-communities are not structured.
- 31023 is typed as an apartment, but its photos show a villa. This is a `possible_wrong_type` candidate, like 30967; an editor must confirm.

### C5. Photo privacy before publication
Listing photos show vehicle number plates (4 of 47 sampled) and one third-party "for sale" sign with a phone number. The specimen copies are pixelated. Production needs a pre-publication photo check in the editorial workflow.

### C6. Off-plan facts that live only in description text
31083 (Reportage Village, Khalifa City) states "Payment Plan 70/30, Handover Q3 2028" in its description, but its handover and payment fields are empty. The v2 specimen shows "Ask us" rather than reading the text. The same pattern holds for furnishing ("Fully furnished" in the titles of 30967 and 31013) and for 30967's size (4,473 sq ft in text, 0 in the field). These need an editor pass into the structured fields before launch.

### C7. Room types the UAE buyer asks about have no fields
Maid's room, driver's room, majlis and study appear only in titles and descriptions (31521, 31495, 31571). They are commercially important in Abu Dhabi. **Proposal for after visual approval:** a small "rooms" multi-select on the property type in `trigon-alaliah-core`. Not built.

### C8. Developer relationships are Dubai-only
Only two developer → project links are verified (Binghatti → Aquarise, Danube → Bayz 102), and both are Dubai. 31083's address names "Reportage Village" and Reportage Properties is in the directory, but the link is unverified (03.2 report item 6). The homepage's "Featured Developers" is therefore Dubai-led on an Abu Dhabi-led brand until Abu Dhabi links are confirmed.

### C9. Madhmoun permits
No verified permit exists for any listing. The only stored value (`madhmoun-permit` 123564) is on a Dubai record (32101), where Madhmoun does not apply. The v2 property page shows a marked placeholder permit block; production shows the block only for a verified, display-approved permit. **Needed:** permit numbers per Abu Dhabi listing, and a rule for Dubai listings (Trakheesi or DLD permit).

### C10. 31571 location conflict
31571 is filed under Al Raha, but its address is "Faya at Bloom Gardens, Al Muntazah". Its townhouse photos are not used as Al Raha place imagery in v2. Editor to confirm the area.

### C11. Reference sites unreachable from cloud sessions
oiaproperties.com and 11tanjung.com are blocked by the environment's egress policy, and so is cdnjs (npm is allowed). The v2 reference study relied on search summaries; the 11 Tanjung intro and facilities behaviour could not be observed. Add these domains to the environment's allowed list, or capture screen recordings, if a closer study is needed.

---

## Production findings (raised by the staging audit; production is read-only)

### P1. The live site is `noindex`
Production's homepage serves `<meta name='robots' content='noindex, follow'>`. If unintentional, Al Aliah is not appearing in Google at all. **The owner must confirm; it is a production change if it needs fixing (R3).** It also matters for the redesign's SEO baseline: there may be little organic equity to preserve.

### P2. Possible SEO-spam compromise on production
Production's `robots.txt` is a static file (modified 2024-04-18) listing query-string sitemaps and `/goods.php?sitemap645.xml` on `www.`. These are not WordPress/SiteSEO sitemaps, and `/goods.php` answers with HTTP 500 on production versus WordPress 404 on staging. Wordfence alerts ("Problems found on alaliahinternational.com", user lockouts) were generated 2026-10-05/06. **These are indicators, not proof.** Owner or host to inspect production files and run a malware scan (R2). Any spam files in production were copied into staging only if they were inside the WordPress install that was cloned.

## Business / content questions

### B1. Dubai presentation vs Abu Dhabi positioning
*Partly answered by D-031 and D-032 (2026-10-06):* Dubai is an active area in the navigation (Areas › Dubai) and may appear where contextually relevant. Abu Dhabi leads **for now**: first in order and the default in search and maps. The inventory is Abu Dhabi-led (11 of 14 listings; 3 Dubai off-plan projects).
**Still open:** the final Abu Dhabi versus Dubai weighting, which Dubai communities and lines (sale, rent, off-plan) are active, and whether the existing "Areas in Dubai" page content is kept or rewritten.

### B2. Demo content on the live site
Theme demo pages are published on production (Zillow Estimate, Stripe, Splash, CRM dashboards) and 17 demo reviews sit in the database. To be removed in the rebuild. Removing them earlier from production is the owner's call (R9).

---

## Resolved

| Former item | Resolution |
|---|---|
| Q7: Framer cannot meet per-listing SEO | Resolved by **D-004** (WordPress-first: every entity has a server-rendered URL). |
| Q8: Natural-language search, parity or differentiation | Resolved by **D-008** (Phase 2, after structured search + chips + autocomplete). |
| Q10: Creating 20 skills up front | Resolved by **D-003** (create a skill only when its rules are decided). |
| E4: Al Aliah hosts blocked by egress | Resolved 2026-10-06 (allowlisted; Node needs `NODE_USE_ENV_PROXY=1`). |
