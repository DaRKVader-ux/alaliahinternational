<?php
namespace Trigon\AlaliahCore\Migration;

defined( 'ABSPATH' ) || exit;

/**
 * Fingerprint of everything the migration must never change: WPResidence posts and their
 * meta, legacy taxonomies and term relationships, WPResidence term options, and all
 * attachments (rows, parents and meta). Identical before/after = legacy untouched.
 *
 * Protected sections fail the integrity check on any difference. The `volatile_meta`
 * section tracks only the four legacy meta keys that front-end page views rewrite
 * (approved 2026-10-07, D-037). Its changes are reported but never fail the check.
 * Every other legacy meta key stays protected.
 */
final class Fingerprint {

	public const LEGACY_TYPES = array( 'estate_property', 'estate_developer', 'estate_agent', 'estate_review', 'membership_package' );

	/** Exactly these keys, and no others, are tracked as volatile. */
	public const VOLATILE_META = array( '_elementor_page_assets', '_eael_post_view_count', 'wpestate_total_views', 'wpestate_detailed_views' );

	public const VOLATILE_SECTIONS = array( 'volatile_meta' );

	public static function legacy_taxonomies(): array {
		global $wpdb;
		$all = $wpdb->get_col( "SELECT DISTINCT taxonomy FROM {$wpdb->term_taxonomy}" );
		return array_values( array_filter( $all, static fn( $t ) => 0 !== strpos( (string) $t, 'alaliah_' ) ) );
	}

	public static function compute(): array {
		global $wpdb;
		$types = "'" . implode( "','", self::LEGACY_TYPES ) . "'";
		$sections = array();

		$sections['legacy_posts'] = $wpdb->get_results( "SELECT ID, post_type, post_status, post_name, post_modified_gmt, post_parent, post_title, post_content FROM {$wpdb->posts} WHERE post_type IN ({$types}) ORDER BY ID", ARRAY_N );
		$volatile = "'" . implode( "','", self::VOLATILE_META ) . "'";
		$sections['legacy_meta']   = $wpdb->get_results( "SELECT pm.meta_id, pm.post_id, pm.meta_key, pm.meta_value FROM {$wpdb->postmeta} pm JOIN {$wpdb->posts} p ON p.ID = pm.post_id WHERE p.post_type IN ({$types}) AND pm.meta_key NOT IN ({$volatile}) ORDER BY pm.meta_id", ARRAY_N );
		$sections['volatile_meta'] = $wpdb->get_results( "SELECT pm.meta_id, pm.post_id, pm.meta_key, pm.meta_value FROM {$wpdb->postmeta} pm JOIN {$wpdb->posts} p ON p.ID = pm.post_id WHERE p.post_type IN ({$types}) AND pm.meta_key IN ({$volatile}) ORDER BY pm.meta_id", ARRAY_N );
		$sections['attachments']  = $wpdb->get_results( "SELECT ID, post_parent, post_modified_gmt, post_name, guid, post_mime_type FROM {$wpdb->posts} WHERE post_type = 'attachment' ORDER BY ID", ARRAY_N );
		$sections['attachment_meta'] = $wpdb->get_results( "SELECT pm.meta_id, pm.post_id, pm.meta_key, pm.meta_value FROM {$wpdb->postmeta} pm JOIN {$wpdb->posts} p ON p.ID = pm.post_id WHERE p.post_type = 'attachment' ORDER BY pm.meta_id", ARRAY_N );

		$tax = self::legacy_taxonomies();
		$in  = $tax ? "'" . implode( "','", array_map( 'esc_sql', $tax ) ) . "'" : "''";
		$sections['legacy_terms'] = $wpdb->get_results( "SELECT tt.term_taxonomy_id, tt.term_id, tt.taxonomy, tt.parent, t.name, t.slug FROM {$wpdb->term_taxonomy} tt JOIN {$wpdb->terms} t ON t.term_id = tt.term_id WHERE tt.taxonomy IN ({$in}) ORDER BY tt.term_taxonomy_id", ARRAY_N );
		$sections['legacy_relationships'] = $wpdb->get_results( "SELECT tr.object_id, tr.term_taxonomy_id FROM {$wpdb->term_relationships} tr JOIN {$wpdb->term_taxonomy} tt ON tt.term_taxonomy_id = tr.term_taxonomy_id WHERE tt.taxonomy IN ({$in}) ORDER BY tr.object_id, tr.term_taxonomy_id", ARRAY_N );
		$opts = $wpdb->get_results( "SELECT option_name, option_value FROM {$wpdb->options} WHERE option_name LIKE 'taxonomy%' ORDER BY option_name", ARRAY_N );
		$sections['term_options'] = array_values( array_filter( $opts, static fn( $r ) => (bool) preg_match( '/^taxonomy_\d+$/', (string) $r[0] ) ) );

		$out = array( 'created' => gmdate( 'c' ), 'site' => home_url(), 'sections' => array() );
		foreach ( $sections as $name => $rows ) {
			$out['sections'][ $name ] = array( 'rows' => count( $rows ), 'hash' => md5( wp_json_encode( $rows ) ) );
		}
		return $out;
	}

	/**
	 * `same` and `differences` cover protected sections only. Volatile changes are listed
	 * in `volatile_changes` and never make `same` false.
	 *
	 * @return array{same: bool, differences: array, volatile_changes: array}
	 */
	public static function compare( array $before, array $after ): array {
		$diff     = array();
		$volatile = array();
		foreach ( $before['sections'] as $name => $b ) {
			$a = $after['sections'][ $name ] ?? null;
			if ( $a && $a['hash'] === $b['hash'] ) {
				continue;
			}
			if ( in_array( $name, self::VOLATILE_SECTIONS, true ) ) {
				$volatile[ $name ] = array( 'before' => $b, 'after' => $a );
			} else {
				$diff[ $name ] = array( 'before' => $b, 'after' => $a );
			}
		}
		return array( 'same' => ! $diff, 'differences' => $diff, 'volatile_changes' => $volatile );
	}
}
