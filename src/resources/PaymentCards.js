//TropipayPaymentCards
const BaseResource = require('./BaseResource');
const TropipayEndpoints = require('../classes/TropipayEndpoints');
const v = require('../core/validation');

const endpoints = TropipayEndpoints.paymentCards;

/**
 * Payment cards (paylinks). https://doc.tropipay.com/docs/api-reference/payment-cards
 */
class PaymentCards extends BaseResource {
    #serverUrl;

    constructor(client, serverUrl) {
        super(client);
        this.#serverUrl = serverUrl;
    }

    /**
     * POST /paymentcards — returns the card with `shortUrl` and `qrImage`.
     * Accepts a plain object or a PaymentCardModel. Amounts are integers in cents (>= 100).
     */
    async create(payload, options) {
        const body = this._payload(payload, {
            operation: 'paymentCards.create',
            normalize: v.normalizePaymentCard,
            validate: v.validatePaymentCard,
        }, options);
        return this._request({method: 'POST', path: endpoints.create, body}, options);
    }

    /**
     * GET /paymentcards
     * @param {{limit?: number, offset?: number, state?: 0|1}} [params]
     */
    async list(params = {}, options) {
        const {limit, offset, state} = params;
        return this._request({method: 'GET', path: endpoints.list, query: {limit, offset, state}}, options);
    }

    /** GET /paymentcards/{id} */
    async get(id, options) {
        return this._request({method: 'GET', path: this._path(endpoints.get, {id})}, options);
    }

    /** Iterates over every payment card. */
    iterate(params = {}, options) {
        const {limit = 50, offset = 0, max, ...rest} = params;
        return this._paginate((page) => this.list({...rest, ...page}, options), {limit, offset, max});
    }

    /**
     * POST /api/v2/paymentcards/mediation — mediation payment cards.
     * Not documented for API v3, so it still targets the legacy v2 endpoint.
     */
    async createMediation(payload, options) {
        const body = this._payload(payload, {operation: 'paymentCards.createMediation'}, options);
        return this._request({
            method: 'POST',
            path: TropipayEndpoints.legacy.mediation,
            baseUrl: this.#serverUrl,
            body,
        }, options);
    }
}

module.exports = PaymentCards;
