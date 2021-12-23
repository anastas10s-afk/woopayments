/**
 * External dependencies
 */
import config from 'config';

const { shopper, merchant } = require( '@woocommerce/e2e-utils' );

/**
 * Internal dependencies
 */
import { merchantWCP, shopperWCP } from '../../../utils/flows';
import {
	confirmCardAuthentication,
	setupProductCheckout,
} from '../../../utils/payments';

const cards = [
	[ 'basic', config.get( 'cards.basic' ) ],
	[ '3DS2', config.get( 'cards.3ds2' ) ],
];

describe( 'Saved cards ', () => {
	describe.each( cards )(
		'when using a %s card added through my account',
		( cardType, card ) => {
			beforeAll( async () => {
				await merchant.login();
				await merchantWCP.activateUpe();
				await merchant.logout();
				await shopper.login();
			} );

			afterAll( async () => {
				await shopperWCP.logout();
				await merchant.login();
				await merchantWCP.deactivateUpe();
				await merchant.logout();
			} );

			it( 'should save the card', async () => {
				await shopperWCP.goToPaymentMethods();
				await shopperWCP.addNewPaymentMethod( cardType, card );
				await expect( page ).toMatch(
					'Payment method successfully added'
				);
			} );

			it( 'should process a payment with the saved card', async () => {
				await setupProductCheckout(
					config.get( 'addresses.customer.billing' )
				);
				await shopperWCP.selectSavedPaymentMethod(
					`${ card.label } (expires ${ card.expires.month }/${ card.expires.year })`
				);

				if ( 'basic' === cardType ) {
					await shopper.placeOrder();
				} else {
					await expect( page ).toClick( '#place_order' );
					await confirmCardAuthentication( page, cardType );
					await page.waitForNavigation( {
						waitUntil: 'networkidle0',
					} );
				}

				await expect( page ).toMatch( 'Order received' );
				await expect( page ).toMatchElement(
					'.woocommerce-order-overview__payment-method',
					'Visa credit card'
				);
			} );

			it( 'should delete the card', async () => {
				await shopperWCP.goToPaymentMethods();
				await shopperWCP.deleteSavedPaymentMethod( card.label );
				await expect( page ).toMatch( 'Payment method deleted' );
			} );
		}
	);
} );