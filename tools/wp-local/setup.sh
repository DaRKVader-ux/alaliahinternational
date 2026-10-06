#!/usr/bin/env bash
# Throwaway local WordPress on SQLite for development and QA.
# Needs only PHP 8.x (pdo_sqlite) and git; no Docker or MySQL.
# Uses git mirrors because wordpress.org downloads may be blocked by egress policy.
#
#   tools/wp-local/setup.sh <target-dir> [port]
#   then: (cd <target-dir>/wp && php -S localhost:<port>)
#
# Not a production setup. Nothing here is committed to the target project.
set -euo pipefail

WP_TAG="7.1.2"        # latest stable at time of writing; bump deliberately
SQLITE_TAG="v3.0.2"
DIR="${1:?usage: setup.sh <target-dir> [port]}"
PORT="${2:-8881}"

mkdir -p "$DIR"
cd "$DIR"

[ -d wp ] || git -c advice.detachedHead=false clone -q --depth 1 --branch "$WP_TAG" https://github.com/WordPress/WordPress wp
[ -d sqlite-src ] || git -c advice.detachedHead=false clone -q --depth 1 --branch "$SQLITE_TAG" https://github.com/WordPress/sqlite-database-integration sqlite-src
[ -f wp-cli.phar ] || curl -fsSL -o wp-cli.phar https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar

# The plugin package symlinks its driver from a sibling package; copy it in for a self-contained plugin.
PLUGIN=wp/wp-content/plugins/sqlite-database-integration
rm -rf "$PLUGIN"
cp -r sqlite-src/packages/plugin-sqlite-database-integration "$PLUGIN"
rm -rf "$PLUGIN/wp-includes/database"
cp -r sqlite-src/packages/mysql-on-sqlite/src "$PLUGIN/wp-includes/database"
sed -e "s#'{SQLITE_IMPLEMENTATION_FOLDER_PATH}'#__DIR__.'/plugins/sqlite-database-integration'#g" \
    -e "s#{SQLITE_PLUGIN}#sqlite-database-integration/load.php#g" \
    "$PLUGIN/db.copy" > wp/wp-content/db.php

# Run wp-cli from the WordPress root; from a parent dir it infers a /wp subdirectory URL.
cd wp
WP="php ../wp-cli.phar"
[ "$(id -u)" = 0 ] && WP="$WP --allow-root"

$WP config create --dbname=local --dbuser=local --dbpass=local --skip-check --force >/dev/null
if ! $WP core is-installed 2>/dev/null; then
	PASS="$(openssl rand -hex 12)"
	$WP core install --url="http://localhost:$PORT" --title="Al Aliah local" \
		--admin_user=admin --admin_password="$PASS" --admin_email=dev@example.invalid --skip-email >/dev/null
	echo "admin password (local only): $PASS"
fi
$WP option update siteurl "http://localhost:$PORT" >/dev/null
$WP option update home "http://localhost:$PORT" >/dev/null
$WP rewrite structure '/%postname%/' >/dev/null

echo "WordPress $($WP core version) ready. Serve with: (cd $PWD && php -S localhost:$PORT)"
echo "wp-cli: (cd $PWD && $WP <command>)"
