# Stage 03.2: Data Model and Migration Plan

**Status:** **approved 2026-10-07 with final decisions (D-034)**, revision 3. The decisions are in §0, and the sections below are corrected to match. Implementation follows [`stage-03-2-implementation-plan.md`](./stage-03-2-implementation-plan.md). **Nothing has been migrated, created, linked or changed.** Every staging query was read-only.
**Source:** staging WordPress (`alaliah.trigonsolutions.co`, prefix `wp8g_`), a production clone. Queried 2026-10-06/07 through Novamira `execute-php`, after confirming `home` = staging on each session.
**Privacy:** agent contact values and owner fields were counted, never printed.

**Contents:**
0. Final decisions (D-034)
1. Summary
2. Source of truth and inventory
3. Final content model
4. Post types
5. Taxonomies
6. Fields
7. Required legacy custom fields
8. Developer inventory
9. Developer classification and logos
10. Relationship strategy
11. Project model
12. Area hierarchy
13. Floor plans
14. Property admin UX
15. Search model
16. Media reuse
17. Data-quality flags
18. Migration mapping
19. Proposed test relationships
20. Dry-run migration plan
21. Resolved points
22. Approval record

**Appendix:** legacy data detail.

---

## 0. Final decisions (D-034, 2026-10-07)

| # | Decision |
|---|---|
| 1 | Developer URLs stay plural: `/developers/` and `/developers/{slug}/` |
| 2 | **All 17** `estate_developer` records migrate into `alaliah_developer`, as drafts. None is discarded for lacking relationships. Name, slug, logo (same attachment), legacy ID and legacy text are preserved |
| 3 | The existing developer descriptions are **legacy review material only** (`aa_about_legacy`, never displayed). A developer page publishes only once its About content is sourced or editorially approved |
| 4 | **Verified test relationships:** Danube Properties → Bayz 102 → Business Bay (T1) and Binghatti Developers → Binghatti Aquarise → Business Bay (T2). Azizi Developments → Azizi Venice → Dubai South (T3) is **provisional, medium confidence**, and not treated as verified until independently confirmed |
| 5 | **Hard rule:** `aa_property_agency` never populates `aa_developer_id`, automatically or by matching names. Agency, brokerage and developer are separate concepts |
| 6 | 31083 and 31094 stay without developer or project links; they are flagged for editorial review and do not block migration |
| 7 | The three Dubai project-style records migrate as `alaliah_project`, not as properties |
| 8 | Al Reef Downtown is corrected to UAE › Abu Dhabi › Al Reef Downtown; the conflicting legacy value is kept in the migration audit |
| 9 | "Azizi Developements" → "Azizi Developments". "Saas Properties" keeps its stored spelling until the official brand spelling is confirmed from an official source; capitalisation is not changed for style |
| 10 | `123564` is kept exactly in `aa_madhmoun_permit`, marked **unverified permit**, and never shown publicly until confirmed. Compliance is extensible: number, authority and system per permit, with no one-off field per emirate |
| 11 | The seven custom property fields migrate exactly as documented (§7); nothing is extracted from description text |
| 12 | Floor plans are image-first: upload image, save property, and the floor plan appears. All metadata is optional |
| 13 | Shadow taxonomies are **derived only**. Relationship meta is canonical; shadow terms are rebuilt from it, are never editable, and lose any disagreement (§10) |
| 14 | Existing attachment IDs are reused; no file is copied, duplicated or reassigned |
| 15 | `AA-1001…` references are immutable; the legacy ID is kept as `aa_legacy_post_id` |
| 16 | Migration is dry-run by default, additive, idempotent, repeatable and non-destructive. No WPResidence record, meta, term or attachment is altered or deleted |
| 17 | **Sequence:** verify a restorable staging backup → deploy the model alongside WPResidence → full dry run → review the report → execute T1 and T2 only → QA relationships, admin and frontend → stop before broad migration |

**Correction from this review (§5):** the public taxonomy slugs proposed in revision 2 would have collided with existing rewrite bases: `type/` (WordPress post formats), `area/` (WPResidence) and `category` (WordPress). Taxonomies therefore get **no public archive URLs**; the approved landing URLs (IA §5) are routed separately.

## 1. Summary

| | |
|---|---|
| Architecture | WPResidence legacy data → migration layer (WP-CLI, dry-run by default) → Trigon-owned structures in `trigon-alaliah-core` → presented by `alaliah-trigon`. WPResidence is not a runtime dependency after cutover |
| Inventory | 14 published `estate_property` records. **11 are listings** (Abu Dhabi). **3 are Dubai project records** that become `alaliah_project`. 17 developers, 1 agent record, 13 areas, 261 listing images |
| Developers | All 17 inventoried and all 17 migrate, as **drafts**. **2 have verified identity** from site evidence (Danube, Binghatti); **15 need review**, including Azizi while T3 is provisional; 0 demo, 0 duplicate, 0 invalid. None is published automatically |
| Test relationships | **Approved:** T1 Danube → Bayz 102 and T2 Binghatti → Binghatti Aquarise. T3 Azizi → Azizi Venice is provisional. **No unit-level listing has a verifiable developer**, so Project → Property cannot yet be proven with a real property (§19) |
| References | `AA-1001` to `AA-1011` for the 11 listings, assigned by original publish date; legacy IDs kept separately |
| Safety | Additive, repeatable, idempotent, non-destructive. Legacy posts, meta and media are never edited, reassigned or deleted |

## 2. Source of truth and inventory

**Source of truth: WordPress.**
- No import plugin is installed. The MLS Import add-on was never installed; one leftover onboarding option remains.
- No sync or import jobs run.
- No external IDs exist (`mls` and `property_internal_id` are empty).
- Every record was entered by hand.

| Inventory | Count |
|---|---|
| Rent | 6 |
| Buy: ready | 3 |
| Buy: off-plan units (Abu Dhabi) | 2 (31083, 31094) |
| Off-plan project records (Dubai) | 3 (32060, 32078, 32101) → projects |
| Commercial | 0 |
| By emirate (all 14 records) | Abu Dhabi 11, Dubai 3 |
| By area | Al Raha 3; Al Khalidiya, Al Reef Downtown, Business Bay 2 each; Al Reem Island, Khalifa City, Madinat Al Riyad, Yas Island, Dubai South 1 each |
| By type (as stored) | Apartments 10, Villa 3, Townhouse 1; at least 2 mistyped |
| By developer (structured) | 0. By site evidence: Danube 1, Binghatti 1, Azizi 1 (all Dubai project records) |
| Featured | 3 (31002, 31023, 31495) |

## 3. Final content model

```
                 ┌──────────────── alaliah_developer ────────────────┐
                 │  logo · about · sources · review status · rating  │
                 └───────────────┬───────────────────────────────────┘
                                 │ 1:n (required to publish a project)
                 ┌───────────────▼──────────────── alaliah_project ──┐
                 │  handover · payment plan · permit · brochure ...  │
                 └───────────────┬───────────────────────────────────┘
                                 │ 1:n (optional on property)
┌─ alaliah_agent ─┐  n:1 ┌───────▼──────────── alaliah_property ──────┐
│  people/office  │◀─────│  reference · price · beds · plans · permit │
└─────────────────┘      └───────┬────────────────────────────────────┘
                                 │ n:1 (required)
                 ┌───────────────▼── alaliah_location (taxonomy) ─────┐
                 │  UAE › Emirate › Community › Sub-community/Building│
                 └───────────────┬────────────────────────────────────┘
                                 │ 1:1 for emirate and community terms
                         alaliah_area (editorial story post)
```

**Rules:**
- Developer, Project, Property and Area are separate entities.
- A property may have no project; it can then carry a developer directly.
- When a property has a project, its developer **comes from the project** and cannot contradict it.
- Every relationship has a reverse link (§10).

## 4. Post types

| Post type | Public URL (IA §5, approved) | Notes |
|---|---|---|
| `alaliah_property` | `/property/{base-slug}-aa-1001/` | e.g. `/property/five-bedroom-villa-yas-island-aa-1010/`. The URL carries the reference token, never the legacy ID (rule below) |
| `alaliah_project` | `/projects/{slug}/` | First-class entity |
| `alaliah_developer` | `/developers/{slug}/` | Archive titled "All Developers" |
| `alaliah_area` | `/areas/{emirate}/{community}/` | Editorial page for a location term |
| `alaliah_agent` | `/team/{slug}/` | People; one "office" record for the company contact |
| `alaliah_insight` | `/insights/{slug}/` | Registered now, content later |

**Property URL rule (D-035; one rule everywhere):**
- **Canonical reference:** `AA-1001`, stored in `aa_reference`, displayed as is.
- **URL token:** the reference in lower case, `aa-1001` (`strtolower(aa_reference)`).
- **Public URL:** `/property/{base-slug}-aa-1001/`. `{base-slug}` is the post slug, stored *without* the token.
- **Resolution** is by token only. Any request whose token matches but whose base slug differs, including the bare `/property/aa-1001/`, returns a 301 to the current canonical URL. A title or slug change therefore never breaks a link.
- **One function generates every property URL:** permalinks, canonical tags, sitemaps, REST `link`, the migration's redirect map, and the legacy redirects (`/properties/{legacy-slug}/` → `aa_legacy_post_id` → that function).

**Internal names never appear in URLs.** Each type sets its own public `rewrite` slug and `has_archive`. Query variables use public names (e.g. `?developer=`), and REST routes sit under `/wp-json/alaliah/v1/` with public field names.

## 5. Taxonomies

| Taxonomy (internal) | Public archive URL | Applies to | Terms | Editable |
|---|---|---|---|---|
| `alaliah_location` | None (Area pages are `alaliah_area` posts at `/areas/…`) | property, project, agent | UAE › Abu Dhabi, Dubai › communities › sub-communities and buildings | Yes |
| `alaliah_purpose` | None | property | Sale, Rent | Yes (single choice) |
| `alaliah_completion` | None | property, project | Ready, Off-plan | Yes (single choice) |
| `alaliah_status` | None | property | Available, Under offer, Rented, Sold, Withdrawn | Yes (single choice) |
| `alaliah_category` | None | property | Residential, Commercial | Yes |
| `alaliah_type` | None | property | Apartment, Villa, Townhouse, Penthouse, Duplex, Office, Retail, Warehouse, Land (studio = 0 bedrooms) | Yes (single choice) |
| `alaliah_amenity` | None | property, project | Two parents: "In the home" and "Building and community"; about 25 curated terms | Yes |
| `alaliah_rel_developer` | None | property, project | One term per developer, **derived** | **Never** (system only) |
| `alaliah_rel_project` | None | property | One term per project, **derived** | **Never** (system only) |

All taxonomies register with `rewrite => false` and `publicly_queryable => false`. Public filtering happens through the IA's landing URLs (`/properties-for-sale/{location}/{type}/`) and the search endpoint, which map public slugs to these taxonomies internally. Internal names never appear in a URL.

**Shadow-taxonomy invariant (D-034):**
1. `aa_developer_id` (on projects, and on properties without a project) and `aa_project_id` are **canonical**.
2. `alaliah_rel_developer` and `alaliah_rel_project` terms are **derived** from them on save, on project-developer changes (cascading to units), and by `wp alaliah relations rebuild`.
3. They are never manually editable: no admin UI and no REST, and term assignment capabilities are denied to all roles.
4. If meta and terms disagree, **the meta wins** and the terms are rebuilt. The Data Quality screen reports any drift it finds.

They exist only to make developer and project filters and counts cheap (§15).

## 6. Fields

Registered meta (typed, sanitised, REST schema). All carry the `aa_` prefix.

### 6.1 Property (`alaliah_property`)
| Field | Type | Required | Notes |
|---|---|---|---|
| `aa_reference` | string | Auto | `AA-1001`…; immutable, unique, read-only in admin (§18.2) |
| `aa_legacy_post_id` | integer | Migrated only | Source `estate_property` ID; private |
| `aa_price` | integer (AED) | Yes for available listings | Null, never 0, when unknown |
| `aa_rent_period` | enum: yearly, monthly | Rent only | Default yearly |
| `aa_bedrooms` | integer | Yes | 0 = studio |
| `aa_bathrooms` | integer | Yes | |
| `aa_size_builtup` | decimal (sq ft) | Recommended | |
| `aa_size_plot` | decimal (sq ft) | Optional | Villas and townhouses |
| `aa_furnishing` | enum: furnished, unfurnished, partly furnished | Optional | |
| `aa_property_agency` | text | Optional | Migrated exactly (§7) |
| `aa_handover` | text | Off-plan | Migrated exactly (§7) |
| `aa_handover_year` | integer | Optional | For filtering only; suggested from `aa_handover` and confirmed by an editor, never auto-saved |
| `aa_project_id` | post ID | Optional | |
| `aa_developer_id` | post ID | Optional | Editable only when no project is set; otherwise shows the project's developer read-only |
| `aa_agent_id` | post ID | Yes | |
| `aa_building` | term ID | Optional | A building-level `alaliah_location` term |
| `aa_lat`, `aa_lng` | decimal | Optional | Rejected if `0,0` or outside UAE bounds |
| `aa_geo_precision` | enum: exact, building, community | Auto | Community when no coordinates are given |
| `aa_payment_plan_overall`, `aa_payment_on_booking`, `aa_payment_during_construction`, `aa_payment_on_handover` | text | Optional | Migrated exactly (§7) |
| `aa_madhmoun_permit` | text | Optional | Legacy-compatible field: the migrated value is kept exactly; never displayed directly (§7) |
| `aa_permits` | list of permit entries | Optional | Canonical compliance data: `{number, authority, system, status, public, source, verified_on, origin}` (§7) |
| `aa_gallery` | ordered attachment IDs | Recommended | |
| `aa_floor_plans` | ordered list of items | Optional | §13 |
| `aa_video_url` | URL | Optional | YouTube or Vimeo |
| `aa_brochure_id` | attachment ID (PDF) | Optional | |
| `aa_is_featured` | boolean | Optional | |
| `aa_headline` | text | Disabled | Reserved; enabled only if approved later |
| `aa_quality_flags` | array | System | §17 |

Featured image: core `_thumbnail_id`. Description: core post content.

### 6.2 Project (`alaliah_project`)
- `aa_developer_id` (required to **publish**; a draft may lack it and is flagged, e.g. Azizi Venice while T3 is provisional)
- location term (required)
- completion
- `aa_handover`, `aa_handover_year`
- the four payment-plan text fields
- `aa_madhmoun_permit` (legacy-compatible) and `aa_permits` (§7)
- `aa_price_from` (optional; manual and sourced, or derived from linked units when any exist)
- `aa_unit_types` (text, e.g. "Studio to 4-bedroom")
- `aa_gallery`, `aa_floor_plans`, `aa_brochure_id`, `aa_masterplan_id`, `aa_video_url`
- amenities
- `aa_legacy_post_id`, `aa_review_status`

### 6.3 Developer (`alaliah_developer`)
- `aa_logo_id` (Media Library)
- `aa_about` (rich text; approved public copy, empty at migration)
- `aa_about_legacy` (the existing text, kept for review; never displayed)
- `aa_about_approved` (boolean, set by an editor)
- `aa_logo_approved` (boolean, set by an editor)
- `aa_sources` (list of URL and note pairs)
- `aa_website`
- `aa_review_status` (identity): verified, needs review, probable demo/test, duplicate, invalid/incomplete
- publication readiness (separate from identity, §9): computed from identity, logo approval, About approval and relationships
- `aa_review_note`
- `aa_rating_*` (source, URL, score, count, retrieved date, refresh policy; D-032; empty at launch)
- `aa_legacy_post_id`

### 6.4 Agent (`alaliah_agent`)
- `aa_role`
- `aa_brn` (empty until supplied, Q9)
- `aa_languages`
- `aa_phone`, `aa_whatsapp`, `aa_email`
- `aa_is_office` (true for the company contact)
- `aa_legacy_post_id`

### 6.5 Area (`alaliah_area`)
- `aa_location_term_id` (1:1 with an emirate- or community-level term)
- `aa_hero_id`
- `aa_name_ar` (verified Arabic name; empty until supplied)
- story content
- `aa_legacy_term_id`

## 7. Required legacy custom fields

All seven are kept as text and migrated **exactly**: only leading and trailing spaces are trimmed. All values found:

| Legacy key (label) | New field | Values on record | Notes |
|---|---|---|---|
| `property-agency` (Property Agency) | `aa_property_agency` | 31495 "Al Aliah international Real Estate"; 31521, 31571 "Al Aliah International Real Estate"; 32060 "Rainbow Properties"; 32078 "Danube Properties"; 32101 "Binghatti Properties" | Copied as written, including the casing difference. Not treated as the developer: on 32060 it names the presenting broker, not Azizi. Normalising into an agency entity can come later |
| `property-handover` (Property Handover) | `aa_handover` | 31094 "Q1 2029"; 32078 "June 2029"; 32101 "Q2, 2027" | Text kept; `aa_handover_year` is suggested (2029, 2029, 2027) for an editor to confirm |
| `madhmoun-permit` (Madhmoun Permit) | `aa_madhmoun_permit` | 32101 "123564" | **Flag:** the only value sits on a Dubai record, while Madhmoun is Abu Dhabi's system. Copied unchanged and marked unverified |
| `overall-payment-plan` | `aa_payment_plan_overall` | 31094 "85/15"; 32078 "70/30"; 32101 "70/30" | |
| `payment-on-booking` | `aa_payment_on_booking` | 31094 "10%"; 32101 "20%" | |
| `payment-during-construction` | `aa_payment_during_construction` | 31094 "75%"; 32078 "70%"; 32101 "50%" | |
| `payment-on-handover` | `aa_payment_on_handover` | 31094 "15%"; 32078 "30%"; 32101 "30%" | |

**Consistency checks:**
- The parts add up to 100% and agree with the overall split on 31094, 32078 and 32101.
- **31094** also lists four other payment plans in its description (e.g. "30% DP – 70% on HO"), which disagree with the fields. Flag for editor.
- **31083** states "Payment Plan 70 / 30" and "Handover Q3 2028" in its description, but its fields are empty. Flag: an editor copies them if correct. The migration does not parse descriptions into fields.

**Permit model (D-034):**
- **`aa_permits` is canonical.** It is a list of entries, each with:
  - `number` (text, exactly as issued);
  - `authority` (e.g. the Abu Dhabi or Dubai regulator; free text until confirmed);
  - `system` (e.g. `madhmoun`, or `unspecified`);
  - `status` (`unverified` or `verified`);
  - `public` (boolean, allowed only when verified);
  - `source`, `verified_on`, and `origin` (e.g. "legacy madhmoun-permit").

  Abu Dhabi and Dubai each use their own system as an entry. No per-emirate field is created.
- **`aa_madhmoun_permit` is kept for backward compatibility.** The legacy value is copied into it exactly. When an editor verifies an entry with `system = madhmoun`, its number is mirrored into `aa_madhmoun_permit`. The field itself is never displayed.
- **Migration of `123564`:**
  - `aa_madhmoun_permit = "123564"` (exact);
  - one `aa_permits` entry with `system = unspecified`, `status = unverified`, `public = false`, `origin = legacy madhmoun-permit`.

  It is not labelled Madhmoun, because the record is in Dubai.
- **Frontend:** only entries that are verified and public render. There are no placeholders. Missing permits are flagged in admin, never invented or inferred.

## 8. Developer inventory

All 17 `estate_developer` records, status `publish`, none trashed or draft.

| ID | Name (as stored) | Slug | Created | Text | Logo (attachment) | Site evidence |
|---|---|---|---|---|---|---|
| 31714 | Burtville Developments | burtville-developments | 2026-03-15 | none | 31251 · PNG 183×51 · 9 KB · parented to the Homepage | Homepage and All Developers logo strip only |
| 32010 | Reportage Properties | reportage-properties | 2026-04-06 | none | 32012 · PNG 408×280 · 7 KB | Logo strip only |
| 32013 | Nine Yards Developments | nine-yards-developments | 2026-04-06 | none | 32014 · JPEG 200×200 · 4 KB | None |
| 32016 | Saas Properties | saas-properties | 2026-04-06 | none | 32017 · PNG 1376×1376 · 115 KB | Logo strip only |
| 32018 | Danube Properties | danube-properties | 2026-04-06 | none | 32019 · JPEG 500×500 · 47 KB | **32078 text: "The project by Danube Properties"; agency field "Danube Properties"** |
| 32020 | Emaar Properties | emaar-properties | 2026-04-06 | none | 32021 · PNG 2560×1440 · 58 KB | Logo strip; legacy Elementor templates |
| 32022 | Damac Properties | damac-properties | 2026-04-06 | none | 32023 · JPEG 500×500 · 18 KB | Logo strip; legacy templates |
| 32024 | Nakheel | nakheel | 2026-04-06 | none | 32025 · JPEG 482×334 · 8 KB | Logo strip |
| 32026 | Sobha Realty | sobha-realty | 2026-04-06 | none | 32027 · PNG 2560×1809 · 48 KB | Logo strip |
| 32028 | Meraas | meraas | 2026-04-06 | 10 words | 32029 · JPEG 770×770 · 40 KB | Logo strip; legacy templates |
| 32030 | Dubai Properties | dubai-properties | 2026-04-06 | 10 words | 32031 · PNG 350×200 · 29 KB | None |
| 32034 | Azizi Developements | azizi-developements | 2026-04-06 | 12 words | 32035 · PNG 591×293 (**screenshot**) | **32060: project "Azizi Venice"** (name only) |
| 32036 | Ellington Properties | ellington-properties | 2026-04-06 | 11 words | 32037 · PNG 356×142 · 3 KB | Logo strip |
| 32038 | MAG Property Development | mag-property-development | 2026-04-06 | 10 words | 32039 · PNG 366×202 (**screenshot**) | None |
| 32040 | Binghatti Developers | binghatti-developers | 2026-04-06 | 9 words | 32041 · PNG 428×229 (**screenshot**) | **32101: project "Binghatti Aquarise"; agency field "Binghatti Properties"** |
| 32043 | Omniyat | omniyat | 2026-04-06 | 10 words | 32044 · PNG 800×800 · 12 KB | None |
| 32045 | Arada | arada | 2026-04-06 | 12 words | 32046 · WebP 1500×1500 · 13 KB | None |

**Common to all 17:**
- Excerpt empty.
- All 23 WPResidence developer fields (address, licence, website, social links, coordinates and so on) are **empty**.
- No taxonomy terms (the developer taxonomies hold only demo terms such as New York and Tripoli, unattached).
- No property or project references to their IDs.
- No alt text on any logo.
- One logo file each, no duplicates (checked by file hash).
- The existing descriptions are one generic sentence each, unsourced and containing superlatives ("A leading developer…", "An ultra-luxury developer…").

**Legacy pages that show developers:**
- "All Developers" (page 29), plus a published duplicate (32112);
- draft "Developers List" (22997) and "Developers" (31712);
- a logo strip on the Homepage (18811);
- legacy Elementor templates.

None is migrated; each is redirected or replaced at cutover.

## 9. Developer classification and logos

| Classification | Count | Developers | Basis |
|---|---|---|---|
| **Verified** | 2 | Danube Properties, Binghatti Developers | Identity corroborated by explicit project content on this site (T1, T2) |
| **Needs review** | 15 | Arada, Azizi Developments (T3 provisional), Burtville, Damac, Dubai Properties, Ellington, Emaar, MAG, Meraas, Nakheel, Nine Yards, Omniyat, Reportage, Saas Properties, Sobha | Real-looking records entered by staff; no explicit corroborating site content; About text and logos still need sourcing |
| Probable demo/test | 0 | | None match theme demo content; all were created by site staff in Mar–Apr 2026 |
| Duplicate | 0 | | No duplicate names or logo files |
| Invalid/incomplete | 0 | | Every record has at least a name and a logo |

**Migration status:**
- **All 17 migrate** to `alaliah_developer` as **draft**, with `aa_review_status` set as above.
- **Two separate states (D-034):**

| State | Values | Set by |
|---|---|---|
| Identity (`aa_review_status`) | verified, needs review, probable demo/test, duplicate, invalid/incomplete | Editor; migration sets the classification above |
| Publication readiness (computed) | Ready, or not ready with reasons | System |

- **Readiness rules.** A developer can be published only when **all** of these hold:
  - identity verified;
  - logo approved;
  - About content sourced or editorially approved.

  If it has no linked project or listing, that shows as a warning ("No current listings") but doesn't block publishing, since the IA keeps such developers reachable. A publish guard turns an early publish back into a draft with a notice listing the missing items.
- The legacy one-line descriptions go to `aa_about_legacy` only.
- A dedicated `needs-review` post status is not used. WordPress custom statuses are poorly supported in the admin, so draft plus the review field shows the same thing more reliably.
- **Name corrections:**
  - "Azizi Developements" → "Azizi Developments", applied during migration. The slug becomes `azizi-developments`, and the old slug is kept for a redirect.
  - "Saas Properties" migrates **as stored**. The logo shows "SAAS", but capitalisation changes only once the official brand spelling is confirmed from an official source.
- **Coverage gap:** most of the 17 are Dubai developers (Nine Yards' base is not confirmed), Arada is Sharjah-based, and Reportage is the only Abu Dhabi-based one. The main Abu Dhabi developers are missing. This is a content task, not a migration task.

**Logo flags** (inspected visually; all show the right brand mark):
| Flag | Developers |
|---|---|
| Screenshot | Azizi, MAG, Binghatti |
| Low resolution (shorter side under 250 px or under 10 KB) | Burtville (183×51), Nine Yards (200×200, unreadable tagline), Ellington (356×142, 3 KB), Reportage (408×280, 7 KB), Nakheel (482×334, 8 KB) |
| Non-standard version | Nakheel (white on a black box), Arada (cropped frame from a tile) |
| No transparency (white box) | Danube, Damac, Meraas, Nine Yards (JPEG) and the three screenshots |
| Missing alt text | All 17 |
| Incorrect or duplicate | None found |

**Developer admin:** a "Developer Logo" Media Library field (`aa_logo_id`) with guidance: SVG or transparent PNG, at least 800 px wide.

## 10. Relationship strategy

| Link | Stored on | Reverse | Mechanism |
|---|---|---|---|
| Project → Developer | `aa_developer_id` (required to publish) | Developer → Projects | Query by `alaliah_rel_developer` term |
| Property → Project | `aa_project_id` (optional) | Project → Properties (units) | `alaliah_rel_project` term |
| Property → Developer | Derived from the project; `aa_developer_id` only when there is no project | Developer → Properties | `alaliah_rel_developer` term, synced on save from either source |
| Property → Area | `alaliah_location` term (required) | Area → Properties | Taxonomy |
| Project → Area | `alaliah_location` term (required) | Area → Projects | Taxonomy |
| Developer → Areas | **Derived**: the union of its projects' and properties' locations | Area → Developers | Computed and cached; never typed |
| Property → Agent | `aa_agent_id` | Agent → Listings | Meta |

**Rules:**
- **No relationship is created from inference.** A link exists only when an editor sets it, or when the migration applies an approved test link (T1, T2).
- **Agency is not developer (hard rule).** `aa_property_agency` never populates or suggests `aa_developer_id`, even when the names match ("Danube Properties" in both). The T1 and T2 links come from the approved test list, not from the agency field.
- **Shadow terms follow the canonical meta** (§5 invariant).
- When a project's developer changes, its units' shadow terms re-sync automatically.
- Unlinked records are valid. They raise a "missing developer" or "missing project" flag (§17); they are never hidden or rejected.

## 11. Project model

- **First-class entity** with its own URL, gallery, floor plans, payment plan, handover, permit and brochure.
- **Units** are `alaliah_property` posts linked by `aa_project_id`. A project page lists its available units and shows "No units currently listed" when there are none, which is true of all three seeds.
- **Payment plan and handover** live on the project. A unit may override them in its own fields; if a unit field is empty, the project value is shown, labelled as the project's.
- **Seed projects from the legacy Dubai records:**

| Legacy | Project | Developer | Area | Carried over |
|---|---|---|---|---|
| 32060 "…Azizi Venice…" | Azizi Venice | **Not linked at migration.** T3 is provisional; the link is set only after independent confirmation | Dubai South | Description, 16 gallery images, agency "Rainbow Properties", amenities |
| 32078 "…Bayz 102…" | Bayz 102 | Danube Properties | Business Bay | Description, 18 images, handover June 2029, plan 70/30 (70% / 30%), agency |
| 32101 "…Binghatti Aquarise…" | Binghatti Aquarise | Binghatti Developers | Business Bay | Description, 8 images, handover Q2 2027, plan 70/30 (20% / 50% / 30%), permit (unverified), agency |

- **Corrections in the move:**
  - 32060's stored type "Apartments" and its title "Waterfront Villas" both describe unit mixes, so they become `aa_unit_types` text.
  - The bedroom, price and size values of 0 are dropped as non-data.
- **Abu Dhabi off-plan units** 31083 (Khalifa City, 312 townhouses) and 31094 (Al Raha, Brabus interior option) stay **properties** with no project or developer until the client names them. Neither is inferred from the description.

## 12. Area hierarchy

```
UAE
├─ Abu Dhabi
│  ├─ Al Khalidiya
│  ├─ Al Raha
│  ├─ Al Reef Downtown        ← corrected from Dubai (legacy area option)
│  ├─ Al Reem Island
│  │  └─ Marina Square
│  │     └─ Marina Blue Tower  (building; from 31013 text, editor to confirm)
│  ├─ Khalifa City
│  ├─ Madinat Al Riyad
│  ├─ Saadiyat Island          ← "Sadiyat Island" corrected; 0 listings
│  └─ Yas Island
└─ Dubai
   ├─ Business Bay
   ├─ Dubai Creek             (0 listings)
   ├─ Dubai Investment Park   (0 listings)
   ├─ Dubai South
   └─ Jumeirah Beach Residence ← "Jumairah" corrected; 0 listings
```

**Migration rules:**
- **Conflicts are flagged, never resolved silently.** The emirate comes from each listing's own `property_city` term. When that disagrees with the legacy area's `cityparent` option, the record is flagged and the listing's value is proposed.
  - Al Reef Downtown is the one conflict: the option says Dubai, while both of its listings and the geography say Abu Dhabi.
- **Spelling and slug fixes** keep the legacy slug in `aa_legacy_term_id`, with redirects: `sadiyat` → `saadiyat-island`, `al-reem` → `al-reem-island`, `jbr` → `jumeirah-beach-residence`, `dip` → `dubai-investment-park`.
- **Area images** (featured images on 11 of 13 terms, mostly WhatsApp photos) are reused as `aa_hero_id`, flagged "photography tier C".
- **Empty areas** migrate as terms. Their Area posts stay draft until written.

## 13. Floor plans

**Image-only must work:** upload image, save property, and the floor plan appears on the frontend.

| Aspect | Design |
|---|---|
| Storage | `aa_floor_plans`: an ordered list of items `{ id, title?, level?, unit_type?, bedrooms?, area?, note? }`. Only `id` (a Media Library attachment) is required |
| Validation | An item saves with just an image. Optional fields are trimmed; empty ones are not stored |
| Admin | A "Floor Plans" box: **Add floor plan** opens the Media Library (multi-select, upload or pick existing). Plans show as a thumbnail row: drag to reorder, × to remove, and a collapsed "Add details" disclosure per plan for the optional fields |
| Frontend | Each plan renders as an image with a link to view it full size. Labels appear only for fields that hold values; nothing renders for empty fields. With no plans, the module is absent. With one, a single image; with several, a list in the editor's order |
| Accessibility | Alt text defaults to "Floor plan", plus the title when set, plus the property's structured title. An editor can override it |
| Reuse | The same structure is used on projects |
| Migration | WPResidence floor-plan data (`plan_*`) is empty on every listing, so **nothing migrates**. The `use_floor_plans` flag (set on 3) carries no data and is not migrated. If any gallery image is actually a floor plan, an editor moves it (the attachment is reused, not copied) |

## 14. Property admin UX

One screen, eight boxes in this order. Taxonomies such as purpose, status and type render as single-choice dropdowns inside the boxes, not as WordPress's default checkbox panels.

| Box | Fields |
|---|---|
| **Property** | Title, Reference (read-only), Purpose, Status, Property type, Category, Price (+ rent period when Rent) |
| **Property details** | Bedrooms, Bathrooms, Built-up area, Plot area, Furnishing, Property agency, Handover (+ handover year) |
| **Location** | Emirate › Area › Building (dependent dropdowns on `alaliah_location`), Project, Latitude, Longitude (with UAE bounds check) |
| **Relationships** | Developer (read-only when a project is set, with "from project"), Project, Agent |
| **Payment plan** | Overall payment plan, Payment on booking, Payment during construction, Payment on handover. Shown when Completion is Off-plan or any value exists |
| **Compliance** | Madhmoun permit; space reserved for other emirates' permits |
| **Media** | Featured image, Property gallery (sortable), Floor plans (§13), Video URL, Brochure (PDF) |
| **Marketing** | Description (editor), Amenities, Featured property. The marketing headline is hidden until approved |

**Data-quality panel:** a side panel on each property listing its open flags (§17), each linked to the field it concerns. Flags never block saving.

## 15. Search model

**Standard WordPress queries only.** No external search system. No fixed listing threshold: the architecture is revisited only if measured query times or query complexity call for it (Query Monitor on staging).

| Filter | Stored as | Query |
|---|---|---|
| Purpose, completion, status, category, type | Taxonomy | `tax_query` |
| Area (any level, including children) | `alaliah_location` | `tax_query` with `include_children` |
| Developer, project | Shadow taxonomies (§5) | `tax_query`; no `meta_query` |
| Amenities | Taxonomy | `tax_query` |
| Price, bedrooms, bathrooms, built-up area, plot area | Numeric meta | One `meta_query` range per active filter, typed `NUMERIC` |
| Handover year | Integer meta | Same |
| Latitude, longitude | Decimal meta | Map bounds; few listings carry them yet |

Categorical filters never touch `postmeta`, so a typical search combines several fast taxonomy joins with at most a few numeric ranges. Counts for the developer archive and area pages come from shadow and location term counts, which cost no extra queries.

## 16. Media reuse

- **No file is copied, re-uploaded or regenerated by the migration.** New records store existing attachment IDs: featured images, galleries (unserialized from `wpestate_property_gallery`), developer logos, area images, and floor plans when added.
- **No attachment is reassigned.** `post_parent` is left unchanged, even where an image is parented to another listing (23 images of 31082 belong to 30964) or to the Homepage (the Burtville logo). The new model never relies on `post_parent`.
- **Not migrated as data:** alt text (0 of 261 exist). Missing alt text is flagged. The image-size regeneration for the new theme is a separate Stage 05 step.
- **Media facts:** 261 listing images, 33.5 MB. 167 are WhatsApp exports; none is 2,400 px or wider; 94 are under 1,280 px.

## 17. Data-quality flags

The flags are computed by a validation layer in `trigon-alaliah-core` and stored in `aa_quality_flags`. They are recomputed on save and during migration.

| Flag | Rule | Records flagged today |
|---|---|---|
| Missing developer | Off-plan property or project with no developer | 31083, 31094; project Azizi Venice (T3 provisional) |
| Missing project | Off-plan property with no project | 31083, 31094 |
| Missing coordinates | No `aa_lat`/`aa_lng` | All 11 listings |
| Invalid or demo coordinates | Legacy value was `0,0` or outside UAE bounds (not migrated) | 30964 (lower Manhattan); the other 10 were `0,0` |
| Missing permit | No permit on an advertised listing | All 11 listings (requirement to be confirmed, §21) |
| Unverified permit | A permit entry with `status = unverified` (hidden from the public) | Binghatti Aquarise (project): `123564` |
| Possible wrong type | Type disagrees with title or bedrooms (e.g. "Villa" in title, typed Apartment) | 31023, 30967 (4-bed "with Private Pool" typed Apartment); 30964 (title "Studio", slug "2bhk", 1 bedroom) |
| Duplicate gallery | Image used by more than one listing | 31082 ↔ 30964 (23 images) |
| Missing area | No location term | none |
| Area conflict | Listing emirate ≠ legacy area mapping | Al Reef Downtown (2 listings) |
| Missing size | Built-up area empty or 0 | 30967 |
| Possible plot vs built-up | Villa over 8,000 sq ft with no plot area | 31495 (11,510 sq ft) |
| Missing price | Available listing without price | none among listings |
| Project-like record | Property with no price, beds or size, but a project name | 32060, 32078, 32101 (resolved by moving them to projects) |
| Field vs description mismatch | Payment or handover stated differently in text and fields | 31083, 31094 |
| Sales-style title | "Exclusive Offer", "Invest Now", "% discount", "High ROI" and similar | 31082, 31083, 31094, 31495, plus the 3 projects |
| Missing alt text | Any gallery or plan image without alt | All 11 listings |
| Developer identity unverified | `aa_review_status` is not verified | 15 developers |
| Developer not ready to publish | Identity, logo approval or About approval missing (shown separately from identity) | All 17 developers |
| Provisional relationship | A relationship candidate awaiting independent confirmation | Azizi Venice (T3) |
| Shadow drift | Shadow terms disagree with canonical meta (rebuilt automatically) | none (new) |

**Data Quality screen** (Tools › Data Quality, for editors):
- totals per entity;
- a count per flag, each linking to a filtered admin list;
- records needing review;
- after a migration run, the dry-run or run summary.

It is read-only and fixes nothing automatically.

## 18. Migration mapping

### 18.1 Records
| Legacy | Example | New | Transformation | Validation | Risk |
|---|---|---|---|---|---|
| `estate_property` (11 listings) | 31521 "5 Master Bedroom + Maid Villa…" | `alaliah_property` (draft) | Copy content, author and date. Title kept for the editor; a structured title is proposed beside it | Purpose, type, location and agent present | Low |
| `estate_property` (32060, 32078, 32101) | 32078 "…Bayz 102…" | `alaliah_project` (draft) | Map per §11 | Developer link per test plan | Medium: one judgement call per record |
| `estate_developer` (17) | 32018 Danube Properties | `alaliah_developer` (draft) | Name (Azizi corrected), slug, logo attachment (reused), `aa_legacy_post_id`. Legacy description → **`aa_about_legacy` only**; `aa_about` stays empty until sourced or editorially approved copy is written | Review status set; `aa_about` empty after migration | Low |
| `estate_agent` (1) | 30966 "Al Aliah International" | `alaliah_agent` (draft, `aa_is_office`) | Name and image; contact fields copied in the database, never printed | | Low |
| `property_area` terms (13) + `property_city` (2) | `al-reef-downtown` | `alaliah_location` | Build the hierarchy; fix spellings; flag conflicts | Each community has one parent emirate | Medium: Al Reef Downtown |
| Area term images | Al Raha → att. 31976 | `alaliah_area.aa_hero_id` | Reference the attachment | Attachment exists | Low |
| `estate_review` (17 demo), `membership_package` (17), Studio and Elementor templates, the 10 demo agent/developer taxonomies | | Not migrated | | | None |

### 18.2 References
| Legacy | New | Rule |
|---|---|---|
| `estate_property` ID (e.g. 31521) | `aa_legacy_post_id` = 31521 | Private; used for idempotency and redirects |
| None | `aa_reference` | `AA-` plus a sequence from 1001, assigned **once** in ascending original publish date (ties broken by legacy ID) and stored with a counter option. Never regenerated; read-only in admin; unique index check on save |
| Planned assignment | 30964 → AA-1001, 30967 → 1002, 31002 → 1003, 31013 → 1004, 31023 → 1005, 31082 → 1006, 31083 → 1007, 31094 → 1008, 31495 → 1009, 31521 → 1010, 31571 → 1011 | Projects carry no listing reference |

### 18.3 Fields
| Legacy key | Example | New field or taxonomy | Transformation | Validation | Risk |
|---|---|---|---|---|---|
| `property_action_category` | "Off Plan" / "Ready" (`sell`) / "Rent" | `alaliah_purpose` + `alaliah_completion` | Rent → Rent + Ready; Ready → Sale + Ready; Off Plan → Sale + Off-plan | Exactly one each | Low |
| `property_category` | "Apartments" | `alaliah_type` (+ `alaliah_category` Residential) | Apartments → Apartment, Villa → Villa, Townhouse → Townhouse | Type vs title check | Medium (flagged records) |
| `property_city` + `property_area` (+ `cityparent`) | Abu Dhabi + Al Reef Downtown | `alaliah_location` (one term) | Assign the community term; its parent gives the emirate | Conflict check | Medium |
| `property_status` | "Active", "hot offer" | `alaliah_status` | Active → Available; "hot offer" and "new offer" dropped | One status | Low |
| `property_features` (41 terms) | "balcony", "Central Air" | `alaliah_amenity` | Curated map: merge duplicates; drop US-template items (Heating, Natural Gas, Fireplace) and marketing items; assign each to "In the home" or "Building and community". The full term map is produced by the dry run for approval | Every kept term mapped | Medium: editorial |
| `property_price` | "420000" | `aa_price` | Integer; empty → null | Above 0 | Low |
| `property_label_before` | "Yearly" | `aa_rent_period` | Yearly → yearly; empty on Rent → yearly (flagged "assumed") | Rent only | Low |
| `property_bedrooms`, `property_bathrooms` | "5", "6" | `aa_bedrooms`, `aa_bathrooms` | Integer | 0 to 20 | Low |
| `property_size` | "5948" | `aa_size_builtup` | Decimal; 0 → null | Above 0 | Low |
| `property_rooms` | "5" | | Not migrated (duplicates bedrooms) | | None |
| `property_address` | "Marina Square, Al Reem Island, Abu Dhabi" | Building term proposal | Proposed building or sub-community terms for editor approval | | Low |
| `property_latitude/longitude` | "0", "40.7078…" | | **Not migrated** (all invalid); invalid-coordinates flag | UAE bounds | None |
| `prop_featured` | "1" | `aa_is_featured` | Boolean | | Low |
| `property_agent` | "30966" | `aa_agent_id` | Map to the new agent ID | Target exists | Low |
| `property_agent_secondary` | serialized | | Not migrated (same agent) | | None |
| `property-agency` | "Danube Properties" | `aa_property_agency` | Exact (trim only). **Never used to set or suggest a developer** | | Low |
| `property-handover` | "Q2, 2027" | `aa_handover` (+ suggested `aa_handover_year`) | Exact; year suggested only | | Low |
| `madhmoun-permit` | "123564" | `aa_madhmoun_permit` + `aa_permits` entry | Exact copy into `aa_madhmoun_permit`; entry with `system = unspecified`, `status = unverified`, `public = false` | Never displayed until verified | Medium (emirate mismatch) |
| `overall-payment-plan` and the 3 parts | "70/30", "20%" | `aa_payment_*` | Exact (trim only) | Parts sum to 100% (check, not enforced) | Low |
| `property-external-construction` | project description text | Project description (for the 3 projects) | Appended under the description for an editor to merge | | Low |
| `wpestate_property_gallery` | serialized ID list | `aa_gallery` | Unserialize; keep order; check each attachment exists | Duplicate check | Low |
| `image_to_attach` | "31003,31004,…" | | Not migrated (duplicates the gallery) | Cross-check only | None |
| `_thumbnail_id` | "31549" | `_thumbnail_id` | Same attachment | Exists | Low |
| `use_floor_plans`, `plan_*` | "1" / empty | `aa_floor_plans` | Nothing to migrate | | None |
| Post content | listing description | `post_content` | Copied; Elementor and shortcode markup stripped if present | | Low |
| Analytics (`wpestate_total_views`, `_eael_post_view_count`, `wpestate_detailed_views`) | "253" | | Not migrated | | None |
| ≈ 90 theme presentation and empty US-template keys | `page_header_*`, `energy_class`… | | Not migrated | | None |

## 19. Test relationships (approved; not yet written)

These are only for links verifiable from content on this site.

| Test | Developer | Project (from legacy record) | Area | Evidence | Confidence |
|---|---|---|---|---|---|
| **T1 (approved)** | Danube Properties (32018) | **Bayz 102** (32078) | Dubai › Business Bay | Description: "The project by Danube Properties in Business Bay" | High |
| **T2 (approved)** | Binghatti Developers (32040) | **Binghatti Aquarise** (32101) | Dubai › Business Bay | Project name and description identify the Binghatti development | High |
| **T3 (provisional)** | Azizi Developments (32034) | **Azizi Venice** (32060) | Dubai › Dubai South | Project name only | Medium. **Not linked** until independently confirmed |

The agency field is not cited as evidence for any test (decision 5).

**What the tests prove:**
- the forward links Developer → Project → Area;
- the reverse links Area → Projects → Developer and Developer → Projects;
- the derived "Projects with Al Aliah" count;
- the derived developer areas;
- shadow-term filtering.

**What they cannot prove yet:** Project → **Property** (unit). None of the three projects has a unit listing, and no Abu Dhabi unit names its developer or project.

**Two ways to complete the chain, neither invented:**
- **(a)** The client names the developer and project for 31083 (Khalifa City townhouses) or 31094 (Al Raha apartments with a Brabus interior option). That gives a full Abu Dhabi Developer → Project → Property → Area test.
- **(b)** For one T1 or T2 project, the client supplies a real available unit to list as a property.

### P1: property data-model test (approved, D-035)

P1 is **separate from T1 and T2**. It tests the property model, not developer relationships.

| | |
|---|---|
| Record | Legacy 31013 "Fully Furnished 1bd \| Marina Square \| Vacant" (Al Reem Island, rent) |
| Validates | Property migration; immutable reference **AA-1004** (from the deterministic map); purpose Rent, completion Ready, status Available, type Apartment; agent link (office record); location hierarchy; reuse of its 9 gallery images and featured image; empty floor-plan behaviour; quality flags; admin editing; REST representation |
| Location | Verified levels only: **UAE › Abu Dhabi › Al Reem Island** |
| Building | "Marina Blue Tower → Marina Square" is **not created** by the migration. The listing's own text and address name both, but the hierarchy has not been independently confirmed. It is recorded in the audit as a proposal and flagged `building_unconfirmed`; an editor creates the terms in admin once confirmed |
| Expected flags | missing coordinates, missing permit, missing alt text, building unconfirmed |

**What the tests do and don't prove:**
- T1 and T2 prove Developer → Project → Area and the reverse links.
- P1 proves the property model.
- **None of them proves Project → Property.** No verified unit-to-project relationship exists yet.

## 20. Dry-run migration plan

**Tool:** `wp alaliah migrate`, part of `trigon-alaliah-core`, deployed only through the approved Git → ZIP route.

| Phase | Action | Writes in dry run |
|---|---|---|
| 0. Preflight | Confirm staging `home`, backup verified (E3), WPResidence data readable, attachment files present | None |
| 1. Locations | Build the planned term tree; list corrections and conflicts | None |
| 2. Amenities | Propose the full term map for approval | None |
| 3. Developers | Plan 17 drafts, review statuses and logo flags | None |
| 4. Agent | Plan the office record | None |
| 5. Projects | Plan 3 projects from the Dubai records | None |
| 6. Properties | Plan 11 properties: references, fields, links, galleries | None |
| 7. Relationships | Apply only links on the approved test list (§19) | None |
| 8. Validation | Compute every flag (§17) | None |
| 9. Redirects | List legacy URL → new URL pairs | None |
| 10. Report | Print a summary and write a JSON and CSV report to a private location outside the web root, or to stdout | Report only |

**Options:**
- `--dry-run` is the default; `--execute` is required to write.
- `--only=developers|projects|properties|…` runs one phase.
- `--set=t1t2` or `--ids=…` limit the run to the approved test records (implementation plan §8).
- `--report=<path>` sets where the report is written.

**Guarantees when executing (later, after approval):**
- **Additive:** only creates `alaliah_*` posts, terms and `aa_*` meta. It never updates, deletes or reassigns WPResidence posts, meta, terms or attachments.
- **Idempotent and repeatable:** keyed on `aa_legacy_post_id` and `aa_legacy_term_id`. A rerun updates migrated fields only if the new record has not been edited since migration (tracked by a stored hash); edited records are skipped and reported.
- **References** are assigned once and never changed by reruns.
- **Coexistence:** the new types have different names and URLs, so both systems run side by side on staging until cutover. Rollback = deactivate `trigon-alaliah-core`.
- **Logging:** every write is logged with legacy ID, new ID, field and value source.

**Sequence after approval:**
1. Build and deploy the model.
2. Dry run (full).
3. Review the report together.
4. Execute T1 and T2 only (`--set=t1t2`).
5. QA relationships, admin and frontend on staging; confirm legacy data untouched.
6. **Stop.** Approve broad migration.
7. Execute the rest.
8. Editorial review using the Data Quality screen.
9. Cutover and redirects (separate approval).

## 21. Resolved points

| Question | Resolution (D-034) |
|---|---|
| Developer URL | Plural: `/developers/{slug}/` |
| Permits | `123564` kept as unverified and not public; extensible permit entries (§7) |
| T3 | Provisional; not linked until confirmed |
| 31083, 31094 | Left unlinked and flagged |
| Al Reef Downtown | Abu Dhabi, with the legacy value kept in the audit |
| Names | Azizi Developments corrected; Saas Properties kept until the official spelling is confirmed |

**Still open (not blocking):**
- the developer and project for 31083 and 31094;
- independent confirmation for T3;
- the official spelling of SAAS;
- the advertising permit requirements per emirate (Q-permits).

## 22. Approval record

Approved 2026-10-07 (D-034), with the decisions in §0. Implementation proceeds per the [implementation plan](./stage-03-2-implementation-plan.md), which stops before any write migration until the backup gate is met, and stops again after the T1 and T2 test.

---

## Appendix: legacy data detail

### A. Legacy post types
| Post type | Published | Fate |
|---|---|---|
| `estate_property` | 14 | 11 → properties, 3 → projects |
| `estate_developer` | 17 | → developers (draft) |
| `estate_agent` | 1 | → agent (office) |
| `estate_review` | 17 (theme demo) | Not migrated; never published |
| `membership_package` | 17 | Not migrated |
| `wpestate-studio` | 3 | Not migrated (legacy templates) |
| `elementor_library` / `elementor-hf` | 33 / 3 | Not migrated |
| `page` | 27 (+3 draft) | Content review only (W9) |
| `attachment` | 553 (261 listing images) | Reused in place |

### B. Legacy property meta (124 keys)
| Group | Keys | Fate |
|---|---|---|
| Core data | `property_price`, `_bedrooms`, `_bathrooms`, `_size`, `_address`, `_label_before`, `prop_featured`, `property_agent` | Mapped (§18.3) |
| Site custom fields | `property-agency`, `property-handover`, `madhmoun-permit`, `overall-payment-plan`, `payment-on-booking`, `payment-during-construction`, `payment-on-handover` | **Mapped exactly** (§7) |
| Misused or derived | `property-external-construction`, `hidden_address`, `image_to_attach`, `property_rooms`, `property_agent_secondary`, `property_country` | Merged, cross-checked or dropped as listed |
| Invalid | `property_latitude`, `property_longitude` | Not migrated; flagged |
| Media | `wpestate_property_gallery`, `_thumbnail_id`, `use_floor_plans`, `plan_*` (empty) | Galleries mapped; plans empty |
| Analytics | `wpestate_total_views`, `_eael_post_view_count`, `wpestate_detailed_views` | Not migrated |
| Presentation and empty US-template fields | ≈ 90 keys (`page_header_*`, `topbar_*`, `sidebar_*`, energy and EPC, HOA, garage, roofing, `mls`, `property_internal_id`…) | Not migrated |
| Private | `owner_notes`, `property_user` | Empty; not migrated |

### C. Legacy code dependencies
- **WPCode `[wpres_meta]` shortcode:** used in 4 posts and in legacy Elementor property templates. Retired with them.
- **WPResidence Studio templates:** render current property pages; they break at the theme switch (W9), which is expected.
- **WPForms forms** (Contact Us, Register Interest, Request Consultation): an unconnected Constant Contact provider; lead handling is W7.
