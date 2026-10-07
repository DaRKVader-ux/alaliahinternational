#!/usr/bin/env bash
# Local integration tests for trigon-alaliah-core. TEST ONLY: resets a throwaway
# SQLite WordPress built by tools/wp-local/setup.sh, loads stand-in legacy data,
# and runs tests/integration.php. Refuses to run against anything but localhost.
#
#   plugins/trigon-alaliah-core/tests/run.sh <wp-dir> [port]
set -euo pipefail

WPDIR="$(cd "${1:?usage: run.sh <wp-dir> [port]}" && pwd)"
PORT="${2:-8890}"
HERE="$(cd "$(dirname "$0")" && pwd)"
PLUGIN="$(dirname "$HERE")"
WP="php $(dirname "$WPDIR")/wp-cli.phar --path=$WPDIR"
[ "$(id -u)" = 0 ] && WP="$WP --allow-root"

HOME_URL="$($WP option get home 2>/dev/null || true)"
case "$HOME_URL" in
	http://localhost:*|http://127.0.0.1:*) ;;
	*) echo "Refusing: home is '$HOME_URL', not a localhost site." >&2; exit 1 ;;
esac
[ -f "$WPDIR/wp-content/db.php" ] || { echo "Refusing: not a SQLite test site." >&2; exit 1; }

echo "== Lint"
find "$PLUGIN" -name '*.php' -print0 | xargs -0 -n1 php -l | grep -v '^No syntax errors' && exit 1 || true

echo "== Reset local site"
rm -f "$WPDIR/wp-content/database/.ht.sqlite"
rm -rf "$WPDIR/wp-content/uploads" "$WPDIR/wp-content/trigon-migration"
$WP core install --url="http://localhost:$PORT" --title="Al Aliah local" --admin_user=admin \
	--admin_password="$(openssl rand -hex 12)" --admin_email=dev@example.invalid --skip-email >/dev/null
$WP option update siteurl "http://localhost:$PORT" >/dev/null
$WP option update home "http://localhost:$PORT" >/dev/null
mkdir -p "$WPDIR/wp-content/mu-plugins"
cp "$HERE/fixtures/legacy-shim.php" "$WPDIR/wp-content/mu-plugins/aa-legacy-shim.php"
[ -e "$WPDIR/wp-content/plugins/trigon-alaliah-core" ] || ln -s "$PLUGIN" "$WPDIR/wp-content/plugins/trigon-alaliah-core"
$WP rewrite structure '/%year%/%monthnum%/%day%/%postname%/' >/dev/null # staging's structure

echo "== Stand-in legacy data"
$WP eval-file "$HERE/fixtures/legacy-fixture.php"
$WP plugin activate trigon-alaliah-core >/dev/null

echo "== Integration tests"
AA_TEST_PORT="$PORT" $WP eval-file "$HERE/integration.php"
