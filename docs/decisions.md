# Decision Log

This file records approved decisions and any overrides of the [master brief](./00-master-brief.md). Later entries take precedence over the brief where they conflict.

Format: `D-NNN · date · area` then the decision and its rationale.

---

## Stage status

| Stage | Status |
|---|---|
| 01 Brand understanding | **Complete** |
| Capability / infrastructure setup | **Mostly complete.** Skills, QA, local WP, 21st and Novamira are verified, and the staging audit is done ([`wordpress-environment-report.md`](./wordpress-environment-report.md)). Open: staging isolation (E1), restorable backup (E3), staging hygiene fixes (E2). These block major WordPress work, not Stage 02 |
| 02 Visual world / aesthetic direction | **Direction selected: Redline** (D-027). Stage 02.5 correction and design-system study presented 2026-10-06 ([`stage-02-5-redline.md`](./stage-02-5-redline.md)); awaiting approval. `alaliah-design-system` is created on approval |
| 03 Website experience | Locked until Stage 02 is approved |
| 04 Motion & interaction | Locked until Stage 03 is approved |
| 05 Implementation | Locked until Stage 04 is approved. No production theme or plugin is built before then; architecture is set by D-021 – D-025 |

---

## Decisions

**D-001 · 2026-10-06 · Brand**
The master brief (`docs/00-master-brief.md`) is adopted as the primary strategic context.

**D-002 · 2026-10-06 · Process**
Stages are gated. Work on a later stage (typography, final colors, layouts, components, motion, page transitions) is not finalized before the earlier stage is approved. Exploration is allowed; anything exploratory must be labeled as such.

**D-003 · 2026-10-06 · Process**
Project skills (`.claude/skills/alaliah-*`) are created only when the rules they hold have been decided. A skill must never contain placeholder rules. The registry is in `CLAUDE.md`.

**D-004 · 2026-10-06 · Architecture: WORDPRESS-FIRST**
WordPress is the primary CMS, backend and intended production platform. Production is a **custom WordPress theme**, server-rendered so every property, project, community, developer and agent has its own indexable URL. Content is modelled as Custom Post Types + taxonomies + structured fields (candidate CPTs: `property`, `project`, `community`, `developer`, `agent`, `insight`). Interactive features (search, filters, map, autocomplete, load-more, forms) use WordPress REST/AJAX endpoints. Custom database tables are allowed where query performance justifies them. WordPress is the platform; that does not mean all data must live in `postmeta`.
- Not assumed: page builders (Elementor/Divi/WPBakery), headless WordPress, WPGraphQL. Each needs a stated benefit before adoption.
- Inventory comes from the existing CRM/feed through an **idempotent importer** keyed on a persistent source ID (create / update / unpublish / images / agent, community, project and taxonomy mapping). Listings are never matched by title.
- The visual direction (Stage 02) must not be constrained by WordPress implementation habits. Stage 03 converts the approved experience into WordPress systems.
- *Rationale:* native per-URL SEO, editorial control and no duplicated CMS. This resolves the Framer/SEO conflict (former open-questions Q7).

**D-005 · 2026-10-06 · Architecture**
Framer is not the production platform. It may be used for design exploration, prototypes and motion experiments only, unless explicitly approved later.

**D-006 · 2026-10-06 · Architecture**
External databases and search services (Algolia, Typesense, Meilisearch, Elasticsearch/OpenSearch, Convex, etc.) need written justification before adoption, based on measured inventory size, query complexity, sync frequency and traffic. For hundreds to low thousands of listings, optimised WordPress queries are the default.

**D-007 · 2026-10-06 · Architecture**
Supabase/PostgreSQL is removed from all active assumptions. Do not create Supabase schemas or Supabase-specific skills. (The Supabase connector exists on the account but is deliberately unused for this project.)

**D-008 · 2026-10-06 · Product**
Natural-language search is **Phase 2**. Phase 1 priorities: structured search, strong filters, editable filter chips and autocomplete. NL search is added only if it materially improves discovery.

**D-009 · 2026-10-06 · Quality**
The accessibility target is **WCAG 2.2 Level AA**, owned by the `alaliah-accessibility` skill. QA widths are 1920 / 1440 / 1024 / 768 / 390 / 375, owned by `alaliah-visual-regression`.

**D-010 · 2026-10-06 · Process: rule priority when guidance conflicts**
1. Explicit user instruction
2. Approved Al Aliah brand strategy
3. Approved Stage 02 design system
4. Usability / accessibility
5. Performance
6. Project-specific `alaliah-*` skills
7. Official framework/library guidance (WordPress, GSAP, Motion, …)
8. Third-party generic design skills (frontend-design, design-taste-frontend, ui-ux-pro-max, …)

Generic skill guidance never overrides the approved brand.

**D-011 · 2026-10-06 · Tooling: animation & scroll policy (provisional until Stage 04)**
- Use the smallest tool that does the job: **CSS** for hover, opacity and simple transitions; **Motion** for UI state, layout, menus, filters and drawers; **GSAP** for cinematic sequences, complex timelines and ScrollTrigger; **Rive** for light interactive vector animation; **Three.js/R3F/Spline** only for a genuine spatial use case approved in Stage 02/03.
- Never implement the same animation in two systems.
- **One scroll system.** Native scroll by default and always on search, results, filters, forms and maps. Lenis + GSAP *or* ScrollSmoother may be chosen for selected editorial pages, never both.
- No Lenis, Three.js, Spline, Rive or Lottie dependency until a Stage 02–04 decision justifies it.
- The final rules move to `alaliah-motion` when Stage 04 is approved.

**D-012 · 2026-10-06 · Tooling: third-party skills**
Third-party skills are vendored at project scope in `.claude/skills/`, pinned to a reviewed commit and recorded in `docs/capabilities.md`, together with any local patches. Every update gets a fresh review of bundled scripts before it is committed.
- `ui-ux-pro-max`: **never use `--persist`.** It writes a competing `design-system/*/MASTER.md` "source of truth". The design system is owned only by `alaliah-design-system`.
- Do not install React Native, Convex, Supabase or 3D skills unless a later decision requires them.

**D-013 · 2026-10-06 · Security**
No secrets in the repository. MCP credentials are read from environment variables (`API_KEY_21ST`, `GITHUB_PERSONAL_ACCESS_TOKEN`). WordPress salts, CRM credentials and API keys live in environment config, never in docs, code or frontend bundles.

**D-014 · 2026-10-06 · Environments (source of truth)**
| Fact | Value |
|---|---|
| Production | `https://alaliahinternational.com/`: live site, **read-only by default** |
| Staging | `https://alaliah.trigonsolutions.co/`: **primary writable WordPress** for the redesign |
| Primary CMS | WordPress |
| WordPress access | Novamira MCP, on staging only |
| 21st MCP | API key provided through the environment. Connection verified 2026-10-06 |

Production writes of any kind (files, DB, plugins, themes, settings, content, migrations, WP-CLI writes) require explicit user authorisation for that specific change. Workflow: repo/local → staging → browser QA → production later. The local SQLite harness is kept for isolated tests and does not replace staging. Operational rules are owned by the `alaliah-environments` skill.

**D-015 · 2026-10-06 · Privileged MCP naming**
Privileged WordPress MCP connections are named by environment. Staging's server is **`novamira-alaliah-trigonso`** (user-specified 2026-10-06; it points at `alaliah.trigonsolutions.co`). A production server, if ever authorised, is `novamira-alaliah-production`. Credentials are passed only as env vars (`WP_API_URL`, `WP_API_USERNAME`, `WP_API_PASSWORD`) through `@automattic/mcp-wordpress-remote` and are kept out of git. Ambiguous names (`wordpress`, `alaliah`, …) are not allowed. Novamira connects to staging only, unless production access is explicitly authorised later.

**D-016 · 2026-10-06 · Novamira safety**
Discover abilities before use; read before write; preserve content, users, credentials, media, plugin data, integrations and SEO metadata; no destructive shortcuts. A recoverable staging backup (DB, uploads, themes, plugins, config) must be **verified** before major architectural work, and an unverifiable backup is reported, never assumed. The first Novamira session is a read-only audit that produces `docs/wordpress-environment-report.md`, then stops.

**D-017 · 2026-10-06 · Legacy systems & plugins**
Nothing legacy (plugin, theme, shortcode, table) is removed until it is shown that no content, data, URL or integration depends on it. Plugins are used for mature infrastructure (SEO, multilingual, forms, caching, security, redirects, image optimisation, backups), never for the product experience (property UI and cards, search UX, design-system components, cinematic interaction, page architecture). Every new plugin needs a written reason. No generic real-estate plugin is installed before the property data source is understood (Q3). Generic commercial themes are not used as the foundation.

**D-018 · 2026-10-06 · 21st usage**
21st is research and reference only, never the design system. Read tools only by default; account-writing tools only on explicit request. Generated or installed components are never used blindly: fetch with `get_component`, inspect, adapt. **21st `installCommand`s are not run** because they embed the API key in a URL (shell history and logs). Free tier: 2 component retrievals/day; AI generation disabled.

**D-019 · 2026-10-06 · Definition of done for WordPress work**
A feature is done only after browser QA against the **staging URL** (desktop/tablet/mobile, navigation, console, failed requests, forms, animation and reduced motion, keyboard, accessibility, overflow, layout shift). Passing lint, builds or local WordPress is not enough.

**D-020 · 2026-10-06 · Novamira operating limits (from the staging audit)**
1. **Until staging is isolated from production (open-questions E1),** Novamira writes (`write-file`, `edit-file`, `delete-file`, `execute-php` that writes, `run-wp-cli` write commands) are limited to paths inside the staging docroot `/home/trigonso/domains/alaliah.trigonsolutions.co/public_html/`. Every path is checked before the call. Nothing may touch `/home/trigonso/domains/alaliahinternational.com/`.
2. **Major WordPress work stays blocked** until a restorable backup is verified (D-016 gate; E3 not met).
3. **Novamira's own design library (`save-design`/`activate-design`) and skills (`novamira-design`, `skill-write`) are not used.** The design system has one owner, `alaliah-design-system` (D-003, D-012). Novamira's server instruction to load `novamira-design` before visual work is overridden by D-010.
4. The MCP config needs `NODE_USE_ENV_PROXY=1` in cloud sessions (open-questions E4).

**D-021 · 2026-10-06 · Novamira independence**
Novamira is a **development access tool** (comparable to SSH, SFTP or WP-CLI). It is not part of the product. The website must work unchanged if Novamira is deactivated or deleted, or if Claude/MCP access is removed.
- Novamira may inspect, deploy, run controlled commands and verify.
- Novamira must **not** own templates, rendering, styles, JS, CPTs, taxonomies, search, data architecture, CRM integrations, site settings the redesign needs, or design-system data. Its design library, skills and runtime systems are never used for the product (extends D-020).
- **No project code in `wp-content/novamira-sandbox/`.** Sandbox PHP is loaded by Novamira's mu-plugin, so it is a runtime dependency by construction. `execute-php` is for read-only diagnostics and documented one-off operations only, never for creating files that bypass the sandbox guard.
- **Completion gate:** before the redesign is technically complete, deactivate Novamira on staging, clear caches, run full automated QA (`alaliah-visual-regression`, `alaliah-accessibility`) and confirm the whole site works. It may be re-enabled afterwards.

**D-022 · 2026-10-06 · Code ownership & two-layer architecture**
All project code is owned and branded as **Trigon Solutions** (`Author: Trigon Solutions` in theme/plugin headers). Never brand it as Novamira, Claude, Anthropic, 21st or any other tool.
| Layer | Package (working names) | Owns |
|---|---|---|
| Presentation | Theme `alaliah-trigon` ("Al Aliah — Trigon") | Templates, styling, layout, typography, navigation, responsive behavior, animation (GSAP, Lenis if approved), frontend JS, `theme.json`, block styles and patterns, property, project and community *presentation* |
| Business logic | Plugin `trigon-alaliah-core` ("Trigon Al Aliah Core") | CPTs, taxonomies, structured fields, REST endpoints, search, autocomplete, filter logic, map data, CRM/feed integrations, scheduled sync, external IDs, lead processing, all Al Aliah-specific functionality that must survive a theme change |

Data-bearing registrations (CPTs, taxonomies, meta) live in the plugin, never only in the theme or `functions.php`. Custom code lives only in standard locations (`wp-content/themes/`, `wp-content/plugins/`).

**D-023 · 2026-10-06 · Git is canonical; deployment path**
The repository is the canonical source for all custom theme and plugin code. Staging is never the only copy, and substantial changes are never made only through the WordPress editor or database. Flow: **Git → build ZIP → deploy to staging → browser QA (D-019) → approved release.**
- Novamira deployment route (verified against ability definitions 2026-10-06): upload the ZIP via `novamira/create-upload-link`, install with `novamira/run-wp-cli` (`wp theme|plugin install <zip> --force`), then delete the uploaded ZIP. `write-file`/`edit-file` may change non-PHP files only and are not used for code deploys.
- Anything Novamira does must be reproducible from Git, theme or plugin files, documented migration scripts, or WordPress-native content and data. No undocumented one-time operations.
- The repository layout for theme and plugin source is set when implementation starts (Stage 05).

**D-024 · 2026-10-06 · Legacy stack & cloned data**
WPResidence, its core plugin, Elementor and add-ons, existing content, media and property data stay in place.
- On **staging** they may be **deactivated** when needed, but are **not deleted** until the replacement is proven and deletion is explicitly approved.
- Before deactivating or replacing a component, document: content, shortcode, property-data and metadata dependencies, and the migration path (see `wordpress-environment-report.md` §8.1).
- Cloned content, images and client data are preserved until the migration strategy is approved. Demo/fake content (e.g. the 17 demo reviews) is identified now and removed deliberately later. Purging copied security/PII data (report R7) remains an owner decision and is not done by default.

**D-025 · 2026-10-06 · Theme foundation & Elementor** · *RESOLVED by D-026 (Option C)*
WPResidence is **not** assumed to be the frontend foundation. The choice is made after Stages 02 and 03 are approved, between:
- **A.** Hello Elementor + Trigon child theme
- **B.** Twenty Twenty-Five + Trigon child theme
- **C.** Fully custom Trigon theme

Criteria, in order: lowest unnecessary frontend overhead, strongest design control, performance, maintainability, clean animation integration, minimal vendor dependency. Familiarity is not a criterion. The new site must not depend on Elementor unless explicitly approved. If Elementor is kept for legacy or editorial convenience, templates and styling stay under the Trigon design system.

**D-026 · 2026-10-06 · Option C approved: fully custom theme + core plugin**
Resolves D-025. The production architecture is:
- **`alaliah-trigon`**: a fully custom WordPress theme (not a child theme), `Author: Trigon Solutions`, which owns presentation.
- **`trigon-alaliah-core`**: a custom core plugin, `Author: Trigon Solutions`, which owns data and logic (per D-022).
- **Elementor and WPResidence** (theme + WpResidence core/Elementor-widget/Studio plugins) may stay installed **temporarily for legacy compatibility only**. The redesigned frontend must not depend on them: no Elementor templates, widgets, CSS or JS, and no WPResidence functions, CPT registrations, meta or shortcodes called by the new theme or plugin. Their removal follows D-024 (deactivate first; delete only after replacement is proven and approved).
- The custom theme may still use `theme.json`, block patterns and the block editor (editor approach: open-questions W3).
- **Not built yet.** Implementation starts at Stage 05. Stage 02 visual direction is next.

**D-027 · 2026-10-06 · Visual direction: Redline, corrected to "architectural intelligence"**
Redline is the selected Stage 02 direction. The Stage 02.5 correction moves it from architectural *documentation* to architectural *intelligence*: composition, image choreography, depth, asymmetry and anchored information replace visible drafting apparatus (no decorative red lines, ticks, coordinates or CAD styling). Two borrowings only, applied under Redline's rules, and no hybrid of the three directions:
- **From Rubric:** meaningful bilingual English/Arabic treatment of place and section names.
- **From Hard Light:** photographic drama for community and brand-led moments only.

Crimson stays a controlled signal (selection, focus, navigation, primary action). The system study (principles, composition rules, density modes, photography tiers, tokens with measured contrast, motion vocabulary, component vocabulary) is in `stage-02-5-redline.md` and becomes `alaliah-design-system` once approved.

