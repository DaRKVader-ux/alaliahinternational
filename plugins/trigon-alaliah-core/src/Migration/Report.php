<?php
namespace Trigon\AlaliahCore\Migration;

defined( 'ABSPATH' ) || exit;

/**
 * Migration reports: JSON (full), CSV (one row per record) and a plain-text summary.
 * Written to a non-public directory inside the WordPress install, or to stdout.
 */
final class Report {

	public static function default_dir( string $run_id ): string {
		return WP_CONTENT_DIR . '/trigon-migration/' . $run_id;
	}

	public static function prepare_dir( string $dir ): void {
		if ( ! is_dir( $dir ) && ! wp_mkdir_p( $dir ) ) {
			throw new \RuntimeException( "Cannot create report directory {$dir}." );
		}
		$root = dirname( $dir );
		foreach ( array( $root, $dir ) as $d ) {
			if ( ! file_exists( $d . '/.htaccess' ) ) {
				file_put_contents( $d . '/.htaccess', "Require all denied\nDeny from all\n" ); // phpcs:ignore WordPress.WP.AlternativeFunctions
			}
			if ( ! file_exists( $d . '/index.php' ) ) {
				file_put_contents( $d . '/index.php', "<?php\n// Silence is golden.\n" ); // phpcs:ignore WordPress.WP.AlternativeFunctions
			}
		}
	}

	public static function summary( array $report ): string {
		$lines   = array();
		$lines[] = 'Al Aliah migration ' . strtoupper( $report['mode'] ) . ' · run ' . $report['run_id'];
		$lines[] = 'Set: ' . $report['plan']['set'] . ' (' . $report['plan']['set_label'] . ')';
		$lines[] = 'Site: ' . $report['plan']['site'];
		$lines[] = '';
		$counts = array();
		foreach ( $report['results'] as $r ) {
			$counts[ $r['entity'] ][ $r['action'] ] = ( $counts[ $r['entity'] ][ $r['action'] ] ?? 0 ) + 1;
		}
		foreach ( $counts as $entity => $actions ) {
			$parts = array();
			foreach ( $actions as $a => $n ) {
				$parts[] = "{$a} {$n}";
			}
			$lines[] = str_pad( $entity, 10 ) . implode( ', ', $parts );
		}
		$lines[] = '';
		foreach ( $report['results'] as $r ) {
			$line = sprintf( '%-9s %-12s %-6s %-10s %s', $r['entity'], $r['action'], (string) $r['legacy_id'], (string) ( $r['reference'] ?? '' ), $r['title'] );
			if ( ! empty( $r['flags'] ) ) {
				$line .= '  [' . implode( ', ', $r['flags'] ) . ']';
			}
			$lines[] = $line;
		}
		$lines[] = '';
		$lines[] = 'Amenities: ' . $report['plan']['amenities']['note'];
		if ( $report['plan']['warnings'] ) {
			$lines[] = 'Warnings:';
			foreach ( $report['plan']['warnings'] as $w ) {
				$lines[] = '  - ' . $w;
			}
		}
		if ( isset( $report['legacy_check'] ) ) {
			$lines[] = 'Legacy data unchanged: ' . ( $report['legacy_check']['same'] ? 'YES' : 'NO: ' . implode( ', ', array_keys( $report['legacy_check']['differences'] ) ) );
		}
		if ( ! empty( $report['error'] ) ) {
			$lines[] = 'ERROR: ' . $report['error'];
		}
		return implode( "\n", $lines ) . "\n";
	}

	public static function csv( array $report ): string {
		$fh = fopen( 'php://temp', 'w+' ); // phpcs:ignore WordPress.WP.AlternativeFunctions
		fputcsv( $fh, array( 'entity', 'action', 'legacy_id', 'new_id', 'reference', 'title', 'flags' ) );
		foreach ( $report['results'] as $r ) {
			fputcsv( $fh, array( $r['entity'], $r['action'], $r['legacy_id'], $r['new_id'] ?? '', $r['reference'] ?? '', $r['title'], implode( ' ', $r['flags'] ?? array() ) ) );
		}
		rewind( $fh );
		$csv = stream_get_contents( $fh );
		fclose( $fh ); // phpcs:ignore WordPress.WP.AlternativeFunctions
		return (string) $csv;
	}

	/** Strip private values from the plan copy stored in the report. */
	public static function redact( array $plan ): array {
		foreach ( $plan['items'] as &$item ) {
			foreach ( $item['private'] ?? array() as $k ) {
				if ( isset( $item['meta'][ $k ] ) ) {
					$item['meta'][ $k ] = '[set]';
				}
			}
		}
		return $plan;
	}

	public static function write( array $report, string $dir ): array {
		$report['plan'] = self::redact( $report['plan'] );
		if ( '-' === $dir ) {
			return array( 'stdout' => self::summary( $report ) );
		}
		self::prepare_dir( $dir );
		$files = array(
			'report.json' => wp_json_encode( $report, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ),
			'report.csv'  => self::csv( $report ),
			'summary.txt' => self::summary( $report ),
		);
		foreach ( $files as $name => $body ) {
			file_put_contents( $dir . '/' . $name, $body ); // phpcs:ignore WordPress.WP.AlternativeFunctions
		}
		return array_map( static fn( $n ) => $dir . '/' . $n, array_keys( $files ) );
	}
}
