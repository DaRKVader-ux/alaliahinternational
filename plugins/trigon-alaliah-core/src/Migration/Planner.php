<?php
namespace Trigon\AlaliahCore\Migration;

use Trigon\AlaliahCore\Schema;
use Trigon\AlaliahCore\Domain\References;
use Trigon\AlaliahCore\Domain\PropertyUrls;

defined( 'ABSPATH' ) || exit;

/**
 * Builds the migration plan from legacy data. Pure read: the planner never writes.
 * The executor applies exactly this plan.
 */
final class Planner {

	public const VERSION = '2026-10-07.1';

	private LegacySource $src;
	private array $warnings = array();

	public function __construct( ?LegacySource $src = null ) {
		$this->src = $src ?? new LegacySource();
	}

	public function plan( string $set_name, ?array $only_ids = null ): array {
		$sets = Mapping::sets();
		if ( ! isset( $sets[ $set_name ] ) ) {
			throw new \InvalidArgumentException( "Unknown set {$set_name}. Use: " . implode( ', ', array_keys( $sets ) ) );
		}
		$set = $sets[ $set_name ];

		$all_props    = $this->src->posts( LegacySource::PROPERTY );
		$project_ids  = array_keys( Mapping::PROJECTS );
		$listing_rows = array_values( array_filter( $all_props, static fn( $p ) => ! in_array( (int) $p->ID, $project_ids, true ) ) );
		$refs         = $this->reference_map( $listing_rows );

		$pick = static function ( $wanted, array $rows ) use ( $only_ids ): array {
			$rows = array_values( array_filter( $rows, static fn( $r ) => 'all' === $wanted || in_array( (int) $r->ID, (array) $wanted, true ) ) );
			if ( null !== $only_ids ) {
				$rows = array_values( array_filter( $rows, static fn( $r ) => in_array( (int) $r->ID, $only_ids, true ) ) );
			}
			return $rows;
		};

		$developers = $pick( $set['developers'], $this->src->posts( LegacySource::DEVELOPER ) );
		$projects   = $pick( $set['projects'], array_values( array_filter( $all_props, static fn( $p ) => in_array( (int) $p->ID, $project_ids, true ) ) ) );
		$properties = $pick( $set['properties'], $listing_rows );
		$agents     = $set['agent'] ? $this->src->posts( LegacySource::AGENT ) : array();

		// Locations needed by the selected records (or all, for the full set).
		$area_term_ids = array();
		foreach ( array_merge( $projects, $properties ) as $row ) {
			foreach ( $this->src->terms( (int) $row->ID, 'property_area' ) as $t ) {
				$area_term_ids[] = (int) $t->term_id;
			}
		}
		$locations = $this->locations( 'all' === $set['properties'] ? null : array_unique( $area_term_ids ) );

		$items = array_merge(
			$locations,
			array_map( array( $this, 'developer' ), $developers ),
			array_map( array( $this, 'agent' ), $agents ),
			array_map( array( $this, 'project' ), $projects ),
			array_map( fn( $p ) => $this->property( $p, $refs[ (int) $p->ID ] ), $properties )
		);
		if ( $set['areas'] ) {
			$items = array_merge( $items, $this->area_posts( $locations ) );
		}

		return array(
			'version'    => self::VERSION,
			'set'        => $set_name,
			'set_label'  => $set['label'],
			'site'       => home_url(),
			'created'    => gmdate( 'c' ),
			'items'      => $items,
			'references' => $refs,
			'amenities'  => $this->amenity_report(),
			'redirects'  => $this->redirects( $developers, $properties, $refs ),
			'warnings'   => $this->warnings,
		);
	}

	/**
	 * Deterministic reference map for every legacy listing (not just the selected ones):
	 * ascending original publish date, ties by legacy ID, from the reserved range.
	 */
	public function reference_map( array $listing_rows ): array {
		$count = count( $listing_rows );
		$cap   = References::RESERVED_TO - References::RESERVED_FROM + 1;
		if ( $count > $cap ) {
			throw new \RuntimeException( "{$count} legacy listings exceed the reserved reference range ({$cap}). Stop and review." );
		}
		$map = array();
		$n   = References::RESERVED_FROM;
		foreach ( $listing_rows as $row ) {
			$map[ (int) $row->ID ] = References::format( $n++ );
		}
		return $map;
	}

	/** Location terms: UAE › emirate › community, with approved corrections and audited conflicts. */
	private function locations( ?array $only_area_terms ): array {
		$items = array(
			array(
				'entity' => 'location',
				'key'    => 'location:uae',
				'name'   => 'UAE',
				'slug'   => 'uae',
				'level'  => 'country',
				'parent' => null,
				'legacy_term_id' => 0,
				'audit'  => array( 'created' => 'root level for the location hierarchy' ),
			),
		);
		$cities = array();
		foreach ( $this->src->all_terms( 'property_city' ) as $c ) {
			$cities[ $c->name ] = $c;
		}

		$areas    = $this->src->all_terms( 'property_area' );
		$emirates = array();
		$planned  = array();
		foreach ( $areas as $a ) {
			if ( null !== $only_area_terms && ! in_array( (int) $a->term_id, $only_area_terms, true ) ) {
				continue;
			}
			$option     = $this->src->term_option( (int) $a->term_id );
			$cityparent = (string) ( $option['cityparent'] ?? '' );
			$listing    = $this->listing_emirates( (int) $a->term_id );
			$audit      = array( 'legacy' => array( 'term_id' => (int) $a->term_id, 'name' => $a->name, 'slug' => $a->slug, 'cityparent' => $cityparent ) );
			$emirate    = $cityparent;
			if ( 1 === count( $listing ) && $listing[0] !== $cityparent ) {
				$emirate                 = $listing[0];
				$audit['correction']     = "emirate: legacy cityparent \"{$cityparent}\" → \"{$emirate}\" (the listings' own city value)";
				$audit['original_value'] = $cityparent;
			} elseif ( count( $listing ) > 1 ) {
				$this->warnings[] = "Area {$a->name}: listings disagree on emirate (" . implode( ', ', $listing ) . '); kept the legacy cityparent.';
			}
			if ( ! isset( $cities[ $emirate ] ) ) {
				$this->warnings[] = "Area {$a->name}: emirate \"{$emirate}\" not found; skipped.";
				continue;
			}
			$emirates[ $emirate ] = $cities[ $emirate ];
			$fix                  = Mapping::AREA_FIX[ $a->slug ] ?? array();
			if ( $fix ) {
				$audit['rename'] = array( 'from' => array( $a->name, $a->slug ), 'to' => array( $fix['name'], $fix['slug'] ) );
			}
			$planned[] = array(
				'entity'         => 'location',
				'key'            => 'location:' . (int) $a->term_id,
				'name'           => $fix['name'] ?? $a->name,
				'slug'           => $fix['slug'] ?? $a->slug,
				'level'          => 'community',
				'parent'         => 'location:city:' . (int) $cities[ $emirate ]->term_id,
				'legacy_term_id' => (int) $a->term_id,
				'legacy_slug'    => $a->slug,
				'hero_id'        => $this->src->attachment_exists( (int) ( $option['category_attach_id'] ?? 0 ) ) ? (int) $option['category_attach_id'] : 0,
				'audit'          => $audit,
				'flags'          => isset( $audit['correction'] ) ? array( 'area_conflict' ) : array(),
			);
		}
		foreach ( $emirates as $name => $c ) {
			$items[] = array(
				'entity'         => 'location',
				'key'            => 'location:city:' . (int) $c->term_id,
				'name'           => $c->name,
				'slug'           => $c->slug,
				'level'          => 'emirate',
				'parent'         => 'location:uae',
				'legacy_term_id' => (int) $c->term_id,
				'legacy_slug'    => $c->slug,
				'audit'          => array( 'legacy' => array( 'taxonomy' => 'property_city', 'term_id' => (int) $c->term_id ) ),
			);
		}
		return array_merge( $items, $planned );
	}

	/** Distinct emirate names that listings in an area carry in property_city. */
	private function listing_emirates( int $area_term_id ): array {
		global $wpdb;
		$posts = $wpdb->get_col(
			$wpdb->prepare(
				"SELECT tr.object_id FROM {$wpdb->term_relationships} tr JOIN {$wpdb->term_taxonomy} tt ON tt.term_taxonomy_id = tr.term_taxonomy_id
				 WHERE tt.term_id = %d AND tt.taxonomy = 'property_area'",
				$area_term_id
			)
		);
		$names = array();
		foreach ( $posts as $pid ) {
			foreach ( $this->src->terms( (int) $pid, 'property_city' ) as $c ) {
				$names[ $c->name ] = true;
			}
		}
		return array_keys( $names );
	}

	private function area_key( int $legacy_id ): ?string {
		$t = $this->src->terms( $legacy_id, 'property_area' );
		return $t ? 'location:' . (int) $t[0]->term_id : null;
	}

	private function post_fields( object $row, string $title ): array {
		return array(
			'post_title'    => $title,
			'post_content'  => (string) $row->post_content,
			'post_name'     => sanitize_title( $title ),
			'post_date'     => $row->post_date,
			'post_date_gmt' => $row->post_date_gmt,
			'post_author'   => (int) $row->post_author,
			'post_status'   => 'draft',
		);
	}

	/** Exact text copy (trim only) for the seven required custom fields. */
	private function exact( int $id, string $key ): ?string {
		$v = trim( $this->src->meta( $id, $key ) );
		return '' === $v ? null : $v;
	}

	private function permits_from_legacy( int $id, array &$audit ): ?array {
		$legacy = $this->exact( $id, 'madhmoun-permit' );
		if ( null === $legacy ) {
			return null;
		}
		$audit['permit'] = 'Legacy madhmoun-permit "' . $legacy . '" kept exactly in aa_madhmoun_permit; recorded as an unverified entry with system "unspecified" (not public).';
		return array(
			array(
				'number'    => $legacy,
				'authority' => '',
				'system'    => 'unspecified',
				'status'    => 'unverified',
				'public'    => false,
				'source'    => '',
				'origin'    => 'legacy:madhmoun-permit',
			),
		);
	}

	public function developer( object $row ): array {
		$id    = (int) $row->ID;
		$fix   = Mapping::DEVELOPER_NAMES[ $id ] ?? null;
		$title = $fix ? $fix[0] : $row->post_title;
		$post  = $this->post_fields( $row, $title );
		$post['post_content'] = '';
		$post['post_name']    = $fix ? $fix[1] : $row->post_name;
		$thumb   = (int) $this->src->meta( $id, '_thumbnail_id' );
		$legacy  = trim( wp_strip_all_tags( (string) $row->post_content ) );
		$verified = in_array( $id, Mapping::VERIFIED_DEVELOPERS, true );
		$audit   = array( 'legacy' => array( 'post_type' => LegacySource::DEVELOPER, 'id' => $id, 'title' => $row->post_title, 'slug' => $row->post_name ) );
		if ( $fix ) {
			$audit['rename'] = "name: \"{$row->post_title}\" → \"{$title}\"; slug {$row->post_name} → {$fix[1]}";
		}
		$flags = array();
		if ( isset( Mapping::LOGO_FINDINGS[ $id ] ) ) {
			$flags[]        = 'logo_quality';
			$audit['logo'] = Mapping::LOGO_FINDINGS[ $id ];
		}
		return array(
			'entity'    => 'developer',
			'post_type' => Schema::DEVELOPER,
			'key'       => 'developer:' . $id,
			'legacy_id' => $id,
			'title'     => $title,
			'post'      => $post,
			'meta'      => array(
				'aa_logo_id'        => $this->src->attachment_exists( $thumb ) ? $thumb : null,
				'aa_about_legacy'   => '' === $legacy ? null : $legacy,
				'aa_review_status'  => $verified ? 'verified' : 'needs-review',
				'aa_review_note'    => $verified ? 'Identity corroborated by explicit project content on this site (Stage 03.2 report §9).' : 'No explicit corroborating content on this site; About and logo still need sourcing.',
				'aa_legacy_slug'    => $row->post_name,
			),
			'links'     => array(),
			'terms'     => array(),
			'flags'     => $flags,
			'audit'     => $audit,
		);
	}

	public function agent( object $row ): array {
		$id = (int) $row->ID;
		return array(
			'entity'    => 'agent',
			'post_type' => Schema::AGENT,
			'key'       => 'agent:' . $id,
			'legacy_id' => $id,
			'title'     => $row->post_title,
			'post'      => $this->post_fields( $row, $row->post_title ),
			'meta'      => array(
				'aa_is_office' => true,
				'aa_role'      => $this->exact( $id, 'agent_position' ),
				'aa_phone'     => $this->exact( $id, 'agent_phone' ),
				'aa_mobile'    => $this->exact( $id, 'agent_mobile' ),
				'aa_email'     => $this->exact( $id, 'agent_email' ),
			),
			'private'   => array( 'aa_phone', 'aa_mobile', 'aa_email' ),
			'thumbnail' => (int) $this->src->meta( $id, '_thumbnail_id' ),
			'links'     => array(),
			'terms'     => array(),
			'flags'     => array(),
			'audit'     => array( 'legacy' => array( 'post_type' => LegacySource::AGENT, 'id' => $id ), 'note' => 'Company office contact; individual agent profiles are client content (Q9).' ),
		);
	}

	public function project( object $row ): array {
		$id    = (int) $row->ID;
		$conf  = Mapping::PROJECTS[ $id ];
		$audit = array(
			'legacy'       => array( 'post_type' => LegacySource::PROPERTY, 'id' => $id, 'title' => $row->post_title, 'slug' => $row->post_name ),
			'relationship' => $conf['note'],
		);
		$flags = $conf['flags'];
		$notes = trim( $this->src->meta( $id, 'property-external-construction' ) );
		if ( '' !== $notes ) {
			$audit['legacy_notes'] = array( 'property-external-construction' => $notes );
			$flags[]               = 'legacy_notes_to_merge';
		}
		$dropped = array();
		foreach ( array( 'property_price', 'property_bedrooms', 'property_bathrooms', 'property_size' ) as $k ) {
			$dropped[ $k ] = $this->src->meta( $id, $k );
		}
		$audit['dropped_unit_values'] = $dropped;
		$audit['legacy_type']         = wp_list_pluck( $this->src->terms( $id, 'property_category' ), 'name' );
		$permits = $this->permits_from_legacy( $id, $audit );

		return array(
			'entity'    => 'project',
			'post_type' => Schema::PROJECT,
			'key'       => 'project:' . $id,
			'legacy_id' => $id,
			'title'     => $conf['name'],
			'post'      => $this->post_fields( $row, $conf['name'] ),
			'meta'      => array(
				'aa_property_agency'             => $this->exact( $id, 'property-agency' ),
				'aa_handover'                    => $this->exact( $id, 'property-handover' ),
				'aa_payment_plan_overall'        => $this->exact( $id, 'overall-payment-plan' ),
				'aa_payment_on_booking'          => $this->exact( $id, 'payment-on-booking' ),
				'aa_payment_during_construction' => $this->exact( $id, 'payment-during-construction' ),
				'aa_payment_on_handover'         => $this->exact( $id, 'payment-on-handover' ),
				'aa_madhmoun_permit'             => $this->exact( $id, 'madhmoun-permit' ),
				'aa_permits'                     => $permits,
				'aa_gallery'                     => $this->gallery( $id ),
				'aa_review_status'               => $conf['identity'],
				'aa_review_note'                 => $conf['note'],
			),
			'thumbnail' => (int) $this->src->meta( $id, '_thumbnail_id' ),
			// Only approved links (T1, T2). The agency field is never used here.
			'links'     => $conf['link'] ? array( 'aa_developer_id' => 'developer:' . $conf['developer'] ) : array(),
			'terms'     => array( Schema::TAX_COMPLETION => array( 'off-plan' ) ),
			'location'  => $this->area_key( $id ),
			'flags'     => $flags,
			'audit'     => $audit,
		);
	}

	private function gallery( int $id ): ?array {
		$ids     = $this->src->gallery( $id );
		$present = array_values( array_filter( $ids, array( $this->src, 'attachment_exists' ) ) );
		if ( count( $present ) !== count( $ids ) ) {
			$this->warnings[] = "Legacy {$id}: " . ( count( $ids ) - count( $present ) ) . ' gallery attachment(s) missing; not referenced.';
		}
		return $present ? $present : null;
	}

	public function property( object $row, string $reference ): array {
		$id     = (int) $row->ID;
		$action = $this->src->terms( $id, 'property_action_category' );
		$map    = $action ? ( Mapping::ACTION[ $action[0]->slug ] ?? null ) : null;
		$type   = $this->src->terms( $id, 'property_category' );
		$status = array_values( array_filter( array_map( static fn( $t ) => Mapping::STATUS[ $t->slug ] ?? null, $this->src->terms( $id, 'property_status' ) ) ) );
		$flags  = Mapping::RECORD_FLAGS[ $id ] ?? array();
		$audit  = array( 'legacy' => array( 'post_type' => LegacySource::PROPERTY, 'id' => $id, 'title' => $row->post_title, 'slug' => $row->post_name ) );

		$terms = array( Schema::TAX_CATEGORY => array( 'residential' ) );
		if ( $map ) {
			$terms[ Schema::TAX_PURPOSE ]    = array( $map[0] );
			$terms[ Schema::TAX_COMPLETION ] = array( $map[1] );
		} else {
			$this->warnings[] = "Legacy {$id}: no purpose mapping.";
		}
		if ( $type && isset( Mapping::TYPE[ $type[0]->slug ] ) ) {
			$terms[ Schema::TAX_TYPE ] = array( Mapping::TYPE[ $type[0]->slug ] );
		}
		$terms[ Schema::TAX_STATUS ] = $status ? array( $status[0] ) : array( 'available' );
		$audit['legacy_status']      = wp_list_pluck( $this->src->terms( $id, 'property_status' ), 'name' );

		$int   = static fn( string $v ): ?int => ( is_numeric( $v ) && (int) $v > 0 ) ? (int) $v : null;
		$intz  = static fn( string $v ): ?int => is_numeric( $v ) ? (int) $v : null;
		$float = static fn( string $v ): ?float => ( is_numeric( $v ) && (float) $v > 0 ) ? (float) $v : null;

		$rent_period = null;
		if ( $map && 'rent' === $map[0] ) {
			$label       = strtolower( trim( $this->src->meta( $id, 'property_label_before' ) ) );
			$rent_period = 'yearly';
			if ( 'yearly' !== $label ) {
				$flags[] = 'rent_period_assumed';
			}
		}

		$lat = (float) $this->src->meta( $id, 'property_latitude' );
		$lng = (float) $this->src->meta( $id, 'property_longitude' );
		if ( ( 0.0 !== $lat || 0.0 !== $lng ) && ! Mapping::in_uae( $lat, $lng ) ) {
			$flags[]                    = 'invalid_legacy_coordinates';
			$audit['legacy_coordinates'] = array( $lat, $lng );
		}
		if ( isset( Mapping::LOCATION_PROPOSALS[ $id ] ) ) {
			$audit['location_proposal'] = Mapping::LOCATION_PROPOSALS[ $id ];
		}
		$audit['legacy_values'] = array(
			'property_price'    => $this->src->meta( $id, 'property_price' ),
			'property_size'     => $this->src->meta( $id, 'property_size' ),
			'property_features' => wp_list_pluck( $this->src->terms( $id, 'property_features' ), 'slug' ),
		);
		$permits = $this->permits_from_legacy( $id, $audit );

		return array(
			'entity'    => 'property',
			'post_type' => Schema::PROPERTY,
			'key'       => 'property:' . $id,
			'legacy_id' => $id,
			'title'     => $row->post_title,
			'reference' => $reference,
			'post'      => $this->post_fields( $row, $row->post_title ),
			'meta'      => array(
				'aa_price'                       => $int( $this->src->meta( $id, 'property_price' ) ),
				'aa_rent_period'                 => $rent_period,
				'aa_bedrooms'                    => $intz( $this->src->meta( $id, 'property_bedrooms' ) ),
				'aa_bathrooms'                   => $intz( $this->src->meta( $id, 'property_bathrooms' ) ),
				'aa_size_builtup'                => $float( $this->src->meta( $id, 'property_size' ) ),
				'aa_is_featured'                 => '1' === $this->src->meta( $id, 'prop_featured' ),
				'aa_geo_precision'               => 'community',
				'aa_property_agency'             => $this->exact( $id, 'property-agency' ),
				'aa_handover'                    => $this->exact( $id, 'property-handover' ),
				'aa_payment_plan_overall'        => $this->exact( $id, 'overall-payment-plan' ),
				'aa_payment_on_booking'          => $this->exact( $id, 'payment-on-booking' ),
				'aa_payment_during_construction' => $this->exact( $id, 'payment-during-construction' ),
				'aa_payment_on_handover'         => $this->exact( $id, 'payment-on-handover' ),
				'aa_madhmoun_permit'             => $this->exact( $id, 'madhmoun-permit' ),
				'aa_permits'                     => $permits,
				'aa_gallery'                     => $this->gallery( $id ),
			),
			'thumbnail' => (int) $this->src->meta( $id, '_thumbnail_id' ),
			'links'     => array( 'aa_agent_id' => ( $agent = (int) $this->src->meta( $id, 'property_agent' ) ) ? 'agent:' . $agent : null ),
			'terms'     => $terms,
			'location'  => $this->area_key( $id ),
			'flags'     => array_values( array_unique( $flags ) ),
			'audit'     => $audit,
		);
	}

	/** Draft Area posts for every emirate and community term (full set only). */
	private function area_posts( array $locations ): array {
		$out = array();
		foreach ( $locations as $loc ) {
			if ( ! in_array( $loc['level'], array( 'emirate', 'community' ), true ) ) {
				continue;
			}
			$out[] = array(
				'entity'    => 'area',
				'post_type' => Schema::AREA,
				'key'       => 'area:' . $loc['key'],
				'legacy_id' => (int) $loc['legacy_term_id'],
				'title'     => $loc['name'],
				'post'      => array(
					'post_title'   => $loc['name'],
					'post_content' => '',
					'post_name'    => $loc['slug'],
					'post_status'  => 'draft',
				),
				'meta'      => array( 'aa_hero_id' => ! empty( $loc['hero_id'] ) ? $loc['hero_id'] : null ),
				'links'     => array( 'aa_location_term_id' => $loc['key'] ),
				'terms'     => array(),
				'flags'     => array(),
				'audit'     => array( 'source' => 'location term ' . $loc['key'] ),
			);
		}
		return $out;
	}

	private function amenity_report(): array {
		$unmapped = array();
		foreach ( $this->src->all_terms( 'property_features' ) as $t ) {
			if ( ! array_key_exists( $t->slug, Mapping::AMENITY_MAP ) ) {
				$unmapped[] = $t->slug;
			}
		}
		return array(
			'approved' => Mapping::AMENITY_MAP_APPROVED,
			'note'     => Mapping::AMENITY_MAP_APPROVED ? 'Approved map applied.' : 'Proposed map only: amenities are NOT migrated until the map is approved.',
			'proposal' => Mapping::AMENITY_MAP,
			'unmapped' => $unmapped,
		);
	}

	/** Planned redirects; generated with the same URL rule as live permalinks. */
	private function redirects( array $developers, array $properties, array $refs ): array {
		$out = array();
		foreach ( $properties as $p ) {
			$out[] = array( 'from' => '/properties/' . $p->post_name . '/', 'to' => PropertyUrls::planned( $p->post_title, $refs[ (int) $p->ID ] ) );
		}
		foreach ( $developers as $d ) {
			$slug  = isset( Mapping::DEVELOPER_NAMES[ (int) $d->ID ] ) ? Mapping::DEVELOPER_NAMES[ (int) $d->ID ][1] : $d->post_name;
			$out[] = array( 'from' => '/estate_developer/' . $d->post_name . '/', 'to' => home_url( '/developers/' . $slug . '/' ) );
		}
		return $out;
	}
}
