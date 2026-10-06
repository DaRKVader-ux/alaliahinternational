# Stage 03.2: Data and Content Model Report

**Status:** presented 2026-10-06 for approval. Discovery and recommendation only: **nothing has been mutated or migrated.**
**Source:** staging WordPress (`alaliah.trigonsolutions.co`, table prefix `wp8g_`), read through Novamira `execute-php` with read-only queries on 2026-10-06. Staging is a production clone (D-015), so these figures describe the current live data.
**Privacy:** agent contact fields and any owner or user fields were counted, never printed.

---

## 1. Summary

| Question | Answer |
|---|---|
| Source of truth (Q3) | **WordPress itself.** No feed, importer, CRM sync or portal integration exists (§2) |
| Inventory (Q4) | **14 published listings**: 11 Abu Dhabi, 3 Dubai. 6 rent, 3 ready sale, 5 off-plan, 0 commercial (§3) |
| Data quality | Usable as seed content, not as a model. No usable coordinates, no listing references, no projects, no developer links, purpose and completion mixed in one taxonomy, 4 of 14 listings misclassified or self-contradictory (§5) |
| Recommendation | **Path B: migrate into Trigon-owned types managed by `trigon-alaliah-core`.** No strong technical reason favours A; the small dataset makes B cheap now and A costly later (§7) |

## 2. Source of truth (Q3)

Evidence that WordPress is the only record:
- **Plugins:** none of the 20 active plugins imports, syncs or exports listings. The MLS Import add-on bundled with WPResidence was **never installed**; only a leftover option (`mlsimport_onboarding_current_step = welcome`) remains.
- **Scheduled jobs:** no import or sync jobs. The only WPResidence job is `prefix_wpestate_cron_generate_pins_daily` (map pin cache).
- **Listing references:** `property_internal_id` and `mls` are empty on all 14 listings, so no external ID exists to match against.
- **Authorship:** every listing was entered by hand (authors 1 and 3, Feb to Apr 2026).
- **Forms:** three WPForms forms (Contact Us, Register Interest, Request Consultation) carry an unconnected Constant Contact provider. That covers leads, not listings.

**Consequence:** D-004's "idempotent importer" becomes a **one-time migration**. From then on, WordPress admin is the system of record. **The editing experience for agents becomes part of the product** (§8.5).

## 3. Inventory (Q4)

Published `estate_property` posts: **14**. There are no drafts, private or pending listings. The figures below count the *published* records; their real-world availability was not verified.

### By purpose
| Purpose | Count | Listings |
|---|---|---|
| **Rent** | 6 | 30967, 31002, 31013, 31023, 31521, 31571 |
| **Buy: ready** | 3 | 30964, 31082, 31495 |
| **Buy: off-plan** | 5 | 31083, 31094 (Abu Dhabi); 32060, 32078, 32101 (Dubai) |
| **Buy total** | **8** | Ready + off-plan |
| **Commercial** | **0** | No commercial category or listing exists |

Three of the five off-plan records (the Dubai ones) are project pages, not units: they have no price, bedrooms or size (§5).

### By emirate
| Emirate | Count |
|---|---|
| Abu Dhabi | 11 |
| Dubai | 3 |

### By area or community
| Area | Emirate | Count |
|---|---|---|
| Al Raha | Abu Dhabi | 3 |
| Al Khalidiya | Abu Dhabi | 2 |
| Al Reef Downtown | Abu Dhabi | 2 |
| Al Reem Island | Abu Dhabi | 1 |
| Khalifa City | Abu Dhabi | 1 |
| Madinat Al Riyad | Abu Dhabi | 1 |
| Yas Island | Abu Dhabi | 1 |
| Business Bay | Dubai | 2 |
| Dubai South | Dubai | 1 |
| Saadiyat ("Sadiyat Island"), Dubai Creek, Dubai Investment Park, JBR | | 0 (terms exist, no listings) |

### By developer
| Developer | Count | How known |
|---|---|---|
| Azizi | 1 (32060) | Title and description text only |
| Danube | 1 (32078) | `property-agency` text and description |
| Binghatti | 1 (32101) | `property-agency` text and description |
| **Not recorded** | **11** | No structured developer link exists for any listing |

None of the 17 `estate_developer` records is linked to any listing (no meta, no taxonomy). The two Abu Dhabi off-plan units (31083 Khalifa City, 31094 Al Raha) name no developer anywhere.

### By property type
| Type (as stored) | Count | Note |
|---|---|---|
| Apartments | 10 | Includes 31023 ("5-bedroom Villa") and 32060 ("Waterfront Villas"), so stored types are wrong in at least 2 cases |
| Villa | 3 | |
| Townhouse | 1 | |

### Featured
3 listings carry `prop_featured = 1`: 31002, 31023 and 31495.

## 4. Current data model (WPResidence)

### 4.1 Post types
| Post type | Rewrite | Published | Role | Migrate? |
|---|---|---|---|---|
| `estate_property` | `/properties/` | 14 | Listings | **Yes** |
| `estate_developer` | `/estate_developer/` | 17 | Developers (logo + name) | **Yes, as drafts for verification** |
| `estate_agent` | `/agents/` | 1 | One generic agent, "Al Aliah International" | Yes (as the company contact); real agent profiles needed |
| `estate_review` | (private) | 17 | Theme demo testimonials (Q9) | **No: never publish** |
| `membership_package` | (private) | 17 | Theme front-end submission packages | No |
| `wpestate-studio` | | 3 | Elementor property templates | No (legacy presentation) |
| `elementor_library`, `elementor-hf` | | 33 / 3 | Page-builder templates | No |
| `page` | | 27 (+3 drafts) | Legacy pages (W9) | Content review only |
| `attachment` | | 553 | Media, of which 261 are listing images | Reused in place |

**No project post type exists.** Off-plan projects are stored as property posts.

### 4.2 Taxonomies on properties
| Taxonomy | Hierarchical | Terms | Content | Problem |
|---|---|---|---|---|
| `property_action_category` | yes | 3 | **Off Plan (5), Ready (slug `sell`, 3), Rent (6)** | Mixes *purpose* (sale or rent) with *completion* (ready or off-plan) |
| `property_category` | yes | 3 | Apartments (10), Villa (3), Townhouse (1) | No commercial types; misclassifications |
| `property_city` | yes | 2 | Abu Dhabi (11), Dubai (3) | Separate from area; no hierarchy |
| `property_area` | yes | 13 | Communities (§3) | The area-to-city link lives in an option (`taxonomy_{term_id}['cityparent']`), not in the taxonomy. **Al Reef Downtown is mapped to Dubai** there, while its listings say Abu Dhabi. "Sadiyat" is misspelled |
| `property_county_state` | yes | 1 | "United Arab Emirates" on 6 of 14 | Redundant |
| `property_features` | yes | 41 | Mixed amenities | Duplicates (Balcony/balcony, Central Air vs Central air conditioning, Pool vs Swimming Pool, Smoke detector vs Smoke detectors, Gym vs Fully-equipped gym); US-template items (Heating, Natural Gas, Fireplace); marketing phrases ("Investor-Friendly", "High-end restaurants and cafés"); unit features and building amenities mixed |
| `property_status` | yes | 5 | Active (11), hot offer (3), new offer (1), open house, Sold | Marketing labels, not a lifecycle. The 3 Dubai records have none |

**Agent and developer taxonomies** (10 more, e.g. `property_city_agent`, `property_area_developer`) contain only theme demo terms: New York, Manhattan, Queens, Tripoli, Barcelona, São Paulo, Toronto, Gurugram, "Foreclosures". **None of them migrates.**

**Area term data** (in `taxonomy_{id}` options): `cityparent`, a featured image (11 of 13 set, mostly WhatsApp photos), country, zoom. Latitude and longitude are empty on every term.

### 4.3 Property meta: 124 keys
Every listing carries all 124 keys (WPResidence writes defaults). By use:

| Group | Keys | Filled | Notes |
|---|---|---|---|
| **Core listing data** | `property_price` | 11/14 | AED; empty on the 3 Dubai project records |
| | `property_bedrooms`, `property_bathrooms` | 14/14 | 0 on 2 project records (meaning "not applicable", stored as zero) |
| | `property_size` | 14/14 stored; **11 meaningful** | Square feet (`wp_estate_measure_sys = ft`); 0 on 3 listings means "unknown". Built-up area and plot area are not distinguished (31495: 11,510 sq ft) |
| | `property_rooms` | 14/14 | Redundant with bedrooms |
| | `property_label_before` | 1/14 | "Yearly" on one rental; rent period otherwise implicit |
| | `property_address` | 11/14 | Free text, e.g. "Marina Square, Al Reem Island, Abu Dhabi" |
| | `hidden_address` | 14/14 | Theme's composed address string |
| | `property_country` | 14/14 | Always "United Arab Emirates" |
| | `property_latitude`, `property_longitude` | 14/14 stored, **0 usable** | 13 are `0,0`; 30964 holds `40.7079, -74.0109` (lower Manhattan, a theme default) |
| | `prop_featured` | 3/14 = 1 | Boolean |
| | `property_agent` | 14/14 | All point to the one generic agent (30966) |
| | `property_agent_secondary` | 9/14 | Serialized array, same agent |
| **Off-plan (site-added custom fields)** | `property-handover` | 3/14 | Free text: "Q1 2029", "June 2029", "Q2, 2027" |
| | `overall-payment-plan` | 3/14 | "85/15", "70/30" |
| | `payment-on-booking`, `payment-during-construction`, `payment-on-handover` | 2–3/14 | Percent strings |
| | `property-agency` | 6/14 | **Mixed meaning:** developer names on Dubai records (Danube, Binghatti), a broker on 32060 ("Rainbow Properties", although the project is Azizi's), and "Al Aliah International Real Estate" on 3 others |
| | `property-external-construction` | 3/14 | Misused: holds project description text |
| | `madhmoun-permit` | 1/14 | One value ("123564") on a **Dubai** record. Madhmoun is Abu Dhabi's listing system, so the value and field both need verification |
| | `stories-number`, `structure-type` | 14/14 | Always "Not Available" |
| **Media** | `wpestate_property_gallery` | 14/14 | Serialized ordered array of attachment IDs |
| | `image_to_attach` | 14/14 | Comma-separated duplicate of the gallery |
| | `_thumbnail_id` | 14/14 | Cover image |
| | `use_floor_plans`, `plan_*` | flag set on 3; plans 0 | **No floor plans exist** |
| | `embed_video_*`, `embed_virtual_tour`, `property_custom_video` | 0 | Unused |
| **Analytics** | `wpestate_total_views`, `_eael_post_view_count` | 14/14 | View counters (e.g. 102–329) |
| | `wpestate_detailed_views` | 14/14 | Serialized per-day views |
| **Theme presentation** | `page_header_*`, `topbar_*`, `sidebar_*`, `header_*`, `local_*`, `page_custom_*`, `min/max_height`, `google_camera_angle`, `property_theme_slider`, `rev_slider`, `rs_page_bg_color`, `page_show_adv_search`, `page_use_float_search`, `adv_filter_*`, `current_adv_filter_*`, `keep_min/max` | default values | Layout settings only: **not data** |
| **Empty everywhere** | `mls`, `property_internal_id`, `property_zip`, `property-year`, `property-date`, `property-garage*`, `property-basement`, `property-roofing`, `exterior-material`, energy and EPC fields (8), `property_hoa`, `property_year_tax`, `property_lot_size`, `property_second_price*`, subunit fields, `property_booking_shortcode` | 0 | US-template fields; none apply |
| **Private** | `owner_notes`, `property_user` | 0 | Empty; values not printed |

**Serialized or theme-specific data to unpack, not copy:**
- `wpestate_property_gallery` and `property_agent_secondary`, which are PHP-serialized arrays;
- `wpestate_detailed_views`;
- the area `taxonomy_{id}` options;
- Redux theme options (`wpresidence_admin`: currency AED, symbol "د.إ", measure sq ft).

### 4.4 Developers (17)
Arada, Azizi ("Developements", misspelled), Binghatti, Burtville, Damac, Danube, Dubai Properties, Ellington, Emaar, MAG, Meraas, Nakheel, Nine Yards, Omniyat, Reportage, Saas, Sobha.
- **Content:** 0 to 12 words of text each; all 23 developer meta fields (address, licence, website, social links and so on) are **empty on all 17**.
- **Logos:** 17 present, but of mixed quality. Several are **screenshots** (e.g. `Screenshot-2026-04-06-164422.png`), sizes range from 183×51 to 2560×1809, and formats are mixed.
- **Links to listings:** none.
- **Coverage:** mostly Dubai-based developers; Arada is Sharjah-based and Reportage is the only Abu Dhabi-based one. Abu Dhabi's largest developers are absent, which conflicts with Abu Dhabi as the lead market (D-032).
- **Verdict:** a name list, not data. Each record needs verification and an approved logo before publishing (D-031).

### 4.5 Agents (1)
"Al Aliah International", with phone, mobile, email, position and `agent_custom_data` filled (values withheld). There are no individual agent profiles and no BRN fields. The IA's agent-led trust depends on real profiles (Q9).

### 4.6 Media and galleries
| Measure | Value |
|---|---|
| Listing images | 261 JPEGs, 33.5 MB; all files present |
| From WhatsApp exports | **167 of 261** (64%) |
| Width ≥ 2400 px | **0** (Tier A/B threshold) |
| Width 1600–2399 | 43 |
| Width 1280–1599 | 124 |
| Width < 1280 | 94 |
| Alt text filled | **0 of 261** |
| Images shared between listings | 23: listing 31082 (2BR, AED 1,170,000) reuses 23 of the photos of 30964 (studio, AED 699,000), both in Al Reef Downtown. One of the two has the wrong photos |
| Per-photo room tags | None (Room index needs them; it stays optional) |
| Registered image sizes | 23 (mostly theme-specific); regenerated for the new theme |

### 4.7 Legacy code dependencies
- **WPCode snippet** (published): registers the `[wpres_meta key="…"]` shortcode, which prints any property meta. It is used in 4 posts and in Elementor data on 143 post-meta rows (Studio property templates). It dies with the legacy templates and is not needed by the new theme.
- **WPResidence Studio templates** (3) render the current property pages. Switching theme breaks them (W9), which is expected.

## 5. Data-quality findings per listing

| ID | Title (as stored) | Issues |
|---|---|---|
| 30964 | Luxurious Studio for Sale Prime Location… | Slug says "stunning-2bhk-apartment"; stored 1 bed; Manhattan coordinates; its photos are reused by 31082 |
| 30967 | Fully Furnished Luxury 4 Master Bedroom with Private Pool | Typed Apartment; size 0 |
| 31002 | Stunning 2BHK with Balcony… | |
| 31013 | Fully Furnished 1bd \| Marina Square \| Vacant | |
| 31023 | Spacious 5-bedroom Villa… | **Typed Apartment** |
| 31082 | Investor Deal \| 2BR \| High ROI… | **Photos belong to 30964**; "High ROI" is an unsupported claim |
| 31083 | Luxurious 4 Bd Townhouse \| Private Pool \| 10% discount | Off-plan, no developer, project, handover or payment plan |
| 31094 | Luxury Apartment \| Beach Access \| Invest Now | Off-plan, no developer or project recorded |
| 31495 | Premium 5 Master Bedroom Villa… | Size 11,510 sq ft, probably plot rather than built-up area |
| 31521 | 5 Master Bedroom + Maid Villa… | |
| 31571 | Lavish spacious 3BR + Balcony… | No features |
| 32060 | Premium Luxury Waterfront Villas… Azizi Venice | **A project, not a unit**; typed Apartment; no price; "agency" field names a broker |
| 32078 | Premium 1-4 Bedroom Apartments at Bayz 102 | **A project**; beds, price and size 0 |
| 32101 | Premium Luxury Apartments at Binghatti Aquarise | **A project**; permit field holds an unverified value |

**Cross-cutting issues:**
- **Coordinates:** none usable (Q3, A5 confirmed). Maps run at community level.
- **Listing references:** none exist. The new model assigns them (§8.2).
- **Titles:** sales-style titles ("Exclusive Offer", "Invest Now", "10% discount", "High ROI") conflict with the brand voice (D-027 study §12). Structured titles are generated from data; the marketing headline is optional and edited.
- **Rent period:** stated once ("Yearly") and implied elsewhere.
- **Advertising permits:** recorded on 1 listing, a Dubai one, in an Abu Dhabi-named field. The client should confirm which permit each listing must display (Abu Dhabi and Dubai use different systems).

## 6. Gaps against the approved IA (Stage 03.1)

| IA requires | Current data | Gap |
|---|---|---|
| Project entity | None | Create; seed from the 3 Dubai records |
| Developer → Project → Property links | None | Create links; fill by hand for the 5 off-plan records |
| Area hierarchy (emirate › community) | Separate city and area taxonomies; link in options; one wrong | Single hierarchical location taxonomy |
| Purpose and completion as separate facets | Mixed in one taxonomy | Split |
| Commercial category | None | Add (empty at launch) |
| Persistent `{ref}` in property URLs | None | Assign |
| Area posts for community stories | Term images only | Create Area posts; write copy |
| Listing lifecycle (active, under offer, let, sold, withdrawn) | Marketing labels | Replace |
| Coordinates | None usable | Community-level until entered |
| Room tags (Room index) | None | Optional; add per photo when the Room index is used |
| Alt text | 0 of 261 | Required (WCAG); write during migration QA |
| Agents with BRN | One generic agent | Client content (Q9) |

## 7. Path comparison: A (preserve `estate_*`) vs B (Trigon-owned model)

| Criterion | A. Re-register `estate_*` in our plugin | B. Migrate into Trigon-owned types |
|---|---|---|
| Independence from WPResidence | Achievable only by registering the same names, while inheriting its data shape | **Complete**: our names, our schema |
| Coexistence on staging during the build | **Conflicts**: both plugins register the same post types and taxonomies while WPResidence is active | **Clean**: old and new run side by side; compare, then switch |
| Rollback | Hard: shared tables and names | **Simple**: deactivate the new plugin; legacy data untouched |
| Data shape | Keeps 124 keys (≈ 90 presentation or empty), serialized galleries, purpose and completion mixed, area-to-city link in options, mirrored demo taxonomies | Typed, registered meta (REST schema); one location taxonomy; clean facets |
| Fit to the approved IA | Needs projects, links and areas added anyway, mixing two models | **Native fit**: Developer, Project, Property, Area |
| Migration effort | Low for data, high for cleanup | **Low overall**: 14 listings, 17 developers, 1 agent, 13 areas, 261 images (reused in place) |
| URL continuity | Keeps `/properties/{slug}/` | Needs about 45 redirects (14 listings, 17 developers, 1 agent, terms). Production is `noindex` (P1), so little equity is at risk |
| Long-term cost | Every future feature works around WPResidence's model | Owned and documented |
| Strong reason against? | | **None found.** The only argument for A is avoiding migration, and the data needs human correction either way (§5) |

**Recommendation: Path B.** The dataset is small enough that migration costs hours, not weeks, and the data needs human review regardless. A would carry the legacy shape forward and cannot coexist with WPResidence while the legacy pages are still needed on staging.

## 8. Target model (Path B, for approval)

Names are prefixed to avoid collisions. Post type keys are kept within WordPress's 20-character limit.

### 8.1 Post types (`trigon-alaliah-core`)
| Post type | Rewrite (IA §5) | Purpose |
|---|---|---|
| `alaliah_property` | `/property/{slug}-{ref}/` | Units for sale or rent |
| `alaliah_project` | `/projects/{slug}/` | Developments (mostly off-plan) |
| `alaliah_developer` | `/developers/{slug}/` | Developers |
| `alaliah_area` | `/areas/{emirate}/{community}/` | Editorial story for an emirate or community; paired with a location term |
| `alaliah_agent` | `/team/{slug}/` | People |
| `alaliah_insight` | `/insights/{slug}/` | Articles |

### 8.2 Taxonomies
| Taxonomy | Applies to | Terms |
|---|---|---|
| `alaliah_location` (hierarchical) | property, project, agent | Emirate › community › sub-community or building. Seeded from the current city and area terms, with Al Reef Downtown corrected to Abu Dhabi and "Sadiyat" to "Saadiyat Island" |
| `alaliah_purpose` | property | Sale, Rent |
| `alaliah_completion` | property, project | Ready, Off-plan |
| `alaliah_category` | property | Residential, Commercial |
| `alaliah_type` | property | Apartment, Villa, Townhouse, Penthouse, Duplex, Office, Retail, Warehouse… Studio is expressed as 0 bedrooms, not a type |
| `alaliah_feature` | property | Unit features (curated and de-duplicated; about 20) |
| `alaliah_amenity` | project, property | Building or community amenities (pool, gym, security…) |

### 8.3 Property fields (registered meta, typed, exposed in REST)
| Field | Type | From |
|---|---|---|
| `aa_ref` | string, unique, immutable | `AA-` + legacy post ID for migrated listings (e.g. `AA-31521`); new listings receive the next sequence |
| `aa_price` | integer AED | `property_price` (empty → null, never 0) |
| `aa_rent_period` | enum: yearly, monthly | Default yearly; `property_label_before` |
| `aa_bedrooms` | integer, 0 = studio | `property_bedrooms` |
| `aa_bathrooms` | integer | `property_bathrooms` |
| `aa_size_builtup` | number, sq ft | `property_size` (0 → null) |
| `aa_size_plot` | number, sq ft | New; editor confirms for villas (31495) |
| `aa_furnishing` | enum: furnished, unfurnished, partly | New (titles mention furnishing; set by editor) |
| `aa_listing_state` | enum: active, under offer, let, sold, withdrawn | Replaces `property_status` |
| `aa_is_featured` | boolean | `prop_featured` |
| `aa_project_id` | post ID | New |
| `aa_developer_id` | post ID, only when there is no project | New |
| `aa_agent_id` | post ID | `property_agent` |
| `aa_lat`, `aa_lng`, `aa_geo_precision` | numbers; enum: exact, building, community | `0,0` and non-UAE values are rejected; precision defaults to community |
| `aa_address_display` | string | `property_address`, cleaned |
| `aa_permit_number`, `aa_permit_authority`, `aa_permit_verified` | string; enum; boolean | `madhmoun-permit`, after verification |
| `aa_headline` | string, optional | Edited marketing headline; the structured title is generated |
| `aa_gallery` | ordered attachment IDs | `wpestate_property_gallery` (unserialized) |
| `aa_floorplans` | attachment IDs | None at present |
| `aa_legacy_id` | integer, private | Source `estate_property` ID, for redirects and audit |

**Per attachment:** `aa_room` (Room index, optional), `aa_is_render` (labels "Developer render"), `aa_tier` (A/B/C/D, see `alaliah-design-system`), plus core alt text.

### 8.4 Project and developer fields
- **Project:**
  - developer (required);
  - location;
  - completion;
  - handover (`aa_handover_quarter`, as a date plus a "Q" display);
  - payment plan (booking %, during construction %, on handover %, with a summary such as "70/30");
  - unit types;
  - starting price (derived from units when any exist);
  - brochure;
  - masterplan;
  - amenities;
  - description;
  - gallery.

  The three Dubai records seed Azizi Venice, Bayz 102 and Binghatti Aquarise.
- **Developer:**
  - logo (approved);
  - about (sourced);
  - source references;
  - website;
  - external rating block (source, URL, score, count, retrieved date, refresh policy, per D-032; empty at launch);
  - `aa_verified` (blocks publishing until checked).

### 8.5 Admin editing (WordPress is now the record)
- **Native meta boxes in `trigon-alaliah-core`.** These carry validation (no 0 for unknown values, UAE coordinate bounds, required facets per purpose) and an editor checklist of **QA flags**: missing alt text, size 0, type versus title mismatch, sales-style title words, photos reused by another listing, missing permit.
- **No ACF dependency** (it is not active; ACF Pro would be a paid licence and a third-party runtime dependency). This is the recommendation; ACF Pro remains the alternative if faster admin UI matters more than independence.

### 8.6 Search storage (W4)
At 14 listings, D-006's default applies: `WP_Query` on taxonomies plus typed meta. A denormalised index table is deferred until active listings exceed roughly 1,000 or the measured search-response budget fails. The schema keeps price, beds, size and coordinates as typed numbers, so the table can be added later without remodelling.

## 9. Field mapping (WPResidence → Trigon)

| WPResidence | Trigon | Action |
|---|---|---|
| `estate_property` post (title, content, slug, date, author) | `alaliah_property` | Copy. Title regenerated; old title kept as `aa_headline` only when the editor approves |
| `property_action_category` | `alaliah_purpose` + `alaliah_completion` | Split: Rent → Rent/Ready; Ready (`sell`) → Sale/Ready; Off Plan → Sale/Off-plan |
| `property_category` | `alaliah_type` + `alaliah_category` | Map; fix 31023 and 32060 by hand |
| `property_city` + `property_area` + area `cityparent` | `alaliah_location` | Merge into one hierarchy; correct Al Reef Downtown and Saadiyat |
| `property_county_state`, `property_country` | | Drop (implied) |
| `property_features` | `alaliah_feature` / `alaliah_amenity` | De-duplicate and split; drop US-template and marketing terms |
| `property_status` | `aa_listing_state` | Active → active; marketing labels dropped |
| `property_price`, `_bedrooms`, `_bathrooms`, `_size` | `aa_price`, `aa_bedrooms`, `aa_bathrooms`, `aa_size_builtup` | Copy; zeros become null where they mean "unknown" |
| `property_latitude/longitude` | `aa_lat/lng` | **Not migrated** (none valid) |
| `prop_featured` | `aa_is_featured` | Copy |
| `property_agent` | `aa_agent_id` | Copy |
| `wpestate_property_gallery`, `_thumbnail_id` | `aa_gallery`, featured image | Unserialize; attachments reused in place (no re-upload) |
| Off-plan custom fields (handover, payment plan) | Project fields | Move to the project; 3 Dubai records become projects |
| `property-agency`, `property-external-construction` | Project developer / description | Resolve by hand |
| `madhmoun-permit` | `aa_permit_*` | Copy as unverified |
| `estate_developer` (title, logo) | `alaliah_developer` (draft, unverified) | Copy name and logo; fix "Azizi Developments" |
| `estate_agent` | `alaliah_agent` | Copy as the company contact |
| Theme presentation, analytics, empty US fields (≈ 100 keys) | | **Not migrated**; they stay on the legacy posts untouched |
| `estate_review`, `membership_package`, agent and developer taxonomies | | **Not migrated** |

## 10. Migration plan (after approval; nothing runs before then)

1. **Gate:** a verified, restorable backup (E3) and staging write boundaries respected (E1).
2. **Code in Git:** `trigon-alaliah-core` registers the new types, taxonomies and fields. It is deployed through the approved ZIP route (D-023).
3. **Migration as a WP-CLI command in the plugin** (`wp alaliah migrate`):
   - **dry run by default**, printing a diff report;
   - idempotent, keyed on `aa_legacy_id`;
   - writes only new records;
   - **never edits or deletes legacy posts**;
   - logs every write.
4. **Human review queue:** the 14 listings, 3 projects and 17 developers go through the QA flags in §8.5. Developers stay draft until verified.
5. **Redirects:** `/properties/{slug}/` → `/property/{slug}-{ref}/`, `/estate_developer/{slug}/` → `/developers/{slug}/`, `/agents/…` → `/team/…`, area and city archives → `/areas/…`, all as stored 301s (SiteSEO redirections or the plugin).
6. **Side-by-side QA** on staging, then the theme switch (W9). The legacy WPResidence data stays in the database until migration is approved as complete.
7. **Rollback:** deactivate `trigon-alaliah-core`; legacy posts are unchanged.

## 11. Decisions requested
1. **Path B**, Trigon-owned types, as specified in §8.
2. **Naming:** the `alaliah_*` post types and taxonomies and the `aa_*` meta prefix.
3. **Listing references:** `AA-{legacy ID}` for migrated listings, sequential for new ones.
4. **Admin fields:** native meta boxes (recommended) or ACF Pro.
5. **Search storage:** standard queries now, with the index table deferred to the threshold in §8.6.
6. **Not migrated:** demo reviews, membership packages, theme presentation meta, view counters, invalid coordinates.

**Content needed from the client** (not blockers for approving the model):
- Developers and projects for 31083 and 31094.
- Which of 30964 and 31082 has the correct photos.
- Built-up versus plot area for 31495.
- Whether the three Dubai project records stay live (B1).
- Advertising permit numbers per listing.
- Verified developer logos.
- Real agent profiles with BRN (Q9).
