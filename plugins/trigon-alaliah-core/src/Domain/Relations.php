<?php
namespace Trigon\AlaliahCore\Domain;

use Trigon\AlaliahCore\Schema;

defined( 'ABSPATH' ) || exit;

/**
 * Relationships. Invariant (D-034):
 * 1. aa_project_id and aa_developer_id are canonical.
 * 2. Shadow terms (alaliah_rel_developer, alaliah_rel_project) are derived from them.
 * 3. Shadow terms are never edited by people; any other write is overwritten.
 * 4. On disagreement the canonical meta wins and the terms are rebuilt.
 *
 * Hard rule: nothing here reads aa_property_agency. Agency is never developer evidence.
 */
final class Relations {

	private static bool $syncing = false;

	public static function hooks(): void {
		add_action( 'save_post_' . Schema::PROPERTY, array( self::class, 'on_save' ), 30 );
		add_action( 'save_post_' . Schema::PROJECT, array( self::class, 'on_save' ), 30 );
		add_action( 'save_post_' . Schema::DEVELOPER, array( self::class, 'on_developer_save' ), 30, 2 );
		add_action( 'save_post_' . Schema::PROJECT, array( self::class, 'on_project_title' ), 31, 2 );
		add_action( 'added_post_meta', array( self::class, 'on_meta_change' ), 10, 3 );
		add_action( 'updated_post_meta', array( self::class, 'on_meta_change' ), 10, 3 );
		add_action( 'deleted_post_meta', array( self::class, 'on_meta_change' ), 10, 3 );
		add_action( 'set_object_terms', array( self::class, 'on_foreign_term_write' ), 10, 6 );
		add_action( 'before_delete_post', array( self::class, 'on_delete' ) );
	}

	public static function is_syncing(): bool {
		return self::$syncing;
	}

	public static function on_save( int $post_id ): void {
		if ( wp_is_post_revision( $post_id ) ) {
			return;
		}
		self::sync( $post_id );
	}

	public static function on_meta_change( $meta_ids, $object_id, $meta_key ): void {
		if ( in_array( $meta_key, array( 'aa_project_id', 'aa_developer_id' ), true ) && ! self::$syncing ) {
			self::sync( (int) $object_id );
		}
	}

	/** Any write to a shadow taxonomy outside sync() is undone by re-deriving from meta. */
	public static function on_foreign_term_write( $object_id, $terms, $tt_ids, $taxonomy ): void {
		if ( self::$syncing || ! in_array( $taxonomy, array( Schema::TAX_REL_DEV, Schema::TAX_REL_PROJ ), true ) ) {
			return;
		}
		self::sync( (int) $object_id );
	}

	/** The developer that a property or project actually has, per the canonical rule. */
	public static function effective_developer( int $post_id ): int {
		$type = get_post_type( $post_id );
		if ( Schema::PROPERTY === $type ) {
			$project = self::project_of( $post_id );
			if ( $project ) {
				return (int) get_post_meta( $project, 'aa_developer_id', true );
			}
		}
		$dev = (int) get_post_meta( $post_id, 'aa_developer_id', true );
		return ( $dev && Schema::DEVELOPER === get_post_type( $dev ) ) ? $dev : 0;
	}

	public static function project_of( int $property_id ): int {
		$project = (int) get_post_meta( $property_id, 'aa_project_id', true );
		return ( $project && Schema::PROJECT === get_post_type( $project ) ) ? $project : 0;
	}

	/** Expected shadow terms for an object: [taxonomy => target post IDs]. */
	public static function expected( int $post_id ): array {
		$type = get_post_type( $post_id );
		$out  = array( Schema::TAX_REL_DEV => array() );
		$dev  = self::effective_developer( $post_id );
		if ( $dev ) {
			$out[ Schema::TAX_REL_DEV ][] = $dev;
		}
		if ( Schema::PROPERTY === $type ) {
			$out[ Schema::TAX_REL_PROJ ] = array();
			$project                     = self::project_of( $post_id );
			if ( $project ) {
				$out[ Schema::TAX_REL_PROJ ][] = $project;
			}
		}
		return $out;
	}

	/** Write exactly the expected shadow terms for one property or project. */
	public static function sync( int $post_id ): void {
		$type = get_post_type( $post_id );
		if ( ! in_array( $type, array( Schema::PROPERTY, Schema::PROJECT ), true ) ) {
			return;
		}
		self::$syncing = true;
		try {
			foreach ( self::expected( $post_id ) as $taxonomy => $targets ) {
				$term_ids = array();
				foreach ( $targets as $target ) {
					$term_ids[] = self::term_for( $taxonomy, $target );
				}
				wp_set_object_terms( $post_id, $term_ids, $taxonomy, false );
			}
		} finally {
			self::$syncing = false;
		}
		if ( Schema::PROJECT === $type ) {
			foreach ( self::units_of( $post_id ) as $unit ) {
				self::sync( $unit );
			}
		}
	}

	/** Property IDs whose canonical project is this project (any status). */
	public static function units_of( int $project_id ): array {
		global $wpdb;
		return array_map(
			'intval',
			$wpdb->get_col(
				$wpdb->prepare(
					"SELECT pm.post_id FROM {$wpdb->postmeta} pm JOIN {$wpdb->posts} p ON p.ID = pm.post_id
					 WHERE pm.meta_key = 'aa_project_id' AND pm.meta_value = %s AND p.post_type = %s",
					(string) $project_id,
					Schema::PROPERTY
				)
			)
		);
	}

	/** Find or create the shadow term that indexes a developer or project post. */
	public static function term_for( string $taxonomy, int $target ): int {
		$slug = ( Schema::TAX_REL_DEV === $taxonomy ? 'd-' : 'p-' ) . $target;
		$term = get_term_by( 'slug', $slug, $taxonomy );
		if ( $term ) {
			return (int) $term->term_id;
		}
		$created = wp_insert_term( get_the_title( $target ), $taxonomy, array( 'slug' => $slug ) );
		if ( is_wp_error( $created ) ) {
			throw new \RuntimeException( $created->get_error_message() );
		}
		update_term_meta( (int) $created['term_id'], 'aa_target_post_id', $target );
		return (int) $created['term_id'];
	}

	public static function on_developer_save( int $post_id, \WP_Post $post ): void {
		self::rename_term( Schema::TAX_REL_DEV, 'd-' . $post_id, $post->post_title );
	}

	public static function on_project_title( int $post_id, \WP_Post $post ): void {
		self::rename_term( Schema::TAX_REL_PROJ, 'p-' . $post_id, $post->post_title );
	}

	private static function rename_term( string $taxonomy, string $slug, string $name ): void {
		$term = get_term_by( 'slug', $slug, $taxonomy );
		if ( $term && $term->name !== $name && '' !== $name ) {
			wp_update_term( $term->term_id, $taxonomy, array( 'name' => $name ) );
		}
	}

	/** When a developer or project is deleted, drop its index term and re-derive dependants. */
	public static function on_delete( int $post_id ): void {
		$type = get_post_type( $post_id );
		if ( Schema::DEVELOPER === $type ) {
			$term = get_term_by( 'slug', 'd-' . $post_id, Schema::TAX_REL_DEV );
		} elseif ( Schema::PROJECT === $type ) {
			$term = get_term_by( 'slug', 'p-' . $post_id, Schema::TAX_REL_PROJ );
		} else {
			return;
		}
		if ( $term ) {
			wp_delete_term( $term->term_id, $term->taxonomy );
		}
		if ( Schema::PROJECT === $type ) {
			// Units fall back to their own developer once the project is gone. Re-derive on
			// after_delete_post: at deleted_post the post cache still holds the project, which
			// would recreate its index term.
			$units = self::units_of( $post_id );
			add_action(
				'after_delete_post',
				static function ( $deleted ) use ( $post_id, $units ) {
					if ( (int) $deleted === $post_id ) {
						foreach ( $units as $unit ) {
							self::sync( $unit );
						}
					}
				}
			);
		}
	}

	/**
	 * Recompute every shadow assignment from canonical meta.
	 * Returns the list of objects whose terms disagreed (drift). With $fix, they are rebuilt.
	 */
	public static function rebuild( bool $fix = true ): array {
		$drift = array();
		$ids   = get_posts(
			array(
				'post_type'      => array( Schema::PROPERTY, Schema::PROJECT ),
				'post_status'    => 'any',
				'posts_per_page' => -1,
				'fields'         => 'ids',
			)
		);
		foreach ( $ids as $id ) {
			foreach ( self::expected( (int) $id ) as $taxonomy => $targets ) {
				$want = array_map( static fn( $t ) => ( Schema::TAX_REL_DEV === $taxonomy ? 'd-' : 'p-' ) . $t, $targets );
				$have = wp_get_object_terms( (int) $id, $taxonomy, array( 'fields' => 'slugs' ) );
				$have = is_wp_error( $have ) ? array() : $have;
				sort( $want );
				sort( $have );
				if ( $want !== $have ) {
					$drift[] = array( 'post' => (int) $id, 'taxonomy' => $taxonomy, 'expected' => $want, 'found' => $have );
				}
			}
			if ( $fix ) {
				self::sync( (int) $id );
			}
		}
		return $drift;
	}

	/** IDs of properties and projects indexed under a developer (derived). */
	public static function by_developer( int $developer_id, string $post_type, string $status = 'any' ): array {
		return get_posts(
			array(
				'post_type'      => $post_type,
				'post_status'    => $status,
				'posts_per_page' => -1,
				'fields'         => 'ids',
				'tax_query'      => array(
					array(
						'taxonomy' => Schema::TAX_REL_DEV,
						'field'    => 'slug',
						'terms'    => 'd-' . $developer_id,
					),
				),
			)
		);
	}

	/** A developer's areas: the union of its projects' and listings' location terms (derived). */
	public static function developer_areas( int $developer_id, string $status = 'any' ): array {
		$ids = array_merge(
			self::by_developer( $developer_id, Schema::PROJECT, $status ),
			self::by_developer( $developer_id, Schema::PROPERTY, $status )
		);
		$terms = array();
		foreach ( $ids as $id ) {
			foreach ( wp_get_object_terms( $id, Schema::TAX_LOCATION ) as $t ) {
				$terms[ $t->term_id ] = $t;
			}
		}
		return array_values( $terms );
	}
}
