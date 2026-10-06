# Decision Log

This file records approved decisions and any overrides of the [master brief](./00-master-brief.md). Later entries take precedence over the brief where they conflict.

Format: `D-NNN · date · area` then the decision and its rationale.

---

## Stage status

| Stage | Status |
|---|---|
| 01 Brand understanding | **Complete** |
| Capability setup | **Complete.** See [`capabilities.md`](./capabilities.md) |
| 02 Visual world / aesthetic direction | **Next** |
| 03 Website experience | Locked until Stage 02 is approved |
| 04 Motion & interaction | Locked until Stage 03 is approved |
| 05 Implementation | Locked until Stage 04 is approved. No production development before then. |

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
