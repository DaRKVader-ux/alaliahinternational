<?php
/**
 * TEST ONLY: builds stand-in WPResidence data on a local site, shaped like staging
 * (same legacy IDs, timestamps, taxonomies, field values and quirks recorded in the
 * Stage 03.2 report). Images are generated placeholders. Never run on staging.
 *
 * Run: wp eval-file tests/fixtures/legacy-fixture.php
 */

if ( false !== strpos( home_url(), 'trigonsolutions' ) || false !== strpos( home_url(), 'alaliahinternational.com' ) ) {
	fwrite( STDERR, "Refusing to build fixtures on a real site.\n" );
	exit( 1 );
}

function aa_fx_image( string $label, int $w = 1280, int $h = 960, int $parent = 0, int $import_id = 0 ): int {
	static $n = 0;
	$up = wp_upload_dir();
	$n++;
	$file = $up['path'] . '/fx-' . sanitize_title( $label ) . '-' . $n . '.jpg';
	$im   = imagecreatetruecolor( 40, 30 );
	imagefill( $im, 0, 0, imagecolorallocate( $im, 200 - ( $n % 50 ), 210, 220 ) );
	imagejpeg( $im, $file, 60 );
	imagedestroy( $im );
	$args = array( 'post_mime_type' => 'image/jpeg', 'post_title' => $label, 'post_status' => 'inherit', 'post_parent' => $parent );
	if ( $import_id ) {
		$args['import_id'] = $import_id;
	}
	$id = wp_insert_attachment( $args, $file, $parent );
	update_post_meta( $id, '_wp_attachment_metadata', array( 'width' => $w, 'height' => $h, 'file' => _wp_relative_upload_path( $file ) ) );
	return (int) $id;
}

$term = static function ( string $tax, string $name, string $slug ): int {
	$t = get_term_by( 'slug', $slug, $tax );
	if ( $t ) {
		return (int) $t->term_id;
	}
	$r = wp_insert_term( $name, $tax, array( 'slug' => $slug ) );
	return (int) $r['term_id'];
};

// Cities and areas (cityparent kept exactly as on staging, incl. Al Reef Downtown → Dubai).
$city = array( 'abu-dhabi' => $term( 'property_city', 'Abu Dhabi', 'abu-dhabi' ), 'dubai' => $term( 'property_city', 'Dubai', 'dubai' ) );
$areas_def = array(
	'al-khalidiya'     => array( 'Al Khalidiya', 'Abu Dhabi', true ),
	'al-raha'          => array( 'Al Raha', 'Abu Dhabi', true ),
	'al-reef-downtown' => array( 'Al Reef Downtown', 'Dubai', false ),
	'al-reem'          => array( 'Al Reem Island', 'Abu Dhabi', true ),
	'business-bay'     => array( 'Business Bay', 'Dubai', true ),
	'dubai-creek'      => array( 'Dubai Creek', 'Dubai', true ),
	'dip'              => array( 'Dubai Investment Park', 'Dubai', true ),
	'dubai-south'      => array( 'Dubai South', 'Dubai', false ),
	'jbr'              => array( 'Jumairah Beach Residence', 'Dubai', true ),
	'khalifa-city'     => array( 'Khalifa City', 'Abu Dhabi', true ),
	'madinat-al-riyad' => array( 'Madinat Al Riyad', 'Abu Dhabi', true ),
	'sadiyat'          => array( 'Sadiyat Island', 'Abu Dhabi', true ),
	'yas-island'       => array( 'Yas Island', 'Abu Dhabi', true ),
);
$area = array();
foreach ( $areas_def as $slug => list( $name, $parent, $img ) ) {
	$area[ $slug ] = $term( 'property_area', $name, $slug );
	update_option( 'taxonomy_' . $area[ $slug ], array( 'cityparent' => $parent, 'category_attach_id' => $img ? (string) aa_fx_image( 'area ' . $name, 1600, 900 ) : '', 'category_tax' => 'property_area' ) );
}
foreach ( array( 'off-plan' => 'Off Plan', 'sell' => 'Ready', 'rent' => 'Rent' ) as $s => $nme ) {
	$term( 'property_action_category', $nme, $s );
}
foreach ( array( 'apartments' => 'Apartments', 'townhouse' => 'Townhouse', 'villa' => 'Villa' ) as $s => $nme ) {
	$term( 'property_category', $nme, $s );
}
foreach ( array( 'active' => 'Active', 'hot-offer' => 'hot offer', 'new-offer' => 'new offer', 'sold' => 'Sold' ) as $s => $nme ) {
	$term( 'property_status', $nme, $s );
}
foreach ( array( 'balcony', 'garden', 'pool', 'gym', 'wifi', 'heating', 'investor-friendly', 'rooftop-terrace' ) as $s ) {
	$term( 'property_features', ucwords( str_replace( '-', ' ', $s ) ), $s );
}
$term( 'property_county_state', 'United Arab Emirates', 'united-arab-emirates' );

// Agent (contact values are test placeholders).
$agent = wp_insert_post( array( 'import_id' => 30966, 'post_type' => 'estate_agent', 'post_status' => 'publish', 'post_title' => 'Al Aliah International', 'post_content' => 'Agency.' ) );
foreach ( array( 'agent_phone' => '+971 0 000 0000 (test)', 'agent_mobile' => '+971 50 000 0000 (test)', 'agent_email' => 'test@example.invalid', 'agent_position' => 'Agency' ) as $k => $v ) {
	update_post_meta( $agent, $k, $v );
}

// Developers (17), with legacy text exactly as described in the report where it existed.
$devs = array(
	31714 => array( 'Burtville Developments', 'burtville-developments', '', array( 183, 51 ) ),
	32010 => array( 'Reportage Properties', 'reportage-properties', '', array( 408, 280 ) ),
	32013 => array( 'Nine Yards Developments', 'nine-yards-developments', '', array( 200, 200 ) ),
	32016 => array( 'Saas Properties', 'saas-properties', '', array( 1376, 1376 ) ),
	32018 => array( 'Danube Properties', 'danube-properties', '', array( 500, 500 ) ),
	32020 => array( 'Emaar Properties', 'emaar-properties', '', array( 2560, 1440 ) ),
	32022 => array( 'Damac Properties', 'damac-properties', '', array( 500, 500 ) ),
	32024 => array( 'Nakheel', 'nakheel', '', array( 482, 334 ) ),
	32026 => array( 'Sobha Realty', 'sobha-realty', '', array( 2560, 1809 ) ),
	32028 => array( 'Meraas', 'meraas', 'A developer creating vibrant lifestyle destinations and urban communities', array( 770, 770 ) ),
	32030 => array( 'Dubai Properties', 'dubai-properties', 'A major developer delivering large-scale residential and mixed-use developments', array( 350, 200 ) ),
	32034 => array( 'Azizi Developements', 'azizi-developements', 'A leading developer offering a wide range of residential and investment properties', array( 591, 293 ) ),
	32036 => array( 'Ellington Properties', 'ellington-properties', 'A design-led boutique developer focused on stylish and high-quality homes', array( 356, 142 ) ),
	32038 => array( 'MAG Property Development', 'mag-property-development', 'A diversified developer delivering residential, commercial, and mixed-use projects', array( 366, 202 ) ),
	32040 => array( 'Binghatti Developers', 'binghatti-developers', 'A developer known for distinctive architecture and branded collaborations', array( 428, 229 ) ),
	32043 => array( 'Omniyat', 'omniyat', 'An ultra-luxury developer creating iconic and design-driven properties.', array( 800, 800 ) ),
	32045 => array( 'Arada', 'arada', 'A modern developer delivering community-focused residential projects in the UAE', array( 1500, 1500 ) ),
);
foreach ( $devs as $id => list( $title, $slug, $content, $size ) ) {
	$pid = wp_insert_post( array( 'import_id' => $id, 'post_type' => 'estate_developer', 'post_status' => 'publish', 'post_title' => $title, 'post_name' => $slug, 'post_content' => $content, 'post_date' => '2026-04-06 12:00:00' ) );
	update_post_meta( $pid, 'developer_website', '' );
}

// Properties (14).
$P = array(
	30964 => array( 'Luxurious Studio for Sale Prime Location Best Investment Offer', 'stunning-2bhk-apartment', '2026-02-28 08:03:29', 1, 'sell', 'apartments', 'abu-dhabi', 'al-reef-downtown', array( 'active' ), '699000', '', '1', '1', '480.07', array( '40.70787749575', '-74.010885357857' ), '0', array(), 24 ),
	30967 => array( 'Fully Furnished Luxury 4 Master Bedroom with Private Pool', 'fully-furnished-luxury-4-master-bedroom-with-private-pool', '2026-03-03 06:40:56', 1, 'rent', 'apartments', 'abu-dhabi', 'al-raha', array( 'active', 'hot-offer' ), '280000', '', '4', '5', '0', array( '0', '0' ), '0', array(), 11 ),
	31002 => array( 'Stunning 2BHK with Balcony | Newly Renovated Apartment', 'stunning-2bhk-with-balcony-newly-renovated-apartment', '2026-03-03 07:05:59', 1, 'rent', 'apartments', 'abu-dhabi', 'al-khalidiya', array( 'active', 'new-offer' ), '80000', 'Yearly', '2', '2', '1100', array( '0', '0' ), '1', array(), 9 ),
	31013 => array( 'Fully Furnished 1bd | Marina Square | Vacant', 'fully-furnished-1bd-marina-square-vacant', '2026-03-03 07:17:04', 1, 'rent', 'apartments', 'abu-dhabi', 'al-reem', array( 'active' ), '105000', '', '1', '2', '915', array( '0', '0' ), '0', array(), 9 ),
	31023 => array( 'Spacious 5-bedroom Villa with Parking | Prime Location', 'spacious-5-bedroom-villa-with-parking-prime-location', '2026-03-03 07:29:17', 1, 'rent', 'apartments', 'abu-dhabi', 'al-khalidiya', array( 'active' ), '180000', '', '5', '5', '2400', array( '0', '0' ), '1', array(), 31 ),
	31082 => array( 'Investor Deal | 2BR Apartment | High ROI | Al Reef Downtown', 'investor-deal-2br-apartment-high-roi-al-reef-downtown', '2026-03-03 09:01:43', 1, 'sell', 'apartments', 'abu-dhabi', 'al-reef-downtown', array( 'active' ), '1170000', '', '2', '2', '1354', array( '0', '0' ), '0', array(), 'shared' ),
	31083 => array( 'Luxurious 4 Bd Townhouse | Private Pool | 10% discount', 'luxurious-4-bd-townhouse-private-pool-10-discount', '2026-03-03 10:51:47', 1, 'off-plan', 'townhouse', 'abu-dhabi', 'khalifa-city', array( 'active', 'hot-offer' ), '3936708', '', '4', '4', '4075', array( '0', '0' ), '0', array(), 10 ),
	31094 => array( 'Luxury Apartment | Beach Access | Invest Now', 'luxury-apartment-beach-access-invest-now', '2026-03-03 11:01:53', 1, 'off-plan', 'apartments', 'abu-dhabi', 'al-raha', array( 'active', 'hot-offer' ), '3481025', '', '2', '3', '1157', array( '0', '0' ), '0', array( 'property-handover' => 'Q1 2029', 'overall-payment-plan' => '85/15', 'payment-on-booking' => '10%', 'payment-during-construction' => '75%', 'payment-on-handover' => '15%' ), 13 ),
	31495 => array( 'Premium 5 Master Bedroom Villa for Sale | Exclusive Offer', 'premium-5-master-bedroom-villa-for-sale-exclusive-offer', '2026-03-10 09:24:11', 1, 'sell', 'villa', 'abu-dhabi', 'madinat-al-riyad', array( 'active' ), '3800000', '', '5', '6', '11510', array( '0', '0' ), '1', array( 'property-agency' => 'Al Aliah international Real Estate' ), 24 ),
	31521 => array( '5 Master Bedroom + Maid Villa Spacious Backyard', '5-master-bedroom-maid-villa-spacious-backyard', '2026-03-10 10:24:14', 3, 'rent', 'villa', 'abu-dhabi', 'yas-island', array( 'active' ), '420000', '', '5', '6', '5948', array( '0', '0' ), '0', array( 'property-agency' => 'Al Aliah International Real Estate' ), 49 ),
	31571 => array( 'Lavish spacious 3BR + Balcony | Ready to move | Premium quality', 'lavish-spacious-3br-balcony-ready-to-move-premium-quality', '2026-03-10 10:42:52', 1, 'rent', 'villa', 'abu-dhabi', 'al-raha', array( 'active' ), '219999', '', '3', '5', '1979', array( '0', '0' ), '0', array( 'property-agency' => 'Al Aliah International Real Estate' ), 36 ),
	32060 => array( 'Premium Luxury Waterfront Villas for Sale in Azizi Venice | Exclusive Offer', 'premium-luxury-waterfront-villas-for-sale-in-azizi-venice-exclusive-offer', '2026-04-08 17:57:21', 1, 'off-plan', 'apartments', 'dubai', 'dubai-south', array(), '', '', '3', '3', '1500', array( '0', '0' ), '0', array( 'property-agency' => 'Rainbow Properties', 'property-external-construction' => 'Azizi Venice is a large-scale development with 18 km of artificial waves and water features.' ), 16 ),
	32078 => array( 'Premium 1-4 Bedroom Apartments at Bayz 102 | Exclusive Offer', 'premium-1-4-bedroom-apartments-at-bayz-102-exclusive-offer', '2026-04-08 18:16:25', 1, 'off-plan', 'apartments', 'dubai', 'business-bay', array(), '', '', '0', '0', '0', array( '0', '0' ), '0', array( 'property-agency' => 'Danube Properties', 'property-handover' => 'June 2029', 'overall-payment-plan' => '70/30', 'payment-during-construction' => '70%', 'payment-on-handover' => '30%', 'property-external-construction' => 'The building features luxury 1-4 bedroom apartments.' ), 18 ),
	32101 => array( 'Premium Luxury Apartments at Binghatti Aquarise | Exclusive Offer', 'premium-luxury-apartments-at-binghatti-aquarise-exclusive-offer', '2026-04-08 19:19:32', 1, 'off-plan', 'apartments', 'dubai', 'business-bay', array(), '', '', '0', '0', '0', array( '0', '0' ), '0', array( 'property-agency' => 'Binghatti Properties', 'property-handover' => 'Q2, 2027', 'madhmoun-permit' => '123564', 'overall-payment-plan' => '70/30 ', 'payment-on-booking' => '20% ', 'payment-during-construction' => '50% ', 'payment-on-handover' => '30% ', 'property-external-construction' => 'Binghatti Aquarise is located in Business Bay.' ), 8 ),
);
$content = array(
	31013 => 'Spacious 1 Bedroom Furnished Apartment available for rent in Marina Blue Tower, located in the heart of Marina Square. (Stand-in test data.)',
	31083 => 'Townhouse community in Khalifa City. Payment Plan 70 / 30 Handover Q3 2028. (Stand-in test data.)',
	32078 => 'Bayz 102 is a 102-storey residential building. The project by Danube Properties in Business Bay. (Stand-in test data.)',
);
foreach ( $P as $id => $d ) {
	list( $title, $slug, $date, $author, $action, $cat, $c, $a, $statuses, $price, $label, $beds, $baths, $size, $coords, $featured, $extra, $gallery ) = $d;
	$pid = wp_insert_post(
		array(
			'import_id'     => $id,
			'post_type'     => 'estate_property',
			'post_status'   => 'publish',
			'post_title'    => $title,
			'post_name'     => $slug,
			'post_date'     => $date,
			'post_date_gmt' => $date,
			'post_author'   => $author,
			'post_content'  => $content[ $id ] ?? 'Listing description. (Stand-in test data.)',
		)
	);
	wp_set_object_terms( $pid, array( $action ), 'property_action_category' );
	wp_set_object_terms( $pid, array( $cat ), 'property_category' );
	wp_set_object_terms( $pid, array( $c ), 'property_city' );
	wp_set_object_terms( $pid, array( $a ), 'property_area' );
	wp_set_object_terms( $pid, $statuses, 'property_status' );
	wp_set_object_terms( $pid, array( 'balcony', 'wifi', 'investor-friendly' ), 'property_features' );
	$meta = array(
		'property_price'        => $price,
		'property_label_before' => $label,
		'property_bedrooms'     => $beds,
		'property_bathrooms'    => $baths,
		'property_size'         => $size,
		'property_latitude'     => $coords[0],
		'property_longitude'    => $coords[1],
		'prop_featured'         => $featured,
		'property_agent'        => '30966',
		'property_internal_id'  => '',
		'mls'                   => '',
		'page_header_type'      => '0',
		'property-agency'       => '',
		'property-handover'     => '',
		'overall-payment-plan'  => '',
	);
	foreach ( array_merge( $meta, $extra ) as $k => $v ) {
		update_post_meta( $pid, $k, $v );
	}
}

// Attachments only after every legacy-ID post exists, so import_id never collides with an image ID.
update_post_meta( $agent, '_thumbnail_id', aa_fx_image( 'agent logo', 400, 400, $agent ) );
foreach ( $devs as $id => list( $title, $slug, $content_unused, $size ) ) {
	update_post_meta( $id, '_thumbnail_id', aa_fx_image( 'logo ' . $title, $size[0], $size[1], $id ) );
}
$galleries = array();
foreach ( $P as $pid => $d ) {
	$gallery = $d[17];
	if ( 'shared' === $gallery ) {
		$ids = array_slice( $galleries[30964], 0, 23 ); // Same photos as the studio, parented to it.
	} else {
		$ids = array();
		for ( $i = 0; $i < $gallery; $i++ ) {
			$ids[] = aa_fx_image( 'photo ' . $pid . ' ' . $i, 1280, 960, $pid );
		}
	}
	$galleries[ $pid ] = $ids;
	update_post_meta( $pid, 'wpestate_property_gallery', array_map( 'strval', $ids ) );
	update_post_meta( $pid, 'image_to_attach', implode( ',', $ids ) . ',' );
	update_post_meta( $pid, '_thumbnail_id', $ids[0] );
}

// Every legacy ID must be exact; a silent reassignment would invalidate the tests.
foreach ( array_merge( array( 30966 ), array_keys( $devs ), array_keys( $P ) ) as $expect ) {
	if ( 0 !== strpos( (string) get_post_type( $expect ), 'estate_' ) ) {
		fwrite( STDERR, "Legacy ID {$expect} was not created as expected.\n" );
		exit( 1 );
	}
}

// Demo reviews (never migrated) and an unrelated page with an image, to prove they stay untouched.
wp_insert_post( array( 'post_type' => 'estate_review', 'post_status' => 'publish', 'post_title' => 'Demo review', 'post_content' => 'Theme demo.' ) );
$page = wp_insert_post( array( 'post_type' => 'page', 'post_status' => 'publish', 'post_title' => 'Homepage', 'post_content' => 'Legacy page.' ) );
aa_fx_image( 'homepage logo strip', 183, 51, $page );

echo 'Fixture built: ' . count( $P ) . " properties, 17 developers, 1 agent.\n";
