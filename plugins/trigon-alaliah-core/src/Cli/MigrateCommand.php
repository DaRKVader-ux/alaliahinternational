<?php
namespace Trigon\AlaliahCore\Cli;

use Trigon\AlaliahCore\Domain\References;
use Trigon\AlaliahCore\Migration\Planner;
use Trigon\AlaliahCore\Migration\Executor;
use Trigon\AlaliahCore\Migration\Fingerprint;
use Trigon\AlaliahCore\Migration\Report;
use Trigon\AlaliahCore\Schema;

defined( 'ABSPATH' ) || exit;

/**
 * WPResidence → Trigon migration. Dry run by default; writes only with --execute.
 */
final class MigrateCommand {

	private const LOCK = 'aa_migration_lock';

	/**
	 * Dry run: plan every phase and write the report. Writes nothing to the database.
	 *
	 * [--set=<set>]
	 * : t1t2, p1 or full.
	 * ---
	 * default: full
	 * ---
	 *
	 * [--ids=<ids>]
	 * : Comma-separated legacy IDs to limit the set.
	 *
	 * [--report=<dir>]
	 * : Report directory, or - for stdout.
	 *
	 * [--expect-home=<url>]
	 * : Abort unless home_url() equals this.
	 */
	public function plan( array $args, array $assoc ): void {
		$this->go( $assoc, false );
	}

	/**
	 * Execute a plan. Without --execute this is the same as `plan`.
	 *
	 * [--set=<set>]
	 * : t1t2, p1 or full.
	 * ---
	 * default: full
	 * ---
	 *
	 * [--ids=<ids>]
	 * : Comma-separated legacy IDs to limit the set.
	 *
	 * [--execute]
	 * : Write. Required to change anything.
	 *
	 * [--report=<dir>]
	 * : Report directory, or - for stdout.
	 *
	 * [--expect-home=<url>]
	 * : Abort unless home_url() equals this.
	 */
	public function run( array $args, array $assoc ): void {
		$this->go( $assoc, isset( $assoc['execute'] ) );
	}

	/**
	 * Show migrated records against legacy records.
	 */
	public function status(): void {
		foreach ( array( Schema::DEVELOPER, Schema::PROJECT, Schema::PROPERTY, Schema::AGENT, Schema::AREA ) as $type ) {
			$n = count( get_posts( array( 'post_type' => $type, 'post_status' => 'any', 'posts_per_page' => -1, 'fields' => 'ids', 'meta_key' => Schema::AREA === $type ? 'aa_legacy_term_id' : 'aa_legacy_post_id' ) ) );
			\WP_CLI::log( str_pad( $type, 20 ) . $n . ' migrated' );
		}
		$terms = get_terms( array( 'taxonomy' => Schema::TAX_LOCATION, 'hide_empty' => false, 'fields' => 'ids' ) );
		\WP_CLI::log( str_pad( Schema::TAX_LOCATION, 20 ) . ( is_array( $terms ) ? count( $terms ) : 0 ) . ' terms' );
	}

	/**
	 * Fingerprint legacy data; write a baseline, or compare with one.
	 *
	 * --baseline=<file>
	 * : Baseline file. Created if it does not exist; compared if it does.
	 *
	 * @subcommand verify-legacy
	 */
	public function verify_legacy( array $args, array $assoc ): void {
		$file = (string) $assoc['baseline'];
		$now  = Fingerprint::compute();
		if ( ! file_exists( $file ) ) {
			file_put_contents( $file, wp_json_encode( $now, JSON_PRETTY_PRINT ) ); // phpcs:ignore WordPress.WP.AlternativeFunctions
			\WP_CLI::success( "Baseline written to {$file}." );
			return;
		}
		$base = json_decode( (string) file_get_contents( $file ), true ); // phpcs:ignore WordPress.WP.AlternativeFunctions
		$cmp  = Fingerprint::compare( $base, $now );
		if ( $cmp['same'] ) {
			\WP_CLI::success( 'Legacy data unchanged since ' . $base['created'] . '.' );
			return;
		}
		\WP_CLI::error( 'Legacy data differs: ' . implode( ', ', array_keys( $cmp['differences'] ) ) );
	}

	private function go( array $assoc, bool $execute ): void {
		if ( ! empty( $assoc['expect-home'] ) && untrailingslashit( (string) $assoc['expect-home'] ) !== untrailingslashit( home_url() ) ) {
			\WP_CLI::error( 'home_url() is ' . home_url() . ', not ' . $assoc['expect-home'] . '. Aborting.' );
		}
		$set    = (string) ( $assoc['set'] ?? 'full' );
		$ids    = isset( $assoc['ids'] ) ? array_map( 'intval', explode( ',', (string) $assoc['ids'] ) ) : null;
		$run_id = gmdate( 'Ymd-His' ) . '-' . $set . ( $execute ? '-run' : '-plan' );
		$dir    = (string) ( $assoc['report'] ?? Report::default_dir( $run_id ) );

		if ( $execute ) {
			if ( ! add_option( self::LOCK, $run_id, '', false ) ) {
				\WP_CLI::error( 'Another migration run holds the lock (' . get_option( self::LOCK ) . ').' );
			}
		}

		$report = array( 'run_id' => $run_id, 'mode' => $execute ? 'execute' : 'plan', 'error' => null );
		try {
			$plan            = ( new Planner() )->plan( $set, $ids );
			$report['plan']  = $plan;
			$before          = Fingerprint::compute();
			$executor        = new Executor( $run_id, $execute );
			try {
				$report['results'] = $executor->run( $plan );
			} catch ( \Throwable $e ) {
				$report['results'] = array();
				$report['error']   = $e->getMessage();
			}
			if ( $execute && ! $report['error'] ) {
				$max = $executor->max_reference( $report['results'] );
				if ( $max > References::RESERVED_TO ) {
					References::ensure_next_above( $max );
				}
			}
			$report['legacy_check'] = Fingerprint::compare( $before, Fingerprint::compute() );
		} finally {
			if ( $execute ) {
				delete_option( self::LOCK );
			}
		}

		$written = Report::write( $report, $dir );
		if ( isset( $written['stdout'] ) ) {
			\WP_CLI::log( $written['stdout'] );
		} else {
			\WP_CLI::log( Report::summary( $report ) );
			\WP_CLI::log( 'Report: ' . implode( ', ', $written ) );
		}
		if ( $report['error'] ) {
			\WP_CLI::error( 'Run stopped: ' . $report['error'] );
		}
		if ( ! $report['legacy_check']['same'] ) {
			\WP_CLI::error( 'Legacy data changed during the run. Investigate before continuing.' );
		}
		\WP_CLI::success( ( $execute ? 'Executed' : 'Dry run complete; nothing written to the database' ) . '.' );
	}
}
