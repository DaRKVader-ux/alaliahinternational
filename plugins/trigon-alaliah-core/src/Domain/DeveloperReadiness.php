<?php
namespace Trigon\AlaliahCore\Domain;

use Trigon\AlaliahCore\Schema;

defined( 'ABSPATH' ) || exit;

/**
 * Identity ("is this a real developer?") and readiness ("can its page be public?") are
 * separate. Publishing requires verified identity, an approved logo and approved About copy.
 * Missing relationships are a warning, not a block.
 */
final class DeveloperReadiness {

	private const NOTICE = 'aa_publish_blocked_';

	public static function hooks(): void {
		add_filter( 'wp_insert_post_data', array( self::class, 'guard' ), 20, 2 );
		add_action( 'admin_notices', array( self::class, 'notice' ) );
	}

	/** @return array{ready: bool, blocking: string[], warnings: string[]} */
	public static function evaluate( int $post_id, ?array $override = null ): array {
		$get = static function ( string $key ) use ( $post_id, $override ) {
			return ( null !== $override && array_key_exists( $key, $override ) ) ? $override[ $key ] : get_post_meta( $post_id, $key, true );
		};
		$blocking = array();
		if ( 'verified' !== $get( 'aa_review_status' ) ) {
			$blocking[] = 'Identity is not verified';
		}
		if ( ! (int) $get( 'aa_logo_id' ) ) {
			$blocking[] = 'No logo';
		} elseif ( ! $get( 'aa_logo_approved' ) ) {
			$blocking[] = 'Logo not approved';
		}
		if ( '' === trim( wp_strip_all_tags( (string) $get( 'aa_about' ) ) ) ) {
			$blocking[] = 'No About copy';
		} elseif ( ! $get( 'aa_about_approved' ) ) {
			$blocking[] = 'About copy not sourced or approved';
		}
		$warnings = array();
		if ( $post_id && ! Relations::by_developer( $post_id, Schema::PROJECT ) && ! Relations::by_developer( $post_id, Schema::PROPERTY ) ) {
			$warnings[] = 'No linked projects or listings ("No current listings")';
		}
		return array(
			'ready'    => ! $blocking,
			'blocking' => $blocking,
			'warnings' => $warnings,
		);
	}

	/**
	 * Turn an early publish back into a draft. When the request comes from the edit screen,
	 * the submitted field values are evaluated (they are saved just after this filter).
	 */
	public static function guard( array $data, array $postarr ): array {
		if ( Schema::DEVELOPER !== ( $data['post_type'] ?? '' ) || ! in_array( $data['post_status'] ?? '', array( 'publish', 'future' ), true ) ) {
			return $data;
		}
		$post_id  = (int) ( $postarr['ID'] ?? 0 );
		$override = null;
		if ( isset( $_POST['aa_fields'], $_POST['aa_editor_nonce'] ) && wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['aa_editor_nonce'] ) ), 'aa_save_' . $post_id ) ) {
			$submitted = wp_unslash( $_POST['aa_fields'] ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput -- sanitised per field below.
			$override  = array();
			foreach ( array( 'aa_review_status', 'aa_logo_id', 'aa_logo_approved', 'aa_about', 'aa_about_approved' ) as $key ) {
				$def              = Schema::fields()[ $key ];
				$override[ $key ] = Schema::sanitize( $key, $def, $submitted[ $key ] ?? '' );
			}
		}
		$result = self::evaluate( $post_id, $override );
		if ( ! $result['ready'] ) {
			$data['post_status'] = 'draft';
			if ( $post_id ) {
				set_transient( self::NOTICE . get_current_user_id(), $result['blocking'], 60 );
			}
		}
		return $data;
	}

	public static function notice(): void {
		$items = get_transient( self::NOTICE . get_current_user_id() );
		if ( ! $items ) {
			return;
		}
		delete_transient( self::NOTICE . get_current_user_id() );
		echo '<div class="notice notice-warning"><p><strong>' . esc_html__( 'This developer was kept as a draft.', 'trigon-alaliah-core' ) . '</strong> ' . esc_html__( 'Before it can be published:', 'trigon-alaliah-core' ) . '</p><ul style="list-style:disc;margin-inline-start:1.5em">';
		foreach ( (array) $items as $item ) {
			echo '<li>' . esc_html( $item ) . '</li>';
		}
		echo '</ul></div>';
	}
}
