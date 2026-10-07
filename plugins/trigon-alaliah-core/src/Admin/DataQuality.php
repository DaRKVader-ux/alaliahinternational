<?php
namespace Trigon\AlaliahCore\Admin;

use Trigon\AlaliahCore\Schema;
use Trigon\AlaliahCore\Domain\Quality;
use Trigon\AlaliahCore\Domain\Relations;
use Trigon\AlaliahCore\Domain\DeveloperReadiness;
use Trigon\AlaliahCore\Domain\References;

defined( 'ABSPATH' ) || exit;

/**
 * Tools › Data Quality: read-only overview of flags, developer identity and readiness,
 * the relationship inspector and the shadow-index drift check. It changes nothing.
 */
final class DataQuality {

	public static function hooks(): void {
		add_action( 'admin_menu', array( self::class, 'menu' ) );
	}

	public static function menu(): void {
		add_management_page( 'Data Quality', 'Data Quality', 'edit_others_posts', 'aa-data-quality', array( self::class, 'render' ) );
	}

	private static function ids( string $type ): array {
		return get_posts( array( 'post_type' => $type, 'post_status' => 'any', 'posts_per_page' => -1, 'fields' => 'ids', 'orderby' => 'title', 'order' => 'ASC' ) );
	}

	public static function render(): void {
		if ( ! current_user_can( 'edit_others_posts' ) ) {
			wp_die( esc_html__( 'Not allowed.', 'trigon-alaliah-core' ) );
		}
		$types = array( Schema::PROPERTY => 'Properties', Schema::PROJECT => 'Projects', Schema::DEVELOPER => 'Developers' );
		echo '<div class="wrap"><h1>Data Quality</h1><p>Read-only. Flags never block saving; fix records from their edit screens.</p>';

		echo '<h2>Totals</h2><table class="widefat striped" style="max-width:40rem"><thead><tr><th scope="col">Entity</th><th scope="col">Records</th><th scope="col">With flags</th></tr></thead><tbody>';
		$counts = array();
		foreach ( $types as $type => $label ) {
			$ids     = self::ids( $type );
			$flagged = 0;
			foreach ( $ids as $id ) {
				$flags = Quality::all( (int) $id );
				if ( $flags ) {
					++$flagged;
				}
				foreach ( $flags as $f ) {
					$counts[ $type ][ $f ] = ( $counts[ $type ][ $f ] ?? 0 ) + 1;
				}
			}
			echo '<tr><th scope="row">' . esc_html( $label ) . '</th><td>' . count( $ids ) . '</td><td>' . (int) $flagged . '</td></tr>';
		}
		echo '</tbody></table>';

		echo '<h2>Flags</h2><table class="widefat striped" style="max-width:56rem"><thead><tr><th scope="col">Entity</th><th scope="col">Flag</th><th scope="col">Records</th></tr></thead><tbody>';
		foreach ( $counts as $type => $flags ) {
			ksort( $flags );
			foreach ( $flags as $flag => $n ) {
				$url = add_query_arg( array( 'post_type' => $type, 'aa_flag' => $flag, 'post_status' => 'all' ), admin_url( 'edit.php' ) );
				echo '<tr><td>' . esc_html( $types[ $type ] ) . '</td><td>' . esc_html( Quality::LABELS[ $flag ] ?? $flag ) . '</td><td><a href="' . esc_url( $url ) . '">' . (int) $n . '</a></td></tr>';
			}
		}
		echo '</tbody></table>';

		echo '<h2>Developers</h2><table class="widefat striped"><thead><tr><th scope="col">Developer</th><th scope="col">Identity</th><th scope="col">Ready to publish</th><th scope="col">Projects</th><th scope="col">Listings</th><th scope="col">Areas (derived)</th></tr></thead><tbody>';
		foreach ( self::ids( Schema::DEVELOPER ) as $id ) {
			$r     = DeveloperReadiness::evaluate( (int) $id );
			$state = (string) get_post_meta( $id, 'aa_review_status', true );
			$areas = implode( ', ', wp_list_pluck( Relations::developer_areas( (int) $id ), 'name' ) );
			echo '<tr><td><a href="' . esc_url( get_edit_post_link( $id ) ) . '">' . esc_html( get_the_title( $id ) ) . '</a></td><td>' . esc_html( Schema::IDENTITY_STATES[ $state ] ?? 'Needs review' ) . '</td><td>' . esc_html( $r['ready'] ? 'Ready' : 'No: ' . implode( '; ', $r['blocking'] ) ) . '</td><td>' . count( Relations::by_developer( (int) $id, Schema::PROJECT ) ) . '</td><td>' . count( Relations::by_developer( (int) $id, Schema::PROPERTY ) ) . '</td><td>' . esc_html( $areas ? $areas : '—' ) . '</td></tr>';
		}
		echo '</tbody></table>';

		echo '<h2>Relationship inspector</h2><table class="widefat striped"><thead><tr><th scope="col">Record</th><th scope="col">Type</th><th scope="col">Reference</th><th scope="col">Project</th><th scope="col">Developer (effective)</th><th scope="col">Area</th></tr></thead><tbody>';
		foreach ( array( Schema::PROJECT, Schema::PROPERTY ) as $type ) {
			foreach ( self::ids( $type ) as $id ) {
				$project = Relations::project_of( (int) $id );
				$dev     = Relations::effective_developer( (int) $id );
				$loc     = wp_get_object_terms( $id, Schema::TAX_LOCATION, array( 'fields' => 'names' ) );
				echo '<tr><td><a href="' . esc_url( get_edit_post_link( $id ) ) . '">' . esc_html( get_the_title( $id ) ) . '</a></td><td>' . esc_html( Schema::PROJECT === $type ? 'Project' : 'Property' ) . '</td><td>' . esc_html( References::get( (int) $id ) ) . '</td><td>' . esc_html( $project ? get_the_title( $project ) : '—' ) . '</td><td>' . esc_html( $dev ? get_the_title( $dev ) : '—' ) . '</td><td>' . esc_html( $loc ? implode( ', ', $loc ) : '—' ) . '</td></tr>';
			}
		}
		echo '</tbody></table>';

		$drift = Relations::rebuild( false );
		echo '<h2>Relationship index</h2><p>' . ( $drift ? esc_html( count( $drift ) . ' records out of sync. Run: wp alaliah relations rebuild' ) : 'In sync with the canonical relationships.' ) . '</p></div>';
	}
}
