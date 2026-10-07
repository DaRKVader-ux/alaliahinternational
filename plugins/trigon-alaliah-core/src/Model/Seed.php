<?php
namespace Trigon\AlaliahCore\Model;

use Trigon\AlaliahCore\Schema;

defined( 'ABSPATH' ) || exit;

/**
 * Fixed vocabulary terms. Run explicitly (`wp alaliah setup`), never on activation.
 * Amenity terms are created only from the approved amenity map, not here.
 */
final class Seed {

	public static function terms(): array {
		return array(
			Schema::TAX_PURPOSE    => array( 'sale' => 'Sale', 'rent' => 'Rent' ),
			Schema::TAX_COMPLETION => array( 'ready' => 'Ready', 'off-plan' => 'Off-plan' ),
			Schema::TAX_STATUS     => array( 'available' => 'Available', 'under-offer' => 'Under offer', 'rented' => 'Rented', 'sold' => 'Sold', 'withdrawn' => 'Withdrawn' ),
			Schema::TAX_CATEGORY   => array( 'residential' => 'Residential', 'commercial' => 'Commercial' ),
			Schema::TAX_TYPE       => array(
				'apartment' => 'Apartment',
				'villa'     => 'Villa',
				'townhouse' => 'Townhouse',
				'penthouse' => 'Penthouse',
				'duplex'    => 'Duplex',
				'office'    => 'Office',
				'retail'    => 'Retail',
				'warehouse' => 'Warehouse',
				'land'      => 'Land',
			),
		);
	}

	/** @return array{created: int, existing: int} */
	public static function run(): array {
		$created  = 0;
		$existing = 0;
		foreach ( self::terms() as $taxonomy => $terms ) {
			foreach ( $terms as $slug => $name ) {
				if ( get_term_by( 'slug', $slug, $taxonomy ) ) {
					++$existing;
					continue;
				}
				$r = wp_insert_term( $name, $taxonomy, array( 'slug' => $slug ) );
				if ( is_wp_error( $r ) ) {
					throw new \RuntimeException( "{$taxonomy}/{$slug}: " . $r->get_error_message() );
				}
				++$created;
			}
		}
		return array( 'created' => $created, 'existing' => $existing );
	}
}
