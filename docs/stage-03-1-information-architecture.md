# Stage 03.1: Information Architecture

**Status:** presented 2026-10-06 for approval. First Stage 03 deliverable. Structure only: no page layouts, no wireframes, no WordPress work.
**Inputs:** master brief §18, §31–45; D-004 (WordPress-first), D-006, D-008; `alaliah-design-system` (intensity levels); open questions Q3, Q4, Q5, Q9, W2, W9, B1.

---

## 0. Assumptions (Stage 03 is formally blocked on client inputs)

The open-questions log lists Q3, Q4, W2 and B1 as blocking IA. Rather than stall, this IA rests on stated assumptions. Each row says what changes if the assumption is wrong.

| # | Assumption | Source | If wrong |
|---|---|---|---|
| A1 | Inventory comes from a CRM or portal feed with persistent IDs; WordPress is not the record (Q3) | Staging audit | Manual entry only: drop importer-dependent features (live counts per facet, auto-expiry); the IA holds |
| A2 | Hundreds, not tens of thousands, of active listings (Q4) | Business size | Larger: indexable landing thresholds and search storage change (W4, D-006); the IA holds |
| A3 | Abu Dhabi is the core; Dubai off-plan is a secondary line (B1) | Positioning §24, inventory 11/14 Abu Dhabi | If Dubai is core: add an emirate level to navigation and to landing URLs (the location model already supports it) |
| A4 | English first, Arabic later, in subdirectory `/ar/` (W2) | Brief §43 | Multisite or domain per language: URL prefix changes; slugs and templates do not |
| A5 | Listing coordinates arrive at least at community level (Q3) | Staging has none usable | None at all: the map is community-level only (already the fallback) |
| A6 | No verified trust metrics at launch (Q9) | Audit | When verified, they slot into the trust blocks defined here |

## 1. Navigation model

Navigation leads with **intent**, then **place**, then **advice**: the order a buyer or tenant thinks in, and the order that separates Al Aliah from a portal.

### Primary navigation (six items)
| Item | Opens | Purpose |
|---|---|---|
| **Buy** | Panel: property types, top communities, "Ready to move in", "Commercial for sale" | Sale search |
| **Rent** | Panel: property types, top communities, "Furnished", "Commercial for rent" | Rental search |
| **Off-plan** | Panel: projects, developers, "Handover by year", "How off-plan works" | Projects and investors |
| **Communities** | Panel: map of communities with live listing counts | Place-led discovery, Al Aliah's advantage |
| **Invest** | Hub page | International and investor guidance |
| **Owners** | Panel: Sell, Lease, Property management, Valuation request | Sellers and landlords |

**Utility bar:**
- shortlist (count);
- language (العربية);
- phone and WhatsApp;
- "List your property", an ink outline. The crimson fill is reserved for each page's primary action.

**Secondary (footer and "More"):** Insights, Team, Developers, About, Contact, Careers (if real), legal.

**Commercial** is a category facet inside Buy and Rent, with its own landing pages. It is not a seventh top-level item. Commercial clients get direct links in both panels.

**Mobile:** a single menu sheet in the same order, with search as the first element. Draft Arabic labels (شراء، إيجار، على الخارطة، المجتمعات، الاستثمار، الملاك) fit the same bar. They are working drafts for length testing and need a native editor's sign-off.

## 2. Sitemap and templates

The intensity level comes from `alaliah-design-system`. Phase 1 is launch; Phase 2 is after launch.

```
Home ............................................. Immersive
├─ Buy        /properties-for-sale/ .............. Functional  (search results, list + map)
│   └─ landing combos /properties-for-sale/{location}/{type}/
├─ Rent       /properties-for-rent/ .............. Functional
│   └─ landing combos /properties-for-rent/{location}/{type}/
├─ Off-plan   /off-plan/ ......................... Functional  (projects + units)
├─ Property   /property/{slug}-{ref}/ ............ Editorial   (Room index when photos are tagged)
├─ Projects   /projects/ ......................... Functional
│   └─ Project /projects/{slug}/ ................. Editorial
├─ Developers  /developers/ ...................... Editorial
│   └─ Developer /developers/{slug}/ ............. Editorial
├─ Communities /communities/ ..................... Editorial   (map-led index)
│   └─ Community /communities/{slug}/ ............ Immersive story → Editorial body → listings
├─ Invest     /invest/ ........................... Editorial
│   └─ Guide  /invest/{slug}/ .................... Editorial   (ownership, process, payment plans)
├─ Owners     /owners/ ........................... Editorial
│   ├─ Sell   /owners/sell/ ...................... Editorial
│   ├─ Lease  /owners/lease/ ..................... Editorial
│   ├─ Property management /owners/property-management/ ... Editorial
│   └─ List your property /list-your-property/ .... Functional  (stepped flow)
├─ Insights   /insights/ ......................... Editorial
│   └─ Article /insights/{slug}/ ................. Editorial
├─ Team       /team/ ............................. Editorial
│   └─ Agent  /team/{slug}/ ...................... Editorial
├─ About /about/ · Contact /contact/ ............. Editorial / Functional
├─ Shortlist  /shortlist/ ........................ Functional  (noindex; shareable link)
└─ Legal, 404, no-results ........................ Functional

Phase 2: Compare, saved searches and alerts (needs accounts and consent), mortgage and ROI calculators,
market reports, natural-language search (D-008).
```

**Why there is no `/properties/` index:** a mixed sale-and-rent list serves no real task, and it splits search equity. Buy and Rent are the two entry indexes. Off-plan is its own, because projects behave differently (units, payment plans, handover).

## 3. URL model

| Entity | Pattern | Example | Notes |
|---|---|---|---|
| Sale results | `/properties-for-sale/` | | Keyword-bearing, as the brief proposes; "abu-dhabi" is implied by the brand and not repeated |
| Location landing | `/properties-for-sale/{location}/` | `/properties-for-sale/yas-island/` | `{location}` is the most specific location slug, unique site-wide |
| Location + type | `/properties-for-sale/{location}/{type}/` | `/properties-for-rent/al-reem-island/apartments/` | Indexable only above the threshold in §5 |
| Type landing | `/properties-for-sale/{type}/` | `/properties-for-sale/villas/` | Type slugs and location slugs never collide (reserved list) |
| Commercial | `/properties-for-rent/commercial/{location?}/` | | Category acts as a type |
| Property | `/property/{slug}-{ref}/` | `/property/five-bedroom-villa-yas-island-31521/` | Slug from the structured title; `{ref}` is the persistent source ID, so a title change never breaks the link |
| Project | `/projects/{slug}/` | `/projects/{project-name}/` | No projects exist on staging yet |
| Community | `/communities/{slug}/` | `/communities/al-raha/` | |
| Developer | `/developers/{slug}/` | `/developers/aldar/` | |
| Agent | `/team/{slug}/` | | |
| Insight | `/insights/{slug}/` | | Topics as `/insights/topic/{slug}/` |
| Arabic | `/ar/` + the same path | `/ar/communities/al-raha/` | English slugs kept under `/ar/`: stable, shareable, importer-friendly. Revisit only with search data |

**Filters beyond location and type** (price, beds, features, sort, page) are query parameters. Pages with them are `noindex, follow`, with a canonical to the nearest path URL.

**Expired listings:** the URL stays live with a "No longer available" state and similar homes for 90 days, set to `noindex`. After that it 301-redirects to its location-and-type landing page. Listings are never silently deleted.

## 4. Entity model (structure; fields come in 03.2)

```
community (CPT) ⇄ location (taxonomy, hierarchical: emirate › community › sub-community/building)
   one community post per community-level term; listings attach to the term, editorial lives on the post

property (CPT) ── location ── purpose (sale | rent) ── status (ready | off-plan)
     │            category (residential | commercial) ── type (villa, apartment, townhouse, …)
     ├─ project (optional) ── developer
     ├─ agent
     └─ media: per-photo room tag, render flag, tier

project (CPT) ── developer, location, unit types, payment plan, handover, brochure
developer (CPT) ── projects
agent (CPT) ── languages, communities, specialisms, licence (BRN)
insight (CPT) ── topic; related community / project / developer
```

- **Facets are taxonomies; ranges are indexed numbers** (price, beds, baths, area, coordinates) in a denormalised index table. Storage is decided in 03.3 (W4), not `postmeta` range queries.
- **The location term is the join** between search, map, community pages and landing URLs. This one choice makes "homes in Al Raha", the community map and `/properties-for-sale/al-raha/` the same data.
- **Legacy (W9):** `trigon-alaliah-core` registers its own post types and migrates WPResidence data. Old URLs (`/properties/…`, `/agents/…`, `/estate_developer/…`) get 301s. Production is `noindex` (P1), so little equity is at risk, but the map is still required.

## 5. Search: entry points, facets and indexation

**Entry points:**
- home hero search (intent tabs: Buy, Rent, Off-plan);
- header search;
- every results page's filter bar;
- a community page's "Homes in {community}";
- the communities map;
- project pages (units).

**Location field:** one autocomplete across communities, buildings, projects and developers, grouped by kind.

**Facet tiers:**
| Tier | Facets | Shown |
|---|---|---|
| Primary | Purpose, location, type, bedrooms, price | Always (filter bar, mobile sticky) |
| Secondary | Bathrooms, area, furnished, completion, handover year, developer, payment plan | "More filters" sheet |
| Feature | Sea view, waterfront, balcony, pool, parking, maid's room | Only when **at least 80% of active listings** carry the field (Q3), so sparse data never fakes a zero result |

**Results:**
- desktop is list plus map with two-way sync (the approved Site select model);
- mobile is card-first with a floating Map button and a bottom-sheet filter;
- sort options: newest, price (both directions), and area;
- editable filter chips;
- an honest empty state that names how to widen the search.

**Indexation:** a landing combination (purpose × location × type) is indexable only with **3 or more active listings**. Below that it renders, but as `noindex`, and links up a level. This stops thin pages at scale (brief §64, question 8).

## 6. Internal-linking spine

The brief's chain, **Community → Project → Property → Developer → Insight**, made two-way:

| Template | Must link to |
|---|---|
| Property | Its community, project and developer (when present), agent, similar homes (same location and type), the location+type landing |
| Project | Developer, community, available units, related insights |
| Community | Live listings (Buy and Rent landings), projects in it, nearby communities, insights tagged to it |
| Developer | Projects, communities, available Al Aliah inventory |
| Agent | Their listings, their communities |
| Insight | Every community, project or developer it names |

Breadcrumbs follow the location hierarchy (Home › Buy › Yas Island › Villas). Structured data: `RealEstateListing`/`Offer` on property, `Place` on community, `Organization` and `RealEstateAgent` site-wide, `BreadcrumbList` everywhere, `Article` on insights.

## 7. Key journeys (task flows, not layouts)

| Audience | Journey | Templates in order | Conversion point |
|---|---|---|---|
| **Tenant** (speed first) | Rent a two-bed near work this month | Home search → Rent results (Functional) → Property → WhatsApp or viewing request | Viewing request with listing ref |
| **Buyer** | Choose between two villas | Buy results → Property (Room index) → shortlist → Community page → Property | Viewing request; shortlist shared with agent |
| **Investor** | Assess off-plan in Abu Dhabi | Off-plan → Project → Developer → Invest guide (payment plans) → Project | Brochure request or advisor call |
| **International buyer** | Understand whether and where to buy | Invest hub → Guide (ownership, process) → Communities → Project or Property | Advisor consultation |
| **Seller or landlord** | Get a valuation and an agent | Owners → Sell or Lease → List your property (stepped: purpose › location › type › beds › size › price › timeline › contact) | Owner lead with property details |
| **Commercial client** | Find an office to lease | Rent › Commercial → results → Property | Enquiry routed to the commercial agent |

**Lead types:**
- viewing request;
- WhatsApp;
- call;
- project brochure or enquiry;
- list your property;
- valuation;
- property management enquiry;
- general contact.

Each carries context (listing or project ref, agent, page) so nobody has to retype it. Where leads are stored is W7.

## 8. Trust placement (only substantiated data, Q9)
- Brokerage licence and ORN: in the footer and on Contact.
- Agent BRN and languages: on agent cards and listings.
- Developer relationships: on developer pages, only where formally agreed.
- Testimonials: none until genuine and permitted. The 17 stored demo reviews are never published.
- Metrics (transactions, years, listings): only when verified. A live listing count from the feed is allowed, because it is real.

## 9. Ten-question check (brief §64) on the main IA decisions

| Decision | Risk the check caught | Answer |
|---|---|---|
| Intent-first nav with Communities and Invest at top level | Seven items would crowd Arabic and mobile | Commercial folded into Buy and Rent; six items |
| Location term as the join | A community without a CPT post has no story page | Every community-level term gets a post, even if short; thin ones are `noindex` until written (Q5) |
| Path-based landings | Thousands of thin combinations | Indexable only with 3+ listings |
| English slugs under `/ar/` | Weaker Arabic-keyword URLs | Accepted for stability; revisit with data |
| Expired listings kept 90 days | Stale pages | `noindex`, clearly marked, similar homes, then 301 |

## 10. Stage 03 plan after this
1. **03.2 Content model and data:** fields per entity, importer mapping, media room tags, QA flags. Needs a Q3 sample export.
2. **03.3 Search and listings:** search UX states, facet behaviour, storage (W4), interactive layer (W1).
3. **03.4 Template structures:** module order per template at its intensity level (structure diagrams, not visual layouts), editor approach (W3).
4. **03.5 Lead flows and forms:** steps, validation, routing (W7).

## 11. Approval requested
- The six-item navigation and the utility bar.
- The sitemap and the template-to-intensity mapping.
- The URL model, including `/property/{slug}-{ref}/`, English slugs under `/ar/`, and the 90-day expiry rule.
- The location taxonomy as the join, paired with community posts.
- Facet tiers with the 80% coverage rule, and the 3-listing indexation threshold.

**Client inputs that would firm this up:**
- Q3: CRM or feed name plus a sample export.
- Q4: active listing counts by purpose and community.
- B1: is Dubai core?
- W2: multilingual plugin preference.
- Q9: licence, ORN and BRN numbers.
