<?php
namespace Trigon\AlaliahCore\Domain;

use Trigon\AlaliahCore\Schema;

defined( 'ABSPATH' ) || exit;

/**
 * Immutable Al Aliah listing references: AA-1001, AA-1002, …
 *
 * - Hand-created listings draw from a counter that starts above the range reserved for
 *   migrated listings, so the two can never collide.
 * - Migrated listings receive their reference from the deterministic migration map.
 * - Once set, a reference cannot be changed or removed (enforced on every meta write path).
 */
final class References {

	public const OPTION_NEXT     = 'aa_reference_next';
	public const OPTION_RESERVED = 'aa_reference_reserved';
	public const RESERVED_FROM   = 1001;
	public const RESERVED_TO     = 1011; // The 11 legacy listings (Stage 03.2 report §18.2).
	public const KEY             = 'aa_reference';

	private static bool $internal = false;

	public static function hooks(): void {
		add_action( 'save_post_' . Schema::PROPERTY, array( self::class, 'on_save' ), 5, 2 );
		add_filter( 'add_post_metadata', array( self::class, 'guard' ), 10, 3 );
		add_filter( 'update_post_metadata', array( self::class, 'guard' ), 10, 3 );
		add_filter( 'delete_post_metadata', array( self::class, 'guard' ), 10, 3 );
	}

	public static function format( int $n ): string {
		return 'AA-' . $n;
	}

	public static function is_valid( string $ref ): bool {
		return (bool) preg_match( '/^AA-\d{4,}$/', $ref );
	}

	/** URL token for a reference: AA-1001 → aa-1001. The only place this rule lives. */
	public static function token( string $ref ): string {
		return strtolower( $ref );
	}

	public static function from_token( string $token ): string {
		return strtoupper( $token );
	}

	public static function get( int $post_id ): string {
		return (string) get_post_meta( $post_id, self::KEY, true );
	}

	public static function find_post( string $ref ): int {
		global $wpdb;
		return (int) $wpdb->get_var(
			$wpdb->prepare(
				"SELECT pm.post_id FROM {$wpdb->postmeta} pm JOIN {$wpdb->posts} p ON p.ID = pm.post_id
				 WHERE pm.meta_key = %s AND pm.meta_value = %s AND p.post_type = %s LIMIT 1",
				self::KEY,
				$ref,
				Schema::PROPERTY
			)
		);
	}

	/** Reserve the migration range and start the counter above it. Idempotent. */
	public static function setup(): array {
		if ( false === get_option( self::OPTION_RESERVED ) ) {
			add_option( self::OPTION_RESERVED, array( 'from' => self::RESERVED_FROM, 'to' => self::RESERVED_TO ), '', false );
		}
		if ( false === get_option( self::OPTION_NEXT ) ) {
			add_option( self::OPTION_NEXT, (string) ( self::RESERVED_TO + 1 ), '', false );
		}
		return array( 'reserved' => get_option( self::OPTION_RESERVED ), 'next' => (int) get_option( self::OPTION_NEXT ) );
	}

	/** Assign a reference on first save of a hand-created listing. */
	public static function on_save( int $post_id, \WP_Post $post ): void {
		if ( wp_is_post_revision( $post_id ) || 'auto-draft' === $post->post_status ) {
			return;
		}
		if ( self::get( $post_id ) ) {
			return;
		}
		if ( get_post_meta( $post_id, 'aa_legacy_post_id', true ) ) {
			return; // Migrated listings get their reference from the migration map.
		}
		self::assign( $post_id, self::allocate() );
	}

	/**
	 * Compare-and-swap allocation: portable across MySQL/MariaDB and SQLite, and safe
	 * against concurrent saves.
	 */
	public static function allocate(): string {
		global $wpdb;
		self::setup();
		for ( $i = 0; $i < 20; $i++ ) {
			$current = (int) $wpdb->get_var( $wpdb->prepare( "SELECT option_value FROM {$wpdb->options} WHERE option_name = %s", self::OPTION_NEXT ) );
			$updated = $wpdb->query(
				$wpdb->prepare(
					"UPDATE {$wpdb->options} SET option_value = %s WHERE option_name = %s AND option_value = %s",
					(string) ( $current + 1 ),
					self::OPTION_NEXT,
					(string) $current
				)
			);
			wp_cache_delete( self::OPTION_NEXT, 'options' );
			wp_cache_delete( 'notoptions', 'options' );
			if ( 1 === (int) $updated ) {
				$ref = self::format( $current );
				if ( ! self::find_post( $ref ) ) {
					return $ref;
				}
			}
		}
		throw new \RuntimeException( 'Could not allocate a listing reference.' );
	}

	/** Set a reference once. Throws on an invalid or duplicate reference. */
	public static function assign( int $post_id, string $ref ): string {
		$existing = self::get( $post_id );
		if ( $existing ) {
			return $existing;
		}
		if ( ! self::is_valid( $ref ) ) {
			throw new \InvalidArgumentException( "Invalid reference {$ref}." );
		}
		$owner = self::find_post( $ref );
		if ( $owner && $owner !== $post_id ) {
			throw new \RuntimeException( "Reference {$ref} already belongs to post {$owner}." );
		}
		self::$internal = true;
		try {
			add_post_meta( $post_id, self::KEY, $ref, true );
		} finally {
			self::$internal = false;
		}
		return $ref;
	}

	/** Block every change to an existing reference, and any write that bypasses assign(). */
	public static function guard( $check, $object_id, $meta_key ) {
		if ( self::KEY !== $meta_key || self::$internal ) {
			return $check;
		}
		return false;
	}

	/** Raise the counter above a value (used after migrations that assign from the map). */
	public static function ensure_next_above( int $n ): void {
		self::setup();
		$next = (int) get_option( self::OPTION_NEXT );
		if ( $next <= $n ) {
			update_option( self::OPTION_NEXT, (string) ( $n + 1 ), false );
		}
	}
}
