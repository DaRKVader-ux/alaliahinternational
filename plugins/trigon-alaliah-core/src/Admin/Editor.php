<?php
namespace Trigon\AlaliahCore\Admin;

use Trigon\AlaliahCore\Schema;
use Trigon\AlaliahCore\Domain\Permits;
use Trigon\AlaliahCore\Domain\Quality;
use Trigon\AlaliahCore\Domain\Relations;
use Trigon\AlaliahCore\Domain\DeveloperReadiness;
use Trigon\AlaliahCore\Domain\References;

defined( 'ABSPATH' ) || exit;

/**
 * Schema-driven edit screens. One meta box per group, in the approved order; a side box shows
 * data-quality flags (and readiness for developers). No third-party field framework.
 */
final class Editor {

	public static function hooks(): void {
		add_action( 'add_meta_boxes', array( self::class, 'boxes' ), 10, 2 );
		add_action( 'edit_form_after_title', array( self::class, 'nonce' ) );
		add_action( 'admin_enqueue_scripts', array( self::class, 'assets' ) );
		foreach ( array( Schema::PROPERTY, Schema::PROJECT, Schema::DEVELOPER, Schema::AGENT, Schema::AREA ) as $type ) {
			add_action( 'save_post_' . $type, array( self::class, 'save' ), 10, 2 );
		}
		add_filter( 'manage_' . Schema::PROPERTY . '_posts_columns', array( self::class, 'property_columns' ) );
		add_action( 'manage_' . Schema::PROPERTY . '_posts_custom_column', array( self::class, 'property_column' ), 10, 2 );
		add_filter( 'manage_' . Schema::DEVELOPER . '_posts_columns', array( self::class, 'developer_columns' ) );
		add_action( 'manage_' . Schema::DEVELOPER . '_posts_custom_column', array( self::class, 'developer_column' ), 10, 2 );
		add_action( 'pre_get_posts', array( self::class, 'filter_by_flag' ) );
	}

	public static function assets( string $hook ): void {
		if ( ! in_array( $hook, array( 'post.php', 'post-new.php' ), true ) ) {
			return;
		}
		$screen = get_current_screen();
		if ( ! $screen || ! Schema::is_own_type( $screen->post_type ) ) {
			return;
		}
		wp_enqueue_media();
		wp_enqueue_style( 'aa-editor', plugins_url( 'assets/admin/editor.css', TRIGON_ALALIAH_CORE_FILE ), array(), TRIGON_ALALIAH_CORE_VERSION );
		wp_enqueue_script( 'aa-editor', plugins_url( 'assets/admin/editor.js', TRIGON_ALALIAH_CORE_FILE ), array( 'jquery' ), TRIGON_ALALIAH_CORE_VERSION, true );
	}

	public static function nonce( \WP_Post $post ): void {
		if ( Schema::is_own_type( $post->post_type ) ) {
			wp_nonce_field( 'aa_save_' . $post->ID, 'aa_editor_nonce' );
		}
	}

	public static function boxes( string $post_type, $post ): void {
		if ( ! Schema::is_own_type( $post_type ) ) {
			return;
		}
		foreach ( Schema::groups( $post_type ) as $group => $title ) {
			if ( ! Schema::fields_for( $post_type, $group ) ) {
				continue;
			}
			add_meta_box( 'aa-' . $group, $title, array( self::class, 'render_group' ), $post_type, 'normal', 'high', array( 'group' => $group ) );
		}
		if ( in_array( $post_type, array( Schema::PROPERTY, Schema::PROJECT, Schema::DEVELOPER ), true ) ) {
			add_meta_box( 'aa-quality', 'Data quality', array( self::class, 'render_quality' ), $post_type, 'side', 'high' );
		}
	}

	public static function render_group( \WP_Post $post, array $box ): void {
		$group = $box['args']['group'];
		echo '<div class="aa-fields">';
		foreach ( Schema::fields_for( $post->post_type, $group ) as $key => $def ) {
			self::render_field( $post, $key, $def );
		}
		echo '</div>';
	}

	private static function name( string $key ): string {
		return 'aa_fields[' . $key . ']';
	}

	private static function id( string $key ): string {
		return 'aa-field-' . sanitize_html_class( str_replace( ':', '-', $key ) );
	}

	private static function render_field( \WP_Post $post, string $key, array $def ): void {
		$input = $def['input'];
		if ( 'system' === $input ) {
			return;
		}
		$id    = self::id( $key );
		$value = ( 0 === strpos( $key, 'tax:' ) ) ? null : get_post_meta( $post->ID, $key, true );
		$help  = isset( $def['help'] ) ? '<p class="description" id="' . esc_attr( $id ) . '-help">' . esc_html( $def['help'] ) . '</p>' : '';
		$desc  = isset( $def['help'] ) ? ' aria-describedby="' . esc_attr( $id ) . '-help"' : '';

		echo '<div class="aa-field aa-field--' . esc_attr( $input ) . '">';
		switch ( $input ) {
			case 'readonly':
				if ( 'aa_reference' === $key && ! $value ) {
					$value = 'Assigned on first save';
				}
				echo '<span class="aa-label">' . esc_html( $def['label'] ) . '</span>';
				echo '<div class="aa-readonly" id="' . esc_attr( $id ) . '">' . ( '' === (string) $value ? '<em>—</em>' : nl2br( esc_html( (string) $value ) ) ) . '</div>';
				break;

			case 'checkbox':
				echo '<input type="hidden" name="' . esc_attr( self::name( $key ) ) . '" value="0">';
				echo '<label for="' . esc_attr( $id ) . '"><input type="checkbox" id="' . esc_attr( $id ) . '" name="' . esc_attr( self::name( $key ) ) . '" value="1"' . checked( (bool) $value, true, false ) . $desc . '> ' . esc_html( $def['label'] ) . '</label>';
				break;

			case 'select':
				echo '<label class="aa-label" for="' . esc_attr( $id ) . '">' . esc_html( $def['label'] ) . '</label>';
				echo '<select id="' . esc_attr( $id ) . '" name="' . esc_attr( self::name( $key ) ) . '"' . $desc . '>';
				foreach ( $def['options'] as $opt => $label ) {
					$current = ( '' === (string) $value && isset( $def['default'] ) ) ? $def['default'] : (string) $value;
					echo '<option value="' . esc_attr( $opt ) . '"' . selected( $current, (string) $opt, false ) . '>' . esc_html( $label ) . '</option>';
				}
				echo '</select>';
				break;

			case 'term':
				$terms   = get_terms( array( 'taxonomy' => $def['taxonomy'], 'hide_empty' => false ) );
				$current = wp_get_object_terms( $post->ID, $def['taxonomy'], array( 'fields' => 'ids' ) );
				$current = $current ? (int) $current[0] : 0;
				echo '<label class="aa-label" for="' . esc_attr( $id ) . '">' . esc_html( $def['label'] ) . '</label>';
				echo '<select id="' . esc_attr( $id ) . '" name="' . esc_attr( self::name( $key ) ) . '"><option value="">—</option>';
				foreach ( is_array( $terms ) ? $terms : array() as $t ) {
					echo '<option value="' . esc_attr( $t->term_id ) . '"' . selected( $current, $t->term_id, false ) . '>' . esc_html( $t->name ) . '</option>';
				}
				echo '</select>';
				break;

			case 'terms':
				$current = wp_get_object_terms( $post->ID, $def['taxonomy'], array( 'fields' => 'ids' ) );
				$current = is_array( $current ) ? array_map( 'intval', $current ) : array();
				echo '<fieldset><legend class="aa-label">' . esc_html( $def['label'] ) . '</legend>';
				echo '<input type="hidden" name="' . esc_attr( self::name( $key ) ) . '[]" value="">';
				$parents = get_terms( array( 'taxonomy' => $def['taxonomy'], 'hide_empty' => false, 'parent' => 0 ) );
				if ( ! $parents ) {
					echo '<p class="description">No amenities are set up yet.</p>';
				}
				foreach ( is_array( $parents ) ? $parents : array() as $parent ) {
					$children = get_terms( array( 'taxonomy' => $def['taxonomy'], 'hide_empty' => false, 'parent' => $parent->term_id ) );
					echo '<div class="aa-term-group"><span class="aa-sublabel">' . esc_html( $parent->name ) . '</span>';
					foreach ( is_array( $children ) && $children ? $children : array( $parent ) as $t ) {
						echo '<label><input type="checkbox" name="' . esc_attr( self::name( $key ) ) . '[]" value="' . esc_attr( $t->term_id ) . '"' . checked( in_array( (int) $t->term_id, $current, true ), true, false ) . '> ' . esc_html( $t->name ) . '</label>';
					}
					echo '</div>';
				}
				echo '</fieldset>';
				break;

			case 'location':
			case 'location_id':
				$current = 'location' === $input ? wp_get_object_terms( $post->ID, Schema::TAX_LOCATION, array( 'fields' => 'ids' ) ) : array( (int) $value );
				$current = $current ? (int) $current[0] : 0;
				echo '<label class="aa-label" for="' . esc_attr( $id ) . '">' . esc_html( $def['label'] ) . '</label>';
				echo '<select id="' . esc_attr( $id ) . '" name="' . esc_attr( self::name( $key ) ) . '"' . $desc . '><option value="">—</option>';
				self::location_options( 0, 0, $current );
				echo '</select>';
				break;

			case 'post':
				$disabled = '';
				$note     = '';
				if ( 'aa_developer_id' === $key && Schema::PROPERTY === $post->post_type && Relations::project_of( $post->ID ) ) {
					$disabled = ' disabled';
					$value    = Relations::effective_developer( $post->ID );
					$note     = '<p class="description">From the project. Change the project\'s developer to change this.</p>';
				}
				$posts = get_posts( array( 'post_type' => $def['post_type'], 'post_status' => array( 'publish', 'draft', 'pending', 'private' ), 'posts_per_page' => -1, 'orderby' => 'title', 'order' => 'ASC' ) );
				echo '<label class="aa-label" for="' . esc_attr( $id ) . '">' . esc_html( $def['label'] ) . '</label>';
				echo '<select id="' . esc_attr( $id ) . '" name="' . esc_attr( self::name( $key ) ) . '"' . $disabled . ' data-aa-post="' . esc_attr( $key ) . '"><option value="">—</option>';
				foreach ( $posts as $p ) {
					$label = get_the_title( $p ) . ( 'publish' !== $p->post_status ? ' (' . $p->post_status . ')' : '' );
					echo '<option value="' . esc_attr( $p->ID ) . '"' . selected( (int) $value, $p->ID, false ) . '>' . esc_html( $label ) . '</option>';
				}
				echo '</select>' . $note; // phpcs:ignore WordPress.Security.EscapeOutput -- static markup.
				break;

			case 'number':
			case 'decimal':
				$step = 'decimal' === $input ? 'any' : '1';
				echo '<label class="aa-label" for="' . esc_attr( $id ) . '">' . esc_html( $def['label'] ) . '</label>';
				echo '<input type="number" step="' . esc_attr( $step ) . '" id="' . esc_attr( $id ) . '" name="' . esc_attr( self::name( $key ) ) . '" value="' . esc_attr( (string) $value ) . '"' . ( isset( $def['min'] ) ? ' min="' . esc_attr( (string) $def['min'] ) . '"' : '' ) . ( isset( $def['max'] ) ? ' max="' . esc_attr( (string) $def['max'] ) . '"' : '' ) . $desc . ' class="small-text">';
				break;

			case 'textarea':
				echo '<label class="aa-label" for="' . esc_attr( $id ) . '">' . esc_html( $def['label'] ) . '</label>';
				echo '<textarea id="' . esc_attr( $id ) . '" name="' . esc_attr( self::name( $key ) ) . '" rows="3" class="large-text"' . $desc . '>' . esc_textarea( (string) $value ) . '</textarea>';
				break;

			case 'richtext':
				// Quicktags only: TinyMCE's toolbar and iframe fail WCAG checks inside meta boxes.
				$editor_id = 'aafield' . preg_replace( '/[^a-z]/', '', $key );
				echo '<label class="aa-label" for="' . esc_attr( $editor_id ) . '">' . esc_html( $def['label'] ) . '</label>';
				wp_editor(
					(string) $value,
					$editor_id,
					array(
						'textarea_name' => self::name( $key ),
						'textarea_rows' => 8,
						'media_buttons' => false,
						'tinymce'       => false,
						'quicktags'     => array( 'buttons' => 'strong,em,link,ul,ol,li' ),
					)
				);
				break;

			case 'list':
				echo '<label class="aa-label" for="' . esc_attr( $id ) . '">' . esc_html( $def['label'] ) . '</label>';
				echo '<input type="text" id="' . esc_attr( $id ) . '" name="' . esc_attr( self::name( $key ) ) . '" value="' . esc_attr( is_array( $value ) ? implode( ', ', $value ) : '' ) . '" class="regular-text">';
				break;

			case 'image':
			case 'file':
				self::render_single_media( $id, $key, $def, (int) $value );
				break;

			case 'gallery':
				self::render_gallery( $id, $key, $def, is_array( $value ) ? $value : array() );
				break;

			case 'floorplans':
				self::render_floorplans( $id, $key, $def, is_array( $value ) ? $value : array() );
				break;

			case 'permits':
				self::render_permits( $id, $key, $def, is_array( $value ) ? $value : array() );
				break;

			case 'sources':
				self::render_sources( $id, $key, $def, is_array( $value ) ? $value : array() );
				break;

			case 'rating':
				$value = is_array( $value ) ? $value : array();
				echo '<fieldset><legend class="aa-label">' . esc_html( $def['label'] ) . '</legend>';
				foreach ( array( 'source' => 'Source name', 'url' => 'Source URL', 'score' => 'Score', 'count' => 'Review count', 'retrieved_on' => 'Retrieved on (YYYY-MM-DD)', 'refresh_policy' => 'Refresh policy' ) as $k => $label ) {
					$fid = $id . '-' . $k;
					echo '<label class="aa-sublabel" for="' . esc_attr( $fid ) . '">' . esc_html( $label ) . '</label><input type="text" id="' . esc_attr( $fid ) . '" name="' . esc_attr( self::name( $key ) . '[' . $k . ']' ) . '" value="' . esc_attr( (string) ( $value[ $k ] ?? '' ) ) . '" class="regular-text">';
				}
				echo '</fieldset>';
				break;

			case 'url':
			case 'email':
			case 'text':
			default:
				$type = in_array( $input, array( 'url', 'email' ), true ) ? $input : 'text';
				echo '<label class="aa-label" for="' . esc_attr( $id ) . '">' . esc_html( $def['label'] ) . '</label>';
				echo '<input type="' . esc_attr( $type ) . '" id="' . esc_attr( $id ) . '" name="' . esc_attr( self::name( $key ) ) . '" value="' . esc_attr( is_scalar( $value ) ? (string) $value : '' ) . '" class="regular-text"' . $desc . '>';
				break;
		}
		echo $help; // phpcs:ignore WordPress.Security.EscapeOutput -- built with esc_* above.
		echo '</div>';
	}

	private static function location_options( int $parent, int $depth, int $current ): void {
		$terms = get_terms( array( 'taxonomy' => Schema::TAX_LOCATION, 'hide_empty' => false, 'parent' => $parent, 'orderby' => 'name' ) );
		foreach ( is_array( $terms ) ? $terms : array() as $t ) {
			$level = (string) get_term_meta( $t->term_id, 'aa_level', true );
			echo '<option value="' . esc_attr( $t->term_id ) . '"' . selected( $current, $t->term_id, false ) . '>' . esc_html( str_repeat( '— ', $depth ) . $t->name . ( $level ? ' (' . $level . ')' : '' ) ) . '</option>';
			self::location_options( $t->term_id, $depth + 1, $current );
		}
	}

	private static function thumb( int $att ): string {
		$html = wp_get_attachment_image( $att, 'thumbnail', true, array( 'alt' => '' ) );
		return $html ? $html : '<span class="aa-missing">#' . (int) $att . '</span>';
	}

	private static function render_single_media( string $id, string $key, array $def, int $att ): void {
		$is_file = 'file' === $def['input'];
		echo '<span class="aa-label" id="' . esc_attr( $id ) . '-label">' . esc_html( $def['label'] ) . '</span>';
		echo '<div class="aa-media" data-aa-media="single" data-aa-type="' . ( $is_file ? 'application/pdf' : 'image' ) . '">';
		echo '<input type="hidden" name="' . esc_attr( self::name( $key ) ) . '" value="' . esc_attr( $att ? (string) $att : '' ) . '" class="aa-media-value">';
		echo '<div class="aa-media-preview">' . ( $att ? ( $is_file ? esc_html( basename( (string) get_attached_file( $att ) ) ) : self::thumb( $att ) ) : '' ) . '</div>'; // phpcs:ignore WordPress.Security.EscapeOutput
		echo '<button type="button" class="button aa-media-choose" aria-describedby="' . esc_attr( $id ) . '-label">' . esc_html( $att ? 'Replace' : 'Choose' ) . '</button> ';
		echo '<button type="button" class="button-link aa-media-clear"' . ( $att ? '' : ' hidden' ) . '>Remove</button>';
		echo '</div>';
	}

	private static function render_gallery( string $id, string $key, array $def, array $ids ): void {
		echo '<span class="aa-label" id="' . esc_attr( $id ) . '-label">' . esc_html( $def['label'] ) . '</span>';
		echo '<div class="aa-media" data-aa-media="gallery" data-aa-name="' . esc_attr( self::name( $key ) ) . '">';
		echo '<input type="hidden" name="' . esc_attr( self::name( $key ) ) . '[]" value="">';
		echo '<ol class="aa-sortable" aria-labelledby="' . esc_attr( $id ) . '-label">';
		foreach ( $ids as $att ) {
			echo '<li class="aa-item" draggable="true"><input type="hidden" name="' . esc_attr( self::name( $key ) ) . '[]" value="' . esc_attr( (int) $att ) . '">' . self::thumb( (int) $att ) . self::item_controls() . '</li>'; // phpcs:ignore WordPress.Security.EscapeOutput
		}
		echo '</ol><button type="button" class="button aa-gallery-add">Add images</button></div>';
	}

	private static function item_controls(): string {
		return '<span class="aa-item-controls"><button type="button" class="button-link aa-move" data-dir="-1" aria-label="Move earlier">↑</button><button type="button" class="button-link aa-move" data-dir="1" aria-label="Move later">↓</button><button type="button" class="button-link aa-remove" aria-label="Remove">×</button></span>';
	}

	private static function render_floorplans( string $id, string $key, array $def, array $items ): void {
		echo '<span class="aa-label" id="' . esc_attr( $id ) . '-label">' . esc_html( $def['label'] ) . '</span>';
		echo '<div class="aa-media" data-aa-media="floorplans" data-aa-name="' . esc_attr( self::name( $key ) ) . '">';
		// Presence marker so that removing every plan is saved; it never collides with item indexes.
		echo '<input type="hidden" name="' . esc_attr( self::name( $key ) ) . '[__present]" value="">';
		echo '<ol class="aa-sortable aa-plans" aria-labelledby="' . esc_attr( $id ) . '-label">';
		foreach ( $items as $i => $item ) {
			echo self::plan_item( self::name( $key ), (string) $i, $item ); // phpcs:ignore WordPress.Security.EscapeOutput
		}
		echo '</ol><button type="button" class="button aa-plans-add">Add floor plans</button>';
		echo '<template class="aa-plan-template">' . self::plan_item( self::name( $key ), '__i__', array( 'id' => 0 ) ) . '</template></div>'; // phpcs:ignore WordPress.Security.EscapeOutput
	}

	private static function plan_item( string $name, string $i, array $item ): string {
		$base   = $name . '[' . $i . ']';
		$fields = array( 'title' => 'Title', 'level' => 'Floor / level', 'unit_type' => 'Unit type', 'bedrooms' => 'Bedrooms', 'area' => 'Area', 'note' => 'Note' );
		$html   = '<li class="aa-item aa-plan" draggable="true"><input type="hidden" class="aa-plan-id" name="' . esc_attr( $base . '[id]' ) . '" value="' . esc_attr( (string) (int) ( $item['id'] ?? 0 ) ) . '">';
		$html  .= '<span class="aa-plan-thumb">' . ( ! empty( $item['id'] ) ? self::thumb( (int) $item['id'] ) : '' ) . '</span>' . self::item_controls();
		$html  .= '<details><summary>Add details (optional)</summary>';
		foreach ( $fields as $k => $label ) {
			$fid   = 'aa-plan-' . $i . '-' . $k;
			$html .= '<label for="' . esc_attr( $fid ) . '">' . esc_html( $label ) . '</label><input type="text" id="' . esc_attr( $fid ) . '" name="' . esc_attr( $base . '[' . $k . ']' ) . '" value="' . esc_attr( (string) ( $item[ $k ] ?? '' ) ) . '">';
		}
		return $html . '</details></li>';
	}

	private static function render_permits( string $id, string $key, array $def, array $rows ): void {
		echo '<fieldset class="aa-repeater" data-aa-repeater="permits"><legend class="aa-label">' . esc_html( $def['label'] ) . '</legend>';
		echo '<div class="aa-rows">';
		foreach ( $rows as $i => $row ) {
			echo self::permit_row( self::name( $key ), (string) $i, $row ); // phpcs:ignore WordPress.Security.EscapeOutput
		}
		echo '</div><button type="button" class="button aa-row-add">Add permit</button>';
		echo '<template>' . self::permit_row( self::name( $key ), '__i__', array() ) . '</template></fieldset>'; // phpcs:ignore WordPress.Security.EscapeOutput
	}

	private static function permit_row( string $name, string $i, array $row ): string {
		$b    = $name . '[' . $i . ']';
		$f    = static fn( $k, $label, $html ) => '<label><span>' . esc_html( $label ) . '</span>' . $html . '</label>';
		$sys  = '';
		foreach ( Schema::permit_systems() as $k => $label ) {
			$sys .= '<option value="' . esc_attr( $k ) . '"' . selected( $row['system'] ?? 'unspecified', $k, false ) . '>' . esc_html( $label ) . '</option>';
		}
		$st = '';
		foreach ( Permits::STATUSES as $k => $label ) {
			$st .= '<option value="' . esc_attr( $k ) . '"' . selected( $row['status'] ?? 'unverified', $k, false ) . '>' . esc_html( $label ) . '</option>';
		}
		$html  = '<div class="aa-row">';
		$html .= $f( 'number', 'Permit number', '<input type="text" name="' . esc_attr( $b . '[number]' ) . '" value="' . esc_attr( (string) ( $row['number'] ?? '' ) ) . '">' );
		$html .= $f( 'authority', 'Authority', '<input type="text" name="' . esc_attr( $b . '[authority]' ) . '" value="' . esc_attr( (string) ( $row['authority'] ?? '' ) ) . '">' );
		$html .= $f( 'system', 'System', '<select name="' . esc_attr( $b . '[system]' ) . '">' . $sys . '</select>' );
		$html .= $f( 'status', 'Status', '<select name="' . esc_attr( $b . '[status]' ) . '">' . $st . '</select>' );
		$html .= $f( 'verified_on', 'Verified on', '<input type="date" name="' . esc_attr( $b . '[verified_on]' ) . '" value="' . esc_attr( (string) ( $row['verified_on'] ?? '' ) ) . '">' );
		$html .= $f( 'source', 'Source', '<input type="text" name="' . esc_attr( $b . '[source]' ) . '" value="' . esc_attr( (string) ( $row['source'] ?? '' ) ) . '">' );
		$html .= '<label class="aa-inline"><input type="checkbox" name="' . esc_attr( $b . '[public]' ) . '" value="1"' . checked( ! empty( $row['public'] ), true, false ) . '> Show publicly (verified only)</label>';
		$html .= '<input type="hidden" name="' . esc_attr( $b . '[origin]' ) . '" value="' . esc_attr( (string) ( $row['origin'] ?? 'admin' ) ) . '">';
		$html .= '<button type="button" class="button-link aa-row-remove">Remove permit</button></div>';
		return $html;
	}

	private static function render_sources( string $id, string $key, array $def, array $rows ): void {
		echo '<fieldset class="aa-repeater" data-aa-repeater="sources"><legend class="aa-label">' . esc_html( $def['label'] ) . '</legend><div class="aa-rows">';
		$row_html = static function ( string $i, array $row ) use ( $key ): string {
			$b = 'aa_fields[' . $key . '][' . $i . ']';
			return '<div class="aa-row"><label><span>URL</span><input type="url" name="' . esc_attr( $b . '[url]' ) . '" value="' . esc_attr( (string) ( $row['url'] ?? '' ) ) . '"></label><label><span>Note</span><input type="text" name="' . esc_attr( $b . '[note]' ) . '" value="' . esc_attr( (string) ( $row['note'] ?? '' ) ) . '"></label><button type="button" class="button-link aa-row-remove">Remove source</button></div>';
		};
		foreach ( $rows as $i => $row ) {
			echo $row_html( (string) $i, $row ); // phpcs:ignore WordPress.Security.EscapeOutput
		}
		echo '</div><button type="button" class="button aa-row-add">Add source</button><template>' . $row_html( '__i__', array() ) . '</template></fieldset>'; // phpcs:ignore WordPress.Security.EscapeOutput
	}

	public static function render_quality( \WP_Post $post ): void {
		$flags = Quality::all( $post->ID );
		if ( Schema::PROPERTY === $post->post_type ) {
			$ref = References::get( $post->ID );
			echo '<p><strong>Reference:</strong> ' . esc_html( $ref ? $ref : 'assigned on first save' ) . '</p>';
		}
		if ( Schema::DEVELOPER === $post->post_type ) {
			$identity = (string) get_post_meta( $post->ID, 'aa_review_status', true );
			$r        = DeveloperReadiness::evaluate( $post->ID );
			echo '<p><strong>Identity:</strong> ' . esc_html( Schema::IDENTITY_STATES[ $identity ] ?? 'Needs review' ) . '</p>';
			echo '<p><strong>Ready to publish:</strong> ' . ( $r['ready'] ? 'Yes' : 'No' ) . '</p>';
			if ( $r['blocking'] || $r['warnings'] ) {
				echo '<ul class="aa-flags">';
				foreach ( $r['blocking'] as $b ) {
					echo '<li>' . esc_html( $b ) . '</li>';
				}
				foreach ( $r['warnings'] as $w ) {
					echo '<li class="aa-warning">' . esc_html( $w ) . '</li>';
				}
				echo '</ul>';
			}
		}
		if ( ! $flags ) {
			echo '<p>No open flags.</p>';
			return;
		}
		echo '<ul class="aa-flags">';
		foreach ( $flags as $flag ) {
			echo '<li>' . esc_html( Quality::LABELS[ $flag ] ?? $flag ) . '</li>';
		}
		echo '</ul><p class="description">Flags never block saving.</p>';
	}

	/** Save the schema fields for this post type. */
	public static function save( int $post_id, \WP_Post $post ): void {
		if ( ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) || wp_is_post_revision( $post_id ) ) {
			return;
		}
		if ( ! isset( $_POST['aa_editor_nonce'], $_POST['aa_fields'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['aa_editor_nonce'] ) ), 'aa_save_' . $post_id ) ) {
			return;
		}
		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			return;
		}
		$submitted = wp_unslash( $_POST['aa_fields'] ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput -- each field is sanitised by Schema::sanitize().
		self::apply( $post_id, $post->post_type, is_array( $submitted ) ? $submitted : array() );
	}

	/** Apply submitted values (also used by tests to exercise the save path without HTTP). */
	public static function apply( int $post_id, string $post_type, array $submitted ): void {
		$has_project = false;
		foreach ( Schema::fields_for( $post_type ) as $key => $def ) {
			if ( in_array( $def['input'], array( 'system', 'readonly' ), true ) || ! array_key_exists( $key, $submitted ) ) {
				continue;
			}
			$raw = $submitted[ $key ];
			if ( 0 === strpos( $key, 'tax:' ) || 'location' === $def['input'] ) {
				$ids = array_values( array_filter( array_map( 'intval', (array) $raw ) ) );
				wp_set_object_terms( $post_id, $ids, $def['taxonomy'], false );
				continue;
			}
			if ( is_array( $raw ) && in_array( $def['input'], array( 'gallery', 'floorplans' ), true ) ) {
				unset( $raw['__present'] ); // Form marker so an emptied list is still submitted; never an item.
				$raw = array_values( array_filter( $raw, static fn( $v ) => '' !== $v && array() !== $v ) );
			}
			if ( 'aa_project_id' === $key ) {
				$has_project = (bool) Schema::sanitize( $key, $def, $raw );
			}
			if ( 'aa_developer_id' === $key && Schema::PROPERTY === $post_type && $has_project ) {
				continue; // The developer comes from the project.
			}
			$value = Schema::sanitize( $key, $def, $raw );
			if ( null === $value || array() === $value ) {
				delete_post_meta( $post_id, $key );
			} else {
				update_post_meta( $post_id, $key, $value );
			}
		}
		Permits::mirror_legacy( $post_id );
		Relations::sync( $post_id );
		Quality::store( $post_id );
	}

	public static function property_columns( array $cols ): array {
		$new = array();
		foreach ( $cols as $k => $v ) {
			$new[ $k ] = $v;
			if ( 'title' === $k ) {
				$new['aa_reference'] = 'Reference';
				$new['aa_flags']     = 'Flags';
			}
		}
		return $new;
	}

	public static function property_column( string $col, int $post_id ): void {
		if ( 'aa_reference' === $col ) {
			echo esc_html( References::get( $post_id ) );
		} elseif ( 'aa_flags' === $col ) {
			echo esc_html( (string) count( Quality::all( $post_id ) ) );
		}
	}

	public static function developer_columns( array $cols ): array {
		$cols['aa_identity']  = 'Identity';
		$cols['aa_readiness'] = 'Ready to publish';
		$cols['aa_counts']    = 'Projects / listings';
		return $cols;
	}

	public static function developer_column( string $col, int $post_id ): void {
		if ( 'aa_identity' === $col ) {
			$s = (string) get_post_meta( $post_id, 'aa_review_status', true );
			echo esc_html( Schema::IDENTITY_STATES[ $s ] ?? 'Needs review' );
		} elseif ( 'aa_readiness' === $col ) {
			$r = DeveloperReadiness::evaluate( $post_id );
			echo esc_html( $r['ready'] ? 'Ready' : 'Not ready (' . count( $r['blocking'] ) . ')' );
		} elseif ( 'aa_counts' === $col ) {
			echo esc_html( count( Relations::by_developer( $post_id, Schema::PROJECT ) ) . ' / ' . count( Relations::by_developer( $post_id, Schema::PROPERTY ) ) );
		}
	}

	/** Admin list filter: edit.php?post_type=…&aa_flag=missing_permit */
	public static function filter_by_flag( \WP_Query $q ): void {
		if ( ! is_admin() || ! $q->is_main_query() || empty( $_GET['aa_flag'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification
			return;
		}
		$flag = sanitize_key( wp_unslash( $_GET['aa_flag'] ) ); // phpcs:ignore WordPress.Security.NonceVerification
		$q->set(
			'meta_query',
			array(
				'relation' => 'OR',
				array( 'key' => 'aa_quality_flags', 'value' => '"' . $flag . '"', 'compare' => 'LIKE' ),
				array( 'key' => 'aa_migration_flags', 'value' => '"' . $flag . '"', 'compare' => 'LIKE' ),
			)
		);
	}
}
