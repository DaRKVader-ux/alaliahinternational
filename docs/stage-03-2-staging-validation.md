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

**Status: ready for step 5. Stopped before uploading anything.**
