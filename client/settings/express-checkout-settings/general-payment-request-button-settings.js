/** @format */
/**
 * External dependencies
 */
import React, { useMemo } from 'react';
import { __, sprintf } from '@wordpress/i18n';
import { RadioControl, Notice } from '@wordpress/components';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

/**
 * Internal dependencies
 */
import CardBody from '../card-body';
import PaymentRequestButtonPreview from './payment-request-button-preview';
import NoticeOutlineIcon from 'gridicons/dist/notice-outline';
import interpolateComponents from 'interpolate-components';
import { getPaymentRequestData } from '../../payment-request/utils';
import {
	usePaymentRequestButtonType,
	usePaymentRequestButtonSize,
	usePaymentRequestButtonTheme,
} from 'wcpay/data';

const makeButtonSizeText = ( string ) =>
	interpolateComponents( {
		mixedString: string,
		components: {
			helpText: (
				<span className="payment-method-settings__option-muted-text" />
			),
		},
	} );

const buttonSizeOptions = [
	{
		label: makeButtonSizeText(
			__(
				'Default {{helpText}}(40 px){{/helpText}}',
				'woocommerce-payments'
			)
		),
		value: 'default',
	},
	{
		label: makeButtonSizeText(
			__(
				'Medium {{helpText}}(48 px){{/helpText}}',
				'woocommerce-payments'
			)
		),
		value: 'medium',
	},
	{
		label: makeButtonSizeText(
			__(
				'Large {{helpText}}(56 px){{/helpText}}',
				'woocommerce-payments'
			)
		),
		value: 'large',
	},
];

const buttonActionOptions = [
	{
		label: __( 'Only icon', 'woocommerce-payments' ),
		value: 'default',
	},
	{
		label: __( 'Buy with', 'woocommerce-payments' ),
		value: 'buy',
	},
	{
		label: __( 'Donate with', 'woocommerce-payments' ),
		value: 'donate',
	},
	{
		label: __( 'Book with', 'woocommerce-payments' ),
		value: 'book',
	},
];

const makeButtonThemeText = ( string ) =>
	interpolateComponents( {
		mixedString: string,
		components: {
			br: <br />,
			helpText: (
				<span className="payment-method-settings__option-help-text" />
			),
		},
	} );

const buttonThemeOptions = [
	{
		label: makeButtonThemeText(
			__(
				'Dark {{br/}}{{helpText}}Recommended for white or light-colored backgrounds with high contrast.{{/helpText}}',
				'woocommerce-payments'
			)
		),
		value: 'dark',
	},
	{
		label: makeButtonThemeText(
			__(
				'Light {{br/}}{{helpText}}Recommended for dark or colored backgrounds with high contrast.{{/helpText}}',
				'woocommerce-payments'
			)
		),
		value: 'light',
	},
	{
		label: makeButtonThemeText(
			__(
				'Outline {{br/}}{{helpText}}Recommended for white or light-colored backgrounds with insufficient contrast.{{/helpText}}',
				'woocommerce-payments'
			)
		),
		value: 'light-outline',
	},
];

const GeneralPaymentRequestButtonSettings = ( { type } ) => {
	const [ buttonType, setButtonType ] = usePaymentRequestButtonType();
	const [ size, setSize ] = usePaymentRequestButtonSize();
	const [ theme, setTheme ] = usePaymentRequestButtonTheme();

	const stripePromise = useMemo( () => {
		const stripeSettings = getPaymentRequestData( 'stripe' );
		return loadStripe( stripeSettings.publishableKey, {
			stripeAccount: stripeSettings.accountId,
			locale: stripeSettings.locale,
		} );
	}, [] );

	const otherButtons =
		'woopay' === type ? 'Apple Pay / Google Pay' : 'WooPay';

	return (
		<CardBody>
			<Notice
				status="warning"
				isDismissible={ false }
				className="express-checkout__notice"
			>
				<span>
					<NoticeOutlineIcon
						style={ {
							color: '#BD8600',
							fill: 'currentColor',
							marginBottom: '-5px',
							marginRight: '16px',
						} }
						size={ 20 }
					/>
					{ sprintf(
						__(
							'These settings will also apply to the %s buttons on your store.',
							'woocommerce-payments'
						),
						otherButtons
					) }
				</span>
			</Notice>
			<h4>{ __( 'Call to action', 'woocommerce-payments' ) }</h4>
			<RadioControl
				className="payment-method-settings__cta-selection"
				hideLabelFromVision
				selected={ buttonType }
				options={ buttonActionOptions }
				onChange={ setButtonType }
			/>
			<h4>{ __( 'Button size', 'woocommerce-payments' ) }</h4>
			<RadioControl
				selected={ size }
				options={ buttonSizeOptions }
				onChange={ setSize }
			/>
			<h4>{ __( 'Theme', 'woocommerce-payments' ) }</h4>
			<RadioControl
				selected={ theme }
				options={ buttonThemeOptions }
				onChange={ setTheme }
			/>
			<h4>{ __( 'Preview', 'woocommerce-payments' ) }</h4>
			<div className="payment-method-settings__option-help-text">
				{ __(
					'See the preview of enabled express payment buttons.',
					'woocommerce-payments'
				) }
			</div>
			<Elements stripe={ stripePromise }>
				<PaymentRequestButtonPreview />
			</Elements>
		</CardBody>
	);
};

export default GeneralPaymentRequestButtonSettings;