<?php
namespace Trigon\AlaliahCore;

defined( 'ABSPATH' ) || exit;

/**
 * Single source of truth for the data model: post types, field definitions, admin grouping
 * and sanitisation. Registration, admin editing, REST output and migration all read from here.
 */
final class Schema {

	public const PROPERTY  = 'alaliah_property';
	public const PROJECT   = 'alaliah_project';
	public const DEVELOPER = 'alaliah_developer';
	public const AREA      = 'alaliah_area';
	public const AGENT     = 'alaliah_agent';
	public const INSIGHT   = 'alaliah_insight';

	public const TAX_LOCATION   = 'alaliah_location';
	public const TAX_PURPOSE    = 'alaliah_purpose';
	public const TAX_COMPLETION = 'alaliah_completion';
	public const TAX_STATUS     = 'alaliah_status';
	public const TAX_CATEGORY   = 'alaliah_category';
	public const TAX_TYPE       = 'alaliah_type';
	public const TAX_AMENITY    = 'alaliah_amenity';
	public const TAX_REL_DEV    = 'alaliah_rel_developer';
	public const TAX_REL_PROJ   = 'alaliah_rel_project';

	public const IDENTITY_STATES = array(
		'verified'      => 'Verified',
		'needs-review'  => 'Needs review',
		'probable-demo' => 'Probable demo/test',
		'duplicate'     => 'Duplicate',
		'invalid'       => 'Invalid/incomplete',
	);

	public const PERMIT_SYSTEMS = array(
		'madhmoun'    => 'Madhmoun',
		'unspecified' => 'Unspecified',
	);

	public static function post_types(): array {
		return array( self::PROPERTY, self::PROJECT, self::DEVELOPER, self::AREA, self::AGENT, self::INSIGHT );
	}

	public static function is_own_type( string $type ): bool {
		return in_array( $type, self::post_types(), true );
	}

	/** Every taxonomy this plugin registers. Nothing else may be written by the migration. */
	public static function taxonomies(): array {
		return array( self::TAX_LOCATION, self::TAX_PURPOSE, self::TAX_COMPLETION, self::TAX_STATUS, self::TAX_CATEGORY, self::TAX_TYPE, self::TAX_AMENITY, self::TAX_REL_DEV, self::TAX_REL_PROJ );
	}

	public static function is_own_taxonomy( string $taxonomy ): bool {
		return in_array( $taxonomy, self::taxonomies(), true );
	}

	public static function permit_systems(): array {
		/** Allows other regulatory systems to be added without new fields. */
		return (array) apply_filters( 'trigon_alaliah_permit_systems', self::PERMIT_SYSTEMS );
	}

	/**
	 * Field definitions keyed by meta key (or `tax:<taxonomy>` for taxonomy controls).
	 * `objects` = post types; `store` = registered meta type; `input` = admin control.
	 */
	public static function fields(): array {
		$p  = array( self::PROPERTY );
		$pp = array( self::PROPERTY, self::PROJECT );

		$f = array(
			// Property box.
			'aa_reference'                   => array( 'label' => 'Reference', 'objects' => $p, 'store' => 'string', 'input' => 'readonly', 'group' => 'property', 'public' => 'reference' ),
			'tax:' . self::TAX_PURPOSE       => array( 'label' => 'Purpose', 'objects' => $p, 'input' => 'term', 'taxonomy' => self::TAX_PURPOSE, 'group' => 'property' ),
			'tax:' . self::TAX_STATUS        => array( 'label' => 'Status', 'objects' => $p, 'input' => 'term', 'taxonomy' => self::TAX_STATUS, 'group' => 'property' ),
			'tax:' . self::TAX_COMPLETION    => array( 'label' => 'Completion', 'objects' => $pp, 'input' => 'term', 'taxonomy' => self::TAX_COMPLETION, 'group' => 'property' ),
			'tax:' . self::TAX_TYPE          => array( 'label' => 'Property type', 'objects' => $p, 'input' => 'term', 'taxonomy' => self::TAX_TYPE, 'group' => 'property' ),
			'tax:' . self::TAX_CATEGORY      => array( 'label' => 'Category', 'objects' => $p, 'input' => 'term', 'taxonomy' => self::TAX_CATEGORY, 'group' => 'property' ),
			'aa_price'                       => array( 'label' => 'Price (AED)', 'objects' => $p, 'store' => 'integer', 'input' => 'number', 'min' => 1, 'group' => 'property', 'public' => 'price' ),
			'aa_rent_period'                 => array( 'label' => 'Rent period', 'objects' => $p, 'store' => 'string', 'input' => 'select', 'options' => array( '' => '—', 'yearly' => 'Yearly', 'monthly' => 'Monthly' ), 'group' => 'property', 'public' => 'rent_period' ),

			// Details.
			'aa_bedrooms'                    => array( 'label' => 'Bedrooms (0 = studio)', 'objects' => $p, 'store' => 'integer', 'input' => 'number', 'min' => 0, 'max' => 20, 'group' => 'details', 'public' => 'bedrooms' ),
			'aa_bathrooms'                   => array( 'label' => 'Bathrooms', 'objects' => $p, 'store' => 'integer', 'input' => 'number', 'min' => 0, 'max' => 20, 'group' => 'details', 'public' => 'bathrooms' ),
			'aa_size_builtup'                => array( 'label' => 'Built-up area (sq ft)', 'objects' => $p, 'store' => 'number', 'input' => 'decimal', 'min' => 0.01, 'group' => 'details', 'public' => 'size_builtup' ),
			'aa_size_plot'                   => array( 'label' => 'Plot area (sq ft)', 'objects' => $p, 'store' => 'number', 'input' => 'decimal', 'min' => 0.01, 'group' => 'details', 'public' => 'size_plot' ),
			'aa_furnishing'                  => array( 'label' => 'Furnishing', 'objects' => $p, 'store' => 'string', 'input' => 'select', 'options' => array( '' => '—', 'furnished' => 'Furnished', 'unfurnished' => 'Unfurnished', 'partly-furnished' => 'Partly furnished' ), 'group' => 'details', 'public' => 'furnishing' ),
			'aa_property_agency'             => array( 'label' => 'Property agency', 'objects' => $pp, 'store' => 'string', 'input' => 'text', 'group' => 'details', 'public' => false, 'help' => 'The presenting or selling agency, as written. Never used to set the developer. Not public until the property-detail design decides how a third-party agency is shown.' ),
			'aa_handover'                    => array( 'label' => 'Handover', 'objects' => $pp, 'store' => 'string', 'input' => 'text', 'group' => 'details', 'public' => 'handover' ),
			'aa_handover_year'               => array( 'label' => 'Handover year (for filtering)', 'objects' => $pp, 'store' => 'integer', 'input' => 'number', 'min' => 2000, 'max' => 2100, 'group' => 'details', 'public' => 'handover_year' ),

			// Location.
			'tax:' . self::TAX_LOCATION      => array( 'label' => 'Location', 'objects' => $pp, 'input' => 'location', 'taxonomy' => self::TAX_LOCATION, 'group' => 'location', 'help' => 'Choose the most specific confirmed level (community, sub-community or building).' ),
			'aa_lat'                         => array( 'label' => 'Latitude', 'objects' => $p, 'store' => 'number', 'input' => 'decimal', 'group' => 'location', 'public' => 'lat' ),
			'aa_lng'                         => array( 'label' => 'Longitude', 'objects' => $p, 'store' => 'number', 'input' => 'decimal', 'group' => 'location', 'public' => 'lng' ),
			'aa_geo_precision'               => array( 'label' => 'Map precision', 'objects' => $p, 'store' => 'string', 'input' => 'readonly', 'group' => 'location', 'public' => 'geo_precision' ),

			// Relationships.
			'aa_project_id'                  => array( 'label' => 'Project', 'objects' => $p, 'store' => 'integer', 'input' => 'post', 'post_type' => self::PROJECT, 'group' => 'relationships' ),
			'aa_developer_id'                => array( 'label' => 'Developer', 'objects' => $pp, 'store' => 'integer', 'input' => 'post', 'post_type' => self::DEVELOPER, 'group' => 'relationships' ),
			'aa_agent_id'                    => array( 'label' => 'Agent', 'objects' => $p, 'store' => 'integer', 'input' => 'post', 'post_type' => self::AGENT, 'group' => 'relationships' ),

			// Payment plan (text, migrated exactly).
			'aa_payment_plan_overall'        => array( 'label' => 'Overall payment plan', 'objects' => $pp, 'store' => 'string', 'input' => 'text', 'group' => 'payment', 'public' => 'payment_plan_overall' ),
			'aa_payment_on_booking'          => array( 'label' => 'Payment on booking', 'objects' => $pp, 'store' => 'string', 'input' => 'text', 'group' => 'payment', 'public' => 'payment_on_booking' ),
			'aa_payment_during_construction' => array( 'label' => 'Payment during construction', 'objects' => $pp, 'store' => 'string', 'input' => 'text', 'group' => 'payment', 'public' => 'payment_during_construction' ),
			'aa_payment_on_handover'         => array( 'label' => 'Payment on handover', 'objects' => $pp, 'store' => 'string', 'input' => 'text', 'group' => 'payment', 'public' => 'payment_on_handover' ),

			// Compliance.
			'aa_permits'                     => array( 'label' => 'Advertising permits', 'objects' => $pp, 'store' => 'array', 'input' => 'permits', 'group' => 'compliance', 'help' => 'Only entries marked verified and public are ever shown publicly.' ),
			'aa_madhmoun_permit'             => array( 'label' => 'Madhmoun permit (legacy field)', 'objects' => $pp, 'store' => 'string', 'input' => 'text', 'group' => 'compliance', 'help' => 'Kept for compatibility with the old site. Never displayed; use the permit entries above.' ),

			// Media.
			'aa_gallery'                     => array( 'label' => 'Gallery', 'objects' => $pp, 'store' => 'array', 'input' => 'gallery', 'group' => 'media' ),
			'aa_floor_plans'                 => array( 'label' => 'Floor plans', 'objects' => $pp, 'store' => 'array', 'input' => 'floorplans', 'group' => 'media', 'help' => 'Uploading an image is enough. Details are optional.' ),
			'aa_video_url'                   => array( 'label' => 'Video URL (YouTube or Vimeo)', 'objects' => $pp, 'store' => 'string', 'input' => 'url', 'group' => 'media', 'public' => 'video_url' ),
			'aa_brochure_id'                 => array( 'label' => 'Brochure (PDF)', 'objects' => $pp, 'store' => 'integer', 'input' => 'file', 'mime' => 'application/pdf', 'group' => 'media' ),

			// Marketing.
			'tax:' . self::TAX_AMENITY       => array( 'label' => 'Amenities', 'objects' => $pp, 'input' => 'terms', 'taxonomy' => self::TAX_AMENITY, 'group' => 'marketing' ),
			'aa_is_featured'                 => array( 'label' => 'Featured property', 'objects' => $p, 'store' => 'boolean', 'input' => 'checkbox', 'group' => 'marketing', 'public' => 'is_featured' ),

			// Project-only.
			'aa_price_from'                  => array( 'label' => 'Price from (AED, sourced)', 'objects' => array( self::PROJECT ), 'store' => 'integer', 'input' => 'number', 'min' => 1, 'group' => 'property', 'public' => 'price_from' ),
			'aa_unit_types'                  => array( 'label' => 'Unit types', 'objects' => array( self::PROJECT ), 'store' => 'string', 'input' => 'text', 'group' => 'property', 'public' => 'unit_types' ),
			'aa_masterplan_id'               => array( 'label' => 'Masterplan image', 'objects' => array( self::PROJECT ), 'store' => 'integer', 'input' => 'image', 'group' => 'media' ),

			// Developer.
			'aa_review_status'               => array( 'label' => 'Identity', 'objects' => array( self::DEVELOPER, self::PROJECT ), 'store' => 'string', 'input' => 'select', 'options' => self::IDENTITY_STATES, 'group' => 'review', 'default' => 'needs-review' ),
			'aa_review_note'                 => array( 'label' => 'Review note', 'objects' => array( self::DEVELOPER, self::PROJECT ), 'store' => 'string', 'input' => 'textarea', 'group' => 'review' ),
			'aa_logo_id'                     => array( 'label' => 'Developer logo', 'objects' => array( self::DEVELOPER ), 'store' => 'integer', 'input' => 'image', 'group' => 'identity', 'help' => 'SVG or transparent PNG, at least 800 px wide.' ),
			'aa_logo_approved'               => array( 'label' => 'Logo approved for public use', 'objects' => array( self::DEVELOPER ), 'store' => 'boolean', 'input' => 'checkbox', 'group' => 'identity' ),
			'aa_about'                       => array( 'label' => 'About (public copy)', 'objects' => array( self::DEVELOPER ), 'store' => 'string', 'input' => 'richtext', 'group' => 'about', 'public' => 'about', 'help' => 'Only sourced or editorially approved copy.' ),
			'aa_about_approved'              => array( 'label' => 'About copy is sourced or approved', 'objects' => array( self::DEVELOPER ), 'store' => 'boolean', 'input' => 'checkbox', 'group' => 'about' ),
			'aa_about_legacy'                => array( 'label' => 'Legacy description (review only, never shown)', 'objects' => array( self::DEVELOPER ), 'store' => 'string', 'input' => 'readonly', 'group' => 'about' ),
			'aa_sources'                     => array( 'label' => 'Sources', 'objects' => array( self::DEVELOPER ), 'store' => 'array', 'input' => 'sources', 'group' => 'about' ),
			'aa_website'                     => array( 'label' => 'Official website', 'objects' => array( self::DEVELOPER ), 'store' => 'string', 'input' => 'url', 'group' => 'identity', 'public' => 'website' ),
			'aa_rating'                      => array( 'label' => 'External rating', 'objects' => array( self::DEVELOPER ), 'store' => 'object', 'input' => 'rating', 'group' => 'rating', 'help' => 'Only from a legitimate independent source, attributed. Leave empty otherwise.' ),

			// Agent.
			'aa_role'                        => array( 'label' => 'Role', 'objects' => array( self::AGENT ), 'store' => 'string', 'input' => 'text', 'group' => 'agent', 'public' => 'role' ),
			'aa_brn'                         => array( 'label' => 'BRN', 'objects' => array( self::AGENT ), 'store' => 'string', 'input' => 'text', 'group' => 'agent', 'public' => 'brn' ),
			'aa_languages'                   => array( 'label' => 'Languages (comma separated)', 'objects' => array( self::AGENT ), 'store' => 'array', 'input' => 'list', 'group' => 'agent', 'public' => 'languages' ),
			'aa_phone'                       => array( 'label' => 'Phone', 'objects' => array( self::AGENT ), 'store' => 'string', 'input' => 'text', 'group' => 'agent', 'public' => 'phone', 'contact' => true ),
			'aa_mobile'                      => array( 'label' => 'Mobile', 'objects' => array( self::AGENT ), 'store' => 'string', 'input' => 'text', 'group' => 'agent', 'public' => 'mobile', 'contact' => true ),
			'aa_whatsapp'                    => array( 'label' => 'WhatsApp', 'objects' => array( self::AGENT ), 'store' => 'string', 'input' => 'text', 'group' => 'agent', 'public' => 'whatsapp', 'contact' => true ),
			'aa_email'                       => array( 'label' => 'Email', 'objects' => array( self::AGENT ), 'store' => 'string', 'input' => 'email', 'group' => 'agent', 'public' => 'email', 'contact' => true ),
			'aa_is_office'                   => array( 'label' => 'Company office contact', 'objects' => array( self::AGENT ), 'store' => 'boolean', 'input' => 'checkbox', 'group' => 'agent', 'public' => 'is_office' ),

			// Area.
			'aa_location_term_id'            => array( 'label' => 'Location', 'objects' => array( self::AREA ), 'store' => 'integer', 'input' => 'location_id', 'group' => 'area' ),
			'aa_hero_id'                     => array( 'label' => 'Hero image', 'objects' => array( self::AREA ), 'store' => 'integer', 'input' => 'image', 'group' => 'area' ),
			'aa_name_ar'                     => array( 'label' => 'Arabic name (verified)', 'objects' => array( self::AREA ), 'store' => 'string', 'input' => 'text', 'group' => 'area', 'public' => 'name_ar' ),
		);

		// System fields: never edited in the admin, never exposed in REST.
		$all = self::post_types();
		foreach ( array( 'aa_legacy_post_id' => 'integer', 'aa_legacy_slug' => 'string', 'aa_quality_flags' => 'array', 'aa_migration_flags' => 'array', 'aa_migration_audit' => 'object', 'aa_migration_hash' => 'string' ) as $key => $store ) {
			$f[ $key ] = array( 'label' => $key, 'objects' => $all, 'store' => $store, 'input' => 'system' );
		}
		return $f;
	}

	/** Meta box groups in order, per post type. */
	public static function groups( string $post_type ): array {
		$map = array(
			self::PROPERTY  => array(
				'property'      => 'Property',
				'details'       => 'Property details',
				'location'      => 'Location',
				'relationships' => 'Relationships',
				'payment'       => 'Payment plan',
				'compliance'    => 'Compliance',
				'media'         => 'Media',
				'marketing'     => 'Marketing',
			),
			self::PROJECT   => array(
				'relationships' => 'Developer',
				'property'      => 'Project',
				'details'       => 'Details',
				'location'      => 'Location',
				'payment'       => 'Payment plan',
				'compliance'    => 'Compliance',
				'media'         => 'Media',
				'marketing'     => 'Amenities',
				'review'        => 'Review',
			),
			self::DEVELOPER => array(
				'review'   => 'Identity review',
				'identity' => 'Logo and website',
				'about'    => 'About',
				'rating'   => 'External rating',
			),
			self::AGENT     => array( 'agent' => 'Agent details' ),
			self::AREA      => array( 'area' => 'Area' ),
		);
		return $map[ $post_type ] ?? array();
	}

	/** Fields for one post type and group, in definition order. */
	public static function fields_for( string $post_type, ?string $group = null ): array {
		$out = array();
		foreach ( self::fields() as $key => $def ) {
			if ( ! in_array( $post_type, $def['objects'], true ) ) {
				continue;
			}
			if ( null !== $group && ( $def['group'] ?? '' ) !== $group ) {
				continue;
			}
			$out[ $key ] = $def;
		}
		return $out;
	}

	public static function meta_fields_for( string $post_type ): array {
		return array_filter( self::fields_for( $post_type ), static fn( $d, $k ) => 0 !== strpos( $k, 'tax:' ), ARRAY_FILTER_USE_BOTH );
	}

	/**
	 * Sanitise a value for a field definition. Returns null for "empty" (meta is then deleted).
	 * Rules: unknown never becomes 0; text is trimmed only; enums are enforced.
	 */
	public static function sanitize( string $key, array $def, $value ) {
		$input = $def['input'] ?? 'text';
		switch ( $input ) {
			case 'number':
			case 'post':
			case 'image':
			case 'file':
			case 'location_id':
				if ( '' === $value || null === $value ) {
					return null;
				}
				if ( ! is_numeric( $value ) ) {
					return null;
				}
				$n = (int) $value;
				if ( isset( $def['min'] ) && $n < $def['min'] ) {
					return null;
				}
				if ( isset( $def['max'] ) && $n > $def['max'] ) {
					return null;
				}
				if ( in_array( $input, array( 'post', 'image', 'file', 'location_id' ), true ) && $n <= 0 ) {
					return null;
				}
				return $n;
			case 'decimal':
				if ( '' === $value || null === $value || ! is_numeric( $value ) ) {
					return null;
				}
				$n = (float) $value;
				if ( isset( $def['min'] ) && $n < $def['min'] ) {
					return null;
				}
				return $n;
			case 'checkbox':
				return (bool) $value;
			case 'select':
				$value = is_string( $value ) ? trim( $value ) : '';
				return ( '' !== $value && array_key_exists( $value, $def['options'] ) ) ? $value : null;
			case 'url':
				$value = esc_url_raw( trim( (string) $value ) );
				return '' === $value ? null : $value;
			case 'email':
				$value = sanitize_email( (string) $value );
				return '' === $value ? null : $value;
			case 'textarea':
				$value = sanitize_textarea_field( (string) $value );
				return '' === trim( $value ) ? null : trim( $value );
			case 'richtext':
				$value = wp_kses_post( (string) $value );
				return '' === trim( wp_strip_all_tags( $value ) ) ? null : trim( $value );
			case 'list':
				$items = is_array( $value ) ? $value : explode( ',', (string) $value );
				$items = array_values( array_filter( array_map( static fn( $v ) => sanitize_text_field( trim( (string) $v ) ), $items ), 'strlen' ) );
				return $items ? $items : null;
			case 'gallery':
				$ids = is_array( $value ) ? $value : explode( ',', (string) $value );
				$ids = array_values( array_unique( array_filter( array_map( 'intval', $ids ), static fn( $i ) => $i > 0 ) ) );
				return $ids ? $ids : null;
			case 'floorplans':
				return Domain\FloorPlans::sanitize( $value );
			case 'permits':
				return Domain\Permits::sanitize( $value );
			case 'sources':
				$rows = is_array( $value ) ? $value : array();
				$out  = array();
				foreach ( $rows as $row ) {
					$url  = esc_url_raw( trim( (string) ( $row['url'] ?? '' ) ) );
					$note = sanitize_text_field( (string) ( $row['note'] ?? '' ) );
					if ( '' !== $url || '' !== $note ) {
						$out[] = array_filter( array( 'url' => $url, 'note' => $note ), 'strlen' );
					}
				}
				return $out ? $out : null;
			case 'rating':
				$row = is_array( $value ) ? $value : array();
				$r   = array(
					'source'         => sanitize_text_field( (string) ( $row['source'] ?? '' ) ),
					'url'            => esc_url_raw( (string) ( $row['url'] ?? '' ) ),
					'score'          => is_numeric( $row['score'] ?? null ) ? (float) $row['score'] : null,
					'count'          => is_numeric( $row['count'] ?? null ) ? (int) $row['count'] : null,
					'retrieved_on'   => preg_match( '/^\d{4}-\d{2}-\d{2}$/', (string) ( $row['retrieved_on'] ?? '' ) ) ? $row['retrieved_on'] : '',
					'refresh_policy' => sanitize_text_field( (string) ( $row['refresh_policy'] ?? '' ) ),
				);
				$r = array_filter( $r, static fn( $v ) => null !== $v && '' !== $v );
				// An attributed rating needs at least a source, a score and a retrieval date.
				return ( isset( $r['source'], $r['score'], $r['retrieved_on'] ) ) ? $r : null;
			case 'readonly':
			case 'system':
				return $value;
			case 'text':
			default:
				// Exact text: tags removed and outer whitespace trimmed; nothing else is normalised.
				$value = trim( wp_strip_all_tags( wp_check_invalid_utf8( (string) $value ) ) );
				return '' === $value ? null : $value;
		}
	}
}
