<?php
namespace Trigon\AlaliahCore\Migration;

use Trigon\AlaliahCore\Schema;
use Trigon\AlaliahCore\Domain\References;
use Trigon\AlaliahCore\Domain\Relations;
use Trigon\AlaliahCore\Domain\Quality;

defined( 'ABSPATH' ) || exit;

/**
 * Applies a plan. In plan mode it only resolves what would happen (create, update,
 * unchanged, skip-edited) and writes nothing. In execute mode it writes, behind the
 * WriteGuard, and records an audit trail and a snapshot hash on every record.
 *
 * Idempotency: records are found by aa_legacy_post_id (posts) or aa_legacy_term_id (terms).
 * A record whose current state differs from its post-migration snapshot was edited by a
 * person and is skipped, never overwritten.
 */
final class Executor {

	private string $run_id;
	private bool $execute;
	private array $ids = array(); // plan key → new ID.

	public function __construct( string $run_id, bool $execute ) {
		$this->run_id  = $run_id;
		$this->execute = $execute;
	}

	public function run( array $plan ): array {
		$results = array();
		if ( $this->execute ) {
			WriteGuard::enable();
		}
		try {
			foreach ( $plan['items'] as $item ) {
				$results[] = 'location' === $item['entity'] ? $this->location( $item ) : $this->post( $item );
			}
			if ( $this->execute ) {
				// Some flags compare records (shared gallery images), so recompute once every record exists.
				foreach ( $results as $r ) {
					if ( ! empty( $r['new_id'] ) && 'location' !== $r['entity'] ) {
						Quality::store( (int) $r['new_id'] );
					}
				}
			}
		} finally {
			if ( $this->execute ) {
				WriteGuard::disable();
			}
		}
		return $results;
	}

	// ---------------------------------------------------------------- lookups

	private function find_term( array $item ): int {
		global $wpdb;
		if ( 'location:uae' === $item['key'] ) {
			$t = get_term_by( 'slug', 'uae', Schema::TAX_LOCATION );
			return $t ? (int) $t->term_id : 0;
		}
		return (int) $wpdb->get_var(
			$wpdb->prepare(
				"SELECT tm.term_id FROM {$wpdb->termmeta} tm JOIN {$wpdb->term_taxonomy} tt ON tt.term_id = tm.term_id
				 WHERE tm.meta_key = 'aa_legacy_term_id' AND tm.meta_value = %s AND tt.taxonomy = %s LIMIT 1",
				(string) $item['legacy_term_id'],
				Schema::TAX_LOCATION
			)
		);
	}

	private function find_post( string $post_type, int $legacy_id, string $key ): int {
		global $wpdb;
		$meta_key = 'area' === strtok( $key, ':' ) ? 'aa_legacy_term_id' : 'aa_legacy_post_id';
		return (int) $wpdb->get_var(
			$wpdb->prepare(
				"SELECT pm.post_id FROM {$wpdb->postmeta} pm JOIN {$wpdb->posts} p ON p.ID = pm.post_id
				 WHERE pm.meta_key = %s AND pm.meta_value = %s AND p.post_type = %s LIMIT 1",
				$meta_key,
				(string) $legacy_id,
				$post_type
			)
		);
	}

	/** Resolve a plan key (developer:32018, agent:30966, location:…) to a new ID. */
	private function resolve( ?string $key ): int {
		if ( ! $key ) {
			return 0;
		}
		if ( isset( $this->ids[ $key ] ) ) {
			return $this->ids[ $key ];
		}
		list( $entity, $rest ) = array_pad( explode( ':', $key, 2 ), 2, '' );
		if ( 'location' === $entity ) {
			$legacy = 'uae' === $rest ? 0 : (int) preg_replace( '/^city:/', '', $rest );
			return $this->ids[ $key ] = $this->find_term( array( 'key' => $key, 'legacy_term_id' => $legacy ) );
		}
		$types = array( 'developer' => Schema::DEVELOPER, 'agent' => Schema::AGENT, 'project' => Schema::PROJECT, 'property' => Schema::PROPERTY );
		if ( isset( $types[ $entity ] ) ) {
			return $this->ids[ $key ] = $this->find_post( $types[ $entity ], (int) $rest, $key );
		}
		return 0;
	}

	// ---------------------------------------------------------------- locations

	private function location( array $item ): array {
		$existing = $this->find_term( $item );
		$result   = array( 'entity' => 'location', 'key' => $item['key'], 'title' => $item['name'], 'legacy_id' => $item['legacy_term_id'], 'flags' => $item['flags'] ?? array(), 'audit' => $item['audit'] );
		if ( $existing ) {
			$this->ids[ $item['key'] ] = $existing;
			return $result + array( 'action' => 'exists', 'new_id' => $existing );
		}
		if ( ! $this->execute ) {
			return $result + array( 'action' => 'create', 'new_id' => null );
		}
		$parent  = $item['parent'] ? $this->resolve( $item['parent'] ) : 0;
		if ( $item['parent'] && ! $parent ) {
			throw new \RuntimeException( "Parent {$item['parent']} missing for {$item['key']}." );
		}
		$created = wp_insert_term( $item['name'], Schema::TAX_LOCATION, array( 'slug' => $item['slug'], 'parent' => $parent ) );
		if ( is_wp_error( $created ) ) {
			throw new \RuntimeException( $item['key'] . ': ' . $created->get_error_message() );
		}
		$tid = (int) $created['term_id'];
		update_term_meta( $tid, 'aa_level', $item['level'] );
		if ( $item['legacy_term_id'] ) {
			update_term_meta( $tid, 'aa_legacy_term_id', (int) $item['legacy_term_id'] );
			update_term_meta( $tid, 'aa_legacy_slug', (string) ( $item['legacy_slug'] ?? '' ) );
		}
		update_term_meta( $tid, 'aa_migration_audit', $item['audit'] + array( 'run_id' => $this->run_id, 'flags' => $item['flags'] ?? array() ) );
		$this->ids[ $item['key'] ] = $tid;
		return $result + array( 'action' => 'create', 'new_id' => $tid );
	}

	// ---------------------------------------------------------------- posts

	/** Keys the migration owns on a record (used for snapshots and updates). */
	private function managed_meta( array $item ): array {
		$keys = array_keys( $item['meta'] );
		foreach ( array_keys( $item['links'] ) as $k ) {
			$keys[] = $k;
		}
		return $keys;
	}

	private static function norm( $v ) {
		if ( is_bool( $v ) ) {
			return $v ? '1' : '';
		}
		if ( is_array( $v ) ) {
			return array_map( array( self::class, 'norm' ), $v );
		}
		return null === $v ? '' : (string) $v;
	}

	/** Current state of everything the migration manages on a record. */
	private function snapshot( int $id, array $item ): string {
		$post  = get_post( $id );
		$state = array(
			'title'   => $post->post_title,
			'content' => $post->post_content,
			'name'    => $post->post_name,
			'status'  => $post->post_status,
			'thumb'   => (string) get_post_meta( $id, '_thumbnail_id', true ),
			'meta'    => array(),
			'terms'   => array(),
		);
		foreach ( $this->managed_meta( $item ) as $k ) {
			$state['meta'][ $k ] = self::norm( get_post_meta( $id, $k, true ) );
		}
		$taxes = array_keys( $item['terms'] );
		if ( ! empty( $item['location'] ) ) {
			$taxes[] = Schema::TAX_LOCATION;
		}
		foreach ( $taxes as $tax ) {
			$slugs = wp_get_object_terms( $id, $tax, array( 'fields' => 'slugs' ) );
			$slugs = is_wp_error( $slugs ) ? array() : $slugs;
			sort( $slugs );
			$state['terms'][ $tax ] = $slugs;
		}
		return md5( wp_json_encode( $state ) );
	}

	private function source_hash( array $item ): string {
		unset( $item['audit'] );
		return md5( Planner::VERSION . wp_json_encode( $item ) );
	}

	private function post( array $item ): array {
		$existing = $this->find_post( $item['post_type'], (int) $item['legacy_id'], $item['key'] );
		$result   = array(
			'entity'    => $item['entity'],
			'key'       => $item['key'],
			'title'     => $item['title'],
			'legacy_id' => $item['legacy_id'],
			'reference' => $item['reference'] ?? null,
			'flags'     => $item['flags'],
			'audit'     => $item['audit'],
		);
		$source = $this->source_hash( $item );

		if ( $existing ) {
			$this->ids[ $item['key'] ] = $existing;
			$stored_snapshot = (string) get_post_meta( $existing, 'aa_migration_hash', true );
			$audit           = get_post_meta( $existing, 'aa_migration_audit', true );
			$stored_source   = is_array( $audit ) ? (string) ( $audit['source_hash'] ?? '' ) : '';
			if ( $stored_snapshot !== $this->snapshot( $existing, $item ) ) {
				return $result + array( 'action' => 'skip-edited', 'new_id' => $existing, 'note' => 'Edited since migration; left unchanged.' );
			}
			if ( $stored_source === $source ) {
				return $result + array( 'action' => 'unchanged', 'new_id' => $existing );
			}
			if ( ! $this->execute ) {
				return $result + array( 'action' => 'update', 'new_id' => $existing );
			}
			$this->write( $existing, $item, $source );
			return $result + array( 'action' => 'update', 'new_id' => $existing );
		}

		if ( ! $this->execute ) {
			return $result + array( 'action' => 'create', 'new_id' => null );
		}
		$postarr                = $item['post'];
		$postarr['post_type']   = $item['post_type'];
		$postarr['post_status'] = 'draft';
		$postarr['meta_input']  = array( 'area' === $item['entity'] ? 'aa_legacy_term_id' : 'aa_legacy_post_id' => (int) $item['legacy_id'] );
		$id                     = wp_insert_post( wp_slash( $postarr ), true );
		if ( is_wp_error( $id ) ) {
			throw new \RuntimeException( $item['key'] . ': ' . $id->get_error_message() );
		}
		$this->ids[ $item['key'] ] = (int) $id;
		$this->write( (int) $id, $item, $source, true );
		return $result + array( 'action' => 'create', 'new_id' => (int) $id );
	}

	private function write( int $id, array $item, string $source, bool $created = false ): void {
		if ( ! $created ) {
			$update       = $item['post'];
			$update['ID'] = $id;
			unset( $update['post_status'] ); // Status is an editorial decision after migration.
			wp_update_post( wp_slash( $update ), true );
		}
		foreach ( $item['meta'] as $key => $value ) {
			if ( null === $value || array() === $value || '' === $value ) {
				delete_post_meta( $id, $key );
			} else {
				update_post_meta( $id, $key, $value );
			}
		}
		foreach ( $item['links'] as $key => $target ) {
			$target_id = $this->resolve( $target );
			if ( 'aa_location_term_id' === $key ) {
				if ( $target_id ) {
					update_post_meta( $id, $key, $target_id );
					update_term_meta( $target_id, 'aa_area_post_id', $id );
				}
				continue;
			}
			if ( $target && ! $target_id ) {
				throw new \RuntimeException( "{$item['key']}: link target {$target} has not been migrated." );
			}
			if ( $target_id ) {
				update_post_meta( $id, $key, $target_id );
			} else {
				delete_post_meta( $id, $key );
			}
		}
		foreach ( $item['terms'] as $tax => $slugs ) {
			$ids = array();
			foreach ( $slugs as $slug ) {
				$t = get_term_by( 'slug', $slug, $tax );
				if ( ! $t ) {
					throw new \RuntimeException( "{$item['key']}: term {$tax}/{$slug} missing. Run wp alaliah setup." );
				}
				$ids[] = (int) $t->term_id;
			}
			wp_set_object_terms( $id, $ids, $tax, false );
		}
		if ( ! empty( $item['location'] ) ) {
			$loc = $this->resolve( $item['location'] );
			if ( ! $loc ) {
				throw new \RuntimeException( "{$item['key']}: location {$item['location']} has not been migrated." );
			}
			wp_set_object_terms( $id, array( $loc ), Schema::TAX_LOCATION, false );
		}
		if ( ! empty( $item['thumbnail'] ) && 'attachment' === get_post_type( (int) $item['thumbnail'] ) ) {
			update_post_meta( $id, '_thumbnail_id', (int) $item['thumbnail'] );
		}
		if ( ! empty( $item['reference'] ) ) {
			References::assign( $id, $item['reference'] );
		}
		if ( $item['flags'] ) {
			update_post_meta( $id, 'aa_migration_flags', array_values( array_unique( $item['flags'] ) ) );
		} else {
			delete_post_meta( $id, 'aa_migration_flags' );
		}
		update_post_meta(
			$id,
			'aa_migration_audit',
			array(
				'run_id'      => $this->run_id,
				'version'     => Planner::VERSION,
				'source_hash' => $source,
				'migrated_at' => gmdate( 'c' ),
			) + $this->public_audit( $item )
		);
		Relations::sync( $id );
		Quality::store( $id );
		update_post_meta( $id, 'aa_migration_hash', $this->snapshot( $id, $item ) );
	}

	/** Audit without private contact values. */
	private function public_audit( array $item ): array {
		$audit = $item['audit'];
		foreach ( $item['private'] ?? array() as $k ) {
			$audit['private_fields'][ $k ] = null === ( $item['meta'][ $k ] ?? null ) ? 'empty' : 'set';
		}
		return $audit;
	}

	/** Highest reference written by this run (to keep the counter above it). */
	public function max_reference( array $results ): int {
		$max = 0;
		foreach ( $results as $r ) {
			if ( ! empty( $r['reference'] ) && ! empty( $r['new_id'] ) ) {
				$max = max( $max, (int) substr( $r['reference'], 3 ) );
			}
		}
		return $max;
	}
}
