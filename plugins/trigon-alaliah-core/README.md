# Trigon Al Aliah Core

Data layer for the Al Aliah International site (Trigon Solutions). It owns post types, taxonomies, structured fields, relationships, references, data-quality flags, the read-only REST field and the WPResidence migration. Presentation lives in the `alaliah-trigon` theme, which is still gated (Stage 03.2 exception covers this plugin only, D-035).

Specs: `docs/stage-03-2-data-model-report.md` (model and decisions) and `docs/stage-03-2-implementation-plan.md` (registration, invariants, migration).

Requires WordPress 6.5+ and PHP 8.1+. Activation registers types and flushes rewrites. It creates no content.

## Commands

```
wp alaliah setup                                  # fixed terms + reserved references (idempotent)
wp alaliah migrate plan --set=t1t2|p1|full        # dry run; writes reports only
wp alaliah migrate run  --set=… --execute         # writes, behind the write guard
wp alaliah migrate run  … --expect-home=<url>     # abort unless home_url() matches
wp alaliah migrate verify-legacy --baseline=<f>   # fingerprint legacy data / compare
wp alaliah migrate status
wp alaliah relations rebuild [--verify]
wp alaliah quality scan
```

Reports go to `wp-content/trigon-migration/{run_id}/` (deny-all `.htaccess`). Contact values of agents are recorded as `set`/`empty`, never copied into reports.

## Tests (local only)

```
tools/wp-local/setup.sh <dir> 8890                # once
plugins/trigon-alaliah-core/tests/run.sh <dir>/wp 8890
```

`run.sh` refuses any site that is not `localhost` on SQLite. It resets the database, loads stand-in WPResidence data with the staging legacy IDs and timestamps (`tests/fixtures/`), and runs `tests/integration.php`: registration, dry run, T1/T2, P1, idempotency, references, URLs over HTTP, relations, publish guard, write guard, full migration, legacy fingerprint.

Admin-screen QA (axe scoped to the plugin's meta boxes and Data Quality page):

```
WP_USER=admin WP_PASS=… node tools/qa/admin-check.mjs http://localhost:8890 <out> "post.php?post=<id>&action=edit" …
```

## Known limits

- **Protection order.** The migration code never intentionally invokes a mutation path against legacy posts, meta, taxonomies or attachments; the executor refuses any taxonomy that is not the plugin's own. The write guard is the second line. The legacy fingerprint is the final integrity alarm, not the primary protection.
- The write guard cannot pre-empt `wp_set_object_terms()` (WordPress has no pre-hook). A stray term assignment from other code is written, then the run aborts and the legacy fingerprint reports it.
- **Rollback.** Deactivating the plugin is a *functional* rollback only: the new structures go inactive, but the rows it created stay in the database. A database rollback means restoring the staging Backuply backup, or a separately approved cleanup of migration-created `alaliah_*` records. No cleanup tool exists.
- `duplicate_gallery` is recomputed for every record at the end of a migration run, but an admin edit to one gallery does not refresh the flag on the other listing. Run `wp alaliah quality scan`.
- Amenities are not migrated until the amenity map is approved (`Mapping::AMENITY_MAP_APPROVED`).
- Legacy URL redirects are planned in the report but not served. Serving them belongs to the theme/launch stage.
