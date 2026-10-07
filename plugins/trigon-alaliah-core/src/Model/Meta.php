<?php
namespace Trigon\AlaliahCore\Model;

use Trigon\AlaliahCore\Schema;

defined( 'ABSPATH' ) || exit;

/**
 * Registered meta. All aa_* keys are protected (hidden from the generic Custom Fields box)
 * and not exposed through core REST meta; REST output uses public names (Rest\Fields).
 */
final class Meta {

	public static function register(): void {
		foreach ( Schema::fields() as $key => $def ) {
			if ( 0 === strpos( $key, 'tax:' ) || empty( $def['store'] ) ) {
				continue;
			}
			foreach ( $def['objects'] as $post_type ) {
				$args = array(
					'type'          => $def['store'],
					'single'        => true,
					'show_in_rest'  => false,
					'auth_callback' => static function ( $allowed, $meta_key, $object_id ) use ( $def ) {
						if ( in_array( $def['input'], array( 'system', 'readonly' ), true ) ) {
							return false;
						}
						return current_user_can( 'edit_post', $object_id );
					},
				);
				if ( 'boolean' === $def['store'] ) {
					$args['default'] = false;
				}
				register_post_meta( $post_type, $key, $args );
			}
		}

		$term_meta = array(
			'aa_level'           => 'string',
			'aa_area_post_id'    => 'integer',
			'aa_legacy_term_id'  => 'integer',
			'aa_legacy_slug'     => 'string',
			'aa_migration_audit' => 'object',
		);
		foreach ( $term_meta as $key => $type ) {
			register_term_meta( Schema::TAX_LOCATION, $key, array( 'type' => $type, 'single' => true, 'show_in_rest' => false ) );
		}
		register_term_meta( Schema::TAX_AMENITY, 'aa_legacy_term_id', array( 'type' => 'integer', 'single' => true, 'show_in_rest' => false ) );
		foreach ( array( Schema::TAX_REL_DEV, Schema::TAX_REL_PROJ ) as $tax ) {
			register_term_meta( $tax, 'aa_target_post_id', array( 'type' => 'integer', 'single' => true, 'show_in_rest' => false ) );
		}

		add_filter(
			'is_protected_meta',
			static fn( bool $protected, string $key ): bool => ( 0 === strpos( $key, 'aa_' ) ) ? true : $protected,
			10,
			2
		);
	}

	public const LEVELS = array( 'country', 'emirate', 'community', 'subcommunity', 'building' );
}
