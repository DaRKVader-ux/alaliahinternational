# Stage 03.2: Implementation Plan (data layer and migration tooling)

**Status:** plan, 2026-10-07. Follows the approved model in [`stage-03-2-data-model-report.md`](./stage-03-2-data-model-report.md) (D-034). **Nothing in this plan has been built or run.**
**Scope:** the data layer in `trigon-alaliah-core`: post types, taxonomies, fields, admin editing, validation, and the migration command. **Out of scope:** the `alaliah-trigon` theme and all frontend presentation (Stage 05), redirects and cutover.

---

## 1. Gating note

The project rules say nothing is built before Stage 05 (D-026). This plan builds the **data layer** early, at the client's direction, so the model and migration can be proven on real data. The exception is recorded in D-034 and is limited to:
- `trigon-alaliah-core`: registration, admin, validation and migration;
- deployment to staging alongside WPResidence, with new records kept as drafts.

The theme, templates, search UI and any public-facing output stay gated.

**Consequence for "frontend QA" in the test step:** without the new theme, staging still renders through WPResidence. Frontend QA of the T1 and T2 records is therefore limited to:
- URLs resolve in the approved shape, via logged-in preview of draft records;
- REST responses carry the right relationships;
- nothing leaks publicly.

Relationship *rendering* is verified when the theme exists.

## 2. Plugin structure

```
trigon-alaliah-core/
├─ trigon-alaliah-core.php        Header: Trigon Solutions, GPL-2.0-or-later, requires WP 6.5+, PHP 8.1+
├─ src/
│  ├─ Plugin.php                  Bootstrap; no side effects on activation except rewrite flush
│  ├─ Model/PostTypes.php         §3
│  ├─ Model/Taxonomies.php        §4
│  ├─ Model/Meta.php              §5 (register_post_meta / register_term_meta)
│  ├─ Model/Seed.php              Fixed terms; run by `wp alaliah setup`, never on activation
│  ├─ Domain/References.php       AA-#### allocation (§6.1)
│  ├─ Domain/Relations.php        Canonical relationships + shadow-term sync (§6.2)
│  ├─ Domain/Permits.php          Permit entries and the legacy mirror (§6.3)
│  ├─ Domain/DeveloperReadiness.php  Identity vs publish readiness and the publish guard (§6.4)
│  ├─ Domain/Quality.php          Data-quality flags (§6.5)
│  ├─ Admin/PropertyEditor.php    Meta boxes per report §14
│  ├─ Admin/ProjectEditor.php, DeveloperEditor.php, AgentEditor.php, AreaEditor.php
│  ├─ Admin/FloorPlans.php        Image-first floor plan box (§7)
│  ├─ Admin/DataQuality.php       Tools › Data Quality (read-only), incl. relationship inspector
│  ├─ Rest/Fields.php             Public field names in REST; internal keys hidden
│  └─ Cli/                        `wp alaliah …` commands (§8)
├─ assets/admin/                  Vanilla JS + wp.media; no build step required
└─ tests/                         Fixture builder + integration checks (§10)
```

**Conventions:**
- namespace `Trigon\AlaliahCore`;
- text domain `trigon-alaliah-core`;
- **no third-party runtime dependencies** (no ACF);
- capabilities mapped to core roles (administrator, editor) until a role model is needed;
- every string translatable, so the plugin is ready for Arabic.

## 3. Post type registration

All post types share these arguments:
- `show_in_rest => true` with a public `rest_base`;
- `map_meta_cap => true`;
- `capability_type => 'post'`;
- `hierarchical => false`;
- `rewrite => ['slug' => <public>, 'with_front' => false]`;
- `delete_with_user => false`.

`with_front => false` matters because the site's permalink structure is date-based (`/%year%/%monthnum%/%day%/%postname%/`).

| Key | Public rewrite slug | `has_archive` | `rest_base` | `supports` | Menu | Notes |
|---|---|---|---|---|---|---|
| `alaliah_property` | `property` | `false` (listing pages are search landings, IA §5) | `properties` | title, editor, thumbnail, author, revisions | "Properties" | `/property/{base-slug}-aa-1010/` per the URL rule in §6.1 |
| `alaliah_project` | `projects` | `projects` | `projects` | title, editor, thumbnail, revisions | "Projects" | |
| `alaliah_developer` | `developers` | `developers` (titled "All Developers") | `developers` | title, editor, thumbnail, revisions | "Developers" | Plural, per D-034 |
| `alaliah_area` | `areas` | `areas` | `areas` | title, editor, thumbnail, revisions | "Areas" | Custom permalink: `/areas/{emirate}/{community}/` from the paired location term |
| `alaliah_agent` | `team` | `team` | `team` | title, editor, thumbnail | "Team" | |
| `alaliah_insight` | `insights` | `insights` | `insights` | title, editor, thumbnail, excerpt, revisions | "Insights" | Registered now; no content |

**Rewrite checks on staging** (2026-10-07, read-only):
- none of these bases matches an existing rewrite rule;
- WPResidence uses `properties`, `agents` and `estate_developer`, so there is no clash;
- the only same-slug page is a **draft** "Developers List" (`developers`, ID 22997). It doesn't route while it is a draft, and it must not be published.

**Draft-preview frontend:** while WPResidence is the active theme, the new post types render through its generic templates. That is acceptable for staging preview, and the records stay draft.

## 4. Taxonomy registration

All taxonomies share these arguments:
- `public => false`, `publicly_queryable => false`, `rewrite => false`, `query_var => false`;
- `show_ui => true`, `show_in_rest => true`, `show_admin_column` where useful;
- `meta_box_cb => false`, because the editors render their own single-choice controls.

| Key | Object types | Hierarchical | Seeded terms (`wp alaliah setup`) |
|---|---|---|---|
| `alaliah_location` | property, project, agent, area | yes | None at setup. Built by the migration from legacy data (report §12), rooted at UAE |
| `alaliah_purpose` | property | no | Sale, Rent |
| `alaliah_completion` | property, project | no | Ready, Off-plan |
| `alaliah_status` | property | no | Available, Under offer, Rented, Sold, Withdrawn |
| `alaliah_category` | property | no | Residential, Commercial |
| `alaliah_type` | property | no | Apartment, Villa, Townhouse, Penthouse, Duplex, Office, Retail, Warehouse, Land |
| `alaliah_amenity` | property, project | yes | Parents: In the home; Building and community. Children are created from the approved term map (dry run phase 2) |
| `alaliah_rel_developer` | property, project | no | None; derived |
| `alaliah_rel_project` | property | no | None; derived |

**Shadow taxonomies** (`alaliah_rel_*`) are registered with:
- `show_ui => false`, `show_in_rest => false`, `show_in_quick_edit => false`;
- `capabilities` with `assign_terms`, `edit_terms`, `manage_terms` and `delete_terms` set to `do_not_allow`.

Only `Relations::sync()` writes them, through an internal context flag. Each shadow term stores `aa_target_post_id` term meta pointing to its developer or project.

## 5. Field registration

Fields are registered with `register_post_meta()`, using:
- `single => true`;
- `show_in_rest` with a JSON schema;
- `auth_callback => current_user_can('edit_post', $id)`;
- a typed `sanitize_callback`.

Keys use the `aa_` prefix and are hidden from the generic Custom Fields box through `is_protected_meta`. REST exposes **public names** (e.g. `price`, not `aa_price`) through `Rest/Fields.php`.

### 5.1 Property
| Key | Type (schema) | Default | Sanitise and validate |
|---|---|---|---|
| `aa_reference` | string, pattern `^AA-\d{4,}$` | none | Set only by `References`; edits rejected; REST read-only |
| `aa_legacy_post_id` | integer | none | Read-only; not in REST |
| `aa_price` | integer | none | ≥ 1, or empty; never 0 |
| `aa_rent_period` | string enum: yearly, monthly | yearly (Rent only) | Enum |
| `aa_bedrooms` | integer | none | 0–20 |
| `aa_bathrooms` | integer | none | 0–20 |
| `aa_size_builtup` | number | none | > 0, or empty |
| `aa_size_plot` | number | none | > 0, or empty |
| `aa_furnishing` | string enum: furnished, unfurnished, partly-furnished | none | Enum |
| `aa_property_agency` | string | none | Text, trimmed; **never read by any relationship code** |
| `aa_handover` | string | none | Text, trimmed |
| `aa_handover_year` | integer | none | 2000–2100; editor-confirmed only |
| `aa_project_id` | integer | none | Must reference an `alaliah_project` |
| `aa_developer_id` | integer | none | Must reference an `alaliah_developer`; ignored (read-only) while `aa_project_id` is set |
| `aa_agent_id` | integer | none | Must reference an `alaliah_agent` |
| `aa_building_term_id` | integer | none | A location term at building level |
| `aa_lat`, `aa_lng` | number | none | Within UAE bounds (lat 22.5–26.5, lng 51.0–56.5); `0,0` rejected |
| `aa_geo_precision` | string enum: exact, building, community | community | System-set |
| `aa_payment_plan_overall` | string | none | Text, trimmed |
| `aa_payment_on_booking` | string | none | Text, trimmed |
| `aa_payment_during_construction` | string | none | Text, trimmed |
| `aa_payment_on_handover` | string | none | Text, trimmed |
| `aa_madhmoun_permit` | string | none | Text, exactly as entered; mirrored only from a verified `madhmoun` entry; never displayed |
| `aa_permits` | array of objects | [] | Entry schema in §6.3 |
| `aa_gallery` | array of integers | [] | Each ID is an image attachment; order kept |
| `aa_floor_plans` | array of objects | [] | §7 |
| `aa_video_url` | string (uri) | none | YouTube or Vimeo hosts only |
| `aa_brochure_id` | integer | none | A PDF attachment |
| `aa_is_featured` | boolean | false | |
| `aa_quality_flags` | array of strings | [] | System-set |
| `aa_migration_audit` | object | none | System-set (§8.4); not in REST |
| `aa_migration_hash` | string | none | System-set |

Core data used as is: title, content, featured image (`_thumbnail_id`), author, dates.

### 5.2 Project
- `aa_developer_id`
- `aa_handover`, `aa_handover_year`
- the four payment-plan text fields
- `aa_madhmoun_permit`, `aa_permits`
- `aa_price_from` (integer)
- `aa_unit_types` (string)
- `aa_gallery`, `aa_floor_plans`
- `aa_brochure_id`, `aa_masterplan_id`, `aa_video_url`
- `aa_review_status` (verified, needs-review)
- `aa_legacy_post_id`, `aa_quality_flags`, `aa_migration_audit`, `aa_migration_hash`

Types and rules are the same as on property.

### 5.3 Developer
| Key | Type | Notes |
|---|---|---|
| `aa_logo_id` | integer | Image attachment; reuses the legacy thumbnail attachment |
| `aa_logo_approved` | boolean | Editor sets it |
| `aa_about` | string (HTML) | Approved public copy; empty at migration |
| `aa_about_legacy` | string | Legacy text; never rendered |
| `aa_about_approved` | boolean | Editor sets it |
| `aa_sources` | array of `{url, note}` | |
| `aa_website` | string (uri) | |
| `aa_review_status` | enum: verified, needs-review, probable-demo, duplicate, invalid | Identity |
| `aa_review_note` | string | |
| `aa_rating` | object `{source, url, score, count, retrieved_on, refresh_policy}` | Empty at launch (D-032) |
| `aa_legacy_post_id`, `aa_legacy_slug`, `aa_quality_flags`, `aa_migration_audit`, `aa_migration_hash` | | System |

### 5.4 Agent and Area
- **Agent:**
  - `aa_role`;
  - `aa_brn`;
  - `aa_languages` (array);
  - `aa_phone`, `aa_whatsapp`, `aa_email` (sanitised; email validated);
  - `aa_is_office`;
  - `aa_legacy_post_id`, `aa_migration_audit`.
- **Area:**
  - `aa_location_term_id`;
  - `aa_hero_id`;
  - `aa_name_ar`;
  - `aa_legacy_term_id`, `aa_migration_audit`.

### 5.5 Term meta
- **`alaliah_location`:**
  - `aa_level` (country, emirate, community, subcommunity, building);
  - `aa_area_post_id`;
  - `aa_legacy_term_id`, `aa_legacy_slug`;
  - `aa_migration_audit`, which holds e.g. the original `cityparent` "Dubai" for Al Reef Downtown.
- **Shadow terms:** `aa_target_post_id`.

## 6. Domain services (invariants)

### 6.1 References
- **Allocation:** `AA-` + an integer, starting at 1001. The next value is kept in the option `aa_reference_next` and taken with an atomic SQL `UPDATE … SET option_value = option_value + 1`, so concurrent saves never collide.
- **Migration order:** migrated listings take their numbers from a **deterministic map** built from the full legacy set (ascending original publish date, ties broken by legacy ID). Each listing gets the same reference whichever subset runs first. After the full migration, `aa_reference_next` is set past the highest assigned value.
- **Immutability:** set once, on first save or on migration. Any later write is rejected and logged. There is no admin input.
- **Uniqueness:** checked before assignment; a duplicate aborts the save with an error.
- **Reserved range:** `wp alaliah setup` reserves AA-1001 to AA-1011 for the 11 migrated listings (option `aa_reference_reserved`) and starts `aa_reference_next` at 1012. A listing created by hand before the full migration can never take a migrated listing's number.

**URL rule (D-035):**
- **Canonical reference:** `AA-1001`, stored in `aa_reference`, displayed as is.
- **URL token:** the reference in lower case, `aa-1001` (`strtolower(aa_reference)`).
- **Public URL:** `/property/{base-slug}-aa-1001/`. `{base-slug}` is the post slug, stored *without* the token.
- **Resolution** is by token only. Any request whose token matches but whose base slug differs, including the bare `/property/aa-1001/`, returns a 301 to the current canonical URL. A title or slug change therefore never breaks a link.
- **One function generates every property URL:** permalinks, canonical tags, sitemaps, REST `link`, the migration's redirect map, and the legacy redirects (`/properties/{legacy-slug}/` → `aa_legacy_post_id` → that function).
- **Implementation:** `References::token()`, `PropertyUrls::permalink()` (a `post_type_link` filter), a rewrite rule `^property/(?:.+-)?(aa-\d{4,})/?$` resolving by `aa_reference`, and a `template_redirect` canonical check. Post slugs never contain the token; if a token-like suffix appears in a slug, it is stripped on save.

### 6.2 Relations
- **Canonical:** `aa_project_id`, and `aa_developer_id` (on projects, and on properties without a project).
- **`sync($post_id)`** runs on `save_post_alaliah_property` and `save_post_alaliah_project`:
  - **property:** the developer is the project's developer, or else its own `aa_developer_id`. It writes exactly that one `alaliah_rel_developer` term and the one `alaliah_rel_project` term, and removes all others;
  - **project:** writes its developer term, then re-syncs every unit (cascade).
- **`wp alaliah relations rebuild [--verify]`:** recomputes all shadow terms from meta. With `--verify` it reports drift without writing.
- **Drift:** wherever terms and meta disagree, meta wins.
- **Agency rule:** no code path reads `aa_property_agency` when setting relationships. A unit test asserts this (§10).

### 6.3 Permits
- **Entry schema:**

  | Key | Type | Values |
  |---|---|---|
  | `number` | string | As issued |
  | `authority` | string | Free text until confirmed |
  | `system` | enum | `madhmoun`, `unspecified`; extensible by filter |
  | `status` | enum | `unverified`, `verified` |
  | `public` | boolean | Allowed only when verified |
  | `source` | string | |
  | `verified_on` | date | |
  | `origin` | string | e.g. `legacy:madhmoun-permit` |
- **Mirror:** when a `madhmoun` entry becomes verified, its number is copied into `aa_madhmoun_permit`. The legacy field is never parsed back into entries, except once, by the migration.
- **Output:** public templates (later) read only entries with `status = verified` and `public = true`.

### 6.4 Developer readiness
- **Readiness** is computed from: identity verified, logo approved, About approved, and at least one linked project or listing (the last is a warning only).
- **Publish guard:** on a transition to `publish`, the post reverts to draft if any blocking item is missing, with an admin notice listing what is missing.
- **Display:** the Data Quality screen and the developer list show **two columns, Identity and Readiness**.

### 6.5 Quality flags
The rules are as listed in the report §17, computed on save and by `wp alaliah quality scan`. Flags never block saving, except where a field validation rejects an invalid value (e.g. `0,0` coordinates).

## 7. Floor plans (image-first)

- **Data:** `aa_floor_plans`, an ordered list of items. Each item is
  `{id: int (required), title?, level?, unit_type?, bedrooms?, area?, note?}`.
- **Save rule:** an item is valid with `id` alone. Optional keys are trimmed, and empty ones are dropped before saving.
- **Admin box:**
  1. "Add floor plans" opens `wp.media` (multiple selection, upload or choose existing).
  2. Plans appear as a thumbnail row: drag to reorder, × to remove.
  3. Each plan has a collapsed "Add details (optional)" section with the six optional fields.
- **Minimum path:** add image, then Update. The plan is stored; no other input is needed.
- **Theme contract** (for Stage 05):
  - render each image in order;
  - render only the labels that hold values;
  - render no wrapper when the list is empty.

  The plugin exposes `aa_get_floor_plans($post)`, which returns normalised items with attachment URLs and alt text; alt defaults to "Floor plan" plus the title or property name.
- **Test:** an automated check saves a property with one bare image and asserts the item is stored and returned with an empty label set.

## 8. Migration command

### 8.1 Commands
| Command | Purpose | Writes |
|---|---|---|
| `wp alaliah setup` | Seed the fixed terms (§4) | Terms only, idempotent |
| `wp alaliah migrate plan [--set=…] [--ids=…] [--report=<dir>]` | **Dry run** of every phase; produces the report | **Nothing** in the database; report files only |
| `wp alaliah migrate run --execute [--set=…] [--ids=…]` | Executes the same plan | Creates `alaliah_*` posts, terms and `aa_*` meta only |
| `wp alaliah migrate status` | Shows migrated records against legacy | None |
| `wp alaliah migrate verify-legacy --baseline=<file>` | Fingerprints legacy data and compares it with a baseline (§9) | None |
| `wp alaliah relations rebuild [--verify]` | Shadow-term rebuild or drift check | Shadow terms only |
| `wp alaliah quality scan` | Recomputes flags | `aa_quality_flags` only |

`migrate run` without `--execute` behaves as `plan`. A lock (a transient with a run ID) prevents concurrent runs.

### 8.2 Phases
Each phase is the same in plan and run; the difference is a single write gate.

1. **Preflight:**
   - `home` is the staging host;
   - WPResidence post types are readable;
   - every referenced attachment file exists;
   - the baseline fingerprint is recorded.
2. **Locations:** UAE › emirates › communities from `property_city`, `property_area` and the `cityparent` options. Spelling and slug corrections are applied, each with an audit entry; conflicts (Al Reef Downtown) are resolved to the listing value and audited.
3. **Amenities:** applies the **approved** term map, a reviewed artefact produced from the first dry run. Unmapped legacy terms are reported, not created.
4. **Developers** (all 17): name (Azizi corrected; others as stored), slug (`azizi-developments`; others kept), logo attachment reused, `aa_about_legacy`, identity classification, `post_status = draft`.
5. **Agent:** the office record (draft).
6. **Projects** (32060, 32078, 32101):
   - content;
   - gallery IDs;
   - the seven fields where present (exact);
   - the permit entry for 32101;
   - location.

   Developer links only for approved sets (T1: 32078 → Danube; T2: 32101 → Binghatti). 32060 stays **unlinked**.
7. **Properties** (11):
   - reference from the deterministic map;
   - fields and taxonomies per the mapping (report §18);
   - gallery and featured image reused;
   - no relationships to developers or projects;
   - agent link.
8. **Relations:** run `sync` for every created project and property.
9. **Quality:** compute flags.
10. **Report:** write the files described in §8.5.

### 8.3 Safety guarantees (enforced in code)
- **Write allow-list:** the run context can only insert or update posts of type `alaliah_*`, terms in `alaliah_*` taxonomies, and `aa_*` meta. Any other write throws and aborts the phase. Legacy IDs are opened read-only.
- **No media mutation:** the code uses only attachment **IDs**. It never calls `wp_update_post` on an attachment, never changes `post_parent`, and never copies or regenerates files.
- **Idempotent:**
  - each created record stores `aa_legacy_post_id` (or `aa_legacy_term_id`); a rerun looks it up and updates rather than creating;
  - `aa_migration_hash` stores a hash of the migrated field values; if the current values differ (an editor changed the record), the record is **skipped and reported**, never overwritten;
  - references never change on rerun.
- **Status:** everything is created as `draft`. The migration never publishes.

### 8.4 Audit trail
Every created record carries `aa_migration_audit`:

```json
{
  "run_id": "2026-10-…-ab12",
  "source": {"type": "estate_property", "id": 32078},
  "original": {"property_city": "Dubai", "property_area": "Business Bay",
               "madhmoun-permit": "123564", "cityparent": "Dubai"},
  "transformations": ["name: Azizi Developements → Azizi Developments",
                      "location: cityparent Dubai → Abu Dhabi (listing value)"],
  "flags": ["unverified_permit"],
  "approved_set": "t1t2"
}
```

Only the original values of fields the migration read are stored there; contact values are stored by reference, not copied. The Al Reef Downtown correction is recorded on its location term.

### 8.5 Report
`plan` and `run` write `report.json`, `report.csv` and `summary.txt` to:
- `wp-content/trigon-migration/{run_id}/`, created with a deny-all `.htaccess` and an `index.php`, inside the staging docroot (D-020 boundary); or
- stdout only, with `--report=-`.

**Report contents:**
- per entity: the planned action (create, update, skip-edited, skip-unapproved) and the field-by-field values;
- the reference map;
- location corrections and conflicts;
- the unmapped amenities;
- all flags;
- relationship links;
- the redirect list (legacy URL → planned new URL), for later.

### 8.6 Controlled sets
| Set | Contents |
|---|---|
| `t1t2` (approved) | **Developer → Project → Area relationship test.** Location terms UAE › Dubai › Business Bay; developers 32018 (Danube) and 32040 (Binghatti); projects 32078 (Bayz 102 → Danube) and 32101 (Binghatti Aquarise → Binghatti). No properties |
| `p1` (approved) | **Property data-model test.** Location terms UAE › Abu Dhabi › Al Reem Island; the office agent; property 31013 → AA-1004. The building and sub-community are recorded as a proposal only (flag `building_unconfirmed`) |
| `full` | Everything in §8.2, with T1 and T2 links only |

T1 and T2 prove Developer → Project → Area. P1 proves the property model. **No test proves Project → Property**: no verified unit-to-project relationship exists yet.

## 9. Proving legacy data is untouched

`migrate verify-legacy` fingerprints, before and after any run:
- the IDs, `post_modified` and content hashes of all `estate_*` posts;
- a hash of their post meta;
- the `term_relationships` of the legacy taxonomies, and the legacy `term_taxonomy` and terms;
- the `post_parent` and hashes of all 553 attachments;
- the `taxonomy_{id}` area options.

**Pass condition:** the before and after fingerprints are identical. The check runs at preflight and after every execute, and its result goes into the report.

**Order of protection.** The fingerprint is the final integrity alarm, not the primary protection:
1. **By construction:** the migration code only calls write APIs with `alaliah_*` post types, `alaliah_*` taxonomies and `aa_*` meta. It never intentionally invokes a mutation path (insert, update, delete, term assignment) against legacy posts, meta, taxonomies or attachments. The executor checks each taxonomy against the plugin's own list before assigning terms.
2. **Write guard:** while executing, hooks refuse writes outside that allow-list before they happen. **Known limit:** WordPress has no pre-hook for `wp_set_object_terms()`, so a stray term assignment from third-party code reacting to our saves is detected only after it is written; the run then aborts.
3. **Fingerprint:** compares legacy data before and after every run and fails the run on any difference.

## 10. Testing before staging

1. **Local WordPress** (`tools/wp-local/setup.sh`, SQLite):
   - install the plugin;
   - a fixture script recreates the relevant legacy shape: minimal `estate_*` registrations plus the 14 property, 17 developer and 1 agent records with the documented values. This is test data, marked as such.
2. **Automated checks:**
   - `php -l` on all files;
   - WordPress Coding Standards where available;
   - integration scripts asserting:
     - dry run writes nothing (database row counts unchanged);
     - the run is idempotent (a second run creates 0);
     - an edited record is skipped;
     - references are deterministic;
     - the shadow invariant holds (corrupt a term, rebuild, meta wins);
     - the agency field never links a developer;
     - a floor plan saves with an image alone;
     - the publish guard blocks an unready developer;
     - the legacy fingerprint is unchanged.
3. **Browser QA** of the admin screens with `tools/qa/check.mjs` (keyboard, axe) on local.

## 11. Staging sequence (each step stops if it fails)

Approved 2026-10-07 (D-036). Production is not an execution environment in this phase.

| Step | Action | Stop point |
|---|---|---|
| 1 | Confirm the host is the staging domain and database | |
| 2 | Verify the fresh Backuply backup (§12) exists and is available for restore | Stop if it can't be verified |
| 3 | Take the read-only legacy fingerprint baseline on staging | |
| 4 | Report readiness | **Stop before uploading anything** |
| 5 | Build the plugin ZIP from Git | |
| 6 | Deploy through Git → ZIP → Novamira `create-upload-link` → `run-wp-cli plugin install`; delete the ZIP | |
| 7 | Activate `trigon-alaliah-core` | |
| 8 | `wp alaliah setup` | |
| 9 | `wp alaliah migrate plan --set=full` (dry run only) | |
| 10 | Verify the legacy fingerprint is unchanged | |
| 11 | Report the complete dry run: developers, projects, properties, location corrections, references, relationship links, flags, amenity proposals, redirect plan | **Stop for approval** |
| 12 | `migrate run --execute --set=t1t2`, then `--set=p1` | |
| 13 | QA: admin editors, REST output, property URLs, developer/project relationships, location hierarchy, floor plans, Data Quality screen, shadow-taxonomy sync, legacy fingerprint, the WPResidence site unchanged | **Stop before broad migration** |
| 14 | (Later approval) `run --execute --set=full`, editorial review, theme, redirects, cutover | |

**Rollback.**
- **Functional rollback:** deactivate `trigon-alaliah-core`. The new types, fields and URLs stop working. The rows it created (`alaliah_*` posts and terms, `aa_*` meta, its options) **stay in the database**. Legacy data was never changed.
- **Database rollback:** restore the staging Backuply backup, or run a separately approved cleanup that targets only migration-created `alaliah_*` records. No cleanup tool exists or will be built without that approval.

## 12. Backup gate (E3)

The migration writes only new database rows, but a restorable backup is still required before the first staging write.

**Accepted gate (D-036):** a fresh full **Backuply** backup of staging, verified from staging to have:
- completed successfully;
- been listed in Backuply as available for restore;
- included the staging database and files.

Rules: do not restore it; do not create another staging clone; never write a database dump inside a web-accessible directory. An off-server export is preferable but not required when the Backuply backup is complete and restorable. A host snapshot remains the stronger option if the host offers one.

## 13. Risks
| Risk | Mitigation |
|---|---|
| Staging not isolated from production (E1) | Every write is inside the staging docroot and staging DB; preflight confirms `home`; the write allow-list |
| Rewrite flush on activation changes global rules | Additive only; new bases checked for clashes (§3) |
| The WPResidence theme renders the new types crudely in preview | Records stay draft; presentation QA waits for the theme |
| Amenity mapping is editorial | Produced by the dry run, approved before use |
| Editors change records between runs | Hash check skips edited records |
| No proof of Project → Property | P1 covers the property model; the full chain waits until a developer and project are named for 31083 or 31094 |

## 14. Deliverables and stop points
1. Plugin code in Git (data layer, admin, validation, CLI), with local tests passing.
2. **Stop:** backup gate verified and baseline taken; readiness reported.
3. Deploy, activate, setup, full dry run, fingerprint check.
4. **Stop:** full dry-run report reviewed.
5. Execute T1/T2 and P1, then QA.
6. **Stop:** approval before broad migration.
