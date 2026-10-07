<?php
/**
 * Plugin Name:       Trigon Al Aliah Core
 * Description:       Data layer for Al Aliah International: properties, projects, developers, areas, agents and insights, with admin editing, data-quality tooling and the WPResidence migration command.
 * Version:           0.1.0
 * Requires at least: 6.5
 * Requires PHP:      8.1
 * Author:            Trigon Solutions
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       trigon-alaliah-core
 */

defined( 'ABSPATH' ) || exit;

define( 'TRIGON_ALALIAH_CORE_VERSION', '0.1.0' );
define( 'TRIGON_ALALIAH_CORE_FILE', __FILE__ );
define( 'TRIGON_ALALIAH_CORE_DIR', __DIR__ );

spl_autoload_register(
	static function ( string $class ): void {
		$prefix = 'Trigon\\AlaliahCore\\';
		if ( 0 !== strpos( $class, $prefix ) ) {
			return;
		}
		$path = __DIR__ . '/src/' . str_replace( '\\', '/', substr( $class, strlen( $prefix ) ) ) . '.php';
		if ( is_readable( $path ) ) {
			require $path;
		}
	}
);

require __DIR__ . '/src/functions.php';

register_activation_hook( __FILE__, array( \Trigon\AlaliahCore\Plugin::class, 'activate' ) );
register_deactivation_hook( __FILE__, array( \Trigon\AlaliahCore\Plugin::class, 'deactivate' ) );

\Trigon\AlaliahCore\Plugin::boot();
