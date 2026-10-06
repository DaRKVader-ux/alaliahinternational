---
name: alaliah-visual-regression
description: Al Aliah screenshot QA. Required widths, what to check at each, the browser QA command, and the review workflow before approving visual changes. Load before declaring any page, template or component done, and before approving a large visual change.
---

# Al Aliah visual regression & browser QA

A build is not done because it compiles. It is done when it has been driven in a real browser at every QA width and reviewed.

## QA widths (owned here)
| Width | Represents |
|---|---|
| 1920 | Large desktop |
| 1440 | Standard desktop |
| 1024 | Tablet landscape / small laptop |
| 768 | Tablet portrait |
| 390 | Current mobile |
| 375 | Small mobile |

These are **test widths, not design breakpoints.** Breakpoints are owned by `alaliah-responsive` once Stage 02/03 define them.

## Automated pass
```bash
cd tools/qa && npm install          # once
node check.mjs <url> <out-dir>      # add --axe-all to scan every width
```
It produces full-page screenshots per width and fails on any of:
- console errors, page errors, or HTTP ≥ 400 subresources (logged with URL)
- horizontal overflow at any width
- axe violations (1440 + 390 by default)

It also prints the first keyboard focus target per width (it should be the skip link).

For a local WordPress to test against: `tools/wp-local/setup.sh <dir> [port]`.

## Manual pass (the script cannot judge these)
Review the screenshots at each width for:
- hierarchy: is price/title/community legible first on property UI?
- crimson used deliberately, not as decoration (`alaliah-brand-system`)
- no clipped Arabic-length labels (test with long strings once RTL exists)
- images: correct crop/art direction per width, no stretched or soft images
- tap targets ≥ 44×44 CSS px on 390/375
- sticky elements (search, filters, CTA) not covering content

Then interact, don't just look: open menus, apply filters, submit forms with invalid input, open and close dialogs with the keyboard.

## Comparing changes
Before approving a large visual change, capture the same URLs at the same widths **before and after** into separate folders and review them side by side. Pixel-diff baselines (Playwright `toHaveScreenshot`) will be added when the theme repository exists. Until then, review the before/after pairs side by side.

## Environment notes
- Playwright is pinned to 1.56.1 in `tools/qa` to match the browsers preinstalled in cloud sessions (`/opt/pw-browsers`). Do not run `playwright install` there.
- Use the same origin the site is configured with (`localhost` vs `127.0.0.1`), otherwise module scripts fail CORS and produce false console errors.
