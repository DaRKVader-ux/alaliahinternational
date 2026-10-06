---
name: alaliah-accessibility
description: Al Aliah accessibility standard and QA checklist (WCAG 2.2 AA, keyboard, focus, forms, dialogs, maps, motion, RTL). Load when building or reviewing any interactive UI (search, filters, menus, galleries, maps, forms) and before declaring UI work done.
---

# Al Aliah accessibility

Accessibility is part of design quality, not a post-launch fix. Aesthetic choices must never make content inaccessible.

**Target: WCAG 2.2 Level AA** (decision D-009).

## Hard rules
- **Semantics first.** Use native elements (`button`, `a`, `select`, `dialog`, `fieldset`/`legend`) before ARIA. Add ARIA only when no native element fits, and follow the WAI-ARIA Authoring Practices pattern for it.
- **Keyboard:** everything operable by mouse or touch is operable by keyboard, in a logical order. No keyboard traps except an intentional modal trap.
- **Visible focus** on every interactive element, at ≥ 3:1 contrast against adjacent colors. Never `outline: none` without a replacement.
- **Contrast:** text 4.5:1 (large text 3:1); UI components and graphical objects 3:1. This applies to crimson in both light and dark contexts.
- **Brand crimson is not the error color.** Errors use the semantic error color from the design system, plus an icon and text. Never color alone (open-questions Q6).
- **Targets:** ≥ 24×24 CSS px minimum (WCAG 2.5.8). Aim for 44×44 on touch UI.
- **Reduced motion:** honour `prefers-reduced-motion`. Remove parallax, scroll-linked and large movement; keep opacity/state changes. Autoplay video must be pausable, and must not autoplay under reduced motion.
- **Images:** meaningful `alt` for property and community images (what the image shows, not "image of"); empty `alt=""` for decorative ones.

## Component-specific requirements
| Component | Requirement |
|---|---|
| Search / filters | Every control has a visible label. Results count changes are announced through a polite live region. Applied filters are listed as removable chips, each with an accessible name ("Remove filter: 2 bedrooms"). |
| Autocomplete | Combobox pattern: `aria-expanded`, `aria-activedescendant`, arrow keys, Esc closes, Enter selects. |
| Bottom sheets / dialogs / drawers | Focus moves in on open, is trapped while open, and returns to the trigger on close. Esc closes. Background is inert. |
| Navigation / mega menu | Disclosure pattern (not `role="menu"`). Esc closes and returns focus. |
| Gallery / carousel | Prev/next buttons with names. No autoplay, or a pause control. Position announced ("Image 3 of 12"). |
| Map | Never the only way to reach results. The list view stays equivalent and reachable. Pins are not the only path to a listing. Map controls are keyboard-operable. |
| Forms (enquiry, list-your-property) | Labels, `autocomplete` tokens, errors tied to fields via `aria-describedby`, an error summary on submit, multi-step progress announced. |
| Price / area | Units in text ("AED", "sq ft"), not only icons. Numbers formatted for the locale. |

## RTL
Mirrored layouts keep a logical reading and focus order. Directional icons (arrows, chevrons) flip; non-directional ones (search, play, phone) do not. Set `lang` and `dir` on mixed-language fragments.

## Verification
1. Automated: `node tools/qa/check.mjs <url> <out> --axe-all` (see `alaliah-visual-regression`). Zero axe violations is necessary, not sufficient.
2. Keyboard-only walkthrough of the page's primary task (e.g. search → filter → open listing → enquire).
3. Screen-reader spot check of the same flow when the component is new (VoiceOver or NVDA).
4. Zoom to 200% and 400% (reflow at 320 CSS px): no loss of content or function.
