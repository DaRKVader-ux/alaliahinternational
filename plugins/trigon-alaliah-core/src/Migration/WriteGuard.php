<?php
namespace Trigon\AlaliahCore\Migration;

use Trigon\AlaliahCore\Schema;

defined( 'ABSPATH' ) || exit;

/**
 * While a migration executes, any write that is not to an alaliah_* post, an alaliah_*
 * taxonomy or aa_* meta on our own posts throws and aborts the run. Attachments are
 * read-only: their posts, meta and parents are never touched.
 *
 * Limit: WordPress has no pre-hook for term assignment, so a stray wp_set_object_terms()
 * is detected after it is written. The run still aborts, and the legacy fingerprint
 * comparison reports the change.
 */
final class WriteGuard {

	private static bool $active = false;

	public static function active(): bool {
		return self::$active;
	}

	public static function enable(): void {
		if ( self::$active ) {
			return;
		}
		self::$active = true;
		add_filter( 'wp_insert_post_data', array( self::class, 'post_data' ), 1, 2 );
		add_filter( 'wp_insert_attachment_data', array( self::class, 'attachment_data' ), 1, 2 );
		add_filter( 'add_post_metadata', array( self::class, 'meta' ), 1, 3 );
		add_filter( 'update_post_metadata', array( self::class, 'meta' ), 1, 3 );
		add_filter( 'delete_post_metadata', array( self::class, 'meta' ), 1, 3 );
		add_filter( 'pre_insert_term', array( self::class, 'insert_term' ), 1, 2 );
		add_action( 'edit_terms', array( self::class, 'edit_term' ), 1, 2 );
		add_filter( 'pre_delete_post', array( self::class, 'delete_post' ), 1, 2 );
		add_action( 'edit_attachment', array( self::class, 'attachment' ), 1 );
		add_action( 'set_object_terms', array( self::class, 'object_terms' ), 1, 4 );
		add_filter( 'wp_revisions_to_keep', '__return_zero', 99 );
	}

	public static function disable(): void {
		self::$active = false;
		remove_filter( 'wp_insert_post_data', array( self::class, 'post_data' ), 1 );
		remove_filter( 'wp_insert_attachment_data', array( self::class, 'attachment_data' ), 1 );
		remove_filter( 'add_post_metadata', array( self::class, 'meta' ), 1 );
		remove_filter( 'update_post_metadata', array( self::class, 'meta' ), 1 );
		remove_filter( 'delete_post_metadata', array( self::class, 'meta' ), 1 );
		remove_filter( 'pre_insert_term', array( self::class, 'insert_term' ), 1 );
		remove_action( 'edit_terms', array( self::class, 'edit_term' ), 1 );
		remove_filter( 'pre_delete_post', array( self::class, 'delete_post' ), 1 );
		remove_action( 'edit_attachment', array( self::class, 'attachment' ), 1 );
		remove_action( 'set_object_terms', array( self::class, 'object_terms' ), 1 );
		remove_filter( 'wp_revisions_to_keep', '__return_zero', 99 );
	}

	private static function fail( string $why ): void {
		throw new \RuntimeException( 'Write guard: ' . $why );
	}

	public static function post_data( array $data, array $postarr ): array {
		if ( ! Schema::is_own_type( (string) ( $data['post_type'] ?? '' ) ) ) {
			self::fail( 'refused write to post type "' . ( $data['post_type'] ?? '?' ) . '"' );
		}
		return $data;
	}

	/** Attachment inserts and updates bypass wp_insert_post_data; refuse them before the write. */
	public static function attachment_data( array $data, array $postarr ): array {
		self::fail( 'refused attachment write ' . ( $postarr['ID'] ?? 'new' ) );
		return $data;
	}

	public static function meta( $check, $object_id, $meta_key ) {
		$type = get_post_type( (int) $object_id );
		if ( ! Schema::is_own_type( (string) $type ) ) {
			self::fail( "refused meta write {$meta_key} on post {$object_id} ({$type})" );
		}
		if ( 0 !== strpos( (string) $meta_key, 'aa_' ) && '_thumbnail_id' !== $meta_key && '_edit_lock' !== $meta_key ) {
			self::fail( "refused non-aa meta key {$meta_key}" );
		}
		return $check;
	}

	public static function insert_term( $term, $taxonomy ) {
		if ( 0 !== strpos( (string) $taxonomy, 'alaliah_' ) ) {
			self::fail( "refused term insert in {$taxonomy}" );
		}
		return $term;
	}

	public static function edit_term( $term_id, $taxonomy ): void {
		if ( 0 !== strpos( (string) $taxonomy, 'alaliah_' ) ) {
			self::fail( "refused term edit in {$taxonomy}" );
		}
	}

	public static function delete_post( $delete, $post ) {
		self::fail( 'refused delete of post ' . ( $post->ID ?? '?' ) );
		return $delete;
	}

	public static function attachment( $id ): void {
		self::fail( "refused attachment write {$id}" );
	}

	public static function object_terms( $object_id, $terms, $tt_ids, $taxonomy ): void {
		if ( 0 !== strpos( (string) $taxonomy, 'alaliah_' ) || ! Schema::is_own_type( (string) get_post_type( (int) $object_id ) ) ) {
			self::fail( "refused term assignment {$taxonomy} on {$object_id}" );
		}
	}
}
