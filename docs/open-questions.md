# Open Questions & Risks

These are weak points and unresolved dependencies in the [master brief](./00-master-brief.md) that will cause rework if nobody resolves them. They are ordered by how much downstream work each one blocks.

When an item is resolved, move it to [`decisions.md`](./decisions.md) with the answer and date.

---

## Blocking: needed before Stage 02 can be judged properly

### Q1. What real brand assets exist?
The repository holds no logo files, brand guidelines, photography or current-site captures. Stage 02 has to *refine* the logo and *evolve* the red (§14–15), and neither is possible without:

- the vector logo (AI/SVG/PDF), including every lockup in current use
- the current red as a specified value (Pantone / CMYK / HEX), not a value sampled from screenshots
- any existing brand guidelines
- the current website URL and social accounts, to audit current usage

**Risk if skipped:** any "signature crimson" proposal would just be a guess at a color with no tie to the existing equity.

### Q2. What photography actually exists, and is there a budget to commission more?
§23 rules out relying on developer renders or stock, and rules out Dubai imagery. Most brokerages depend almost entirely on developer renders and agent phone photos. If commissioned architectural, community and agent photography is not budgeted, any aesthetic direction built around "large photographic moments" will fail as soon as real listing photos fill the templates.

**Implication for Stage 02:** every direction must be tested against *average* listing photography, not only hero imagery (see the ten questions in §64, question 6).

---

## Blocking: needed before Stage 03 (IA / search / listings)

### Q3. Where does property data come from today?
§55 rightly says not to invent a schema before the source is known. The source also shapes UX, not only schema:

- **Map + list (§34)** needs coordinates per listing. Many CRM/portal feeds only carry community- or building-level location, which collapses map pins onto one point.
- **Filters such as sea view, waterfront, balcony, payment plan and handover year (§32)** only work if agents tag them consistently. A filter backed by sparse data returns misleading zero results, which damages the "clarity + confidence" promise.
- **Sync model:** is the website the system of record, or a mirror of a CRM that also feeds Property Finder and Bayut?

**Need:** the CRM name, a sample export or feed (XML/JSON), field-completeness figures, and update frequency.

### Q4. How large is the active inventory?
Search should be sized to the inventory. With 150 live listings, a 20-dimension filter panel mostly produces empty states, and a map is decoration. With 3,000 it is essential. The brief describes portal-grade search without stating the inventory it serves.

**Need:** live listing counts split by purpose (sale / rent / off-plan) and by community.

### Q5. Why would someone search on alaliah.ae instead of Property Finder or Bayut?
The competitor list in §29 contains only peer brokerages. For search, the real comparison is the portals, which very likely already carry Al Aliah's inventory. Users will judge Al Aliah's search against them, and a smaller brokerage cannot win on inventory breadth or filter depth.

The brief's own answer (§25: expertise, curation, advisory) suggests search should be *differentiated by context*, not by filter count: community knowledge, project/developer data and agent guidance attached to results. This should be settled before the search UX is designed, or the result will be a weaker portal, which is the outcome §25 warns against.

### Q6. Brand red versus error/alert red
A crimson-led system collides with the universal red of form validation, price drops and destructive actions. The color system in Stage 02 must define a separate error color and an error-state convention that does not rely on brand red. It must also check crimson contrast on both light and dark surfaces (WCAG AA: 4.5:1 for body text, 3:1 for large text and UI).

---

## Blocking: needed before Stage 05 (architecture), but it shapes Stage 03

### Q7. Can Framer meet the SEO requirements for property pages?
This is the largest architectural risk in the brief.

§44 requires indexable `/properties/[slug]`, `/projects/[slug]` and filtered landing pages with structured data. §53 and §56 put property data in an external API rendered through Framer code components.

- Pages created from data fetched at runtime by a code component are not separate crawlable routes with server-rendered content and per-page metadata. Framer creates detail routes from **its own CMS collections**.
- Achieving per-listing SEO in Framer therefore means **syncing every listing into Framer CMS** (verify current plan item limits, sync tooling and publish behaviour for inventory that changes daily) or **moving property routes to another stack**.
- A split, such as Framer for the brand site and Next.js/Astro for `/properties/*`, works but needs deliberate routing (reverse proxy on one domain, not a subdomain, to keep SEO authority together) plus a shared design-token source so the two halves don't drift visually.
- Arabic/RTL (§43) has to work in **both** halves.

**Need:** a decision among (a) Framer CMS + sync, (b) Framer + separate property app on the same domain, (c) one code-based stack for everything. Make it after Q3/Q4 are answered, because inventory size and change frequency largely decide it.

### Q8. Natural-language search: parity or differentiation?
§29 notes Emiradia already offers this, so building it gives parity, not differentiation. It also brings per-query LLM cost, latency and failure modes (misparsed prices, unknown community names). The valuable part is the **visible, editable filter chips** produced by the parse (§33), which also works as plain structured search. Recommend shipping structured search with the chip pattern first and adding NL parsing as an input method on top of it.

### Q9. Trust data that can actually be published
§45 forbids invented metrics. Before any trust component is designed, collect: brokerage licence / ORN, agent licence (BRN) numbers, verifiable transaction figures (if any), testimonials with permission, and developer relationships that are formally agreed. Design trust components around data that actually exists, not around placeholders.

---

## Process concern

### Q10. Twenty skill files up front
§59 lists 20 skills. Writing them before the stages that define their content would produce placeholder rules that later agents treat as authoritative, which is the drift §59 is meant to prevent. **Decision taken:** create each skill when its stage is approved (see `decisions.md`, D-003).
