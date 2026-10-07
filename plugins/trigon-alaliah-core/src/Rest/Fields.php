<?php
namespace Trigon\AlaliahCore\Rest;

use Trigon\AlaliahCore\Schema;
use Trigon\AlaliahCore\Domain\Relations;
use Trigon\AlaliahCore\Domain\Permits;
use Trigon\AlaliahCore\Domain\FloorPlans;
use Trigon\AlaliahCore\Domain\PropertyUrls;
use Trigon\AlaliahCore\Domain\DeveloperReadiness;
use Trigon\AlaliahCore\Domain\Quality;

defined( 'ABSPATH' ) || exit;

/**
 * Read-only REST representation with public field names. Internal aa_* keys, legacy IDs,
 * legacy text, migration data and unverified permits are never included.
 */
final class Fields {

	public const FIELD = 'alaliah';

	public static function hooks(): void {
		add_action( 'rest_api_init', array( self::class, 'register' ) );
		// Property REST links use the same URL function as everything else.
		add_filter( 'rest_prepare_' . Schema::PROPERTY, array( self::class, 'fix_link' ), 10, 2 );
	}

	public static function register(): void {
		foreach ( array( Schema::PROPERTY, Schema::PROJECT, Schema::DEVELOPER, Schema::AGENT, Schema::AREA ) as $type ) {
			register_rest_field(
				$type,
				self::FIELD,
				array(
					'get_callback' => static fn( array $obj, string $field, \WP_REST_Request $req ) => self::data( (int) $obj['id'], 'edit' === $req->get_param( 'context' ) ),
					'schema'       => array(
						'description' => 'Al Aliah data (public field names).',
						'type'        => 'object',
						'context'     => array( 'view', 'edit' ),
						'readonly'    => true,
					),
				)
			);
		}
	}

	public static function fix_link( \WP_REST_Response $response, \WP_Post $post ): \WP_REST_Response {
		$data = $response->get_data();
		if ( isset( $data['link'] ) ) {
			$url = PropertyUrls::permalink( $post->ID );
			if ( $url ) {
				$data['link'] = $url;
				$response->set_data( $data );
			}
		}
		return $response;
	}

	private static function terms( int $id, string $tax ): array {
		$terms = wp_get_object_terms( $id, $tax );
		if ( is_wp_error( $terms ) ) {
			return array();
		}
		return array_map( static fn( $t ) => array( 'name' => $t->name, 'slug' => $t->slug ), $terms );
	}

	private static function term_slug( int $id, string $tax ): ?string {
		$t = self::terms( $id, $tax );
		return $t ? $t[0]['slug'] : null;
	}

	/** Location path from the root, e.g. UAE › Abu Dhabi › Al Reem Island. */
	public static function location_path( int $id ): array {
		$terms = wp_get_object_terms( $id, Schema::TAX_LOCATION );
		if ( is_wp_error( $terms ) || ! $terms ) {
			return array();
		}
		$deepest = $terms[0];
		foreach ( $terms as $t ) {
			if ( count( get_ancestors( $t->term_id, Schema::TAX_LOCATION, 'taxonomy' ) ) > count( get_ancestors( $deepest->term_id, Schema::TAX_LOCATION, 'taxonomy' ) ) ) {
				$deepest = $t;
			}
		}
		$chain = array_reverse( get_ancestors( $deepest->term_id, Schema::TAX_LOCATION, 'taxonomy' ) );
		$chain[] = $deepest->term_id;
		return array_map(
			static function ( $tid ) {
				$t = get_term( $tid, Schema::TAX_LOCATION );
				return array( 'name' => $t->name, 'slug' => $t->slug, 'level' => (string) get_term_meta( $tid, 'aa_level', true ) );
			},
			$chain
		);
	}

	private static function ref( int $id ): ?array {
		if ( ! $id || ! get_post( $id ) ) {
			return null;
		}
		return array(
			'id'     => $id,
			'title'  => get_the_title( $id ),
			'status' => get_post_status( $id ),
			'link'   => get_permalink( $id ),
		);
	}

	public static function data( int $id, bool $edit = false ): array {
		$type = get_post_type( $id );
		$out  = array();
		foreach ( Schema::meta_fields_for( $type ) as $key => $def ) {
			if ( empty( $def['public'] ) ) {
				continue;
			}
			$v = get_post_meta( $id, $key, true );
			if ( '' === $v || null === $v || array() === $v ) {
				continue;
			}
			$out[ $def['public'] ] = $v;
		}

		if ( Schema::PROPERTY === $type || Schema::PROJECT === $type ) {
			$out['location']    = self::location_path( $id );
			$out['completion']  = self::term_slug( $id, Schema::TAX_COMPLETION );
			$out['amenities']   = self::terms( $id, Schema::TAX_AMENITY );
			$out['developer']   = self::ref( Relations::effective_developer( $id ) );
			$out['permits']     = Permits::public_entries( $id );
			$out['floor_plans'] = FloorPlans::for_display( $id );
			$gallery            = get_post_meta( $id, 'aa_gallery', true );
			$out['gallery']     = array_map(
				static fn( $att ) => array(
					'id'  => (int) $att,
					'url' => (string) wp_get_attachment_image_url( (int) $att, 'large' ),
					'alt' => (string) get_post_meta( (int) $att, '_wp_attachment_image_alt', true ),
				),
				is_array( $gallery ) ? $gallery : array()
			);
		}
		if ( Schema::PROPERTY === $type ) {
			$out['purpose']  = self::term_slug( $id, Schema::TAX_PURPOSE );
			$out['status']   = self::term_slug( $id, Schema::TAX_STATUS );
			$out['type']     = self::term_slug( $id, Schema::TAX_TYPE );
			$out['category'] = self::term_slug( $id, Schema::TAX_CATEGORY );
			$out['project']  = self::ref( Relations::project_of( $id ) );
			$out['agent']    = self::ref( (int) get_post_meta( $id, 'aa_agent_id', true ) );
			$out['url']      = PropertyUrls::permalink( $id );
		}
		if ( Schema::PROJECT === $type ) {
			$out['units'] = array_values( array_filter( array_map( array( self::class, 'ref' ), Relations::units_of( $id ) ) ) );
		}
		if ( Schema::DEVELOPER === $type ) {
			$logo                    = (int) get_post_meta( $id, 'aa_logo_id', true );
			$out['logo']             = $logo ? array( 'id' => $logo, 'url' => (string) wp_get_attachment_image_url( $logo, 'full' ), 'alt' => (string) get_post_meta( $logo, '_wp_attachment_image_alt', true ) ) : null;
			$status                  = $edit ? 'any' : 'publish';
			$out['projects_count']   = count( Relations::by_developer( $id, Schema::PROJECT, $status ) );
			$out['listings_count']   = count( Relations::by_developer( $id, Schema::PROPERTY, $status ) );
			$out['areas']            = array_map( static fn( $t ) => array( 'name' => $t->name, 'slug' => $t->slug ), Relations::developer_areas( $id, $status ) );
			$rating                  = get_post_meta( $id, 'aa_rating', true );
			$out['rating']           = is_array( $rating ) && $rating ? $rating : null;
			if ( ! get_post_meta( $id, 'aa_about_approved', true ) ) {
				unset( $out['about'] ); // Unapproved copy is never public.
			}
		}
		if ( $edit && current_user_can( 'edit_post', $id ) ) {
			$out['review'] = array(
				'flags' => Quality::all( $id ),
			);
			if ( Schema::DEVELOPER === $type ) {
				$out['review']['identity']  = (string) get_post_meta( $id, 'aa_review_status', true );
				$out['review']['readiness'] = DeveloperReadiness::evaluate( $id );
			}
		}
		return $out;
	}
}
