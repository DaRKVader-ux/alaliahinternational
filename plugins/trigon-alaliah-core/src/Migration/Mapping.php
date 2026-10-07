<?php
namespace Trigon\AlaliahCore\Migration;

defined( 'ABSPATH' ) || exit;

/**
 * Approved migration decisions (Stage 03.2, D-034/D-035) expressed as data.
 * Changing anything here changes what the migration does; keep it in step with the docs.
 */
final class Mapping {

	/** Legacy property_action_category slug → [purpose, completion]. */
	public const ACTION = array(
		'rent'     => array( 'rent', 'ready' ),
		'sell'     => array( 'sale', 'ready' ),
		'off-plan' => array( 'sale', 'off-plan' ),
	);

	/** Legacy property_category slug → alaliah_type slug (category is Residential for all). */
	public const TYPE = array(
		'apartments' => 'apartment',
		'villa'      => 'villa',
		'townhouse'  => 'townhouse',
	);

	/** Legacy property_status slug → alaliah_status slug. Marketing labels are dropped. */
	public const STATUS = array(
		'active' => 'available',
		'sold'   => 'sold',
	);

	/** Legacy records that are projects, not properties (D-034 decision 7). */
	public const PROJECTS = array(
		32060 => array( 'name' => 'Azizi Venice', 'developer' => 32034, 'link' => false, 'identity' => 'needs-review', 'flags' => array( 'provisional_relationship' ), 'note' => 'T3 provisional: developer link not set until independently confirmed.' ),
		32078 => array( 'name' => 'Bayz 102', 'developer' => 32018, 'link' => true, 'identity' => 'verified', 'flags' => array(), 'note' => 'T1: description states "The project by Danube Properties in Business Bay".' ),
		32101 => array( 'name' => 'Binghatti Aquarise', 'developer' => 32040, 'link' => true, 'identity' => 'verified', 'flags' => array(), 'note' => 'T2: project name and description identify the Binghatti development.' ),
	);

	/** Developer identity classification (report §9; Azizi stays needs-review while T3 is provisional). */
	public const VERIFIED_DEVELOPERS = array( 32018, 32040 );

	/** Approved name corrections: legacy developer ID → [name, slug]. Others migrate as stored. */
	public const DEVELOPER_NAMES = array(
		32034 => array( 'Azizi Developments', 'azizi-developments' ),
	);

	/** Logo review findings by legacy developer ID (report §9). */
	public const LOGO_FINDINGS = array(
		31714 => array( 'low resolution (183×51)' ),
		32010 => array( 'low resolution (408×280, 7 KB)' ),
		32013 => array( 'low resolution (200×200)', 'no transparency' ),
		32018 => array( 'no transparency' ),
		32022 => array( 'no transparency' ),
		32024 => array( 'low resolution (482×334)', 'non-standard version (white on black)' ),
		32028 => array( 'no transparency' ),
		32034 => array( 'screenshot' ),
		32036 => array( 'low resolution (356×142, 3 KB)' ),
		32038 => array( 'screenshot' ),
		32040 => array( 'screenshot' ),
		32045 => array( 'non-standard version (cropped frame)' ),
	);

	/** Location spelling/slug corrections by legacy property_area slug (report §12). */
	public const AREA_FIX = array(
		'sadiyat' => array( 'name' => 'Saadiyat Island', 'slug' => 'saadiyat-island' ),
		'al-reem' => array( 'name' => 'Al Reem Island', 'slug' => 'al-reem-island' ),
		'jbr'     => array( 'name' => 'Jumeirah Beach Residence', 'slug' => 'jumeirah-beach-residence' ),
		'dip'     => array( 'name' => 'Dubai Investment Park', 'slug' => 'dubai-investment-park' ),
	);

	/** Facts known from the approved report that cannot be derived generically. */
	public const RECORD_FLAGS = array(
		31083 => array( 'field_description_mismatch' ),
		31094 => array( 'field_description_mismatch' ),
		31013 => array( 'building_unconfirmed' ),
		// Editorial review only: "4 Master Bedroom with Private Pool" typed Apartment. The type is not changed.
		30967 => array( 'possible_wrong_type' ),
	);

	/** Unconfirmed location proposals (recorded in the audit only; never created by the migration). */
	public const LOCATION_PROPOSALS = array(
		31013 => array(
			array( 'level' => 'subcommunity', 'name' => 'Marina Square', 'parent' => 'Al Reem Island' ),
			array( 'level' => 'building', 'name' => 'Marina Blue Tower', 'parent' => 'Marina Square' ),
		),
	);

	/** Approved controlled sets (D-034, D-035). */
	public static function sets(): array {
		return array(
			't1t2' => array(
				'label'      => 'T1/T2: Developer → Project → Area relationship test',
				'developers' => array( 32018, 32040 ),
				'projects'   => array( 32078, 32101 ),
				'properties' => array(),
				'agent'      => false,
				'areas'      => false,
			),
			'p1'   => array(
				'label'      => 'P1: property data-model test',
				'developers' => array(),
				'projects'   => array(),
				'properties' => array( 31013 ),
				'agent'      => true,
				'areas'      => false,
			),
			'full' => array(
				'label'      => 'Full migration',
				'developers' => 'all',
				'projects'   => 'all',
				'properties' => 'all',
				'agent'      => true,
				'areas'      => true,
			),
		);
	}

	/**
	 * Proposed amenity map: legacy property_features slug → [group, name] or null (dropped).
	 * NOT APPROVED: amenities (and the feature-to-field map below) are not migrated until this
	 * map is reviewed and the flag set. Revised 2026-10-07 (D-037).
	 */
	public const AMENITY_MAP_APPROVED = false;

	public const AMENITY_GROUPS = array(
		'home'     => 'In the home',
		'building' => 'Building and community',
		'general'  => 'General', // Neutral: says nothing about private or shared use.
	);

	/**
	 * Legacy features that are not amenities but fill a structured field: slug → [meta key, value].
	 * Applied only when that field is empty; an existing structured value is never overwritten.
	 */
	public const FEATURE_FIELD_MAP = array(
		'fully-furnished' => array( 'aa_furnishing', 'furnished' ),
	);

	public const AMENITY_MAP = array(
		'24-7-security'                  => array( 'building', '24/7 security' ),
		'back-yard'                      => array( 'home', 'Back yard' ),
		'balcony'                        => array( 'home', 'Balcony' ),
		'basketball-court'               => array( 'building', 'Basketball court' ),
		'built-in-wardrobes'             => array( 'home', 'Built-in wardrobes' ),
		'central-air'                    => array( 'home', 'Central air conditioning' ),
		'central-air-conditioning'       => array( 'home', 'Central air conditioning' ),
		'elevator'                       => array( 'building', 'Lift' ),
		'equipped-kitchen'               => array( 'home', 'Equipped kitchen' ),
		'front-yard'                     => array( 'home', 'Front yard' ),
		'fully-equipped-gym'             => array( 'building', 'Gym' ),
		'garage-attached'                => array( 'home', 'Garage' ),
		'garden'                         => array( 'home', 'Garden' ),
		'gym'                            => array( 'building', 'Gym' ),
		'laundry'                        => array( 'home', 'Laundry room' ),
		'media-room'                     => array( 'home', 'Media room' ),
		'meeting-facilities'             => array( 'building', 'Meeting rooms' ),
		'pool'                           => array( 'general', 'Swimming pool' ), // Neutral; never inferred as private.
		'private-pool'                   => array( 'home', 'Private pool' ),       // Only when the legacy feature says so explicitly.
		'sports-facilities'              => array( 'building', 'Sports facilities' ),
		'swimming-pool'                  => array( 'general', 'Swimming pool' ),
		'washer-and-dryer'               => array( 'home', 'Washer and dryer' ),
		// Dropped: US-template utilities, parent groups, marketing phrases, ambiguous items.
		'chair-accessible'               => null,
		'electricity'                    => null,
		'fireplace'                      => null,
		'heating'                        => null,
		'high-floor-with-stunning-views' => null,
		'high-end-restaurants-and-cafes' => null,
		'hot-bath'                       => null, // Ambiguous; editor to decide.
		'interior-details'               => null,
		'investor-friendly'              => null,
		'natural-gas'                    => null,
		'outdoor-details'                => null,
		'shopping-and-retail-spaces'     => null,
		'smoke-detector'                 => null,
		'smoke-detectors'                => null,
		'utilities'                      => null,
		'ventilation'                    => null,
		'water'                          => null,
		'wifi'                           => null,
	);

	/** UAE bounding box used to judge legacy coordinates. */
	public static function in_uae( float $lat, float $lng ): bool {
		return $lat >= 22.5 && $lat <= 26.5 && $lng >= 51.0 && $lng <= 56.5;
	}
}
