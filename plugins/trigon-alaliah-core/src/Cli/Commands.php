<?php
namespace Trigon\AlaliahCore\Cli;

use Trigon\AlaliahCore\Model\Seed;
use Trigon\AlaliahCore\Domain\References;
use Trigon\AlaliahCore\Domain\Relations;
use Trigon\AlaliahCore\Domain\Quality;
use Trigon\AlaliahCore\Schema;

defined( 'ABSPATH' ) || exit;

/**
 * Al Aliah data tools.
 *
 * ## EXAMPLES
 *
 *     wp alaliah setup
 *     wp alaliah migrate plan --set=full
 *     wp alaliah migrate run --set=t1t2 --execute
 *     wp alaliah migrate verify-legacy --baseline=/path/baseline.json
 *     wp alaliah relations rebuild --verify
 */
final class Commands {

	public static function register(): void {
		\WP_CLI::add_command( 'alaliah setup', array( self::class, 'setup' ) );
		\WP_CLI::add_command( 'alaliah migrate', MigrateCommand::class );
		\WP_CLI::add_command( 'alaliah relations rebuild', array( self::class, 'relations_rebuild' ) );
		\WP_CLI::add_command( 'alaliah quality scan', array( self::class, 'quality_scan' ) );
	}

	/**
	 * Seed the fixed terms and reserve the migrated reference range. Idempotent.
	 */
	public static function setup(): void {
		$seeded = Seed::run();
		$refs   = References::setup();
		\WP_CLI::log( 'Terms created: ' . $seeded['created'] . ', already present: ' . $seeded['existing'] );
		\WP_CLI::log( 'References reserved: AA-' . $refs['reserved']['from'] . ' to AA-' . $refs['reserved']['to'] . '; next hand-created: AA-' . $refs['next'] );
		\WP_CLI::success( 'Setup complete.' );
	}

	/**
	 * Recompute relationship index terms from the canonical relationship fields.
	 *
	 * [--verify]
	 * : Report drift without writing.
	 */
	public static function relations_rebuild( array $args, array $assoc ): void {
		$verify = isset( $assoc['verify'] );
		$drift  = Relations::rebuild( ! $verify );
		foreach ( $drift as $d ) {
			\WP_CLI::log( sprintf( 'post %d %s expected [%s] found [%s]', $d['post'], $d['taxonomy'], implode( ',', $d['expected'] ), implode( ',', $d['found'] ) ) );
		}
		\WP_CLI::success( count( $drift ) . ' record(s) out of sync' . ( $verify ? ' (verify only).' : '; rebuilt from canonical relationships.' ) );
	}

	/**
	 * Recompute data-quality flags for all properties, projects and developers.
	 */
	public static function quality_scan(): void {
		$n = 0;
		foreach ( get_posts( array( 'post_type' => array( Schema::PROPERTY, Schema::PROJECT, Schema::DEVELOPER ), 'post_status' => 'any', 'posts_per_page' => -1, 'fields' => 'ids' ) ) as $id ) {
			Quality::store( (int) $id );
			++$n;
		}
		\WP_CLI::success( "Flags recomputed for {$n} records." );
	}
}
