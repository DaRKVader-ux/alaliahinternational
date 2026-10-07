<?php
namespace Trigon\AlaliahCore\Domain;

use Trigon\AlaliahCore\Schema;

defined( 'ABSPATH' ) || exit;

/**
 * Data-quality flags. Computed flags are recalculated on save; migration flags (facts the
 * migration knew about the legacy record) persist in aa_migration_flags. Flags never block saving.
 */
final class Quality {

	public const LABELS = array(
		'missing_developer'           => 'Missing developer',
		'missing_project'             => 'Missing project',
		'missing_coordinates'         => 'Missing coordinates',
		'invalid_legacy_coordinates'  => 'Invalid or demo coordinates in legacy data',
		'missing_permit'              => 'Missing permit',
		'unverified_permit'           => 'Unverified permit',
		'possible_wrong_type'         => 'Possible wrong property type',
		'duplicate_gallery'           => 'Image used by another listing',
		'missing_area'                => 'Missing area',
		'area_conflict'               => 'Area/emirate conflict in legacy data',
		'missing_size'                => 'Missing size',
		'possible_plot_area'          => 'Size may be plot rather than built-up area',
		'missing_price'               => 'Missing price',
		'field_description_mismatch'  => 'Description disagrees with fields',
		'sales_style_title'           => 'Sales-style title',
		'missing_alt'                 => 'Images without alt text',
		'rent_period_assumed'         => 'Rent period assumed yearly',
		'building_unconfirmed'        => 'Building / sub-community not confirmed',
		'missing_agent'               => 'Missing agent',
		'identity_unverified'         => 'Developer identity not verified',
		'not_ready_to_publish'        => 'Developer not ready to publish',
		'provisional_relationship'    => 'Provisional relationship awaiting confirmation',
		'logo_quality'                => 'Logo needs replacing',
		'missing_logo_alt'            => 'Logo without alt text',
		'unit_types_missing'          => 'Unit types not stated',
		'legacy_notes_to_merge'       => 'Legacy notes to merge',
		'shadow_drift'                => 'Relationship index out of sync',
	);

	public static function hooks(): void {
		foreach ( array( Schema::PROPERTY, Schema::PROJECT, Schema::DEVELOPER ) as $type ) {
			add_action( 'save_post_' . $type, array( self::class, 'on_save' ), 50 );
		}
	}

	public static function on_save( int $post_id ): void {
		if ( wp_is_post_revision( $post_id ) ) {
			return;
		}
		self::store( $post_id );
	}

	public static function store( int $post_id ): array {
		$flags = self::compute( $post_id );
		if ( $flags ) {
			update_post_meta( $post_id, 'aa_quality_flags', $flags );
		} else {
			delete_post_meta( $post_id, 'aa_quality_flags' );
		}
		return $flags;
	}

	/** All flags for a record: computed now, plus persistent migration flags. */
	public static function all( int $post_id ): array {
		$computed  = get_post_meta( $post_id, 'aa_quality_flags', true );
		$migration = get_post_meta( $post_id, 'aa_migration_flags', true );
		return array_values( array_unique( array_merge( is_array( $computed ) ? $computed : array(), is_array( $migration ) ? $migration : array() ) ) );
	}

	public static function compute( int $post_id ): array {
		switch ( get_post_type( $post_id ) ) {
			case Schema::PROPERTY:
				return self::property( $post_id );
			case Schema::PROJECT:
				return self::project( $post_id );
			case Schema::DEVELOPER:
				return self::developer( $post_id );
		}
		return array();
	}

	private static function term_slug( int $post_id, string $tax ): string {
		$t = wp_get_object_terms( $post_id, $tax, array( 'fields' => 'slugs' ) );
		return ( ! is_wp_error( $t ) && $t ) ? (string) $t[0] : '';
	}

	private static function property( int $id ): array {
		$f          = array();
		$completion = self::term_slug( $id, Schema::TAX_COMPLETION );
		$status     = self::term_slug( $id, Schema::TAX_STATUS );
		$type       = self::term_slug( $id, Schema::TAX_TYPE );
		$title      = get_the_title( $id );

		if ( 'off-plan' === $completion && ! Relations::effective_developer( $id ) ) {
			$f[] = 'missing_developer';
		}
		if ( 'off-plan' === $completion && ! Relations::project_of( $id ) ) {
			$f[] = 'missing_project';
		}
		if ( '' === (string) get_post_meta( $id, 'aa_lat', true ) || '' === (string) get_post_meta( $id, 'aa_lng', true ) ) {
			$f[] = 'missing_coordinates';
		}
		$f = array_merge( $f, self::permit_flags( $id ) );
		if ( ! wp_get_object_terms( $id, Schema::TAX_LOCATION, array( 'fields' => 'ids' ) ) ) {
			$f[] = 'missing_area';
		}
		if ( ! (float) get_post_meta( $id, 'aa_size_builtup', true ) ) {
			$f[] = 'missing_size';
		}
		if ( in_array( $type, array( 'villa', 'townhouse' ), true ) && (float) get_post_meta( $id, 'aa_size_builtup', true ) > 8000 && ! (float) get_post_meta( $id, 'aa_size_plot', true ) ) {
			$f[] = 'possible_plot_area';
		}
		if ( in_array( $status, array( '', 'available' ), true ) && ! (int) get_post_meta( $id, 'aa_price', true ) ) {
			$f[] = 'missing_price';
		}
		if ( ! (int) get_post_meta( $id, 'aa_agent_id', true ) ) {
			$f[] = 'missing_agent';
		}
		if ( self::type_mismatch( $title, $type, (int) get_post_meta( $id, 'aa_bedrooms', true ) ) ) {
			$f[] = 'possible_wrong_type';
		}
		if ( self::sales_style( $title ) ) {
			$f[] = 'sales_style_title';
		}
		$f = array_merge( $f, self::media_flags( $id ) );
		return array_values( array_unique( $f ) );
	}

	private static function project( int $id ): array {
		$f = array();
		if ( ! Relations::effective_developer( $id ) ) {
			$f[] = 'missing_developer';
		}
		if ( ! wp_get_object_terms( $id, Schema::TAX_LOCATION, array( 'fields' => 'ids' ) ) ) {
			$f[] = 'missing_area';
		}
		if ( Permits::has_unverified( $id ) ) {
			$f[] = 'unverified_permit';
		}
		if ( '' === (string) get_post_meta( $id, 'aa_unit_types', true ) ) {
			$f[] = 'unit_types_missing';
		}
		if ( self::sales_style( get_the_title( $id ) ) ) {
			$f[] = 'sales_style_title';
		}
		return array_merge( $f, self::media_flags( $id ) );
	}

	private static function developer( int $id ): array {
		$f = array();
		if ( 'verified' !== get_post_meta( $id, 'aa_review_status', true ) ) {
			$f[] = 'identity_unverified';
		}
		if ( ! DeveloperReadiness::evaluate( $id )['ready'] ) {
			$f[] = 'not_ready_to_publish';
		}
		$logo = (int) get_post_meta( $id, 'aa_logo_id', true );
		if ( $logo && '' === trim( (string) get_post_meta( $logo, '_wp_attachment_image_alt', true ) ) ) {
			$f[] = 'missing_logo_alt';
		}
		return $f;
	}

	private static function permit_flags( int $id ): array {
		$all = Permits::all( $id );
		if ( ! $all ) {
			return array( 'missing_permit' );
		}
		return Permits::has_unverified( $id ) ? array( 'unverified_permit' ) : array();
	}

	private static function media_flags( int $id ): array {
		$f       = array();
		$gallery = get_post_meta( $id, 'aa_gallery', true );
		$gallery = is_array( $gallery ) ? array_map( 'intval', $gallery ) : array();
		$plans   = get_post_meta( $id, 'aa_floor_plans', true );
		$images  = array_merge( $gallery, array_map( static fn( $p ) => (int) ( $p['id'] ?? 0 ), is_array( $plans ) ? $plans : array() ) );
		foreach ( $images as $att ) {
			if ( $att && '' === trim( (string) get_post_meta( $att, '_wp_attachment_image_alt', true ) ) ) {
				$f[] = 'missing_alt';
				break;
			}
		}
		if ( $gallery && self::gallery_shared( $id, $gallery ) ) {
			$f[] = 'duplicate_gallery';
		}
		return $f;
	}

	/** True when any gallery image is also in another property's or project's gallery. */
	public static function gallery_shared( int $id, array $gallery ): bool {
		global $wpdb;
		$rows = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT pm.post_id, pm.meta_value FROM {$wpdb->postmeta} pm JOIN {$wpdb->posts} p ON p.ID = pm.post_id
				 WHERE pm.meta_key = 'aa_gallery' AND pm.post_id <> %d AND p.post_type IN (%s, %s)",
				$id,
				Schema::PROPERTY,
				Schema::PROJECT
			)
		);
		foreach ( $rows as $row ) {
			$other = maybe_unserialize( $row->meta_value );
			if ( is_array( $other ) && array_intersect( $gallery, array_map( 'intval', $other ) ) ) {
				return true;
			}
		}
		return false;
	}

	public static function sales_style( string $title ): bool {
		return (bool) preg_match( '/exclusive offer|invest now|\d+\s*%\s*discount|high roi|best investment|hot offer|luxur(y|ious)|premium|lavish|prime location/i', $title );
	}

	/** Title words that contradict the stored type or bedroom count. */
	public static function type_mismatch( string $title, string $type, int $beds ): bool {
		$t = strtolower( $title );
		foreach ( array( 'villa' => 'villa', 'townhouse' => 'townhouse', 'penthouse' => 'penthouse' ) as $word => $slug ) {
			if ( preg_match( '/\b' . $word . 's?\b/', $t ) && $type && $type !== $slug ) {
				return true;
			}
		}
		if ( preg_match( '/\bstudio\b/', $t ) && $beds > 0 ) {
			return true;
		}
		if ( preg_match( '/\b(\d)\s*(bhk|bd|br|bed|bedroom)/', $t, $m ) && $beds && (int) $m[1] !== $beds ) {
			return true;
		}
		return false;
	}
}
