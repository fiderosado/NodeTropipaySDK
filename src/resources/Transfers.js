//TropipayTransfers
const BaseResource = require('./BaseResource');
const TropipayEndpoints = require('../classes/TropipayEndpoints');
const v = require('../core/validation');

const endpoints = TropipayEndpoints.transfers;

/**
 * https://doc.tropipay.com/docs/api-reference/transfers
 */
class Transfers extends BaseResource {
    /**
     * POST /operations/payout — sends money to a beneficiary. High amounts may need `securityCode` (2FA).
     * @param {{depositaccountId: number, accountId: number, currency: string, destinationCurrency: string,
     *   amount: number, destinationAmount: number, conceptTransfer: string, reasonDes: string, reasonId: number,
     *   paymentMethod: string, securityCode?: string}} payload
     */
    async payout(payload, options) {
        const body = this._payload(payload, {operation: 'payout', validate: v.validatePayout}, options);
        return this._request({method: 'POST', path: endpoints.payout, body}, options);
    }

    /**
     * POST /operations/payout/simulate — fees and exchange rate before paying.
     * @param {{depositaccountId: number, paymentMethod: string, accountId: number, currencyToPay: string,
     *   currencyToGet: string, amountToPay: number}} payload
     */
    async simulate(payload, options) {
        const body = this._payload(payload, {operation: 'simulate', validate: v.validatePayoutSimulation}, options);
        return this._request({method: 'POST', path: endpoints.simulate, body}, options);
    }
}

module.exports = Transfers;
