# WordPress Environment Report: Staging

| | |
|---|---|
| **Audited** | `https://alaliah.trigonsolutions.co/` (staging) |
| **Date** | 2026-10-06 |
| **Access** | Novamira MCP `novamira-alaliah-trigonso` (Novamira 1.12.7, via `@automattic/mcp-wordpress-remote` 0.4.0), connected as WP user ID 1 (administrator). Plus anonymous HTTP GET/HEAD against staging and the public production site |
| **Mode** | **Read-only.** All PHP run through `novamira/execute-php` only read options, staging's own DB tables and staging files. Secrets were redacted inside PHP before results were returned. Nothing was installed, activated, deactivated, edited, deleted, migrated or written |
| **Production** | Read-only HTTP requests to public URLs only. One `is_dir()` existence check (no listing, no reads) for the production document root, to answer the isolation question |

**Unavoidable side effects:** WordPress core records "last used" time and IP on the application password at each authenticated request, and the host logs requests. No content, settings or files were changed.

---

## 1. Answers to the three required checks

### 1.1 Is staging isolated from production? **No.**
| Layer | Finding | Isolated? |
|---|---|---|
| Server | Both domains resolve to 216.158.227.108: one shared LiteSpeed host (DirectAdmin layout) | ❌ |
| Hosting account | Staging docroot is `/home/trigonso/domains/alaliah.trigonsolutions.co/public_html/`. **`/home/trigonso/domains/alaliahinternational.com` exists in the same account** | ❌ |
| PHP filesystem boundary | `open_basedir` = `/home/trigonso/:/tmp:/var/tmp:…`, which is the **whole account**, not the staging docroot | ❌ PHP on staging (including Novamira `execute-php`, `read-file`, `write-file`, `delete-file`) can technically reach production's files |
| Database | DB user has `ALL PRIVILEGES` on its own database only (plus global `USAGE`). The DB contains one table prefix (`wp8g_`), 70 tables | ✅ at the privilege level (not verified against production's DB credentials, which were deliberately not read) |
| WordPress environment type | `wp_get_environment_type()` = **`production`** on staging | ❌ Plugins that behave differently on staging can't tell the difference |

**Consequence:** "production is read-only" is currently a **policy, not a technical boundary**. One wrong path in a Novamira file or PHP call could modify the live site. See §9, recommendation R1.

### 1.2 Can staging send real email or CRM submissions?
| Channel | Finding | Status |
|---|---|---|
| Email transport | GoSMTP Pro routes `wp_mail` via **SMTP** (host set), forcing a `@alaliahinternational.com` from-address. No `pre_wp_mail` blocker, no mail-trap plugin | ⚠ **Staging attempts real email** |
| Email outcome | GoSMTP log: **15 attempts in the last 30 days (latest 2026-10-06 11:58), all `failed`: "SMTP Error: Could not authenticate"**. Recipients: 14 Gmail addresses, 1 `@alaliahinternational.com` | ✅ Nothing has been delivered, **but only because the SMTP credentials fail**. Correcting them would send real mail |
| What tried to send | Wordfence security alerts referencing `alaliahinternational.com` (login, lockout, scan problems, deactivation) | Production-labelled alerts generated on staging |
| WPForms notifications | 3 forms (Contact Us, Register Interest, Request Consultation). Notifications go to `{admin_email}` (= `@alaliahinternational.com`) or a production address | ⚠ Would email the real business inbox if SMTP worked |
| CRM | All 3 forms have **Constant Contact (v3)** configured, but **no Constant Contact account is connected** (`wpforms_providers` empty) | ✅ No CRM push possible now. ⚠ It would start immediately if someone connects an account on staging |
| Webhooks / other CRM | No webhooks; no CRM plugin; no CRM/lead post types; WpResidence CRM dashboard pages exist but no lead storage was found | ✅ |
| Payments | PayPal mode `sandbox`, PayPal off, Stripe off, paid submission off | ✅ |
| Outbound telemetry | Elementor tracker, WPCode usage tracking, WPForms email summaries, HFE usage, PosiMyth heartbeat cron jobs are active | ℹ Vendor telemetry only |

### 1.3 Is indexing disabled on staging? **Partly.**
| Control | Staging | Production |
|---|---|---|
| `blog_public` | `0` (discourage) | not read (read-only) |
| `<meta name="robots">` on homepage | `noindex, follow` | **`noindex, follow`** ⚠ |
| `robots.txt` | Virtual: disallows `/wp-admin/`, advertises `sitemaps.xml` | **Static file (last modified 2024-04-18) with suspicious sitemap entries.** See §8.2 |
| HTTP authentication | **None.** Staging is publicly reachable (HTTP 200) | n/a |
| `X-Robots-Tag` header | none | none |

Staging is noindexed by meta tag but **publicly accessible without authentication**. It also exposes a full copy of production's content and data (§1.4). Meta-noindex keeps it out of search results, but it does not keep people or scrapers out.

### 1.4 Classification: **staging is a recent copy of production**
Evidence:
- identical theme and child theme, plugin set visible in page source, front page ID (18811), and REST counts (27 pages, 17 developers, 1 agent) on both sites
- `wp-content/backuply/` holds production backup logs from 2026-04-13 onward and three ~517 MB archives named `wp_alaliahinternational.com_2026-09-17/10-01…tar.gz`, copied in on 2026-10-06
- production URL remnants in `admin_email`, `gosmtp_options`, `wpresidence_admin` (`wp_estate_send_email_from`), 11 post bodies and 1 postmeta value. GUIDs were rewritten to the staging host (1,656), so a search-replace was run
- production operational data came along: Wordfence login records (509), traffic hits (617), Wordfence 2FA secret (1) and passkey (1), CookieAdmin consent records (236)

It is **not** prepared for the redesign: no new theme, no new content model, and nothing in the Novamira sandbox (`wp-content/novamira-sandbox/` contains only protection files).

---

## 2. Platform
| Item | Value |
|---|---|
| WordPress | 7.1.2 (single site) |
| PHP | 8.2.33 (LiteSpeed SAPI), 13 disabled functions |
| Database | MariaDB 10.11.19, prefix `wp8g_` |
| Web server | LiteSpeed; drop-in `advanced-cache.php` (LiteSpeed/host cache) |
| Host security | Imunify (bot rate-limit table and daily cron present) |
| Debug | `WP_DEBUG` false; `DISALLOW_FILE_EDIT` true; WP-Cron enabled |
| Must-use plugins | none |

## 3. Themes
| Theme | Version | Status |
|---|---|---|
| WPResidence Child Theme (`wpresidence-child`) | 5.4.0 | **Active** |
| WPResidence (`wpresidence`, parent) | 5.5.0 | Parent |

WPResidence is a commercial real-estate theme (ThemeForest). The child theme holds 178 files, almost all translation files. `functions.php` hooks only `after_setup_theme`, `wp_enqueue_scripts` and `wp_footer`, so there is **little custom code in the child theme**.

## 4. Plugins
| Plugin | Version | Status | Role |
|---|---|---|---|
| WpResidence Theme Core Functionality | 5.4.1 | active | Theme data model (CPTs, taxonomies, search, maps) |
| WpResidence Elementor Widgets | 5.4.0 | active | Theme widgets |
| WpResidence Design Studio | 5.4.0 | active | Theme header/footer/template builder |
| Elementor | 4.3.4 | active | **Page builder** |
| Essential Addons for Elementor | 6.8.5 | active | Builder add-on |
| Ultimate Addons for Elementor (UAE / HFE) | 2.9.5 | active | Builder header/footer |
| Sticky Header Effects for Elementor | 2.2.3 | active | Builder add-on |
| WPForms Lite | 2.0.2.1 | active | Forms |
| GoSMTP + GoSMTP Pro | 1.2.3 | active | SMTP mail + email log |
| SiteSEO + SiteSEO Pro | 1.4.2 | active | **SEO** (titles, schema, sitemaps) |
| CookieAdmin + Pro | 1.2.5 | active | Cookie consent (stores consent records) |
| Backuply + Backuply Pro | 1.5.9 | active | **Backups** |
| WPCode Lite | 2.3.9 | active | Snippets: 1 published (empty "Untitled"), 3 drafts. No tracking, mail or HTTP code detected |
| SVG Support | 2.6.1 | active | SVG uploads |
| Envato Market | 2.0.14 | active | Theme updates (no token set) |
| Novamira | 1.12.7 | active | AI/MCP access (this audit) |
| Wordfence Security | 9.0.2 | **inactive** (deactivated on staging 2026-10-06) | Security. Tables and data remain |
| Loginizer + Pro | 2.1.1 / 2.1.0 | inactive | Login security |

**Not present:** ACF, Meta Box, JetEngine, Pods, multilingual plugins (WPML, Polylang, TranslatePress), dedicated caching plugin (host cache only), CRM plugins, property import/feed plugins, redirect manager, image optimisation plugin. An orphan `acf_update_site_health_data` cron hook and empty Revolution Slider tables are leftovers from earlier plugins.

## 5. Page builder
**Elementor** builds 14 published pages, 3 header/footer templates, 3 Studio templates and 33 library items (11 kits, 21 pages, 1 section). 1,059 Elementor revisions. One page still contains **WPBakery** shortcodes (`vc_row`/`vc_column`), unregistered and rendered as raw text.

## 6. Content model
### Post types (non-built-in, with published counts)
| Type | Slug | Count | Notes |
|---|---|---|---|
| `estate_property` | `/properties/` | **14** | Created 2026-02-28 to 2026-04-08 |
| `estate_developer` | `/estate_developer/` | 17 | |
| `estate_agent` | `/agents/` | **1** | |
| `estate_agency` | `/estate_agency/` | 0 | |
| `estate_review` | (not public) | 17 | **Demo content** (§8.4) |
| `membership_package` | `/package/` | 17 | Theme membership feature |
| `elementor_library`, `elementor-hf`, `wpestate-studio` | | 33 / 3 / 3 | Builder templates |
| `wpforms` | | 3 | |
| `wpestate_invoice`, `wpestate_message`, `wpestate_search` | | 0 | Theme user-dashboard features |
| `novamira_skill`, `novamira_design`, `novamira_gb_change` | | 0 | Novamira |

Built-in: pages 27 published + 3 drafts; posts: none; attachments 553.

### Taxonomies (property)
`property_category` (3), `property_action_category` (3), `property_city` (2), `property_area` (13), `property_county_state` (1), `property_features` (40), `property_status` (5). Each of agent, agency and developer has a parallel set of category, action, city, area and state taxonomies.

## 7. Integration surface
| Area | Finding |
|---|---|
| REST namespaces | `wp/v2`, `wp-abilities/v1`, `mcp`, `novamira/v1`, **`elementor-mcp-composer/v1.0.19`**, `elementor-ai/v1`, `elementor/v1`, `elementor-one/v1`, `hfe/v1`, `wpforms/v1`, `gosmtp-smtp`, `nps-survey/v1`, `wp-site-health/v1`, `wp-block-editor/v1`, `oembed/1.0`. Two MCP-style endpoints exist (Novamira and Elementor) |
| Permalinks | `/%year%/%monthnum%/%day%/%postname%/` (date-based for posts; CPTs use their own slugs) |
| Front page | Static page "Homepage" (ID 18811, Elementor) |
| XML-RPC | Enabled |
| Users | **2 users, both administrators.** Registration closed; default role subscriber. Staging carries production's user accounts and their security data |
| Media | 553 attachments (456 JPEG, 44 PNG, 33 SVG, 17 WebP, 1 MP4), ~395 MB including generated sizes. Local uploads, no offload/CDN. **23 registered image sizes**, mostly theme-defined (`property_listings` 525×328, `property_full` 980×777, `property_full_map` 1920×790, …). Many files are WhatsApp-exported images (`IMG-…-WA…`) |
| Analytics | No GA4, GTM or Meta Pixel IDs in staging options or in either homepage's HTML. (The `G-2025…` matches are WhatsApp image filenames.) **No analytics detected on production**; consent-gated loading was not tested |

## 8. Legacy constraints and content findings

### 8.1 Legacy dependencies (must be accounted for before replacing anything)
| Dependency | Evidence | Note |
|---|---|---|
| WPResidence data model | All property, agent, developer data lives in `estate_*` CPTs and ~60 `wpestate`-prefixed meta keys per type | Content migration path needed if the custom theme uses a new model (Stage 03) |
| WpResidence Core plugin | Registers the CPTs and taxonomies | Deactivating it hides all property content |
| Elementor + 3 add-ons | 14 pages + templates stored as Elementor JSON | Pages are not portable to Gutenberg without a rebuild |
| Shortcodes | `wpres_meta` (WPCode snippet + 2 Studio templates), `hfe_current_year` / `hfe_site_title` (footer), `spacer` (1 page) | Low; all replaceable |
| Theme page templates | Advanced search results, agent/agency/developer search, user dashboard (saved searches, favourites), splash page, Stripe, Zillow estimate, terms, 3 CRM dashboard templates | Several are US/demo features (§8.4) |
| Custom tables | Wordfence (`wf*`), CookieAdmin consents, GoSMTP log, WPForms analytics and logs, Action Scheduler, Novamira OAuth, empty Revolution Slider | Only CookieAdmin consents may have retention obligations |
| Options-based behaviour | `wpresidence_admin` (theme settings: maps, half-map search, submission, email-from) | |
| SEO metadata | SiteSEO titles and meta. Author/date/search archives noindexed | Must be preserved or migrated (D-016) |

### 8.2 Production: `noindex` and suspicious `robots.txt`
- **The live site is `noindex`**: production's homepage serves `<meta name='robots' content='noindex, follow'>`. If unintentional, Al Aliah is currently invisible in Google. **Business-critical; owner to confirm.**
- **Production `robots.txt` is a static file (modified 2024-04-18)** that lists query-string sitemaps (`?sitemapindex.xml`, `?sitemap686.xml`, `?sitemap7.xml`, `?sitemap505.xml`, `?sitemap422.xml`, `?sitemap240.xml`) and **`/goods.php?sitemap645.xml`** on `www.alaliahinternational.com`. These are **not WordPress or SiteSEO sitemaps**, and the pattern matches SEO-spam injections. On production, `GET /goods.php` returns HTTP 500 with an empty body, while staging returns WordPress's normal 404, so something non-WordPress answers at that path on production.
- Wordfence (cloned config) emailed "Problems found on alaliahinternational.com" and user-lockout alerts on 2026-10-05/06. The alert content was not read.
- **These are indicators, not proof of compromise.** Investigating them requires production access, which is out of scope. See R2.

### 8.3 Inventory is Dubai-led, not Abu Dhabi-led
Recent listing titles are Dubai projects (Binghatti Aquarise, Bayz 102, Azizi Venice). A published page is "Areas in Dubai". The production homepage mentions "Dubai" 29 times and "Abu Dhabi" 8 times. This conflicts with the approved positioning ("Abu Dhabi expertise with UAE reach", brief §24) and needs a business decision, not a design one (open-questions B1).

Listing copy also uses language the brief removes ("Exclusive Offer", "Invest Now", "10% discount").

### 8.4 Demo and placeholder content
- **17 `estate_review` items are theme demo testimonials**: one author, attached to no property or agent, one praising "Green Reality". They were **not observed** on the public `/testimonials/` page or the homepage. They must never be published (brief §45, "never invent data").
- Theme demo pages are published: **Zillow Estimate** (US service), **Stripe**, **Splash Page**, three **WpEstate CRM** dashboards, "Taxonomy Grid and Carousels", "Single Map with Pins". Duplicates: two "All Developers", two "Privacy Policy" (one draft), two "CRM Leads" pages. Typo: "Terms and Coditions".
- 17 membership packages (theme feature, USD currency) appear unused.
- Property meta includes US-template fields (energy/CO₂ class, roofing, basement) carried by the theme.

### 8.5 Property data source (open-questions Q3)
- **No feed or CRM import exists in WordPress**: no import plugin, no feed meta keys, no import cron jobs. Listings carry `property_internal_id` and were created by hand between Feb and Apr 2026.
- **Inventory on the website is tiny: 14 listings, 1 agent.** The real inventory lives somewhere else (portals or CRM). This changes search design (Q4): the website is not the system of record today.

### 8.6 Novamira's own design and skill system
Novamira ships a "design library" (`save-design` / `activate-design`, currently empty) and built-in skills (`novamira-design`, `custom-theme-build`). Its server instructions say to load `novamira-design` before any visual work. **That would create a second design-system source of truth**, competing with `alaliah-design-system` (D-003, D-012). See D-020.

---

## 9. Recommendations (none executed; each needs approval)
| # | Action | Why | Owner |
|---|---|---|---|
| **R1** | Isolate staging from production: move staging to a separate hosting account/system user, or have the host restrict staging's `open_basedir` to the staging docroot. Until then, Novamira file/PHP **writes** are limited to the staging docroot and every path is checked | Staging PHP can reach production files (§1.1) | Host / developer |
| **R2** | Production security check by the owner: inspect `robots.txt` and `/goods.php` in production's root, run a malware scan (Wordfence/Imunify) on **production**, review admin users | Spam-injection indicators (§8.2) | Owner / host |
| **R3** | Confirm whether production's `noindex` is intentional; if not, fix on production (production change, needs authorisation) | Live site likely de-indexed (§8.2) | Owner |
| R4 | Staging mail: install a mail trap or disable outbound mail on staging, and clear the production SMTP settings there | Correcting SMTP credentials on staging would email real inboxes (§1.2) | Approve, then Claude on staging |
| R5 | Set `WP_ENVIRONMENT_TYPE` = `staging` in staging's `wp-config.php` | Plugins currently treat staging as production | Approve, then Claude |
| R6 | Add HTTP basic auth to staging | Public copy of production content and data (§1.3) | Host / approve |
| R7 | Purge copied production security and PII data on staging (Wordfence logins, hits, 2FA/passkeys, consent records), or accept and document it | Data minimisation (UAE PDPL); staging holds production secrets | Owner decision |
| R8 | Move backups off-server and verify one restore | Backuply is weekly, local, on the same server (§10) | Owner / host |
| R9 | Remove or unpublish demo content (17 reviews, Zillow/Stripe/Splash/CRM demo pages) **on production** | Fabricated or irrelevant content (§8.4) | Owner (production change) |

## 10. Backup status (D-016 gate)
| Item | Finding |
|---|---|
| Mechanism | Backuply Pro, scheduled **weekly**, rotation 2, location **local** (`wp-content/backuply/backups-*/`, protected from the web: HTTP 403 verified) |
| Latest on staging | 2026-10-01 10:49 UTC (made on **production** before cloning; 3 archives ≈ 517 MB each) |
| Off-site copy | None configured in Backuply. Host-level backups unknown |
| Restore tested | **No** |
| Verdict | A backup **exists but is not verified restorable**, and it lives on the same server as both sites. **D-016 gate not met** for major architectural work |

## 11. Audit limitations
- Production was inspected only through public HTTP and one existence check. Its database, files, `blog_public` and plugin settings were not read.
- Database isolation was verified from staging's side (grants). Production's DB user was not inspected.
- Email "can send" is inferred from configuration and logs. No test email was sent.
- Elementor page content was not inventoried widget by widget.
