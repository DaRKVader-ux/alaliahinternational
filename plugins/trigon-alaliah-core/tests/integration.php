<?php
/**
 * TEST ONLY. Integration tests for trigon-alaliah-core against the stand-in legacy data
 * built by tests/fixtures/legacy-fixture.php. Run through tests/run.sh, never on a real site.
 *
 * Order matters: dry run → T1/T2 → P1 → idempotency → references → URLs → relations
 * → guards → full migration. Each step checks that legacy data is unchanged.
 */

use Trigon\AlaliahCore\Schema;
use Trigon\AlaliahCore\Domain\References;
use Trigon\AlaliahCore\Domain\PropertyUrls;
use Trigon\AlaliahCore\Domain\Relations;
use Trigon\AlaliahCore\Domain\Quality;
use Trigon\AlaliahCore\Domain\Permits;
use Trigon\AlaliahCore\Domain\FloorPlans;
use Trigon\AlaliahCore\Domain\DeveloperReadiness;
use Trigon\AlaliahCore\Model\Seed;
use Trigon\AlaliahCore\Migration\Planner;
use Trigon\AlaliahCore\Migration\Fingerprint;
use Trigon\AlaliahCore\Migration\WriteGuard;
use Trigon\AlaliahCore\Admin\Editor;
use Trigon\AlaliahCore\Admin\DataQuality;
use Trigon\AlaliahCore\Rest\Fields;

if ( ! preg_match( '#^http://(localhost|127\.0\.0\.1):\d+$#', untrailingslashit( home_url() ) ) ) {
	fwrite( STDERR, "Refusing: integration tests run on a localhost site only.\n" );
	exit( 1 );
}

// ------------------------------------------------------------------ harness

$GLOBALS['aa_t'] = array( 'pass' => 0, 'fail' => 0, 'failures' => array(), 'section' => '' );

function t_section( string $s ): void {
	$GLOBALS['aa_t']['section'] = $s;
	echo "\n## {$s}\n";
}

function ok( $cond, string $msg, string $detail = '' ): void {
	if ( $cond ) {
		++$GLOBALS['aa_t']['pass'];
		echo "  ok   {$msg}\n";
		return;
	}
	++$GLOBALS['aa_t']['fail'];
	$GLOBALS['aa_t']['failures'][] = $GLOBALS['aa_t']['section'] . ': ' . $msg . ( $detail ? " ({$detail})" : '' );
	echo "  FAIL {$msg}" . ( $detail ? "\n       {$detail}" : '' ) . "\n";
}

function eq( $actual, $expected, string $msg ): void {
	ok( $actual === $expected, $msg, 'expected ' . wp_json_encode( $expected ) . ', got ' . wp_json_encode( $actual ) );
}

// PHP warnings and notices count as failures.
set_error_handler(
	static function ( $no, $str, $file, $line ) {
		if ( false !== strpos( (string) $file, 'trigon-alaliah-core' ) ) {
			ok( false, 'PHP notice/warning in plugin', "{$str} at " . basename( $file ) . ":{$line}" );
		}
		return false;
	}
);

/** Run a WP-CLI command in a fresh process (the real CLI path); flush this process's caches after. */
function cli( string $cmd ): object {
	$r = WP_CLI::runcommand( $cmd, array( 'return' => 'all', 'launch' => true, 'exit_error' => false ) );
	wp_cache_flush();
	return $r;
}

/** Content hash of every table the plugin could touch. */
function db_state(): array {
	global $wpdb;
	$out = array();
	foreach ( array( 'posts', 'postmeta', 'terms', 'term_taxonomy', 'term_relationships', 'termmeta' ) as $t ) {
		$rows      = $wpdb->get_results( "SELECT * FROM {$wpdb->$t}", ARRAY_N ); // phpcs:ignore
		$out[ $t ] = count( $rows ) . ':' . md5( wp_json_encode( $rows ) );
	}
	$opts            = $wpdb->get_results( "SELECT option_name, option_value FROM {$wpdb->options} WHERE option_name NOT LIKE '%transient%' AND option_name <> 'cron' ORDER BY option_name", ARRAY_N ); // phpcs:ignore
	$out['options'] = count( $opts ) . ':' . md5( wp_json_encode( $opts ) );
	return $out;
}

function migrated( string $type, int $legacy ): int {
	global $wpdb;
	return (int) $wpdb->get_var( $wpdb->prepare( "SELECT pm.post_id FROM {$wpdb->postmeta} pm JOIN {$wpdb->posts} p ON p.ID = pm.post_id WHERE pm.meta_key = 'aa_legacy_post_id' AND pm.meta_value = %s AND p.post_type = %s", (string) $legacy, $type ) );
}

function count_type( string $type ): int {
	return count( get_posts( array( 'post_type' => $type, 'post_status' => 'any', 'posts_per_page' => -1, 'fields' => 'ids' ) ) );
}

function slugs( int $id, string $tax ): array {
	$s = wp_get_object_terms( $id, $tax, array( 'fields' => 'slugs' ) );
	$s = is_wp_error( $s ) ? array() : $s;
	sort( $s );
	return $s;
}

function path_names( int $id ): array {
	return array_column( Fields::location_path( $id ), 'name' );
}

/** All keys, recursively. */
function all_keys( $v ): array {
	$keys = array();
	if ( is_array( $v ) ) {
		foreach ( $v as $k => $x ) {
			$keys[] = (string) $k;
			$keys   = array_merge( $keys, all_keys( $x ) );
		}
	}
	return $keys;
}

function rest_get( string $route, array $params = array() ): WP_REST_Response {
	$req = new WP_REST_Request( 'GET', $route );
	foreach ( $params as $k => $v ) {
		$req->set_param( $k, $v );
	}
	return rest_do_request( $req );
}

function legacy_counts(): array {
	$out = array();
	foreach ( array( 'estate_property', 'estate_developer', 'estate_agent', 'estate_review', 'attachment', 'page' ) as $t ) {
		$out[ $t ] = count( get_posts( array( 'post_type' => $t, 'post_status' => 'any', 'posts_per_page' => -1, 'fields' => 'ids' ) ) );
	}
	return $out;
}

$admin = get_user_by( 'login', 'admin' );
$tmp   = trailingslashit( sys_get_temp_dir() ) . 'aa-tests-' . getmypid();
wp_mkdir_p( $tmp );
$baseline_legacy = legacy_counts();

// ------------------------------------------------------------------ 1. registration

t_section( '1. Registration' );
foreach ( array( Schema::PROPERTY, Schema::PROJECT, Schema::DEVELOPER, Schema::AREA, Schema::AGENT, Schema::INSIGHT ) as $type ) {
	ok( post_type_exists( $type ), "post type {$type} registered" );
}
$pt = get_post_type_object( Schema::PROPERTY );
eq( $pt->rewrite, false, 'property CPT has no core rewrite (URLs come from the reference rule)' );
eq( $pt->rest_base, 'properties', 'property REST base is "properties"' );
$expect_slugs = array( Schema::PROJECT => 'projects', Schema::DEVELOPER => 'developers', Schema::AREA => 'areas', Schema::AGENT => 'team', Schema::INSIGHT => 'insights' );
foreach ( $expect_slugs as $type => $slug ) {
	$o = get_post_type_object( $type );
	eq( $o->rewrite['slug'] ?? null, $slug, "{$type} URL base is /{$slug}/" );
	ok( false === strpos( (string) ( $o->rewrite['slug'] ?? '' ), 'alaliah' ), "{$type} URL base has no internal prefix" );
}
eq( get_post_type_object( Schema::DEVELOPER )->labels->archives, 'All Developers', 'developer archive label is "All Developers"' );
foreach ( array( Schema::TAX_LOCATION, Schema::TAX_PURPOSE, Schema::TAX_COMPLETION, Schema::TAX_STATUS, Schema::TAX_CATEGORY, Schema::TAX_TYPE, Schema::TAX_AMENITY, Schema::TAX_REL_DEV, Schema::TAX_REL_PROJ ) as $tax ) {
	$o = get_taxonomy( $tax );
	ok( $o && false === $o->rewrite && ! $o->public && ! $o->publicly_queryable, "{$tax} has no public URL" );
}
foreach ( array( Schema::TAX_REL_DEV, Schema::TAX_REL_PROJ ) as $tax ) {
	$o = get_taxonomy( $tax );
	ok( ! $o->show_ui && ! $o->show_in_rest && 'do_not_allow' === $o->cap->assign_terms && 'do_not_allow' === $o->cap->edit_terms, "{$tax} is derived only (no UI, no REST, no capability)" );
}
ok( is_protected_meta( 'aa_price', 'post' ) && is_protected_meta( 'aa_reference', 'post' ), 'aa_ meta is protected from the Custom Fields box' );
$registered = get_registered_meta_keys( 'post', Schema::PROPERTY );
ok( isset( $registered['aa_price'] ) && false === $registered['aa_price']['show_in_rest'], 'aa_ meta is registered and not exposed raw in REST' );
$rules = get_option( 'rewrite_rules' );
ok( is_array( $rules ) && isset( $rules['^property/(?:.+-)?(aa-[0-9]{4,})/?$'] ), 'property reference rewrite rule is in the flushed rules' );
$code_only = static function ( string $file ): string {
	$out = '';
	foreach ( token_get_all( (string) file_get_contents( $file ) ) as $tok ) {
		if ( is_array( $tok ) && in_array( $tok[0], array( T_COMMENT, T_DOC_COMMENT ), true ) ) {
			continue;
		}
		$out .= is_array( $tok ) ? $tok[1] : $tok;
	}
	return $out;
};
ok( false === strpos( $code_only( dirname( __DIR__ ) . '/src/Domain/Relations.php' ), 'aa_property_agency' ), 'Relations code never reads aa_property_agency (agency is not developer)' );

$registered_own = array_values( array_filter( get_taxonomies(), static fn( $t ) => 0 === strpos( $t, 'alaliah_' ) ) );
sort( $registered_own );
$listed_own = Schema::taxonomies();
sort( $listed_own );
eq( $listed_own, $registered_own, 'Schema::taxonomies() lists exactly the registered alaliah_ taxonomies' );
$refused = false;
try {
	$m = new ReflectionMethod( \Trigon\AlaliahCore\Migration\Executor::class, 'own_taxonomy' );
	$m->setAccessible( true );
	$m->invoke( new \Trigon\AlaliahCore\Migration\Executor( 'test', false ), 'property_area' );
} catch ( \RuntimeException $e ) {
	$refused = true;
}
ok( $refused, 'executor refuses a legacy taxonomy before any write (primary protection)' );
$executor_src = $code_only( dirname( __DIR__ ) . '/src/Migration/Executor.php' );
ok( ! preg_match( '/\b(property_|estate_)/', $executor_src ), 'executor code names no legacy post type or taxonomy' );

// ------------------------------------------------------------------ 2. setup

t_section( '2. Setup (idempotent)' );
$r1 = Seed::run();
$r2 = Seed::run();
eq( $r1['created'], 20, 'first setup creates the 20 fixed terms' );
eq( $r2['created'], 0, 'second setup creates nothing' );
$refs = References::setup();
eq( (int) $refs['next'], 1012, 'hand-created counter starts at AA-1012' );
eq( $refs['reserved'], array( 'from' => 1001, 'to' => 1011 ), 'AA-1001 to AA-1011 reserved for migrated listings' );
eq( count( get_terms( array( 'taxonomy' => Schema::TAX_AMENITY, 'hide_empty' => false ) ) ), 0, 'no amenity terms are seeded' );

// ------------------------------------------------------------------ 3. dry run

t_section( '3. Dry run writes nothing' );
$baseline_file = $tmp . '/legacy-baseline.json';
$r             = cli( "alaliah migrate verify-legacy --baseline={$baseline_file}" );
ok( 0 === $r->return_code && file_exists( $baseline_file ), 'legacy fingerprint baseline written' );
$before = db_state();
foreach ( array( 't1t2', 'p1', 'full' ) as $set ) {
	$r = cli( "alaliah migrate plan --set={$set} --report={$tmp}/plan-{$set}" );
	ok( 0 === $r->return_code, "plan --set={$set} completes", $r->stderr );
	$r = cli( "alaliah migrate run --set={$set} --report={$tmp}/run-noexec-{$set}" );
	ok( 0 === $r->return_code && false !== strpos( $r->stdout . $r->stderr, 'nothing written' ), "run --set={$set} without --execute is a dry run" );
}
$after = db_state();
eq( $after, $before, 'database identical after six dry runs (posts, meta, terms, relationships, options)' );
$plan_full = json_decode( (string) file_get_contents( "{$tmp}/plan-full/report.json" ), true );
$plan_p1   = json_decode( (string) file_get_contents( "{$tmp}/plan-p1/report.json" ), true );
$plan_t    = json_decode( (string) file_get_contents( "{$tmp}/plan-t1t2/report.json" ), true );
ok( file_exists( "{$tmp}/plan-full/report.csv" ) && file_exists( "{$tmp}/plan-full/summary.txt" ), 'plan writes JSON, CSV and summary reports' );
eq( $plan_full['legacy_check']['same'] ?? null, true, 'plan reports legacy data unchanged' );

$by = static function ( array $plan, string $entity ): array {
	return array_values( array_filter( $plan['plan']['items'], static fn( $i ) => $entity === $i['entity'] ) );
};
eq( count( $by( $plan_full, 'developer' ) ), 17, 'full plan: 17 developers' );
eq( count( $by( $plan_full, 'project' ) ), 3, 'full plan: 3 projects (the Dubai records)' );
eq( count( $by( $plan_full, 'property' ) ), 11, 'full plan: 11 properties' );
eq( count( $by( $plan_full, 'agent' ) ), 1, 'full plan: 1 agent (office record)' );
eq( count( $by( $plan_full, 'location' ) ), 16, 'full plan: 16 location terms (UAE, 2 emirates, 13 communities)' );
eq( count( $by( $plan_t, 'property' ) ) + count( $by( $plan_t, 'agent' ) ), 0, 'T1/T2 plan: no properties, no agent' );
eq( array_column( $by( $plan_t, 'developer' ), 'legacy_id' ), array( 32018, 32040 ), 'T1/T2 plan: Danube and Binghatti only' );
eq( array_column( $by( $plan_t, 'project' ), 'legacy_id' ), array( 32078, 32101 ), 'T1/T2 plan: Bayz 102 and Binghatti Aquarise only' );
eq( array_column( $by( $plan_p1, 'property' ), 'legacy_id' ), array( 31013 ), 'P1 plan: property 31013 only' );
eq( count( $by( $plan_p1, 'developer' ) ) + count( $by( $plan_p1, 'project' ) ), 0, 'P1 plan: no developer, no project' );

// Deterministic reference map.
$expected_refs = array( 30964 => 'AA-1001', 30967 => 'AA-1002', 31002 => 'AA-1003', 31013 => 'AA-1004', 31023 => 'AA-1005', 31082 => 'AA-1006', 31083 => 'AA-1007', 31094 => 'AA-1008', 31495 => 'AA-1009', 31521 => 'AA-1010', 31571 => 'AA-1011' );
$got_refs      = array();
foreach ( $by( $plan_full, 'property' ) as $i ) {
	$got_refs[ $i['legacy_id'] ] = $i['reference'];
}
ksort( $got_refs );
eq( $got_refs, $expected_refs, 'reference map follows publish date then legacy ID (31013 → AA-1004)' );
eq( $by( $plan_p1, 'property' )[0]['reference'], 'AA-1004', 'P1 alone gets the same reference as in the full map' );

// Al Reef Downtown, Azizi, developer About.
$reef = array_values( array_filter( $by( $plan_full, 'location' ), static fn( $i ) => 'al-reef-downtown' === $i['slug'] ) )[0] ?? null;
ok( $reef && 'location:city:2' === $reef['parent'] || ( $reef && false !== strpos( (string) $reef['parent'], 'city' ) ), 'Al Reef Downtown is planned under an emirate' );
ok( $reef && in_array( 'area_conflict', $reef['flags'], true ) && 'Dubai' === ( $reef['audit']['legacy']['cityparent'] ?? null ), 'Al Reef Downtown flagged area_conflict, original cityparent "Dubai" audited' );
$azizi = array_values( array_filter( $by( $plan_full, 'developer' ), static fn( $i ) => 32034 === $i['legacy_id'] ) )[0];
eq( array( $azizi['post']['post_title'], $azizi['post']['post_name'] ), array( 'Azizi Developments', 'azizi-developments' ), 'Azizi name and slug corrected' );
$about_ok = true;
foreach ( $by( $plan_full, 'developer' ) as $d ) {
	if ( '' !== $d['post']['post_content'] || ! empty( $d['meta']['aa_about'] ) ) {
		$about_ok = false;
	}
}
ok( $about_ok, 'no developer About is planned into aa_about or post_content' );
eq( $azizi['meta']['aa_about_legacy'] ?? null, 'A leading developer offering a wide range of residential and investment properties', 'legacy description planned into aa_about_legacy' );
$venice = array_values( array_filter( $by( $plan_full, 'project' ), static fn( $i ) => 32060 === $i['legacy_id'] ) )[0];
ok( empty( $venice['links']['aa_developer_id'] ) && in_array( 'provisional_relationship', $venice['flags'], true ), 'Azizi Venice is not linked to Azizi (T3 provisional, flagged)' );

// Redirect map uses the same URL rule as the live permalink (checked again after P1 runs).
$redirect_31013 = array_values( array_filter( $plan_full['plan']['redirects'], static fn( $r ) => '/properties/fully-furnished-1bd-marina-square-vacant/' === $r['from'] ) )[0]['to'] ?? '';
eq( $redirect_31013, home_url( '/property/fully-furnished-1bd-marina-square-vacant-aa-1004/' ), 'legacy URL of 31013 maps to /property/{slug}-aa-1004/' );

// ------------------------------------------------------------------ 4. T1/T2

t_section( '4. T1/T2 execute (Developer → Project → Area)' );
$attachments_before = legacy_counts()['attachment'];
$r = cli( "alaliah migrate run --set=t1t2 --execute --report={$tmp}/run-t1t2" );
ok( 0 === $r->return_code, 'T1/T2 executes', $r->stderr );
ok( false !== strpos( $r->stdout, 'Legacy data unchanged: YES' ), 'T1/T2: legacy fingerprint unchanged' );
eq( count_type( Schema::DEVELOPER ), 2, 'exactly 2 developers created' );
eq( count_type( Schema::PROJECT ), 2, 'exactly 2 projects created' );
eq( count_type( Schema::PROPERTY ) + count_type( Schema::AGENT ) + count_type( Schema::AREA ), 0, 'no properties, agents or area posts created' );
eq( migrated( Schema::DEVELOPER, 32034 ), 0, 'Azizi not created by T1/T2' );

$danube    = migrated( Schema::DEVELOPER, 32018 );
$binghatti = migrated( Schema::DEVELOPER, 32040 );
$bayz      = migrated( Schema::PROJECT, 32078 );
$aquarise  = migrated( Schema::PROJECT, 32101 );
eq( array( get_post_status( $danube ), get_post_status( $binghatti ), get_post_status( $bayz ), get_post_status( $aquarise ) ), array( 'draft', 'draft', 'draft', 'draft' ), 'all migrated records are drafts' );
eq( array( get_post_meta( $danube, 'aa_review_status', true ), get_post_meta( $binghatti, 'aa_review_status', true ) ), array( 'verified', 'verified' ), 'T1/T2 developers: identity verified' );
eq( get_post_field( 'post_content', $binghatti ), '', 'Binghatti: post content empty' );
eq( (string) get_post_meta( $binghatti, 'aa_about', true ), '', 'Binghatti: aa_about empty' );
eq( get_post_meta( $binghatti, 'aa_about_legacy', true ), 'A developer known for distinctive architecture and branded collaborations', 'Binghatti: legacy text in aa_about_legacy only' );
eq( (int) get_post_meta( $binghatti, 'aa_logo_id', true ), (int) get_post_meta( 32040, '_thumbnail_id', true ), 'Binghatti logo reuses the legacy attachment' );
eq( (int) get_post_meta( $bayz, 'aa_developer_id', true ), $danube, 'T1: Bayz 102 → Danube (canonical meta)' );
eq( (int) get_post_meta( $aquarise, 'aa_developer_id', true ), $binghatti, 'T2: Binghatti Aquarise → Binghatti (canonical meta)' );
eq( slugs( $bayz, Schema::TAX_REL_DEV ), array( 'd-' . $danube ), 'T1: shadow developer term matches meta' );
eq( slugs( $aquarise, Schema::TAX_REL_DEV ), array( 'd-' . $binghatti ), 'T2: shadow developer term matches meta' );
eq( path_names( $bayz ), array( 'UAE', 'Dubai', 'Business Bay' ), 'T1: location UAE › Dubai › Business Bay' );
eq( path_names( $aquarise ), array( 'UAE', 'Dubai', 'Business Bay' ), 'T2: location UAE › Dubai › Business Bay' );
eq( slugs( $aquarise, Schema::TAX_COMPLETION ), array( 'off-plan' ), 'projects are off-plan' );
eq( Relations::by_developer( $danube, Schema::PROJECT ), array( $bayz ), 'derived: Danube has 1 project' );
eq( count( Relations::by_developer( $danube, Schema::PROPERTY ) ), 0, 'derived: Danube has 0 listings (T1 does not prove Project → Property)' );
eq( array_map( static fn( $t ) => $t->slug, Relations::developer_areas( $binghatti ) ), array( 'business-bay' ), 'derived: Binghatti areas = Business Bay' );
eq( (string) get_post_meta( $aquarise, 'aa_payment_plan_overall', true ), '70/30', 'payment plan copied exactly (trim only)' );
eq( (string) get_post_meta( $aquarise, 'aa_handover', true ), 'Q2, 2027', 'handover copied exactly' );
$permits = Permits::all( $aquarise );
eq( count( $permits ), 1, 'Aquarise: one permit entry' );
eq( array( $permits[0]['number'] ?? '', $permits[0]['status'] ?? '', $permits[0]['public'] ?? null, $permits[0]['system'] ?? '' ), array( '123564', 'unverified', false, 'unspecified' ), 'permit 123564 stored as unverified, not public, system unspecified' );
eq( Permits::public_entries( $aquarise ), array(), 'unverified permit has no public entry' );
ok( in_array( 'unverified_permit', Quality::all( $aquarise ), true ), 'Aquarise flagged unverified_permit' );
eq( get_post_meta( $aquarise, 'aa_property_agency', true ), 'Binghatti Properties', 'agency text kept as written' );
eq( legacy_counts()['attachment'], $attachments_before, 'no attachments created (media reused)' );

// REST for a project (edit context, as admin).
wp_set_current_user( $admin->ID );
$res  = rest_get( '/wp/v2/projects/' . $aquarise, array( 'context' => 'edit' ) );
$data = $res->get_data();
eq( $res->get_status(), 200, 'project REST responds' );
$json = wp_json_encode( $data['alaliah'] ?? null );
ok( false === strpos( $json, '123564' ), 'unverified permit number never in REST' );
ok( ! array_filter( all_keys( $data['alaliah'] ?? array() ), static fn( $k ) => 0 === strpos( $k, 'aa_' ) || false !== strpos( $k, 'legacy' ) ), 'project REST has no aa_ or legacy keys' );
ok( false === strpos( $json, 'Binghatti Properties' ), 'agency text not in REST' );
eq( $data['alaliah']['developer']['id'] ?? null, $binghatti, 'project REST exposes the developer reference' );
wp_set_current_user( 0 );

// ------------------------------------------------------------------ 5. P1

t_section( '5. P1 execute (property 31013)' );
$r = cli( "alaliah migrate run --set=p1 --execute --report={$tmp}/run-p1" );
ok( 0 === $r->return_code, 'P1 executes', $r->stderr );
ok( false !== strpos( $r->stdout, 'Legacy data unchanged: YES' ), 'P1: legacy fingerprint unchanged' );
$p1    = migrated( Schema::PROPERTY, 31013 );
$agent = migrated( Schema::AGENT, 30966 );
eq( count_type( Schema::PROPERTY ), 1, 'exactly 1 property created' );
ok( $p1 > 0 && $agent > 0, 'property and office agent created' );
eq( get_post_status( $p1 ), 'draft', 'P1 is a draft' );
eq( References::get( $p1 ), 'AA-1004', 'P1 reference AA-1004' );
eq( get_post_field( 'post_name', $p1 ), 'fully-furnished-1bd-marina-square-vacant', 'stored slug has no token' );
eq( PropertyUrls::permalink( $p1 ), home_url( '/property/fully-furnished-1bd-marina-square-vacant-aa-1004/' ), 'URL /property/{slug}-aa-1004/' );
eq( PropertyUrls::permalink( $p1 ), $redirect_31013, 'redirect map and permalink use the same rule' );
eq( get_permalink( $p1 ), PropertyUrls::permalink( $p1 ), 'get_permalink uses the rule' );
eq( (int) get_option( References::OPTION_NEXT ), 1012, 'migrated reference did not move the hand-created counter' );
eq( slugs( $p1, Schema::TAX_PURPOSE ), array( 'rent' ), 'purpose rent' );
eq( slugs( $p1, Schema::TAX_COMPLETION ), array( 'ready' ), 'completion ready' );
eq( slugs( $p1, Schema::TAX_STATUS ), array( 'available' ), 'status available' );
eq( slugs( $p1, Schema::TAX_TYPE ), array( 'apartment' ), 'type apartment' );
eq( (int) get_post_meta( $p1, 'aa_price', true ), 105000, 'price 105000' );
eq( get_post_meta( $p1, 'aa_rent_period', true ), 'yearly', 'rent period yearly' );
eq( array( (int) get_post_meta( $p1, 'aa_bedrooms', true ), (int) get_post_meta( $p1, 'aa_bathrooms', true ), (float) get_post_meta( $p1, 'aa_size_builtup', true ) ), array( 1, 2, 915.0 ), 'bedrooms, bathrooms, size' );
eq( (int) get_post_meta( $p1, 'aa_agent_id', true ), $agent, 'agent relationship → office record' );
eq( path_names( $p1 ), array( 'UAE', 'Abu Dhabi', 'Al Reem Island' ), 'location UAE › Abu Dhabi › Al Reem Island (verified levels only)' );
ok( ! get_term_by( 'slug', 'marina-square', Schema::TAX_LOCATION ) && ! get_term_by( 'slug', 'marina-blue-tower', Schema::TAX_LOCATION ), 'Marina Square / Marina Blue Tower not created (unconfirmed)' );
$audit = get_post_meta( $p1, 'aa_migration_audit', true );
ok( is_array( $audit ) && false !== strpos( wp_json_encode( $audit ), 'Marina Blue Tower' ), 'building proposal kept in the audit only' );
$legacy_gallery = array_map( 'intval', (array) get_post_meta( 31013, 'wpestate_property_gallery', true ) );
eq( array_map( 'intval', (array) get_post_meta( $p1, 'aa_gallery', true ) ), $legacy_gallery, 'gallery reuses the 9 legacy attachment IDs in order' );
eq( (int) get_post_meta( $p1, '_thumbnail_id', true ), (int) get_post_meta( 31013, '_thumbnail_id', true ), 'featured image reuses the legacy thumbnail' );
eq( (int) wp_get_post_parent_id( $legacy_gallery[0] ), 31013, 'attachment parent unchanged (still the legacy post)' );
eq( get_post_meta( $p1, 'aa_floor_plans', true ), '', 'no floor plans stored' );
eq( FloorPlans::for_display( $p1 ), array(), 'floor plans render as nothing' );
$flags = Quality::all( $p1 );
foreach ( array( 'missing_coordinates', 'missing_permit', 'missing_alt', 'building_unconfirmed', 'rent_period_assumed' ) as $f ) {
	ok( in_array( $f, $flags, true ), "P1 flagged {$f}" );
}
foreach ( array( 'missing_developer', 'missing_project', 'missing_price', 'missing_agent', 'missing_area' ) as $f ) {
	ok( ! in_array( $f, $flags, true ), "P1 not flagged {$f}" );
}
eq( Relations::effective_developer( $p1 ) + Relations::project_of( $p1 ), 0, 'P1 has no developer or project (none inferred)' );
eq( slugs( $p1, Schema::TAX_REL_DEV ), array(), 'P1 has no shadow developer term' );
eq( count_type( Schema::DEVELOPER ), 2, 'P1 created no developers' );
$agent_audit = get_post_meta( $agent, 'aa_migration_audit', true );
ok( is_array( $agent_audit ) && ! array_diff( (array) ( $agent_audit['private_fields'] ?? array() ), array( 'set', 'empty' ) ), 'agent audit records contact fields as set/empty, never values' );
ok( false === strpos( wp_json_encode( $agent_audit ), 'example.invalid' ), 'agent audit holds no contact value' );

// REST representation of P1 (edit context as admin; it is a draft).
wp_set_current_user( $admin->ID );
$res  = rest_get( '/wp/v2/properties/' . $p1, array( 'context' => 'edit' ) );
$data = $res->get_data();
$a    = $data['alaliah'] ?? array();
eq( $res->get_status(), 200, 'property REST responds' );
eq( $a['reference'] ?? null, 'AA-1004', 'REST reference AA-1004' );
eq( array( $a['purpose'] ?? null, $a['completion'] ?? null, $a['status'] ?? null, $a['type'] ?? null ), array( 'rent', 'ready', 'available', 'apartment' ), 'REST purpose/completion/status/type' );
eq( array_column( $a['location'] ?? array(), 'name' ), array( 'UAE', 'Abu Dhabi', 'Al Reem Island' ), 'REST location path' );
eq( $a['agent']['id'] ?? null, $agent, 'REST agent reference' );
ok( array_key_exists( 'developer', $a ) && null === $a['developer'] && array_key_exists( 'project', $a ) && null === $a['project'], 'REST developer and project are present and null' );
eq( count( $a['gallery'] ?? array() ), 9, 'REST gallery has 9 images' );
eq( $a['floor_plans'] ?? null, array(), 'REST floor_plans empty' );
eq( $a['permits'] ?? null, array(), 'REST permits empty' );
eq( $a['url'] ?? null, PropertyUrls::permalink( $p1 ), 'REST url is the canonical URL' );
eq( $data['link'] ?? null, PropertyUrls::permalink( $p1 ), 'REST link is the canonical URL' );
ok( ! array_filter( all_keys( $a ), static fn( $k ) => 0 === strpos( $k, 'aa_' ) || false !== strpos( $k, 'legacy' ) ), 'REST has no aa_ or legacy keys' );
$scalars = array();
array_walk_recursive( $a, static function ( $v ) use ( &$scalars ) { $scalars[] = (string) $v; } );
ok( ! in_array( '31013', $scalars, true ), 'REST does not expose the legacy ID as a value' );
ok( ! isset( $data['meta']['aa_price'] ), 'raw meta not in REST' );
wp_set_current_user( 0 );
ok( rest_get( '/wp/v2/team/' . $agent )->get_status() >= 400, 'draft agent (with contact values) not visible over REST without login' );
$reports = '';
foreach ( glob( $tmp . '/*/*' ) as $f ) {
	$reports .= (string) file_get_contents( $f );
}
ok( '' !== $reports && false === strpos( $reports, 'example.invalid' ) && false === strpos( $reports, '000 0000' ), 'migration reports contain no agent contact values' );
$anon = rest_get( '/wp/v2/properties/' . $p1 );
ok( $anon->get_status() >= 400, 'draft P1 not visible over REST without login' );

// Admin editor renders every group without notices.
wp_set_current_user( $admin->ID );
set_current_screen( 'post' );
$post = get_post( $p1 );
foreach ( Schema::groups( Schema::PROPERTY ) as $gk => $g ) {
	ob_start();
	Editor::render_group( $post, array( 'args' => array( 'group' => $gk ) ) );
	$html = ob_get_clean();
	ok( '' !== trim( $html ), "editor group '{$gk}' renders" );
}

// ------------------------------------------------------------------ 6. Idempotency

t_section( '6. Idempotency and human edits' );
$state = db_state();
foreach ( array( 't1t2', 'p1' ) as $set ) {
	$r = cli( "alaliah migrate run --set={$set} --execute --report={$tmp}/rerun-{$set}" );
	$rep = json_decode( (string) file_get_contents( "{$tmp}/rerun-{$set}/report.json" ), true );
	$actions = array_count_values( array_column( $rep['results'], 'action' ) );
	ok( 0 === $r->return_code && empty( $actions['create'] ) && empty( $actions['update'] ), "rerun {$set}: nothing created or updated", wp_json_encode( $actions ) );
}
$after = db_state();
unset( $state['options'], $after['options'] ); // Rerun writes only the lock option, removed again.
eq( $after, $state, 'reruns leave posts, meta and terms identical' );

// Human edit via the admin save path, then rerun: skipped.
Editor::apply( $p1, Schema::PROPERTY, array( 'aa_price' => '99000' ) );
eq( (int) get_post_meta( $p1, 'aa_price', true ), 99000, 'admin edit saves the price' );
eq( References::get( $p1 ), 'AA-1004', 'reference unchanged by admin save' );
$r   = cli( "alaliah migrate run --set=p1 --execute --report={$tmp}/rerun-edited" );
$rep = json_decode( (string) file_get_contents( "{$tmp}/rerun-edited/report.json" ), true );
$res = array_values( array_filter( $rep['results'], static fn( $x ) => 'property' === $x['entity'] ) )[0];
eq( $res['action'], 'skip-edited', 'edited listing is skipped on rerun' );
eq( (int) get_post_meta( $p1, 'aa_price', true ), 99000, 'edited value kept' );

// ------------------------------------------------------------------ 7. References

t_section( '7. References' );
wp_set_current_user( $admin->ID );
ok( false === update_post_meta( $p1, 'aa_reference', 'AA-2000' ), 'reference cannot be changed' );
ok( false === delete_post_meta( $p1, 'aa_reference' ), 'reference cannot be deleted' );
ok( false === add_post_meta( $p1, 'aa_reference', 'AA-2001' ), 'a second reference cannot be added' );
eq( References::get( $p1 ), 'AA-1004', 'reference still AA-1004' );
$hand = wp_insert_post( array( 'post_type' => Schema::PROPERTY, 'post_status' => 'draft', 'post_title' => 'Test hand-created listing' ) );
eq( References::get( $hand ), 'AA-1012', 'first hand-created listing gets AA-1012' );
$hand2 = wp_insert_post( array( 'post_type' => Schema::PROPERTY, 'post_status' => 'draft', 'post_title' => 'Second test listing aa-1013', 'post_name' => 'second-test-listing-aa-1099' ) );
eq( References::get( $hand2 ), 'AA-1013', 'second gets AA-1013' );
eq( get_post_field( 'post_name', $hand2 ), 'second-test-listing', 'token-like suffix stripped from the stored slug' );
wp_update_post( array( 'ID' => $hand, 'post_title' => 'Renamed listing' ) );
eq( References::get( $hand ), 'AA-1012', 'reference survives a title change' );
References::assign( $hand2, 'AA-1004' );
eq( References::get( $hand2 ), 'AA-1013', 'assign() never replaces an existing reference' );

// ------------------------------------------------------------------ 8. URLs over HTTP

t_section( '8. URL resolution and redirects (HTTP)' );
$hand_pub = wp_insert_post( array( 'post_type' => Schema::PROPERTY, 'post_status' => 'publish', 'post_title' => 'Published test villa' ) );
$canon    = PropertyUrls::permalink( $hand_pub );
$ref_tok  = References::token( References::get( $hand_pub ) );
flush_rewrite_rules( false );
$port   = (int) ( getenv( 'AA_TEST_PORT' ) ?: 8890 );
$server = proc_open( array( PHP_BINARY, '-S', "127.0.0.1:{$port}", '-t', ABSPATH ), array( array( 'pipe', 'r' ), array( 'file', '/dev/null', 'w' ), array( 'file', '/dev/null', 'w' ) ), $pipes );
usleep( 700000 );
$http = static function ( string $path ): array {
	$url = preg_replace( '#^https?://[^/]+#', 'http://127.0.0.1:' . (int) ( getenv( 'AA_TEST_PORT' ) ?: 8890 ), $path );
	$ch  = curl_init( $url );
	curl_setopt_array( $ch, array( CURLOPT_RETURNTRANSFER => true, CURLOPT_FOLLOWLOCATION => false, CURLOPT_HEADER => true, CURLOPT_TIMEOUT => 20, CURLOPT_HTTPHEADER => array( 'Host: localhost:' . (int) ( getenv( 'AA_TEST_PORT' ) ?: 8890 ) ) ) );
	$raw  = (string) curl_exec( $ch );
	$code = (int) curl_getinfo( $ch, CURLINFO_RESPONSE_CODE );
	curl_close( $ch );
	preg_match( '/^Location:\s*(\S+)/mi', $raw, $m );
	return array( $code, $m[1] ?? '' );
};
list( $code ) = $http( $canon );
eq( $code, 200, 'canonical URL serves 200' );
list( $code, $loc ) = $http( home_url( "/property/{$ref_tok}/" ) );
eq( array( $code, $loc ), array( 301, $canon ), 'bare /property/aa-NNNN/ 301s to canonical' );
list( $code, $loc ) = $http( home_url( "/property/old-title-{$ref_tok}/" ) );
eq( array( $code, $loc ), array( 301, $canon ), 'old slug 301s to canonical' );
list( $code, $loc ) = $http( $canon . '?utm_source=test' );
eq( $code, 200, 'query string on canonical URL does not redirect' );
list( $code ) = $http( home_url( '/property/whatever-aa-9999/' ) );
eq( $code, 404, 'unknown reference 404s' );
list( $code ) = $http( PropertyUrls::permalink( $p1 ) );
eq( $code, 404, 'draft listing is not public' );
list( $code ) = $http( home_url( '/?p=' . $hand_pub ) );
ok( in_array( $code, array( 200, 301 ), true ), 'plain ?p= link does not error' );
proc_terminate( $server );

// ------------------------------------------------------------------ 9. Relations, agency rule, floor plans, permits

t_section( '9. Relations, agency rule, floor plans, permits' );
// Agency never sets developer.
$agency_test = wp_insert_post( array( 'post_type' => Schema::PROPERTY, 'post_status' => 'draft', 'post_title' => 'Agency rule test' ) );
Editor::apply( $agency_test, Schema::PROPERTY, array( 'aa_property_agency' => 'Danube Properties' ) );
eq( array( (string) get_post_meta( $agency_test, 'aa_developer_id', true ), Relations::effective_developer( $agency_test ), slugs( $agency_test, Schema::TAX_REL_DEV ) ), array( '', 0, array() ), 'agency "Danube Properties" sets no developer' );

// Property under a project inherits the project's developer; own developer ignored.
Editor::apply( $agency_test, Schema::PROPERTY, array( 'aa_project_id' => (string) $bayz, 'aa_developer_id' => (string) $binghatti ) );
eq( Relations::effective_developer( $agency_test ), $danube, 'unit takes the developer from its project' );
eq( (string) get_post_meta( $agency_test, 'aa_developer_id', true ), '', 'own developer ignored when a project is set' );
eq( array( slugs( $agency_test, Schema::TAX_REL_DEV ), slugs( $agency_test, Schema::TAX_REL_PROJ ) ), array( array( 'd-' . $danube ), array( 'p-' . $bayz ) ), 'unit shadow terms follow the project' );
// Cascade: change the project's developer, unit follows.
update_post_meta( $bayz, 'aa_developer_id', $binghatti );
eq( slugs( $agency_test, Schema::TAX_REL_DEV ), array( 'd-' . $binghatti ), 'project developer change cascades to units' );
update_post_meta( $bayz, 'aa_developer_id', $danube );
eq( slugs( $agency_test, Schema::TAX_REL_DEV ), array( 'd-' . $danube ), 'and back' );

// Foreign writes to shadow terms are corrected immediately.
wp_set_object_terms( $bayz, array( 'd-999999' ), Schema::TAX_REL_DEV );
eq( slugs( $bayz, Schema::TAX_REL_DEV ), array( 'd-' . $danube ), 'foreign shadow write is overwritten from meta' );

// Drift created below the API is detected and rebuilt; meta wins.
global $wpdb;
$tt = (int) $wpdb->get_var( $wpdb->prepare( "SELECT tt.term_taxonomy_id FROM {$wpdb->term_taxonomy} tt JOIN {$wpdb->terms} t ON t.term_id = tt.term_id WHERE t.slug = %s AND tt.taxonomy = %s", 'd-' . $danube, Schema::TAX_REL_DEV ) );
$own_tt = (int) $wpdb->get_var( $wpdb->prepare( "SELECT tt.term_taxonomy_id FROM {$wpdb->term_taxonomy} tt JOIN {$wpdb->terms} t ON t.term_id = tt.term_id WHERE t.slug = %s AND tt.taxonomy = %s", 'd-' . $binghatti, Schema::TAX_REL_DEV ) );
$wpdb->delete( $wpdb->term_relationships, array( 'object_id' => $aquarise, 'term_taxonomy_id' => $own_tt ), array( '%d', '%d' ) );
$wpdb->insert( $wpdb->term_relationships, array( 'object_id' => $aquarise, 'term_taxonomy_id' => $tt, 'term_order' => 0 ) );
clean_object_term_cache( $aquarise, Schema::PROJECT );
$drift = Relations::rebuild( false );
ok( (bool) array_filter( $drift, static fn( $d ) => $aquarise === $d['post'] ), 'drift on Aquarise detected by verify' );
eq( slugs( $aquarise, Schema::TAX_REL_DEV ), array( 'd-' . $danube ), 'verify does not write' );
Relations::rebuild( true );
clean_object_term_cache( $aquarise, Schema::PROJECT );
eq( slugs( $aquarise, Schema::TAX_REL_DEV ), array( 'd-' . $binghatti ), 'rebuild restores the term from canonical meta' );
eq( Relations::rebuild( false ), array(), 'no drift after rebuild' );

// Deleting a project resyncs its units.
$tmp_project = wp_insert_post( array( 'post_type' => Schema::PROJECT, 'post_status' => 'draft', 'post_title' => 'Temporary project' ) );
update_post_meta( $tmp_project, 'aa_developer_id', $binghatti );
Editor::apply( $agency_test, Schema::PROPERTY, array( 'aa_project_id' => (string) $tmp_project ) );
eq( slugs( $agency_test, Schema::TAX_REL_DEV ), array( 'd-' . $binghatti ), 'unit under temporary project → Binghatti' );
wp_delete_post( $tmp_project, true );
eq( array( slugs( $agency_test, Schema::TAX_REL_DEV ), slugs( $agency_test, Schema::TAX_REL_PROJ ) ), array( array(), array() ), 'project deletion clears the unit\'s derived terms' );

// Image-only floor plan through the admin save path.
$plan_img = (int) $legacy_gallery[1];
Editor::apply( $p1, Schema::PROPERTY, array( 'aa_floor_plans' => array( '__present' => '', array( 'id' => (string) $plan_img, 'title' => '', 'level' => ' ', 'bedrooms' => '' ) ) ) );
eq( get_post_meta( $p1, 'aa_floor_plans', true ), array( array( 'id' => $plan_img ) ), 'image-only floor plan stored without empty labels' );
$fp = FloorPlans::for_display( $p1 );
eq( array( count( $fp ), $fp[0]['labels'] ?? null ), array( 1, array() ), 'floor plan displays with no labels' );
ok( '' !== ( $fp[0]['alt'] ?? '' ), 'floor plan has fallback alt text' );
Editor::apply( $p1, Schema::PROPERTY, array( 'aa_floor_plans' => array( '__present' => '1' ) ) ); // Marker value never becomes an item.
eq( get_post_meta( $p1, 'aa_floor_plans', true ), '', 'removing the last floor plan deletes the field' );

// Permits.
$ptest = Permits::sanitize( array( array( 'number' => '777', 'system' => 'madhmoun', 'status' => 'unverified', 'public' => '1' ), array( 'number' => '', 'status' => 'verified' ) ) );
eq( array( count( $ptest ), $ptest[0]['public'] ), array( 1, false ), 'unverified permit can never be public; empty number dropped' );
Editor::apply( $agency_test, Schema::PROPERTY, array( 'aa_permits' => array( array( 'number' => '888', 'system' => 'madhmoun', 'status' => 'verified', 'public' => '1', 'verified_on' => '2026-10-01', 'authority' => 'Test' ) ) ) );
eq( (string) get_post_meta( $agency_test, 'aa_madhmoun_permit', true ), '888', 'verified Madhmoun entry mirrored to the legacy-compatible field' );
eq( array_column( Permits::public_entries( $agency_test ), 'number' ), array( '888' ), 'verified + public permit is public' );

// ------------------------------------------------------------------ 10. Developer publish guard

t_section( '10. Developer identity vs publish readiness' );
wp_update_post( array( 'ID' => $binghatti, 'post_status' => 'publish' ) );
eq( get_post_status( $binghatti ), 'draft', 'verified developer without approved logo/About stays draft' );
$ev = DeveloperReadiness::evaluate( $binghatti );
ok( in_array( 'Logo not approved', $ev['blocking'], true ) && in_array( 'No About copy', $ev['blocking'], true ), 'blocking reasons reported' );
update_post_meta( $binghatti, 'aa_logo_approved', '1' );
update_post_meta( $binghatti, 'aa_about', 'Test About copy (stand-in).' );
wp_update_post( array( 'ID' => $binghatti, 'post_status' => 'publish' ) );
eq( get_post_status( $binghatti ), 'draft', 'unapproved About still blocks' );
wp_set_current_user( 0 );
ok( ! isset( Fields::data( $binghatti )['about'] ), 'unapproved About never in public data' );
update_post_meta( $binghatti, 'aa_about_approved', '1' );
wp_update_post( array( 'ID' => $binghatti, 'post_status' => 'publish' ) );
eq( get_post_status( $binghatti ), 'publish', 'publishes once identity, logo and About are approved' );
eq( Fields::data( $binghatti )['about'] ?? null, 'Test About copy (stand-in).', 'approved About is public' );
eq( Fields::data( $binghatti )['projects_count'], 0, 'public count uses published projects only (Aquarise is a draft)' );
ok( ! isset( Fields::data( $binghatti )['rating'] ) || null === Fields::data( $binghatti )['rating'], 'no rating without a sourced rating' );

// ------------------------------------------------------------------ 11. WriteGuard

t_section( '11. Write guard' );
$cases = array(
	'legacy meta'      => static fn() => update_post_meta( 31013, 'property_price', '1' ),
	'legacy post'      => static fn() => wp_update_post( array( 'ID' => 31013, 'post_title' => 'x' ) ),
	'legacy term'      => static fn() => wp_insert_term( 'X', 'property_area' ),
	'legacy terms'     => static fn() => wp_set_object_terms( 31013, array( 'sell' ), 'property_action_category' ),
	'post delete'      => static fn() => wp_delete_post( $GLOBALS['hand'] ?? 0, true ),
	'attachment edit'  => static fn() => wp_update_post( array( 'ID' => $GLOBALS['plan_img_id'], 'post_excerpt' => 'x' ) ),
	'non-aa meta'      => static fn() => update_post_meta( $GLOBALS['p1_id'], 'random_key', '1' ),
);
$GLOBALS['hand']        = $hand;
$GLOBALS['plan_img_id'] = $plan_img;
$GLOBALS['p1_id']       = $p1;
$fp_before              = Fingerprint::compute();
foreach ( $cases as $label => $fn ) {
	WriteGuard::enable();
	$blocked = false;
	try {
		$fn();
	} catch ( \RuntimeException $e ) {
		$blocked = 0 === strpos( $e->getMessage(), 'Write guard' );
	} finally {
		WriteGuard::disable();
	}
	ok( $blocked, "guard blocks {$label}" );
}
wp_cache_flush();
eq( array_keys( Fingerprint::compare( $fp_before, Fingerprint::compute() )['differences'] ?? array() ), array( 'legacy_relationships' ), 'only the term assignment reached the database before the guard aborted (WordPress has no pre-hook for it)' );
// Undo that one write outside the guard.
wp_set_object_terms( 31013, array( 'rent' ), 'property_action_category' );

// ------------------------------------------------------------------ 12. Full migration

t_section( '12. Full migration (local only)' );
$r = cli( "alaliah migrate run --set=full --execute --report={$tmp}/run-full" );
ok( 0 === $r->return_code, 'full migration executes', $r->stderr );
ok( false !== strpos( $r->stdout, 'Legacy data unchanged: YES' ), 'full: legacy fingerprint unchanged during the run' );
$rep     = json_decode( (string) file_get_contents( "{$tmp}/run-full/report.json" ), true );
$actions = array();
foreach ( $rep['results'] as $x ) {
	$actions[ $x['entity'] ][ $x['action'] ] = ( $actions[ $x['entity'] ][ $x['action'] ] ?? 0 ) + 1;
}
echo '       actions: ' . wp_json_encode( $actions ) . "\n";
eq( count( get_posts( array( 'post_type' => Schema::DEVELOPER, 'post_status' => 'any', 'posts_per_page' => -1, 'fields' => 'ids', 'meta_key' => 'aa_legacy_post_id' ) ) ), 17, '17 migrated developers' );
eq( count_type( Schema::PROJECT ), 3, '3 projects' );
eq( count( get_posts( array( 'post_type' => Schema::PROPERTY, 'post_status' => 'any', 'posts_per_page' => -1, 'fields' => 'ids', 'meta_key' => 'aa_legacy_post_id' ) ) ), 11, '11 migrated properties' );
eq( count_type( Schema::AGENT ), 1, '1 agent' );
eq( count_type( Schema::AREA ), 15, '15 draft area posts' );
eq( $actions['developer']['skip-edited'] ?? 0, 1, 'the developer edited in step 10 is skipped' );
eq( $actions['property']['skip-edited'] ?? 0, 1, 'the listing edited in step 6/9 is skipped' );
eq( $actions['project']['skip-edited'] ?? 0, 0, 'no project counts as edited (shadow-term repairs are not human edits)' );
$about_empty = true;
$legacy_n    = 0;
foreach ( get_posts( array( 'post_type' => Schema::DEVELOPER, 'post_status' => 'any', 'posts_per_page' => -1, 'fields' => 'ids' ) ) as $d ) {
	if ( $d === $binghatti ) {
		continue; // About approved in test 10.
	}
	if ( '' !== (string) get_post_meta( $d, 'aa_about', true ) || '' !== get_post_field( 'post_content', $d ) ) {
		$about_empty = false;
	}
	$legacy_n += '' !== (string) get_post_meta( $d, 'aa_about_legacy', true ) ? 1 : 0;
}
ok( $about_empty, 'aa_about and content empty for every migrated developer' );
eq( $legacy_n, 7, 'aa_about_legacy populated for the 7 other developers that had text' );
$azizi_id = migrated( Schema::DEVELOPER, 32034 );
eq( array( get_the_title( $azizi_id ), get_post_field( 'post_name', $azizi_id ), get_post_meta( $azizi_id, 'aa_legacy_slug', true ) ), array( 'Azizi Developments', 'azizi-developments', 'azizi-developements' ), 'Azizi corrected; legacy slug kept' );
ok( 'verified' !== get_post_meta( $azizi_id, 'aa_review_status', true ), 'Azizi identity not verified' );
update_post_meta( $azizi_id, 'aa_logo_approved', '1' );
update_post_meta( $azizi_id, 'aa_about', 'x' );
update_post_meta( $azizi_id, 'aa_about_approved', '1' );
wp_update_post( array( 'ID' => $azizi_id, 'post_status' => 'publish' ) );
eq( get_post_status( $azizi_id ), 'draft', 'unverified identity blocks publishing even with approved logo and About' );
$venice_id = migrated( Schema::PROJECT, 32060 );
eq( array( Relations::effective_developer( $venice_id ), slugs( $venice_id, Schema::TAX_REL_DEV ) ), array( 0, array() ), 'Azizi Venice has no developer' );
ok( in_array( 'missing_developer', Quality::all( $venice_id ), true ) && in_array( 'provisional_relationship', Quality::all( $venice_id ), true ), 'Azizi Venice flagged missing_developer and provisional_relationship' );
$saas = migrated( Schema::DEVELOPER, 32016 );
eq( get_the_title( $saas ), 'Saas Properties', 'SAAS title as on staging (official-spelling change needs a sourced name)' );

$reef_term = get_term_by( 'slug', 'al-reef-downtown', Schema::TAX_LOCATION );
eq( get_term( $reef_term->parent, Schema::TAX_LOCATION )->name ?? null, 'Abu Dhabi', 'Al Reef Downtown under Abu Dhabi' );
ok( false !== strpos( wp_json_encode( get_term_meta( $reef_term->term_id, 'aa_migration_audit', true ) ), 'Dubai' ), 'original cityparent audited on the term' );
foreach ( array( 'sadiyat' => 'saadiyat-island', 'jbr' => 'jumeirah-beach-residence', 'al-reem' => 'al-reem-island', 'dip' => 'dubai-investment-park' ) as $old => $new ) {
	$t = get_term_by( 'slug', $new, Schema::TAX_LOCATION );
	eq( $t ? get_term_meta( $t->term_id, 'aa_legacy_slug', true ) : null, $old, "location {$old} → {$new}, legacy slug kept" );
}

$props   = get_posts( array( 'post_type' => Schema::PROPERTY, 'post_status' => 'any', 'posts_per_page' => -1, 'fields' => 'ids', 'meta_key' => 'aa_legacy_post_id' ) );
$got     = array();
$any_dev = false;
foreach ( $props as $id ) {
	$got[ (int) get_post_meta( $id, 'aa_legacy_post_id', true ) ] = References::get( $id );
	$any_dev = $any_dev || Relations::effective_developer( $id ) || Relations::project_of( $id );
}
ksort( $got );
eq( $got, $expected_refs, 'all 11 references match the deterministic map' );
ok( ! $any_dev, 'no migrated listing has a developer or project (no Project → Property link is claimed)' );
ok( (int) get_option( References::OPTION_NEXT ) > 1013, 'counter stays above every assigned reference' );
$s964 = migrated( Schema::PROPERTY, 30964 );
$s082 = migrated( Schema::PROPERTY, 31082 );
ok( in_array( 'invalid_legacy_coordinates', Quality::all( $s964 ), true ) && '' === (string) get_post_meta( $s964, 'aa_lat', true ), '30964: demo coordinates flagged, not stored' );
ok( in_array( 'duplicate_gallery', Quality::all( $s082 ), true ) && in_array( 'duplicate_gallery', Quality::all( $s964 ), true ), '30964/31082 shared gallery flagged on both' );
ok( in_array( 'field_description_mismatch', Quality::all( migrated( Schema::PROPERTY, 31083 ) ), true ), '31083 flagged field_description_mismatch' );
eq( Relations::effective_developer( migrated( Schema::PROPERTY, 31495 ) ), 0, '31495 agency "Al Aliah…" sets no developer' );
eq( path_names( $s082 ), array( 'UAE', 'Abu Dhabi', 'Al Reef Downtown' ), '31082 location UAE › Abu Dhabi › Al Reef Downtown' );
eq( count( get_terms( array( 'taxonomy' => Schema::TAX_AMENITY, 'hide_empty' => false ) ) ), 0, 'amenities not migrated (map not approved)' );
$reem_term = get_term_by( 'slug', 'al-reem-island', Schema::TAX_LOCATION );
$reem_area = (int) get_term_meta( $reem_term->term_id, 'aa_area_post_id', true );
eq( get_post_type( $reem_area ), Schema::AREA, 'Al Reem Island location term linked to its draft area post' );

$state = db_state();
$r     = cli( "alaliah migrate run --set=full --execute --report={$tmp}/run-full-again" );
$rep   = json_decode( (string) file_get_contents( "{$tmp}/run-full-again/report.json" ), true );
$acts  = array_count_values( array_column( $rep['results'], 'action' ) );
ok( empty( $acts['create'] ) && empty( $acts['update'] ), 'full rerun creates and updates nothing', wp_json_encode( $acts ) );
$after = db_state();
unset( $state['options'], $after['options'] );
eq( $after, $state, 'full rerun leaves the database identical' );

// Data Quality screen renders.
wp_set_current_user( $admin->ID );
ob_start();
DataQuality::render();
$html = ob_get_clean();
ok( false !== strpos( $html, 'Data Quality' ) && false !== strpos( $html, 'Missing coordinates' ), 'Data Quality screen renders with flags' );
ok( false === strpos( $html, 'example.invalid' ), 'Data Quality screen shows no contact values' );

// ------------------------------------------------------------------ 13. Legacy untouched

t_section( '13. Legacy data untouched' );
$r = cli( "alaliah migrate verify-legacy --baseline={$baseline_file}" );
ok( 0 === $r->return_code, 'legacy fingerprint equals the baseline taken before any write', $r->stderr );
eq( legacy_counts(), $baseline_legacy, 'legacy post, attachment and page counts unchanged' );
eq( get_post_status( 31013 ), 'publish', 'legacy 31013 still published' );
eq( get_post_type( 32034 ), 'estate_developer', 'legacy Azizi record still an estate_developer' );
eq( get_the_title( 32034 ), 'Azizi Developements', 'legacy Azizi title not rewritten' );

// ------------------------------------------------------------------ summary

$t = $GLOBALS['aa_t'];
echo "\n" . str_repeat( '-', 60 ) . "\n{$t['pass']} passed, {$t['fail']} failed\n";
foreach ( $t['failures'] as $f ) {
	echo "  - {$f}\n";
}
exec( 'rm -rf ' . escapeshellarg( $tmp ) );
exit( $t['fail'] ? 1 : 0 );
