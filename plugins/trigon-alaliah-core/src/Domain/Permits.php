<?php
namespace Trigon\AlaliahCore\Domain;

use Trigon\AlaliahCore\Schema;

defined( 'ABSPATH' ) || exit;

/**
 * Advertising permits as extensible entries: {number, authority, system, status, public,
 * source, verified_on, origin}. Only verified + public entries are ever output publicly.
 * aa_madhmoun_permit is a legacy-compatible field: kept, mirrored from a verified Madhmoun
 * entry, never displayed.
 */
final class Permits {

	public const STATUSES = array( 'unverified' => 'Unverified', 'verified' => 'Verified' );

	public static function sanitize( $value ): ?array {
		$rows    = is_array( $value ) ? $value : array();
		$systems = Schema::permit_systems();
		$out     = array();
		foreach ( $rows as $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}
			$number = trim( wp_strip_all_tags( (string) ( $row['number'] ?? '' ) ) );
			if ( '' === $number ) {
				continue; // A permit without a number is not stored; numbers are never generated.
			}
			$system   = (string) ( $row['system'] ?? 'unspecified' );
			$status   = (string) ( $row['status'] ?? 'unverified' );
			$status   = array_key_exists( $status, self::STATUSES ) ? $status : 'unverified';
			$verified = 'verified' === $status;
			$entry    = array(
				'number'      => $number,
				'authority'   => sanitize_text_field( (string) ( $row['authority'] ?? '' ) ),
				'system'      => array_key_exists( $system, $systems ) ? $system : 'unspecified',
				'status'      => $status,
				// Public display requires verification.
				'public'      => $verified && ! empty( $row['public'] ),
				'source'      => sanitize_text_field( (string) ( $row['source'] ?? '' ) ),
				'verified_on' => ( $verified && preg_match( '/^\d{4}-\d{2}-\d{2}$/', (string) ( $row['verified_on'] ?? '' ) ) ) ? $row['verified_on'] : '',
				'origin'      => sanitize_text_field( (string) ( $row['origin'] ?? 'admin' ) ),
			);
			$out[] = $entry;
		}
		return $out ? $out : null;
	}

	public static function all( int $post_id ): array {
		$v = get_post_meta( $post_id, 'aa_permits', true );
		return is_array( $v ) ? $v : array();
	}

	/** Entries that may be shown publicly. */
	public static function public_entries( int $post_id ): array {
		return array_values(
			array_map(
				static fn( $e ) => array(
					'number'    => $e['number'],
					'authority' => $e['authority'] ?? '',
					'system'    => $e['system'] ?? '',
				),
				array_filter( self::all( $post_id ), static fn( $e ) => 'verified' === ( $e['status'] ?? '' ) && ! empty( $e['public'] ) )
			)
		);
	}

	public static function has_unverified( int $post_id ): bool {
		foreach ( self::all( $post_id ) as $e ) {
			if ( 'verified' !== ( $e['status'] ?? '' ) ) {
				return true;
			}
		}
		return false;
	}

	/** Mirror a verified Madhmoun entry into the legacy-compatible field. */
	public static function mirror_legacy( int $post_id ): void {
		foreach ( self::all( $post_id ) as $e ) {
			if ( 'madhmoun' === ( $e['system'] ?? '' ) && 'verified' === ( $e['status'] ?? '' ) ) {
				if ( get_post_meta( $post_id, 'aa_madhmoun_permit', true ) !== $e['number'] ) {
					update_post_meta( $post_id, 'aa_madhmoun_permit', $e['number'] );
				}
				return;
			}
		}
	}
}
