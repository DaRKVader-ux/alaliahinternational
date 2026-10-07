<?php
namespace Trigon\AlaliahCore\Model;

use Trigon\AlaliahCore\Schema;

defined( 'ABSPATH' ) || exit;

/**
 * Taxonomies have no public archive URLs (type/, area/ and category already exist on the
 * site). Public landing URLs are routed separately and map to these internally.
 */
final class Taxonomies {

	public static function definitions(): array {
		$pp = array( Schema::PROPERTY, Schema::PROJECT );
		return array(
			Schema::TAX_LOCATION   => array( 'Locations', 'Location', array( Schema::PROPERTY, Schema::PROJECT, Schema::AGENT ), true ),
			Schema::TAX_PURPOSE    => array( 'Purposes', 'Purpose', array( Schema::PROPERTY ), false ),
			Schema::TAX_COMPLETION => array( 'Completion', 'Completion', $pp, false ),
			Schema::TAX_STATUS     => array( 'Statuses', 'Status', array( Schema::PROPERTY ), false ),
			Schema::TAX_CATEGORY   => array( 'Categories', 'Category', array( Schema::PROPERTY ), false ),
			Schema::TAX_TYPE       => array( 'Property types', 'Property type', array( Schema::PROPERTY ), false ),
			Schema::TAX_AMENITY    => array( 'Amenities', 'Amenity', $pp, true ),
		);
	}

	public static function shadow(): array {
		return array(
			Schema::TAX_REL_DEV  => array( 'Developer index', array( Schema::PROPERTY, Schema::PROJECT ) ),
			Schema::TAX_REL_PROJ => array( 'Project index', array( Schema::PROPERTY ) ),
		);
	}

	public static function register(): void {
		foreach ( self::definitions() as $key => list( $plural, $singular, $objects, $hier ) ) {
			if ( taxonomy_exists( $key ) ) {
				continue;
			}
			register_taxonomy(
				$key,
				$objects,
				array(
					'labels'             => array( 'name' => $plural, 'singular_name' => $singular, 'menu_name' => $plural ),
					'hierarchical'       => $hier,
					'public'             => false,
					'publicly_queryable' => false,
					'rewrite'            => false,
					'query_var'          => false,
					'show_ui'            => true,
					'show_in_menu'       => true,
					'show_in_nav_menus'  => false,
					'show_tagcloud'      => false,
					'show_in_quick_edit' => false,
					'show_in_rest'       => true,
					'show_admin_column'  => in_array( $key, array( Schema::TAX_PURPOSE, Schema::TAX_STATUS, Schema::TAX_TYPE, Schema::TAX_LOCATION ), true ),
					// The edit screens render their own controls.
					'meta_box_cb'        => false,
				)
			);
		}

		// Derived index taxonomies: written only by Relations::sync(); never editable.
		$deny = array(
			'manage_terms' => 'do_not_allow',
			'edit_terms'   => 'do_not_allow',
			'delete_terms' => 'do_not_allow',
			'assign_terms' => 'do_not_allow',
		);
		foreach ( self::shadow() as $key => list( $label, $objects ) ) {
			if ( taxonomy_exists( $key ) ) {
				continue;
			}
			register_taxonomy(
				$key,
				$objects,
				array(
					'labels'             => array( 'name' => $label ),
					'public'             => false,
					'publicly_queryable' => false,
					'rewrite'            => false,
					'query_var'          => false,
					'show_ui'            => false,
					'show_in_menu'       => false,
					'show_in_nav_menus'  => false,
					'show_in_quick_edit' => false,
					'show_in_rest'       => false,
					'show_admin_column'  => false,
					'meta_box_cb'        => false,
					'capabilities'       => $deny,
				)
			);
		}
	}
}
