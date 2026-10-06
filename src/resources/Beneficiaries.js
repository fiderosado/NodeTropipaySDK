//TropipayBeneficiaries
const BaseResource = require('./BaseResource');
const TropipayEndpoints = require('../classes/TropipayEndpoints');
const v = require('../core/validation');
const {BENEFICIARY_TYPES, BENEFICIARY_PAYMENT_TYPES} = require('../constants');
const {serialize, pathSegment} = require('../core/utils');

const endpoints = TropipayEndpoints.beneficiaries;

/**
 * Beneficiaries, also called deposit accounts. https://doc.tropipay.com/docs/api-reference/beneficiaries
 */
class Beneficiaries extends BaseResource {
    /**
     * POST /deposit_accounts/ — bank (beneficiaryType 2, paymentType "2") or crypto (paymentType 100).
     */
    async create(payload, options) {
        const body = this._payload(payload, {
            operation: 'beneficiaries.create',
            normalize: v.normalizeBeneficiary,
            validate: v.validateBeneficiary,
        }, options);
        return this._request({method: 'POST', path: endpoints.create, body}, options);
    }

    /** Same as create() with the bank defaults: beneficiaryType 2 and paymentType "2". */
    async createBank(payload, options) {
        return this.create({
            beneficiaryType: BENEFICIARY_TYPES.EXTERNAL,
            paymentType: BENEFICIARY_PAYMENT_TYPES.BANK_DEPOSIT,
            ...serialize(payload),
        }, options);
    }

    /** Same as create() with the crypto defaults: beneficiaryType 3, paymentType 100, countryDestinationId 0. */
    async createCrypto(payload, options) {
        return this.create({
            beneficiaryType: BENEFICIARY_TYPES.CRYPTO,
            paymentType: Number(BENEFICIARY_PAYMENT_TYPES.CRYPTO),
            countryDestinationId: 0,
            ...serialize(payload),
        }, options);
    }

    /**
     * GET /deposit_accounts/ — returns { items }.
     * @param {{limit?: number, offset?: number, search?: string}} [params]
     */
    async list(params = {}, options) {
        const {limit, offset, search} = params;
        return this._request({method: 'GET', path: endpoints.list, query: {limit, offset, search}}, options);
    }

    /** Iterates over every beneficiary. */
    iterate(params = {}, options) {
        const {limit = 50, offset = 0, max, ...rest} = params;
        return this._paginate((page) => this.list({...rest, ...page}, options), {limit, offset, max});
    }

    /** GET /deposit_accounts/{beneficiaryId} */
    async get(beneficiaryId, options) {
        return this._request({method: 'GET', path: this._path(endpoints.get, {beneficiaryId})}, options);
    }

    /**
     * PUT /deposit_accounts/ — only the alias can be changed.
     * The API also requires the 2FA `securityCode` (not mentioned in the docs; "123456" in sandbox).
     * @param {number} id
     * @param {{alias?: string, securityCode: string}} changes
     */
    async update(id, changes = {}, options) {
        pathSegment(id, 'id');
        const body = this._payload({...serialize(changes), id}, {
            operation: 'beneficiaries.update',
            validate: (data) => v.validateSecurityCode(data, 'beneficiary update'),
        }, options);
        return this._request({method: 'PUT', path: endpoints.update, body}, options);
    }

    /**
     * DELETE /deposit_accounts/{beneficiaryId} — needs the 2FA security code.
     * @param {number} beneficiaryId
     * @param {{securityCode: string}} payload
     */
    async delete(beneficiaryId, payload, options) {
        const path = this._path(endpoints.delete, {beneficiaryId});
        const body = this._payload(payload, {
            operation: 'beneficiaries.delete',
            validate: (data) => v.validateSecurityCode(data, 'beneficiary delete'),
        }, options);
        return this._request({method: 'DELETE', path, body}, options);
    }

    /**
     * POST /deposit_accounts/validate_account_number — always HTTP 200, check `valid` in the response.
     * @param {{accountNumber: string, paymentType: number, currency?: string, network?: string, countryDestinationId?: number}} payload
     */
    async validateAccountNumber(payload, options) {
        const body = this._payload(payload, {
            operation: 'beneficiaries.validateAccountNumber',
            validate: v.validateAccountNumberCheck,
        }, options);
        return this._request({method: 'POST', path: endpoints.validateAccountNumber, body}, options);
    }
}

module.exports = Beneficiaries;
