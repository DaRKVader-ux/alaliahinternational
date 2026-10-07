<?php
namespace Trigon\AlaliahCore\Domain;

defined( 'ABSPATH' ) || exit;

/**
 * Image-first floor plans. An item needs only an attachment ID; every other key is
 * optional, trimmed, and dropped when empty, so templates never print empty labels.
 */
final class FloorPlans {

	public const OPTIONAL = array( 'title', 'level', 'unit_type', 'bedrooms', 'area', 'note' );

	public static function sanitize( $value ): ?array {
		$rows = is_array( $value ) ? $value : array();
		$out  = array();
		foreach ( $rows as $row ) {
			if ( is_numeric( $row ) ) {
				$row = array( 'id' => $row );
			}
			if ( ! is_array( $row ) ) {
				continue;
			}
			$id = (int) ( $row['id'] ?? 0 );
			if ( $id <= 0 ) {
				continue;
			}
			$item = array( 'id' => $id );
			foreach ( self::OPTIONAL as $key ) {
				$v = trim( sanitize_text_field( (string) ( $row[ $key ] ?? '' ) ) );
				if ( '' !== $v ) {
					$item[ $key ] = $v;
				}
			}
			$out[] = $item;
		}
		return $out ? $out : null;
	}

	/**
	 * Normalised items for templates: image URLs, alt text and only the labels that have values.
	 */
	public static function for_display( int $post_id ): array {
		$items = get_post_meta( $post_id, 'aa_floor_plans', true );
		$items = is_array( $items ) ? $items : array();
		$out   = array();
		foreach ( $items as $item ) {
			$id = (int) ( $item['id'] ?? 0 );
			if ( ! $id || ! wp_attachment_is_image( $id ) ) {
				continue;
			}
			$labels = array();
			foreach ( self::OPTIONAL as $key ) {
				if ( ! empty( $item[ $key ] ) ) {
					$labels[ $key ] = $item[ $key ];
				}
			}
			$alt = trim( (string) get_post_meta( $id, '_wp_attachment_image_alt', true ) );
			if ( '' === $alt ) {
				$alt = trim( 'Floor plan ' . ( $labels['title'] ?? '' ) ) . ', ' . get_the_title( $post_id );
			}
			$out[] = array(
				'id'     => $id,
				'url'    => (string) wp_get_attachment_image_url( $id, 'full' ),
				'alt'    => $alt,
				'labels' => $labels,
			);
		}
		return $out;
	}
}
