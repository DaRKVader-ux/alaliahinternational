<?php
namespace Trigon\AlaliahCore;

use Trigon\AlaliahCore\Model\PostTypes;
use Trigon\AlaliahCore\Model\Taxonomies;
use Trigon\AlaliahCore\Model\Meta;
use Trigon\AlaliahCore\Domain\References;
use Trigon\AlaliahCore\Domain\PropertyUrls;
use Trigon\AlaliahCore\Domain\Relations;
use Trigon\AlaliahCore\Domain\DeveloperReadiness;
use Trigon\AlaliahCore\Domain\Quality;
use Trigon\AlaliahCore\Rest\Fields;

defined( 'ABSPATH' ) || exit;

/**
 * Bootstrap. Loading the plugin registers hooks only; it never writes data.
 */
final class Plugin {

	public static function boot(): void {
		add_action( 'init', array( PostTypes::class, 'register' ), 5 );
		add_action( 'init', array( Taxonomies::class, 'register' ), 5 );
		add_action( 'init', array( Meta::class, 'register' ), 6 );
		add_action( 'init', array( PropertyUrls::class, 'register' ), 7 );

		References::hooks();
		PropertyUrls::hooks();
		Relations::hooks();
		DeveloperReadiness::hooks();
		Quality::hooks();
		Fields::hooks();

		// Focused classic edit screens for the data types; descriptions stay in the classic editor.
		add_filter(
			'use_block_editor_for_post_type',
			static fn( bool $use, string $type ): bool => Schema::is_own_type( $type ) ? false : $use,
			10,
			2
		);

		if ( is_admin() ) {
			Admin\Editor::hooks();
			Admin\DataQuality::hooks();
		}

		if ( defined( 'WP_CLI' ) && WP_CLI ) {
			Cli\Commands::register();
		}
	}

	/** Activation registers the model and flushes rewrites. It creates no content or terms. */
	public static function activate(): void {
		PostTypes::register();
		Taxonomies::register();
		PropertyUrls::register();
		flush_rewrite_rules( false );
	}

	public static function deactivate(): void {
		flush_rewrite_rules( false );
	}
}
