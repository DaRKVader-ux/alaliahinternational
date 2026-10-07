<?php
namespace Trigon\AlaliahCore\Domain;

use Trigon\AlaliahCore\Schema;

defined( 'ABSPATH' ) || exit;

/**
 * Property URL rule (D-035): /property/{base-slug}-aa-1001/
 *
 * - The base slug is the post slug, stored without the token.
 * - Requests resolve by token only; any other base slug (or none) 301s to the canonical URL.
 * - Every property URL (permalinks, REST link, redirect maps) comes from permalink().
 */
final class PropertyUrls {

	public const BASE      = 'property';
	public const QUERY_VAR = 'aa_property_ref';

	public static function register(): void {
		add_rewrite_rule( '^' . self::BASE . '/(?:.+-)?(aa-[0-9]{4,})/?$', 'index.php?' . self::QUERY_VAR . '=$matches[1]', 'top' );
	}

	public static function hooks(): void {
		add_filter( 'query_vars', static fn( array $v ): array => array_merge( $v, array( self::QUERY_VAR ) ) );
		add_filter( 'request', array( self::class, 'resolve' ) );
		add_filter( 'post_type_link', array( self::class, 'filter_link' ), 10, 2 );
		add_filter( 'wp_insert_post_data', array( self::class, 'strip_token_from_slug' ), 10, 2 );
		add_action( 'template_redirect', array( self::class, 'canonical_redirect' ), 1 );
	}

	/** Strip any trailing reference-like token from a property's stored slug. */
	public static function base_slug( string $slug ): string {
		return (string) preg_replace( '/-?aa-\d{4,}$/', '', $slug );
	}

	/** The one function that builds a property's public URL. */
	public static function permalink( int $post_id ): string {
		$post = get_post( $post_id );
		if ( ! $post || Schema::PROPERTY !== $post->post_type ) {
			return '';
		}
		$ref = References::get( $post_id );
		if ( ! $ref ) {
			return '';
		}
		$base = self::base_slug( $post->post_name ? $post->post_name : sanitize_title( $post->post_title ) );
		$path = self::BASE . '/' . ( '' !== $base ? $base . '-' : '' ) . References::token( $ref ) . '/';
		return home_url( user_trailingslashit( $path ) );
	}

	public static function filter_link( string $link, \WP_Post $post ): string {
		if ( Schema::PROPERTY !== $post->post_type ) {
			return $link;
		}
		$url = self::permalink( $post->ID );
		return $url ? $url : $link;
	}

	public static function resolve( array $vars ): array {
		if ( empty( $vars[ self::QUERY_VAR ] ) ) {
			return $vars;
		}
		$id = References::find_post( References::from_token( (string) $vars[ self::QUERY_VAR ] ) );
		unset( $vars[ self::QUERY_VAR ] );
		if ( ! $id ) {
			$vars['error'] = '404';
			return $vars;
		}
		return array(
			'post_type' => Schema::PROPERTY,
			'p'         => $id,
		);
	}

	public static function strip_token_from_slug( array $data, array $postarr ): array {
		if ( Schema::PROPERTY === ( $data['post_type'] ?? '' ) && ! empty( $data['post_name'] ) ) {
			$data['post_name'] = self::base_slug( $data['post_name'] );
		}
		return $data;
	}

	/** 301 any non-canonical property path (wrong or missing base slug) to the canonical URL. */
	public static function canonical_redirect(): void {
		if ( ! is_singular( Schema::PROPERTY ) || is_preview() || 'GET' !== ( $_SERVER['REQUEST_METHOD'] ?? 'GET' ) ) {
			return;
		}
		$canonical = self::permalink( get_queried_object_id() );
		if ( ! $canonical ) {
			return;
		}
		$requested = wp_parse_url( (string) wp_unslash( $_SERVER['REQUEST_URI'] ?? '/' ), PHP_URL_PATH );
		$target    = wp_parse_url( $canonical, PHP_URL_PATH );
		if ( untrailingslashit( (string) $requested ) !== untrailingslashit( (string) $target ) ) {
			wp_safe_redirect( $canonical, 301 );
			exit;
		}
	}

	/** Planned URL for a listing that does not exist yet (redirect maps in dry runs). */
	public static function planned( string $base_slug, string $ref ): string {
		$base = self::base_slug( sanitize_title( $base_slug ) );
		return home_url( user_trailingslashit( self::BASE . '/' . ( '' !== $base ? $base . '-' : '' ) . References::token( $ref ) . '/' ) );
	}
}
