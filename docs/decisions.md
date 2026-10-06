# Decision Log

This file records approved decisions and any overrides of the [master brief](./00-master-brief.md). Later entries take precedence over the brief where they conflict.

Format: `D-NNN · date · stage · decision · rationale`.

---

## Stage status

| Stage | Status |
|---|---|
| 01 Brand understanding | **Established** (master brief) |
| 02 Visual world / aesthetic direction | **Next.** Not started. |
| 03 Website experience | Locked until Stage 02 is approved |
| 04 Motion & interaction | Locked until Stage 03 is approved |
| 05 Implementation | Locked until Stage 04 is approved |

---

## Decisions

**D-001 · 2026-10-06 · Stage 01**
The master brief (`docs/00-master-brief.md`) is adopted as the primary strategic context.

**D-002 · 2026-10-06 · Process**
Stages are gated. Work on a later stage (typography, final colors, layouts, components, motion, page transitions) is not finalized before the earlier stage is approved. Exploration is allowed; anything exploratory must be labeled as such.

**D-003 · 2026-10-06 · Process**
Project skills (`.claude/skills/`) are created only when the stage that defines their rules is approved. A skill must never contain placeholder rules. Currently defined: `alaliah-brand-system` (Stage 01). All other skills from brief §59 are pending.
