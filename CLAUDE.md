# Al Aliah International: website redesign

Brand, product and engineering work for Al Aliah International (Abu Dhabi real-estate brokerage and property management). The goal is a **modern Abu Dhabi property discovery and advisory experience**, not a prettier agency website.

## Read first
1. `docs/00-master-brief.md`: primary strategic context. Treat it as authoritative.
2. `docs/decisions.md`: approved decisions, overrides of the brief, and **current stage status**.
3. `docs/open-questions.md`: unresolved risks. Check it before designing anything they affect.

## Stage gating (strict)
01 Brand → 02 Visual world → 03 Website experience → 04 Motion → 05 Implementation.

- Do not finalize work belonging to a later stage than the current one in `docs/decisions.md`.
- Exploration ahead of stage is allowed only when labeled **exploratory** and never recorded as a decision.
- Never start with animation, competitor copying or isolated screens.

## Non-negotiables
- **Never invent data:** no fake metrics, testimonials, licence numbers, transaction counts or awards. Mark mock data as placeholder.
- **Red is brand equity.** Evolve it, don't replace it. No gold/navy/beige luxury palettes.
- **Abu Dhabi, not Dubai,** in all imagery and references.
- **Usability beats spectacle** in search, listings, forms and anything a tenant uses.
- **RTL-ready by construction:** use logical CSS properties (`margin-inline-start`, not `margin-left`), avoid direction-baked icons and layouts, and keep copy out of images.
- **Accessibility:** semantic HTML, visible focus, WCAG AA contrast, reduced-motion support.
- Every major decision must pass the ten questions in brief §64.

## Skills
Project skills live in `.claude/skills/`. **One owner per rule:** if a skill covers a topic, update that skill instead of restating its rules elsewhere.

| Skill | Status |
|---|---|
| `alaliah-brand-system` | Active (Stage 01) |
| `alaliah-design-system` | Pending Stage 02 approval |
| `property-search`, `property-listing`, `property-detail`, `projects`, `community-pages`, `developers`, `agent-pages`, `real-estate-seo` | Pending Stage 03 |
| `motion-direction` | Pending Stage 04 |
| `framer-development`, `framer-cms`, `property-data`, `arabic-rtl`, `accessibility`, `responsive-design`, `performance`, `visual-regression`, `qa` | Pending Stage 05 / architecture decision (open-questions Q7) |

Do not create a pending skill with placeholder content (decision D-003).

## Writing style for project docs
Concise and precise, following the brand voice. Avoid filler and superlatives.
