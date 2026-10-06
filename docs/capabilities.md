# Capability Readiness Report

**Audit date:** 2026-10-06 · **Environment:** Claude Code 2.1.291, cloud session (Linux container) · **Architecture:** WordPress-first (D-004)

Everything marked ✅ was **exercised**, not just detected: a tool call returned data, a script ran, or a page was rendered.

---

## 1. Environment

| Capability | Status | Version / source | Notes / action |
|---|---|---|---|
| Node.js | ✅ | 22.22.0 | |
| Package managers | ✅ | npm 10.9.4, pnpm 10.28.0, yarn 1.22.22, bun 1.4.2 | npm is the default for `tools/` |
| PHP | ✅ | 8.3.6 with `pdo_sqlite`, `mysqli`, `gd`, `intl`, `zip`, OPcache | Enough to run WordPress |
| Composer | ✅ | present (plugins disabled in non-interactive sessions) | packagist reachable |
| WP-CLI | ✅ | 2.12.0 (phar, fetched by `tools/wp-local/setup.sh`) | Not globally installed, which is intentional |
| Local WordPress | ✅ | **7.1.2 on SQLite** (sqlite-database-integration v3.0.2) | Verified: install, permalinks, a test CPT + taxonomy + REST meta, single URL server-rendered (HTTP 200), `/wp-json/wp/v2/property` returning data |
| MySQL / MariaDB | ❌ | none | Not needed locally (SQLite). Production DB is set by hosting (open-questions W6) |
| Docker | ⚠ | CLI 29.8.2, **daemon not running** | `wp-env` will not work in cloud sessions; it works on a local machine with Docker |
| `wordpress.org` downloads | ❌ blocked | egress policy | Worked around with GitHub git mirrors. `wp-playground` CLI needs wordpress.org, so it is local-machine only |
| Playwright | ✅ | 1.56.1 + Chromium 1194 preinstalled (`/opt/pw-browsers`) | Verified at 1920/1440/1024/768/390/375 with screenshots, console, overflow and focus checks |
| axe-core | ✅ | @axe-core/playwright 4.11.3 | Verified: it found a real `list` violation in the default WP theme |
| Lighthouse | ✅ | 13.5.0 | Verified run: perf 98 / a11y 100 / SEO 91 (default theme, scores irrelevant) |
| Git / GitHub | ✅ | remote `DaRKVader-ux/alaliahinternational`, GitHub MCP authenticated as `DaRKVader-ux` | Branch-per-task; no secrets committed (D-013) |
| Project framework / `package.json` | none yet | | Correct for this stage. The theme project is created in Stage 05 |

## 2. MCP servers

| Server | Scope | Status | Evidence / action |
|---|---|---|---|
| **Figma** | account connector | ✅ responds | `whoami` → Full seat, **Starter** plan. Figma documents very low monthly MCP tool-call limits for Starter plans; check the rate-limits page before relying on it for Stage 02 production work |
| **GitHub** | account connector | ✅ responds | `get_me` → `DaRKVader-ux` |
| **shadcn-ui** (`@jpisnice/shadcn-ui-mcp-server@3.0.0`) | project, `.mcp.json` | ⚠ **partial in cloud** | Connected in-session; `get_component(sheet)` verified 2026-10-06. `list_components` / `get_block` need `api.github.com`, which is blocked in cloud sessions; they work locally. Set `GITHUB_PERSONAL_ACCESS_TOKEN` to avoid rate limits |
| **21st MCP** (`https://21st.dev/api/mcp`) | project, `.mcp.json` (key via `API_KEY_21ST` env) | ✅ **verified 2026-10-06** | `get_usage` → authenticated, **free tier: 2 component retrievals/day, AI generation disabled**, search unmetered. `search("property search filter bar with price range")` → 5 real results. `21st.dev` is now allowed by egress. Key not present in repo or Claude config files. Usage rules: D-018 |
| Supabase, Vercel | account connectors | available, **deliberately unused** | D-007; Vercel hosting is irrelevant to WordPress |
| Framer | none | not configured | D-005: prototype-only, no integration needed now |
| **Novamira** (`novamira-alaliah-trigonso`) | local Claude config only (`~/.claude.json`, mode 600; not in git) | ❌ **configured, not connecting** | 2026-10-06: proxy `@automattic/mcp-wordpress-remote` 0.4.0 starts; `tools/list` fails with `403 Host not in allowlist: alaliah.trigonsolutions.co` (egress, E4). Credentials not yet tested. Naming and safety: D-015 / D-016 |
| Staging `alaliah.trigonsolutions.co` | n/a | ❌ **blocked by egress** | 403 at proxy. Needed for Novamira and staging browser QA (D-019) |
| Production `alaliahinternational.com` | n/a | ❌ **blocked by egress** | 403 at proxy. Read-only comparison only (D-014). Same IP as staging (E1) |

Project MCP servers show "pending approval" on first launch. Approve them once per machine.

## 3. Skills

### Project-specific (`alaliah-*`)
| Skill | Status |
|---|---|
| `alaliah-brand-system` | ✅ active (Stage 01). Equivalent to the requested `alaliah-brand` |
| `alaliah-accessibility` | ✅ active (D-009) |
| `alaliah-visual-regression` | ✅ active (D-009). Backed by `tools/qa/check.mjs` |
| `alaliah-environments` | ✅ active (D-014 – D-019): environments, Novamira safety, plugin policy, 21st usage |
| `alaliah-design-system` | pending Stage 02 approval |
| `alaliah-property-search`, `alaliah-property-card`, `alaliah-property-detail`, `alaliah-community-pages`, `alaliah-project-pages`, `alaliah-responsive` | pending Stage 03 |
| `alaliah-motion` | pending Stage 04 (provisional rules in D-011) |
| `alaliah-wordpress-architecture` | pending CRM/feed discovery (open-questions Q3) |

### Vendored third-party skills (pinned, reviewed)
All were discovered by the harness in-session (they appear in the available-skills list). Bundled scripts were read before vendoring. None make network calls except where noted.

| Skill(s) | Source @ commit | Licence | Local changes | Relevance under WordPress-first |
|---|---|---|---|---|
| `frontend-design` | anthropics/skills @ `683bc88` | Apache-2.0 | none | Core: Stage 02 art direction |
| `design-taste-frontend` (v2, experimental) | Leonxlnx/taste-skill @ `ce26fc2` | MIT | none | Core: anti-generic audit. Identical to the account-synced copy. Starting dials: VARIANCE 7–8, MOTION 6–7, DENSITY 3–5, revised after Stage 02. Never overrides real-estate usability |
| `ui-ux-pro-max` | nextlevelbuilder/ui-ux-pro-max-skill @ `477bcb2` | MIT | removed `scripts/tests/`; replaced `${CLAUDE_PLUGIN_ROOT}/` with repo-relative paths (run from repo root). **Never use `--persist`** (D-012) | Research and validation only. Verified: local CSV search runs, no network |
| `webapp-testing` | anthropics/skills @ `683bc88` | Apache-2.0 | none | Browser QA helper (`with_server.py` runs the server command you give it) |
| `gsap-core`, `gsap-timeline`, `gsap-scrolltrigger`, `gsap-plugins`, `gsap-utils`, `gsap-performance`, `gsap-react` | greensock/gsap-skills @ `aed9cfd` | MIT | none (`gsap-frameworks` skipped: Vue/Svelte) | GSAP is framework-free, so it works in a WP theme. `gsap-react` only if W1 = React |
| `motion-framer` | freshtechbro/claudedesignskills @ `1da73fe` | MIT | removed `assets/starter_motion/` (Vite/React starter; SKILL.md still mentions it) | Conditional. React-centric and last updated 2025-11, while Motion is now v14. **Check against current motion.dev docs before use.** For a WP theme, Motion's vanilla `animate`/`scroll`/`inView` API is the relevant part |
| `vercel-react-best-practices` | vercel-labs/agent-skills @ `063bee9` | MIT | none | Conditional: only if a React island is chosen (W1). Next.js/RSC rules don't apply |
| `wordpress-router`, `wp-project-triage`, `wp-plugin-development`, `wp-rest-api`, `wp-performance`, `wp-wpcli-and-ops`, `wp-block-development`, `wp-block-themes`, `wp-interactivity-api`, `wp-patterns`, `wp-phpstan`, `wp-env`, `wp-playground` | WordPress/agent-skills @ `3cf7f6f` | GPL-2.0-or-later | none | **Core** for Stage 03/05. `wp-env` needs Docker and `wp-playground` needs wordpress.org: both local-machine only. `wp-playground` mentions a `blueprint` skill that was not vendored |

### Deliberately not installed
| Skipped | Reason |
|---|---|
| React Native skills | Web platform only |
| Three.js, R3F, Spline, Rive, Lottie, Babylon, PixiJS, A-Frame skills | No approved spatial/3D use case (D-011). Add if Stage 02/03 justifies one |
| Convex skills | D-006 / D-007 |
| `wpds`, `wp-abilities-*`, `wp-plugin-directory-guidelines`, `blueprint` | wp-admin design system, AI Abilities API, and wordpress.org directory publishing: not this project |
| 21st `21st-ui` skill | Its guidance targets installing generated components, which D-018 restricts. The MCP tool descriptions are sufficient |
| Taste variants (`soft`, `brutalist`, `minimalist`, `redesign`, …) | Style presets would compete with the brand-led Stage 02 directions |

## 4. Frontend libraries

**Nothing is installed into a project yet, and that is intentional:** there is no theme project before Stage 05. The npm registry is reachable, and current versions were confirmed:

| Package | Latest | Role (D-011) |
|---|---|---|
| `gsap` | 3.15.0 | Cinematic sequences, ScrollTrigger. Plugins (SplitText, Flip, MorphSVG, DrawSVG, CustomEase, …) ship in the main package. Verify licence terms at install time |
| `motion` | 14.0.0 | UI state and layout transitions. Use current `motion` imports, not legacy `framer-motion` |
| `lenis` | 1.3.26 | Optional, editorial pages only, never with ScrollSmoother |
| `@wordpress/scripts`, `@wordpress/interactivity` | registry | Theme/block build and native interactivity (W1 option a) |
| Maps: Mapbox GL / MapLibre / Google Maps | not evaluated | Depends on coordinate quality (Q3). `api.mapbox.com` is currently blocked by egress policy |
| Search engines (Typesense/Meilisearch/Algolia) | not evaluated | D-006: requires justification |

## 5. Conflicts identified

1. **React-centric tooling vs a WordPress theme.** shadcn, `motion-framer`, `gsap-react`, `vercel-react-best-practices` and 21st all assume React. Under WordPress-first they are reference tools until W1 decides the interactive layer. shadcn's value here is accessible behavior patterns, not visual identity.
2. **ui-ux-pro-max `--persist`** would create a second design-system source of truth. Forbidden (D-012).
3. **Overlapping design skills** (frontend-design, design-taste-frontend, ui-ux-pro-max) give different style advice. Resolve conflicts with the priority order in D-010: brand strategy first, generic skills last.
4. **Duplicate `design-taste-frontend`** (project copy and account-synced copy). They are identical today. The project copy is the pinned one; if they diverge, the project copy wins.
5. **Scroll engines:** Lenis and GSAP ScrollSmoother are both available. Only one may be used (D-011).
6. **The capability brief's "Framer capability" section (§39–40)** is superseded by D-005 for production.

## 6. Recommended active stack

| Layer | Use now (Stage 02) | Use later |
|---|---|---|
| Brand / direction | `alaliah-brand-system`, `frontend-design`, `design-taste-frontend` | |
| Research / validation | `ui-ux-pro-max` (search only) | 21st MCP and shadcn MCP for component *behavior* research in Stage 03 |
| Visual exploration | HTML/CSS explorations rendered in Playwright; Figma MCP within plan limits | Framer for prototypes only if needed (D-005) |
| QA | `alaliah-visual-regression`, `alaliah-accessibility`, `tools/qa` | Pixel-diff baselines once the theme repo exists |
| Platform | | WordPress skills set, `tools/wp-local`, interactive layer per W1 |
| Motion | | CSS → Motion → GSAP per D-011 |

## 7. Verdict

### Stage 02 (visual direction): READY
Every capability Stage 02 needs is verified: brand rules, art-direction skills, research data, 21st and shadcn research, browser rendering and screenshots at all QA widths, accessibility scanning, and Figma (within Starter-plan limits).

### Infrastructure track: NOT COMPLETE
| Item | Blocker | Owner |
|---|---|---|
| Novamira connection | Not installed/connected; staging host denied by egress (E4) | User / developer |
| Staging environment audit | Needs Novamira | Claude, once connected (D-016) |
| Staging browser QA | Staging host denied by egress | User: allow `alaliah.trigonsolutions.co` |
| Production read-only comparison | Production host denied by egress | User: allow `alaliahinternational.com` |
| Backup verification | Not visible from here (E3) | User / host |
| Host isolation | Shared IP with production (E1) | User / host |

The infrastructure track blocks **Stage 03** (the content model and templates depend on what staging contains), not Stage 02. Q3/Q4 (CRM feed, inventory) also block Stage 03.
