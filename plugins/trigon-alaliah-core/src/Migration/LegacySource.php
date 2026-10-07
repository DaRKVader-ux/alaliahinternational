<?php
namespace Trigon\AlaliahCore\Migration;

defined( 'ABSPATH' ) || exit;

/**
 * Read-only access to WPResidence data through SQL, so it works whether or not WPResidence
 * is active. Nothing in this class writes.
 */
final class LegacySource {

	public const PROPERTY  = 'estate_property';
	public const DEVELOPER = 'estate_developer';
	public const AGENT     = 'estate_agent';

	/** @return object[] posts of a type, published only, ordered by date then ID. */
	public function posts( string $type, ?array $ids = null ): array {
		global $wpdb;
		$sql = $wpdb->prepare( "SELECT * FROM {$wpdb->posts} WHERE post_type = %s AND post_status = 'publish'", $type );
		if ( null !== $ids ) {
			if ( ! $ids ) {
				return array();
			}
			$sql .= ' AND ID IN (' . implode( ',', array_map( 'intval', $ids ) ) . ')';
		}
		return $wpdb->get_results( $sql . ' ORDER BY post_date ASC, ID ASC' ); // phpcs:ignore WordPress.DB.PreparedSQL -- IDs cast to int.
	}

	public function meta( int $post_id, string $key ): string {
		global $wpdb;
		$v = $wpdb->get_var( $wpdb->prepare( "SELECT meta_value FROM {$wpdb->postmeta} WHERE post_id = %d AND meta_key = %s ORDER BY meta_id ASC LIMIT 1", $post_id, $key ) );
		return null === $v ? '' : (string) $v;
	}

	public function has_meta( int $post_id, string $key ): bool {
		global $wpdb;
		return (bool) $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM {$wpdb->postmeta} WHERE post_id = %d AND meta_key = %s", $post_id, $key ) );
	}

	/** @return object[] terms {term_id, name, slug, taxonomy, parent} attached to a post. */
	public function terms( int $post_id, string $taxonomy ): array {
		global $wpdb;
		return $wpdb->get_results(
			$wpdb->prepare(
				"SELECT t.term_id, t.name, t.slug, tt.taxonomy, tt.parent FROM {$wpdb->term_relationships} tr
				 JOIN {$wpdb->term_taxonomy} tt ON tt.term_taxonomy_id = tr.term_taxonomy_id
				 JOIN {$wpdb->terms} t ON t.term_id = tt.term_id
				 WHERE tr.object_id = %d AND tt.taxonomy = %s ORDER BY t.term_id",
				$post_id,
				$taxonomy
			)
		);
	}

	/** @return object[] every term of a taxonomy. */
	public function all_terms( string $taxonomy ): array {
		global $wpdb;
		return $wpdb->get_results(
			$wpdb->prepare(
				"SELECT t.term_id, t.name, t.slug, tt.parent, tt.count FROM {$wpdb->term_taxonomy} tt
				 JOIN {$wpdb->terms} t ON t.term_id = tt.term_id WHERE tt.taxonomy = %s ORDER BY t.term_id",
				$taxonomy
			)
		);
	}

	/** WPResidence stores term extras (incl. the area's cityparent) in option taxonomy_{term_id}. */
	public function term_option( int $term_id ): array {
		global $wpdb;
		$v = $wpdb->get_var( $wpdb->prepare( "SELECT option_value FROM {$wpdb->options} WHERE option_name = %s", 'taxonomy_' . $term_id ) );
		$v = null === $v ? array() : maybe_unserialize( $v );
		return is_array( $v ) ? $v : array();
	}

	/** Gallery attachment IDs in legacy order. */
	public function gallery( int $post_id ): array {
		$raw = maybe_unserialize( $this->meta( $post_id, 'wpestate_property_gallery' ) );
		$ids = is_array( $raw ) ? $raw : array();
		return array_values( array_filter( array_map( 'intval', $ids ), static fn( $i ) => $i > 0 ) );
	}

	public function attachment_exists( int $id ): bool {
		global $wpdb;
		return $id > 0 && 'attachment' === $wpdb->get_var( $wpdb->prepare( "SELECT post_type FROM {$wpdb->posts} WHERE ID = %d", $id ) );
	}
}
