<?php
/**
 * TEST ONLY. Installed as a must-use plugin on the local test site to stand in for the
 * WPResidence registrations that exist on staging. Never deployed.
 */

add_action(
	'init',
	static function () {
		foreach ( array( 'estate_property' => 'properties', 'estate_developer' => 'estate_developer', 'estate_agent' => 'agents', 'estate_review' => 'reviews' ) as $type => $slug ) {
			register_post_type( $type, array( 'public' => true, 'label' => $type, 'rewrite' => array( 'slug' => $slug ) ) );
		}
		foreach ( array( 'property_category' => 'listings', 'property_action_category' => 'action', 'property_city' => 'city', 'property_area' => 'area', 'property_county_state' => 'state', 'property_features' => 'property_features', 'property_status' => 'property_status' ) as $tax => $slug ) {
			register_taxonomy( $tax, 'estate_property', array( 'hierarchical' => true, 'public' => true, 'rewrite' => array( 'slug' => $slug ) ) );
		}
	},
	1
);
