<?php
/**
 * Template-facing API for the theme (Stage 05). Presentation lives in the theme;
 * these functions only return normalised data.
 */

defined( 'ABSPATH' ) || exit;

/** Floor plans for display: [{id, url, alt, labels: {title?, level?, unit_type?, bedrooms?, area?, note?}}]. */
function aa_get_floor_plans( $post = null ): array {
	$post = get_post( $post );
	return $post ? \Trigon\AlaliahCore\Domain\FloorPlans::for_display( $post->ID ) : array();
}

/** Canonical property URL (/property/{slug}-aa-1001/). */
function aa_property_url( $post = null ): string {
	$post = get_post( $post );
	return $post ? \Trigon\AlaliahCore\Domain\PropertyUrls::permalink( $post->ID ) : '';
}

/** Display reference, e.g. AA-1001. */
function aa_property_reference( $post = null ): string {
	$post = get_post( $post );
	return $post ? \Trigon\AlaliahCore\Domain\References::get( $post->ID ) : '';
}

/** Permits that may be shown publicly (verified and public only). */
function aa_get_public_permits( $post = null ): array {
	$post = get_post( $post );
	return $post ? \Trigon\AlaliahCore\Domain\Permits::public_entries( $post->ID ) : array();
}

/** The developer a property or project has (via its project when set). */
function aa_get_developer_id( $post = null ): int {
	$post = get_post( $post );
	return $post ? \Trigon\AlaliahCore\Domain\Relations::effective_developer( $post->ID ) : 0;
}
