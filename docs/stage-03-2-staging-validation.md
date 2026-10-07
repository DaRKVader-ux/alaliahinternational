# Stage 03.2 — Staging validation log

Sequence: implementation plan §11 (D-036). Staging only: `https://alaliah.trigonsolutions.co/` via Novamira `novamira-alaliah-trigonso`. Production is not touched.

Every write to staging is logged here with what, where, why and how to reverse it.

## Steps 1–3 · 2026-10-07 · read-only

No writes. All checks ran as read-only PHP through Novamira `execute-php`; no credentials were returned or printed.

### 1. Host and database
| Check | Result |
|---|---|
| `home`, `siteurl`, `home_url()` | `https://alaliah.trigonsolutions.co` |
| `ABSPATH` | `/home/trigonso/domains/alaliah.trigonsolutions.co/public_html/` (staging docroot) |
| Database | the one named in staging's own `wp-config.php` (`SELECT DATABASE()` matches `DB_NAME`); local host; MariaDB 10.11.19 |
| Prefix | `wp8g_`, 70 tables |
| Versions | WordPress **7.1.3** (auto-updated from 7.1.2 since the audit), PHP 8.2.33 |
| `blog_public` | 0 |
| `trigon-alaliah-core` | not present; 0 `alaliah_*` posts or terms |

### 2. Backup gate (Backuply)
| Check | Result |
|---|---|
| Backup | `wp_alaliah.trigonsolutions.co_2026-10-07_05-44-51` (manual, Backuply Pro 1.5.9) |
| Completed | log ends `Backup Successfully Completed`; no job running; `tmp/` empty |
| Listed for restore | first entry in Backuply's backup list (`backuply_get_backups_info()`); source URL and path are staging's |
| Database included | `backup_db = 1`; log shows the SQL dump of every `wp8g_` table; `softsql.sql` (102.5 MB) is the first archive entry |
| Files included | `backup_dir = 1`; archive holds `wp-config.php`, root `.htaccess`, `wp-admin` (610), `wp-includes`, themes (3,812), plugins (17,807), uploads (9,424) |
| Integrity | archive read to the tar end marker without a gzip error; 34,834 entries = the log's file count; on-disk size 547,386,116 bytes = the logged 522.03 MB |
| Location | `wp-content/backuply/backups-Cv3OcR/` with deny-all `.htaccess`. Same server as staging (no off-server copy; accepted by D-036) |

Not done, by instruction: no restore, no clone, no database dump.

### 3. Legacy fingerprint baseline
Computed with the exact `Fingerprint::compute()` logic from Git, inline (plugin not yet installed). Repeated 18 s later: identical.

Taken 2026-10-07T06:02:55Z.

| Section | Rows | Hash |
|---|---|---|
| legacy_posts | 66 | `304df270369687b966bbfec1db62114a` |
| legacy_meta | 15,940 | `6205ee65535c5b0d65678e8ccd5c9298` |
| attachments | 553 | `5623b80c28734d5003db357fb3ec5f28` |
| attachment_meta | 1,279 | `aefece3473c42f6164155c3fe35b0b25` |
| legacy_terms | 160 | `7eaf913404d830845072c6644fa0cbb3` |
| legacy_relationships | 283 | `b434354cf7e3ea92f02c0eebe2469e1c` |
| term_options | 15 | `3a7f2b6a02d86991d0b074ebe529c841` |

Legacy taxonomies covered (30): every taxonomy except `alaliah_*`, including WordPress `category`, `post_tag`, `nav_menu`, `wp_theme` and all WPResidence `property_*` / `*_agent` / `*_developer` / `*_agency` taxonomies.

### Observations (not acted on)
- **Legacy cron.** `prefix_wpestate_cron_generate_pins_daily` runs daily at about 19:29 UTC. If it writes legacy meta, the fingerprint could move between this baseline and the deploy. The baseline is retaken immediately before deploying, and every migration run also fingerprints before and after itself.
- **Backuply auto-backup** is scheduled on staging (next 2026-10-08 10:37 UTC). Each archive is about 550 MB on the shared account.
- **Production archives on staging.** The cloned Backuply folder also holds three production backups (2026-09-17 ×2, 2026-10-01; about 540 MB each) with production database copies. They are behind deny-all and on the same hosting account as production, but they are personal data held in the staging tree. Decide whether to keep them (E1/E2).

### Local re-check before deploy
- `tools/wp-local/setup.sh` now pins WordPress 7.1.3 to match staging. Suite: **275 passed, 0 failed** on 7.1.3.
- Local PHP is 8.3.6, staging 8.2.33: no PHP 8.3-only syntax in the plugin.
- Local tests use SQLite; MariaDB behaviour is first exercised by the staging dry run.

**Status (steps 1–4): ready for step 5. Stopped before uploading anything.** Approved 2026-10-07.

## Steps 5–11 · 2026-10-07 · deploy and full dry run

### Pre-deploy checks (06:06:51Z)
- Environment re-confirmed: staging `home`/`siteurl`, staging docroot, staging's own database (`wp8g_`), WordPress 7.1.3, PHP 8.2.33, no `trigon-alaliah-core`, no `alaliah_*` rows, no `aa_*` options.
- Fingerprint retaken: identical to the 06:02:55Z baseline in all seven sections.

### Write log
| # | Time (UTC) | What | Where | Why | Reverse |
|---|---|---|---|---|---|
| W1 | 06:07 | Upload `trigon-alaliah-core-c357e56.zip` (63,185 B, sha256 `3eaecda8…f47a9314`, verified on server) via a 5-minute Novamira upload link | `wp-content/uploads/trigon-deploy/` | Deploy route (D-023) | Deleted in W4 |
| W2 | 06:07 | `wp plugin install <zip>` | `wp-content/plugins/trigon-alaliah-core/` (30 files, manifest identical to the Git build; `tests/` excluded) | Deploy | `wp plugin delete trigon-alaliah-core` (after deactivation) |
| W3 | 06:08 | `wp plugin activate trigon-alaliah-core` | `active_plugins`, `rewrite_rules` | Register types, taxonomies, the property rewrite rule | Functional rollback: deactivate |
| W4 | 06:08 | Delete the ZIP and the empty `trigon-deploy/` folder | `wp-content/uploads/` | Deploy hygiene | — |
| W5 | 06:08 | `wp alaliah setup` | 20 terms in `alaliah_purpose/completion/status/category/type`; options `aa_reference_reserved` (1001–1011), `aa_reference_next` (1012) | Fixed vocabulary, reserved references | Database rollback only (Backuply restore or approved cleanup) |
| W6 | 06:09 | `wp alaliah migrate plan --set=full --expect-home=…` (dry run) | Report files only: `wp-content/trigon-migration/20261007-060901-full-plan/` (deny-all `.htaccess` + `index.php`; HTTP 403 confirmed) | Dry run | Delete the folder |
| W7 | 06:08 | **Side effect of my QA GETs**: viewing `/properties/fully-furnished-1bd-marina-square-vacant/` and `/estate_developer/danube-properties/` made Elementor add `_elementor_page_assets` (`a:0:{}`) to legacy posts 31013 and 32018, and view counters may have incremented | Legacy post meta | Ordinary front-end page views, not plugin code | Not reverted (reverting would be a deliberate legacy write) |

Novamira's MCP adapter logs three `ability … does not exist` errors to stderr on every WP-CLI call (user 0). Pre-existing; not from this plugin.

### Health after activation
Legacy pages serve 200 (home, a legacy listing, a legacy developer). `/property/aa-1004/` → 404 (nothing migrated). `/wp-json/wp/v2/properties` → `[]`. `/developers/` now renders the plugin's empty developer archive through the WPResidence theme (staging only, `blog_public = 0`; the same applies to `/projects/`, `/areas/`, `/team/`, `/insights/`). No debug log entries.

### Fingerprint after the dry run
- **In-run check** (before and after the plan, inside one process): **unchanged**.
- **Against the 06:06:51Z baseline:** six sections identical; `legacy_meta` 15,940 → 15,942 rows. The two new rows are W7 (`_elementor_page_assets` on 31013 and 32018), written by my page views between the baseline and the run. Nothing written by the plugin. See open-questions E7.

### Dry-run findings (plan version 2026-10-07.1, no warnings)
**Totals:** 16 locations, 17 developers, 1 agent, 3 projects, 11 properties, 15 area drafts; 28 redirects planned; 64 CSV rows. Every record would be created as a draft.

**Developers (17).** Identity *verified*: Danube Properties (32018), Binghatti Developers (32040). *Needs review*: the other 15. `aa_about` and content empty for all 17; legacy text kept in `aa_about_legacy` for 8 (Meraas, Dubai Properties, Azizi, Ellington, MAG, Binghatti, Omniyat, Arada). Logos reuse the existing attachments; 12 flagged `logo_quality`. Rename: "Azizi Developements" → "Azizi Developments", slug `azizi-developments` (legacy slug kept). "Saas Properties" unchanged.

**Projects (3).**
| Legacy | Project | Developer link | Location | Handover | Plan | Permit | Notes |
|---|---|---|---|---|---|---|---|
| 32060 | Azizi Venice | none (T3 provisional) | Dubai › Dubai South | — | — | — | flags `provisional_relationship`, `legacy_notes_to_merge`; 16 images; dropped unit values audited (3 bd, 3 ba, 1500) |
| 32078 | Bayz 102 | Danube (T1) | Dubai › Business Bay | June 2029 | 70/30 · — · 70% · 30% | — | 18 images |
| 32101 | Binghatti Aquarise | Binghatti (T2) | Dubai › Business Bay | Q2, 2027 | 70/30 · 20% · 50% · 30% | 123564: unverified, not public, system unspecified | 8 images; dropped size 80 audited |

Agency text is kept (Rainbow Properties, Danube Properties, Binghatti Properties) and links nothing.

**Properties (11).** All: agent → office record; no developer, no project; no coordinates stored; existing gallery and thumbnail reused.

| Legacy | Ref | Purpose/completion/status/type | Location | Price (AED) | Beds/baths/size | Images | Planner flags |
|---|---|---|---|---|---|---|---|
| 30964 | AA-1001 | sale/ready/available/apartment | Abu Dhabi › Al Reef Downtown | 699,000 | 1/1/480.07 | 24 | invalid_legacy_coordinates |
| 30967 | AA-1002 | rent/ready/available/apartment | Abu Dhabi › Al Raha | 280,000 /yr | 4/5/— | 11 | rent_period_assumed |
| 31002 | AA-1003 | rent/ready/available/apartment | Abu Dhabi › Al Khalidiya | 80,000 /yr | 2/2/1100 | 9 | — (legacy label "Yearly") · featured |
| 31013 | AA-1004 | rent/ready/available/apartment | Abu Dhabi › Al Reem Island | 105,000 /yr | 1/2/915 | 9 | building_unconfirmed, rent_period_assumed |
| 31023 | AA-1005 | rent/ready/available/apartment | Abu Dhabi › Al Khalidiya | 180,000 /yr | 5/5/2400 | 31 | rent_period_assumed · featured |
| 31082 | AA-1006 | sale/ready/available/apartment | Abu Dhabi › Al Reef Downtown | 1,170,000 | 2/2/1354 | 23 | — |
| 31083 | AA-1007 | sale/off-plan/available/townhouse | Abu Dhabi › Khalifa City | 3,936,708 | 4/4/4075 | 10 | field_description_mismatch |
| 31094 | AA-1008 | sale/off-plan/available/apartment | Abu Dhabi › Al Raha | 3,481,025 | 2/3/1157 | 13 | field_description_mismatch · handover Q1 2029, plan 85/15 |
| 31495 | AA-1009 | sale/ready/available/villa | Abu Dhabi › Madinat Al Riyad | 3,800,000 | 5/6/11510 | 24 | featured |
| 31521 | AA-1010 | rent/ready/available/villa | Abu Dhabi › Yas Island | 420,000 /yr | 5/6/5948 | 49 | rent_period_assumed |
| 31571 | AA-1011 | rent/ready/available/villa | Abu Dhabi › Al Raha | 219,999 /yr | 3/5/1979 | 36 | rent_period_assumed |

**Computed flags expected at execute** (preview, from the same code): all 14 records `missing_alt` (none of the 281 gallery slots, 258 distinct images, has alt text); all 11 properties `missing_coordinates` and `missing_permit`; 31083 and 31094 `missing_developer`, `missing_project`; 30964 and 31082 `duplicate_gallery` (they share 23 images); `sales_style_title` on 8 (30964, 30967, 31023, 31082, 31083, 31094, 31495, 31571); `possible_wrong_type` on 30964 and 31023; `possible_plot_area` on 31495; `missing_size` on 30967. **Gap:** the type heuristic does not flag 30967 ("4 Master Bedroom with Private Pool", typed apartment), which the data-model report lists as a possible wrong type.

**Locations (16).** UAE › Abu Dhabi (9 communities) and Dubai (4). Corrections: Al Reef Downtown moved under Abu Dhabi (legacy cityparent "Dubai" audited, flag `area_conflict`); renames Sadiyat → Saadiyat Island, Jumairah → Jumeirah Beach Residence; slugs `al-reem` → `al-reem-island`, `dip` → `dubai-investment-park`, `jbr`, `sadiyat` → full names. 13 area hero images reused; Al Reef Downtown and Dubai South have none. No sub-community or building levels.

**Relationship plan.** T1 Bayz 102 → Danube; T2 Binghatti Aquarise → Binghatti; nothing else. Azizi Venice, 31083, 31094 unlinked. No Project → Property link.

**References.** AA-1001 to AA-1011 exactly as the local map (publish date, then ID); 31013 = AA-1004.

**Redirect plan (28, not served).** 11 `/properties/{legacy-slug}/` → `/property/{title-slug}-aa-NNNN/`; 17 `/estate_developer/{slug}/` → `/developers/{slug}/` (Azizi to the corrected slug). 30964's legacy slug `stunning-2bhk-apartment` redirects to the studio's title-based URL. No SiteSEO redirects exist on legacy listings (32101 holds only default redirect fields, no target).

**Amenities (not migrated; proposal only).** The proposal covers every legacy feature slug (0 unmapped): 21 slugs map to 18 amenities in two groups (In the home / Building and community), merging duplicates (`central-air` + `central-air-conditioning`, `gym` + `fully-equipped-gym`, `pool` + `swimming-pool`); 19 dropped as not amenities (utilities, marketing phrases, `fully-furnished`, `investor-friendly`, `wifi`…). For review: `fully-furnished` belongs in the furnishing field, not dropped silently; `pool` is grouped as a building amenity although villa listings mean a private pool.

**Legacy data not used (by design).** WPResidence sub-unit link: 31571 (Al Raha rental villa) is stored as a sub-unit of 32101 (Binghatti Aquarise, Business Bay, off-plan). Different emirate and purpose; not evidence of Project → Property; not migrated.

### MariaDB vs local SQLite
- The dry run's reads (planner SQL, executor look-ups, fingerprint) ran on MariaDB 10.11.19 with no errors or warnings; results match the local run except legacy **term IDs**, which are staging's real ones (e.g. Al Reem 109, Abu Dhabi 169).
- Fingerprints hash in PHP, so they are engine-independent.
- **Not yet exercised on MariaDB:** the write path (inserts, meta, term assignment) and the compare-and-swap reference allocation (used only for hand-created listings). T1/T2 and P1 exercise the write path; the CAS path would be exercised only by creating a listing by hand.

**Status (steps 5–11): stopped for approval.** No T1/T2, P1 or broad migration has run.

## Corrections and controlled execution · 2026-10-07 (D-037)

### Code changes (commit `db52f00`)
- **Fingerprint:** `legacy_meta` (protected) now excludes exactly `_elementor_page_assets`, `_eael_post_view_count`, `wpestate_total_views`, `wpestate_detailed_views`; those four are hashed in `volatile_meta`, reported but never blocking. `_edit_lock`, previously excluded, is now **protected** like every other key.
- **30967:** migration flag `possible_wrong_type`; type unchanged.
- **Amenity map** (unexecuted; implementation plan §8.7): pools neutral unless explicitly `private-pool`; `fully-furnished` proposes `aa_furnishing = furnished` (audited as `feature_fields`, fill-if-empty, never overwrites).
- Local suite on WordPress 7.1.3: **293 passed, 0 failed**.

### Write log (continued)
| # | Time (UTC) | What | Where | Reverse |
|---|---|---|---|---|
| W8 | 06:18 | Upload `trigon-alaliah-core-db52f00.zip` (64,516 B, sha256 `c1636f9f…19d93863d53`, verified on server) | `wp-content/uploads/trigon-deploy/` | Deleted in W10 |
| W9 | 06:18 | `wp plugin install <zip> --force`; 30 files, manifest identical to the Git build; plugin stayed active | `wp-content/plugins/trigon-alaliah-core/` | Reinstall `c357e56` |
| W10 | 06:19 | Delete ZIP and folder | `wp-content/uploads/` | — |
| W11 | 06:19 | Side effect of W9: Elementor cleared its page-asset cache, deleting the two `_elementor_page_assets` rows of W7 (volatile key) | Legacy post meta | None needed |
| W12 | 06:19 | Protected baseline `baseline-pre-t1t2-p1.json` | `wp-content/trigon-migration/` (deny-all) | Delete the file |
| W13 | 06:20 | `migrate run --set=t1t2 --execute` (run `20261007-062010-t1t2-run`) | 3 location terms, 2 developers, 2 projects (drafts), shadow terms, `aa_*` meta | Database rollback only |
| W14 | 06:20 | `migrate run --set=p1 --execute` (run `20261007-062018-p1-run`) | 2 location terms, 1 agent, 1 property (drafts), `aa_*` meta | Database rollback only |
| W15 | 06:2x | Side effect of QA page views (31013, 32101, 32018): 3 new `_elementor_page_assets` rows | Legacy post meta (volatile) | None needed |

Pre-execution checks: environment re-confirmed (staging home/siteurl/docroot/database, WordPress 7.1.3, 0 `alaliah_*` posts, no lock, next reference 1012).

### Created on staging (all drafts)
| Record | New ID | Legacy |
|---|---|---|
| Danube Properties (developer) | 32816 | 32018 |
| Binghatti Developers (developer) | 32817 | 32040 |
| Bayz 102 (project) | 32818 | 32078 |
| Binghatti Aquarise (project) | 32819 | 32101 |
| Al Aliah International (agent, office) | 32820 | 30966 |
| Fully Furnished 1bd, Marina Square (property, **AA-1004**) | 32821 | 31013 |

Location terms: UAE › Dubai › Business Bay; UAE › Abu Dhabi › Al Reem Island. No amenity terms. No area posts.

### QA results
| Check | Result |
|---|---|
| T1 | Bayz 102 → Danube: canonical meta and shadow term `d-32816` agree; UAE › Dubai › Business Bay; off-plan; June 2029; 70/30 |
| T2 | Binghatti Aquarise → Binghatti: meta and shadow `d-32817` agree; plan 70/30 · 20% · 50% · 30%; permit 123564 unverified, not public |
| Developers | identity verified (both); About and content empty; Binghatti legacy text in `aa_about_legacy`; logos reuse 32019 / 32041; derived: Danube 1 project, 0 listings; Binghatti areas = Business Bay; flags `not_ready_to_publish`, `missing_logo_alt`, `logo_quality` |
| P1 data | AA-1004; rent/ready/available/apartment/residential; 105,000 yearly; 1 bd / 2 ba / 915; office agent; UAE › Abu Dhabi › Al Reem Island; Marina Square / Marina Blue Tower **not** created, proposal in the audit only; no developer, project or shadow terms |
| AA-1004 URL | `get_permalink()` = `/property/fully-furnished-1bd-marina-square-vacant-aa-1004/`; canonical, bare `/property/aa-1004/` and an old-slug variant all route to post 32821; unknown `aa-9999` → 404; public HTTP 404 while draft (correct). The 301 response itself needs a published listing (verified locally) |
| Gallery reuse | 9 legacy attachment IDs in legacy order; thumbnail reused; attachment parents unchanged (still 31013) |
| Floor plans | none stored; display empty; editor shows no rows, the add control and the empty-list marker |
| Furnishing | empty. Staging's 31013 has no `fully-furnished` feature (only its title says so), so no transformation was proposed; nothing is inferred from titles |
| Admin editing | every meta-box group of property, project, developer and agent renders server-side with no PHP notices; quality boxes list the expected flags; Data Quality page renders flags and relationship check, no contact values. Browser QA of wp-admin on staging needs a staging login (not used) |
| REST (edit context) | public names only; no `aa_` or legacy keys; no legacy IDs as values; developer/project `null`; 9 gallery images (all alt empty); floor_plans `[]`; permits `[]`; `url` and `link` canonical; 123564 and agency text absent; About hidden; derived counts correct |
| REST (anonymous) | drafts → 401; collections `[]` |
| Data-quality flags | P1: missing_coordinates, missing_permit, missing_alt, building_unconfirmed, rent_period_assumed. Aquarise: unverified_permit, unit_types_missing, missing_alt, legacy_notes_to_merge |
| Shadow indexes | `relations rebuild --verify` equivalent: **0 drift** |
| Protected fingerprint | `verify-legacy` vs W12: **unchanged** (all 7 protected sections) |
| Volatile report | 60 → 63 rows: the 3 `_elementor_page_assets` rows of W15. Reported, not blocking |
| WPResidence site | home, legacy listings and developer pages 200; 14 `estate_property`, 17 `estate_developer`, 1 `estate_agent`, all published; 31013 title and price unchanged; Azizi legacy title unchanged; theme `wpresidence-child` and WPResidence core active |

### Not done
No broad migration, no redirects, no amenities, no area posts, nothing on production. Production Backuply archives on staging untouched (E6).

**Status: Stage 03.2 controlled validation passed. Stopped.**

## Closing correction · 2026-10-07

Agent contact fields (`phone`, `mobile`, `whatsapp`, `email`) are private by default in REST: editors see them in the edit context; public output includes one only if it is named in the `trigon_alaliah_public_contact_fields` filter (empty by default). Which office contacts become public is a later decision. Commit `657baf8`, local suite 296/296.

| # | What | Result |
|---|---|---|
| W16 | Upload `trigon-alaliah-core-657baf8.zip` (sha256 `ca13a497…056cebec`, verified), `wp plugin install --force`, ZIP and folder deleted | Manifest identical to Git; plugin active |
| QA | Agent 32820: anonymous data has `role`, `is_office` only; edit context has the contacts. Protected fingerprint vs `baseline-pre-t1t2-p1.json`: unchanged | Pass |

**Stage 03.2 controlled validation: complete.**
