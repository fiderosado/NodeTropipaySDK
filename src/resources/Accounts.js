//TropipayAccounts
const BaseResource = require('./BaseResource');
const TropipayEndpoints = require('../classes/TropipayEndpoints');
const v = require('../core/validation');

const endpoints = TropipayEndpoints.accounts;

/**
 * https://doc.tropipay.com/docs/api-reference/accounts
 */
class Accounts extends BaseResource {
    #movements;

    constructor(client, movements) {
        super(client);
        this.#movements = movements;
    }

    /**
     * GET /accounts/ — every account of the authenticated user.
     * @param {{type?: string|number}} [params]
     */
    async list(params = {}, options) {
        return this._request({method: 'GET', path: endpoints.list, query: {type: params.type}}, options);
    }

    /** GET /accounts/balance/{accountNumber} */
    async getBalance(accountNumber, options) {
        const path = this._path(endpoints.balance, {accountNumber});
        return this._request({method: 'GET', path}, options);
    }

    /** GET /accounts/allBalance — [{ balance, currency }] */
    async getAllBalances(options) {
        return this._request({method: 'GET', path: endpoints.allBalance}, options);
    }

    /**
     * POST /accounts/ — links a Tropicard to the user.
     * @param {{tropicardNumber: string, pin: string}} payload
     */
    async addTropicard(payload, options) {
        const body = this._payload(payload, {operation: 'addTropicard', validate: v.validateTropicard}, options);
        return this._request({method: 'POST', path: endpoints.addTropicard, body}, options);
    }

    /** GET /accounts/{accountId}/selfcharge/crypto — crypto addresses to top up the account. */
    async getCryptoDepositAddress(accountId, options) {
        const path = this._path(endpoints.cryptoSelfCharge, {accountId});
        return this._request({method: 'GET', path}, options);
    }

    /** GET /accounts/{accountId}/movements — shortcut of movements.listByAccount(). */
    async listMovements(accountId, params, options) {
        return this.#movements.listByAccount(accountId, params, options);
    }
}

module.exports = Accounts;
