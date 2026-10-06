# Stage 03.1: Information Architecture

**Status:** **approved 2026-10-06** (D-032), revision 3 with the approval adjustments applied. Structure only: no page layouts, no wireframes, no WordPress work.
**Next:** Stage 03.2 (data architecture) waits on Q3 and Q4: the listing source and approximate inventory size.
**Inputs:** master brief §18, §31–45; D-004 (WordPress-first), D-006, D-008, D-031, D-032; `alaliah-design-system` (intensity levels); open questions Q3, Q4, Q5, Q9, Q11, W2, W9, B1.

---

## 0. Assumptions

The IA is approved on these assumptions. Q3 and Q4 are the blockers for Stage 03.2, not for this IA. W2 (multilingual plugin) and Q9 (licence numbers) do not block it either. Each row says what changes if the assumption is wrong.

| # | Assumption | Source | If wrong |
|---|---|---|---|
| A1 | Inventory comes from a CRM or portal feed with persistent IDs; WordPress is not the record (Q3) | Staging audit | Manual entry only: drop importer-dependent features (live counts, auto-expiry); the IA holds |
| A2 | Hundreds, not tens of thousands, of active listings (Q4) | Business size | Larger: indexable landing thresholds and search storage change (W4, D-006); the IA holds |
| A3 | Abu Dhabi leads for now; Dubai is an active area. Final weighting depends on B1 | D-032; inventory 11 of 14 Abu Dhabi | If the weighting changes: the Area model already supports it; only ordering, defaults and the home page change |
| A4 | English first, Arabic-ready by construction, in subdirectory `/ar/`. Plugin choice (WPML or Polylang) deferred to implementation planning (W2) | Brief §43, D-032 | Multisite or domain per language: URL prefix changes; slugs and templates do not |
| A5 | Listing coordinates arrive at least at community level (Q3) | Staging has none usable | None at all: maps run at community level only (already the fallback) |
| A6 | Licence, ORN and BRN numbers are required verified content for implementation, not an IA blocker (Q9). No genuine reviews or external developer ratings exist yet (Q11) | Audit, D-032 | When verified, they fill the modules defined here; until then those modules are absent, not empty |

## 1. Navigation model (D-031, D-032)

Property intent comes first so it stays immediately accessible. About Us sits last by position, not by importance: the advisory brand is carried by the Areas, Developers and Off-plan content, not by menu order.

### Primary navigation
| Order | Label | Opens | Purpose |
|---|---|---|---|
| 1 | **Buy** | Panel: property types, top Abu Dhabi communities, "Ready to move in", "Commercial for sale", **"Sell your property"** | Sale search; sellers enter here too |
| 2 | **Rent** | Panel: property types, top communities, "Furnished", "Commercial for rent", **"Lease your property"**, **"Property management"** | Rental search; landlords enter here too |
| 3 | **Off-plan** | Panel: projects by handover year, featured developers, **"Investing in off-plan"** (the Invest guides) | Projects and investors |
| 4 | **Areas** | Panel with two columns: **Abu Dhabi** first (communities with live listing counts), then **Dubai** (communities with live inventory) | Place-led discovery |
| 5 | **Developers** | Link to the archive, titled "All Developers" | Developer discovery |
| 6 | **About Us** | Panel: About Al Aliah, Our team, **Services** (Sell, Lease, **Property management**), Insights, Careers (only if real) | Company, people, services and advice |

**Header CTA: Contact.** A solid **ink** button, global and always visible, including on mobile. Crimson stays reserved for each page's contextual primary action ("Search", "Request a viewing") and for selected and active states. Contact opens `/contact/` with phone, WhatsApp, email and an enquiry form, in that order.

**Utility bar:** shortlist (count), language (العربية), phone and WhatsApp, and "List your property" as an ink outline.

**Property management stays on conversion paths.** It appears in About Us › Services, in the footer, in the Rent panel next to "Lease your property", and inside the landlord journey (the Lease page and the "List your property" flow, which offers management as an option).

**Where the former top-level items went:**
| Former item | Now reached from |
|---|---|
| Communities | **Areas**, as the community level inside each emirate |
| Invest | Off-plan panel ("Investing in off-plan") and the footer; `/invest/` stays a hub |
| Owners (Sell, Lease, Property management) | Buy and Rent panels (by intent), About Us › Services, the footer, utility "List your property" |
| Insights | About Us panel, the footer, and related-insight modules on Area, Project and Developer pages |

**Mobile:** one menu sheet in the same order, with search as its first element and Contact pinned in the header bar beside the menu button. Arabic labels need a native editor's sign-off; drafts for length testing: شراء، إيجار، على الخارطة، المناطق، المطورون، من نحن.

## 2. Sitemap and templates

The intensity level comes from `alaliah-design-system`. Phase 1 is launch; Phase 2 is after launch.

```
Home ............................................. Immersive
├─ Buy        /properties-for-sale/ .............. Functional  (list + map)
│   └─ landings /properties-for-sale/{location}/{type}/
├─ Rent       /properties-for-rent/ .............. Functional
│   └─ landings /properties-for-rent/{location}/{type}/
├─ Off-plan   /off-plan/ ......................... Functional  (projects first, units second)
│   ├─ Project  /projects/{slug}/ ................ Editorial
│   └─ Invest   /invest/ › Guide /invest/{slug}/ . Editorial
├─ Areas      /areas/ ............................ Editorial   (map-led, Abu Dhabi first)
│   ├─ Emirate  /areas/abu-dhabi/  /areas/dubai/ . Editorial
│   └─ Community /areas/{emirate}/{community}/ ... Immersive story → Editorial body → listings
├─ Developers /developers/ "All Developers" ...... Functional  (directory)
│   └─ Developer /developers/{slug}/ ............. Editorial
├─ About Us   /about/ ............................ Editorial
│   ├─ Team   /team/ › Agent /team/{slug}/ ....... Editorial
│   ├─ Services: Sell /services/sell/ · Lease /services/lease/
│   │           Property management /services/property-management/ ... Editorial
│   ├─ Insights /insights/ › Article /insights/{slug}/ ............. Editorial
│   └─ Careers /careers/ (only if real) .......... Editorial
├─ Property   /property/{slug}-{ref}/ ............ Editorial   (Room index when photos are tagged)
├─ Contact    /contact/ .......................... Functional  (header CTA)
├─ List your property /list-your-property/ ....... Functional  (stepped flow)
├─ Shortlist  /shortlist/ ........................ Functional  (noindex; shareable link)
└─ Legal, 404, no-results ........................ Functional

Phase 2: Compare, saved searches and alerts (accounts and consent), mortgage and ROI calculators,
market reports, natural-language search (D-008).
```

**No `/properties/` index:** a mixed sale-and-rent list serves no real task and splits search equity. Buy and Rent are the two entry indexes. Off-plan is separate because projects behave differently (units, payment plans, handover).

## 3. Entities and relationships

Four core entities stay separate: **Developer, Project, Property, Area.** Agent and Insight support them.

```
Developer ──1:n──▶ Project ──1:n──▶ Property ──n:1──▶ Area (community › emirate)
    │                 │                                   ▲
    │                 └──────────── n:1 ──────────────────┤
    └─ (resale) ──1:n──▶ Property (no project on record) ─┘
```

| Relationship | Stored or derived | Rule |
|---|---|---|
| Project → Developer | Stored, required | Every project has exactly one developer (joint ventures: a primary developer plus a "with" credit) |
| Project → Area | Stored, required | At community level |
| Property → Project | Stored, optional | Off-plan units always; resale only when the building or community project is on record |
| Property → Developer | **Derived** from the project; stored only when there is no project | One source of truth: no property can contradict its project's developer |
| Property → Area | Stored, required | The most specific location term (community or building) |
| Developer → Areas | **Derived** from its projects and properties | Never typed by hand, so it cannot drift |
| Area → Developers, Projects, Properties | Derived (reverse queries) | |

**Reverse links are mandatory.** A property always links up to its project (if any), its developer and its area; a project links to its developer and area. A visitor can climb from any listing to the developer and the place.

**Area model:** a hierarchical location taxonomy (emirate › community › sub-community or building) is the join used by search, maps and landing URLs. Each emirate- and community-level term is paired with an **Area post** that holds the editorial story. Listings attach to the term; stories live on the post.

```
property (CPT) ── location (Area term) ── purpose (sale | rent) ── status (ready | off-plan)
     │            category (residential | commercial) ── type (villa, apartment, townhouse, …)
     ├─ project (optional) ── developer (derived)
     ├─ developer (only when no project)
     ├─ agent
     └─ media: per-photo room tag, render flag, tier
project (CPT) ── developer, location, unit types, payment plan, handover, brochure
developer (CPT) ── logo, about, source references, review source (optional, Q11)
area (CPT) ⇄ location term (emirate or community level)
agent (CPT) ── languages, areas, specialisms, licence (BRN)
insight (CPT) ── topic; related areas, projects, developers
```

- **Facets are taxonomies; ranges are indexed numbers** (price, beds, baths, size, coordinates) in a denormalised index table. Storage is decided in 03.3 (W4).
- **Legacy (W9):** `trigon-alaliah-core` registers its own post types and migrates WPResidence data. Staging holds 17 `estate_developer` records and an existing "All Developers" page (twice). The 17 records are migrated only after each is checked to be a real developer with an approved logo. Old URLs (`/properties/…`, `/agents/…`, `/estate_developer/…`) get 301s.

## 4. Developer pages

### Archive: "All Developers" (`/developers/`, Functional)
- A directory of developers **Al Aliah works with or lists**, alphabetical, with a filter by emirate and area.
- **Each entry:**
  - logo and name;
  - areas;
  - "Projects with Al Aliah: n" and "Homes listed: n", **derived** from Project and Property records and labelled as such. Neither the counts nor the areas are ever typed by hand.
- **Never shown:** company-wide project counts, units delivered or founding years, unless sourced on the developer page.
- A developer with no live projects or listings stays reachable, marked "No current listings", for SEO continuity.

### Developer page (`/developers/{slug}/`, Editorial)
Modules in reading order. A module with no legitimate data is **omitted**, never shown empty or as a placeholder.

| Module | Content | Data rule |
|---|---|---|
| Identity | Logo, name, emirates active (derived from projects and properties) | Logo supplied or approved by the developer |
| About | 80–150 words | Facts drawn from the developer's official material, with the source recorded in admin; written in Al Aliah's voice; no superlatives |
| Rating and reviews | Score, review count, source name, date retrieved, link | **Only from an independent external source**, clearly attributed (see below). Omitted when none exists |
| Projects | Cards of this developer's projects, newest handover first | Live from Project records |
| Homes listed | Site select cards filtered to this developer | Live from Property records (derived developer) |
| Areas | Areas where this developer has projects or listings, with a mini map | Derived |
| Insights | Articles tagged to this developer | Shown only when at least one exists |
| Contact | "Ask an advisor about {developer}" | A lead with the developer as context |

### Ratings and reviews: what counts as legitimate (D-032, Q11)
- **Allowed:** ratings or reviews from a legitimate **independent external** source, clearly attributed: source name, score, review count, retrieval date and a link, under that source's licence terms. An official regulator rating, if one is published, qualifies.
- **Not allowed:**
  - any Al Aliah numerical rating of a developer;
  - unattributed stars;
  - reviews copied without licence;
  - scores computed from a handful of comments.
- **Stored with each rating:** source, source URL, score, review count, retrieved date, and the **refresh policy** for that source.
- **Freshness is set per source, not by one fixed rule:**
  - a source with a stable API or published update cycle is refreshed on that cycle;
  - a manually checked source records its check date and is suppressed when an editor can no longer verify it.

  Whatever the source, a rating whose source can no longer be reached or confirmed is hidden, not shown stale.
- **No legitimate source:** the module is omitted and the page reads complete without it. At launch, assume none (A6).

## 5. URL model

| Entity | Pattern | Example | Notes |
|---|---|---|---|
| Sale results | `/properties-for-sale/` | | Keyword-bearing |
| Location landing | `/properties-for-sale/{location}/` | `/properties-for-sale/yas-island/` | `{location}` is the most specific location slug, unique site-wide; emirate slugs (`abu-dhabi`, `dubai`) work too |
| Location + type | `/properties-for-sale/{location}/{type}/` | `/properties-for-rent/al-reem-island/apartments/` | Indexable only above the threshold in §6 |
| Type landing | `/properties-for-sale/{type}/` | `/properties-for-sale/villas/` | Type and location slugs never collide (reserved list) |
| Commercial | `/properties-for-rent/commercial/{location?}/` | | Category acts as a type |
| Property | `/property/{slug}-{ref}/` | `/property/five-bedroom-villa-yas-island-31521/` | `{ref}` is the persistent source ID, so a title change never breaks the link |
| Project | `/projects/{slug}/` | `/projects/{project-name}/` | Flat: a project's developer or area can change without changing its URL |
| Areas | `/areas/`, `/areas/{emirate}/`, `/areas/{emirate}/{community}/` | `/areas/abu-dhabi/al-raha/` | Nested: the emirate is part of the identity, and readers see where they are |
| Developer | `/developers/{slug}/` | `/developers/{developer-name}/` | Archive title "All Developers" |
| Agent | `/team/{slug}/` | | |
| Services | `/services/{slug}/` | `/services/property-management/` | |
| Insight | `/insights/{slug}/` | | Topics as `/insights/topic/{slug}/` |
| Arabic | `/ar/` + the same path | `/ar/areas/abu-dhabi/al-raha/` | English slugs kept under `/ar/`; revisit only with search data |

- **Filters beyond location and type** (price, beds, features, sort, page) are query parameters. Pages with them are `noindex, follow`, with a canonical to the nearest path URL.
- **Expired listings** stay live as "No longer available" with similar homes for 90 days (`noindex`), then 301 to their location-and-type landing.

## 6. Search: entry points, facets and indexation

**Entry points:**
- home hero search (Buy, Rent, Off-plan tabs);
- header search;
- every results page;
- an Area page's "Homes in {area}";
- a Developer page's "Homes listed";
- the Areas map;
- project pages (units).

**Location field:** one autocomplete across areas, buildings, projects and developers. Results are grouped by kind; within areas, Abu Dhabi comes first.

**Facet tiers:**
| Tier | Facets | Shown |
|---|---|---|
| Primary | Purpose, location, type, bedrooms, price | Always (filter bar, mobile sticky) |
| Secondary | Bathrooms, size, furnished, completion, handover year, **developer**, payment plan | "More filters" sheet |
| Feature | Sea view, waterfront, balcony, pool, parking, maid's room | Only when **at least 80% of active listings** carry the field (Q3) |

**Results:**
- desktop is list plus map with two-way sync (the approved Site select model);
- mobile is card-first with a floating Map button and a bottom-sheet filter;
- editable filter chips;
- sort by newest, price or size;
- an honest empty state.

**Indexation:** a landing combination is indexable only with **3 or more active listings**; below that it renders as `noindex` and links up a level.

## 7. Internal-linking spine

**Developer → Projects → Properties → Areas**, with every reverse link:

| Template | Links down | Links up and across |
|---|---|---|
| Developer | Its projects, its listed homes | Its areas, related insights |
| Project | Its available units (properties) | Its developer, its area, related insights |
| Property | Similar homes (same area and type) | Its project, its developer, its area, its agent, the area-and-type landing |
| Area (community) | Live listings (Buy and Rent landings), projects in it | Its emirate, developers active there, nearby communities, insights |
| Area (emirate) | Its communities | Developers active there |
| Agent | Their listings | Their areas |
| Insight | Every area, project or developer it names | |

**Breadcrumbs follow the place:** Home › Buy › Abu Dhabi › Yas Island › Villas. On a property: Home › Areas › Abu Dhabi › Yas Island › {property}.
**Structured data:**
- `RealEstateListing` with `Offer` on property;
- `Place` on area;
- `Organization` on developer, with `aggregateRating` **only** when a legitimate source exists;
- `RealEstateAgent` site-wide;
- `BreadcrumbList` everywhere;
- `Article` on insights.

## 8. Key journeys (task flows, not layouts)

| Audience | Journey | Path | Conversion point |
|---|---|---|---|
| **Tenant** (speed first) | Rent a two-bed this month | Home search → Rent results → Property → WhatsApp or viewing request | Viewing request with listing ref |
| **Buyer** | Choose between two villas | Buy results → Property → shortlist → Area page → Property | Viewing request; shortlist shared |
| **Investor** | Assess off-plan by a known developer | Developers → Developer → Project → Investing in off-plan → Project | Brochure request or advisor call |
| **International buyer** | Understand where to buy | Areas › Abu Dhabi → Community → Project or Property, with Invest guides linked from Off-plan | Advisor consultation |
| **Seller or landlord** | Get a valuation and an agent | Buy › Sell your property, or Rent › Lease your property → List your property (stepped flow) | Owner lead with property details |
| **Commercial client** | Find an office to lease | Rent › Commercial → results → Property | Enquiry routed to the commercial agent |
| **Anyone** | Talk to someone now | Header Contact → phone, WhatsApp, email or form | Contact lead with page context |

**Lead types:**
- viewing request;
- WhatsApp;
- call;
- project brochure or enquiry;
- developer enquiry;
- list your property;
- valuation;
- property management enquiry;
- general contact.

Each carries its context (listing, project or developer ref, agent, page). Storage is W7.

## 9. Trust placement (substantiated data only, Q9 and Q11)
- Brokerage licence and ORN: in the footer and on Contact and About Us. Required verified content for implementation; not an IA blocker (D-032).
- Agent BRN and languages: on agent cards and listings.
- Developer relationships ("Authorised agent for …"): only where formally agreed and documented.
- Developer ratings: only per §4; never an Al Aliah score.
- Testimonials: none until genuine and permitted. The 17 stored demo reviews are never published.
- Metrics: only when verified. Live counts from our own feed ("Homes listed: 12") are allowed, because they are true and labelled.

## 10. Ten-question check (brief §64)

| Decision | Risk the check caught | Answer |
|---|---|---|
| Property intent first, About Us last | Could be read as weakening the advisory brand (question 1) | The advisory brand lives in Areas, Developers and Off-plan content, not menu position (D-032) |
| Dubai under Areas | Dilutes the Abu Dhabi position or drifts into Dubai-luxury clichés (questions 1–2) | Abu Dhabi leads for now; Dubai appears where contextually relevant, never as skyline or luxury cliché; final weighting per B1 (D-032) |
| Owners, Invest and Communities leave the top level | Sellers, landlords and investors lose an entry point (question 3) | Placed by intent in the Buy, Rent and Off-plan panels, plus "List your property" in the utility bar |
| Contact as header CTA | Competes with each page's primary action | Ink, not crimson |
| Developer ratings | Invented or conflicted data (question 4, never invent) | Independent external source only, attributed, freshness per source; omitted otherwise |
| Derived developer on properties | Data drift between project and property | One source of truth; stored only when there is no project |
| Path-based landings | Thousands of thin pages (question 8) | Indexable only with 3+ listings |

## 11. Stage 03 plan after this
1. **03.2 Content model and data:** fields per entity, importer mapping, developer sources, media room tags, QA flags. Needs a Q3 sample export.
2. **03.3 Search and listings:** search UX states, facet behaviour, storage (W4), interactive layer (W1).
3. **03.4 Template structures:** module order per template at its intensity level (structure diagrams, not visual layouts), editor approach (W3).
4. **03.5 Lead flows and forms:** steps, validation, routing (W7).

## 12. Approval record (D-032)
Approved, with these adjustments applied in this revision:
- **Navigation:** Buy, Rent, Off-plan, Areas, Developers, About Us; Contact as a separate ink header CTA.
- **Market positioning:** Abu Dhabi leads for now, and Dubai may appear where contextually relevant. Final weighting depends on B1.
- **Developers:** the Developer → Projects → Properties → Areas model with reverse linking. Archive counts and areas are derived.
- **Ratings:** external, attributed and stored with source, count and retrieval date; freshness per source; no Al Aliah ratings.
- **Property management:** in About Us › Services, the footer and the landlord journeys.
- **Multilingual:** English and Arabic-ready; plugin choice deferred to implementation planning (W2 does not block 03.1).
- **Licence information:** required verified content later; not an IA blocker.

**Blockers before Stage 03.2 (data architecture):**
- **Q3:** the listing source. CRM or feed name, plus a sample export.
- **Q4:** approximate inventory size, by purpose and area.

Stage 03.2 does not start until both are known.
