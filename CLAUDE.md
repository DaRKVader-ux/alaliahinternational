# Al Aliah International: website redesign

Brand, product and engineering work for Al Aliah International (Abu Dhabi real-estate brokerage and property management). The goal is a **modern Abu Dhabi property discovery and advisory experience**, not a prettier agency website.

**Architecture: WORDPRESS-FIRST** (D-004). Custom WordPress theme, CPTs + taxonomies + structured fields, REST/AJAX for interactive search. Framer is for prototyping only. No Supabase. External DBs and search services need written justification.

## Environments (D-014)
| | URL | Posture |
|---|---|---|
| Production | https://alaliahinternational.com/ | **Read-only by default.** No writes without explicit authorisation for that change |
| Staging | https://alaliah.trigonsolutions.co/ | Primary writable WordPress, accessed via Novamira MCP (`novamira-alaliah-trigonso`) |
| Local | `tools/wp-local/setup.sh` | Isolated tests and QA. Does not replace staging |

**Load `alaliah-environments` before any staging or production action, any Novamira or WP-CLI call, or any plugin/theme change.** Staging and production share a hosting account (open-questions E1): every write stays inside the staging WordPress directory, and account- or server-level config is never touched.

## Code ownership & Novamira independence (D-021 – D-025)
- **Novamira is an access tool, not part of the product.** The site must work with Novamira deactivated or deleted. Never put project code in `wp-content/novamira-sandbox/`, and never use Novamira's design library or skills.
- **Two layers, branded Trigon Solutions:** theme `alaliah-trigon` (presentation) + plugin `trigon-alaliah-core` (CPTs, taxonomies, fields, REST, search, integrations). Data-bearing code never lives only in the theme.
- **Git is canonical.** Git → ZIP → staging (upload link + WP-CLI install) → browser QA → release. No code changes made only in WordPress.
- **Legacy stack (WPResidence, Elementor, content, media):** deactivate on staging if needed, never delete without approval, preserve cloned data until migration is approved.
- **Theme foundation: Option C approved (D-026).** Fully custom theme `alaliah-trigon` + plugin `trigon-alaliah-core`. Elementor and WPResidence may stay installed temporarily for legacy content only; the new frontend never depends on them. Nothing is built before Stage 05.

## Read first
1. `docs/00-master-brief.md`: primary strategic context. Sections marked SUPERSEDED/Amended defer to the decision log.
2. `docs/decisions.md`: approved decisions, overrides of the brief, the **rule-priority order (D-010)** and **current stage status**.
3. `docs/open-questions.md`: unresolved risks. Check it before designing anything they affect.
4. `docs/capabilities.md`: what tooling is verified, partial, or broken in this environment.

## Stage gating (strict)
01 Brand → 02 Visual world → 03 Website experience → 04 Motion → 05 Implementation.

- Do not finalize work belonging to a later stage than the current one in `docs/decisions.md`.
- Exploration ahead of stage is allowed only when labeled **exploratory** and never recorded as a decision.
- Never start with animation, competitor copying or isolated screens.

## Non-negotiables
- **Never invent data:** no fake metrics, testimonials, licence numbers, transaction counts or awards. Mark mock data as placeholder.
- **Red is brand equity.** Evolve it, don't replace it. No gold/navy/beige luxury palettes.
- **Abu Dhabi, not Dubai,** in all imagery and references.
- **Usability beats spectacle** in search, listings, forms and anything a tenant uses. Native scroll on functional pages (D-011).
- **RTL-ready by construction:** use logical CSS properties (`margin-inline-start`, not `margin-left`), avoid direction-baked icons and layouts, and keep copy out of images.
- **Accessibility:** WCAG 2.2 AA, per `alaliah-accessibility`.
- **No secrets in the repo** (D-013). MCP keys come from env vars. Never run 21st `installCommand`s (they embed the key in a URL).
- **Production is read-only.** Staging is where work happens, and it counts as done only after browser QA on the staging URL (D-019).
- Every major decision must pass the ten questions in brief §64.

## Skills
Project skills live in `.claude/skills/`. **One owner per rule:** if a skill covers a topic, update that skill instead of restating its rules elsewhere. When skills disagree, apply D-010: brand strategy beats generic design skills.

| Skill | Status |
|---|---|
| `alaliah-brand-system` | Active |
| `alaliah-accessibility`, `alaliah-visual-regression` | Active |
| `alaliah-environments` | Active (environments, Novamira safety, plugin policy, 21st usage) |
| `alaliah-design-system` | Pending Stage 02 approval |
| `alaliah-property-search`, `alaliah-property-card`, `alaliah-property-detail`, `alaliah-community-pages`, `alaliah-project-pages`, `alaliah-responsive` | Pending Stage 03 |
| `alaliah-motion` | Pending Stage 04 (provisional rules: D-011) |
| `alaliah-wordpress-architecture` | Pending CRM/feed discovery (open-questions Q3) |

Do not create a pending skill with placeholder content (D-003).

Vendored third-party skills (frontend-design, design-taste-frontend, ui-ux-pro-max, GSAP, Motion, React, WordPress, webapp-testing) are pinned and documented in `docs/capabilities.md`. Rules for them:
- Update them only through a re-review (D-012).
- **Never run ui-ux-pro-max with `--persist`.**
- Run ui-ux-pro-max scripts from the repo root: `python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<query>" --domain <domain>`.

## Tooling
- Local WordPress (no Docker/MySQL needed): `tools/wp-local/setup.sh <dir> [port]`, then `cd <dir>/wp && php -S localhost:<port>`.
- Browser QA at all widths, with axe: `cd tools/qa && npm install && node check.mjs <url> <out-dir>`.
- In cloud sessions, `wordpress.org` and `api.github.com` are blocked by egress policy (use the GitHub git mirrors, as the setup script does). The staging and production hosts are also blocked until they are added to the environment's allowed domains (open-questions E4). `21st.dev` is allowed.

## Writing style for project docs
Concise and precise, following the brand voice. Avoid filler and superlatives.
