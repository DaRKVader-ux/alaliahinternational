# Al Aliah International: Digital Redesign

Redesign and redevelopment of the Al Aliah International website as a modern Abu Dhabi property discovery and advisory platform. **Platform: custom WordPress (WordPress-first).**

| Document | Purpose |
|---|---|
| [`docs/00-master-brief.md`](docs/00-master-brief.md) | Brand, product, design and development foundation |
| [`docs/decisions.md`](docs/decisions.md) | Decision log, rule priority and stage status |
| [`docs/open-questions.md`](docs/open-questions.md) | Unresolved risks and client inputs needed |
| [`docs/capabilities.md`](docs/capabilities.md) | Verified tooling, skills and MCP status |
| [`docs/wordpress-environment-report.md`](docs/wordpress-environment-report.md) | Staging WordPress audit (2026-10-06) |
| [`docs/stage-02-visual-directions.md`](docs/stage-02-visual-directions.md) | Stage 02: three visual directions + recommendation ([specimens](docs/stage-02/visual-directions.html)) |
| [`docs/stage-02-5-redline.md`](docs/stage-02-5-redline.md) | Stage 02.5: Redline corrected + design-system study ([specimen](docs/stage-02-5/redline.html)) |
| [`docs/stage-02-5b-refinement.md`](docs/stage-02-5b-refinement.md) | Stage 02.5b: Redline system refinement ([specimen](docs/stage-02-5b/system.html)) |
| [`docs/stage-02-5c-final-refinement.md`](docs/stage-02-5c-final-refinement.md) | Stage 02.5c: type, card and map final refinement ([specimen](docs/stage-02-5c/final.html)) |
| [`docs/stage-03-1-information-architecture.md`](docs/stage-03-1-information-architecture.md) | Stage 03.1: information architecture (approved) |
| [`docs/stage-03-2-data-model-report.md`](docs/stage-03-2-data-model-report.md) | Stage 03.2: current data model, inventory and migration recommendation |
| [`CLAUDE.md`](CLAUDE.md) | Working rules for AI-assisted development |

| Tool | Purpose |
|---|---|
| `tools/wp-local/setup.sh` | Throwaway local WordPress on SQLite (PHP + git only) |
| `tools/qa/check.mjs` | Playwright + axe QA at 1920/1440/1024/768/390/375 |

**Current stage:** **03.2**: data-model report and migration recommendation (Path B) awaiting approval; nothing migrated. Major WordPress work is blocked by staging isolation and backups (open-questions E1, E3).
