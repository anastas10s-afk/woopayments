<?php
/**
 * WooPay
 *
 * @package WCPay\WooPay
 */

namespace WCPay\WooPay;

use Automattic\WooCommerce\Blocks\Integrations\IntegrationInterface;

/**
 * WooPay
 */
class WooPay_Adapted_Extensions {
	const POINTS_AND_REWARDS_PLUGIN = 'woocommerce-points-and-rewards';
	const POINTS_AND_REWARDS_API    = 'points-and-rewards';

	/**
	 * WC Blocks registered integrations, as `$name => $instance` pairs.
	 *
	 * @var IntegrationInterface[]
	 */
	protected $registered_integrations = [];

	/**
	 * Initializa WC Blocks regitered integrations.
	 */
	public function __construct() {
		do_action( 'woocommerce_blocks_checkout_block_registration', $this );
	}

	/**
	 * Get WooPay adapted extensions settings and extra data needed on WooPay.
	 *
	 * @param string $email The user email the data will be loaded.
	 *
	 * @return array The extensions script data.
	 */
	public function get_adapted_extensions_data( $email ) {
		$enabled_adapted_extensions = get_option( WooPay_Scheduler::ENABLED_ADAPTED_EXTENSIONS_OPTION_NAME, [] );

		if ( count( $enabled_adapted_extensions ) === 0 ) {
			return [];
		}

		$extension_settings = [];

		$user = wp_get_current_user();

		if ( ! is_user_logged_in() ) {
			// If the user is a guest and has an account on the merchant site, load data
			// from there to check if we need to verify their email on WooPay later.
			$user_by_email = get_user_by( 'email', $email );

			if ( false !== $user_by_email ) {
				$user = $user_by_email;
			}
		}

		// Points and Rewards.
		if ( in_array( self::POINTS_AND_REWARDS_PLUGIN, $enabled_adapted_extensions, true ) ) {
			$points_and_rewards_data = self::get_points_and_rewards_data( $user );

			if ( null !== $points_and_rewards_data ) {
				$extension_settings[ self::POINTS_AND_REWARDS_API ] = $points_and_rewards_data;
			}
		}

		return $extension_settings;
	}

	/**
	 * Get Points and Rewards settings for WooPay.
	 *
	 * @param \WP_User $user The user the data will be loaded.
	 *
	 * @return array|null The Points and Rewards script data if installed.
	 */
	public function get_points_and_rewards_data( $user ) {
		if (
			empty( $this->registered_integrations[ self::POINTS_AND_REWARDS_API ] ) ||
			! class_exists( 'WC_Points_Rewards_Manager' ) ||
			! method_exists( 'WC_Points_Rewards_Manager', 'get_users_points' )
		) {
			return null;
		}

		$points_and_rewards_script_data = $this->registered_integrations[ self::POINTS_AND_REWARDS_API ]->get_script_data();

		list( $points, $monetary_value ) = explode( ':', get_option( 'wc_points_rewards_redeem_points_ratio', '' ) );

		$points         = floatval( $points );
		$monetary_value = floatval( $monetary_value );

		$points_and_rewards_script_data['points_ratio'] = [
			'points'         => $points,
			'monetary_value' => $monetary_value,
		];

		/**
		 * Check if the user has points to show the verify email alert.
		 *
		 * @psalm-suppress UndefinedClass
		 */
		$available_points_for_user = \WC_Points_Rewards_Manager::get_users_points( $user->ID );

		if ( $available_points_for_user > 0 && $available_points_for_user > $points_and_rewards_script_data['minimum_points_amount'] ) {
			// Only ask the user to verify email if they have available points.
			$points_and_rewards_script_data['should_verify_email'] = ! is_user_logged_in();
			$points_and_rewards_script_data['points_available']    = $available_points_for_user;
		}

		return $points_and_rewards_script_data;
	}

	/**
	 * Get WC Blocks registered integrations.
	 *
	 * @param IntegrationInterface $integration An instance of IntegrationInterface.
	 *
	 * @return boolean True means registered successfully.
	 */
	public function register( IntegrationInterface $integration ) {
		$name = $integration->get_name();

		$this->registered_integrations[ $name ] = $integration;
		return true;
	}
}