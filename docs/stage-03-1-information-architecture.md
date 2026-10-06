# Stage 03.1: Information Architecture

**Status:** revision 2, presented 2026-10-06 for approval. Reworked around the client's preferred primary navigation (D-031). Structure only: no page layouts, no wireframes, no WordPress work.
**Inputs:** master brief §18, §31–45; D-004 (WordPress-first), D-006, D-008, D-031; `alaliah-design-system` (intensity levels); open questions Q3, Q4, Q5, Q9, Q11, W2, W9, B1.

---

## 0. Assumptions (Stage 03 is formally blocked on client inputs)

The open-questions log lists Q3, Q4 and W2 as blocking IA. Rather than stall, this IA rests on stated assumptions. Each row says what changes if the assumption is wrong.

| # | Assumption | Source | If wrong |
|---|---|---|---|
| A1 | Inventory comes from a CRM or portal feed with persistent IDs; WordPress is not the record (Q3) | Staging audit | Manual entry only: drop importer-dependent features (live counts, auto-expiry); the IA holds |
| A2 | Hundreds, not tens of thousands, of active listings (Q4) | Business size | Larger: indexable landing thresholds and search storage change (W4, D-006); the IA holds |
| A3 | Abu Dhabi leads; Dubai is a real but secondary line (B1, partly answered by D-031) | Navigation instruction; inventory 11 of 14 Abu Dhabi | If Dubai becomes equal: the Area model already supports it; only ordering and the home page change |
| A4 | English first, Arabic later, in subdirectory `/ar/` (W2) | Brief §43 | Multisite or domain per language: URL prefix changes; slugs and templates do not |
| A5 | Listing coordinates arrive at least at community level (Q3) | Staging has none usable | None at all: maps run at community level only (already the fallback) |
| A6 | No verified trust data at launch: no licence numbers on file, no genuine reviews, no third-party developer ratings (Q9, Q11) | Audit | When verified, they fill the modules defined here; until then those modules are absent, not empty |

## 1. Navigation model (D-031)

### Primary navigation
| Order | Label | Opens | Purpose |
|---|---|---|---|
| 1 | **About Us** | Panel: About Al Aliah, Our team, Services (Sell, Lease, Property management), Insights, Careers (only if real) | Company, people, services and advice |
| 2 | **Buy** | Panel: property types, top Abu Dhabi communities, "Ready to move in", "Commercial for sale", **"Sell your property"** | Sale search; sellers enter here too |
| 3 | **Rent** | Panel: property types, top communities, "Furnished", "Commercial for rent", **"Lease your property"**, **"Property management"** | Rental search; landlords enter here too |
| 4 | **Off-plan** | Panel: projects by handover year, featured developers, **"Investing in off-plan"** (the Invest guides) | Projects and investors |
| 5 | **Areas** | Panel with two columns: **Abu Dhabi** (communities with live listing counts) and **Dubai** (communities where Al Aliah has inventory) | Place-led discovery |
| 6 | **Developers** | Link to the archive, titled "All Developers" | Developer discovery |

**Header CTA: Contact.** A solid **ink** button, always visible, including on mobile. It is not crimson: the design system allows one crimson fill per view, and that belongs to the page's primary action (the hero search, "Request a viewing"). Two crimson fills in one view would weaken both. Contact opens `/contact/`, which offers phone, WhatsApp, email and an enquiry form, in that order.

**Utility bar:** shortlist (count), language (العربية), phone and WhatsApp, and "List your property" as an ink outline.

**Where the removed items went:**
| Former top-level item | Now reached from |
|---|---|
| Communities | **Areas**, as the community level inside each emirate |
| Invest | Off-plan panel ("Investing in off-plan") and the footer; `/invest/` stays a hub |
| Owners (Sell, Lease, Property management) | Buy and Rent panels (by intent), About Us › Services, utility "List your property" |
| Insights | About Us panel, the footer, and related-insight modules on Area, Project and Developer pages |

**Order: one recommendation, not applied.** The order above is the client's. Putting About Us first is the conventional agency pattern that the brief moves away from (§3–4: "a property advisory and discovery brand, not an agency"), and in English a user's eye lands on the first items. Recommended alternative: **Buy, Rent, Off-plan, Areas, Developers, About Us**. Both work technically; this is a positioning choice for the client.

**Mobile:** one menu sheet in the same order, with search as its first element and Contact pinned in the header bar beside the menu button. Arabic labels need a native editor's sign-off; drafts for length testing: من نحن، شراء، إيجار، على الخارطة، المناطق، المطورون.

## 2. Sitemap and templates

The intensity level comes from `alaliah-design-system`. Phase 1 is launch; Phase 2 is after launch.

```
Home ............................................. Immersive
├─ About Us   /about/ ............................ Editorial
│   ├─ Team   /team/ › Agent /team/{slug}/ ....... Editorial
│   ├─ Services: Sell /services/sell/ · Lease /services/lease/
│   │           Property management /services/property-management/ ... Editorial
│   ├─ Insights /insights/ › Article /insights/{slug}/ ............. Editorial
│   └─ Careers /careers/ (only if real) .......... Editorial
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
  - "Projects with Al Aliah: n" and "Homes listed: n", counted live from our own data and labelled as such.
- **Never shown:** company-wide project counts, units delivered or founding years, unless sourced on the developer page.
- A developer with no live projects or listings stays reachable, marked "No current listings", for SEO continuity.

### Developer page (`/developers/{slug}/`, Editorial)
Modules in reading order. A module with no legitimate data is **omitted**, never shown empty or as a placeholder.

| Module | Content | Data rule |
|---|---|---|
| Identity | Logo, name, emirates active (from our data) | Logo supplied or approved by the developer |
| About | 80–150 words | Facts drawn from the developer's official material, with the source recorded in admin; written in Al Aliah's voice; no superlatives |
| Rating and reviews | Score, review count, source name, date retrieved, link | **Only from a named, verifiable source** (see below). Absent when none exists |
| Projects | Cards of this developer's projects, newest handover first | Live from Project records |
| Homes listed | Site select cards filtered to this developer | Live from Property records (derived developer) |
| Areas | Areas where this developer has projects or listings, with a mini map | Derived |
| Insights | Articles tagged to this developer | Shown only when at least one exists |
| Contact | "Ask an advisor about {developer}" | A lead with the developer as context |

### Ratings and reviews: what counts as legitimate (Q11)
- **Allowed:**
  - an independent third-party source with a public method (for example, a public review platform's aggregate), shown with source name, review count, date and a link, under that platform's licence terms;
  - an official regulator rating, if one exists and is published.
- **Not allowed:**
  - Al Aliah's own rating of a developer. A brokerage that sells a developer's units has a conflict of interest, and the rating could strain developer relationships;
  - unattributed stars;
  - reviews copied without licence;
  - "average" ratings computed from a handful of comments.
- **Stored with:** source, URL, score, count, retrieved date. The score goes stale after 90 days and is hidden until refreshed.
- **At launch:** assume none (A6). The page is complete without this module.

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
- Brokerage licence and ORN: in the footer and on Contact and About Us.
- Agent BRN and languages: on agent cards and listings.
- Developer relationships ("Authorised agent for …"): only where formally agreed and documented.
- Developer ratings: only per §4.
- Testimonials: none until genuine and permitted. The 17 stored demo reviews are never published.
- Metrics: only when verified. Live counts from our own feed ("Homes listed: 12") are allowed, because they are true and labelled.

## 10. Ten-question check (brief §64)

| Decision | Risk the check caught | Answer |
|---|---|---|
| Client navigation with About Us first | Reads as an agency site (question 5, differentiation) | Order kept as instructed; alternative recommended in §1 for the client to decide |
| Dubai under Areas | Dilutes the Abu Dhabi position (questions 1–2) | Abu Dhabi listed first and the default everywhere; Dubai imagery only on Dubai pages (D-031) |
| Owners, Invest and Communities leave the top level | Sellers, landlords and investors lose an entry point (question 3) | Placed by intent in the Buy, Rent and Off-plan panels, plus "List your property" in the utility bar |
| Contact as header CTA | Competes with each page's primary action | Ink, not crimson |
| Developer ratings | Invented or conflicted data (question 4, never invent) | Third-party or regulator source only; omitted otherwise |
| Derived developer on properties | Data drift between project and property | One source of truth; stored only when there is no project |
| Path-based landings | Thousands of thin pages (question 8) | Indexable only with 3+ listings |

## 11. Stage 03 plan after this
1. **03.2 Content model and data:** fields per entity, importer mapping, developer sources, media room tags, QA flags. Needs a Q3 sample export.
2. **03.3 Search and listings:** search UX states, facet behaviour, storage (W4), interactive layer (W1).
3. **03.4 Template structures:** module order per template at its intensity level (structure diagrams, not visual layouts), editor approach (W3).
4. **03.5 Lead flows and forms:** steps, validation, routing (W7).

## 12. Approval requested
- The navigation as instructed, with Contact as an ink header CTA, and the placement of the former top-level items.
- The navigation order: as given, or the recommended Buy-first order.
- The four separate entities and the derived-relationship rules in §3.
- The Developer archive and page modules, and the ratings rule (§4).
- The URL model: nested `/areas/{emirate}/{community}/`, flat `/projects/` and `/developers/`, `/property/{slug}-{ref}/`, English slugs under `/ar/`, the 90-day expiry rule.
- Facet tiers with the 80% coverage rule and the 3-listing indexation threshold.

**Client inputs that would firm this up:**
- Q3: CRM or feed name plus a sample export.
- Q4: active listing counts by purpose and area.
- B1: which Dubai communities and lines (sale, rent, off-plan) are active.
- W2: multilingual plugin preference.
- Q9: licence, ORN and BRN numbers.
- Q11: any developer rating source the client considers legitimate.
